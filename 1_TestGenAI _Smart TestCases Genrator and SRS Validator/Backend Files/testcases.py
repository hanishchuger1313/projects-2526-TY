from __future__ import annotations

from datetime import datetime
from typing import Optional, Dict, Any, List

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from bson import ObjectId

# PDF
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import pagesizes

from .auth import get_current_user
from .database import chats_col, messages_col, downloads_col, results_col
from .srs_validation import validate_srs
from .testcase_engine import make_testcases, to_markdown_table

router = APIRouter()


class GenerateBody(BaseModel):
    chatId: Optional[str] = None
    prompt: str


class ValidateBody(BaseModel):
    chatId: Optional[str] = None
    prompt: str


class SaveBody(BaseModel):
    chatId: Optional[str] = None
    title: Optional[str] = None
    prompt: Optional[str] = None
    validation: Optional[Dict[str, Any]] = None
    rows: Optional[list] = None
    table: Optional[str] = None
    table_md: Optional[str] = None
    downloadId: Optional[str] = None


def _oid(s: str) -> ObjectId:
    try:
        return ObjectId(s)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")


def _extract_valid_texts(report: Dict[str, Any]) -> List[str]:
    """Support both old and new validate_srs shapes."""
    if not report:
        return []

    reqs = report.get("requirements")
    if isinstance(reqs, list) and reqs and isinstance(reqs[0], dict):
        out = []
        for r in reqs:
            if r.get("is_valid"):
                t = (r.get("text") or "").strip()
                if t:
                    out.append(t)
        return out

    valid_only = report.get("valid_only") or []
    if valid_only and isinstance(valid_only[0], dict):
        return [v.get("text", "").strip() for v in valid_only if (v.get("text") or "").strip()]

    return [
        v.split(":", 1)[-1].strip()
        for v in valid_only
        if isinstance(v, str) and v.strip()
    ]


def _normalize_chats(items=None):
    items = items or []
    out = []
    for c in items:
        cid = str(c.get("_id") or c.get("id"))
        out.append({
            "_id": cid,
            "id": cid,
            "title": c.get("title", "Chat"),
            "createdAt": c.get("createdAt"),
            "updatedAt": c.get("updatedAt"),
        })
    return out


@router.get("/chats")
def list_chats(request: Request):
    user = get_current_user(request)

    items = list(
        chats_col.find({"userId": user["id"]}, {"title": 1, "createdAt": 1, "updatedAt": 1})
        .sort("updatedAt", -1)
        .limit(50)
    )

    return {"chats": _normalize_chats(items)}


@router.delete("/chats/{chat_id}")
def delete_chat(chat_id: str, request: Request):
    user = get_current_user(request)

    chat = chats_col.find_one({"_id": _oid(chat_id), "userId": user["id"]})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    chats_col.delete_one({"_id": _oid(chat_id), "userId": user["id"]})
    messages_col.delete_many({"chatId": chat_id})
    downloads_col.delete_many({"chatId": chat_id, "userId": user["id"]})
    return {"ok": True}


@router.get("/chats/{chat_id}/messages")
def get_chat_messages(chat_id: str, request: Request):
    user = get_current_user(request)

    chat = chats_col.find_one({"_id": _oid(chat_id), "userId": user["id"]})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    msgs = list(messages_col.find({"chatId": chat_id}).sort("createdAt", 1))

    out = []
    for m in msgs:
        out.append({
            "_id": str(m["_id"]),
            "id": str(m["_id"]),
            "chatId": m.get("chatId"),
            "role": m.get("role"),
            "content": m.get("content"),
            "createdAt": m.get("createdAt"),
        })
    return {"messages": out}


@router.get("/chats/{chat_id}/latest")
def get_latest_chat_data(chat_id: str, request: Request):
    """Used when user clicks history; returns latest generated output + validation."""
    user = get_current_user(request)

    chat = chats_col.find_one({"_id": _oid(chat_id), "userId": user["id"]})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    doc = downloads_col.find_one(
        {"chatId": chat_id, "userId": user["id"], "format": "ieee829"},
        sort=[("createdAt", -1)],
    )

    if not doc:
        # Fallback for file-upload flow: generated rows/table may be stored in results collection
        rdoc = results_col.find_one(
            {"chatId": chat_id, "userId": user["id"], "type": "file_generated"},
            sort=[("createdAt", -1)],
        )
        if rdoc:
            return {
                "ok": True,
                "table": rdoc.get("table_md"),
                "rows": rdoc.get("rows", []),
                "validation": rdoc.get("validation"),
            }
        return {"ok": True, "table": None, "rows": [], "validation": None}

    return {
        "ok": True,
        "table": doc.get("content"),
        "rows": doc.get("rows", []),
        "validation": doc.get("validation"),
        "downloadId": str(doc.get("_id")),
    }


@router.get("/chats/{chat_id}/latest_validation")
def get_latest_validation(chat_id: str, request: Request):
    """Return the latest validation checklist session for this chat (so Prompt can restore UI)."""
    user = get_current_user(request)

    chat = chats_col.find_one({"_id": _oid(chat_id), "userId": user["id"]})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    vdoc = downloads_col.find_one(
        {"chatId": chat_id, "userId": user["id"], "format": "validation"},
        sort=[("createdAt", -1)],
    )

    if not vdoc:
        return {"ok": True, "validation": None, "validationId": None}

    return {
        "ok": True,
        "validation": vdoc.get("validation"),
        "validationId": str(vdoc.get("_id")),
    }


# -----------------------------------------------------------------------------
# NEW: validate first (checklist UI), generate later ONLY when user confirms.
# -----------------------------------------------------------------------------
@router.post("/validate")
def validate_only(body: ValidateBody, request: Request):
    user = get_current_user(request)

    prompt = (body.prompt or "").strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    chat_id = body.chatId
    now = datetime.utcnow()

    if not chat_id:
        title = prompt.splitlines()[0][:60] if prompt else "New Chat"
        res = chats_col.insert_one({
            "userId": user["id"],
            "title": title,
            "createdAt": now,
            "updatedAt": now,
        })
        chat_id = str(res.inserted_id)
    else:
        chats_col.update_one(
            {"_id": _oid(chat_id), "userId": user["id"]},
            {"$set": {"updatedAt": now}},
        )

    messages_col.insert_one({
        "chatId": chat_id,
        "role": "user",
        "content": prompt,
        "createdAt": now,
    })

    report = validate_srs(prompt)
    valid_texts = _extract_valid_texts(report)

    validation_id = downloads_col.insert_one({
        "userId": user["id"],
        "chatId": chat_id,
        "format": "validation",
        "content": "",
        "rows": [],
        "validation": report,
        "prompt_text": prompt,
        "valid_texts": valid_texts,
        "createdAt": now,
        "meta": {"source": "validation", "title": (prompt[:60] + "...") if len(prompt) > 60 else prompt},
    }).inserted_id

    messages_col.insert_one({
        "chatId": chat_id,
        "role": "assistant",
        "content": "✅ SRS validation completed. Review checklist and click 'Show testcases' to generate.",
        "createdAt": datetime.utcnow(),
    })

    return {
        "ok": len(valid_texts) > 0,
        "chatId": chat_id,
        "validationId": str(validation_id),
        "validation": report,
        "stats": {
            "requirement_count": int(report.get("total_requirements", 0) or 0),
            "valid_count": int(report.get("valid_count", report.get("valid_requirements", 0)) or 0),
            "invalid_count": int(report.get("invalid_count", report.get("invalid_requirements", 0)) or 0),
        },
    }


@router.get("/generate_from_validation/{validation_id}")
def generate_from_validation(validation_id: str, request: Request):
    user = get_current_user(request)

    vdoc = downloads_col.find_one({"_id": _oid(validation_id), "userId": user["id"], "format": "validation"})
    if not vdoc:
        raise HTTPException(status_code=404, detail="Validation session not found")

    report = vdoc.get("validation") or {}
    req_texts = vdoc.get("valid_texts") or _extract_valid_texts(report)

    if not req_texts:
        return {
            "ok": False,
            "chatId": vdoc.get("chatId"),
            "validation": report,
            "rows": [],
            "table": None,
            "stats": {
                "requirement_count": int(report.get("total_requirements", 0) or 0),
                "valid_count": int(report.get("valid_count", report.get("valid_requirements", 0)) or 0),
                "invalid_count": int(report.get("invalid_count", report.get("invalid_requirements", 0)) or 0),
                "test_case_count": 0,
                "test_cases": 0,
            },
        }

    rows = make_testcases(req_texts)
    md = to_markdown_table(rows)

    now = datetime.utcnow()

    messages_col.insert_one({
        "chatId": vdoc.get("chatId"),
        "role": "assistant",
        "content": "✅ Generated IEEE 829-1998 style test cases. Open My Downloads to view/export.",
        "createdAt": now,
    })

    download_id = downloads_col.insert_one({
        "userId": user["id"],
        "chatId": vdoc.get("chatId"),
        "format": "ieee829",
        "content": md,
        "rows": rows,
        "validation": report,
        "createdAt": now,
        "meta": {
            "source": "prompt_confirmed",
            "title": (vdoc.get("meta") or {}).get("title", "Testcases"),
        },
    }).inserted_id

    chats_col.update_one({"_id": _oid(vdoc.get("chatId")), "userId": user["id"]}, {"$set": {"updatedAt": now}})

    return {
        "ok": True,
        "chatId": vdoc.get("chatId"),
        "downloadId": str(download_id),
        "validation": report,
        "rows": rows,
        "table": md,
        "stats": {
            "requirement_count": int(report.get("total_requirements", 0) or 0),
            "valid_count": int(report.get("valid_count", report.get("valid_requirements", 0)) or 0),
            "invalid_count": int(report.get("invalid_count", report.get("invalid_requirements", 0)) or 0),
            "test_case_count": len(rows),
            "test_cases": len(rows),
        },
    }


# -----------------------------------------------------------------------------
# Old: validate + generate immediately (kept for backward compat)
# -----------------------------------------------------------------------------
@router.post("/generate")
def generate_testcases(body: GenerateBody, request: Request):
    user = get_current_user(request)

    prompt = (body.prompt or "").strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    chat_id = body.chatId
    now = datetime.utcnow()

    if not chat_id:
        title = prompt.splitlines()[0][:60] if prompt else "New Chat"
        res = chats_col.insert_one({
            "userId": user["id"],
            "title": title,
            "createdAt": now,
            "updatedAt": now,
        })
        chat_id = str(res.inserted_id)
    else:
        chats_col.update_one(
            {"_id": _oid(chat_id), "userId": user["id"]},
            {"$set": {"updatedAt": now}},
        )

    messages_col.insert_one({
        "chatId": chat_id,
        "role": "user",
        "content": prompt,
        "createdAt": now,
    })

    report = validate_srs(prompt)
    req_texts = _extract_valid_texts(report)

    if not req_texts:
        return {
            "ok": False,
            "chatId": chat_id,
            "validation": report,
            "rows": [],
            "table": None,
            "stats": {
                "requirement_count": int(report.get("total_requirements", 0) or 0),
                "valid_count": int(report.get("valid_count", report.get("valid_requirements", 0)) or 0),
                "invalid_count": int(report.get("invalid_count", report.get("invalid_requirements", 0)) or 0),
                "test_case_count": 0,
                "test_cases": 0,
            },
        }

    rows = make_testcases(req_texts)
    md = to_markdown_table(rows)

    messages_col.insert_one({
        "chatId": chat_id,
        "role": "assistant",
        "content": "✅ Generated IEEE 829-1998 style test cases. Open My Downloads to view/export.",
        "createdAt": datetime.utcnow(),
    })

    download_id = downloads_col.insert_one({
        "userId": user["id"],
        "chatId": chat_id,
        "format": "ieee829",
        "content": md,
        "rows": rows,
        "validation": report,
        "createdAt": datetime.utcnow(),
        "meta": {
            "source": "prompt",
            "title": (prompt[:60] + "...") if len(prompt) > 60 else prompt,
        },
    }).inserted_id

    return {
        "ok": True,
        "chatId": chat_id,
        "downloadId": str(download_id),
        "validation": report,
        "rows": rows,
        "table": md,
        "stats": {
            "requirement_count": int(report.get("total_requirements", 0) or 0),
            "valid_count": int(report.get("valid_count", report.get("valid_requirements", 0)) or 0),
            "invalid_count": int(report.get("invalid_count", report.get("invalid_requirements", 0)) or 0),
            "test_case_count": len(rows),
            "test_cases": len(rows),
        },
    }


@router.post("/save")
def save_testcases(body: SaveBody, request: Request):
    user = get_current_user(request)
    now = datetime.utcnow()

    chat_id = body.chatId
    title = ((body.title or "") or (body.prompt or "") or "Saved Chat")[:60]

    if not chat_id:
        res = chats_col.insert_one({
            "userId": user["id"],
            "title": title,
            "createdAt": now,
            "updatedAt": now,
        })
        chat_id = str(res.inserted_id)
    else:
        chats_col.update_one(
            {"_id": _oid(chat_id), "userId": user["id"]},
            {"$set": {"updatedAt": now, "title": title}},
        )

    md = (body.table_md or body.table or "") or ""
    rows = body.rows or []
    validation = body.validation

    download_id = downloads_col.insert_one({
        "userId": user["id"],
        "chatId": chat_id,
        "format": "ieee829",
        "content": md,
        "rows": rows,
        "validation": validation,
        "createdAt": now,
        "meta": {"source": "save", "title": title},
    }).inserted_id

    return {"ok": True, "chatId": chat_id, "downloadId": str(download_id)}


@router.get("/downloads")
def list_downloads(request: Request):
    user = get_current_user(request)
    items = list(
        downloads_col.find(
            {"userId": user["id"], "format": {"$ne": "validation"}},
            {"content": 0, "rows": 0, "validation": 0, "prompt_text": 0, "valid_texts": 0},
        )
        .sort("createdAt", -1)
        .limit(50)
    )

    out = []
    for d in items:
        out.append({
            "id": str(d["_id"]),
            "chatId": d.get("chatId"),
            "format": d.get("format", "ieee829"),
            "createdAt": d.get("createdAt"),
            "title": (d.get("meta") or {}).get("title", "Testcases"),
            "source": (d.get("meta") or {}).get("source", "prompt"),
        })
    return {"downloads": out}


@router.get("/downloads/{download_id}")
def get_download(download_id: str, request: Request):
    user = get_current_user(request)
    doc = downloads_col.find_one({"_id": _oid(download_id), "userId": user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Download not found")

    return {
        "id": str(doc["_id"]),
        "chatId": doc.get("chatId"),
        "format": doc.get("format", "ieee829"),
        "createdAt": doc.get("createdAt"),
        "title": (doc.get("meta") or {}).get("title", "Testcases"),
        "source": (doc.get("meta") or {}).get("source", "prompt"),
        "table": doc.get("content"),
        "rows": doc.get("rows", []),
        "validation": doc.get("validation"),
    }


@router.get("/downloads/{download_id}/pdf")
def download_pdf(download_id: str, request: Request):
    user = get_current_user(request)
    doc = downloads_col.find_one({"_id": _oid(download_id), "userId": user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Download not found")

    rows = doc.get("rows", [])
    if not rows:
        raise HTTPException(status_code=400, detail="No test cases available")

    file_path = f"testcases_{download_id}.pdf"

    styles = getSampleStyleSheet()
    pdf = SimpleDocTemplate(file_path, pagesize=pagesizes.A4)

    elements = []
    elements.append(Paragraph("IEEE 829 Test Cases", styles["Heading1"]))
    elements.append(Spacer(1, 12))

    header = list(rows[0].keys())
    data = [header]

    for r in rows:
        data.append([str(r.get(k, ""))[:250] for k in header])

    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
        ("FONTSIZE", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))

    elements.append(table)
    pdf.build(elements)

    return FileResponse(file_path, media_type="application/pdf", filename="testcases.pdf")


@router.delete("/downloads/{download_id}")
def delete_download(download_id: str, request: Request):
    user = get_current_user(request)
    res = downloads_col.delete_one({"_id": _oid(download_id), "userId": user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Download not found")
    return {"ok": True}
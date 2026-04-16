import io
import os
import re
from datetime import datetime
from bson import ObjectId
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import JSONResponse

from .auth import get_current_user
from .config import settings
from .database import results_col, analytics_col
from .srs_validation import validate_srs
from .testcase_engine import make_testcases, to_markdown_table

try:
    import pytesseract
    OCR_AVAILABLE = True
except Exception:
    OCR_AVAILABLE = False

try:
    from PIL import Image
    PIL_AVAILABLE = True
except Exception:
    PIL_AVAILABLE = False

try:
    import pypdf
    PDF_AVAILABLE = True
except Exception:
    PDF_AVAILABLE = False

try:
    from pdf2image import convert_from_bytes
    PDF2IMAGE_AVAILABLE = True
except Exception:
    PDF2IMAGE_AVAILABLE = False

try:
    import docx
    DOCX_AVAILABLE = True
except Exception:
    DOCX_AVAILABLE = False

router = APIRouter()

_CTRL_RE = re.compile(r"[\x00-\x08\x0B\x0C\x0E-\x1F]")
_REPEAT_CHAR_RE = re.compile(r"(.)\1{10,}")


def sanitize_srs_text(text: str, *, max_chars: int = 200_000) -> str:
    if not text:
        return ""
    t = str(text)

    t = _CTRL_RE.sub(" ", t)
    t = t.replace("\r\n", "\n").replace("\r", "\n")
    t = t.replace("\u200b", "").replace("\ufeff", "").replace("\xa0", " ")
    t = _REPEAT_CHAR_RE.sub(lambda m: m.group(1) * 3, t)

    cleaned_lines = []
    for line in t.split("\n"):
        s = line.strip()
        if not s:
            continue
        if len(s) > 400 and s.count(" ") < 3:
            continue
        cleaned_lines.append(s)

    t = "\n".join(cleaned_lines)

    if len(t) > max_chars:
        t = t[:max_chars]

    return t


def track_analytics(user_id: str, event: str, meta: dict, request: Request):
    try:
        analytics_col.insert_one({
            "userId": user_id,
            "event": event,
            "meta": meta or {},
            "ip": request.client.host if request.client else "",
            "userAgent": request.headers.get("user-agent", ""),
            "createdAt": datetime.utcnow()
        })
    except Exception:
        pass


def _setup_ocr():
    tpath = (getattr(settings, "tesseract_path", "") or "").strip()
    if tpath:
        try:
            pytesseract.pytesseract.tesseract_cmd = tpath
        except Exception:
            pass


def extract_text_from_txt(data: bytes) -> str:
    try:
        return data.decode("utf-8", errors="ignore").strip()
    except Exception:
        return ""


def extract_text_from_docx(data: bytes) -> str:
    if not DOCX_AVAILABLE:
        return ""
    try:
        bio = io.BytesIO(data)
        d = docx.Document(bio)
        parts = []
        for p in d.paragraphs:
            t = (p.text or "").strip()
            if t:
                parts.append(t)
        return "\n".join(parts).strip()
    except Exception:
        return ""


def extract_text_from_pdf(data: bytes) -> str:
    if not PDF_AVAILABLE:
        return ""
    try:
        reader = pypdf.PdfReader(io.BytesIO(data))
        parts = []
        for page in reader.pages:
            t = (page.extract_text() or "").strip()
            if t:
                parts.append(t)
        return "\n".join(parts).strip()
    except Exception:
        return ""


def extract_text_from_image_ocr(data: bytes) -> str:
    if not (settings.ocr_enabled and OCR_AVAILABLE and PIL_AVAILABLE):
        return ""
    _setup_ocr()
    try:
        img = Image.open(io.BytesIO(data))
        txt = pytesseract.image_to_string(
            img,
            config=getattr(settings, "tesseract_config", "--oem 1 --psm 6")
        ) or ""
        return txt.strip()
    except Exception:
        return ""


def extract_text_from_pdf_ocr(data: bytes) -> str:
    if not (settings.ocr_enabled and OCR_AVAILABLE and PDF2IMAGE_AVAILABLE):
        return ""
    _setup_ocr()
    try:
        ppath = (getattr(settings, "poppler_path", "") or "").strip()
        kwargs = {}
        if ppath and os.path.exists(ppath):
            kwargs["poppler_path"] = ppath

        images = convert_from_bytes(data, dpi=200, **kwargs)
        out = []
        for img in images:
            try:
                txt = pytesseract.image_to_string(
                    img,
                    config=getattr(settings, "tesseract_config", "--oem 1 --psm 6")
                ) or ""
                txt = txt.strip()
                if txt:
                    out.append(txt)
            except Exception:
                continue
        return "\n".join(out).strip()
    except Exception:
        return ""


def _extraction_error_detail(filename: str) -> str:
    parts = [f"Failed to extract text from file: {filename}"]
    if filename.lower().endswith(".pdf"):
        parts.append(f"pypdf={'OK' if PDF_AVAILABLE else 'MISSING'}")
        parts.append(f"ocr_enabled={'ON' if settings.ocr_enabled else 'OFF'}")
        parts.append(f"pytesseract={'OK' if OCR_AVAILABLE else 'MISSING'}")
        parts.append(f"pdf2image={'OK' if PDF2IMAGE_AVAILABLE else 'MISSING'}")
        tpath = (getattr(settings, "tesseract_path", "") or "").strip()
        ppath = (getattr(settings, "poppler_path", "") or "").strip()
        parts.append(f"tesseract_path={'SET' if tpath else 'NOT_SET'}")
        parts.append(f"poppler_path={'SET' if ppath else 'NOT_SET'}")
        if tpath:
            parts.append(f"tesseract_exists={'YES' if os.path.exists(tpath) else 'NO'}")
        if ppath:
            parts.append(f"poppler_exists={'YES' if os.path.exists(ppath) else 'NO'}")
    return " | ".join(parts)


def _valid_texts(report: dict):
    out = []
    for r in (report or {}).get("requirements", []):
        if r.get("is_valid"):
            txt = (r.get("text") or "").strip()
            if txt:
                out.append(txt)
    return out


def _response_payload(ok: bool, message: str, validation: dict, rows: list, table_md: str, result_id: str | None):
    return {
        "ok": ok,
        "message": message,
        "validation": validation or {},
        "rows": rows or [],
        "table_md": table_md or "",
        "result_id": result_id,
    }


def _allowed_ext(filename_lower: str) -> bool:
    exts = [e.lower() for e in (settings.allowed_file_types or [])]
    if any(filename_lower.endswith(ext) for ext in exts):
        return True
    return filename_lower.endswith((".png", ".jpg", ".jpeg"))


@router.post("/upload_validate")
async def upload_validate(request: Request, file: UploadFile = File(...), prompt: str = Form("")):
    user = get_current_user(request)

    original_filename = (file.filename or "").strip()
    filename_lower = original_filename.lower()

    data = await file.read()

    if not _allowed_ext(filename_lower):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(settings.allowed_file_types)}"
        )

    text = ""
    if filename_lower.endswith(".txt"):
        text = extract_text_from_txt(data)
    elif filename_lower.endswith(".docx") or filename_lower.endswith(".doc"):
        text = extract_text_from_docx(data)
    elif filename_lower.endswith(".pdf"):
        text = extract_text_from_pdf(data)
        if not text or len(text.strip()) < settings.min_text_length:
            text = extract_text_from_pdf_ocr(data)
    elif filename_lower.endswith((".png", ".jpg", ".jpeg")):
        text = extract_text_from_image_ocr(data)

    text = (text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail=_extraction_error_detail(original_filename))

    text = sanitize_srs_text(text)

    combined = sanitize_srs_text(text)
    if (prompt or "").strip():
        combined = sanitize_srs_text((combined + "\n\n" + prompt.strip()).strip())

    report = validate_srs(combined)
    valid_texts = [sanitize_srs_text(t) for t in _valid_texts(report)]

    rid = results_col.insert_one({
        "userId": user["id"],
        "type": "file_validated",
        "filename": original_filename,
        "validation": report,
        "rows": [],
        "table_md": "",
        "createdAt": datetime.utcnow(),
        "requirement_count": len(valid_texts),
        "test_case_count": 0
    }).inserted_id

    track_analytics(
        user["id"],
        "file_validation_success",
        {
            "result_id": str(rid),
            "filename": original_filename,
            "requirement_count": len(valid_texts),
        },
        request
    )

    return {
        "ok": len(valid_texts) > 0,
        "message": "SRS validation completed",
        "validation": report,
        "result_id": str(rid)
    }


@router.post("/upload_generate")
async def upload_and_generate(request: Request, file: UploadFile = File(...), prompt: str = Form("")):
    user = get_current_user(request)

    original_filename = (file.filename or "").strip()
    filename_lower = original_filename.lower()

    data = await file.read()

    if not _allowed_ext(filename_lower):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(settings.allowed_file_types)}"
        )

    text = ""
    if filename_lower.endswith(".txt"):
        text = extract_text_from_txt(data)
    elif filename_lower.endswith(".docx") or filename_lower.endswith(".doc"):
        text = extract_text_from_docx(data)
    elif filename_lower.endswith(".pdf"):
        text = extract_text_from_pdf(data)
        if not text or len(text.strip()) < settings.min_text_length:
            text = extract_text_from_pdf_ocr(data)
    elif filename_lower.endswith((".png", ".jpg", ".jpeg")):
        text = extract_text_from_image_ocr(data)

    text = (text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail=_extraction_error_detail(original_filename))

    text = sanitize_srs_text(text)

    combined = sanitize_srs_text(text)
    if (prompt or "").strip():
        combined = sanitize_srs_text((combined + "\n\n" + prompt.strip()).strip())

    report = validate_srs(combined)
    valid_texts = [sanitize_srs_text(t) for t in _valid_texts(report)]

    if len(valid_texts) == 0:
        payload = _response_payload(
            False,
            "SRS validation failed. Fix highlighted requirements first.",
            report,
            [],
            "",
            None
        )
        return JSONResponse(status_code=200, content=payload)

    rows = make_testcases(valid_texts)
    table_md = to_markdown_table(rows)

    rid = results_col.insert_one({
        "userId": user["id"],
        "type": "file_generated",
        "filename": original_filename,
        "validation": report,
        "rows": rows,
        "table_md": table_md,
        "createdAt": datetime.utcnow(),
        "requirement_count": len(valid_texts),
        "test_case_count": len(rows)
    }).inserted_id

    track_analytics(
        user["id"],
        "file_generation_success",
        {
            "result_id": str(rid),
            "filename": original_filename,
            "requirement_count": len(valid_texts),
            "test_case_count": len(rows)
        },
        request
    )

    return _response_payload(
        True,
        "Test cases generated successfully",
        report,
        rows,
        table_md,
        str(rid)
    )


@router.get("/generate_from_result/{result_id}")
def generate_from_result(result_id: str, request: Request):
    user = get_current_user(request)

    try:
        oid = ObjectId(result_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid result_id")

    doc = results_col.find_one({"_id": oid, "userId": user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Result not found")

    rows = doc.get("rows") or []
    table_md = doc.get("table_md") or ""
    validation = doc.get("validation") or {}

    if rows or table_md:
        return _response_payload(
            True,
            "Test cases loaded successfully",
            validation,
            rows,
            table_md,
            result_id,
        )

    valid_texts = _valid_texts(validation)
    if not valid_texts:
        raise HTTPException(status_code=404, detail="No valid requirements found for this result")

    rows = make_testcases(valid_texts)
    table_md = to_markdown_table(rows)

    results_col.update_one(
        {"_id": oid, "userId": user["id"]},
        {
            "$set": {
                "rows": rows,
                "table_md": table_md,
                "test_case_count": len(rows),
                "updatedAt": datetime.utcnow(),
            }
        },
    )

    return _response_payload(
        True,
        "Test cases generated successfully",
        validation,
        rows,
        table_md,
        result_id,
    )
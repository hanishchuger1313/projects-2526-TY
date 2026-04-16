import re
from typing import List, Dict, Any
from datetime import datetime
from .config import settings

AMBIGUOUS_WORDS = {
    "fast", "quick", "better", "good", "easy", "efficient", "user-friendly",
    "asap", "soon", "etc", "proper", "securely", "optimized", "minimal",
    "highly", "excellent", "robust", "seamless", "intuitive", "responsive",
    "sufficient", "appropriate", "friendly"
}

MEASURABLE_WORDS = {
    "within", "less than", "more than", "at least", "at most", "between",
    "maximum", "minimum", "seconds", "minutes", "hours", "milliseconds",
    "percentage", "percent", "mb", "gb", "kb", "ms", "chars", "characters",
    "digits", "records", "users", "days", "uptime", "availability"
}

NON_TESTABLE_HEADINGS = {
    "software requirements specification", "introduction", "overall description",
    "purpose", "scope", "definitions", "references", "abbreviations",
    "approval", "approvals", "author", "authors", "revision history",
    "table of contents", "contents", "bibliography", "appendix",
    "acknowledgement", "document overview", "problem statement",
    "problem definition", "literature review", "study of existing system",
    "abstract", "title page"
}

NON_TESTABLE_SECTION_WORDS = {
    "introduction", "purpose", "scope", "references", "overall description",
    "product perspective", "user classes", "assumptions", "constraints",
    "definitions", "abbreviations", "approval", "authors", "table of contents",
    "bibliography", "revision history", "abstract", "problem statement",
    "problem definition", "study of existing system", "specific requirements"
}

ACTORS = {
    "system", "user", "application", "admin", "administrator", "owner",
    "customer", "module", "service", "server", "dashboard", "software"
}

ACTION_VERBS = {
    "add", "create", "update", "delete", "view", "search", "filter", "sort",
    "register", "login", "log in", "authenticate", "reset", "recover", "verify",
    "upload", "download", "notify", "send", "display", "generate", "validate",
    "save", "edit", "assign", "approve", "reject", "track", "record", "manage",
    "calculate", "submit", "show", "hide", "select", "store", "encrypt", "expire",
    "redirect", "allow", "deny", "return", "mark", "schedule", "trigger"
}

REQ_PATTERNS = [
    r"\bfr[-\s]?\d+\b",
    r"\bnfr[-\s]?\d+\b",
    r"\breq[-\s]?\d+\b",
    r"\bthe system shall\b",
    r"\bthe system must\b",
    r"\bthe application must\b",
    r"\bthe application shall\b",
    r"\bthe user can\b",
    r"\bthe user shall\b",
    r"\badmin can\b",
    r"\badmin shall\b",
]

NFR_TYPES = {
    "performance": ["response time", "latency", "throughput", "performance", "within", "seconds", "milliseconds"],
    "security": ["encrypt", "security", "token", "session", "password", "hash", "ssl", "tls", "authorization", "authentication"],
    "reliability": ["uptime", "availability", "recovery", "backup", "reliability", "fault tolerance"],
    "usability": ["responsive", "mobile-friendly", "usability", "accessible"],
}

NOISE_PATTERNS = [
    r"\b\d{2,}/\d{2,}/\d{2,4}\b",
    r"\bsemester\b",
    r"\bacademic year\b",
    r"\bguided by\b",
    r"\bpresented by\b",
    r"\bdepartment of\b",
    r"\bpolytechnic\b",
    r"\btable of contents\b",
]

CONTROL_RE = re.compile(r"[\x00-\x08\x0B\x0C\x0E-\x1F]")
REPEAT_CHAR_RE = re.compile(r"(.)\1{8,}")


def normalize_text(text: str) -> str:
    t = (text or "").replace("\r\n", "\n").replace("\r", "\n")
    t = CONTROL_RE.sub(" ", t)
    t = t.replace("\u200b", "").replace("\ufeff", "").replace("\xa0", " ")
    t = REPEAT_CHAR_RE.sub(lambda m: m.group(1) * 3, t)
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()


def is_probable_heading(line: str) -> bool:
    s = (line or "").strip().lower().rstrip(":")
    if not s:
        return False
    if s in NON_TESTABLE_HEADINGS:
        return True

    m = re.fullmatch(r"\d+(?:\.\d+)*\s+(.+)", s)
    if m:
        tail = m.group(1).strip().rstrip(":")
        if tail in NON_TESTABLE_SECTION_WORDS:
            return True
        if len(tail.split()) <= 6 and tail.isascii():
            return True

    if len(s.split()) <= 5 and s in NON_TESTABLE_SECTION_WORDS:
        return True
    return False


def is_non_testable_line(line: str) -> bool:
    s = (line or "").strip()
    if not s:
        return True
    lower = s.lower().rstrip(":")

    if is_probable_heading(s):
        return True
    if any(re.search(pat, lower) for pat in NOISE_PATTERNS):
        return True
    if len(re.findall(r"\d{6,}", s)) >= 1 and len(s.split()) < 12:
        return True
    if re.search(r"\.{3,}", s):
        return True
    if len(s.split()) <= 2 and lower in {"page", "date", "name", "sign", "signature"}:
        return True
    if len(s.split()) > 20 and not re.search(r"[.!?]", s) and s.isupper():
        return True
    return False


def looks_like_requirement(line: str) -> bool:
    s = (line or "").strip()
    if not s or is_non_testable_line(s):
        return False
    lower = s.lower()

    for pat in REQ_PATTERNS:
        if re.search(pat, lower):
            return True

    has_actor = re.search(r"\b(" + "|".join(sorted(ACTORS)) + r")\b", lower)
    has_action = any(v in lower for v in ACTION_VERBS)
    if has_actor and has_action:
        return True

    for words in NFR_TYPES.values():
        if any(w in lower for w in words):
            return True
    return False


def remove_non_testable_content(text: str) -> str:
    lines = normalize_text(text).split("\n")
    kept: List[str] = []
    for line in lines:
        s = line.strip()
        if not s:
            continue
        if is_non_testable_line(s):
            continue
        kept.append(s)
    return "\n".join(kept).strip()


def _split_inline_requirements(line: str) -> List[str]:
    parts = re.split(
        r"(?=(?:\bFR[-\s]?\d+\b|\bNFR[-\s]?\d+\b|\bREQ[-\s]?\d+\b|\bThe system shall\b|\bThe system must\b|\bThe application must\b|\bThe application shall\b|\bThe user can\b|\bThe user shall\b))",
        line,
        flags=re.IGNORECASE,
    )
    return [p.strip(" -•\t") for p in parts if p.strip(" -•\t")]


def _strip_noise_from_requirement(text: str) -> str:
    s = normalize_text(text)
    s = re.sub(r"\b[a-z]\)\s*", "", s, flags=re.IGNORECASE)
    s = re.sub(r"\s+", " ", s).strip(" ,.-")
    return s


def split_atomic_requirements(text: str) -> List[str]:
    text = remove_non_testable_content(text)
    if not text:
        return []

    candidates: List[str] = []
    for line in text.split("\n"):
        s = line.strip()
        if not s:
            continue
        for part in _split_inline_requirements(s):
            subparts = [x.strip() for x in re.split(r"\s*;\s*", part) if x.strip()]
            candidates.extend(subparts)

    final_units: List[str] = []
    for cand in candidates:
        cand = _strip_noise_from_requirement(cand)
        if not cand:
            continue
        pieces = re.split(
            r"(?=(?:The system shall|The system must|The application must|The application shall|The user can|The user shall|Admin can|Admin shall))",
            cand,
            flags=re.IGNORECASE,
        )
        for p in pieces:
            p = _strip_noise_from_requirement(p)
            if not p:
                continue
            if len(p.split()) < 4:
                continue
            if len(p.split()) > 60:
                continue
            final_units.append(p)

    dedup: List[str] = []
    seen = set()
    for item in final_units:
        norm = re.sub(r"\s+", " ", item).strip().lower()
        if norm in seen:
            continue
        if looks_like_requirement(item):
            seen.add(norm)
            dedup.append(item)
    return dedup


def classify_requirement(requirement: str) -> str:
    lower = (requirement or "").lower()
    for nfr_type, words in NFR_TYPES.items():
        if any(w in lower for w in words):
            return nfr_type
    return "functional"


def summarize_requirement(requirement: str) -> str:
    req = normalize_text(requirement)
    words = req.split()
    if len(words) <= 12:
        return req
    return " ".join(words[:12]).strip() + "..."


def _extract_constraint_flags(requirement: str) -> Dict[str, bool]:
    lower = (requirement or "").lower()
    return {
        "mandatory": bool(re.search(r"\b(required|mandatory|cannot be blank|should not be empty|must enter)\b", lower)),
        "format": bool(re.search(r"\b(format|valid email|uppercase|special character|digits only|alphanumeric)\b", lower)),
        "range": bool(re.search(r"\b(minimum|min|max|maximum|between|at least|at most|not exceed)\b", lower)),
        "decision": bool(re.search(r"\b(if|when|based on|depending on|only if|otherwise|else|after)\b", lower)),
        "calculation": bool(re.search(r"\b(calculate|sum|total|amount|bill|price|percentage|discount|tax|cost)\b", lower)),
        "navigation": bool(re.search(r"\b(display|show|redirect|navigate|page|screen|open)\b", lower)),
    }


def check_ambiguity(requirement: str) -> List[str]:
    issues = []
    text_lower = (requirement or "").lower()
    for word in AMBIGUOUS_WORDS:
        if re.search(r"\b" + re.escape(word) + r"\b", text_lower):
            issues.append(f"Ambiguous term: '{word}'")
    return issues


def check_completeness(requirement: str) -> List[str]:
    issues = []
    text_lower = (requirement or "").lower()

    if not re.search(r"\b(shall|should|must|will|can)\b", text_lower):
        issues.append("Missing requirement keyword (shall/should/must/will/can)")
    if not re.search(r"\b(system|user|application|software|module|component|admin|owner|dashboard)\b", text_lower):
        issues.append("Missing actor/subject (system/user/module/admin etc.)")
    if len((requirement or "").split()) < 6:
        issues.append("Requirement too short (may be incomplete)")
    if len((requirement or "").split()) > 45:
        issues.append("Requirement too long (should be atomic and testable)")
    if (requirement or "").strip().endswith("...") or (requirement or "").strip().lower().endswith("etc"):
        issues.append("Requirement appears incomplete (ends with ... or etc)")
    return issues


def check_measurability(requirement: str) -> List[str]:
    issues = []
    text_lower = (requirement or "").lower()

    if any(word in text_lower for word in ["performance", "speed", "fast", "quick", "response time", "latency"]):
        if not any(word in text_lower for word in MEASURABLE_WORDS):
            issues.append("Performance requirement lacks measurable criteria")

    if "security" in text_lower or "secure" in text_lower:
        if not re.search(r"\b(encrypt|authenticate|authorize|ssl|tls|hash|token|session)\b", text_lower):
            issues.append("Security requirement lacks specific implementation details")
    return issues


def check_test_design_signals(requirement: str) -> List[str]:
    issues: List[str] = []
    flags = _extract_constraint_flags(requirement)
    lower = (requirement or "").lower()

    if flags["decision"]:
        issues.append("Decision logic detected: generator should cover all branches")
    if flags["calculation"]:
        issues.append("Calculation logic detected: generator should use numeric test data and exact expected results")
    if flags["mandatory"] or flags["format"] or flags["range"]:
        issues.append("Validation rules detected: generator should include field-level validation and boundary tests")
    if re.search(r"\b(display|show|redirect|navigate|open)\b", lower):
        issues.append("UI/navigation behavior detected: generator should create navigation/display test cases, not calculation tests")
    return issues


def assess_complexity(requirement: str) -> str:
    word_count = len((requirement or "").split())
    if word_count <= 12:
        return "Low"
    if word_count <= 25:
        return "Medium"
    return "High"


def validate_requirement(requirement: str, req_id: str) -> Dict[str, Any]:
    issues: List[str] = []
    issues.extend(check_completeness(requirement))
    issues.extend(check_ambiguity(requirement))
    issues.extend(check_measurability(requirement))

    score = max(0, 100 - len(issues) * 15)
    threshold = getattr(settings, "validation_threshold", 70)
    valid = score >= threshold

    issue_types = []
    for issue in issues:
        if "Ambiguous" in issue:
            issue_types.append("Ambiguity")
        elif "Missing" in issue or "too short" in issue or "too long" in issue or "incomplete" in issue:
            issue_types.append("Completeness")
        elif "lacks" in issue:
            issue_types.append("Measurability")
        else:
            issue_types.append("Other")

    return {
        "id": req_id,
        "text": requirement,
        "summary": summarize_requirement(requirement),
        "type": classify_requirement(requirement),
        "valid": valid,
        "is_valid": valid,
        "score": score,
        "issues": issues,
        "issue_types": issue_types,
        "word_count": len((requirement or "").split()),
        "complexity": assess_complexity(requirement),
        "constraint_flags": _extract_constraint_flags(requirement),
        "design_signals": check_test_design_signals(requirement),
    }


def generate_recommendation(score: float) -> str:
    if score >= 85:
        return "Excellent SRS quality. Ready for professional test case generation."
    if score >= 70:
        return "Good SRS quality. Minor improvements suggested."
    if score >= 50:
        return "Fair SRS quality. Several improvements needed."
    if score >= 30:
        return "Poor SRS quality. Major revisions required."
    return "Very poor SRS quality. Complete rewrite recommended."


def _build_checklist(results: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    good_checks: List[Dict[str, Any]] = []
    bad_checks: List[Dict[str, Any]] = []

    total = len(results)
    if total == 0:
        bad_checks.append({
            "title": "No valid testable requirements detected",
            "detail": "The uploaded content does not appear to contain functional or testable non-functional requirements.",
            "examples": [],
        })
        return {"good": good_checks, "bad": bad_checks}

    actor_ok = sum(1 for r in results if not any("Missing actor/subject" in i for i in (r.get("issues") or [])))
    keyword_ok = sum(1 for r in results if not any("Missing requirement keyword" in i for i in (r.get("issues") or [])))
    atomic_ok = sum(1 for r in results if not any("too long" in i.lower() for i in (r.get("issues") or [])))

    if keyword_ok:
        good_checks.append({
            "title": "Requirement keywords detected",
            "detail": f"{keyword_ok}/{total} requirements contain shall/should/must/will/can style wording.",
        })
    if actor_ok:
        good_checks.append({
            "title": "Actors/subjects detected",
            "detail": f"{actor_ok}/{total} requirements mention system/user/admin/module etc.",
        })
    if atomic_ok:
        good_checks.append({
            "title": "Atomic requirements found",
            "detail": f"{atomic_ok}/{total} requirements look short enough for testcase generation.",
        })

    examples_map = {"Completeness": [], "Ambiguity": [], "Measurability": [], "Other": []}
    for r in results:
        for issue in (r.get("issues") or [])[:3]:
            if "Ambiguous" in issue:
                key = "Ambiguity"
            elif "Missing" in issue or "too short" in issue or "too long" in issue or "incomplete" in issue:
                key = "Completeness"
            elif "lacks" in issue:
                key = "Measurability"
            else:
                key = "Other"
            if len(examples_map[key]) < 5:
                examples_map[key].append({"req_id": r.get("id"), "issue": issue, "text": r.get("text")})

    counts = {"Completeness": 0, "Ambiguity": 0, "Measurability": 0, "Other": 0}
    for r in results:
        for t in (r.get("issue_types") or []):
            counts[t] = counts.get(t, 0) + 1

    for k, title in [("Completeness", "Completeness issues"), ("Ambiguity", "Ambiguity issues"), ("Measurability", "Measurability issues"), ("Other", "Other issues")]:
        if counts.get(k, 0):
            bad_checks.append({
                "title": title,
                "detail": f"{counts[k]} issue(s) found.",
                "examples": examples_map.get(k, []),
            })

    design_examples = []
    for r in results:
        signals = r.get("design_signals") or []
        if signals and len(design_examples) < 5:
            design_examples.append({"req_id": r.get("id"), "text": r.get("text"), "signals": signals})

    if design_examples:
        bad_checks.append({
            "title": "Special testcase design signals found",
            "detail": "These requirements contain validation, branch, navigation, or calculation logic. The generator should create specialized testcases for them.",
            "examples": [{"req_id": r.get("req_id"), "issue": "Needs specialized testcase generation", "text": r.get("text")} for r in design_examples],
        })

    return {"good": good_checks, "bad": bad_checks}


def validate_srs(text: str) -> Dict[str, Any]:
    requirements = split_atomic_requirements(text)
    results: List[Dict[str, Any]] = []
    valid_requirements: List[str] = []

    total = len(requirements)
    total_score = 0
    for i, req in enumerate(requirements, 1):
        lower = req.lower()
        req_id = f"NFR{i}" if re.match(r"\s*nfr", lower) else f"FR{i}"
        res = validate_requirement(req, req_id)
        results.append(res)
        total_score += res["score"]
        if res["valid"]:
            valid_requirements.append(f"{res['id']}: {req}")

    valid_count = len(valid_requirements)
    if total > 0:
        score = round(total_score / total, 2)
        avg_word_count = sum(r["word_count"] for r in results) / total
        issue_types: Dict[str, int] = {}
        for r in results:
            for t in r["issue_types"]:
                issue_types[t] = issue_types.get(t, 0) + 1
        complexity_dist = {
            "Low": sum(1 for r in results if r["complexity"] == "Low"),
            "Medium": sum(1 for r in results if r["complexity"] == "Medium"),
            "High": sum(1 for r in results if r["complexity"] == "High"),
        }
    else:
        score = 0
        avg_word_count = 0
        issue_types = {}
        complexity_dist = {"Low": 0, "Medium": 0, "High": 0}

    return {
        "total_requirements": total,
        "requirements_total": total,
        "valid_requirements": valid_count,
        "valid_count": valid_count,
        "invalid_requirements": total - valid_count if total >= valid_count else 0,
        "invalid_count": total - valid_count if total >= valid_count else 0,
        "score": score,
        "average_word_count": round(avg_word_count, 1),
        "requirements": results,
        "valid_only": valid_requirements,
        "issue_statistics": issue_types,
        "complexity_distribution": complexity_dist,
        "validation_timestamp": datetime.utcnow().isoformat(),
        "summary": {
            "status": "PASS" if score >= 70 else "FAIL" if score >= 40 else "POOR",
            "recommendation": generate_recommendation(score),
        },
        "checklist": _build_checklist(results),
    }


def get_requirement_template() -> Dict[str, Any]:
    return {
        "template": "The [ACTOR] shall [ACTION] [OBJECT] [CONDITION/CONSTRAINT]",
        "example": "The system shall validate login credentials within 2 seconds.",
        "components": {
            "actor": "Who performs the action (user, system, admin)",
            "action": "What should be done (create, display, validate)",
            "object": "The feature/data being handled",
            "condition": "When or under what rules the action occurs",
        },
    }

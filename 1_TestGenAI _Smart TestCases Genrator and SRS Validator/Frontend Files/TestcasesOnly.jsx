
import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, User, LogOut, Menu } from "lucide-react";
import "../Styles/Prompt.css";

const SRSDownload = lazy(() =>
  import("../Pages/SRSDownload.jsx")
    .then((m) => m)
    .catch(() => ({ default: () => null }))
);

const API_BASE = (process.env.REACT_APP_API_BASE || "http://localhost:8000").replace(/\/+$/, "");

function parsePipeTable(md) {
  if (!md || typeof md !== "string") return null;

  const lines = md
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const tableLines = lines.filter((l) => l.startsWith("|") && l.endsWith("|"));
  if (tableLines.length < 3) return null;

  const headerLine = tableLines[0];
  const sepLine = tableLines[1];
  if (!sepLine.includes("---")) return null;

  const splitRow = (line) => {
    let s = line;
    if (s.startsWith("|")) s = s.slice(1);
    if (s.endsWith("|")) s = s.slice(0, -1);
    return s.split("|").map((c) => c.trim());
  };

  const headers = splitRow(headerLine);
  const rows = tableLines.slice(2).map(splitRow).map((r) => {
    if (r.length < headers.length) return [...r, ...Array(headers.length - r.length).fill("")];
    if (r.length > headers.length) return r.slice(0, headers.length);
    return r;
  });

  return { headers, rows };
}

const HIDE_COLS = new Set([
  "Preconditions",
  "Priority",
  "Test_Environment",
  "Intercase_Dependencies",
  "Special_Procedural_Requirements",
]);

function filterColumns(tableData) {
  if (!tableData) return null;
  const keepIdx = tableData.headers
    .map((h, i) => (!HIDE_COLS.has(h) ? i : -1))
    .filter((i) => i !== -1);

  return {
    headers: keepIdx.map((i) => tableData.headers[i]),
    rows: tableData.rows.map((r) => keepIdx.map((i) => r[i] || "")),
  };
}

export default function TestcasesOnly() {
  const { mode, id } = useParams();
  const navigate = useNavigate();

  const [table, setTable] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showDownloads, setShowDownloads] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
        if (!res.ok) {
          navigate("/auth", { replace: true });
          return;
        }
        const data = await res.json().catch(() => ({}));
        setUser(data.user || null);
      } catch {
        navigate("/auth", { replace: true });
      }
    };
    init();
  }, [navigate]);

  const filteredTable = useMemo(() => filterColumns(parsePipeTable(table)), [table]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError("");

      try {
        const url =
          mode === "file"
            ? `${API_BASE}/api/srs/generate_from_result/${id}`
            : `${API_BASE}/api/testcases/generate_from_validation/${id}`;

        const res = await fetch(url, { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || data.message || "Failed to generate");

        if (cancelled) return;
        setRows(data.rows || []);
        setTable(data.table || data.table_md || data.tableMD || "");
      } catch (e) {
        if (cancelled) return;
        setError(e.message || "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (mode && id) run();
    else {
      setLoading(false);
      setError("Invalid route parameters");
    }

    return () => {
      cancelled = true;
    };
  }, [mode, id]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
    } catch {
      // ignore
    }
    localStorage.removeItem("user");
    navigate("/auth", { replace: true });
  };

  if (showDownloads) {
    return (
      <Suspense fallback={<div className="loading-screen" />}>
        <SRSDownload onBack={() => setShowDownloads(false)} />
      </Suspense>
    );
  }

  return (
    <div className="app-container">
      <main className="main" style={{ marginLeft: 0 }}>
        <header className="topbar">
          <div className="topbar-left" style={{ gap: 10 }}>
            <button className="mobile-sidebar-toggle" onClick={() => window.location.href = "/prompt"} title="Back to Prompt">
              <ArrowLeft size={18} />
            </button>
            <h1>Generated Test Cases</h1>
            <button
  onClick={() => navigate("/prompt")}
  style={{
    marginBottom: "15px",
    padding: "8px 15px",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }}
>
  ⬅ Back
</button>
          </div>

          <div className="profile-wrapper">
            <div className="profile-avatar" onClick={() => setProfileOpen((p) => !p)} role="button" tabIndex={0}>
              <User size={18} />
            </div>

            {profileOpen && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  <div className="profile-avatar-small">
                    <User size={16} />
                  </div>
                  <div>
                    <div className="profile-role">{user?.role || "user"}</div>
                    <div className="profile-email">{user?.email || ""}</div>
                  </div>
                </div>

                <div className="dropdown-divider" />

                <button
                  className="dropdown-item"
                  onClick={() => {
                    setProfileOpen(false);
                    setShowDownloads(true);
                  }}
                >
                  <FileText size={16} />
                  Downloads
                </button>

                <button
                  className="dropdown-item"
                 onClick={() => {

  window.location.href = "/prompt";
}}
                >
                  <Menu size={16} />
                  Recent Chats
                </button>

                <button className="dropdown-item logout" onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <section className="chat-area" style={{ padding: 18 }}>
          {loading ? (
            <div className="welcome-message">
              <div className="welcome-icon">⏳</div>
              <h2>Generating test cases...</h2>
              <p>Please wait</p>
            </div>
          ) : error ? (
            <div className="welcome-message">
              <div className="welcome-icon">⚠️</div>
              <h2>Error</h2>
              <p>{error}</p>
             <button className="send-btn" style={{ marginTop: 12 }} onClick={() => window.location.href = "/prompt"}>
                Back
              </button>
            </div>
          ) : filteredTable ? (
            <div className="table-page">
              <div className="table-toolbar">
                <div className="table-title">Generated Test Cases</div>
                <div className="table-subtitle">Professional testcase view • scroll horizontally • sticky header</div>
              </div>

              <div className="table-wrap">
                <table className="testcases-table">
                  <thead>
                    <tr>
                      {filteredTable.headers.map((h, i) => (
                        <th key={i}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTable.rows.map((r, ri) => (
                      <tr key={ri}>
                        {r.map((c, ci) => (
                          <td key={ci}>
                            <span dangerouslySetInnerHTML={{ __html: String(c || "") }} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ whiteSpace: "pre-wrap" }}>{table || JSON.stringify(rows, null, 2)}</div>
          )}
        </section>
      </main>
    </div>
  );
}

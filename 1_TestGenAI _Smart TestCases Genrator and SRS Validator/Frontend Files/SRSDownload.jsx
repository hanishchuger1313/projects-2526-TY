import { useState, useEffect, useMemo } from "react";
import { Download, FileText, Trash2, Calendar, Printer, X } from "lucide-react";
import "../Styles/SRS.css";

const API_BASE = import.meta.env.VITE_API_BASE || `http://${window.location.hostname}:8000`;

export default function DownloadsPage({ onBack }) {
  const [downloads, setDownloads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeDoc, setActiveDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [error, setError] = useState("");

  const ieeeColumns = useMemo(
    () => [
      "Test_Case_ID",
      "Test_Case_Title",
      "Requirement_ID",
      "Test_Objective",
      "Preconditions",
      "Test_Steps",
      "Test_Data",
      "Expected_Result",
      "Actual_Result",
      "Pass_Fail_Status",
      "Priority",
      "Test_Environment",
    ],
    []
  );

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getFileIcon = (type) => {
    if (type === "pdf") return <FileText className="file-icon pdf" />;
    if (type === "json") return <FileText className="file-icon json" />;
    if (type === "doc" || type === "docx") return <FileText className="file-icon doc" />;
    if (type === "xls" || type === "xlsx") return <FileText className="file-icon xls" />;
    return <FileText className="file-icon" />;
  };

  const normalizeIEEE = (row) => {
    const tcId = row?.Test_Case_ID ?? row?.TC_ID ?? "";
    const title = row?.Test_Case_Title ?? row?.Title ?? "";
    const reqId = row?.Requirement_ID ?? row?.REQ_ID ?? "";
    const objective =
      row?.Test_Objective ??
      (row?.Requirement_Type ? `Validate ${row.Requirement_Type} requirement` : "") ??
      "";

    const pre =
      row?.Preconditions ??
      row?.Precondition ??
      "";

    const steps =
      row?.Test_Steps ??
      row?.Steps ??
      "";

    const tdata = row?.Test_Data ?? "";
    const expected = row?.Expected_Result ?? "";
    const actual = row?.Actual_Result ?? "";
    const status = row?.Pass_Fail_Status ?? row?.Status ?? "";
    const priority = row?.Priority ?? "";
    const env = row?.Test_Environment ?? "";

    return {
      Test_Case_ID: tcId,
      Test_Case_Title: title,
      Requirement_ID: reqId,
      Test_Objective: objective,
      Preconditions: pre,
      Test_Steps: steps,
      Test_Data: tdata,
      Expected_Result: expected,
      Actual_Result: actual,
      Pass_Fail_Status: status,
      Priority: priority,
      Test_Environment: env,
    };
  };

  const toCsv = (rows) => {
    const esc = (v) => {
      const s = (v ?? "").toString().replace(/\r?\n/g, " ").trim();
      const needs = s.includes(",") || s.includes('"');
      const out = s.replace(/"/g, '""');
      return needs ? `"${out}"` : out;
    };
    const header = ieeeColumns.join(",");
    const lines = (rows || []).map((r) => ieeeColumns.map((c) => esc(r?.[c] ?? "")).join(","));
    return [header, ...lines].join("\n");
  };

  const fetchDownloads = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/testcases/downloads`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || data.message || "Failed to load downloads");
      const list = data.downloads || [];
      const mapped = list.map((d) => ({
        id: d.id,
        name: (d.title || "Testcases").replace(/\s+/g, "_") + ".csv",
        type: "csv",
        size: "",
        date: d.createdAt,
        time: "",
        source: d.source || "prompt",
      }));
      setDownloads(mapped);
      if (!activeId && mapped.length > 0) setActiveId(mapped[0].id);
    } catch (e) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoc = async (id) => {
    if (!id) return;
    setLoadingDoc(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/testcases/downloads/${id}`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || data.message || "Failed to load file");
      const rows = (data.rows || []).map(normalizeIEEE);
      setActiveDoc({ ...data, ieeeRows: rows });
    } catch (e) {
      setActiveDoc(null);
      setError(e.message || "Error");
    } finally {
      setLoadingDoc(false);
    }
  };

  useEffect(() => {
    fetchDownloads();
  }, []);

  useEffect(() => {
    if (activeId) fetchDoc(activeId);
  }, [activeId]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/testcases/downloads/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || data.message || "Delete failed");
      if (activeId === id) {
        setActiveId(null);
        setActiveDoc(null);
      }
      await fetchDownloads();
    } catch (e2) {
      setError(e2.message || "Error");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to delete all downloads?")) return;
    setError("");
    try {
      for (const d of downloads) {
        await fetch(`${API_BASE}/api/testcases/downloads/${d.id}`, {
          method: "DELETE",
          credentials: "include",
        });
      }
      setDownloads([]);
      setActiveId(null);
      setActiveDoc(null);
    } catch (e) {
      setError(e.message || "Error");
    }
  };

  const handleDownloadCSV = async (file) => {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/testcases/downloads/${file.id}`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || data.message || "Failed to download");
      const rows = (data.rows || []).map(normalizeIEEE);
      const csv = toCsv(rows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name || `testcases_${file.id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message || "Error");
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="downloads-container">
      <header className="downloads-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h1>My Downloads</h1>
      </header>

      <div className="downloads-content">
        {error ? (
          <div style={{ padding: 12, marginBottom: 10, border: "1px solid rgba(255,0,0,0.25)", borderRadius: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ opacity: 0.9 }}>{error}</div>
              <button
                onClick={() => setError("")}
                style={{ background: "transparent", border: "none", cursor: "pointer" }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ) : null}

        <div className="downloads-list">
          {loading ? (
            <div className="empty-state">
              <FileText size={48} />
              <h3>Loading downloads...</h3>
              <p>Please wait</p>
            </div>
          ) : downloads.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <h3>No downloads found</h3>
              <p>Your download list is empty</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="downloads-table">
                <thead>
                  <tr>
                    <th>Files</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {downloads.map((file) => (
                    <tr
                      key={file.id}
                      className="download-item"
                      onClick={() => setActiveId(file.id)}
                      style={{
                        cursor: "pointer",
                        outline: activeId === file.id ? "1px solid rgba(0,255,180,0.25)" : "none",
                      }}
                    >
                      <td>
                        <div className="file-info">
                          <div className="file-icon-wrapper">{getFileIcon(file.type)}</div>
                          <div className="file-details">
                            <div className="file-name">{file.name}</div>
                            <div className="file-meta">
                              {file.source ? `${file.source} • ` : ""}.{file.type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="file-date">
                          <Calendar size={14} />
                          <div className="date-time">
                            <div className="date">{formatDate(file.date)}</div>
                            <div className="time">{formatTime(file.date)}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            className="action-btn download"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadCSV(file);
                            }}
                            title="Export CSV"
                          >
                            <Download size={16} />
                          </button>

                          <button
                            className="action-btn download"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportPDF();
                            }}
                            title="Export PDF"
                          >
                            <Printer size={16} />
                          </button>

                          <button
                            className="action-btn delete"
                            onClick={(e) => handleDelete(file.id, e)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {downloads.length > 0 && (
          <div className="clear-all-section">
            <button className="clear-all-btn" onClick={handleClearAll}>
              <Trash2 size={18} />
              Clear All
            </button>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          {loadingDoc ? (
            <div className="empty-state">
              <FileText size={48} />
              <h3>Loading table...</h3>
              <p>Please wait</p>
            </div>
          ) : activeDoc?.ieeeRows?.length ? (
            <div className="table-container">
              <table className="downloads-table">
                <thead>
                  <tr>
                    {ieeeColumns.map((c) => (
                      <th key={c}>{c.replaceAll("_", " ")}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeDoc.ieeeRows.map((r, idx) => (
                    <tr key={idx} className="download-item">
                      {ieeeColumns.map((c) => (
                        <td key={c}>{(r?.[c] ?? "").toString()}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : downloads.length > 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <h3>Select a download</h3>
              <p>Click a row to view IEEE 829-1998 table</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}


import { useState, useRef, useEffect, useCallback, lazy, Suspense, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  LogOut,
  Plus,
  FileText,
  Send,
  X,
  Menu,
  Trash2,
  Clock,
  Upload,
} from "lucide-react";
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

function normalizeMessage(msg) {
  const role = msg?.role || msg?.sender || "assistant";
  return {
    id: msg?.id || msg?._id || Date.now() + Math.random(),
    sender: role === "user" ? "user" : "assistant",
    content: msg?.content || "",
    time: msg?.createdAt
      ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

const HIDE_COLS = new Set([
  "Preconditions",
  "Priority",
  "Test_Environment",
  "Intercase_Dependencies",
  "Special_Procedural_Requirements",
]);

function filterColumns(tableData) {
  if (!tableData?.headers?.length) return tableData;
  const keepIdx = tableData.headers
    .map((h, i) => (!HIDE_COLS.has(h) ? i : -1))
    .filter((i) => i !== -1);

  return {
    headers: keepIdx.map((i) => tableData.headers[i]),
    rows: tableData.rows.map((r) => keepIdx.map((i) => r[i] || "")),
  };
}

export default function Prompt() {
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState("");


  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showDownloads, setShowDownloads] = useState(false);

  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);

  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const [currentValidation, setCurrentValidation] = useState(null);
  const [pendingGenerate, setPendingGenerate] = useState(null); // {mode,id}
  const [currentTable, setCurrentTable] = useState("");
  // 🔥 AI STATES
const [aiSuggestions, setAiSuggestions] = useState("");
const [aiTestcases, setAiTestcases] = useState("");
const [aiLoading, setAiLoading] = useState(false);
  // 🔥 FINAL CORRECT PLACE
useEffect(() => {
  try {
    const savedSrs = sessionStorage.getItem("updated_srs");
    const savedValidation = sessionStorage.getItem("validation_result");
    const savedPending = sessionStorage.getItem("pending_generate");

if (savedPending) {
  setPendingGenerate(JSON.parse(savedPending));
}

    if (savedSrs) {
  setPrompt(savedSrs);
    }

    if (savedValidation) {
       setCurrentValidation(JSON.parse(savedValidation)); 
    }

  } catch (e) {
    console.log("Restore failed:", e);
  }
}, []);
  const chatAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  const checklistRef = useRef(null);

  const addMessage = useCallback((content, sender = "user") => {
    const msg = {
      id: Date.now() + Math.random(),
      sender,
      content,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }, []);

  const loadChatHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/testcases/chats`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      setChatHistory(data.chats || []);
    } catch {
      // ignore
    }
  }, []);

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
        await loadChatHistory();
      } catch {
        navigate("/auth", { replace: true });
      } finally {
        setAuthChecking(false);
      }
    };
    init();
  }, [navigate, loadChatHistory]);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, currentValidation, currentTable]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
    } catch {
      // ignore
    }
    localStorage.removeItem("user");
    navigate("/auth", { replace: true });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const newChat = async () => {
    setPrompt("");
    setAttachments([]);
    setMessages([]);
    setCurrentChat(null);
    setCurrentValidation(null);
    setPendingGenerate(null);
    setCurrentTable("");
    setError(null);
  };

  const deleteChat = async (chatId) => {
    try {
      await fetch(`${API_BASE}/api/testcases/chats/${chatId}`, {
        method: "DELETE",
        credentials: "include",
      });
      setChatHistory((prev) => prev.filter((c) => c._id !== chatId));
      if (currentChat === chatId) await newChat();
    } catch {
      // ignore
    }
  };

  const loadChat = async (chatId) => {
    try {
      const [messagesRes, latestRes, validationRes] = await Promise.all([
        fetch(`${API_BASE}/api/testcases/chats/${chatId}/messages`, { credentials: "include" }),
        fetch(`${API_BASE}/api/testcases/chats/${chatId}/latest`, { credentials: "include" }),
        fetch(`${API_BASE}/api/testcases/chats/${chatId}/latest_validation`, { credentials: "include" }),
      ]);

      if (messagesRes.ok) {
        const data = await messagesRes.json().catch(() => ({}));
        setMessages((data.messages || []).map(normalizeMessage));
      } else {
        setMessages([]);
      }

      if (latestRes.ok) {
        const latest = await latestRes.json().catch(() => ({}));
        setCurrentTable(latest.table || "");
      } else {
        setCurrentTable("");
      }

      if (validationRes.ok) {
        const v = await validationRes.json().catch(() => ({}));
        setCurrentValidation(v.validation || null);
        if (v.validationId) {
          setPendingGenerate({ mode: "text", id: v.validationId });
        } else {
          setPendingGenerate(null);
        }
      } else {
        setCurrentValidation(null);
        setPendingGenerate(null);
      }

      setCurrentChat(chatId);
      setAttachments([]);
      setError(null);
    } catch {
      setError("Failed to load chat");
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const mapped = files.map((f) => ({
      id: Date.now() + Math.random(),
      file: f,
      name: f.name,
      size: f.size,
      type: f.type,
    }));

    setAttachments((prev) => [...prev, ...mapped]);
    e.target.value = "";
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const clearAttachments = () => setAttachments([]);

  const validateText = async (text) => {
    const res = await fetch(`${API_BASE}/api/testcases/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ chatId: currentChat, prompt: text }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || data.message || "Validation failed");
    return data;
  };

  const validateFile = async (file, extraPrompt) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", (extraPrompt || "").trim());

    const res = await fetch(`${API_BASE}/api/srs/upload_validate`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || data.message || "Validation failed");
    return data;
  };

  const handleSend = async () => {
    if (loading || uploading) return;

    setError(null);
    setCurrentValidation(null);
    setPendingGenerate(null);
    setCurrentTable("");

    const hasFile = attachments.length > 0;
    const hasText = (prompt || "").trim().length > 0;

    if (!hasFile && !hasText) {
      setError("Please upload an SRS file or enter requirements text.");
      return;
    }

    if (hasFile) {
      const file = attachments[0]?.file;
      if (!file) {
        setError("Invalid file selected.");
        return;
      }

      setUploading(true);
      addMessage(`Validating ${file.name}...`, "assistant");

      try {
        const data = await validateFile(file, prompt);
        if (data.chatId) setCurrentChat(data.chatId);
        setCurrentValidation(data.validation || null);
        const savedSrs = sessionStorage.getItem("srs_text");
sessionStorage.setItem("validation_result", JSON.stringify(data.validation));
        const generateData = { mode: "file", id: data.result_id || data.resultId || "" };
setPendingGenerate(generateData);

sessionStorage.setItem("pending_generate", JSON.stringify(generateData));
        addMessage("✅ SRS validation completed. Review checklist below.", "assistant");
        await loadChatHistory();

        setTimeout(() => {
          checklistRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
      } catch (e) {
        setError(e.message || "Failed to validate");
        addMessage(`Error: ${e.message || "Failed to validate"}`, "assistant");
      } finally {
        setUploading(false);
      }
      return;
    }

    setLoading(true);
    addMessage(prompt, "user");
    addMessage("Validating your input...", "assistant");

    try {
      const data = await validateText(prompt);
      if (data.chatId) setCurrentChat(data.chatId);
      setCurrentValidation(data.validation || null);
      sessionStorage.setItem("srs_text", prompt);
sessionStorage.setItem("validation_result", JSON.stringify(data.validation));
     if (data.validationId) {
  const generateData = { mode: "text", id: data.validationId };
  setPendingGenerate(generateData);

  sessionStorage.setItem("pending_generate", JSON.stringify(generateData));
}
      addMessage("✅ SRS validation completed. Review checklist below.", "assistant");
      setPrompt("");
      await loadChatHistory();

      setTimeout(() => {
        checklistRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } catch (e) {
      setError(e.message || "Failed to validate");
      addMessage(`Error: ${e.message || "Failed to validate"}`, "assistant");
    } finally {
      setLoading(false);
    }
  };

  const handleShowTestcases = () => {
    if (!pendingGenerate?.id || !pendingGenerate?.mode) return;
    navigate(`/testcases/${pendingGenerate.mode}/${pendingGenerate.id}`);
  };
  // 🔥 AI SUGGESTIONS
const handleAISuggestions = async () => {
  console.log("AI BUTTON CLICKED");  // 🔥 add this

  try {
    const res = await fetch("http://localhost:8000/api/ai/suggestions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt || "Test login system"
      }),
    });

    const data = await res.json();

    console.log("AI RESPONSE:", data); // 🔥 add this

    if (data.ok) {
      setAiSuggestions(data.ai_suggestions);
    } else {
      setError(data.error || "AI error");
    }

  } catch (err) {
    console.log("FETCH ERROR:", err);
    setError("AI request failed");
  }
};


// 🔥 AI TESTCASES
const handleAITestcases = async () => {
  console.log("AI TESTCASE CLICKED");

  try {
    const res = await fetch("http://localhost:8000/api/ai/testcases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt || "Test login system"
      }),
    });

    const data = await res.json();

    console.log("AI TESTCASE RESPONSE:", data);

    if (data.ok) {
      setAiTestcases(data.ai_testcases);
    } else {
      setError(data.error || "AI error");
    }

  } catch (err) {
    console.log("FETCH ERROR:", err);
    setError("AI request failed");
  }
};
  const tableData = useMemo(() => filterColumns(parsePipeTable(currentTable)), [currentTable]);

  if (authChecking) return <div className="loading-screen" />;

  if (showDownloads) {
    return (
      <Suspense fallback={<div className="loading-screen" />}>
        <SRSDownload onBack={() => setShowDownloads(false)} />
      </Suspense>
    );
  }

  return (
    <div className="app-container">
      <div className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar ${sidebarOpen ? "" : "closed"}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <h2 className="app-title">TestGen AI</h2>
          </div>

          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen((p) => !p)}>
            <Menu size={18} />
          </button>
        </div>

        <button className="new-chat-btn" onClick={newChat}>
          <Plus size={18} />
          New Chat
        </button>

        <div className="history-section">
          <div className="history-title">Recent Chats</div>

          {chatHistory.length === 0 ? (
            <div className="empty-history">No chats yet</div>
          ) : (
            <div className="history-list">
              {chatHistory.map((c) => (
                <div key={c._id} className={`history-item ${currentChat === c._id ? "active" : ""}`}>
                  <button className="chat-info" onClick={() => loadChat(c._id)}>
                    <div className="chat-title">
                      <Clock size={14} />
                      <span>{c.title || "Chat"}</span>
                    </div>
                    {c.createdAt ? (
                      <div className="chat-date">{String(c.createdAt).slice(0, 10)}</div>
                    ) : null}
                  </button>

                  <button className="delete-chat" onClick={() => deleteChat(c._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar-footer" />
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-sidebar-toggle" onClick={() => setSidebarOpen((p) => !p)}>
              <Menu size={18} />
            </button>
            <h1>AI Test Case Generator</h1>
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

                {currentValidation && (
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setProfileOpen(false);
                      setTimeout(() => {
                        checklistRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 80);
                    }}
                  >
                    <FileText size={16} />
                    View Validation
                  </button>
                )}

                <button className="dropdown-item logout" onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <section className="chat-area" ref={chatAreaRef}>
          {messages.length === 0 && !currentValidation ?  (
            <div className="welcome-message">
              <div className="welcome-icon">🤖</div>
              <h2>Welcome to TestGen AI</h2>
              <p>Upload your SRS or paste requirements to validate and generate professional test cases.</p>
            </div>
          ) : (
            <div className="chat-messages">
              {messages.map((m) => (
                <div key={m.id} className={`message ${m.sender === "user" ? "user" : "assistant"}`}>
                  <div className="message-header">
                    <div className="message-author">
                      {m.sender === "user" ? "You" : "TestGen AI"}
                      {m.sender !== "user" && <span className="ai-badge">AI</span>}
                    </div>
                    <div className="message-time">{m.time}</div>
                  </div>
                  <div className="message-content">{m.content}</div>
                </div>
              ))}

              {currentTable && tableData ? (
                <div className="message assistant">
                  <div className="message-header">
                    <div className="message-author">
                      TestGen AI <span className="ai-badge">AI</span>
                    </div>
                    <div className="message-time">
                      {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  <div className="message-content">
                    <div className="table-page">
                      <div className="table-toolbar">
                        <div className="table-title">Last Generated Test Cases</div>
                        <div className="table-subtitle">Recent chat se load hua output • scroll horizontally</div>
                      </div>

                      <div className="table-wrap">
                        <table className="testcases-table">
                          <thead>
                            <tr>
                              {tableData.headers.map((h, i) => (
                                <th key={i}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {tableData.rows.map((r, ri) => (
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
                  </div>
                </div>
              ) : null}

              {currentValidation ? (
                 <div className="message assistant" ref={checklistRef}>
                  <div className="message-header">
                    <div className="message-author">
                      TestGen AI <span className="ai-badge">AI</span>
                    </div>
                    <div className="message-time">
                      {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {/* 🔥 AI LOADING */}
{aiLoading && (
  <div className="message assistant">
    <div className="message-content">AI is thinking...</div>
  </div>
)}

{/* 🔥 AI SUGGESTIONS */}
{aiSuggestions && (
  <div className="message assistant">
    <div className="message-header">
      <div className="message-author">
        Gemini AI <span className="ai-badge">AI</span>
      </div>
    </div>
    <div className="message-content">
      <h3>AI Suggestions</h3>
      <pre>{aiSuggestions}</pre>
    </div>
  </div>
)}

{/* 🔥 AI TESTCASES */}
{aiTestcases && (
  <div className="message assistant">
    <div className="message-header">
      <div className="message-author">
        Gemini AI <span className="ai-badge">AI</span>
      </div>
    </div>
    <div className="message-content">
      <h3>AI Generated Testcases</h3>
      <pre>{aiTestcases}</pre>
    </div>
  </div>
)}
                    </div>
                  </div>

                  <div className="message-content">
                    <div style={{ marginBottom: 10, fontWeight: 800 }}>SRS Validation Checklist</div>

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 800, marginBottom: 6 }}>✅ What looks good</div>
                      {Array.isArray(currentValidation?.checklist?.good) && currentValidation.checklist.good.length > 0 ? (
                        currentValidation.checklist.good.map((g, i) => (
                          <div key={i} style={{ marginBottom: 8 }}>
                            <div style={{ fontWeight: 700 }}>{g.title || "Good"}</div>
                            {g.detail ? <div style={{ opacity: 0.9 }}>{g.detail}</div> : null}
                          </div>
                        ))
                      ) : (
                        <div style={{ opacity: 0.9 }}>No positive checkpoints detected.</div>
                      )}
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 800, marginBottom: 6 }}>❌ What needs fixing</div>
                      {Array.isArray(currentValidation?.checklist?.bad) && currentValidation.checklist.bad.length > 0 ? (
                        currentValidation.checklist.bad.map((b, i) => (
                          <div key={i} style={{ marginBottom: 10 }}>
                            <div style={{ fontWeight: 700 }}>{b.title || "Issue"}</div>
                            {b.detail ? <div style={{ opacity: 0.9 }}>{b.detail}</div> : null}
                            {Array.isArray(b.examples) && b.examples.length > 0 ? (
                              <div style={{ marginTop: 6, opacity: 0.9, fontSize: 12 }}>
                                {b.examples.slice(0, 3).map((ex, ei) => (
                                  <div key={ei} style={{ marginTop: 4 }}>
                                    • {ex.req_id ? <b>{ex.req_id}:</b> : null} {ex.issue}
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <div style={{ opacity: 0.9 }}>No issues found.</div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setPendingGenerate(null);
                          setCurrentValidation(null);
                        }}
                        style={{ width: "auto" }}
                      >
                        Hide checklist
                      </button>

                      <button
                        className="dropdown-item"
                        onClick={handleShowTestcases}
                       disabled={!pendingGenerate}
                        style={{ width: "auto" }}
                        title={!pendingGenerate?.id ? "Validate first" : "Generate testcases"}
                      >
                        Show testcases

                      </button>
                       {/* 🔥 ADD HERE */}
  <button
    className="dropdown-item"
    onClick={handleAISuggestions}
    style={{ width: "auto" }}
  >
    ✨ AI Suggestions
  </button>

  <button
    className="dropdown-item"
    onClick={handleAITestcases}
    style={{ width: "auto" }}
  >
    🤖 AI Testcases
  </button>


                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </section>

        {error ? (
          <div className="error-banner">
            <div className="error-icon">✖</div>
            <div className="error-message">{error}</div>
            <button className="close-error" onClick={() => setError(null)}>
              <X size={16} />
            </button>
          </div>
        ) : null}

        {attachments.length > 0 ? (
          <div className="attachments-preview">
            <div className="attachments-header">
              <span>Attachments ({attachments.length})</span>
              <button className="clear-attachments" onClick={clearAttachments}>
                Clear all
              </button>
            </div>

            <div className="attachments-list">
              {attachments.map((a) => (
                <div key={a.id} className="attachment-item">
                  <div className="attachment-info">
                    <div className="attachment-icon">
                      <Upload size={16} />
                    </div>
                    <div>
                      <div className="attachment-name">{a.name}</div>
                      <div className="attachment-size">
                        {formatFileSize(a.size)} • {a.type || "file"}
                      </div>
                    </div>
                  </div>

                  <button className="remove-attachment" onClick={() => removeAttachment(a.id)}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="prompt-bar">
          <div className="prompt-input-wrapper">
            <button className="attach-btn" onClick={() => fileInputRef.current?.click()}>
              <Upload size={18} />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: "none" }}
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            />

            <textarea
              placeholder="Paste SRS requirements here... (Enter to send, Shift+Enter new line)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>

          <button className="send-btn" onClick={handleSend} disabled={loading || uploading} title="Send">
            <Send size={18} />
          </button>
        </div>
      </main>
    </div>
  );
}

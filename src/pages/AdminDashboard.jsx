import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { isAdminEmail } from "../config";
import { Icon } from "../components/Icon";
import { statusMeta } from "../data/constants";
import { useLang } from "../i18n/index.jsx";

function AdminTopicsList({ topics, onEdit, onNew }) {
  const { t } = useLang();
  return (
    <div className="admin-list">
      <div className="admin-list-header">
        <h2>{t.admin.topics}</h2>
        <button className="primary-button" type="button" onClick={onNew}>+ {t.admin.newTopic || "New Topic"}</button>
      </div>
      {topics.map((topic) => (
        <div className="admin-row" key={topic.id}>
          <div>
            <span>{topic.title}</span>
            <p className="muted small">{topic.category} · {topic.period}</p>
          </div>
          <div className="admin-row-actions">
            <span className={`status-badge ${statusMeta[topic.status]?.tone}`}>{statusMeta[topic.status]?.label}</span>
            <button className="text-icon-button" type="button" onClick={() => onEdit(topic)}>
              <Icon>edit</Icon>{t.admin.edit}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function TopicEditor({ topic, onSave, onBack }) {
  const { t } = useLang();
  const isNew = !topic.id;
  const [title, setTitle] = useState(topic.title || "");
  const [summary, setSummary] = useState(topic.summary || "");
  const [content, setContent] = useState(topic.content || "");
  const [status, setStatus] = useState(topic.status || "unverified");
  const [categoryId, setCategoryId] = useState(topic.category_id || "");
  const [periodLabel, setPeriodLabel] = useState(topic.period || "");
  const [yearStart, setYearStart] = useState(topic.year || "");
  const [location, setLocation] = useState(topic.location || "");
  const [adminNote, setAdminNote] = useState(topic.admin_note || "");
  const [correctionNote, setCorrectionNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.from("categories").select("*").order("sort_order").then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setSaveError("");

    if (isNew) {
      if (!title.trim()) { alert("Title is required"); setSaving(false); return; }
      const slug = title.trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u1000-\u109f]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 120);
      const { data, error } = await supabase.from("history_topics").insert({
        title: title.trim(), slug,
        summary, content,
        category_id: categoryId || null,
        period_label: periodLabel, year_start: yearStart,
        location, authenticity_status: status,
        is_published: true,
        admin_note: adminNote || null,
      }).select("*, categories(name, slug)").single();
      if (error) { setSaveError("Create error: " + error.message); setSaving(false); return; }
      if (data) {
        const normalized = {
          id: data.id, slug: data.slug,
          category: data.categories?.slug || data.category_slug || "history",
          label: data.categories?.name || data.category_name || "ရာဇဝင်",
          title: data.title, period: data.period_label || "တောင်ငူခေတ်",
          year: data.year_start || "", location: data.location || "",
          status: data.authenticity_status || "unverified",
          summary: data.summary || "", content: data.content || "",
          cover: data.cover_image_url || "",
          votes: data.votes || { true: 0, false: 0, disputed: 0, needs_more_evidence: 0 },
          sources: data.sources || [],
        };
        onSave(normalized);
      }
      setSaving(false);
      return;
    }

    const snapshot = { title: topic.title, summary: topic.summary, content: topic.content, status: topic.status };
    const { error } = await supabase.rpc("admin_update_topic", {
      p_id: topic.id, p_title: title, p_summary: summary, p_content: content,
      p_authenticity_status: status, p_admin_note: adminNote || null,
      p_previous_snapshot: snapshot, p_correction_note: correctionNote.trim() || null,
    });
    if (error) { setSaveError("Save error: " + error.message); setSaving(false); return; }
    onSave({ ...topic, title, summary, content, status, admin_note: adminNote, period: periodLabel, year: yearStart, location, category_id: categoryId });
    setCorrectionNote(""); setSaving(false);
  }

  return (
    <form className="admin-editor" onSubmit={handleSave}>
      <div className="editor-header">
        <h2>{isNew ? (t.admin.newTopic || "New Topic") : (t.admin.editing + " — " + topic.title)}</h2>
        {!isNew && <button className="text-icon-button" type="button" onClick={onBack}><Icon>arrow_back</Icon> {t.admin.back || "Back"}</button>}
      </div>
      {saveError && <p className="error-message">{saveError}</p>}
      <div className="editor-grid">
        <label>{t.admin.title}<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
        <label>{t.admin.status}<select value={status} onChange={(e) => setStatus(e.target.value)}>
          {Object.entries(statusMeta).map(([key, meta]) => (<option key={key} value={key}>{meta.label}</option>))}
        </select></label>
        <label>{t.admin.category || "Category"}<select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">—</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select></label>
        <label>{t.admin.period || "Period"}<input value={periodLabel} onChange={(e) => setPeriodLabel(e.target.value)} placeholder="e.g. တောင်ငူခေတ်" /></label>
        <label>{t.admin.year || "Year"}<input value={yearStart} onChange={(e) => setYearStart(e.target.value)} placeholder="e.g. ၁၅၃၀" /></label>
        <label>{t.admin.location || "Location"}<input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. တောင်ငူ" /></label>
      </div>
      <label>{t.admin.summary}<textarea rows="3" value={summary} onChange={(e) => setSummary(e.target.value)} /></label>
      <label>{t.admin.content}<textarea rows="10" value={content} onChange={(e) => setContent(e.target.value)} /></label>
      <label>{t.admin.adminNote}<textarea rows="2" value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder={t.admin.adminNotePlaceholder} /></label>
      {!isNew && <label>{t.admin.correctionNote}<textarea rows="2" value={correctionNote} onChange={(e) => setCorrectionNote(e.target.value)} placeholder={t.admin.correctionPlaceholder} /></label>}
      <div className="editor-actions">
        <button className="primary-button" type="submit" disabled={saving}>{saving ? t.admin.saving : (isNew ? (t.admin.create || "Create") : t.admin.save)}</button>
      </div>
    </form>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.from("profiles").select("*").order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("Users fetch error:", error);
        if (data) setUsers(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="muted">Loading users...</p>;

  return (
    <div className="admin-list">
      <h2>Users ({users.length})</h2>
      {users.length === 0 && <p className="muted">No users found.</p>}
      {users.map((u) => (
        <div className="admin-row" key={u.id}>
          <div>
            <span>{u.display_name || u.id?.slice(0, 8) || "—"}</span>
            <p className="muted small">{u.role || "member"} · {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</p>
          </div>
          <div className="admin-row-actions">
            <span className={`status-badge ${u.is_banned ? "danger" : "good"}`}>{u.is_banned ? "Banned" : "Active"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CommentsTab({ onNavigateTopic }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    (async () => {
      const { data, error } = await supabase.rpc("admin_get_comments");
      if (error) console.error("Comments fetch error:", error);
      if (data) setComments(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="muted">Loading comments...</p>;

  return (
    <div className="admin-list">
      <h2>Comments ({comments.length})</h2>
      {comments.length === 0 && <p className="muted">No comments yet.</p>}
      {comments.slice(0, 50).map((c) => (
        <div className="admin-row comment-preview" key={c.id}>
          <div>
            <strong className="small">{c.author_name || c.user_id?.slice(0, 8) || "—"}</strong>
            <p className="muted small" style={{ marginTop: 4 }}>{c.body?.slice(0, 120)}{c.body?.length > 120 ? "..." : ""}</p>
            <p className="muted small" style={{ fontSize: "0.7rem", marginTop: 2 }}>
              Topic: {c.topic_title ? (
                <button className="link-button" type="button" onClick={() => onNavigateTopic && onNavigateTopic(c.topic_slug)}>{c.topic_title?.slice(0, 40)}</button>
              ) : "—"}
            </p>
          </div>
          <span className="muted small">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</span>
        </div>
      ))}
    </div>
  );
}

const EVIDENCE_STATUSES = [
  { key: "pending", label: "Pending", tone: "warn" },
  { key: "visible", label: "Visible", tone: "good" },
  { key: "accepted", label: "Accepted", tone: "good", icon: "check" },
  { key: "rejected", label: "Rejected", tone: "danger" },
  { key: "hidden", label: "Hidden", tone: "danger" },
];

function EvidenceTab({ onNavigateTopic }) {
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    (async () => {
      const { data, error } = await supabase.rpc("admin_get_evidence");
      if (error) console.error("Evidence fetch error:", error);
      if (data) setReasons(data);
      setLoading(false);
    })();
  }, []);

  async function handleStatusChange(id, newStatus) {
    setUpdating(id);
    const { error } = await supabase.rpc("admin_update_evidence_status", { p_id: id, p_status: newStatus });
    if (error) { alert("Status change error: " + error.message); setUpdating(null); return; }
    setReasons((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    setUpdating(null);
  }

  if (loading) return <p className="muted">Loading evidence...</p>;

  function statusButtons(currentStatus, id) {
    const transitions = {
      pending: ["visible", "accepted", "rejected"],
      visible: ["hidden", "accepted", "rejected"],
      accepted: ["visible", "rejected"],
      rejected: ["pending", "visible"],
      hidden: ["visible", "accepted"],
    };
    const next = transitions[currentStatus] || [];
    return next.map((s) => (
      <button key={s} className={`status-action ${s}`} type="button" disabled={updating === id} onClick={() => handleStatusChange(id, s)}>
        {EVIDENCE_STATUSES.find((es) => es.key === s)?.label || s}
      </button>
    ));
  }

  return (
    <div className="admin-list">
      <h2>Evidence ({reasons.length})</h2>
      {reasons.length === 0 && <p className="muted">No evidence submitted yet.</p>}
      {reasons.map((r) => (
        <div className="admin-row evidence-row" key={r.id}>
          <div className="evidence-body">
            <span>{r.body?.slice(0, 200)}</span>
            <p className="muted small">{r.position} · {r.author_name || "—"}</p>
            <p className="muted small" style={{ fontSize: "0.7rem", marginTop: 2 }}>
              Topic: {r.topic_title ? (
                <button className="link-button" type="button" onClick={() => onNavigateTopic && onNavigateTopic(r.topic_slug)}>{r.topic_title?.slice(0, 50)}</button>
              ) : "—"}
            </p>
            {r.source_title && <p className="muted small" style={{ fontSize: "0.7rem" }}>Source: {r.source_title}</p>}
          </div>
          <div className="evidence-actions">
            <span className={`status-badge ${r.status === "accepted" ? "good" : r.status === "rejected" ? "danger" : "warn"}`}>{r.status}</span>
            <div className="evidence-status-buttons">
              {statusButtons(r.status, r.id)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminDashboard({ topics, onSaveTopic, onNewTopic, user, onNavigateTopic }) {
  const { t } = useLang();
  const isAuthorized = isAdminEmail(user?.email);
  const [tab, setTab] = useState("dashboard");
  const [editingTopic, setEditingTopic] = useState(null);
  const [newTopicMode, setNewTopicMode] = useState(false);

  if (!isAuthorized) {
    return (
      <section className="admin-page page-shell">
        <div className="page-heading">
          <p className="eyebrow">{t.admin.restricted}</p>
          <h1>{t.admin.restricted}</h1>
          <p>{t.admin.restrictedHint}</p>
        </div>
      </section>
    );
  }

  const reviewTopics = topics.filter((topic) => ["needs_review", "disputed"].includes(topic.status));

  function handleEdit(topic) { setEditingTopic(topic); setNewTopicMode(false); setTab("editor"); }

  function handleNew() {
    setNewTopicMode(true);
    setEditingTopic({ title: "", summary: "", content: "", status: "unverified", admin_note: "", period: "", year: "", location: "", category_id: "" });
    setTab("editor");
  }

  function handleSave(updated) {
    if (newTopicMode) {
      onNewTopic(updated);
      setNewTopicMode(false);
      setEditingTopic(null);
      setTab("topics");
    } else {
      onSaveTopic(updated);
      setEditingTopic(null);
      setTab("topics");
    }
  }

  function handleBack() {
    setNewTopicMode(false);
    setEditingTopic(null);
    setTab("topics");
  }

  function handleNavigateTopic(slug) {
    if (onNavigateTopic) onNavigateTopic(slug);
  }

  return (
    <section className="admin-page page-shell">
      <div className="admin-tabs">
        <button className={tab === "dashboard" ? "admin-tab active" : "admin-tab"} type="button" onClick={() => setTab("dashboard")}>Dashboard</button>
        <button className={tab === "topics" ? "admin-tab active" : "admin-tab"} type="button" onClick={() => { setTab("topics"); setEditingTopic(null); setNewTopicMode(false); }}>{t.admin.topics}</button>
        <button className={tab === "users" ? "admin-tab active" : "admin-tab"} type="button" onClick={() => setTab("users")}>Users</button>
        <button className={tab === "comments" ? "admin-tab active" : "admin-tab"} type="button" onClick={() => setTab("comments")}>Comments</button>
        <button className={tab === "evidence" ? "admin-tab active" : "admin-tab"} type="button" onClick={() => setTab("evidence")}>Evidence</button>
        {editingTopic && tab === "editor" && <button className="admin-tab active" type="button">{newTopicMode ? (t.admin.newTopic || "New Topic") : ("✏️ " + editingTopic.title)}</button>}
      </div>
      {tab === "dashboard" && (
        <>
          <div className="page-heading">
            <p className="eyebrow">{t.admin.dashboard}</p>
            <h1>{t.admin.dashboardTitle}</h1>
          </div>
          <div className="metrics-grid">
            <div className="metric-card"><span>{topics.length}</span><p>{t.admin.totalTopics}</p></div>
            <div className="metric-card danger"><span>{reviewTopics.length}</span><p>{t.admin.needsReview}</p></div>
          </div>
          <div className="admin-list">
            <h2>{t.admin.reviewQueue}</h2>
            {reviewTopics.map((topic) => (
              <button className="admin-row" type="button" key={topic.id} onClick={() => handleEdit(topic)}>
                <span>{topic.title}</span>
                <strong>{statusMeta[topic.status]?.label}</strong>
              </button>
            ))}
          </div>
        </>
      )}
      {tab === "topics" && <AdminTopicsList topics={topics} onEdit={handleEdit} onNew={handleNew} />}
      {tab === "editor" && editingTopic && <TopicEditor topic={editingTopic} onSave={handleSave} onBack={handleBack} />}
      {tab === "users" && <UsersTab />}
      {tab === "comments" && <CommentsTab onNavigateTopic={handleNavigateTopic} />}
      {tab === "evidence" && <EvidenceTab onNavigateTopic={handleNavigateTopic} />}
    </section>
  );
}
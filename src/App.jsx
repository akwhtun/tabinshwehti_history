import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { AuthModal } from "./components/AuthModal";
import { Header } from "./components/Header";
import { supabase } from "./lib/supabase";
import { statusMeta } from "./data/constants";
import { isAdminEmail } from "./config";
import { useLang } from "./i18n/index.jsx";
import { Home } from "./pages/Home";
import { TopicsArchive } from "./pages/TopicsArchive";
import { TopicDetail } from "./pages/TopicDetail";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";



function normalizeTopic(row) {
  return {
    id: row.id,
    slug: row.slug,
    category: row.categories?.slug || row.category_slug || "history",
    label: row.categories?.name || row.category_name || "ရာဇဝင်",
    title: row.title,
    period: row.period_label || "တောင်ငူခေတ်",
    year: row.year_start || "",
    location: row.location || "",
    status: row.authenticity_status || "unverified",
    summary: row.summary || "",
    content: row.content || "",
    cover: row.cover_image_url || "",
    votes: row.votes || { true: 0, false: 0, disputed: 0, needs_more_evidence: 0 },
    sources: row.sources || [],
  };
}

function App() {
  const { t } = useLang();
  const [view, setView] = useState("home");
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [remoteNotice, setRemoteNotice] = useState("");

  const [topicComments, setTopicComments] = useState([]);
  const [topicReasons, setTopicReasons] = useState([]);
  const [userVote, setUserVote] = useState(null);
  const [pendingSlug, setPendingSlug] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const updateUrl = useCallback((newView, topic) => {
    let hash = "";
    if (newView === "admin") hash = "#admin";
    else if (newView === "topics") hash = "#topics";
    else if (newView === "detail" && topic) hash = `#topic/${topic.slug}`;
    else if (newView === "about") hash = "#about";
    else if (newView === "contact") hash = "#contact";
    else if (newView === "privacy") hash = "#privacy";
    else if (newView === "terms") hash = "#terms";
    try { history.replaceState(null, "", window.location.pathname + window.location.search + hash); }
    catch {}
  }, []);

  useEffect(() => {
    let mounted = true;

    const hash = window.location.hash.slice(1);
    if (hash === "admin") setView("admin");
    else if (hash === "topics") setView("topics");
    else if (hash === "about") setView("about");
    else if (hash === "contact") setView("contact");
    else if (hash === "privacy") setView("privacy");
    else if (hash === "terms") setView("terms");
    else if (hash.startsWith("topic/")) {
      setPendingSlug(hash.replace("topic/", ""));
    }

    async function boot() {
      if (!supabase) {
        if (mounted) setRemoteNotice("Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local");
        return;
      }

      const session = await supabase.auth.getSession();
      const u = session.data.session?.user || null;
      if (mounted) setUser(u);
      if (u) await ensureProfile(supabase, u);

      const { data, error } = await supabase
        .from("history_topics")
        .select("*, categories(name, slug)")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (!mounted) return;
      if (error) {
        setRemoteNotice("Failed to load topics: " + error.message);
      } else if (data?.length) {
        const mapped = data.map(normalizeTopic);
        setTopics(mapped);
      } else {
        setRemoteNotice("No published topics found in the database.");
      }
      if (mounted) setDataLoaded(true);
    }

    const { data: listener } = supabase
      ? supabase.auth.onAuthStateChange((_event, sessionValue) => {
          if (!mounted) return;
          const u = sessionValue?.user || null;
          setUser(u);
          if (u) ensureProfile(supabase, u);
        })
      : { subscription: { unsubscribe: () => {} } };

    boot();
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!pendingSlug || topics.length === 0) return;
    const found = topics.find((t) => t.slug === pendingSlug);
    if (found) {
      setSelectedTopic(found);
      setView("detail");
    }
    setPendingSlug(null);
  }, [pendingSlug, topics]);

  // Sync selectedTopic when topics array is updated (e.g. admin edits status)
  useEffect(() => {
    if (!selectedTopic) return;
    const updated = topics.find((t) => t.id === selectedTopic.id);
    if (updated && (updated.status !== selectedTopic.status || updated.votes !== selectedTopic.votes)) {
      setSelectedTopic(updated);
    }
  }, [topics]);

  const loadTopicDataRef = useRef(null);

  useEffect(() => {
    if (!selectedTopic) return;
    let mounted = true;
    let interval;

    async function loadTopicData() {
      if (!supabase) return;
      try {
        const [commentsRes, reasonsRes] = await Promise.all([
          supabase.from("comments")
            .select("*, profiles(display_name)")
            .eq("topic_id", selectedTopic.id)
            .eq("status", "visible")
            .order("created_at", { ascending: false }),
          supabase.rpc("get_topic_reasons", { p_topic_id: selectedTopic.id }),
        ]);

        if (!mounted) return;

        const comments = (commentsRes.data || []).map((c) => ({
          ...c,
          author: c.profiles?.display_name || c.user_id?.slice(0, 8) || "Member",
        }));
        const reasons = (reasonsRes.data || []).map((r) => ({
          ...r,
          author: r.author || r.user_id?.slice(0, 8) || "Member",
        }));
        setTopicComments(comments);
        setTopicReasons(reasons);

        if (user) {
          const { data: voteData } = await supabase
            .from("topic_votes")
            .select("vote")
            .eq("topic_id", selectedTopic.id)
            .eq("user_id", user.id)
            .maybeSingle();
          if (mounted) setUserVote(voteData?.vote || null);
        }
      } catch (e) {
        if (mounted) console.warn("loadTopicData error:", e);
      }
    }

    loadTopicDataRef.current = loadTopicData;
    loadTopicData();
    interval = setInterval(loadTopicData, 30000);
    const onFocus = () => { if (document.visibilityState !== "hidden") loadTopicData(); };
    document.addEventListener("visibilitychange", onFocus);
    return () => { mounted = false; clearInterval(interval); document.removeEventListener("visibilitychange", onFocus); };
  }, [selectedTopic?.id, user?.id]);

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const matchesCategory = activeCategory === "all" || topic.category === activeCategory;
      const searchText = `${topic.title} ${topic.summary} ${topic.content} ${topic.period} ${topic.location}`.toLowerCase();
      const matchesQuery = !query.trim() || searchText.includes(query.trim().toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query, topics]);

  function navigate(nextView) {
    if (nextView === "home") { setView("home"); updateUrl("home"); }
    else if (nextView === "topics" || nextView === "history") { setView("topics"); setActiveCategory("all"); updateUrl("topics"); }
    else if (["war", "culture", "evidence"].includes(nextView)) { setActiveCategory(nextView); setView("topics"); updateUrl("topics"); }
    else if (nextView === "admin") { setView("admin"); updateUrl("admin"); }
    else if (nextView === "about") { setView("about"); updateUrl("about"); }
    else if (nextView === "contact") { setView("contact"); updateUrl("contact"); }
    else if (nextView === "privacy") { setView("privacy"); updateUrl("privacy"); }
    else if (nextView === "terms") { setView("terms"); updateUrl("terms"); }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openTopic(topic) {
    setSelectedTopic(topic);
    setView("detail");
    updateUrl("detail", topic);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setUserVote(null);
    setView("home");
    updateUrl("home");
  }

  async function submitVote(vote) {
    if (!user) { setAuthOpen(true); return; }
    if (!supabase || !selectedTopic) return;

    const { data: newVotes, error } = await supabase.rpc("cast_vote", {
      p_topic_id: selectedTopic.id,
      p_vote: vote,
    });

    if (error) {
      setRemoteNotice("Vote failed: " + error.message);
      return;
    }

    setUserVote(vote);
    setSelectedTopic((prev) => ({ ...prev, votes: newVotes }));
    setTopics((prev) => prev.map((t) => (t.id === selectedTopic.id ? { ...t, votes: newVotes } : t)));
  }

  async function submitReason(reason) {
    if (!user) { setAuthOpen(true); return; }
    if (!supabase || !selectedTopic) return;

    await ensureProfile(supabase, user);

    const { error } = await supabase.from("topic_reasons").insert({
      topic_id: selectedTopic.id,
      user_id: user.id,
      position: reason.position,
      body: reason.body,
      source_title: reason.sourceTitle || "",
      source_url: reason.sourceUrl || "",
      status: "pending",
    });

    if (error) {
      setRemoteNotice("Failed to submit evidence: " + error.message);
      return;
    }

    if (loadTopicDataRef.current) loadTopicDataRef.current();
  }

  async function submitComment(body, parentId = null) {
    if (!user) { setAuthOpen(true); return; }
    if (!supabase || !selectedTopic) return;

    await ensureProfile(supabase, user);

    const { error } = await supabase.from("comments").insert({
      topic_id: selectedTopic.id,
      user_id: user.id,
      body,
      parent_id: parentId,
    });

    if (error) {
      setRemoteNotice("Failed to post comment: " + error.message);
      return;
    }

    const newComment = {
      id: crypto.randomUUID(),
      topic_id: selectedTopic.id,
      user_id: user.id,
      body,
      parent_id: parentId,
      created_at: new Date().toISOString(),
      author: user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Member",
    };
    setTopicComments((prev) => [newComment, ...prev]);
  }

  async function ensureProfile(supabase, user) {
    if (isAdminEmail(user.email)) {
      // Use security-definer RPC to bypass RLS chicken-and-egg
      await supabase.rpc("sync_admin_role", { p_admin_email: user.email });
    } else {
      const { data: existing } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
      if (!existing) {
        await supabase.from("profiles").insert({
          id: user.id,
          display_name: user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Member",
          role: "member",
        });
      }
    }
  }

  function shareTopic(topic) {
    const url = `${window.location.origin}${window.location.pathname}#topic/${topic.slug}`;
    if (navigator.share) { navigator.share({ title: topic.title, text: topic.summary, url }); }
    else { navigator.clipboard?.writeText(url); setRemoteNotice(t.detail.shared); }
  }

  async function downloadPdf(topic) {
    const meta = statusMeta[topic.status] || statusMeta.unverified;
    const pdfDate = new Date().toLocaleDateString("en-CA");

    function esc(str) {
      return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    }

    const ttl = esc(topic.title);
    const period = esc(topic.period);
    const loc = esc(topic.location);
    const lbl = esc(meta.label);
    const content = esc(topic.content);
    const coverUrl = topic.cover || "";

    try {
      setRemoteNotice("Preparing PDF…");

      const paragraphs = content.split(/\n\n+/).filter(Boolean);

      const html = `<!DOCTYPE html>
<html lang="my">
<head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Myanmar:wght@400;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Noto Serif Myanmar',serif;width:210mm;padding:8mm 12mm;color:#1d1a13;line-height:2;font-size:11pt}
.cover{text-align:center;margin-bottom:6mm}
.cover img{max-width:186mm;height:auto}
.header{font-size:8pt;color:#999;margin-bottom:3mm}
.title{font-size:16pt;font-weight:700;color:#6d5200;margin-bottom:4mm}
.meta{color:#665;font-size:9pt;margin-bottom:10mm}
.content p{margin-bottom:3mm;text-align:justify}
.footer{margin-top:12mm;font-size:7pt;color:#999;border-top:0.5pt solid #ddd;padding-top:3mm}
</style>
</head><body>
${coverUrl ? '<div class="cover"><img src="' + coverUrl + '" crossorigin="anonymous"></div>' : ''}
<div class="header">Tabinshwehti Historical Archive</div>
<div class="title">${ttl}</div>
<div class="meta">${period}${loc ? ' | ' + loc : ''} | ${lbl}</div>
<div class="content">${paragraphs.map(p => '<p>' + p.replace(/\n/g, '<br>') + '</p>').join('')}</div>
<div class="footer">Generated: ${pdfDate} &middot; Tabinshwehti Historical Archive</div>
</body></html>`;

      const iframe = document.createElement("iframe");
      iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:210mm;height:1px;border:none";
      document.body.appendChild(iframe);
      const iDoc = iframe.contentDocument;
      iDoc.open();
      iDoc.write(html);
      iDoc.close();

      await Promise.all([
        iDoc.fonts.ready,
        new Promise(r => { iframe.onload = r; }),
        new Promise(r => setTimeout(r, 1500)),
      ]);

      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(iDoc.body, {
        scale: 4, useCORS: true, logging: false,
        width: iDoc.body.scrollWidth,
        height: iDoc.body.scrollHeight,
      });

      document.body.removeChild(iframe);

      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = 210;
      const pageH = 297;
      const imgData = canvas.toDataURL("image/jpeg", 0.85);
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;
      let y = 0;
      for (let first = true; y > -imgH || first; y -= pageH, first = false) {
        if (!first) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, y, imgW, imgH);
      }
      pdf.save((topic.slug || "tabinshwehti") + ".pdf");
      setRemoteNotice("");
    } catch (e) {
      setRemoteNotice("PDF download failed: " + e.message);
    }
  }

  return (
    <>
      <Header activeView={view} onNavigate={navigate} user={user} onAuthClick={() => setAuthOpen(true)} onLogout={logout} />
      {remoteNotice && <button className="notice-bar" type="button" onClick={() => setRemoteNotice("")}>{remoteNotice}</button>}
      <main>
        {view === "home" && <Home topics={topics} onOpen={openTopic} onNavigate={navigate} onAuthClick={() => setAuthOpen(true)} />}
        {view === "topics" && <TopicsArchive topics={filteredTopics} activeCategory={activeCategory} query={query} setQuery={setQuery} setActiveCategory={setActiveCategory} onOpen={openTopic} onPdf={downloadPdf} />}
        {view === "detail" && selectedTopic && <TopicDetail topic={selectedTopic} comments={topicComments} reasons={topicReasons} selectedVote={userVote} user={user} onBack={() => { setView("topics"); updateUrl("topics"); }} onVote={submitVote} onReason={submitReason} onComment={submitComment} onAuthClick={() => setAuthOpen(true)} onPdf={downloadPdf} onShare={shareTopic} />}
        {view === "admin" && <AdminDashboard topics={topics} onSaveTopic={(updated) => setTopics((prev) => prev.map((t) => t.id === updated.id ? updated : t))} onNewTopic={(topic) => setTopics((prev) => [topic, ...prev])} user={user} onNavigateTopic={(slug) => { const found = topics.find((t) => t.slug === slug); if (found) { setSelectedTopic(found); setView("detail"); updateUrl("detail", found); } }} />}
        {view === "about" && <AboutPage />}
        {view === "contact" && <ContactPage />}
        {view === "privacy" && <PrivacyPage />}
        {view === "terms" && <TermsPage />}
      </main>
      <Footer onNavigate={navigate} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

function Footer({ onNavigate }) {
  const { t } = useLang();
  return (
    <footer className="site-footer">
      <strong>တပင်ရွှေထီး မင်းတရားကြီး</strong>
      <nav>
        <button className="footer-link" type="button" onClick={() => onNavigate("contact")}>{t.footer.contact}</button>
        <button className="footer-link" type="button" onClick={() => onNavigate("privacy")}>{t.footer.privacy}</button>
        <button className="footer-link" type="button" onClick={() => onNavigate("terms")}>{t.footer.terms}</button>
        <button className="footer-link" type="button" onClick={() => onNavigate("about")}>{t.nav.about}</button>
      </nav>
      <p>© ၂၀၂၆ {t.footer.copyright}</p>
    </footer>
  );
}

export default App;

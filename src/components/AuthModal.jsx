import { useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { adminEmails } from "../config";
import { Icon } from "./Icon";
import { useLang } from "../i18n/index.jsx";

export function AuthModal({ open, onClose }) {
  const { t } = useLang();
  const [mode, setMode] = useState("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ type: "idle", text: "" });
  const passwordRef = useRef(null);

  if (!open) return null;

  const adminEmail = adminEmails[0] || "";
  const isAdminMode = email === adminEmail && adminEmail !== "";

  async function ensureAdminRole(userId) {
    if (!supabase || !isAdminMode) return;
    await supabase.from("profiles").upsert(
      { id: userId, display_name: displayName || email.split("@")[0], role: "admin" },
      { onConflict: "id" },
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!supabase) { setStatus({ type: "error", text: t.auth.noConfig }); return; }

    setStatus({ type: "loading", text: t.auth.loading });
    const payload = { email, password };
    const response = mode === "register"
      ? await supabase.auth.signUp({ ...payload, options: { data: { display_name: displayName || email.split("@")[0] }, redirectTo: window.location.origin } })
      : await supabase.auth.signInWithPassword(payload);

    if (response.error) {
      let msg = response.error.message;
      if (msg.toLowerCase().includes("invalid") && msg.toLowerCase().includes("email")) {
        msg = `${t.auth.emailInvalid} (လက်ရှိ: ${adminEmail})`;
      }
      setStatus({ type: "error", text: msg }); return;
    }
    if (response.data?.user) await ensureAdminRole(response.data.user.id);

    setStatus({
      type: "success",
      text: mode === "register" ? t.auth.registered : isAdminMode ? t.auth.adminLoggedIn : t.auth.loggedIn,
    });
    if (mode === "login") onClose();
  }

  function handleAdminClick() {
    setEmail(adminEmail); setMode("login"); setStatus({ type: "idle", text: "" });
    setTimeout(() => passwordRef.current?.focus(), 50);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="auth-modal">
        <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Close"><Icon>close</Icon></button>
        <p className="eyebrow">Tabinshwehti Archive</p>
        <h2>{isAdminMode ? (mode === "login" ? t.auth.adminLogin : t.auth.adminRegister) : mode === "login" ? t.auth.login : t.auth.register}</h2>
        <p className="muted">{isAdminMode ? t.auth.adminHint : t.auth.memberHint}</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>{t.auth.displayName}<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Admin" /></label>
          )}
          <label>{t.auth.email}<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} readOnly={isAdminMode} className={isAdminMode ? "readonly-field" : ""} /></label>
          <label>{t.auth.password}<input ref={passwordRef} required type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {status.text && <p className={`form-status ${status.type}`}>{status.text}</p>}
          <button className="primary-button full" type="submit" disabled={status.type === "loading"}>
            {mode === "login" ? t.auth.submitLogin : t.auth.submitRegister}
          </button>
        </form>
        <div className="auth-links">
          {isAdminMode ? (
            <>
              <button className="text-button" type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
                {mode === "login" ? t.auth.switchToRegister : t.auth.switchToLogin}
              </button>
              <button className="text-button" type="button" onClick={() => { setEmail(""); setMode("login"); setStatus({ type: "idle", text: "" }); }}>
                <Icon>arrow_back</Icon>{t.auth.backToMember}
              </button>
            </>
          ) : (
            <>
              <button className="text-button" type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
                {mode === "login" ? t.auth.switchToRegister : t.auth.switchToLogin}
              </button>
              {adminEmail && mode === "login" && (
                <button className="text-button admin-login-link" type="button" onClick={handleAdminClick}>
                  <Icon>shield</Icon>{t.auth.adminLink}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

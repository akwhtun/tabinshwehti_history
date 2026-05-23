import { useState } from "react";
import { useLang } from "../i18n/index.jsx";

export function ReasonForm({ user, onSubmit, onAuthClick }) {
  const { t } = useLang();
  const [position, setPosition] = useState("supports");
  const [body, setBody] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!user) { onAuthClick(); return; }
    if (!body.trim()) return;
    onSubmit({ position, body, sourceTitle, sourceUrl });
    setBody(""); setSourceTitle(""); setSourceUrl("");
  }

  return (
    <form className="panel reason-form" onSubmit={handleSubmit}>
      <div className="panel-heading">
        <p className="eyebrow">Evidence Reason</p>
        <h3>{t.reason.heading}</h3>
      </div>
      <label>
        {t.reason.view}
        <select value={position} onChange={(event) => setPosition(event.target.value)}>
          <option value="supports">{t.reason.supports}</option>
          <option value="challenges">{t.reason.challenges}</option>
          <option value="disputes">{t.reason.disputes}</option>
          <option value="context">{t.reason.context}</option>
        </select>
      </label>
      <label>
        {t.reason.body}
        <textarea rows="4" value={body} onChange={(event) => setBody(event.target.value)} placeholder={t.reason.bodyPlaceholder} />
      </label>
      <div className="form-grid">
        <label>{t.reason.sourceTitle}<input value={sourceTitle} onChange={(event) => setSourceTitle(event.target.value)} /></label>
        <label>{t.reason.sourceUrl}<input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} /></label>
      </div>
      <button className="primary-button" type="submit">{t.reason.submit}</button>
    </form>
  );
}

import { useLang } from "../i18n/index.jsx";
import { Icon } from "../components/Icon";

export function ContactPage() {
  const { t } = useLang();
  return (
    <section className="page-shell static-page">
      <div className="page-heading">
        <p className="eyebrow">{t.contact.title}</p>
        <h1>{t.contact.heading}</h1>
      </div>
      <p className="article-body" style={{ marginBottom: 28 }}>{t.contact.intro}</p>
      <div className="contact-info">
        <div className="source-row">
          <Icon>mail</Icon>
          <div>
            <strong>{t.contact.email}</strong>
            <span>akwhtun@gmail.com</span>
          </div>
        </div>
      </div>
      <p className="muted small" style={{ marginTop: 18 }}>{t.contact.response}</p>
    </section>
  );
}

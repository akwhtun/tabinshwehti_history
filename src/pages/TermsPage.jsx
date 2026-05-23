import { useLang } from "../i18n/index.jsx";
import { Icon } from "../components/Icon";

export function TermsPage() {
  const { t } = useLang();
  return (
    <section className="page-shell static-page">
      <div className="page-heading">
        <p className="eyebrow">{t.terms.title}</p>
        <h1>{t.terms.heading}</h1>
      </div>
      <p className="article-body">{t.terms.intro}</p>
      <div className="about-grid">
        <div className="about-card">
          <Icon>check_circle</Icon>
          <h3>{t.terms.accept}</h3>
          <p>{t.terms.acceptText}</p>
        </div>
        <div className="about-card">
          <Icon>gavel</Icon>
          <h3>{t.terms.conduct}</h3>
          <p>{t.terms.conductText}</p>
        </div>
        <div className="about-card">
          <Icon>article</Icon>
          <h3>{t.terms.content}</h3>
          <p>{t.terms.contentText}</p>
        </div>
        <div className="about-card">
          <Icon>update</Icon>
          <h3>{t.terms.changes}</h3>
          <p>{t.terms.changesText}</p>
        </div>
      </div>
    </section>
  );
}

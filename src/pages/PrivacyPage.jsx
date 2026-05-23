import { useLang } from "../i18n/index.jsx";
import { Icon } from "../components/Icon";

export function PrivacyPage() {
  const { t } = useLang();
  return (
    <section className="page-shell static-page">
      <div className="page-heading">
        <p className="eyebrow">{t.privacy.title}</p>
        <h1>{t.privacy.heading}</h1>
      </div>
      <p className="article-body">{t.privacy.intro}</p>
      <div className="about-grid">
        <div className="about-card">
          <Icon>database</Icon>
          <h3>{t.privacy.data}</h3>
          <p>{t.privacy.dataText}</p>
        </div>
        <div className="about-card">
          <Icon>settings</Icon>
          <h3>{t.privacy.use}</h3>
          <p>{t.privacy.useText}</p>
        </div>
        <div className="about-card">
          <Icon>share</Icon>
          <h3>{t.privacy.share}</h3>
          <p>{t.privacy.shareText}</p>
        </div>
      </div>
    </section>
  );
}

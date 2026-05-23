import { useLang } from "../i18n/index.jsx";
import { Icon } from "../components/Icon";

export function AboutPage() {
  const { t } = useLang();
  return (
    <section className="page-shell static-page">
      <div className="page-heading">
        <p className="eyebrow">{t.about.title}</p>
        <h1>{t.about.heading}</h1>
      </div>
      <p className="article-body">{t.about.intro}</p>
      <div className="about-grid">
        <div className="about-card">
          <Icon>flag</Icon>
          <h3>{t.about.mission}</h3>
          <p>{t.about.missionText}</p>
        </div>
        <div className="about-card">
          <Icon>menu_book</Icon>
          <h3>{t.about.feature1}</h3>
          <p>{t.about.feature1Text}</p>
        </div>
        <div className="about-card">
          <Icon>group</Icon>
          <h3>{t.about.feature2}</h3>
          <p>{t.about.feature2Text}</p>
        </div>
        <div className="about-card">
          <Icon>description</Icon>
          <h3>{t.about.feature3}</h3>
          <p>{t.about.feature3Text}</p>
        </div>
      </div>
    </section>
  );
}

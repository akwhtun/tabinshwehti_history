import { Icon } from "../components/Icon";
import { statusMeta } from "../data/constants";
import { useLang } from "../i18n/index.jsx";

export function Home({ topics, onOpen, onNavigate, onAuthClick }) {
  const { t } = useLang();
  const featured = topics.slice(0, 3);
  const disputed = topics.length ? (topics.find((topic) => ["needs_review", "disputed"].includes(topic.status)) || topics[0]) : null;

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="royal-seal">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-dMraK-eHFXCkq9DY0NQCArMvBwZ24IxOg5hvZ70C7_8ZeeTEfbZQ6L3SeWf8pAVl-4JMOH61d7H_LP5c555LHZF4ga4U_0lcOn-wb_KYaJudu8sKjFFlIQXMPPzypO3pAE-1UUEEKM2TV1LVQ-L2rmENN71gjzfYxxyg--6Uj_HI3bad3vPpgzeF83vwJB4KDTKjx-6-110JQBhZ0iqwIcDEZNjVIDRU2aWTNsesdkGg4GSgg83iJI5es6U9Z5y9KF-3pfsVCUc"
              alt=""
            />
          </div>
          <p className="eyebrow">{t.home.eyebrow}</p>
          <h1>
            <span>{t.home.title1}</span>
            {" "}
            <span>{t.home.title2}</span>
          </h1>
          <p className="hero-copy">{t.home.subtitle}</p>
          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={() => onNavigate("topics")}>
              {t.home.browse}
              <Icon>arrow_right_alt</Icon>
            </button>
            <button className="outline-button" type="button" onClick={onAuthClick}>
              {t.home.join}
            </button>
          </div>
        </div>
      </section>
      {topics.length > 0 && <div className="kanote-divider" />}
      {topics.length > 0 && (
        <section className="featured-grid">
          {featured.map((topic, index) => (
            <button className={`feature-card feature-${index + 1}`} type="button" key={topic.id} onClick={() => onOpen(topic)}>
              <img src={topic.cover} alt="" />
              <span className="feature-category">{topic.label}</span>
              <span className={`status-badge ${statusMeta[topic.status]?.tone || "warn"}`}>{statusMeta[topic.status]?.label || topic.status}</span>
              <h2>{topic.title}</h2>
              <p>{topic.summary}</p>
            </button>
          ))}
        </section>
      )}
      {disputed && (
        <section className="review-callout">
          <div>
            <p className="eyebrow">{t.home.needsReview}</p>
            <h2>{disputed.title}</h2>
            <p>{disputed.summary}</p>
          </div>
          <button className="primary-button" type="button" onClick={() => onOpen(disputed)}>
            {t.home.review}
          </button>
        </section>
      )}
      <section className="legacy-quote">
        <Icon className="quote-icon" filled>format_quote</Icon>
        <blockquote>{t.home.quote}</blockquote>
      </section>
    </div>
  );
}

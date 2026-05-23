import { Icon } from "../components/Icon";
import { Comments } from "../components/Comments";
import { ReasonForm } from "../components/ReasonForm";
import { VotePanel } from "../components/VotePanel";
import { statusMeta, reasonStatusMeta } from "../data/constants";
import { useLang } from "../i18n/index.jsx";

export function TopicDetail({ topic, comments, reasons, selectedVote, user, onBack, onVote, onReason, onComment, onAuthClick, onPdf, onShare }) {
  const { t } = useLang();
  const meta = statusMeta[topic.status] || statusMeta.unverified;

  return (
    <article className="detail-page">
      <section className="detail-hero">
        <img src={topic.cover} alt="" />
        <div className="detail-hero-overlay">
          <button className="text-icon-button" type="button" onClick={onBack}>
            <Icon>arrow_back</Icon>
            {t.detail.back}
          </button>
          <span className={`status-badge ${meta.tone}`}>
            <Icon>{meta.icon}</Icon>{meta.label}
          </span>
          <h1>{topic.title}</h1>
          <p>{topic.summary}</p>
          <div className="detail-actions">
            <button className="primary-button" type="button" onClick={() => onPdf(topic)}>
              <Icon>download</Icon>{t.detail.pdf}
            </button>
            <button className="outline-button" type="button" onClick={() => onShare(topic)}>
              <Icon>share</Icon>{t.detail.share}
            </button>
          </div>
        </div>
      </section>
      <div className="detail-grid page-shell">
        <div className="article-column">
          <div className="article-meta">
            <span>{topic.period}</span>
            <span>{topic.location}</span>
            <span>{topic.label}</span>
          </div>
          <p className="article-body">{topic.content}</p>
          <section className="reasons-list">
            <h2>{t.detail.reasons}</h2>
            {reasons.length === 0 ? <p className="muted">{t.detail.noReasons}</p> : reasons.map((reason) => {
              const rMeta = reasonStatusMeta[reason.status] || reasonStatusMeta.pending;
              return (
              <article className="reason-card" key={reason.id}>
                <span className="reason-header">
                  <span>{reason.position}</span>
                  <span className={`status-badge ${rMeta.tone}`}>
                    <Icon>{rMeta.icon}</Icon>{t.reason[reason.status] || rMeta.label}
                  </span>
                </span>
                <p>{reason.body}</p>
                {(reason.source_title || reason.sourceTitle) && (
                  <strong>{(reason.source_title || reason.sourceTitle)}</strong>
                )}
                {(reason.source_url || reason.sourceUrl) && (
                  <><br /><a className="source-link" href={(reason.source_url || reason.sourceUrl)} target="_blank" rel="noopener">{(reason.source_url || reason.sourceUrl)}</a></>
                )}
              </article>
              );
            })}
          </section>
          <Comments comments={comments} user={user} onSubmit={onComment} onAuthClick={onAuthClick} />
        </div>
        <aside className="side-column">
          <VotePanel topic={topic} selectedVote={selectedVote} onVote={onVote} user={user} onAuthClick={onAuthClick} />
          <ReasonForm user={user} onSubmit={onReason} onAuthClick={onAuthClick} />
        </aside>
      </div>
    </article>
  );
}

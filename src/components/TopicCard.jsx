import { statusMeta } from "../data/constants";
import { Icon } from "./Icon";
import { useLang } from "../i18n/index.jsx";

export function getVoteTotal(votes = {}) {
  return Object.values(votes).reduce((sum, value) => sum + Number(value || 0), 0);
}

export function TopicCard({ topic, onOpen, onPdf }) {
  const { t } = useLang();
  const meta = statusMeta[topic.status] || statusMeta.unverified;
  const total = getVoteTotal(topic.votes);
  const truePercent = total ? Math.round((topic.votes.true / total) * 100) : 0;

  return (
    <article className="topic-card">
      <button className="topic-image-button" type="button" onClick={() => onOpen(topic)}>
        <img src={topic.cover} alt="" />
        <span className={`status-badge ${meta.tone}`}>
          <Icon>{meta.icon}</Icon>{meta.label}
        </span>
      </button>
      <div className="topic-card-body">
        <div className="topic-meta">
          <span>{topic.label}</span>
          <span>{topic.period}</span>
        </div>
        <button className="topic-title" type="button" onClick={() => onOpen(topic)}>{topic.title}</button>
        <p>{topic.summary}</p>
        <div className="vote-mini" aria-label={`True vote ${truePercent}%`}>
          <span style={{ width: `${truePercent}%` }} />
        </div>
        <div className="topic-actions">
          <button className="text-icon-button" type="button" onClick={() => onOpen(topic)}>
            <Icon>visibility</Icon>{t.topics.read}
          </button>
          <button className="text-icon-button muted-action" type="button" onClick={() => onPdf(topic)}>
            <Icon>download</Icon>{t.topics.pdf}
          </button>
          <span className="vote-count">{total} {t.topics.votes}</span>
        </div>
      </div>
    </article>
  );
}

import { voteOptions } from "../data/constants";
import { Icon } from "./Icon";
import { getVoteTotal } from "./TopicCard";
import { useLang } from "../i18n/index.jsx";

export function VotePanel({ topic, selectedVote, onVote, user, onAuthClick }) {
  const { t } = useLang();
  const total = getVoteTotal(topic.votes);

  return (
    <section className="panel vote-panel">
      <div className="panel-heading">
        <p className="eyebrow">Community Review</p>
        <h3>{t.vote.heading}</h3>
      </div>
      <div className="vote-options">
        {voteOptions.map((option) => {
          const count = Number(topic.votes[option.value] || 0);
          const percent = total ? Math.round((count / total) * 100) : 0;
          return (
            <button
              key={option.value}
              className={selectedVote === option.value ? "vote-button active" : "vote-button"}
              type="button"
              disabled={!user && option.value !== selectedVote}
              onClick={() => (user ? onVote(option.value) : onAuthClick())}
            >
              <span><Icon>{option.icon}</Icon>{t.vote[option.value] || option.label}</span>
              <strong>{percent}%</strong>
            </button>
          );
        })}
      </div>
      {!user && <p className="muted small">{t.vote.guest}</p>}
    </section>
  );
}

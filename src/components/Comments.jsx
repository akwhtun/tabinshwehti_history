import { useState } from "react";
import { Icon } from "./Icon";
import { useLang } from "../i18n/index.jsx";

function CommentItem({ comment, replies, user, onSubmitReply, onReport, onAuthClick, depth }) {
  const { t } = useLang();
  const [showReply, setShowReply] = useState(false);
  const [replyBody, setReplyBody] = useState("");

  function handleReply(event) {
    event.preventDefault();
    if (!user) { onAuthClick(); return; }
    if (!replyBody.trim()) return;
    onSubmitReply(replyBody, comment.id);
    setReplyBody(""); setShowReply(false);
  }

  return (
    <div className={`comment-thread ${depth > 0 ? "nested-reply" : ""}`}>
      <article className="comment">
        <div className="comment-header">
          <strong>{comment.author || "Member"}</strong>
          <span>{new Date(comment.created_at).toLocaleDateString("my-MM")}</span>
        </div>
        <p>{comment.body}</p>
        <div className="comment-actions">
          <button className="text-icon-button small-button" type="button" onClick={() => setShowReply(!showReply)}>
            <Icon>reply</Icon>{showReply ? t.detail.cancel : t.detail.reply}
          </button>
          <button className="text-icon-button small-button muted-action" type="button" onClick={() => onReport(comment)}>
            <Icon>flag</Icon>{t.detail.report}
          </button>
        </div>
      </article>
      {showReply && (
        <form className="reply-form" onSubmit={handleReply}>
          <textarea rows="2" value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder={t.detail.replyPlaceholder} />
          <button className="outline-button compact" type="submit">{t.detail.send}</button>
        </form>
      )}
      {replies.length > 0 && (
        <div className="replies">
          {replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} replies={[]} depth={depth + 1} user={user} onSubmitReply={onSubmitReply} onReport={onReport} onAuthClick={onAuthClick} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Comments({ comments, user, onSubmit, onAuthClick }) {
  const { t } = useLang();
  const [body, setBody] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!user) { onAuthClick(); return; }
    if (!body.trim()) return;
    onSubmit(body, null);
    setBody("");
  }

  function handleReply(body, parentId) { onSubmit(body, parentId); }

  function handleReport(comment) {
    const reason = prompt(t.auth.reportPrompt);
    if (reason && reason.trim()) { alert(t.auth.reportThanks); }
  }

  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = comments.filter((c) => c.parent_id);
  const getReplies = (parentId) => replies.filter((r) => r.parent_id === parentId);

  return (
    <section className="panel comments-panel">
      <div className="panel-heading">
        <p className="eyebrow">{t.detail.discussion}</p>
        <h3>{t.detail.comments}</h3>
      </div>
      <form className="comment-form" onSubmit={handleSubmit}>
        <textarea rows="3" value={body} onChange={(e) => setBody(e.target.value)} placeholder={user ? t.detail.commentPlaceholder : t.detail.commentPlaceholderGuest} />
        <button className="outline-button" type="submit"><Icon>send</Icon>{t.detail.send}</button>
      </form>
      <div className="comment-list">
        {comments.length === 0 ? <p className="muted">{t.detail.noComments}</p> : topLevel.map((comment) => (
          <CommentItem key={comment.id} comment={comment} replies={getReplies(comment.id)} depth={0} user={user} onSubmitReply={handleReply} onReport={handleReport} onAuthClick={onAuthClick} />
        ))}
      </div>
    </section>
  );
}

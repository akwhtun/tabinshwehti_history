import { Icon } from "../components/Icon";
import { TopicCard } from "../components/TopicCard";
import { categories } from "../data/constants";
import { useLang } from "../i18n/index.jsx";

export function TopicsArchive({ topics, activeCategory, query, setQuery, setActiveCategory, onOpen, onPdf }) {
  const { t } = useLang();

  return (
    <section className="archive-page page-shell">
      <div className="page-heading">
        <p className="eyebrow">{t.topics.records}</p>
        <h1>{t.topics.heading}</h1>
        <p>{t.topics.subtitle}</p>
      </div>
      <div className="search-row">
        <label className="search-field">
          <Icon>search</Icon>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.topics.search} />
        </label>
      </div>
      <div className="archive-layout">
        <aside className="category-panel">
          <h2>{t.topics.categories}</h2>
          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              className={activeCategory === category.id ? "category-button active" : "category-button"}
              onClick={() => setActiveCategory(category.id)}
            >
              <Icon>{category.icon}</Icon>
              {category.label}
            </button>
          ))}
        </aside>
        <div className="topic-list">
          {topics.map((topic) => (<TopicCard topic={topic} key={topic.id} onOpen={onOpen} onPdf={onPdf} />))}
          {topics.length === 0 && <p className="empty-state">{t.topics.noResults}</p>}
        </div>
      </div>
    </section>
  );
}

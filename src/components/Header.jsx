import { useState, useRef, useEffect } from "react";
import { Icon } from "./Icon";
import { isAdminEmail } from "../config";
import { useLang } from "../i18n/index.jsx";

const navItems = [
  { view: "home", key: "home" },
  { view: "topics", key: "topics" },
  { view: "about", key: "about" },
  { view: "admin", key: "admin" },
];

export function Header({ activeView, onNavigate, user, onAuthClick, onLogout }) {
  const { t, lang, setLang } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (headerRef.current && !headerRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Member";

  return (
    <header className="site-header" ref={headerRef}>
      <nav className="site-nav" aria-label="Primary navigation">
        <button className="brand" type="button" onClick={() => onNavigate("home")}>
          တပင်ရွှေထီး
        </button>
        <div className="desktop-nav">
          {navItems.map((item) => {
            if (item.view === "admin" && !isAdminEmail(user?.email)) return null;
            return (
              <button
                key={item.view}
                className={activeView === item.view ? "nav-link active" : "nav-link"}
                type="button"
                onClick={() => onNavigate(item.view)}
              >
                {t.nav[item.key]}
              </button>
            );
          })}
        </div>
        <div className="nav-actions">
          <button className="icon-button lang-toggle" type="button" onClick={() => setLang(lang === "my" ? "en" : "my")} title={lang === "my" ? "Switch to English" : "မြန်မာသို့ပြောင်းရန်"}>
            <span className="lang-label">{lang === "my" ? "EN" : "MY"}</span>
          </button>
          {user ? (
            <div className="user-menu-wrap">
              <button className="profile-pill" type="button" onClick={() => setMenuOpen(!menuOpen)} title={user.email}>
                <Icon>account_circle</Icon>
                <span className="user-name">{displayName}</span>
                <Icon>arrow_drop_down</Icon>
              </button>
            </div>
          ) : (
            <button className="outline-button compact" type="button" onClick={onAuthClick}>
              {t.nav.login}
            </button>
          )}
        </div>
      </nav>
      <div className="mobile-nav">
        <button className={activeView === "home" ? "mobile-tab active" : "mobile-tab"} type="button" onClick={() => onNavigate("home")}>
          <Icon>home</Icon>
          <span>{t.nav.home}</span>
        </button>
        <button className={activeView === "topics" ? "mobile-tab active" : "mobile-tab"} type="button" onClick={() => onNavigate("topics")}>
          <Icon>menu_book</Icon>
          <span>{t.nav.topics}</span>
        </button>
        <button className={activeView === "about" ? "mobile-tab active" : "mobile-tab"} type="button" onClick={() => onNavigate("about")}>
          <Icon>info</Icon>
          <span>{t.nav.about}</span>
        </button>
        <button className={activeView === "admin" ? "mobile-tab active" : "mobile-tab"} type="button" onClick={() => onNavigate("admin")} style={user && isAdminEmail(user.email) ? {} : { display: "none" }}>
          <Icon>shield</Icon>
          <span>{t.nav.admin}</span>
        </button>
        {user && (
          <button className="mobile-tab" type="button" onClick={() => setMenuOpen(!menuOpen)}>
            <Icon>account_circle</Icon>
            <span className="user-name">{displayName}</span>
          </button>
        )}
        <button className="mobile-tab" type="button" onClick={() => setLang(lang === "my" ? "en" : "my")}>
          <span className="lang-label">{lang === "my" ? "EN" : "MY"}</span>
        </button>
      </div>
      {menuOpen && user && (
        <div className={`dropdown-backdrop ${menuOpen ? "visible" : ""}`} onClick={() => setMenuOpen(false)}>
          <div className="user-dropdown" onClick={(e) => e.stopPropagation()}>
            <div className="dropdown-header">
              <strong className="dropdown-name">{displayName}</strong>
              <span className="dropdown-email">{user.email}</span>
            </div>
            <div className="dropdown-divider" />
            {isAdminEmail(user.email) && (
              <button className="dropdown-item" type="button" onClick={() => { onNavigate("admin"); setMenuOpen(false); }}>
                <Icon>shield</Icon>{t.nav.admin}
              </button>
            )}
            <button className="dropdown-item logout-item" type="button" onClick={() => { onLogout(); setMenuOpen(false); }}>
              <Icon>logout</Icon>{t.nav.logout}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

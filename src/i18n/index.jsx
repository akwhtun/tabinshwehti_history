import { createContext, useContext, useState, useCallback } from "react";
import my from "./my";
import en from "./en";

const languages = { my, en };
const LangContext = createContext();

const saved = (() => { try { return localStorage.getItem("tabinshwehti-lang") || "my"; } catch { return "my"; } })();

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(saved);

  const setLang = useCallback((code) => {
    setLangState(code);
    try { localStorage.setItem("tabinshwehti-lang", code); } catch {}
  }, []);

  const t = languages[lang] || languages.my;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

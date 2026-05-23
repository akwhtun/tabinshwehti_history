const raw = (import.meta.env.VITE_ADMIN_EMAIL || "").split(",").map((s) => s.trim()).filter(Boolean);
export const adminEmails = raw;
export const isAdminEmail = (email) => email && raw.some((e) => e.toLowerCase() === email.toLowerCase());

export const categories = [
  { id: "all", label: "အားလုံး", icon: "apps" },
  { id: "history", label: "သမိုင်းကြောင်း", icon: "menu_book" },
  { id: "war", label: "စစ်ရေး", icon: "swords" },
  { id: "culture", label: "ယဉ်ကျေးမှု", icon: "temple_buddhist" },
  { id: "evidence", label: "သက်သေမှတ်တမ်း", icon: "history_edu" },
];

export const statusMeta = {
  verified: { label: "အတည်ပြုပြီး", icon: "verified", tone: "good" },
  likely_true: { label: "မှန်နိုင်ခြေမြင့်", icon: "task_alt", tone: "good" },
  disputed: { label: "အငြင်းပွားနေ", icon: "balance", tone: "warn" },
  needs_review: { label: "စစ်ဆေးရန်လို", icon: "rate_review", tone: "danger" },
  corrected: { label: "ပြင်ဆင်ပြီး", icon: "edit_note", tone: "info" },
  unverified: { label: "မစစ်ဆေးရသေး", icon: "help", tone: "muted" },
};

export const reasonStatusMeta = {
  pending: { label: "စောင့်ဆိုင်းဆဲ", icon: "hourglass_empty", tone: "warn" },
  visible: { label: "မြင်တွေ့နိုင်", icon: "visibility", tone: "info" },
  accepted: { label: "လက်ခံပြီး", icon: "verified", tone: "good" },
  rejected: { label: "ငြင်းပယ်ပြီး", icon: "cancel", tone: "danger" },
  hidden: { label: "ဖုံးကွယ်ထား", icon: "visibility_off", tone: "muted" },
};

export const voteOptions = [
  { value: "true", label: "မှန်သည်", icon: "thumb_up" },
  { value: "false", label: "မှားသည်", icon: "thumb_down" },
  { value: "disputed", label: "အငြင်းပွား", icon: "balance" },
  { value: "needs_more_evidence", label: "သက်သေလို", icon: "plagiarism" },
];

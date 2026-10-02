// ─── Secret code ───
export const SECRET_CODE = "1234";

// ─── Months ───
export const MONTHS = [
  "جانفي","فيفري","مارس","أفريل","ماي","جوان",
  "جويلية","أوت","سبتمبر","أكتوبر","نوفمبر","ديسمبر"
];

// ─── Group colors palette ───
export const COLORS = [
  "#3b82f6","#8b5cf6","#f59e0b","#10b981",
  "#ef4444","#ec4899","#06b6d4","#84cc16"
];

// ─── Initial demo data ───
export const INIT_LEVELS = [
  { id: 1, name: "السنة الأولى ثانوي" },
  { id: 2, name: "السنة الثالثة ثانوي (بكالوريا)" },
];

export const INIT_GROUPS = [
  { id: 1, levelId: 1, name: "فوج أ — علوم",       pricePerLesson: 400, schedule: "الأحد والثلاثاء 14:00",     color: "#3b82f6" },
  { id: 2, levelId: 1, name: "فوج ب — آداب",       pricePerLesson: 350, schedule: "الاثنين والأربعاء 10:00",   color: "#8b5cf6" },
  { id: 3, levelId: 2, name: "فوج ج — رياضيات",    pricePerLesson: 600, schedule: "الخميس 09:00",              color: "#f59e0b" },
];

export const INIT_STUDENTS = [
  {
    id: 1, groupId: 1,
    name: "محمد", lastName: "أحمد مرابط",
    parentPhone: "0555123456",
    paidMonth: "جانفي", paid: true,
    attendance: ["/", "/", "X", "/", "", "", "", ""],
    grades: ["", "", ""], notes: "", monthHistory: [],
  },
  {
    id: 2, groupId: 1,
    name: "سارة", lastName: "براهمي",
    parentPhone: "0666987654",
    paidMonth: "فيفري", paid: false,
    attendance: ["/", "X", "X", "/", "/", "", "", ""],
    grades: ["14", "", ""], notes: "تحتاج متابعة", monthHistory: [],
  },
  {
    id: 3, groupId: 3,
    name: "أمين", lastName: "بن علي",
    parentPhone: "0777112233",
    paidMonth: "جانفي", paid: true,
    attendance: ["/", "/", "/", "/", "/", "/", "", ""],
    grades: ["18", "16", ""], notes: "", monthHistory: [],
  },
];

// ─── Shared styles ───
export const inp = {
  padding: "10px 12px", borderRadius: 8,
  border: "1.5px solid #cbd5e1", fontSize: 14,
  outline: "none", width: "100%", boxSizing: "border-box",
};
export const btnP = {
  background: "linear-gradient(135deg,#1e3a5f,#2d6a4f)",
  color: "white", border: "none", padding: "10px 16px",
  borderRadius: 9, cursor: "pointer", fontWeight: 700, fontSize: 13,
};
export const btnS = {
  background: "#e2e8f0", color: "#334155", border: "none",
  padding: "10px 14px", borderRadius: 9, cursor: "pointer", fontSize: 13,
};

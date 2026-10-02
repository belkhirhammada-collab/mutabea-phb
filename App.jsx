import { useState } from "react";
import { INIT_LEVELS, INIT_GROUPS, INIT_STUDENTS, MONTHS, COLORS } from "./constants";
import { cycleAttendance, buildHistoryRecord }                       from "./utils";
import Login                                                          from "./components/Login";
import Dashboard                                                      from "./components/Dashboard";
import StudentTable                                                   from "./components/StudentTable";
import {
  ModalOverlay, AddStudentModal, AddLevelModal, AddGroupModal,
  EditGroupModal, NoteModal, MoveStudentModal, GradeModal,
  RenewOneModal, RenewGroupModal, HistoryModal,
} from "./components/Modals";

export default function App() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [loggedIn, setLoggedIn] = useState(false);

  // ── Data ──────────────────────────────────────────────────────────────────
  const [levels,   setLevels]   = useState(INIT_LEVELS);
  const [groups,   setGroups]   = useState(INIT_GROUPS);
  const [students, setStudents] = useState(INIT_STUDENTS);

  // ── Navigation ────────────────────────────────────────────────────────────
  const [activeTab,       setActiveTab]       = useState("students");
  const [selectedLevelId, setSelectedLevelId] = useState(1);
  const [selectedGroupId, setSelectedGroupId] = useState(1);
  const [searchQuery,     setSearchQuery]     = useState("");

  // ── Modal ─────────────────────────────────────────────────────────────────
  // type: null | "addStudent"|"addLevel"|"addGroup"|"editGroup"|
  //       "note"|"grade"|"move"|"renewOne"|"renewGroup"|"history"
  const [modal,     setModal]     = useState(null);
  const [modalData, setModalData] = useState({});

  const openModal  = (type, data = {}) => { setModal(type); setModalData(data); };
  const closeModal = ()                 => { setModal(null); setModalData({}); };

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeGroups      = groups.filter((g) => g.levelId === Number(selectedLevelId));
  const currentGroup      = groups.find((g)  => g.id === Number(selectedGroupId));
  const filteredStudents  = students.filter((s) => {
    if (s.groupId !== Number(selectedGroupId)) return false;
    if (searchQuery && !s.name.includes(searchQuery) && !s.lastName.includes(searchQuery)) return false;
    return true;
  });

  // ── Student handlers ──────────────────────────────────────────────────────
  const updateStudent = (id, patch) =>
    setStudents((p) => p.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const handleAttendance = (studentId, idx) =>
    setStudents((p) => p.map((s) => {
      if (s.id !== studentId) return s;
      const a = [...s.attendance];
      a[idx] = cycleAttendance(a[idx]);
      return { ...s, attendance: a };
    }));

  const handleTogglePaid  = (id) => updateStudent(id, { paid: !students.find((s) => s.id === id).paid });
  const handleMonthChange = (id, month) => updateStudent(id, { paidMonth: month });
  const handleDeleteStudent = (id) => setStudents((p) => p.filter((s) => s.id !== id));

  const handleSaveNote = (id, note) => { updateStudent(id, { notes: note }); closeModal(); };

  const handleMoveStudent = (id, targetGroupId) => { updateStudent(id, { groupId: targetGroupId }); closeModal(); };

  const handleSaveGrade = (id, gradeIdx, val) =>
    setStudents((p) => p.map((s) => {
      if (s.id !== id) return s;
      const grades = [...s.grades]; grades[gradeIdx] = val; return { ...s, grades };
    }));

  const handleAddStudent = (form) => {
    setStudents((p) => [...p, {
      id: Date.now(), groupId: Number(selectedGroupId),
      ...form, paid: false,
      attendance: ["","","","","","","",""],
      grades: ["","",""], notes: "", monthHistory: [],
    }]);
    closeModal();
  };

  // ── Month renewal ─────────────────────────────────────────────────────────
  const renewStudent = (studentId, newMonth) => {
    setStudents((p) => p.map((s) => {
      if (s.id !== studentId) return s;
      const g      = groups.find((x) => x.id === s.groupId);
      const record = buildHistoryRecord(s, g?.pricePerLesson ?? 0);
      return {
        ...s, paidMonth: newMonth, paid: false,
        attendance: ["","","","","","","",""],
        grades: ["","",""],
        monthHistory: [...(s.monthHistory || []), record],
      };
    }));
    closeModal();
  };

  const renewGroup = (newMonth) => {
    setStudents((p) => p.map((s) => {
      if (s.groupId !== Number(selectedGroupId)) return s;
      const g      = groups.find((x) => x.id === s.groupId);
      const record = buildHistoryRecord(s, g?.pricePerLesson ?? 0);
      return {
        ...s, paidMonth: newMonth, paid: false,
        attendance: ["","","","","","","",""],
        grades: ["","",""],
        monthHistory: [...(s.monthHistory || []), record],
      };
    }));
    closeModal();
  };

  // ── Level / Group handlers ────────────────────────────────────────────────
  const handleAddLevel = (name) => {
    const id = Date.now();
    setLevels((p) => [...p, { id, name }]);
    setSelectedLevelId(id);
    closeModal();
  };

  const handleAddGroup = (form) => {
    const id = Date.now();
    setGroups((p) => [...p, {
      id, levelId: Number(selectedLevelId),
      name: form.name, schedule: form.schedule,
      pricePerLesson: Number(form.pricePerLesson),
      color: COLORS[groups.length % COLORS.length],
    }]);
    setSelectedGroupId(id);
    closeModal();
  };

  const handleEditGroup = (form) => {
    setGroups((p) => p.map((g) => (g.id === form.id ? { ...g, ...form } : g)));
    closeModal();
  };

  const handleDeleteGroup = (groupId) => {
    if (!window.confirm("حذف هذا الفوج وكل تلاميذه؟")) return;
    setGroups((p)   => p.filter((g) => g.id !== groupId));
    setStudents((p) => p.filter((s) => s.groupId !== groupId));
    const first = groups.find((g) => g.levelId === selectedLevelId && g.id !== groupId);
    setSelectedGroupId(first ? first.id : "");
  };

  const handleDeleteLevel = (levelId) => {
    if (!window.confirm("حذف هذا القسم وكل أفواجه وتلاميذه؟")) return;
    const gIds = groups.filter((g) => g.levelId === levelId).map((g) => g.id);
    setLevels((p)   => p.filter((l) => l.id !== levelId));
    setGroups((p)   => p.filter((g) => g.levelId !== levelId));
    setStudents((p) => p.filter((s) => !gIds.includes(s.groupId)));
    const first = levels.find((l) => l.id !== levelId);
    if (first) {
      setSelectedLevelId(first.id);
      const fg = groups.find((g) => g.levelId === first.id);
      setSelectedGroupId(fg ? fg.id : "");
    }
  };

  // ── Shared input style ────────────────────────────────────────────────────
  const inp = { padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" };
  const btnS = { background: "#e2e8f0", color: "#334155", border: "none", padding: "7px 9px", borderRadius: 8, cursor: "pointer", fontSize: 11 };
  const btnDanger = { background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", padding: "7px 9px", borderRadius: 8, cursor: "pointer", fontSize: 11 };

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "system-ui,sans-serif", direction: "rtl", background: "#f1f5f9", minHeight: "100vh", paddingBottom: 60 }}>

      {/* ── Header ── */}
      <div style={{ background: "linear-gradient(135deg,#1e3a5f,#1e293b)", color: "white", padding: "14px 18px" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          {/* Row 1: title + logout */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 19, fontWeight: 900 }}>🎓 مُتابع PRO</div>
              <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>
                {levels.length} قسم · {groups.length} فوج · {students.length} تلميذ
              </div>
            </div>
            <button onClick={() => setLoggedIn(false)}
              style={{ background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.35)", color: "#fca5a5", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
              خروج 🔓
            </button>
          </div>
          {/* Row 2: tabs */}
          <div style={{ display: "flex", gap: 6 }}>
            {[["students", "📋 التلاميذ"], ["dashboard", "📊 لوحة التحكم"]].map(([t, l]) => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{ background: activeTab === t ? "rgba(255,255,255,0.18)" : "transparent", border: "1px solid rgba(255,255,255,0.22)", color: "white", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontWeight: activeTab === t ? 700 : 400, fontSize: 12 }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Page ── */}
      <div style={{ maxWidth: 1300, margin: "18px auto", padding: "0 13px" }}>

        {/* Dashboard */}
        {activeTab === "dashboard" && <Dashboard students={students} groups={groups} />}

        {/* Students */}
        {activeTab === "students" && (
          <>
            {/* Filters bar */}
            <div style={{ background: "white", padding: "13px 16px", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>

              {/* Level */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: "#475569", whiteSpace: "nowrap" }}>القسم:</span>
                <select value={selectedLevelId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedLevelId(id);
                    const first = groups.find((g) => g.levelId === id);
                    setSelectedGroupId(first ? first.id : "");
                  }}
                  style={{ ...inp, width: "auto", minWidth: 145, fontSize: 13 }}>
                  {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <button onClick={() => openModal("addLevel")} style={btnS}>➕</button>
                <button onClick={() => handleDeleteLevel(selectedLevelId)} style={btnDanger} title="حذف القسم">🗑</button>
              </div>

              {/* Group */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: "#475569", whiteSpace: "nowrap" }}>الفوج:</span>
                {currentGroup && <span style={{ width: 8, height: 8, borderRadius: "50%", background: currentGroup.color, display: "inline-block", flexShrink: 0 }} />}
                <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(Number(e.target.value))}
                  style={{ ...inp, width: "auto", minWidth: 145, fontSize: 13 }}>
                  {activeGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  {activeGroups.length === 0 && <option value="">لا توجد أفواج</option>}
                </select>
                <button onClick={() => openModal("addGroup")} style={btnS}>➕</button>
                <button onClick={() => openModal("editGroup", currentGroup)} style={{ ...btnS, background: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe" }} title="تعديل الفوج">✏️</button>
                <button onClick={() => handleDeleteGroup(selectedGroupId)} style={btnDanger} title="حذف الفوج">🗑</button>
              </div>

              {/* Search */}
              <input placeholder="🔍 بحث عن تلميذ..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                style={{ ...inp, flex: 1, minWidth: 140, fontSize: 13 }} />

              {/* Add student */}
              <button onClick={() => { if (!selectedGroupId) return alert("أنشئ فوجاً أولاً!"); openModal("addStudent"); }}
                style={{ background: "linear-gradient(135deg,#1e3a5f,#2d6a4f)", color: "white", border: "none", padding: "10px 16px", borderRadius: 9, cursor: "pointer", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>
                + تلميذ
              </button>
            </div>

            {/* Group info strip */}
            {currentGroup && (
              <div style={{ background: "white", borderRadius: 10, padding: "9px 14px", marginBottom: 11, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", fontSize: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: currentGroup.color, display: "inline-block" }} />
                  <strong style={{ color: "#1e293b" }}>{currentGroup.name}</strong>
                </span>
                {currentGroup.schedule && <span style={{ color: "#64748b" }}>🕐 {currentGroup.schedule}</span>}
                <span style={{ color: "#10b981", fontWeight: 700 }}>💰 {currentGroup.pricePerLesson} دج/حصة</span>
                {filteredStudents.length > 0 && (
                  <>
                    <span style={{ color: "#3b82f6" }}>👥 {filteredStudents.length}</span>
                    <span style={{ color: "#10b981" }}>✅ {filteredStudents.reduce((a, s) => a + s.attendance.filter((x) => x === "/").length, 0)}</span>
                    <span style={{ color: "#ef4444" }}>❌ {filteredStudents.reduce((a, s) => a + s.attendance.filter((x) => x === "X").length, 0)}</span>
                    <span style={{ color: "#f59e0b", fontWeight: 700 }}>💰 {filteredStudents.reduce((a, s) => a + s.attendance.filter((x) => x === "/").length * currentGroup.pricePerLesson, 0).toLocaleString()} دج</span>
                    <button onClick={() => openModal("renewGroup")}
                      style={{ marginRight: "auto", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "white", border: "none", padding: "5px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                      🔄 تجديد شهر الفوج كله
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Table */}
            <StudentTable
              students={filteredStudents}
              currentGroup={currentGroup}
              onAttendance={handleAttendance}
              onTogglePaid={handleTogglePaid}
              onMonthChange={handleMonthChange}
              onDelete={handleDeleteStudent}
              onOpenModal={openModal}
            />
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {modal && (
        <ModalOverlay onClose={closeModal}>
          {modal === "addStudent"  && <AddStudentModal onAdd={handleAddStudent} onClose={closeModal} />}
          {modal === "addLevel"    && <AddLevelModal   onAdd={handleAddLevel}   onClose={closeModal} />}
          {modal === "addGroup"    && <AddGroupModal   onAdd={handleAddGroup}   onClose={closeModal} />}
          {modal === "editGroup"   && modalData && <EditGroupModal group={modalData} onSave={handleEditGroup} onClose={closeModal} />}
          {modal === "note"        && modalData.student && <NoteModal student={modalData.student} onSave={(note) => handleSaveNote(modalData.student.id, note)} onClose={closeModal} />}
          {modal === "move"        && modalData.student && <MoveStudentModal student={modalData.student} groups={groups} currentGroupId={modalData.student.groupId} onMove={(tid) => handleMoveStudent(modalData.student.id, tid)} onClose={closeModal} />}
          {modal === "grade"       && modalData.student && <GradeModal student={modalData.student} gradeIdx={modalData.gradeIdx} onSave={(val) => { handleSaveGrade(modalData.student.id, modalData.gradeIdx, val); closeModal(); }} onClose={closeModal} />}
          {modal === "renewOne"    && modalData.student && <RenewOneModal student={modalData.student} group={groups.find((g) => g.id === modalData.student.groupId)} onRenew={(m) => renewStudent(modalData.student.id, m)} onClose={closeModal} />}
          {modal === "renewGroup"  && <RenewGroupModal students={filteredStudents} currentGroup={currentGroup} onRenew={renewGroup} onClose={closeModal} />}
          {modal === "history"     && modalData.student && <HistoryModal student={modalData.student} onClose={closeModal} />}
        </ModalOverlay>
      )}
    </div>
  );
}

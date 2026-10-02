// ─── Check if student has two consecutive absences ───
export function hasConsecutiveAbsences(attendance) {
  for (let i = 0; i < attendance.length - 1; i++) {
    if (attendance[i] === "X" && attendance[i + 1] === "X") return true;
  }
  return false;
}

// ─── Count present lessons ───
export function countPresent(attendance) {
  return attendance.filter((x) => x === "/").length;
}

// ─── Calculate amount owed ───
export function calcAmount(attendance, pricePerLesson) {
  return countPresent(attendance) * pricePerLesson;
}

// ─── Open native SMS app ───
export function sendSMS(phone, text) {
  const clean = phone.replace(/\D/g, "");
  window.location.href = `sms:${clean}?body=${encodeURIComponent(text)}`;
}

// ─── Cycle attendance cell: "" → "/" → "X" → "" ───
export function cycleAttendance(current) {
  if (current === "") return "/";
  if (current === "/") return "X";
  return "";
}

// ─── Build a month history record from current student state ───
export function buildHistoryRecord(student, pricePerLesson) {
  return {
    month:      student.paidMonth,
    attendance: [...student.attendance],
    grades:     [...student.grades],
    paid:       student.paid,
    earned:     calcAmount(student.attendance, pricePerLesson),
  };
}

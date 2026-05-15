import React, { useState } from "react";
import { FaCalendarCheck } from "react-icons/fa";
import { getPublicEmployeeByMobile, markSelfAttendance } from "../../services/employeeManagement.service";

const toYmd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const EmployeeAttendance: React.FC = () => {
  const [form, setForm] = useState({
    employeeCode: "",
    mobile: "",
    date: toYmd(new Date()),
    status: "PRESENT" as "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE",
    checkIn: "09:30",
    checkOut: "18:30",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [employeeName, setEmployeeName] = useState("");

  const fetchEmployee = async () => {
    if (!form.mobile.trim()) return;
    setFetching(true);
    setErr("");
    try {
      const res = await getPublicEmployeeByMobile(form.mobile.trim());
      const emp = res.employee;
      setForm((s) => ({ ...s, employeeCode: emp.employeeCode || "" }));
      setEmployeeName(`${emp.firstName || ""} ${emp.lastName || ""}`.trim());
    } catch (e) {
      setEmployeeName("");
      setErr(e instanceof Error ? e.message : "Failed to fetch employee");
    } finally {
      setFetching(false);
    }
  };

  const submit = async () => {
    if (!form.employeeCode.trim()) {
      setErr("Please fetch employee first using mobile number.");
      return;
    }
    setSaving(true);
    setMsg("");
    setErr("");
    try {
      await markSelfAttendance(form);
      setMsg("Attendance marked successfully.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to mark attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#fee2e2,_#f8fafc_40%)] p-4" style={{ paddingTop: "4rem" }}>
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-red-100 bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center gap-2 text-red-700 border-b border-red-100 pb-2">
          <FaCalendarCheck />
          <h1 className="text-lg font-bold">Employee Attendance</h1>
        </div>
        <div className="mb-3 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
          Enter mobile number, fetch employee code automatically, then mark PRESENT/ABSENT/HALF_DAY/LEAVE.
        </div>
        <div className="grid grid-cols-1 gap-2">
          <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Mobile Number" value={form.mobile} onChange={(e) => setForm((s) => ({ ...s, mobile: e.target.value }))} />
          <button disabled={fetching} className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60" onClick={fetchEmployee}>
            {fetching ? "Fetching..." : "Fetch Employee"}
          </button>
          <input className="rounded-lg border bg-gray-50 px-3 py-2 text-sm" placeholder="Employee Code (auto fetched)" value={form.employeeCode} readOnly />
          {employeeName ? <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">Employee: {employeeName}</div> : null}
          <input type="date" className="rounded-lg border px-3 py-2 text-sm" value={form.date} onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))} />
          <select className="rounded-lg border px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value as any }))}>
            <option value="PRESENT">PRESENT</option>
            <option value="ABSENT">ABSENT</option>
            <option value="HALF_DAY">HALF_DAY</option>
            <option value="LEAVE">LEAVE</option>
          </select>
          <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Check-in (HH:mm)" value={form.checkIn} onChange={(e) => setForm((s) => ({ ...s, checkIn: e.target.value }))} />
          <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Check-out (HH:mm)" value={form.checkOut} onChange={(e) => setForm((s) => ({ ...s, checkOut: e.target.value }))} />
          <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} />
          <button disabled={saving} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60" onClick={submit}>
            {saving ? "Saving..." : "Mark Attendance"}
          </button>
        </div>
        {msg ? <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{msg}</div> : null}
        {err ? <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div> : null}
      </div>
    </div>
  );
};

export default EmployeeAttendance;

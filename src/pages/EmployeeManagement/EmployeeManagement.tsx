import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaUpload, FaUsers } from "react-icons/fa";
import { useEmployeeManagement } from "../../hooks/useEmployeeManagement";
import {
  addEmployeeDocument,
  createEmployee,
  deleteEmployeeDocument,
  generateSalarySlip,
  markEmployeeLeft,
  updateEmployee,
  uploadLetterhead,
  upsertAttendance,
} from "../../services/employeeManagement.service";

const toYmd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const EmployeeManagement: React.FC = () => {
  const navigate = useNavigate();
  const h = useEmployeeManagement();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [letterheadFile, setLetterheadFile] = useState<File | null>(null);
  const [form, setForm] = useState<any>({ firstName: "", lastName: "", designation: "", department: "", joiningDate: toYmd(new Date()), email: "", mobile: "", salaryBasic: "", salaryHra: "", salaryAllowances: "", defaultDeductions: "" });
  const [docType, setDocType] = useState("ID_PROOF");
  const [attendance, setAttendance] = useState<any>({ date: toYmd(new Date()), status: "PRESENT", checkIn: "", checkOut: "", notes: "" });
  const [salary, setSalary] = useState<any>({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), additions: 0, bonus: 0, deductionExtra: 0 });

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-3 sm:p-6" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-7xl overflow-hidden border border-red-100">
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white py-5 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 bg-red-600 rounded-full"><FaArrowLeft /></button>
              <div><h1 className="text-2xl sm:text-3xl font-extrabold">Employee Management</h1><div className="text-sm text-white/90">Employees, docs, attendance, payroll</div></div>
            </div>
            <button className="rounded-lg bg-white text-red-700 px-4 py-2 text-sm font-semibold" onClick={() => h.loadEmployees(1)}><FaUsers className="inline mr-2" />Refresh</button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="rounded-lg border border-red-100 p-3">
            <div className="font-semibold text-red-700 mb-2">Letterhead (one-time)</div>
            <div className="flex gap-2 items-center">
              <input type="text" placeholder="Letterhead title" id="lhTitle" className="rounded-lg border px-3 py-2 text-sm" />
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setLetterheadFile(e.target.files?.[0] || null)} className="rounded-lg border px-3 py-2 text-sm" />
              <button className="rounded-lg bg-red-600 text-white px-3 py-2 text-sm" onClick={async () => { if (!letterheadFile) return alert("Select file"); const t = (document.getElementById("lhTitle") as HTMLInputElement)?.value || ""; await uploadLetterhead(t, letterheadFile); await h.loadLetterhead(); alert("Letterhead uploaded"); }}><FaUpload className="inline mr-1" />Upload</button>
            </div>
            {h.letterhead?.fileViewUrl ? <a className="text-sm text-red-600 underline mt-2 inline-block" href={h.letterhead.fileViewUrl} target="_blank" rel="noreferrer">View Active Letterhead</a> : null}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-lg border border-red-100 p-3 space-y-2">
              <div className="font-semibold text-red-700">Add / Edit Employee</div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="First name*" value={form.firstName} onChange={(e) => setForm((s: any) => ({ ...s, firstName: e.target.value }))} className="rounded border px-2 py-2 text-sm" />
                <input placeholder="Last name" value={form.lastName} onChange={(e) => setForm((s: any) => ({ ...s, lastName: e.target.value }))} className="rounded border px-2 py-2 text-sm" />
                <input placeholder="Designation*" value={form.designation} onChange={(e) => setForm((s: any) => ({ ...s, designation: e.target.value }))} className="rounded border px-2 py-2 text-sm" />
                <input placeholder="Department" value={form.department} onChange={(e) => setForm((s: any) => ({ ...s, department: e.target.value }))} className="rounded border px-2 py-2 text-sm" />
                <input type="date" value={form.joiningDate} onChange={(e) => setForm((s: any) => ({ ...s, joiningDate: e.target.value }))} className="rounded border px-2 py-2 text-sm" />
                <input placeholder="Email" value={form.email} onChange={(e) => setForm((s: any) => ({ ...s, email: e.target.value }))} className="rounded border px-2 py-2 text-sm" />
                <input placeholder="Mobile" value={form.mobile} onChange={(e) => setForm((s: any) => ({ ...s, mobile: e.target.value }))} className="rounded border px-2 py-2 text-sm" />
                <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="rounded border px-2 py-2 text-sm" />
                <input placeholder="Basic" type="number" value={form.salaryBasic} onChange={(e) => setForm((s: any) => ({ ...s, salaryBasic: e.target.value }))} className="rounded border px-2 py-2 text-sm" />
                <input placeholder="HRA" type="number" value={form.salaryHra} onChange={(e) => setForm((s: any) => ({ ...s, salaryHra: e.target.value }))} className="rounded border px-2 py-2 text-sm" />
                <input placeholder="Allowances" type="number" value={form.salaryAllowances} onChange={(e) => setForm((s: any) => ({ ...s, salaryAllowances: e.target.value }))} className="rounded border px-2 py-2 text-sm" />
                <input placeholder="Default deductions" type="number" value={form.defaultDeductions} onChange={(e) => setForm((s: any) => ({ ...s, defaultDeductions: e.target.value }))} className="rounded border px-2 py-2 text-sm" />
              </div>
              <div className="flex gap-2">
                <button className="rounded bg-red-600 text-white px-3 py-2 text-sm" onClick={async () => { await createEmployee(form, photoFile); await h.loadEmployees(1); alert("Employee added"); }}><FaPlus className="inline mr-1" />Add</button>
                {h.selectedEmployee ? <button className="rounded border px-3 py-2 text-sm" onClick={async () => { await updateEmployee(h.selectedEmployee.id, form, photoFile); await h.loadEmployees(h.page); await h.loadEmployeeDetails(h.selectedEmployee.id); alert("Updated"); }}>Update Selected</button> : null}
              </div>
            </div>

            <div className="rounded-lg border border-red-100 p-3">
              <div className="font-semibold text-red-700 mb-2">Employees</div>
              <div className="flex gap-2 mb-2">
                <input value={h.search} onChange={(e) => h.setSearch(e.target.value)} placeholder="Search" className="rounded border px-2 py-2 text-sm" />
                <select value={h.status} onChange={(e) => h.setStatus(e.target.value)} className="rounded border px-2 py-2 text-sm"><option value="">All</option><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option><option value="LEFT">LEFT</option></select>
                <button className="rounded bg-red-600 text-white px-3 py-2 text-sm" onClick={() => h.loadEmployees(1)}>Apply</button>
              </div>
              <div className="max-h-72 overflow-auto border rounded">
                <table className="min-w-full text-sm"><thead className="bg-red-50"><tr><th className="text-left px-2 py-1">Code</th><th className="text-left px-2 py-1">Name</th><th className="text-left px-2 py-1">Designation</th><th className="text-left px-2 py-1">Status</th><th className="text-left px-2 py-1">Action</th></tr></thead><tbody>{h.loading ? <tr><td colSpan={5} className="px-2 py-2">Loading...</td></tr> : h.employees.map((e) => <tr className="border-t" key={e.id}><td className="px-2 py-1">{e.employeeCode}</td><td className="px-2 py-1">{e.firstName} {e.lastName || ""}</td><td className="px-2 py-1">{e.designation}</td><td className="px-2 py-1">{e.status}</td><td className="px-2 py-1"><button className="underline text-red-600" onClick={async () => { const emp = await h.loadEmployeeDetails(e.id); setForm({ ...form, firstName: emp.firstName || "", lastName: emp.lastName || "", designation: emp.designation || "", department: emp.department || "", joiningDate: String(emp.joiningDate || "").slice(0,10), email: emp.email || "", mobile: emp.mobile || "", salaryBasic: emp.salaryBasic || "", salaryHra: emp.salaryHra || "", salaryAllowances: emp.salaryAllowances || "", defaultDeductions: emp.defaultDeductions || "" }); await h.loadAttendance(e.id, toYmd(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), toYmd(new Date())); await h.loadSalarySlips(e.id); }}>Open</button></td></tr>)}</tbody></table>
              </div>
            </div>
          </div>

          {h.selectedEmployee ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-lg border border-red-100 p-3 space-y-2">
                <div className="font-semibold text-red-700">Documents</div>
                <div className="flex gap-2">
                  <select value={docType} onChange={(e) => setDocType(e.target.value)} className="rounded border px-2 py-2 text-sm"><option>ID_PROOF</option><option>OFFER_LETTER</option><option>EXPERIENCE_LETTER</option><option>PASSPORT_PHOTO</option><option>OTHER</option></select>
                  <input type="file" onChange={(e) => setDocFile(e.target.files?.[0] || null)} className="rounded border px-2 py-2 text-sm" />
                  <button className="rounded bg-red-600 text-white px-2 py-2 text-sm" onClick={async () => { if (!docFile) return alert("Select file"); await addEmployeeDocument(h.selectedEmployee.id, { docType }, docFile); await h.loadEmployeeDetails(h.selectedEmployee.id); alert("Document added"); }}>Add</button>
                </div>
                <div className="max-h-44 overflow-auto border rounded">
                  {(h.selectedEmployee.documents || []).map((d: any) => (
                    <div key={d.id} className="p-2 border-b text-sm flex justify-between items-center">
                      <div><div className="font-medium">{d.docType}</div><a href={d.fileViewUrl} target="_blank" rel="noreferrer" className="text-red-600 underline">View</a></div>
                      <button className="text-xs text-red-600 underline" onClick={async () => { await deleteEmployeeDocument(h.selectedEmployee.id, d.id); await h.loadEmployeeDetails(h.selectedEmployee.id); }}>Delete</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-red-100 p-3 space-y-2">
                <div className="font-semibold text-red-700">Attendance</div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={attendance.date} onChange={(e) => setAttendance((s: any) => ({ ...s, date: e.target.value }))} className="rounded border px-2 py-2 text-sm" />
                  <select value={attendance.status} onChange={(e) => setAttendance((s: any) => ({ ...s, status: e.target.value }))} className="rounded border px-2 py-2 text-sm"><option>PRESENT</option><option>ABSENT</option><option>HALF_DAY</option><option>LEAVE</option></select>
                  <input placeholder="Check in" value={attendance.checkIn} onChange={(e) => setAttendance((s: any) => ({ ...s, checkIn: e.target.value }))} className="rounded border px-2 py-2 text-sm" />
                  <input placeholder="Check out" value={attendance.checkOut} onChange={(e) => setAttendance((s: any) => ({ ...s, checkOut: e.target.value }))} className="rounded border px-2 py-2 text-sm" />
                </div>
                <button className="rounded bg-red-600 text-white px-3 py-2 text-sm" onClick={async () => { await upsertAttendance(h.selectedEmployee.id, attendance); await h.loadAttendance(h.selectedEmployee.id, toYmd(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), toYmd(new Date())); }}>Mark/Update</button>
                <div className="max-h-40 overflow-auto border rounded text-sm">{h.attendance.map((a: any) => <div key={a.id} className="px-2 py-1 border-b">{String(a.date).slice(0,10)} - {a.status}</div>)}</div>
              </div>

              <div className="rounded-lg border border-red-100 p-3 space-y-2">
                <div className="font-semibold text-red-700">Salary</div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={salary.month} onChange={(e) => setSalary((s: any) => ({ ...s, month: Number(e.target.value) }))} className="rounded border px-2 py-2 text-sm" placeholder="Month" />
                  <input type="number" value={salary.year} onChange={(e) => setSalary((s: any) => ({ ...s, year: Number(e.target.value) }))} className="rounded border px-2 py-2 text-sm" placeholder="Year" />
                  <input type="number" value={salary.additions} onChange={(e) => setSalary((s: any) => ({ ...s, additions: Number(e.target.value) }))} className="rounded border px-2 py-2 text-sm" placeholder="Additions" />
                  <input type="number" value={salary.bonus} onChange={(e) => setSalary((s: any) => ({ ...s, bonus: Number(e.target.value) }))} className="rounded border px-2 py-2 text-sm" placeholder="Bonus" />
                  <input type="number" value={salary.deductionExtra} onChange={(e) => setSalary((s: any) => ({ ...s, deductionExtra: Number(e.target.value) }))} className="rounded border px-2 py-2 text-sm" placeholder="Extra Deductions" />
                </div>
                <div className="flex gap-2">
                  <button className="rounded bg-red-600 text-white px-3 py-2 text-sm" onClick={async () => { await generateSalarySlip(h.selectedEmployee.id, salary); await h.loadSalarySlips(h.selectedEmployee.id); alert("Salary slip generated"); }}>Generate Slip</button>
                  <button className="rounded border px-3 py-2 text-sm" onClick={async () => { await markEmployeeLeft(h.selectedEmployee.id); await h.loadEmployees(h.page); await h.loadEmployeeDetails(h.selectedEmployee.id); }}>Mark Left</button>
                </div>
                <div className="max-h-40 overflow-auto border rounded text-sm">{h.salarySlips.map((s: any) => <div key={s.id} className="px-2 py-1 border-b">{s.month}/{s.year} - Net Rs{Number(s.netSalary || 0).toLocaleString("en-IN")}</div>)}</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;

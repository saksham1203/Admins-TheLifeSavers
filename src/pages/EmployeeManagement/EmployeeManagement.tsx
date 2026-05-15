import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PDFDocument, rgb } from "pdf-lib";
import {
  FaArrowLeft,
  FaCalendarCheck,
  FaFileAlt,
  FaMoneyCheckAlt,
  FaPlus,
  FaPrint,
  FaSearch,
  FaUpload,
  FaUserCheck,
  FaUserClock,
  FaUsers,
} from "react-icons/fa";
import { useEmployeeManagement } from "../../hooks/useEmployeeManagement";
import {
  addEmployeeDocument,
  deleteAttendance,
  createEmployee,
  deleteEmployeeDocument,
  deleteSalarySlip,
  downloadEmployeeData,
  downloadSalarySlipFile,
  fetchActiveLetterheadBlob,
  generateSalarySlip,
  hardDeleteEmployee,
  markSelfAttendance,
  markEmployeeLeft,
  setEmployeeStatus,
  softDeleteEmployee,
  updateEmployee,
  uploadLetterhead,
  upsertAttendance,
  type Employee,
} from "../../services/employeeManagement.service";

type TabKey = "directory" | "profile" | "documents" | "attendance" | "payroll";

const toYmd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const money = (n: number) => `Rs${Number(n || 0).toLocaleString("en-IN")}`;

const cardClass =
  "rounded-2xl border border-red-100 bg-white/95 shadow-sm hover:shadow-md transition-shadow";

const emptyEmployeeForm = {
  firstName: "",
  lastName: "",
  designation: "",
  department: "",
  joiningDate: toYmd(new Date()),
  dob: "",
  email: "",
  mobile: "",
  salaryBasic: "",
  salaryHra: "",
  salaryAllowances: "",
  defaultDeductions: "",
  bankName: "",
  bankAccountNumber: "",
  ifscCode: "",
  panNumber: "",
  aadhaarNumber: "",
  emergencyContact: "",
  address: "",
  notes: "",
  status: "ACTIVE",
};

const fieldLabels: Record<string, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  designation: "Designation",
  department: "Department",
  joiningDate: "Joining Date",
  dob: "Date of Birth",
  email: "Email",
  mobile: "Mobile Number",
  salaryBasic: "Basic Salary",
  salaryHra: "HRA",
  salaryAllowances: "Allowances",
  defaultDeductions: "Default Deductions",
  bankName: "Bank Name",
  bankAccountNumber: "Bank Account Number",
  ifscCode: "IFSC Code",
  panNumber: "PAN Number",
  aadhaarNumber: "Aadhaar Number",
  emergencyContact: "Emergency Contact",
  address: "Address",
  notes: "Admin Notes",
  status: "Status",
};

const EmployeeManagement: React.FC = () => {
  const navigate = useNavigate();
  const h = useEmployeeManagement();

  const [activeTab, setActiveTab] = useState<TabKey>("directory");
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [letterheadFile, setLetterheadFile] = useState<File | null>(null);
  const [letterheadTitle, setLetterheadTitle] = useState("");
  const [docType, setDocType] = useState("ID_PROOF");
  const [docTitle, setDocTitle] = useState("");
  const [docRemarks, setDocRemarks] = useState("");
  const [form, setForm] = useState<any>(emptyEmployeeForm);
  const [attendance, setAttendance] = useState({
    from: toYmd(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
    to: toYmd(new Date()),
    date: toYmd(new Date()),
    status: "PRESENT",
    checkIn: "09:30",
    checkOut: "18:30",
    notes: "",
  });
  const [salary, setSalary] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    additions: 0,
    bonus: 0,
    deductionExtra: 0,
    deductionTitle: "",
    deductionRemark: "",
  });

  const [letterSettings, setLetterSettings] = useState({
    companyName: "The Life Savers",
    companyAddress: "",
    signatoryName: "HR Department",
    signatoryRole: "Human Resources",
    body: "",
    letterDate: "",
  });

  const stats = useMemo(() => {
    const total = h.employees.length;
    const active = h.employees.filter((e) => e.status === "ACTIVE").length;
    const left = h.employees.filter((e) => e.status === "LEFT").length;
    const monthlyPayroll = h.salarySlips.reduce((sum, s: any) => sum + Number(s.netSalary || 0), 0);
    return { total, active, left, monthlyPayroll };
  }, [h.employees, h.salarySlips]);

  const selected = h.selectedEmployee as (Employee & { documents?: any[] }) | null;
  const selfAttendanceLink = `${window.location.origin}/employee-attendance`;

  const hydrateFormFromEmployee = (emp: any) => {
    setForm({
      firstName: emp.firstName || "",
      lastName: emp.lastName || "",
      designation: emp.designation || "",
      department: emp.department || "",
      joiningDate: String(emp.joiningDate || "").slice(0, 10),
      dob: String(emp.dob || "").slice(0, 10),
      email: emp.email || "",
      mobile: emp.mobile || "",
      salaryBasic: emp.salaryBasic ?? "",
      salaryHra: emp.salaryHra ?? "",
      salaryAllowances: emp.salaryAllowances ?? "",
      defaultDeductions: emp.defaultDeductions ?? "",
      bankName: emp.bankName || "",
      bankAccountNumber: emp.bankAccountNumber || "",
      ifscCode: emp.ifscCode || "",
      panNumber: emp.panNumber || "",
      aadhaarNumber: emp.aadhaarNumber || "",
      emergencyContact: emp.emergencyContact || "",
      address: emp.address || "",
      notes: emp.notes || "",
      status: emp.status || "ACTIVE",
    });
  };

  const openEmployee = async (id: string) => {
    setIsOnboarding(false);
    const emp = await h.loadEmployeeDetails(id);
    hydrateFormFromEmployee(emp);
    await h.loadAttendance(id, attendance.from, attendance.to);
    await h.loadSalarySlips(id);
    setActiveTab("profile");
  };

  const refreshSelected = async () => {
    if (!selected?.id) return;
    await h.loadEmployeeDetails(selected.id);
    await h.loadAttendance(selected.id, attendance.from, attendance.to);
    await h.loadSalarySlips(selected.id);
  };

  const buildLetter = (kind: "offer" | "experience") => {
    if (!selected) return "";
    const date = new Date().toLocaleDateString("en-IN");
    const fullName = `${selected.firstName || ""} ${selected.lastName || ""}`.trim();
    const joiningDate = selected.joiningDate ? new Date(selected.joiningDate).toLocaleDateString("en-IN") : "";
    const today = new Date().toLocaleDateString("en-IN");

    const body =
      kind === "offer"
        ? `This is to formally offer employment to ${fullName} for the role of ${selected.designation}. Your joining date is ${joiningDate}.`
        : `This is to certify that ${fullName} worked with ${letterSettings.companyName} as ${selected.designation} from ${joiningDate} to ${today}.`;

    const customBody = letterSettings.body.trim() || body;

    const letterheadUrl = h.letterhead?.fileViewUrl || "";
    let letterPath = "";
    try {
      letterPath = letterheadUrl ? new URL(letterheadUrl).pathname : "";
    } catch (_e) {
      letterPath = letterheadUrl.split("?")[0] || "";
    }
    const hasImageLetterhead = /\.(png|jpg|jpeg|webp)$/i.test(letterPath);
    const hasPdfLetterhead = /\.pdf$/i.test(letterPath);
    const hasLetterhead = hasImageLetterhead || hasPdfLetterhead;
    return `<!doctype html>
<html><head><meta charset="utf-8" /><title>${kind === "offer" ? "Offer Letter" : "Experience Letter"}</title>
<style>
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#f3f4f6}
body{font-family:Georgia,serif;color:#111827;line-height:1.6}
.page{position:relative;width:210mm;min-height:297mm;margin:12px auto;background:#fff;overflow:hidden}
.letterhead{position:absolute;inset:0;z-index:0;pointer-events:none}
.letterhead img{width:100%;height:100%;object-fit:cover}
.letterhead iframe{width:100%;height:100%;border:0}
.content{position:relative;z-index:2;padding:28mm 18mm 20mm}
.content.with-letterhead{padding-top:56mm}
.meta{font-size:13px;color:#4b5563;margin-bottom:8px}
.line{height:1px;background:#dc2626;margin:8px 0 18px}
h2{margin:0 0 10px;font-size:42px;line-height:1.1;font-weight:700;color:#111827}
p{margin:0 0 14px}
.footer{margin-top:44px}
.sign{margin-top:20px;font-weight:700}
@media print{
  @page{size:A4;margin:0}
  html,body{background:#fff}
  .page{margin:0}
}
</style></head><body>
  <div class="page">
    ${hasImageLetterhead ? `<div class="letterhead"><img src="${letterheadUrl}" /></div>` : ""}
    ${!hasImageLetterhead && hasPdfLetterhead ? `<div class="letterhead"><iframe src="${letterheadUrl}#view=FitH"></iframe></div>` : ""}
    <div class="content ${hasLetterhead ? "with-letterhead" : ""}">
      ${!hasLetterhead ? `<div style="font-size:28px;font-weight:700;color:#b91c1c;">${letterSettings.companyName}</div><div class="meta">${letterSettings.companyAddress || ""}</div>` : ""}
      <div class="meta">Date: ${date}</div>
      <div class="line"></div>
      <h2>${kind === "offer" ? "Offer Letter" : "Experience Letter"}</h2>
      <p>Dear ${fullName},</p>
      <p>${customBody}</p>
      <p>Regards,</p>
      <div class="footer">
        <div class="sign">${letterSettings.signatoryName}</div>
        <div>${letterSettings.signatoryRole}</div>
      </div>
    </div>
  </div>
</body></html>`;
  };


  const startOnboarding = () => {
    setIsOnboarding(true);
    setForm(emptyEmployeeForm);
    setPhotoFile(null);
    h.setSelectedEmployee(null);
    setActiveTab("profile");
  };
  const generateLetterPdf = async (kind: "offer" | "experience") => {
    if (!selected) return null;

    const date = letterSettings.letterDate
      ? new Date(letterSettings.letterDate).toLocaleDateString("en-IN")
      : "";
    const fullName = `${selected.firstName || ""} ${selected.lastName || ""}`.trim();
    const joiningDate = selected.joiningDate ? new Date(selected.joiningDate).toLocaleDateString("en-IN") : "";
    const today = new Date().toLocaleDateString("en-IN");
    const bodyText =
      kind === "offer"
        ? `This is to formally offer employment to ${fullName} for the role of ${selected.designation}. Your joining date is ${joiningDate}.`
        : `This is to certify that ${fullName} worked with ${letterSettings.companyName} as ${selected.designation} from ${joiningDate} to ${today}.`;
    const customBody = letterSettings.body.trim() || bodyText;

    const pdfDoc = await PDFDocument.create();
    let page;
    let pageWidth = 595.28;
    let pageHeight = 841.89;

    if (h.letterhead) {
      const letterheadBlob = await fetchActiveLetterheadBlob();
      const letterheadBytes = await letterheadBlob.arrayBuffer();
      const ctype = String(letterheadBlob.type || "").toLowerCase();
      const isPdf = ctype.includes("pdf");
      const isPng = ctype.includes("png");
      const isJpg = ctype.includes("jpeg") || ctype.includes("jpg");
      if (isPdf) {
        const lhPdf = await PDFDocument.load(letterheadBytes);
        const lhPage = lhPdf.getPages()[0];
        pageWidth = lhPage.getWidth();
        pageHeight = lhPage.getHeight();
        const embedded = await pdfDoc.embedPage(lhPage);
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        page.drawPage(embedded, { x: 0, y: 0, width: pageWidth, height: pageHeight });
      } else if (isPng || isJpg) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        const embedded = isPng ? await pdfDoc.embedPng(letterheadBytes) : await pdfDoc.embedJpg(letterheadBytes);
        page.drawImage(embedded, { x: 0, y: 0, width: pageWidth, height: pageHeight });
      }
    }

    if (!page) page = pdfDoc.addPage([pageWidth, pageHeight]);

    let font;
    let bold;
    try {
      font = await pdfDoc.embedFont("Times-Roman");
      bold = await pdfDoc.embedFont("Times-Bold");
    } catch (_e) {
      // Safe fallback for environments where Times isn't available.
      font = await pdfDoc.embedFont("Helvetica");
      bold = await pdfDoc.embedFont("Helvetica-Bold");
    }
    const marginX = 48;
    const startY = pageHeight - 150;
    const maxWidth = pageWidth - marginX * 2;
    let y = startY;

    const wrapText = (text: string, fSize = 13) => {
      const words = text.split(/\s+/);
      const lines: string[] = [];
      let line = "";
      const splitLongWord = (word: string) => {
        const parts: string[] = [];
        let chunk = "";
        for (const ch of word) {
          const candidate = chunk + ch;
          if (font.widthOfTextAtSize(candidate, fSize) <= maxWidth) {
            chunk = candidate;
          } else {
            if (chunk) parts.push(chunk);
            chunk = ch;
          }
        }
        if (chunk) parts.push(chunk);
        return parts;
      };
      for (const w of words) {
        if (font.widthOfTextAtSize(w, fSize) > maxWidth) {
          const parts = splitLongWord(w);
          for (const p of parts) {
            const candidate = line ? `${line} ${p}` : p;
            if (font.widthOfTextAtSize(candidate, fSize) <= maxWidth) {
              line = candidate;
            } else {
              if (line) lines.push(line);
              line = p;
            }
          }
          continue;
        }
        const candidate = line ? `${line} ${w}` : w;
        if (font.widthOfTextAtSize(candidate, fSize) <= maxWidth) line = candidate;
        else {
          if (line) lines.push(line);
          line = w;
        }
      }
      if (line) lines.push(line);
      return lines;
    };

    const title = kind === "offer" ? "Offer Letter" : "Experience Letter";
    const titleSize = 34;
    const titleWidth = bold.widthOfTextAtSize(title, titleSize);
    const titleX = Math.max(marginX, (pageWidth - titleWidth) / 2);
    page.drawText(title, { x: titleX, y, size: titleSize, font: bold, color: rgb(0.1, 0.1, 0.1) });
    y -= 32;
    if (date) {
      page.drawText(`Date: ${date}`, { x: marginX, y, size: 12, font, color: rgb(0.2, 0.2, 0.2) });
      y -= 30;
    } else {
      y -= 10;
    }
    page.drawText(`Dear ${fullName},`, { x: marginX, y, size: 13, font, color: rgb(0.1, 0.1, 0.1) });
    y -= 28;
    wrapText(customBody, 13).forEach((line) => {
      page.drawText(line, { x: marginX, y, size: 13, font, color: rgb(0.1, 0.1, 0.1) });
      y -= 19;
    });
    y -= 20;
    page.drawText("Regards,", { x: marginX, y, size: 13, font, color: rgb(0.1, 0.1, 0.1) });
    y -= 44;
    page.drawText(letterSettings.signatoryName, { x: marginX, y, size: 13, font: bold, color: rgb(0.1, 0.1, 0.1) });
    y -= 18;
    page.drawText(letterSettings.signatoryRole, { x: marginX, y, size: 12, font, color: rgb(0.1, 0.1, 0.1) });

    const bytes = await pdfDoc.save();
    return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
  };

  const openPrintableLetter = async (kind: "offer" | "experience") => {
    let blob: Blob | null = null;
    try {
      blob = await generateLetterPdf(kind);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Failed to generate letter PDF");
      return;
    }
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) return;
    setTimeout(() => win.print(), 600);
  };

  const downloadLetter = async (kind: "offer" | "experience") => {
    let blob: Blob | null = null;
    try {
      blob = await generateLetterPdf(kind);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Failed to generate letter PDF");
      return;
    }
    if (!blob || !selected) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const name = `${selected.employeeCode || "employee"}-${kind}-letter.pdf`.replace(/[^a-z0-9._-]/gi, "_");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#fee2e2,_#f8fafc_40%)] p-3 sm:p-6" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
      <div className="mx-auto w-full max-w-[1500px] overflow-hidden rounded-3xl border border-red-100 bg-white/90 shadow-2xl backdrop-blur-sm">
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-500 px-4 py-6 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="rounded-full bg-white/15 p-2 hover:bg-white/20" aria-label="Back">
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Employee Management Suite</h1>
                <div className="text-sm text-white/90">People, documents, attendance, payroll, letters</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-xl bg-yellow-300 px-4 py-2 text-sm font-bold text-red-800 hover:bg-yellow-200"
                onClick={startOnboarding}
              >
                + Onboard Employee
              </button>
              <button
                className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50"
                onClick={() => h.loadEmployees(1)}
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className={`${cardClass} p-4`}><div className="text-xs text-gray-500">Employees in View</div><div className="text-2xl font-extrabold text-gray-900">{stats.total}</div></div>
            <div className={`${cardClass} p-4`}><div className="text-xs text-gray-500">Active Employees</div><div className="text-2xl font-extrabold text-emerald-600">{stats.active}</div></div>
            <div className={`${cardClass} p-4`}><div className="text-xs text-gray-500">Left Employees</div><div className="text-2xl font-extrabold text-amber-600">{stats.left}</div></div>
            <div className={`${cardClass} p-4`}><div className="text-xs text-gray-500">Loaded Payroll Total</div><div className="text-2xl font-extrabold text-red-600">{money(stats.monthlyPayroll)}</div></div>
          </div>

          <div className={`${cardClass} p-4`}>
            <div className="mb-2 text-sm font-bold text-red-700">Company Letterhead (one-time)</div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-[1.2fr_1fr_auto]">
              <input value={letterheadTitle} onChange={(e) => setLetterheadTitle(e.target.value)} placeholder="Letterhead title" className="rounded-xl border px-3 py-2 text-sm" />
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setLetterheadFile(e.target.files?.[0] || null)} className="rounded-xl border px-3 py-2 text-sm" />
              <button
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                onClick={async () => {
                  if (!letterheadFile) return;
                  await uploadLetterhead(letterheadTitle, letterheadFile);
                  await h.loadLetterhead();
                  setLetterheadTitle("");
                  setLetterheadFile(null);
                }}
              >
                <FaUpload className="mr-2 inline" /> Upload
              </button>
            </div>
            {h.letterhead?.fileViewUrl ? (
              <a className="mt-2 inline-block text-sm font-semibold text-red-600 underline" href={h.letterhead.fileViewUrl} target="_blank" rel="noreferrer">
                View Active Letterhead
              </a>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ["directory", "Directory", FaUsers],
              ["profile", "Profile", FaUserCheck],
              ["documents", "Docs & Letters", FaFileAlt],
              ["attendance", "Attendance", FaCalendarCheck],
              ["payroll", "Payroll", FaMoneyCheckAlt],
            ].map(([key, label, Icon]: any) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeTab === key ? "bg-red-600 text-white" : "border border-red-100 bg-white text-red-700 hover:bg-red-50"
                }`}
              >
                <Icon className="mr-2 inline" /> {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className={`${cardClass} xl:col-span-1 p-4`}>
              <div className="mb-2 flex items-center justify-between gap-2"><div className="text-base font-bold text-red-700">Employees Directory</div><button className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700" onClick={startOnboarding}>+ Add Employee</button></div>
              <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="relative sm:col-span-2">
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  <input value={h.search} onChange={(e) => h.setSearch(e.target.value)} placeholder="Search by name, code, email, mobile" className="w-full rounded-xl border px-9 py-2 text-sm" />
                </div>
                <select value={h.status} onChange={(e) => h.setStatus(e.target.value)} className="rounded-xl border px-3 py-2 text-sm">
                  <option value="">All status</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="LEFT">LEFT</option>
                </select>
                <input value={h.designation} onChange={(e) => h.setDesignation(e.target.value)} placeholder="Filter by designation" className="rounded-xl border px-3 py-2 text-sm" />
                <button className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 sm:col-span-2" onClick={() => h.loadEmployees(1)}>Apply Filters</button>
              </div>

              <div className="max-h-[48vh] overflow-auto rounded-xl border">
                <table className="min-w-full text-sm">
                  <thead className="bg-red-50 text-red-700">
                    <tr><th className="px-2 py-2 text-left">Emp</th><th className="px-2 py-2 text-left">Role</th><th className="px-2 py-2 text-left">Status</th><th className="px-2 py-2 text-left">Open</th></tr>
                  </thead>
                  <tbody>
                    {h.loading ? (
                      <tr><td colSpan={4} className="px-3 py-4 text-gray-500">Loading...</td></tr>
                    ) : h.employees.length === 0 ? (
                      <tr><td colSpan={4} className="px-3 py-4 text-gray-500">No employees found.</td></tr>
                    ) : (
                      h.employees.map((e) => (
                        <tr key={e.id} className="border-t">
                          <td className="px-2 py-2"><div className="font-semibold">{e.firstName} {e.lastName || ""}</div><div className="text-xs text-gray-500">{e.employeeCode}</div></td>
                          <td className="px-2 py-2">{e.designation}</td>
                          <td className="px-2 py-2"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${e.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : e.status === "LEFT" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>{e.status}</span></td>
                          <td className="px-2 py-2"><button className="rounded-lg border px-2 py-1 text-xs font-semibold hover:bg-red-50" onClick={() => openEmployee(e.id)}>Open</button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                <div>Page {h.pagination.page} / {h.pagination.totalPages}</div>
                <div className="flex gap-2">
                  <button className="rounded-lg border px-3 py-1 disabled:opacity-50" disabled={!h.pagination.hasPrevPage || h.loading} onClick={() => h.loadEmployees(Math.max(1, h.page - 1))}>Prev</button>
                  <button className="rounded-lg border px-3 py-1 disabled:opacity-50" disabled={!h.pagination.hasNextPage || h.loading} onClick={() => h.loadEmployees(h.page + 1)}>Next</button>
                </div>
              </div>
            </div>

            <div className={`${cardClass} xl:col-span-2 p-4`}>
              {!selected && !isOnboarding ? (
                <div className="flex min-h-[50vh] items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FaUserClock className="mx-auto mb-2 text-3xl text-red-300" />
                    Select an employee from left panel to manage full profile.
                    <div className="mt-3">
                      <button className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700" onClick={startOnboarding}>Start Employee Onboarding</button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {selected ? (
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 p-3">
                      <div>
                        <div className="text-lg font-extrabold text-gray-900">{selected.firstName} {selected.lastName || ""}</div>
                        <div className="text-sm text-gray-600">{selected.employeeCode} · {selected.designation} · {selected.department || "-"}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-lg border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-700" onClick={refreshSelected}>Reload</button>
                        <button className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700" onClick={async () => { await downloadEmployeeData(selected.id); }}>Download Data</button>
                        <button className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700" onClick={async () => { await markEmployeeLeft(selected.id); await refreshSelected(); await h.loadEmployees(h.page); await h.loadSummary(); }}>Mark Left</button>
                        <button className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700" onClick={async () => { await setEmployeeStatus(selected.id, "ACTIVE"); await refreshSelected(); await h.loadEmployees(h.page); await h.loadSummary(); }}>Set Active</button>
                        <button className="rounded-lg border border-red-300 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700" onClick={async () => { await softDeleteEmployee(selected.id, "Soft deleted from employee management panel"); h.setSelectedEmployee(null); await h.loadEmployees(1); await h.loadSummary(); }}>Archive</button>
                        <button className="rounded-lg border border-black bg-white px-3 py-1 text-xs font-semibold text-black" onClick={async () => { const ok = window.confirm("This will permanently delete employee data. Continue?"); if (!ok) return; await hardDeleteEmployee(selected.id); h.setSelectedEmployee(null); await h.loadEmployees(1); await h.loadSummary(); }}>Delete Permanently</button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                      <div className="text-sm font-bold text-emerald-800">New Employee Onboarding</div>
                      <div className="text-xs text-emerald-700">Fill details and click Create Employee.</div>
                    </div>
                  )}
                  {activeTab === "profile" || activeTab === "directory" ? (
                    <div className="space-y-3">
                      <div className="text-sm font-bold text-red-700">Profile & Employment Details</div>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                        {Object.entries(form).map(([k, v]) => (
                          <label key={k} className="text-xs text-gray-700">
                            <div className="mb-1 font-semibold">{fieldLabels[k] || k}</div>
                            <input
                              value={String(v ?? "")}
                              onChange={(e) => setForm((s: any) => ({ ...s, [k]: e.target.value }))}
                              placeholder={fieldLabels[k] || k}
                              type={k.toLowerCase().includes("date") ? "date" : k.toLowerCase().includes("salary") ? "number" : "text"}
                              className="w-full rounded-xl border px-3 py-2 text-sm"
                            />
                          </label>
                        ))}
                        <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="rounded-xl border px-3 py-2 text-sm" />
                      </div>
                      <div className="flex gap-2">
                        <button className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" onClick={async () => { if (!selected?.id) { if (!String(form.firstName || "").trim() || !String(form.designation || "").trim() || !String(form.joiningDate || "").trim()) { window.alert("Please fill First Name, Designation, and Joining Date."); return; } const created = await createEmployee(form, photoFile); await h.loadEmployees(1); setIsOnboarding(false); if (created?.employee?.id) { await openEmployee(created.employee.id); } window.alert("Employee created successfully."); } else { await updateEmployee(selected.id, form, photoFile); await refreshSelected(); await h.loadEmployees(h.page); window.alert("Employee profile updated."); } }}>
                          <FaPlus className="mr-2 inline" /> {selected?.id ? "Save Profile" : "Create Employee"}
                        </button>
                        <button className="rounded-xl border px-4 py-2 text-sm font-semibold" onClick={() => { setForm(emptyEmployeeForm); h.setSelectedEmployee(null); setPhotoFile(null); }}>Clear Form</button>
                      </div>
                    </div>
                  ) : null}

                  {selected && activeTab === "documents" ? (
                    <div className="space-y-3">
                      <div className="text-sm font-bold text-red-700">Documents & Letter Generation</div>
                      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        <div className="rounded-xl border p-3">
                          <div className="mb-2 font-semibold">Employee Documents</div>
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            <select value={docType} onChange={(e) => setDocType(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
                              <option>ID_PROOF</option>
                              <option>PASSPORT_PHOTO</option>
                              <option>OFFER_LETTER</option>
                              <option>EXPERIENCE_LETTER</option>
                              <option>SALARY_SLIP</option>
                              <option>OTHER</option>
                            </select>
                            <input value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="Document title" className="rounded-lg border px-3 py-2 text-sm" />
                            <input value={docRemarks} onChange={(e) => setDocRemarks(e.target.value)} placeholder="Remarks" className="rounded-lg border px-3 py-2 text-sm md:col-span-2" />
                            <input type="file" onChange={(e) => setDocFile(e.target.files?.[0] || null)} className="rounded-lg border px-3 py-2 text-sm md:col-span-2" />
                          </div>
                          <button className="mt-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white" onClick={async () => { if (!docFile) return; await addEmployeeDocument(selected.id, { docType, title: docTitle, remarks: docRemarks }, docFile); setDocFile(null); setDocTitle(""); setDocRemarks(""); await refreshSelected(); }}>
                            <FaUpload className="mr-2 inline" /> Upload Document
                          </button>
                          <div className="mt-3 max-h-52 overflow-auto rounded-lg border">
                            {(selected.documents || []).length === 0 ? (
                              <div className="px-3 py-3 text-sm text-gray-500">No documents uploaded.</div>
                            ) : (
                              (selected.documents || []).map((d: any) => (
                                <div key={d.id} className="flex items-center justify-between border-b px-3 py-2 text-sm">
                                  <div><div className="font-semibold">{d.docType}</div><a className="text-red-600 underline" href={d.fileViewUrl} target="_blank" rel="noreferrer">View</a></div>
                                  <button className="text-xs font-semibold text-red-600 underline" onClick={async () => { await deleteEmployeeDocument(selected.id, d.id); await refreshSelected(); }}>Delete</button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="rounded-xl border p-3">
                          <div className="mb-2 font-semibold">Offer / Experience Letters</div>
                          <div className="grid grid-cols-1 gap-2">
                            <input value={letterSettings.companyName} onChange={(e) => setLetterSettings((s) => ({ ...s, companyName: e.target.value }))} placeholder="Company Name" className="rounded-lg border px-3 py-2 text-sm" />
                            <input value={letterSettings.companyAddress} onChange={(e) => setLetterSettings((s) => ({ ...s, companyAddress: e.target.value }))} placeholder="Company Address" className="rounded-lg border px-3 py-2 text-sm" />
                            <input type="date" value={letterSettings.letterDate} onChange={(e) => setLetterSettings((s) => ({ ...s, letterDate: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" />
                            <input value={letterSettings.signatoryName} onChange={(e) => setLetterSettings((s) => ({ ...s, signatoryName: e.target.value }))} placeholder="Signatory Name" className="rounded-lg border px-3 py-2 text-sm" />
                            <input value={letterSettings.signatoryRole} onChange={(e) => setLetterSettings((s) => ({ ...s, signatoryRole: e.target.value }))} placeholder="Signatory Role" className="rounded-lg border px-3 py-2 text-sm" />
                            <textarea value={letterSettings.body} onChange={(e) => setLetterSettings((s) => ({ ...s, body: e.target.value }))} placeholder="Custom letter body (optional)" className="min-h-[90px] rounded-lg border px-3 py-2 text-sm" />
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white" onClick={() => openPrintableLetter("offer")}><FaPrint className="mr-2 inline" /> Offer Letter</button>
                            <button className="rounded-lg border px-3 py-2 text-sm font-semibold" onClick={() => openPrintableLetter("experience")}><FaPrint className="mr-2 inline" /> Experience Letter</button>
                            <button className="rounded-lg border px-3 py-2 text-sm font-semibold" onClick={() => downloadLetter("offer")}>Download Offer Letter</button>
                            <button className="rounded-lg border px-3 py-2 text-sm font-semibold" onClick={() => downloadLetter("experience")}>Download Experience Letter</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {selected && activeTab === "attendance" ? (
                    <div className="space-y-3">
                      <div className="text-sm font-bold text-red-700">Attendance (Backdated Supported)</div>
                      <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2">
                        <div className="text-xs text-indigo-700">
                          Employee Self-Attendance Link:{" "}
                          <a href={selfAttendanceLink} target="_blank" rel="noreferrer" className="font-semibold underline">
                            {selfAttendanceLink}
                          </a>
                        </div>
                        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-4">
                          <input value={selected.employeeCode || ""} readOnly className="rounded-lg border px-3 py-2 text-xs bg-white" />
                          <input value={selected.mobile || ""} readOnly className="rounded-lg border px-3 py-2 text-xs bg-white" />
                          <button
                            className="rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-white"
                            onClick={() => navigator.clipboard.writeText(selfAttendanceLink)}
                          >
                            Copy Link
                          </button>
                          <button
                            className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                            onClick={async () => {
                              if (!selected.employeeCode || !selected.mobile) return;
                              await markSelfAttendance({
                                employeeCode: selected.employeeCode,
                                mobile: selected.mobile,
                                date: attendance.date,
                                status: attendance.status as any,
                                checkIn: attendance.checkIn,
                                checkOut: attendance.checkOut,
                                notes: "Marked by employee link flow",
                              });
                              await h.loadAttendance(selected.id, attendance.from, attendance.to);
                            }}
                          >
                            Test Self Mark
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                        <input type="date" value={attendance.date} onChange={(e) => setAttendance((s) => ({ ...s, date: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" />
                        <select value={attendance.status} onChange={(e) => setAttendance((s) => ({ ...s, status: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm"><option>PRESENT</option><option>ABSENT</option><option>HALF_DAY</option><option>LEAVE</option></select>
                        <input value={attendance.notes} onChange={(e) => setAttendance((s) => ({ ...s, notes: e.target.value }))} placeholder="Notes" className="rounded-lg border px-3 py-2 text-sm" />
                        <input value={attendance.checkIn} onChange={(e) => setAttendance((s) => ({ ...s, checkIn: e.target.value }))} placeholder="Check-in HH:mm" className="rounded-lg border px-3 py-2 text-sm" />
                        <input value={attendance.checkOut} onChange={(e) => setAttendance((s) => ({ ...s, checkOut: e.target.value }))} placeholder="Check-out HH:mm" className="rounded-lg border px-3 py-2 text-sm" />
                        <button className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white" onClick={async () => { await upsertAttendance(selected.id, { date: attendance.date, status: attendance.status, checkIn: attendance.checkIn, checkOut: attendance.checkOut, notes: attendance.notes }); await h.loadAttendance(selected.id, attendance.from, attendance.to); }}>Save Attendance</button>
                      </div>

                      <div className="grid grid-cols-1 gap-2 rounded-xl border p-3 md:grid-cols-4">
                        <input type="date" value={attendance.from} onChange={(e) => setAttendance((s) => ({ ...s, from: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" />
                        <input type="date" value={attendance.to} onChange={(e) => setAttendance((s) => ({ ...s, to: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" />
                        <button className="rounded-lg border px-3 py-2 text-sm font-semibold" onClick={() => h.loadAttendance(selected.id, attendance.from, attendance.to)}>Load Range</button>
                        <div className="self-center text-xs text-gray-500">Supports old/backdated entries</div>
                      </div>

                      <div className="max-h-[38vh] overflow-auto rounded-xl border">
                        <table className="min-w-full text-sm"><thead className="bg-red-50"><tr><th className="px-2 py-2 text-left">Date</th><th className="px-2 py-2 text-left">Status</th><th className="px-2 py-2 text-left">In</th><th className="px-2 py-2 text-left">Out</th><th className="px-2 py-2 text-left">Notes</th><th className="px-2 py-2 text-left">Actions</th></tr></thead><tbody>{h.attendance.map((a: any) => <tr key={a.id} className="border-t"><td className="px-2 py-2">{String(a.date).slice(0,10)}</td><td className="px-2 py-2">{a.status}</td><td className="px-2 py-2">{a.checkIn || "-"}</td><td className="px-2 py-2">{a.checkOut || "-"}</td><td className="px-2 py-2">{a.notes || "-"}</td><td className="px-2 py-2"><div className="flex gap-2"><button className="rounded border px-2 py-1 text-xs font-semibold hover:bg-red-50" onClick={() => setAttendance((s) => ({ ...s, date: String(a.date).slice(0, 10), status: a.status || "PRESENT", checkIn: a.checkIn || "", checkOut: a.checkOut || "", notes: a.notes || "" }))}>Edit</button><button className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700" onClick={async () => { const ok = window.confirm("Delete this attendance entry?"); if (!ok) return; await deleteAttendance(selected.id, a.id); await h.loadAttendance(selected.id, attendance.from, attendance.to); }}>Delete</button></div></td></tr>)}</tbody></table>
                      </div>
                    </div>
                  ) : null}

                  {selected && activeTab === "payroll" ? (
                    <div className="space-y-3">
                      <div className="text-sm font-bold text-red-700">Payroll & Salary Slip Generator</div>
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                        Keep deductions as zero for full salary. If deduction exists, add amount + title/remark.
                      </div>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                        <input type="number" value={salary.month} onChange={(e) => setSalary((s) => ({ ...s, month: Number(e.target.value) }))} placeholder="Month (1-12)" className="rounded-lg border px-3 py-2 text-sm" />
                        <input type="number" value={salary.year} onChange={(e) => setSalary((s) => ({ ...s, year: Number(e.target.value) }))} placeholder="Year" className="rounded-lg border px-3 py-2 text-sm" />
                        <input type="number" value={salary.deductionExtra} onChange={(e) => setSalary((s) => ({ ...s, deductionExtra: Number(e.target.value) }))} placeholder="Deduction Amount (optional)" className="rounded-lg border px-3 py-2 text-sm" />
                        <input value={salary.deductionTitle} onChange={(e) => setSalary((s) => ({ ...s, deductionTitle: e.target.value }))} placeholder="Deduction Title (optional)" className="rounded-lg border px-3 py-2 text-sm" />
                        <input value={salary.deductionRemark} onChange={(e) => setSalary((s) => ({ ...s, deductionRemark: e.target.value }))} placeholder="Deduction Remark (optional)" className="rounded-lg border px-3 py-2 text-sm" />
                        <button className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white" onClick={async () => {
                          await generateSalarySlip(selected.id, {
                            month: salary.month,
                            year: salary.year,
                            additions: 0,
                            bonus: 0,
                            deductionExtra: salary.deductionExtra,
                            deductionLines:
                              salary.deductionExtra > 0
                                ? [
                                    {
                                      label: salary.deductionTitle || "Manual Deduction",
                                      remark: salary.deductionRemark || undefined,
                                      amount: salary.deductionExtra,
                                    },
                                  ]
                                : [],
                          });
                          await h.loadSalarySlips(selected.id);
                        }}>Generate / Regenerate Slip</button>
                      </div>

                      <div className="max-h-[42vh] overflow-auto rounded-xl border">
                        <table className="min-w-full text-sm"><thead className="bg-red-50"><tr><th className="px-2 py-2 text-left">Month</th><th className="px-2 py-2 text-left">Paid Days</th><th className="px-2 py-2 text-left">Gross</th><th className="px-2 py-2 text-left">Deductions</th><th className="px-2 py-2 text-left">Net</th><th className="px-2 py-2 text-left">Actions</th></tr></thead><tbody>{h.salarySlips.map((s: any) => <tr key={s.id} className="border-t"><td className="px-2 py-2">{s.month}/{s.year}</td><td className="px-2 py-2">{s.paidDays}/{s.workingDays}</td><td className="px-2 py-2">{money(s.grossSalary)}</td><td className="px-2 py-2">{money(s.totalDeductions)}</td><td className="px-2 py-2 font-bold text-emerald-700">{money(s.netSalary)}</td><td className="px-2 py-2"><div className="flex gap-2"><button className="rounded-lg border px-2 py-1 text-xs font-semibold hover:bg-red-50" onClick={async () => { await downloadSalarySlipFile(selected.id, s.id); }}>Download</button><button className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700" onClick={async () => { const ok = window.confirm("Delete this salary slip?"); if (!ok) return; await deleteSalarySlip(selected.id, s.id); await h.loadSalarySlips(selected.id); }}>Delete</button></div></td></tr>)}</tbody></table>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>

          {h.error ? <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{h.error}</div> : null}
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;
















import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
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
const isValidEmail = (v: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const sanitizeMobile = (v: string) => v.replace(/\D/g, "").slice(-10);
const isValidMobile = (v: string) => /^\d{10}$/.test(sanitizeMobile(v));
const isValidTimeHHmm = (v: string) => !v || /^([01]\d|2[0-3]):([0-5]\d)$/.test(v.trim());

const cardClass =
  "rounded-2xl border border-red-100 bg-white/95 shadow-sm hover:shadow-md transition-shadow";

const emptyEmployeeForm = {
  firstName: "",
  lastName: "",
  fatherName: "",
  motherName: "",
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
  fatherName: "Father Name",
  motherName: "Mother Name",
  designation: "Designation",
  department: "Department",
  joiningDate: "Joining Date",
  dob: "Date of Birth",
  email: "Email",
  mobile: "Mobile Number",
  salaryBasic: "Basic Salary",
  salaryHra: "HRA",
  salaryAllowances: "Special Allowances",
  defaultDeductions: "Standard Monthly Deductions",
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
const requiredFieldKeys = ["firstName", "lastName", "mobile", "designation", "joiningDate"] as const;
const employeeDateFieldKeys = new Set(["joiningDate", "dob", "leftDate"]);
const employeeNumberFieldKeys = new Set(["salaryBasic", "salaryHra", "salaryAllowances", "defaultDeductions"]);
const employeeInputType = (key: string) => {
  if (employeeDateFieldKeys.has(key) || key.toLowerCase().endsWith("date")) return "date";
  if (employeeNumberFieldKeys.has(key)) return "number";
  return "text";
};
const parentDocumentCategories = ["FATHER_ID_PROOF", "FATHER_ADDRESS_PROOF", "MOTHER_ID_PROOF", "MOTHER_ADDRESS_PROOF"];
const employeeProfileSteps = [
  {
    id: "personal",
    title: "Personal Details",
    fields: ["firstName", "lastName", "fatherName", "motherName", "dob", "mobile", "email", "emergencyContact", "address"],
  },
  {
    id: "employment",
    title: "Employment Details",
    fields: ["designation", "department", "joiningDate", "status"],
  },
  {
    id: "bank",
    title: "Bank & KYC Details",
    fields: ["bankName", "bankAccountNumber", "ifscCode", "panNumber", "aadhaarNumber"],
  },
  {
    id: "salary",
    title: "Salary & Admin Details",
    fields: ["salaryBasic", "salaryHra", "salaryAllowances", "defaultDeductions", "notes"],
  },
] as const;
const LETTER_DRAFTS_KEY = "employee_letter_standard_drafts_v1";
const DEFAULT_OFFER_TEMPLATE = `<p>Dear <b>{{CANDIDATE_NAME}}</b>,</p>
<p>We are pleased to offer you the position of <b>{{DESIGNATION}}</b> with <b>{{COMPANY_NAME}}</b></p>
<p>Your joining date will be <b>{{JOINING_DATE}}</b>.</p>
<p>
You are being appointed as <b>{{DESIGNATION}}</b> in the <b>{{DEPARTMENT_NAME}}</b> department at <b>{{COMPANY_NAME}}</b>. 
You will report to <b>{{MANAGER_NAME}}</b> and will be based at <b>{{WORK_LOCATION}}</b>. 
In this role, you will be responsible for performing your duties diligently and adhering to company policies and standards. 
Your monthly remuneration will be <b>{{MONTHLY_SALARY}}</b>, along with applicable benefits as per company norms.
</p>
<p>You will be responsible for sample collection, patient handling, and ensuring adherence to medical and safety protocols as per company standards.</p>
<p>This offer is subject to the terms and conditions mentioned in <b>Annexure A (Page 2)</b> of this letter.</p>
<p>Kindly sign and return a copy of this letter as a token of your acceptance.</p>
<p>We look forward to welcoming you to our team and wish you a successful journey with us.</p>
<p>Warm regards,</p>
<p><b>{{YOUR_NAME}}</b><br/>{{YOUR_DESIGNATION}}<br/>{{COMPANY_NAME}}</p>
<p><b>Acceptance of Offer</b></p>
<p>I, <b>{{CANDIDATE_NAME}}</b>, accept the terms of employment mentioned in this letter.</p>
<p>Signature: ____________________</p>
<p>Date: ____________________</p>
<p>{{PAGE_BREAK}}</p>

<p><b>Annexure A - Terms & Conditions of Employment</b></p>
<p><b>1. Probation Period</b><br/>
You will be on probation for <b>{{PROBATION_PERIOD}}</b>. Your performance and conduct will be reviewed during this period, and confirmation will be subject to satisfactory performance.</p>
<p><b>2. Working Hours & Deployment</b><br/>
Your working hours will be <b>{{WORKING_HOURS}}</b>. You may be required to work in shifts, on weekends, or travel for home sample collection and other field duties as per business requirements.</p>
<p><b>3. Duties & Responsibilities</b><br/>
You are required to perform your duties responsibly and ensure adherence to all medical and operational standards. Your responsibilities include:</p>
<ul>
  <li>Collection of blood and other samples using standard procedures</li>
  <li>Ensuring patient identification and comfort during procedures</li>
  <li>Proper labeling, handling, storage, and transportation of samples</li>
  <li>Maintaining accurate records and documentation</li>
  <li>Following hygiene, safety, and infection control protocols</li>
  <li>Maintaining professional conduct with patients and staff</li>
</ul>
<p><b>4. Compensation & Benefits</b><br/>
You will be paid a monthly salary subject to statutory deductions. You may also be eligible for incentives, reimbursements, or additional benefits as per company policy, which may be revised from time to time.</p>
<p><b>5. Confidentiality</b><br/>
You shall maintain strict confidentiality of all patient information, company data, and internal processes. Any breach of confidentiality may result in disciplinary action, including termination.</p>
<p><b>6. Code of Conduct</b><br/>
You are expected to maintain discipline, integrity, and ethical behavior at all times. Any misconduct, negligence, or violation of company policies will be subject to disciplinary action.</p>
<p><b>7. Attendance & Leave</b><br/>
You are required to maintain regular attendance. Leave entitlement will be <b>{{MONTHLY_LEAVES}}</b> per month and must be approved by your reporting manager.</p>
<p><b>8. Safety & Compliance</b><br/>
You must follow all safety guidelines, infection control measures, and healthcare compliance protocols. Use of protective equipment and adherence to safety standards is mandatory.</p>
<p><b>9. Company Property</b><br/>
Any company assets provided to you must be used responsibly and returned upon termination or as required by the company.</p>
<p><b>10. Termination</b><br/>
Either party may terminate employment by giving <b>{{NOTICE_PERIOD}}</b> notice or salary in lieu thereof. Immediate termination may occur in case of misconduct or policy violations.</p>
<p><b>11. General Terms</b><br/>
Your employment is subject to verification of documents and compliance with company policies. The company reserves the right to modify policies as necessary.</p>
<p><b>Declaration</b></p>
<p>I, <b>{{CANDIDATE_NAME}}</b>, confirm that I have read and understood the above terms and agree to abide by them.</p>
<p>Signature: ____________________</p>
<p>Date: ____________________</p>`;

const DEFAULT_EXPERIENCE_TEMPLATE = `<p><b>TO WHOMSOEVER IT MAY CONCERN</b></p>
<p>This is to certify that <b>{{EMPLOYEE_NAME}}</b> was employed with <b>{{COMPANY_NAME}}</b> as a <b>Phlebotomist</b> from <b>{{START_DATE}}</b> to <b>{{END_DATE}}</b>.</p>
<p>During their tenure with us, they were responsible for:</p>
<ul>
  <li>Collecting blood samples from patients using proper venipuncture techniques</li>
  <li>Ensuring correct labeling, storage, and transportation of samples</li>
  <li>Maintaining accurate patient records and documentation</li>
  <li>Following hygiene, safety, and infection control protocols</li>
  <li>Coordinating with laboratory staff for timely processing of samples</li>
</ul>
<p><b>{{EMPLOYEE_NAME}}</b> has demonstrated good technical skills, professionalism, and dedication toward patient care. They maintained a high level of accuracy and ensured patient comfort during sample collection.</p>
<p>Their conduct during the period of employment was found to be <b>{{CONDUCT_RATING}}</b>, and we found them to be a sincere and responsible team member.</p>
<p>We wish them success in all their future endeavors.</p>
<p>{{CLOSING_LINE}}</p>
<p><b>{{AUTHORIZED_SIGNATORY_NAME}}</b><br/>{{AUTHORIZED_SIGNATORY_DESIGNATION}}<br/>{{COMPANY_NAME}}</p>
<p>{{COMPANY_SEAL}}</p>`;
const DEFAULT_PHLEBOTOMIST_EXPERIENCE_TEMPLATE = DEFAULT_EXPERIENCE_TEMPLATE;

const pickExperienceTemplateByRole = (_designation: string) => DEFAULT_EXPERIENCE_TEMPLATE;

const EmployeeManagement: React.FC = () => {
  const navigate = useNavigate();
  const h = useEmployeeManagement();

  const [activeTab, setActiveTab] = useState<TabKey>("directory");
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [letterheadFile, setLetterheadFile] = useState<File | null>(null);
  const [letterheadTitle, setLetterheadTitle] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [docRemarks, setDocRemarks] = useState("");
  const [form, setForm] = useState<any>(emptyEmployeeForm);
  const [profileStepIndex, setProfileStepIndex] = useState(0);
  const [attendance, setAttendance] = useState({
    from: toYmd(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
    to: toYmd(new Date()),
    date: toYmd(new Date()),
    status: "PRESENT",
    checkIn: "09:30",
    checkOut: "18:30",
    notes: "",
  });
  const [attendanceActionReason, setAttendanceActionReason] = useState("");
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
    location: "",
    managerName: "",
    offerDepartmentName: "",
    offerMonthlySalary: "",
    monthlyLeaves: "",
    offerJoiningDate: "",
    incentives: "",
    benefits: "",
    workingHours: "",
    weeklyOffs: "",
    probationPeriod: "3/6 months",
    noticePeriod: "",
    acceptanceLastDate: "",
    contactDetails: "",
    conductRating: "Good",
    companySeal: "Company Seal",
    experienceStartDate: "",
    experienceEndDate: "",
    body: "",
    letterDate: "",
    closingLine: "Sincerely,",
  });
  const [letterDrafts, setLetterDrafts] = useState({
    useStandardOffer: true,
    useStandardExperience: true,
    offerTemplate: DEFAULT_OFFER_TEMPLATE,
    experienceTemplate: DEFAULT_PHLEBOTOMIST_EXPERIENCE_TEMPLATE,
  });
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [formatState, setFormatState] = useState({
    bold: false,
    underline: false,
    italic: false,
    bullet: false,
  });
  const [letterModalOpen, setLetterModalOpen] = useState(false);
  const [letterModalTab, setLetterModalTab] = useState<"offer" | "experience">("offer");

  const stats = useMemo(() => {
    const total = h.employees.length;
    const active = h.employees.filter((e) => e.status === "ACTIVE").length;
    const left = h.employees.filter((e) => e.status === "LEFT").length;
    const monthlyPayroll = h.salarySlips.reduce((sum, s: any) => sum + Number(s.netSalary || 0), 0);
    return { total, active, left, monthlyPayroll };
  }, [h.employees, h.salarySlips]);

  const selected = h.selectedEmployee as (Employee & { documents?: any[] }) | null;
  const selfAttendanceLink = `${window.location.origin}/employee-attendance`;
  const canUsePortal = typeof document !== "undefined";
  const activeProfileStep = employeeProfileSteps[profileStepIndex] || employeeProfileSteps[0];
  const isFirstProfileStep = profileStepIndex === 0;
  const isLastProfileStep = profileStepIndex === employeeProfileSteps.length - 1;

  const hydrateFormFromEmployee = (emp: any) => {
    setForm({
      firstName: emp.firstName || "",
      lastName: emp.lastName || "",
      fatherName: emp.fatherName || "",
      motherName: emp.motherName || "",
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
    setProfileStepIndex(0);
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


  const startOnboarding = () => {
    setIsOnboarding(true);
    setForm(emptyEmployeeForm);
    setPhotoFile(null);
    setProfileStepIndex(0);
    h.setSelectedEmployee(null);
    setActiveTab("profile");
  };
  const generateLetterPdf = async (kind: "offer" | "experience") => {
    if (!selected) return null;

    const toLongDate = (d?: string | Date | null) => {
      if (!d) return "";
      const dt = typeof d === "string" ? new Date(d) : d;
      if (Number.isNaN(dt.getTime())) return "";
      const day = dt.getDate();
      const suffix = day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th";
      const month = dt.toLocaleString("en-IN", { month: "long" });
      return `${day}${suffix} ${month} ${dt.getFullYear()}`;
    };
    const date = letterSettings.letterDate ? toLongDate(letterSettings.letterDate) : "";
    const fullName = `${selected.firstName || ""} ${selected.lastName || ""}`.trim();
    const joiningDate = letterSettings.offerJoiningDate
      ? toLongDate(letterSettings.offerJoiningDate)
      : selected.joiningDate
      ? toLongDate(selected.joiningDate)
      : "";
    const today = toLongDate(new Date());
    const experienceStartDate = letterSettings.experienceStartDate ? toLongDate(letterSettings.experienceStartDate) : joiningDate;
    const experienceEndDate = letterSettings.experienceEndDate ? toLongDate(letterSettings.experienceEndDate) : date || today;
    const fmtValue = (v: unknown, emptyFallback = "N/A") => {
      const s = String(v ?? "").trim();
      return s ? s : emptyFallback;
    };
    const monthlyCtc =
      Number(selected.salaryBasic || 0) + Number(selected.salaryHra || 0) + Number(selected.salaryAllowances || 0);
    const monthlySalaryAuto = monthlyCtc > 0 ? `Rs${monthlyCtc.toLocaleString("en-IN")}` : "N/A";

    const tokenValues: Record<string, string> = {
      EMPLOYEE_NAME: fmtValue(fullName),
      CANDIDATE_NAME: fmtValue(fullName),
      DESIGNATION: fmtValue(selected.designation),
      DEPARTMENT_NAME: fmtValue(letterSettings.offerDepartmentName || selected.department),
      JOINING_DATE: fmtValue(joiningDate),
      START_DATE: fmtValue(experienceStartDate),
      END_DATE: fmtValue(experienceEndDate),
      COMPANY_NAME: fmtValue(letterSettings.companyName),
      LETTER_DATE: fmtValue(date),
      TODAY_DATE: fmtValue(today),
      LETTER_DATE_OR_TODAY: fmtValue(date || today),
      LOCATION: fmtValue(letterSettings.location || letterSettings.companyAddress),
      WORK_LOCATION: fmtValue(letterSettings.location || letterSettings.companyAddress),
      MANAGER_NAME: fmtValue(letterSettings.managerName || letterSettings.signatoryName),
      MONTHLY_SALARY: fmtValue(letterSettings.offerMonthlySalary || monthlySalaryAuto),
      MONTHLY_LEAVES: fmtValue(letterSettings.monthlyLeaves || "N/A"),
      INCENTIVES: fmtValue(letterSettings.incentives, "N/A"),
      BENEFITS: fmtValue(letterSettings.benefits, "Nil"),
      WORKING_HOURS: fmtValue(letterSettings.workingHours),
      WEEKLY_OFFS: fmtValue(letterSettings.weeklyOffs),
      PROBATION_PERIOD: fmtValue(letterSettings.probationPeriod),
      NOTICE_PERIOD: fmtValue(letterSettings.noticePeriod),
      LAST_DATE: fmtValue(letterSettings.acceptanceLastDate ? toLongDate(letterSettings.acceptanceLastDate) : ""),
      YOUR_NAME: fmtValue(letterSettings.signatoryName),
      YOUR_DESIGNATION: fmtValue(letterSettings.signatoryRole),
      AUTHORIZED_SIGNATORY_NAME: fmtValue(letterSettings.signatoryName),
      AUTHORIZED_SIGNATORY_DESIGNATION: fmtValue(letterSettings.signatoryRole),
      CONTACT_DETAILS: fmtValue(letterSettings.contactDetails),
      CONDUCT_RATING: fmtValue(letterSettings.conductRating, "Good"),
      COMPANY_SEAL: fmtValue(letterSettings.companySeal, "Company Seal"),
      CLOSING_LINE: fmtValue(letterSettings.closingLine, "Sincerely,"),
      PAGE_BREAK: "__PAGE_BREAK__",
    };
    const replaceToken = (text: string, key: string, value: string) => {
      let out = text;
      out = out.split(`{{${key}}}`).join(value);
      out = out.split(`[${key}]`).join(value);
      return out;
    };
    const fillTemplate = (tpl: string) => {
      let out = tpl || "";
      Object.entries(tokenValues).forEach(([key, value]) => {
        out = replaceToken(out, key, value);
      });
      return out;
    };
    const sanitizeStandardTemplate = (tpl: string, letterKind: "offer" | "experience") => {
      let out = tpl || "";
      // Remove legacy Subject line if previously saved in localStorage drafts.
      out = out.replace(/<p>\s*<b>\s*Subject:[\s\S]*?<\/b>\s*<\/p>/gi, "");
      if (letterKind === "offer") {
        // Greeting is drawn separately in PDF; remove template-level greeting to avoid duplicate Dear line.
        out = out.replace(/<p>\s*Dear[\s\S]*?<\/p>/i, "");
      }
      if (letterKind === "experience") {
        // Ensure employee name stays bold in the core certification sentence.
        out = out.replace(/This is to certify that\s*(?!<b>)\s*\{\{EMPLOYEE_NAME\}\}/i, "This is to certify that <b>{{EMPLOYEE_NAME}}</b>");
      }
      return out.trim();
    };
    const fallbackBody =
      kind === "offer"
        ? `This is to formally offer employment to ${fullName} for the role of ${selected.designation}. Your joining date is ${joiningDate}.`
        : `This is to certify that ${fullName} worked with ${letterSettings.companyName} as ${selected.designation} from ${joiningDate} to ${today}.`;
    const resolvedExperienceTemplate = pickExperienceTemplateByRole(selected.designation || "");
    const customBody =
      kind === "offer" && letterDrafts.useStandardOffer
        ? fillTemplate(sanitizeStandardTemplate(letterDrafts.offerTemplate || DEFAULT_OFFER_TEMPLATE, "offer"))
        : kind === "experience" && letterDrafts.useStandardExperience
        ? fillTemplate(sanitizeStandardTemplate(resolvedExperienceTemplate, "experience"))
        : letterSettings.body.trim() || fallbackBody;

    const pdfDoc = await PDFDocument.create();
    let page: any;
    let pageWidth = 595.28;
    let pageHeight = 841.89;
    let embeddedLetterheadPage: any = null;
    let embeddedLetterheadImage: any = null;

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
        embeddedLetterheadPage = await pdfDoc.embedPage(lhPage);
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        page.drawPage(embeddedLetterheadPage, { x: 0, y: 0, width: pageWidth, height: pageHeight });
      } else if (isPng || isJpg) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        embeddedLetterheadImage = isPng ? await pdfDoc.embedPng(letterheadBytes) : await pdfDoc.embedJpg(letterheadBytes);
        page.drawImage(embeddedLetterheadImage, { x: 0, y: 0, width: pageWidth, height: pageHeight });
      }
    }

    if (!page) page = pdfDoc.addPage([pageWidth, pageHeight]);

    let font;
    let bold;
    let italic;
    let boldItalic;
    try {
      font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      bold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      italic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
      boldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);
    } catch (_e) {
      // Safe fallback for environments where Times isn't available.
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
      boldItalic = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);
    }
    const marginX = 48;
    const bodyX = marginX;
    const startY = pageHeight - 128;
    const headerTopGap = 18;
    const maxWidth = pageWidth - marginX * 2;
    const bottomSafeY = 150;
    let y = startY - headerTopGap;
    const pageStartY = startY - headerTopGap;

    const addNewPage = (): any => {
      const p = pdfDoc.addPage([pageWidth, pageHeight]);
      if (embeddedLetterheadPage) {
        p.drawPage(embeddedLetterheadPage, { x: 0, y: 0, width: pageWidth, height: pageHeight });
      } else if (embeddedLetterheadImage) {
        p.drawImage(embeddedLetterheadImage, { x: 0, y: 0, width: pageWidth, height: pageHeight });
      }
      return p;
    };

    const ensureSpace = (requiredHeight: number) => {
      if (y - requiredHeight < bottomSafeY) {
        page = addNewPage();
        y = pageStartY;
      }
    };

    type RichRun = { text: string; bold?: boolean; italic?: boolean; underline?: boolean };
    const pickFont = (r: RichRun) => {
      if (r.bold && r.italic) return boldItalic;
      if (r.bold) return bold;
      if (r.italic) return italic;
      return font;
    };
    const parseRichParagraphs = (input: string): RichRun[][] => {
      const root = document.createElement("div");
      root.innerHTML = input;
      const paragraphs: RichRun[][] = [];
      let current: RichRun[] = [];
      const flush = () => {
        if (current.length) paragraphs.push(current);
        current = [];
      };
      const walk = (
        node: Node,
        style: { bold: boolean; italic: boolean; underline: boolean } = { bold: false, italic: false, underline: false },
      ) => {
        if (node.nodeType === Node.TEXT_NODE) {
          let t = (node.textContent || "").replace(/\s+/g, " ");
          if (current.length === 0) t = t.trimStart();
          if (t) current.push({ text: t, bold: style.bold, italic: style.italic, underline: style.underline });
          return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();
        const nextStyle = {
          bold: style.bold || tag === "b" || tag === "strong",
          italic: style.italic || tag === "i" || tag === "em",
          underline: style.underline || tag === "u",
        };
        if (tag === "br") {
          flush();
          return;
        }
        if (tag === "li") current.push({ text: "- ", bold: nextStyle.bold, italic: nextStyle.italic, underline: nextStyle.underline });
        const children = Array.from(el.childNodes);
        children.forEach((c) => walk(c, nextStyle));
        if (["p", "div", "li", "h1", "h2", "h3"].includes(tag)) flush();
      };
      Array.from(root.childNodes).forEach((n) => walk(n));
      flush();
      return paragraphs.length ? paragraphs : [[{ text: fallbackBody }]];
    };

    const sanitizeText = (text: string) =>
      text.replace(/[^\x00-\xFF]/g, "");

    const drawWrappedRuns = (runs: RichRun[], size = 11.2, lineGap = 15.5) => {
      let line: RichRun[] = [];
      let lineWidth = 0;
      let isFirstLine = true;
      const paragraphText = runs.map((r) => r.text).join("").trim();
      const isBulletParagraph = paragraphText.startsWith("- ");
      const listIndent = 12;
      const bulletGap = 10;
      const firstLineX = isBulletParagraph ? bodyX + bulletGap : bodyX;
      const otherLinesX = isBulletParagraph ? bodyX + bulletGap : bodyX;
      const maxParagraphWidth = isBulletParagraph ? maxWidth - listIndent : maxWidth;
      const drawLine = (items: RichRun[]) => {
        ensureSpace(lineGap + 4);
        let x = isFirstLine ? firstLineX : otherLinesX;
        if (isBulletParagraph && items.length > 0 && items[0].text.startsWith("- ")) {
          const bulletFont = bold; // better visibility

          // draw bullet separately
          page.drawText("•", {
            x: bodyX,
            y,
            size,
            font: bulletFont,
            color: rgb(0.1, 0.1, 0.1),
          });

          // remove "- " from text
          items[0] = {
            ...items[0],
            text: items[0].text.replace(/^-\s*/, ""),
          };
        }
        items.forEach((it) => {
          const f = pickFont(it);
          page.drawText(sanitizeText(it.text), { x, y, size, font: f, color: rgb(0.1, 0.1, 0.1) });
          const w = f.widthOfTextAtSize(it.text, size);
          if (it.underline) {
            page.drawLine({
              start: { x, y: y - 1.8 },
              end: { x: x + w, y: y - 1.8 },
              thickness: 0.7,
              color: rgb(0.1, 0.1, 0.1),
            });
          }
          x += w;
        });
        y -= lineGap;
        isFirstLine = false;
      };
      const pushToken = (token: string, proto: RichRun) => {
        if (!line.length && /^\s+$/.test(token)) return;
        const chunk: RichRun = { ...proto, text: token };
        const f = pickFont(chunk);
        const w = f.widthOfTextAtSize(token, size);
        if (lineWidth + w > maxParagraphWidth && line.length) {
          drawLine(line);
          line = [];
          lineWidth = 0;
        }
        line.push(chunk);
        lineWidth += w;
      };
      runs.forEach((r) => {
        const tokens = r.text.split(/(\s+)/).filter((t) => t.length > 0);
        tokens.forEach((t) => pushToken(t, r));
      });
      if (line.length) drawLine(line);
    };

    const bodyFontSize = 11.8;
    const bodyLineGap = 17;
    const paragraphGap = 7;

    const title = (kind === "offer" ? "Offer Letter" : "Experience Letter").toUpperCase();
    const titleSize = 20;
    const titleWidth = bold.widthOfTextAtSize(title, titleSize);
    const titleX = Math.max(marginX, (pageWidth - titleWidth) / 2);
    page.drawText(title, { x: titleX, y, size: titleSize, font: bold, color: rgb(0.1, 0.1, 0.1) });
    y -= 18;
    if (date) {
      page.drawText(`Date: ${date}`, { x: marginX, y, size: 11, font, color: rgb(0.2, 0.2, 0.2) });
      y -= 22;
    } else {
      y -= 14;
    }
    const dearPrefix = "Dear ";
    const dearPrefixWidth = font.widthOfTextAtSize(dearPrefix, 12);
    ensureSpace(30);
    page.drawText(dearPrefix, { x: bodyX, y, size: 12, font, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(`${fullName},`, { x: bodyX + dearPrefixWidth, y, size: 12, font: bold, color: rgb(0.1, 0.1, 0.1) });
    y -= 18;
    const paragraphs = parseRichParagraphs(customBody);
    paragraphs.forEach((runs) => {
      const markerText = runs.map((r) => r.text).join("").trim();
      if (markerText === "__PAGE_BREAK__") {
        page = addNewPage();
        y = pageStartY;
        return;
      }
      if (["Acceptance of Offer", "Declaration"].includes(markerText)) {
        const sectionHeight = 120;

        if (y - sectionHeight < bottomSafeY) {
          page = addNewPage();
          y = pageStartY;
        }
        y -= 6;
        page.drawLine({
          start: { x: bodyX, y },
          end: { x: pageWidth - marginX, y },
          thickness: 0.7,
          color: rgb(0.45, 0.45, 0.45),
        });
        y -= 12;
      }
      drawWrappedRuns(runs, bodyFontSize, bodyLineGap);
      y -= paragraphGap;
    });
    const shouldAppendSignatureBlock = !(
      (kind === "offer" && letterDrafts.useStandardOffer) ||
      (kind === "experience" && letterDrafts.useStandardExperience)
    );
    if (shouldAppendSignatureBlock) {
      // Ensure enough space BEFORE writing signature
      const signatureBlockHeight = 100;

      if (y - signatureBlockHeight < bottomSafeY) {
        page = addNewPage();
        y = pageStartY;
      }

      y -= 12;
      page.drawText(letterSettings.closingLine || "Sincerely,", { x: bodyX, y, size: 12, font, color: rgb(0.1, 0.1, 0.1) });
      y -= 30;
      page.drawText(letterSettings.signatoryName, { x: bodyX, y, size: 12, font: bold, color: rgb(0.1, 0.1, 0.1) });
      y -= 16;
      page.drawText(letterSettings.signatoryRole, { x: bodyX, y, size: 11, font, color: rgb(0.1, 0.1, 0.1) });
    }

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

  const validateEmployeeForm = () => {
    const missingLabels = requiredFieldKeys
      .filter((k) => !String(form[k] || "").trim())
      .map((k) => fieldLabels[k]);
    if (missingLabels.length) {
      window.alert(`Please fill required fields: ${missingLabels.join(", ")}`);
      return false;
    }
    if (!isValidMobile(String(form.mobile || ""))) {
      window.alert("Mobile Number must be exactly 10 digits.");
      return false;
    }
    if (!isValidEmail(String(form.email || ""))) {
      window.alert("Please enter a valid email address.");
      return false;
    }
    if (!String(form.joiningDate || "").trim()) {
      window.alert("Joining Date is required.");
      return false;
    }
    const numericFields = ["salaryBasic", "salaryHra", "salaryAllowances", "defaultDeductions"];
    for (const key of numericFields) {
      const v = Number(form[key] || 0);
      if (!Number.isFinite(v) || v < 0) {
        window.alert(`${fieldLabels[key] || key} cannot be negative.`);
        return false;
      }
    }
    return true;
  };

  const filePicker = (
    id: string,
    label: string,
    file: File | null,
    onChange: (file: File | null) => void,
    accept?: string,
  ) => (
    <label htmlFor={id} className="block cursor-pointer rounded-xl border border-dashed border-red-200 bg-white px-4 py-3 text-sm transition hover:border-red-400 hover:bg-red-50">
      <input
        id={id}
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="sr-only"
      />
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-red-700">{label}</div>
          <div className="truncate text-xs text-gray-500">{file?.name || "No file selected"}</div>
        </div>
        <span className="shrink-0 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white">
          <FaUpload className="mr-1 inline" /> Choose
        </span>
      </div>
    </label>
  );

  const buildAttendanceNotes = (actionLabel: string) => {
    const baseNotes = String(attendance.notes || "").trim();
    const reason = String(attendanceActionReason || "").trim();
    const adminTrail = `${actionLabel}${reason ? `: ${reason}` : ""}`;
    return [baseNotes, adminTrail].filter(Boolean).join(" | ");
  };

  const saveAttendanceCorrection = async (actionLabel = "Admin correction") => {
    if (!selected?.id) return;
    if (!attendance.date) {
      window.alert("Attendance Date is required.");
      return;
    }
    if (!isValidTimeHHmm(attendance.checkIn) || !isValidTimeHHmm(attendance.checkOut)) {
      window.alert("Check-in/Check-out must be in HH:mm format.");
      return;
    }
    if ((attendance.status === "PRESENT" || attendance.status === "HALF_DAY") && (!attendance.checkIn || !attendance.checkOut)) {
      const ok = window.confirm("This attendance is marked present/half-day without complete in/out time. Continue?");
      if (!ok) return;
    }
    await upsertAttendance(selected.id, {
      date: attendance.date,
      status: attendance.status,
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      notes: buildAttendanceNotes(actionLabel),
    });
    setAttendanceActionReason("");
    await h.loadAttendance(selected.id, attendance.from, attendance.to);
  };

  const quickAttendanceAction = async (row: any, status: string) => {
    if (!selected?.id) return;
    const date = String(row.date).slice(0, 10);
    const reason = attendanceActionReason.trim() || window.prompt(`Reason for marking ${status}?`) || "";
    await upsertAttendance(selected.id, {
      date,
      status,
      checkIn: status === "PRESENT" || status === "HALF_DAY" ? row.checkIn || "" : "",
      checkOut: status === "PRESENT" || status === "HALF_DAY" ? row.checkOut || "" : "",
      notes: [row.notes || "", `Admin action: marked ${status}${reason ? `: ${reason}` : ""}`].filter(Boolean).join(" | "),
    });
    setAttendanceActionReason("");
    await h.loadAttendance(selected.id, attendance.from, attendance.to);
  };

  const applyEditorCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    setFormatState({
      bold: document.queryCommandState("bold"),
      underline: document.queryCommandState("underline"),
      italic: document.queryCommandState("italic"),
      bullet: document.queryCommandState("insertUnorderedList"),
    });
  };

  const syncFormatState = () => {
    if (!editorRef.current) return;
    const sel = window.getSelection();
    const anchor = sel?.anchorNode;
    if (anchor && !editorRef.current.contains(anchor)) return;
    setFormatState({
      bold: document.queryCommandState("bold"),
      underline: document.queryCommandState("underline"),
      italic: document.queryCommandState("italic"),
      bullet: document.queryCommandState("insertUnorderedList"),
    });
  };

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== (letterSettings.body || "")) {
      editorRef.current.innerHTML = letterSettings.body || "<p><br/></p>";
    }
  }, [selected?.id]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LETTER_DRAFTS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setLetterDrafts((s) => ({
        ...s,
        ...parsed,
      }));
    } catch (_e) {
      // ignore parse errors
    }
  }, []);
  useEffect(() => {
    localStorage.setItem(LETTER_DRAFTS_KEY, JSON.stringify(letterDrafts));
  }, [letterDrafts]);

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
              {filePicker("letterhead-file", "Choose Letterhead File", letterheadFile, setLetterheadFile, ".pdf,.jpg,.jpeg,.png,.webp")}
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
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold text-red-700">{activeProfileStep.title}</div>
                          <div className="text-xs text-gray-500">Step {profileStepIndex + 1} of {employeeProfileSteps.length}</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {employeeProfileSteps.map((step, index) => (
                            <button
                              key={step.id}
                              type="button"
                              onClick={() => setProfileStepIndex(index)}
                              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                                profileStepIndex === index
                                  ? "border-red-600 bg-red-600 text-white"
                                  : "border-red-100 bg-white text-red-700 hover:bg-red-50"
                              }`}
                            >
                              {index + 1}. {step.title}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 rounded-xl border border-red-100 bg-red-50/30 p-3 md:grid-cols-2">
                        {activeProfileStep.fields.map((k) => (
                          <label key={k} className={`${k === "address" || k === "notes" ? "md:col-span-2" : ""} text-xs text-gray-700`}>
                            <div className="mb-1 font-semibold">
                              {fieldLabels[k] || k}
                              {requiredFieldKeys.includes(k as (typeof requiredFieldKeys)[number]) ? (
                                <span className="ml-1 text-red-600">*</span>
                              ) : null}
                            </div>
                            {k === "status" ? (
                              <select
                                value={String(form[k] ?? "ACTIVE")}
                                onChange={(e) => setForm((s: any) => ({ ...s, [k]: e.target.value }))}
                                className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
                              >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                                <option value="LEFT">LEFT</option>
                              </select>
                            ) : k === "address" || k === "notes" ? (
                              <textarea
                                value={String(form[k] ?? "")}
                                onChange={(e) => setForm((s: any) => ({ ...s, [k]: e.target.value }))}
                                placeholder={fieldLabels[k] || k}
                                rows={3}
                                className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
                              />
                            ) : (
                              <input
                                value={String(form[k] ?? "")}
                                onChange={(e) =>
                                  setForm((s: any) => ({
                                    ...s,
                                    [k]:
                                      k === "mobile" || k === "emergencyContact"
                                        ? sanitizeMobile(e.target.value)
                                        : e.target.value,
                                  }))
                                }
                                placeholder={fieldLabels[k] || k}
                                type={employeeInputType(k)}
                                className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
                              />
                            )}
                          </label>
                        ))}
                        {activeProfileStep.id === "personal" ? (
                          <div className="text-xs text-gray-700 md:col-span-2">
                            <div className="mb-1 font-semibold">Employee Photo</div>
                            {filePicker("employee-photo-file", "Choose Employee Photo", photoFile, setPhotoFile, ".jpg,.jpeg,.png,.webp")}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          className="rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-50"
                          disabled={isFirstProfileStep}
                          onClick={() => setProfileStepIndex((s) => Math.max(0, s - 1))}
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
                          disabled={isLastProfileStep}
                          onClick={() => setProfileStepIndex((s) => Math.min(employeeProfileSteps.length - 1, s + 1))}
                        >
                          Next
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 border-t pt-3">
                        <button className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" onClick={async () => { if (!validateEmployeeForm()) return; const payload = { ...form, mobile: sanitizeMobile(String(form.mobile || "")), emergencyContact: sanitizeMobile(String(form.emergencyContact || "")) }; if (!selected?.id) { const created = await createEmployee(payload, photoFile); await h.loadEmployees(1); setIsOnboarding(false); if (created?.employee?.id) { await openEmployee(created.employee.id); } window.alert("Employee created successfully."); } else { await updateEmployee(selected.id, payload, photoFile); await refreshSelected(); await h.loadEmployees(h.page); window.alert("Employee profile updated."); } }}>
                          <FaPlus className="mr-2 inline" /> {selected?.id ? "Save Profile" : "Create Employee"}
                        </button>
                        <button className="rounded-xl border px-4 py-2 text-sm font-semibold" onClick={() => { setForm(emptyEmployeeForm); h.setSelectedEmployee(null); setPhotoFile(null); setProfileStepIndex(0); }}>Clear Form</button>
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
                            <label className="text-xs text-gray-700 md:col-span-2">
                              <div className="mb-1 font-semibold">Document Category / Name<span className="ml-1 text-red-600">*</span></div>
                              <input
                                value={documentName}
                                onChange={(e) => setDocumentName(e.target.value.toUpperCase())}
                                placeholder="E.g. ID_PROOF, FATHER_ID_PROOF, MOTHER_ID_PROOF"
                                className="w-full rounded-lg border px-3 py-2 text-sm"
                              />
                              <div className="mt-2 flex flex-wrap gap-2">
                                {parentDocumentCategories.map((category) => (
                                  <button
                                    key={category}
                                    type="button"
                                    className="rounded-lg border border-red-100 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100"
                                    onClick={() => setDocumentName(category)}
                                  >
                                    {category}
                                  </button>
                                ))}
                              </div>
                            </label>
                            <input value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="Document title" className="rounded-lg border px-3 py-2 text-sm" />
                            <input value={docRemarks} onChange={(e) => setDocRemarks(e.target.value)} placeholder="Remarks" className="rounded-lg border px-3 py-2 text-sm md:col-span-2" />
                            <div className="md:col-span-2">
                              {filePicker("employee-document-file", "Choose Document File", docFile, setDocFile)}
                            </div>
                          </div>
                          <button className="mt-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white" onClick={async () => { if (!docFile) return; if (!documentName.trim()) { window.alert("Please enter Document Category / Name."); return; } await addEmployeeDocument(selected.id, { docType: documentName.trim(), title: docTitle, remarks: docRemarks }, docFile); setDocFile(null); setDocTitle(""); setDocRemarks(""); setDocumentName(""); await refreshSelected(); }}>
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
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <div className="font-semibold">Offer / Experience Letters</div>
                            <button
                              type="button"
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                              onClick={() => setLetterModalOpen(true)}
                            >
                              Open Letter Studio
                            </button>
                          </div>
                          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-800">
                            Fill all letter fields in a popup modal with separate tabs for Offer and Experience. Unfilled placeholders are auto-set to N/A / Nil.
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white" onClick={() => openPrintableLetter("offer")}><FaPrint className="mr-2 inline" /> Quick Print Offer</button>
                            <button className="rounded-lg border px-3 py-2 text-sm font-semibold" onClick={() => openPrintableLetter("experience")}><FaPrint className="mr-2 inline" /> Quick Print Experience</button>
                          </div>
                        </div>
                      </div>

                      {letterModalOpen && canUsePortal
                        ? createPortal(
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 p-2 sm:p-4" onClick={() => setLetterModalOpen(false)}>
                          <div className="h-[96vh] w-[98vw] max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between border-b bg-red-50 px-4 py-3">
                              <div className="text-sm font-bold text-red-700">Letter Studio</div>
                              <button className="rounded-lg border bg-white px-3 py-1 text-xs font-semibold" onClick={() => setLetterModalOpen(false)}>Close</button>
                            </div>
                            <div className="h-[calc(96vh-56px)] overflow-auto p-4">
                              <div className="mb-3 flex gap-2">
                                <button type="button" className={`rounded-lg px-3 py-2 text-xs font-semibold ${letterModalTab === "offer" ? "bg-red-600 text-white" : "border"}`} onClick={() => setLetterModalTab("offer")}>Offer Letter</button>
                                <button type="button" className={`rounded-lg px-3 py-2 text-xs font-semibold ${letterModalTab === "experience" ? "bg-red-600 text-white" : "border"}`} onClick={() => setLetterModalTab("experience")}>Experience Letter</button>
                              </div>
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Company Name</div><input value={letterSettings.companyName} onChange={(e) => setLetterSettings((s) => ({ ...s, companyName: e.target.value }))} placeholder="Company Name" className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                                <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Company Address</div><input value={letterSettings.companyAddress} onChange={(e) => setLetterSettings((s) => ({ ...s, companyAddress: e.target.value }))} placeholder="Company Address" className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                                {letterModalTab === "offer" ? (
                                  <>
                                    <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Location</div><input value={letterSettings.location} onChange={(e) => setLetterSettings((s) => ({ ...s, location: e.target.value }))} placeholder="City / Branch Location" className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                                    <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Joining Date</div><input type="date" value={letterSettings.offerJoiningDate} onChange={(e) => setLetterSettings((s) => ({ ...s, offerJoiningDate: e.target.value }))} className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                                    <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Department Name</div><input value={letterSettings.offerDepartmentName} onChange={(e) => setLetterSettings((s) => ({ ...s, offerDepartmentName: e.target.value }))} placeholder="Department Name" className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                                    <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Manager / Supervisor Name</div><input value={letterSettings.managerName} onChange={(e) => setLetterSettings((s) => ({ ...s, managerName: e.target.value }))} placeholder="Reporting Manager Name" className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                                    <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Salary Per Month</div><input value={letterSettings.offerMonthlySalary} onChange={(e) => setLetterSettings((s) => ({ ...s, offerMonthlySalary: e.target.value }))} placeholder="e.g. Rs50,000" className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                                    <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Monthly Leaves</div><input value={letterSettings.monthlyLeaves} onChange={(e) => setLetterSettings((s) => ({ ...s, monthlyLeaves: e.target.value }))} placeholder="e.g. 2 days" className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                                    <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Incentives / Bonus</div><input value={letterSettings.incentives} onChange={(e) => setLetterSettings((s) => ({ ...s, incentives: e.target.value }))} placeholder="Incentives / Bonus" className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                                    <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Benefits</div><input value={letterSettings.benefits} onChange={(e) => setLetterSettings((s) => ({ ...s, benefits: e.target.value }))} placeholder="Health/Travel/PF/ESIC etc." className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                                    <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Working Hours</div><input value={letterSettings.workingHours} onChange={(e) => setLetterSettings((s) => ({ ...s, workingHours: e.target.value }))} placeholder="9:30 AM to 6:30 PM" className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                                    <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Weekly Offs</div><input value={letterSettings.weeklyOffs} onChange={(e) => setLetterSettings((s) => ({ ...s, weeklyOffs: e.target.value }))} placeholder="Sunday" className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                                    <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Probation Period</div><input value={letterSettings.probationPeriod} onChange={(e) => setLetterSettings((s) => ({ ...s, probationPeriod: e.target.value }))} placeholder="3/6 months" className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                                    <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Notice Period</div><input value={letterSettings.noticePeriod} onChange={(e) => setLetterSettings((s) => ({ ...s, noticePeriod: e.target.value }))} placeholder="30 days" className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                                    <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Acceptance Last Date (Offer)</div><input type="date" value={letterSettings.acceptanceLastDate} onChange={(e) => setLetterSettings((s) => ({ ...s, acceptanceLastDate: e.target.value }))} className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                                  </>
                                ) : null}
                                {letterModalTab === "experience" ? (
                                  <>
                                    <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Experience Start Date</div><input type="date" value={letterSettings.experienceStartDate} onChange={(e) => setLetterSettings((s) => ({ ...s, experienceStartDate: e.target.value }))} className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                                    <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Experience End Date</div><input type="date" value={letterSettings.experienceEndDate} onChange={(e) => setLetterSettings((s) => ({ ...s, experienceEndDate: e.target.value }))} className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                                    <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Conduct Rating</div><input value={letterSettings.conductRating} onChange={(e) => setLetterSettings((s) => ({ ...s, conductRating: e.target.value }))} placeholder="Good / Excellent" className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                                    <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Company Seal Text</div><input value={letterSettings.companySeal} onChange={(e) => setLetterSettings((s) => ({ ...s, companySeal: e.target.value }))} placeholder="Company Seal" className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                                  </>
                                ) : null}
                                <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Authorized Signatory Name</div><input value={letterSettings.signatoryName} onChange={(e) => setLetterSettings((s) => ({ ...s, signatoryName: e.target.value }))} placeholder="Authorized Signatory Name" className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                                <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Authorized Signatory Designation</div><input value={letterSettings.signatoryRole} onChange={(e) => setLetterSettings((s) => ({ ...s, signatoryRole: e.target.value }))} placeholder="Designation" className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                              </div>
                              <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 p-2 text-xs text-indigo-800">
                                Unfilled values auto-fill as N/A / Nil.
                              </div>
                              <div className="mt-3">
                                {letterModalTab === "offer" ? (
                                  <>
                                    <label className="flex items-center gap-2 text-xs">
                                      <input type="checkbox" checked={letterDrafts.useStandardOffer} onChange={(e) => setLetterDrafts((s) => ({ ...s, useStandardOffer: e.target.checked }))} />
                                      Use Standard Offer Template
                                    </label>
                                    <textarea value={letterDrafts.offerTemplate} onChange={(e) => setLetterDrafts((s) => ({ ...s, offerTemplate: e.target.value }))} className="mt-2 min-h-[190px] w-full rounded-lg border px-3 py-2 text-sm" placeholder="Offer template" />
                                  </>
                                ) : (
                                  <>
                                    <label className="flex items-center gap-2 text-xs">
                                      <input type="checkbox" checked={letterDrafts.useStandardExperience} onChange={(e) => setLetterDrafts((s) => ({ ...s, useStandardExperience: e.target.checked }))} />
                                      Use Standard Experience Template
                                    </label>
                                    <textarea value={letterDrafts.experienceTemplate} onChange={(e) => setLetterDrafts((s) => ({ ...s, experienceTemplate: e.target.value }))} className="mt-2 min-h-[190px] w-full rounded-lg border px-3 py-2 text-sm" placeholder="Experience template" />
                                  </>
                                )}
                              </div>
                              <button type="button" className="mt-3 rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-white" onClick={() => setLetterDrafts({ useStandardOffer: true, useStandardExperience: true, offerTemplate: DEFAULT_OFFER_TEMPLATE, experienceTemplate: DEFAULT_PHLEBOTOMIST_EXPERIENCE_TEMPLATE })}>
                                Reset Standard Templates
                              </button>
                              <label className="mt-3 block text-xs text-gray-700">
                                <div className="mb-1 font-semibold">Custom Letter Body</div>
                                <div className="mb-2 flex flex-wrap gap-2">
                                  <button type="button" className={`rounded border px-2 py-1 text-xs ${formatState.bold ? "bg-red-600 text-white border-red-600" : ""}`} onClick={() => applyEditorCommand("bold")}>Bold</button>
                                  <button type="button" className={`rounded border px-2 py-1 text-xs ${formatState.underline ? "bg-red-600 text-white border-red-600" : ""}`} onClick={() => applyEditorCommand("underline")}>Underline</button>
                                  <button type="button" className={`rounded border px-2 py-1 text-xs ${formatState.italic ? "bg-red-600 text-white border-red-600" : ""}`} onClick={() => applyEditorCommand("italic")}>Italic</button>
                                  <button type="button" className={`rounded border px-2 py-1 text-xs ${formatState.bullet ? "bg-red-600 text-white border-red-600" : ""}`} onClick={() => applyEditorCommand("insertUnorderedList")}>Bullet</button>
                                  <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => applyEditorCommand("removeFormat")}>Clear</button>
                                </div>
                                <div
                                  ref={editorRef}
                                  contentEditable
                                  suppressContentEditableWarning
                                  className="min-h-[130px] rounded-lg border px-3 py-2 text-sm outline-none"
                                  onInput={(e) =>
                                    setLetterSettings((s) => ({
                                      ...s,
                                      body: (e.target as HTMLDivElement).innerHTML,
                                    }))
                                  }
                                  onKeyUp={syncFormatState}
                                  onMouseUp={syncFormatState}
                                  onFocus={() =>
                                    setFormatState({
                                      bold: false,
                                      underline: false,
                                      italic: false,
                                      bullet: false,
                                    })
                                  }
                                />
                              </label>
                              <div className="mt-4 flex flex-wrap gap-2">
                                <button className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white" onClick={() => openPrintableLetter("offer")}><FaPrint className="mr-2 inline" /> Offer Letter</button>
                                <button className="rounded-lg border px-3 py-2 text-sm font-semibold" onClick={() => openPrintableLetter("experience")}><FaPrint className="mr-2 inline" /> Experience Letter</button>
                                <button className="rounded-lg border px-3 py-2 text-sm font-semibold" onClick={() => downloadLetter("offer")}>Download Offer Letter</button>
                                <button className="rounded-lg border px-3 py-2 text-sm font-semibold" onClick={() => downloadLetter("experience")}>Download Experience Letter</button>
                              </div>
                            </div>
                          </div>
                        </div>,
                        document.body,
                      )
                        : null}
                    </div>
                  ) : null}

                  {selected && activeTab === "attendance" ? (
                    <div className="space-y-3">
                      <div className="text-sm font-bold text-red-700">Attendance (Admin Backdated Control)</div>
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        Use this panel to correct employee-submitted attendance. Corrections overwrite the same date and append an admin action note.
                      </div>
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
                      <div className="grid grid-cols-1 gap-2 rounded-xl border border-red-100 bg-red-50/30 p-3 md:grid-cols-3">
                        <label className="text-xs text-gray-700">
                          <div className="mb-1 font-semibold">Attendance Date</div>
                          <input type="date" value={attendance.date} onChange={(e) => setAttendance((s) => ({ ...s, date: e.target.value }))} className="w-full rounded-lg border bg-white px-3 py-2 text-sm" />
                        </label>
                        <label className="text-xs text-gray-700">
                          <div className="mb-1 font-semibold">Status</div>
                          <select value={attendance.status} onChange={(e) => setAttendance((s) => ({ ...s, status: e.target.value }))} className="w-full rounded-lg border bg-white px-3 py-2 text-sm"><option>PRESENT</option><option>ABSENT</option><option>HALF_DAY</option><option>LEAVE</option></select>
                        </label>
                        <label className="text-xs text-gray-700">
                          <div className="mb-1 font-semibold">Admin Action Reason</div>
                          <input value={attendanceActionReason} onChange={(e) => setAttendanceActionReason(e.target.value)} placeholder="Reason for correction/action" className="w-full rounded-lg border bg-white px-3 py-2 text-sm" />
                        </label>
                        <label className="text-xs text-gray-700">
                          <div className="mb-1 font-semibold">Check-in</div>
                          <input value={attendance.checkIn} onChange={(e) => setAttendance((s) => ({ ...s, checkIn: e.target.value }))} placeholder="HH:mm" className="w-full rounded-lg border bg-white px-3 py-2 text-sm" />
                        </label>
                        <label className="text-xs text-gray-700">
                          <div className="mb-1 font-semibold">Check-out</div>
                          <input value={attendance.checkOut} onChange={(e) => setAttendance((s) => ({ ...s, checkOut: e.target.value }))} placeholder="HH:mm" className="w-full rounded-lg border bg-white px-3 py-2 text-sm" />
                        </label>
                        <label className="text-xs text-gray-700">
                          <div className="mb-1 font-semibold">Attendance Notes</div>
                          <input value={attendance.notes} onChange={(e) => setAttendance((s) => ({ ...s, notes: e.target.value }))} placeholder="Notes visible in attendance log" className="w-full rounded-lg border bg-white px-3 py-2 text-sm" />
                        </label>
                        <button className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white md:col-span-2" onClick={() => saveAttendanceCorrection("Admin correction")}>Save / Correct Attendance</button>
                        <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700" onClick={() => { setAttendance((s) => ({ ...s, status: "ABSENT", checkIn: "", checkOut: "" })); setAttendanceActionReason((v) => v || "Employee attendance corrected by admin"); }}>Prepare Absent Action</button>
                      </div>

                      <div className="grid grid-cols-1 gap-2 rounded-xl border p-3 md:grid-cols-4">
                        <input type="date" value={attendance.from} onChange={(e) => setAttendance((s) => ({ ...s, from: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" />
                        <input type="date" value={attendance.to} onChange={(e) => setAttendance((s) => ({ ...s, to: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" />
                        <button className="rounded-lg border px-3 py-2 text-sm font-semibold" onClick={() => h.loadAttendance(selected.id, attendance.from, attendance.to)}>Load Range</button>
                        <div className="self-center text-xs text-gray-500">Supports old/backdated entries</div>
                      </div>

                      <div className="max-h-[38vh] overflow-auto rounded-xl border">
                        <table className="min-w-full text-sm">
                          <thead className="bg-red-50">
                            <tr><th className="px-2 py-2 text-left">Date</th><th className="px-2 py-2 text-left">Status</th><th className="px-2 py-2 text-left">In</th><th className="px-2 py-2 text-left">Out</th><th className="px-2 py-2 text-left">Notes</th><th className="px-2 py-2 text-left">Actions</th></tr>
                          </thead>
                          <tbody>
                            {h.attendance.length === 0 ? (
                              <tr><td colSpan={6} className="px-3 py-4 text-gray-500">No attendance records in selected range.</td></tr>
                            ) : h.attendance.map((a: any) => (
                              <tr key={a.id} className="border-t">
                                <td className="px-2 py-2">{String(a.date).slice(0,10)}</td>
                                <td className="px-2 py-2"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{a.status}</span></td>
                                <td className="px-2 py-2">{a.checkIn || "-"}</td>
                                <td className="px-2 py-2">{a.checkOut || "-"}</td>
                                <td className="max-w-[260px] px-2 py-2 text-xs text-gray-600">{a.notes || "-"}</td>
                                <td className="px-2 py-2">
                                  <div className="flex flex-wrap gap-2">
                                    <button className="rounded border px-2 py-1 text-xs font-semibold hover:bg-red-50" onClick={() => { setAttendance((s) => ({ ...s, date: String(a.date).slice(0, 10), status: a.status || "PRESENT", checkIn: a.checkIn || "", checkOut: a.checkOut || "", notes: a.notes || "" })); setAttendanceActionReason("Correcting employee-submitted attendance"); }}>Edit</button>
                                    <button className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700" onClick={() => quickAttendanceAction(a, "PRESENT")}>Present</button>
                                    <button className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700" onClick={() => quickAttendanceAction(a, "LEAVE")}>Leave</button>
                                    <button className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700" onClick={() => quickAttendanceAction(a, "ABSENT")}>Absent</button>
                                    <button className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700" onClick={async () => { const reason = attendanceActionReason.trim() || window.prompt("Reason for deleting this attendance entry?") || ""; const ok = window.confirm(`Delete this attendance entry${reason ? ` for: ${reason}` : ""}?`); if (!ok) return; await deleteAttendance(selected.id, a.id); setAttendanceActionReason(""); await h.loadAttendance(selected.id, attendance.from, attendance.to); }}>Delete</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : null}

                  {selected && activeTab === "payroll" ? (
                    <div className="space-y-3">
                      <div className="text-sm font-bold text-red-700">Payroll & Salary Slip Generator</div>
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                        Full salary mode is default. Add a deduction amount only if you actually want to deduct.
                      </div>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                        <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Salary Month<span className="ml-1 text-red-600">*</span></div><input type="number" min={1} max={12} value={salary.month} onChange={(e) => setSalary((s) => ({ ...s, month: Number(e.target.value) }))} placeholder="1 to 12" className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                        <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Salary Year<span className="ml-1 text-red-600">*</span></div><input type="number" min={2000} max={2100} value={salary.year} onChange={(e) => setSalary((s) => ({ ...s, year: Number(e.target.value) }))} placeholder="YYYY" className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                        <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Manual Deduction Amount (Optional)</div><input type="number" min={0} value={salary.deductionExtra} onChange={(e) => setSalary((s) => ({ ...s, deductionExtra: Number(e.target.value) }))} placeholder="0 for full salary" className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                        <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Deduction Title</div><input value={salary.deductionTitle} onChange={(e) => setSalary((s) => ({ ...s, deductionTitle: e.target.value }))} placeholder="E.g. LATE COMING, PENALTY" className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                        <label className="text-xs text-gray-700"><div className="mb-1 font-semibold">Deduction Remark</div><input value={salary.deductionRemark} onChange={(e) => setSalary((s) => ({ ...s, deductionRemark: e.target.value }))} placeholder="Reason for deduction" className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                        <button className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white" onClick={async () => {
                          if (salary.month < 1 || salary.month > 12) { window.alert("Month must be between 1 and 12."); return; }
                          if (salary.year < 2000 || salary.year > 2100) { window.alert("Please enter a valid year."); return; }
                          if (salary.deductionExtra < 0) { window.alert("Deduction amount cannot be negative."); return; }
                          await generateSalarySlip(selected.id, {
                            month: salary.month,
                            year: salary.year,
                            additions: 0,
                            bonus: 0,
                            deductionExtra: 0,
                            applyAttendanceDeduction: false,
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











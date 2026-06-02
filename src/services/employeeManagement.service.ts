import { Preferences } from "@capacitor/preferences";

type ViteImportMeta = ImportMeta & { env?: { VITE_API_URL?: string } };
const BASE =
  (typeof import.meta !== "undefined"
    ? (import.meta as ViteImportMeta).env?.VITE_API_URL
    : undefined) ||
  "http://localhost:5000/api";

async function getToken() {
  const { value } = await Preferences.get({ key: "token" });
  return value || null;
}

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as any)?.message || (json as any)?.msg || `HTTP ${res.status}`);
  return json as T;
}

export type Employee = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName?: string | null;
  fatherName?: string | null;
  motherName?: string | null;
  email?: string | null;
  mobile?: string | null;
  designation: string;
  department?: string | null;
  joiningDate: string;
  dob?: string | null;
  status: "ACTIVE" | "INACTIVE" | "LEFT";
  leftDate?: string | null;
  salaryBasic: number;
  salaryHra: number;
  salaryAllowances: number;
  defaultDeductions: number;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  ifscCode?: string | null;
  panNumber?: string | null;
  aadhaarNumber?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
  notes?: string | null;
  photoUrl?: string | null;
  photoViewUrl?: string | null;
};

export async function fetchEmployees(params: { page?: number; limit?: number; search?: string; status?: string; designation?: string }) {
  const qp = new URLSearchParams();
  if (params.page) qp.set("page", String(params.page));
  if (params.limit) qp.set("limit", String(params.limit));
  if (params.search) qp.set("search", params.search);
  if (params.status) qp.set("status", params.status);
  if (params.designation) qp.set("designation", params.designation);
  return apiFetch<{ success: boolean; employees: Employee[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean } }>(`${BASE}/superadmins/employee-management/employees?${qp.toString()}`);
}

export async function createEmployee(payload: Record<string, unknown>, photoFile?: File | null) {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== "") fd.append(k, String(v));
  });
  if (photoFile) fd.append("photo", photoFile);
  return apiFetch<{ success: boolean; employee: Employee }>(`${BASE}/superadmins/employee-management/employees`, { method: "POST", body: fd });
}

export async function updateEmployee(id: string, payload: Record<string, unknown>, photoFile?: File | null) {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, String(v));
  });
  if (photoFile) fd.append("photo", photoFile);
  return apiFetch<{ success: boolean; employee: Employee }>(`${BASE}/superadmins/employee-management/employees/${id}`, { method: "PATCH", body: fd });
}

export async function getEmployeeById(id: string) {
  return apiFetch<{ success: boolean; employee: Employee & { documents: any[]; salarySlips: any[] } }>(`${BASE}/superadmins/employee-management/employees/${id}`);
}

export async function markEmployeeLeft(id: string, leftDate?: string) {
  return apiFetch(`${BASE}/superadmins/employee-management/employees/${id}/mark-left`, {
    method: "PATCH",
    body: JSON.stringify({ leftDate }),
  });
}

export async function addEmployeeDocument(employeeId: string, payload: { docType: string; title?: string; remarks?: string }, file: File) {
  const fd = new FormData();
  fd.append("docType", payload.docType);
  if (payload.title) fd.append("title", payload.title);
  if (payload.remarks) fd.append("remarks", payload.remarks);
  fd.append("file", file);
  return apiFetch(`${BASE}/superadmins/employee-management/employees/${employeeId}/documents`, { method: "POST", body: fd });
}

export async function deleteEmployeeDocument(employeeId: string, docId: string) {
  return apiFetch(`${BASE}/superadmins/employee-management/employees/${employeeId}/documents/${docId}`, { method: "DELETE" });
}

export async function upsertAttendance(employeeId: string, payload: { date: string; status: string; checkIn?: string; checkOut?: string; notes?: string }) {
  return apiFetch(`${BASE}/superadmins/employee-management/employees/${employeeId}/attendance`, { method: "POST", body: JSON.stringify(payload) });
}

export async function fetchAttendance(employeeId: string, from: string, to: string) {
  const qp = new URLSearchParams({ from, to });
  return apiFetch<{ success: boolean; attendance: any[] }>(`${BASE}/superadmins/employee-management/employees/${employeeId}/attendance?${qp.toString()}`);
}

export async function deleteAttendance(employeeId: string, attendanceId: string) {
  return apiFetch<{ success: boolean; message: string }>(
    `${BASE}/superadmins/employee-management/employees/${employeeId}/attendance/${attendanceId}`,
    { method: "DELETE" },
  );
}

export async function generateSalarySlip(
  employeeId: string,
  payload: {
    month: number;
    year: number;
    additions?: number;
    bonus?: number;
    deductionExtra?: number;
    applyAttendanceDeduction?: boolean;
    deductionLines?: Array<{ label: string; remark?: string; amount: number }>;
  },
) {
  return apiFetch(`${BASE}/superadmins/employee-management/employees/${employeeId}/salary-slips/generate`, { method: "POST", body: JSON.stringify(payload) });
}

export async function fetchSalarySlips(employeeId: string) {
  return apiFetch<{ success: boolean; slips: any[] }>(`${BASE}/superadmins/employee-management/employees/${employeeId}/salary-slips`);
}

export async function uploadLetterhead(title: string, file: File) {
  const fd = new FormData();
  if (title) fd.append("title", title);
  fd.append("file", file);
  return apiFetch(`${BASE}/superadmins/employee-management/letterhead`, { method: "POST", body: fd });
}

export async function fetchActiveLetterhead() {
  return apiFetch<{ success: boolean; letterhead: any | null }>(`${BASE}/superadmins/employee-management/letterhead`);
}

export async function fetchActiveLetterheadBlob() {
  const token = await getToken();
  const res = await fetch(`${BASE}/superadmins/employee-management/letterhead/download`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as any)?.message || `HTTP ${res.status}`);
  }
  return res.blob();
}

export async function fetchEmployeeSummary() {
  return apiFetch<{
    success: boolean;
    summary: {
      total: number;
      active: number;
      inactive: number;
      left: number;
      month: number;
      year: number;
      payroll: { gross: number; deductions: number; net: number };
    };
  }>(`${BASE}/superadmins/employee-management/summary`);
}

export async function setEmployeeStatus(id: string, status: "ACTIVE" | "INACTIVE" | "LEFT", leftDate?: string) {
  return apiFetch<{ success: boolean; employee: Employee }>(`${BASE}/superadmins/employee-management/employees/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, leftDate }),
  });
}

export async function softDeleteEmployee(id: string, reason?: string) {
  return apiFetch<{ success: boolean; message: string; employee: Employee }>(
    `${BASE}/superadmins/employee-management/employees/${id}`,
    {
      method: "DELETE",
      body: JSON.stringify({ reason }),
    },
  );
}

export async function hardDeleteEmployee(id: string) {
  return apiFetch<{ success: boolean; message: string }>(
    `${BASE}/superadmins/employee-management/employees/${id}/permanent`,
    {
      method: "DELETE",
      body: JSON.stringify({ confirm: "DELETE" }),
    },
  );
}

async function downloadWithAuth(url: string, fallbackFileName: string) {
  const token = await getToken();
  const res = await fetch(url, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as any)?.message || `HTTP ${res.status}`);
  }
  const blob = await res.blob();
  const cd = res.headers.get("content-disposition") || "";
  const match = cd.match(/filename=\"?([^\";]+)\"?/i);
  const fileName = match?.[1] || fallbackFileName;
  const a = document.createElement("a");
  const objectUrl = window.URL.createObjectURL(blob);
  a.href = objectUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(objectUrl);
}

export async function downloadEmployeeData(employeeId: string) {
  const url = `${BASE}/superadmins/employee-management/employees/${employeeId}/export`;
  await downloadWithAuth(url, `employee-${employeeId}-full-data.json`);
}

export async function downloadSalarySlipFile(employeeId: string, slipId: string) {
  const url = `${BASE}/superadmins/employee-management/employees/${employeeId}/salary-slips/${slipId}/download`;
  await downloadWithAuth(url, `salary-slip-${slipId}.html`);
}

export async function deleteSalarySlip(employeeId: string, slipId: string) {
  return apiFetch<{ success: boolean; message: string }>(
    `${BASE}/superadmins/employee-management/employees/${employeeId}/salary-slips/${slipId}`,
    { method: "DELETE" },
  );
}

export async function markSelfAttendance(payload: {
  employeeCode: string;
  mobile: string;
  status?: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE";
  date?: string;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}) {
  return apiFetch<{ success: boolean; attendance: any; employee: any }>(
    `${BASE}/superadmins/employee-management/public/attendance`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function getPublicEmployeeByMobile(mobile: string) {
  const qp = new URLSearchParams({ mobile });
  return apiFetch<{ success: boolean; employee: any }>(
    `${BASE}/superadmins/employee-management/public/employee-by-mobile?${qp.toString()}`,
  );
}

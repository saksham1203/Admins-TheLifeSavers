import { Preferences } from "@capacitor/preferences";

export type OfficeExpense = {
  id: string;
  title: string;
  category: string;
  amount: number;
  paymentMode: string;
  expenseDate: string;
  notes?: string | null;
  vendor?: string | null;
  billReference?: string | null;
  billUrl?: string | null;
  billViewUrl?: string | null;
  createdBySuperAdminId?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBySuperAdmin?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export type OfficeExpenseSummary = {
  totalAmount: number;
  totalCount: number;
  averageExpense: number;
  byCategory: Array<{ category: string; amount: number; count: number }>;
  byPaymentMode: Array<{ paymentMode: string; amount: number; count: number }>;
};

export type OfficeExpenseTrendPoint = {
  date: string;
  amount: number;
  count: number;
};

type ViteImportMeta = ImportMeta & { env?: { VITE_API_URL?: string } };

const BASE =
  (typeof import.meta !== "undefined"
    ? (import.meta as ViteImportMeta).env?.VITE_API_URL
    : undefined) ||
  "http://localhost:5000/api";

async function getToken(): Promise<string | null> {
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
  if (!res.ok) {
    throw new Error((json as any)?.message || (json as any)?.msg || `HTTP ${res.status}`);
  }

  return json as T;
}

async function downloadFile(url: string, filenameHint: string): Promise<void> {
  const token = await getToken();
  const res = await fetch(url, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const json = await res.json();
      msg = (json as any)?.message || (json as any)?.msg || msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  const blob = await res.blob();
  const a = document.createElement("a");
  const objectUrl = window.URL.createObjectURL(blob);
  a.href = objectUrl;
  a.download = filenameHint;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(objectUrl);
}

export async function fetchOfficeExpenses(params: {
  from: string;
  to: string;
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  paymentMode?: string;
}) {
  const qp = new URLSearchParams();
  qp.set("from", params.from);
  qp.set("to", params.to);
  if (params.page) qp.set("page", String(params.page));
  if (params.limit) qp.set("limit", String(params.limit));
  if (params.search) qp.set("search", params.search);
  if (params.category) qp.set("category", params.category);
  if (params.paymentMode) qp.set("paymentMode", params.paymentMode);

  return apiFetch<{
    success: boolean;
    expenses: OfficeExpense[];
    summary: {
      totalCount: number;
      pageAmount: number;
      byCategory: Array<{ category: string; amount: number }>;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    range: { from: string; to: string };
  }>(`${BASE}/superadmins/office-expenses?${qp.toString()}`);
}

export async function fetchOfficeExpensesSummary(params: { from: string; to: string }) {
  const qp = new URLSearchParams();
  qp.set("from", params.from);
  qp.set("to", params.to);
  return apiFetch<{ success: boolean; summary: OfficeExpenseSummary; range: { from: string; to: string } }>(
    `${BASE}/superadmins/office-expenses/summary?${qp.toString()}`
  );
}

export async function fetchOfficeExpensesTrend(params: { from: string; to: string }) {
  const qp = new URLSearchParams();
  qp.set("from", params.from);
  qp.set("to", params.to);
  return apiFetch<{ success: boolean; trend: OfficeExpenseTrendPoint[]; range: { from: string; to: string } }>(
    `${BASE}/superadmins/office-expenses/trend?${qp.toString()}`
  );
}

function buildExpenseFormData(payload: {
  title: string;
  category: string;
  amount: number;
  paymentMode: "CASH" | "ONLINE";
  expenseDate: string;
  notes?: string;
  vendor?: string;
  billReference?: string;
  billFile?: File | null;
}) {
  const fd = new FormData();
  fd.append("title", payload.title);
  fd.append("category", payload.category);
  fd.append("amount", String(payload.amount));
  fd.append("paymentMode", payload.paymentMode);
  fd.append("expenseDate", payload.expenseDate);
  if (payload.notes) fd.append("notes", payload.notes);
  if (payload.vendor) fd.append("vendor", payload.vendor);
  if (payload.billReference) fd.append("billReference", payload.billReference);
  if (payload.billFile) fd.append("bill", payload.billFile);
  return fd;
}

export async function createOfficeExpense(payload: {
  title: string;
  category: string;
  amount: number;
  paymentMode: "CASH" | "ONLINE";
  expenseDate: string;
  notes?: string;
  vendor?: string;
  billReference?: string;
  billFile?: File | null;
}) {
  return apiFetch<{ success: boolean; expense: OfficeExpense }>(`${BASE}/superadmins/office-expenses`, {
    method: "POST",
    body: buildExpenseFormData(payload),
  });
}

export async function updateOfficeExpense(
  id: string,
  payload: Partial<{
    title: string;
    category: string;
    amount: number;
    paymentMode: "CASH" | "ONLINE";
    expenseDate: string;
    notes: string;
    vendor: string;
    billReference: string;
    billFile: File | null;
  }>
) {
  const fd = new FormData();
  if (typeof payload.title !== "undefined") fd.append("title", payload.title);
  if (typeof payload.category !== "undefined") fd.append("category", payload.category);
  if (typeof payload.amount !== "undefined") fd.append("amount", String(payload.amount));
  if (typeof payload.paymentMode !== "undefined") fd.append("paymentMode", payload.paymentMode);
  if (typeof payload.expenseDate !== "undefined") fd.append("expenseDate", payload.expenseDate);
  if (typeof payload.notes !== "undefined") fd.append("notes", payload.notes);
  if (typeof payload.vendor !== "undefined") fd.append("vendor", payload.vendor);
  if (typeof payload.billReference !== "undefined") fd.append("billReference", payload.billReference);
  if (payload.billFile) fd.append("bill", payload.billFile);

  return apiFetch<{ success: boolean; expense: OfficeExpense }>(`${BASE}/superadmins/office-expenses/${id}`, {
    method: "PATCH",
    body: fd,
  });
}

export async function deleteOfficeExpense(id: string) {
  return apiFetch<{ success: boolean; message: string }>(`${BASE}/superadmins/office-expenses/${id}`, {
    method: "DELETE",
  });
}

export async function downloadOfficeExpensesReport(params: {
  from: string;
  to: string;
  search?: string;
  category?: string;
  paymentMode?: string;
}) {
  const qp = new URLSearchParams();
  qp.set("from", params.from);
  qp.set("to", params.to);
  if (params.search) qp.set("search", params.search);
  if (params.category) qp.set("category", params.category);
  if (params.paymentMode) qp.set("paymentMode", params.paymentMode);

  await downloadFile(
    `${BASE}/superadmins/office-expenses/export?${qp.toString()}`,
    `office-expenses-${params.from}-to-${params.to}.xlsx`
  );
}

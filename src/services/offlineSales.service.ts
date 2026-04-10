import { Preferences } from "@capacitor/preferences";

export type OfflineCatalogRates = {
  b2b: number | null;
  customerRate: number | null;
  discountedMrp: number | null;
  actualMrp: number | null;
  partnerMargin: number | null;
  tlsMargin: number | null;
  defaultCost: number;
  defaultSell: number;
};

export type OfflineCatalogRow = {
  id: string;
  itemType: "TEST" | "PACKAGE";
  lab: string;
  partnerType: string;
  sortOrder: number;
  name: string;
  testId: string | null;
  packageId: string | null;
  rawData: Record<string, unknown>;
  rates: OfflineCatalogRates;
};

export type OfflineCatalogResp = {
  success: boolean;
  filters: {
    labs: string[];
    partnerTypes: string[];
  };
  rows: OfflineCatalogRow[];
  count: number;
};

export type OfflineSalesLab = {
  id: string;
  name: string;
  isActive: boolean;
  address: string;
};

export type OfflineOrderItemInput = {
  itemType: "TEST" | "PACKAGE";
  priceRowId?: string;
  name?: string;
  testId?: string;
  packageId?: string;
  quantity?: number;
  sellingPrice?: number;
  costPrice?: number;
};

export type CreateOfflineOrderInput = {
  labId: string;
  lab?: string;
  partnerType?: string;
  orderDate?: string;
  collectionTime?: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  gender?: string;
  age?: number;
  address: string;
  city?: string;
  pincode?: string;
  referredBy?: string;
  notes?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  paymentMode?: "CASH" | "ONLINE";
  items: OfflineOrderItemInput[];
};

export type OfflineSummary = {
  totalOrders: number;
  referredOrders: number;
  nonReferredOrders: number;
  revenue: number;
  cost: number;
  grossProfit: number;
  referralImpact: number;
  netProfit: number;
  avgOrderValue: number;
  profitMarginPercent: number;
};

export type OfflineTrendPoint = {
  date: string;
  orders: number;
  revenue: number;
  cost: number;
  grossProfit: number;
  referralImpact: number;
  netProfit: number;
};

export type SalesOrderHistoryRow = {
  id: string;
  orderId: string;
  createdAt: string;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  referredBy?: string | null;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentMode?: "CASH" | "ONLINE" | string;
  total: number;
  lab?: { id: string; name: string };
  finance?: {
    revenue?: number;
    cost?: number;
    grossProfit?: number;
    referralImpact?: number;
    netProfit?: number;
    partnerCommission?: number;
  };
};

export type SalesOrderHistoryResp = {
  success: boolean;
  orders: SalesOrderHistoryRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  range?: { from: string; to: string } | null;
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

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || json?.msg || `HTTP ${res.status}`);
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
      msg = json?.message || json?.msg || msg;
    } catch {
      // ignore parse issues for binary response
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

export async function fetchOfflineSalesCatalog(params?: {
  lab?: string;
  partnerType?: string;
  type?: "all" | "test" | "package";
  search?: string;
  limit?: number;
}) {
  const qp = new URLSearchParams();
  if (params?.lab) qp.set("lab", params.lab);
  if (params?.partnerType) qp.set("partnerType", params.partnerType);
  if (params?.type) qp.set("type", params.type);
  if (params?.search) qp.set("search", params.search);
  if (params?.limit) qp.set("limit", String(params.limit));

  return apiFetch<OfflineCatalogResp>(`${BASE}/superadmins/offline-sales/catalog?${qp.toString()}`);
}

export async function fetchOfflineSalesLabs() {
  return apiFetch<{ success: boolean; labs: OfflineSalesLab[] }>(`${BASE}/superadmins/offline-sales/labs`);
}

export async function createOfflineSalesOrder(payload: CreateOfflineOrderInput) {
  return apiFetch<{ success: boolean; message: string; orderId: string }>(
    `${BASE}/superadmins/offline-sales/orders`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function fetchOfflineSalesOrders(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  labId?: string;
  from?: string;
  to?: string;
}) {
  const qp = new URLSearchParams();
  qp.set("page", String(params?.page || 1));
  qp.set("limit", String(params?.limit || 20));
  if (params?.search) qp.set("search", params.search);
  if (params?.status) qp.set("status", params.status);
  if (params?.paymentStatus) qp.set("paymentStatus", params.paymentStatus);
  if (params?.labId) qp.set("labId", params.labId);
  if (params?.from) qp.set("from", params.from);
  if (params?.to) qp.set("to", params.to);

  return apiFetch<SalesOrderHistoryResp>(`${BASE}/superadmins/offline-sales/orders?${qp.toString()}`);
}

export async function fetchOfflineSalesSummary(params?: { from?: string; to?: string }) {
  const qp = new URLSearchParams();
  if (params?.from) qp.set("from", params.from);
  if (params?.to) qp.set("to", params.to);

  return apiFetch<{ success: boolean; summary: OfflineSummary }>(
    `${BASE}/superadmins/offline-sales/summary?${qp.toString()}`
  );
}

export async function fetchOfflineSalesTrend(params?: { from?: string; to?: string }) {
  const qp = new URLSearchParams();
  if (params?.from) qp.set("from", params.from);
  if (params?.to) qp.set("to", params.to);

  return apiFetch<{ success: boolean; trend: OfflineTrendPoint[] }>(
    `${BASE}/superadmins/offline-sales/trend?${qp.toString()}`
  );
}

export async function downloadOfflineSalesOrdersReport(params?: {
  search?: string;
  status?: string;
  paymentStatus?: string;
  labId?: string;
  from?: string;
  to?: string;
}) {
  const qp = new URLSearchParams();
  if (params?.search) qp.set("search", params.search);
  if (params?.status) qp.set("status", params.status);
  if (params?.paymentStatus) qp.set("paymentStatus", params.paymentStatus);
  if (params?.labId) qp.set("labId", params.labId);
  if (params?.from) qp.set("from", params.from);
  if (params?.to) qp.set("to", params.to);
  const url = `${BASE}/superadmins/offline-sales/orders/export?${qp.toString()}`;
  return downloadFile(url, `offline-orders-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export async function fetchOnlineSalesOrders(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  labId?: string;
  from?: string;
  to?: string;
}) {
  const qp = new URLSearchParams();
  qp.set("page", String(params?.page || 1));
  qp.set("limit", String(params?.limit || 20));
  if (params?.search) qp.set("search", params.search);
  if (params?.status) qp.set("status", params.status);
  if (params?.paymentStatus) qp.set("paymentStatus", params.paymentStatus);
  if (params?.labId) qp.set("labId", params.labId);
  if (params?.from) qp.set("from", params.from);
  if (params?.to) qp.set("to", params.to);

  return apiFetch<SalesOrderHistoryResp>(`${BASE}/superadmins/online-sales/orders?${qp.toString()}`);
}

export async function downloadOnlineSalesOrdersReport(params?: {
  search?: string;
  status?: string;
  paymentStatus?: string;
  labId?: string;
  from?: string;
  to?: string;
}) {
  const qp = new URLSearchParams();
  if (params?.search) qp.set("search", params.search);
  if (params?.status) qp.set("status", params.status);
  if (params?.paymentStatus) qp.set("paymentStatus", params.paymentStatus);
  if (params?.labId) qp.set("labId", params.labId);
  if (params?.from) qp.set("from", params.from);
  if (params?.to) qp.set("to", params.to);
  const url = `${BASE}/superadmins/online-sales/orders/export?${qp.toString()}`;
  return downloadFile(url, `online-orders-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

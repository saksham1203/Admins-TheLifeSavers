// src/services/partnersService.ts
// Service layer for partner requests + superadmin partner management APIs.

export type PartnerRequest = {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  dob?: string;
  gender?: string;
  partnerType?: string;
  specifyCategory?: string | null;
  shopName?: string;
  pincode?: string;
  address?: string;
  status?: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt?: string;
  updatedAt?: string;
  isAdmin?: boolean;
};

export type ApiListResp = {
  success: boolean;
  requests: PartnerRequest[];
};

export type OnboardForm = {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  mobile: string;
  dob?: string;
  gender?: string;
  partnerType: string;
  shopName?: string;
  pincode?: string;
  address?: string;
  isAdmin?: boolean;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type SuperAdminPartner = {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  partnerType?: string;
  specifyCategory?: string | null;
  shopName?: string;
  pincode?: string;
  address?: string;
  isVerified?: boolean;
  referralCode?: string | null;
  createdAt?: string;
  cycleAnchor?: string;
  bankAccount?: {
    status?: "PENDING" | "VERIFIED" | "REJECTED";
    updatedAt?: string;
  } | null;
};

export type SuperAdminPartnerDetails = {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  dob?: string;
  gender?: string;
  partnerType?: string;
  specifyCategory?: string | null;
  pincode?: string;
  address?: string;
  shopName?: string;
  isVerified?: boolean;
  referralCode?: string | null;
  createdAt?: string;
  cycleAnchor?: string;
  bankAccount?: PartnerBank | null;
};

export type PartnerBank = {
  holderName?: string;
  bankName?: string;
  accountNo?: string;
  ifsc?: string;
  status?: "PENDING" | "VERIFIED" | "REJECTED";
  rejectionReason?: string | null;
  verifiedById?: string | null;
  verifiedAt?: string | null;
  updatedAt?: string;
};

export type PartnerCycle = {
  start: string;
  end: string;
  isRunning?: boolean;
  patients: number;
  revenue?: number;
  bonus?: number;
  commission: number;
  payout?: {
    id: string;
    status: "PENDING" | "PAID" | "CANCELLED";
    commission: number;
    paidAt?: string | null;
    note?: string | null;
  } | null;
  payable: boolean;
};

export type PartnerDetailsResp = {
  success: boolean;
  partner: SuperAdminPartnerDetails;
  stats?: {
    totalCompletedReferrals: number;
    totalPaidCycles: number;
    totalPaidPatients: number;
    totalPaidCommission: number;
  };
  currentCycle?: {
    start: string;
    end: string;
    index: number;
    number: number;
    label: string;
  };
};

export type PartnerListResp = {
  success: boolean;
  partners: SuperAdminPartner[];
  pagination: PaginationMeta;
};

export type PartnerCyclesResp = {
  success: boolean;
  partner: {
    id: string;
    firstName?: string;
    lastName?: string;
    shopName?: string;
    referralCode?: string;
  };
  cycles: PartnerCycle[];
  pagination: PaginationMeta;
};

export type PartnerBankResp = {
  success: boolean;
  bank: PartnerBank | null;
};

export type MarkPayoutPayload = {
  cycleId?: string;
  start?: string;
  end?: string;
  status: "PAID" | "CANCELLED";
  note?: string;
};

const BASE = "https://services.thelifesavers.in/api";

function readTokenFromLocalStorage(): string | null {
  return localStorage.getItem("token") || localStorage.getItem("authToken") || null;
}

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const token = readTokenFromLocalStorage();

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
  }

  return (await res.json()) as T;
}

export async function fetchPartnerRequests(): Promise<PartnerRequest[]> {
  const json = await apiFetch<ApiListResp>(`${BASE}/partner-admin/requests`);
  if (!json.success) throw new Error("API returned success: false");
  return json.requests ?? [];
}

export async function approvePartnerRequest(id: string): Promise<any> {
  return apiFetch<any>(`${BASE}/partner-admin/requests/${encodeURIComponent(id)}/approve`, {
    method: "PATCH",
  });
}

export async function rejectPartnerRequest(id: string): Promise<any> {
  return apiFetch<any>(`${BASE}/partner-admin/requests/${encodeURIComponent(id)}/reject`, {
    method: "PATCH",
  });
}

export async function createPartnerOnboard(payload: OnboardForm): Promise<any> {
  return apiFetch<any>(`${BASE}/partners/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchSuperAdminPartners(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PartnerListResp> {
  const qp = new URLSearchParams();
  qp.set("page", String(params?.page || 1));
  qp.set("limit", String(params?.limit || 10));
  if (params?.search?.trim()) qp.set("search", params.search.trim());

  return apiFetch<PartnerListResp>(`${BASE}/superadmins/partners?${qp.toString()}`);
}

export async function fetchSuperAdminPartnerDetails(partnerId: string): Promise<PartnerDetailsResp> {
  return apiFetch<PartnerDetailsResp>(`${BASE}/superadmins/partners/${encodeURIComponent(partnerId)}`);
}

export async function fetchSuperAdminPartnerCycles(
  partnerId: string,
  params?: { page?: number; limit?: number }
): Promise<PartnerCyclesResp> {
  const qp = new URLSearchParams();
  qp.set("page", String(params?.page || 1));
  qp.set("limit", String(params?.limit || 10));

  return apiFetch<PartnerCyclesResp>(
    `${BASE}/superadmins/partners/${encodeURIComponent(partnerId)}/cycles?${qp.toString()}`
  );
}

export async function markSuperAdminPartnerCyclePayout(
  partnerId: string,
  payload: MarkPayoutPayload
): Promise<any> {
  return apiFetch<any>(`${BASE}/superadmins/partners/${encodeURIComponent(partnerId)}/cycles/payout`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchSuperAdminPartnerBank(partnerId: string): Promise<PartnerBankResp> {
  return apiFetch<PartnerBankResp>(`${BASE}/superadmins/partners/${encodeURIComponent(partnerId)}/bank`);
}

export async function verifySuperAdminPartnerBank(
  partnerId: string,
  payload: { status: "VERIFIED" | "REJECTED"; rejectionReason?: string }
): Promise<any> {
  return apiFetch<any>(`${BASE}/superadmins/partners/${encodeURIComponent(partnerId)}/bank/verify`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export const partnersService = {
  fetchPartnerRequests,
  approvePartnerRequest,
  rejectPartnerRequest,
  createPartnerOnboard,
  fetchSuperAdminPartners,
  fetchSuperAdminPartnerDetails,
  fetchSuperAdminPartnerCycles,
  markSuperAdminPartnerCyclePayout,
  fetchSuperAdminPartnerBank,
  verifySuperAdminPartnerBank,
  readTokenFromLocalStorage,
  BASE,
};

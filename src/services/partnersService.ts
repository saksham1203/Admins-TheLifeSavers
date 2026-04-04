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
  isActive?: boolean;
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
  isActive?: boolean;
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
  cycleId?: string;
  index?: number;
  number?: number;
  status?: string;
  start: string;
  end: string;
  label?: string;
  isRunning?: boolean;
  patients: number;
  revenue?: number;
  bonus?: number;
  bonusPercent?: number;
  commission: number;
  isBonusApplied?: boolean;
  baseCommission?: number;
  bonusEarned?: number;
  totalCommissionEarned?: number;
  payout?: {
    id: string;
    status: "PENDING" | "PAID" | "CANCELLED";
    commission: number;
    paidAt?: string | null;
    note?: string | null;
  } | null;
  isZeroEarningCycle?: boolean;
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
  earnedSummary?: {
    totalRevenue: number;
    totalBonus: number;
    totalCommission: number;
    totalPatients: number;
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
  workingCycleId?: string | null;
  workingCycleIndex?: number;
  cyclesStored?: number;
  autoMarkedZeroEarningCycles?: number;
  summary?: {
    totalPatients: number;
    totalRevenue: number;
    totalBonus: number;
    totalCommission: number;
  };
  cycles: PartnerCycle[];
  pagination: PaginationMeta;
};

export type PartnerCycleReferralsResp = {
  success: boolean;
  cycle?: {
    cycleId: string;
    index: number;
    number: number;
    status: string;
    start: string;
    end: string;
    label: string;
  };
  referrals: Array<{
    id: string;
    orderId?: string;
    patientName?: string;
    status?: string;
    total?: number;
    partnerMargin?: number;
    commissionGranted?: number;
    commissionState?: "GRANTED" | "IN_PROGRESS";
    createdAt?: string;
  }>;
  nextCursor?: string | null;
};

export type SuperAdminCompletedCycleRow = {
  cycleId: string;
  index?: number;
  number?: number;
  status?: string;
  start: string;
  end: string;
  label?: string;
  isRunning?: boolean;
  patients: number;
  revenue?: number;
  bonus?: number;
  bonusPercent?: number;
  commission: number;
  isBonusApplied?: boolean;
  baseCommission?: number;
  bonusEarned?: number;
  totalCommissionEarned?: number;
  payout?: {
    id: string;
    status: "PENDING" | "PAID" | "CANCELLED";
    commission: number;
    paidAt?: string | null;
    note?: string | null;
  } | null;
  isZeroEarningCycle?: boolean;
  payable: boolean;
  canMarkPayout?: boolean;
  partner: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    mobile?: string;
    shopName?: string;
    referralCode?: string;
    isActive?: boolean;
    isVerified?: boolean;
    bankStatus?: "PENDING" | "VERIFIED" | "REJECTED";
    bankUpdatedAt?: string | null;
  };
};

export type SuperAdminCompletedCyclesResp = {
  success: boolean;
  cycles: SuperAdminCompletedCycleRow[];
  autoMarkedZeroEarningCycles?: number;
  pagination: PaginationMeta;
  asOf?: string;
};

export type PartnerBankResp = {
  success: boolean;
  bank: PartnerBank | null;
};

export type DeletedPartnerArchive = {
  id: string;
  originalPartnerId: string;
  partnerEmail?: string | null;
  partnerMobile?: string | null;
  partnerReferralCode?: string | null;
  deletedById?: string | null;
  reason?: string | null;
  snapshot: any;
  deletedAt: string;
  deletedBy?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
};

export type DeletedPartnerArchiveListResp = {
  success: boolean;
  archives: DeletedPartnerArchive[];
  pagination: PaginationMeta;
};

export type DeletedPartnerArchiveDetailsResp = {
  success: boolean;
  archive: DeletedPartnerArchive;
};

export type MarkPayoutPayload = {
  cycleId?: string;
  start?: string;
  end?: string;
  status: "PAID" | "CANCELLED";
  note?: string;
};

const BASE =
  (typeof import.meta !== "undefined" && (import.meta as any)?.env?.VITE_API_URL) ||
  "https://services.thelifesavers.in/api";

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

export async function fetchSuperAdminPartnerCycleReferrals(
  partnerId: string,
  cycleId: string,
  params?: { limit?: number; cursor?: string; status?: string }
): Promise<PartnerCycleReferralsResp> {
  const qp = new URLSearchParams();
  qp.set("limit", String(params?.limit || 20));
  if (params?.cursor) qp.set("cursor", params.cursor);
  if (params?.status) qp.set("status", params.status);

  return apiFetch<PartnerCycleReferralsResp>(
    `${BASE}/superadmins/partners/${encodeURIComponent(partnerId)}/cycles/${encodeURIComponent(
      cycleId
    )}/referrals?${qp.toString()}`
  );
}

export async function fetchSuperAdminCompletedCycles(params?: {
  page?: number;
  limit?: number;
  search?: string;
  payoutStatus?: "PAID" | "PENDING" | "CANCELLED" | "";
  onlyActionable?: boolean;
}): Promise<SuperAdminCompletedCyclesResp> {
  const qp = new URLSearchParams();
  qp.set("page", String(params?.page || 1));
  qp.set("limit", String(params?.limit || 10));
  if (params?.search?.trim()) qp.set("search", params.search.trim());
  if (params?.payoutStatus) qp.set("payoutStatus", params.payoutStatus);
  if (params?.onlyActionable) qp.set("onlyActionable", "true");

  return apiFetch<SuperAdminCompletedCyclesResp>(`${BASE}/superadmins/partners/cycles/completed?${qp.toString()}`);
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

export async function toggleSuperAdminPartnerStatus(
  partnerId: string,
  payload: { isActive: boolean }
): Promise<any> {
  return apiFetch<any>(`${BASE}/superadmins/partners/${encodeURIComponent(partnerId)}/toggle`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteSuperAdminPartner(
  partnerId: string,
  payload?: { reason?: string }
): Promise<any> {
  return apiFetch<any>(`${BASE}/superadmins/partners/${encodeURIComponent(partnerId)}`, {
    method: "DELETE",
    body: JSON.stringify(payload || {}),
  });
}

export async function fetchSuperAdminDeletedPartners(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<DeletedPartnerArchiveListResp> {
  const qp = new URLSearchParams();
  qp.set("page", String(params?.page || 1));
  qp.set("limit", String(params?.limit || 10));
  if (params?.search?.trim()) qp.set("search", params.search.trim());

  return apiFetch<DeletedPartnerArchiveListResp>(`${BASE}/superadmins/partners/deleted?${qp.toString()}`);
}

export async function fetchSuperAdminDeletedPartnerArchiveDetails(
  archiveId: string
): Promise<DeletedPartnerArchiveDetailsResp> {
  return apiFetch<DeletedPartnerArchiveDetailsResp>(
    `${BASE}/superadmins/partners/deleted/${encodeURIComponent(archiveId)}`
  );
}

export const partnersService = {
  fetchPartnerRequests,
  approvePartnerRequest,
  rejectPartnerRequest,
  createPartnerOnboard,
  fetchSuperAdminPartners,
  fetchSuperAdminPartnerDetails,
  fetchSuperAdminPartnerCycles,
  fetchSuperAdminCompletedCycles,
  fetchSuperAdminPartnerCycleReferrals,
  markSuperAdminPartnerCyclePayout,
  fetchSuperAdminPartnerBank,
  verifySuperAdminPartnerBank,
  toggleSuperAdminPartnerStatus,
  deleteSuperAdminPartner,
  fetchSuperAdminDeletedPartners,
  fetchSuperAdminDeletedPartnerArchiveDetails,
  readTokenFromLocalStorage,
  BASE,
};

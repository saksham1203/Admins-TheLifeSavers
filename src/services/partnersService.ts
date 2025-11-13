// src/services/partnersService.ts
// Small, focused service layer for partner requests and onboarding.
// Keeps network logic and types in one place so hooks/pages remain thin.

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
};

const BASE = "https://dev-service-thelifesavers-in.onrender.com/api";

function readTokenFromLocalStorage(): string | null {
  // accepts either token key used by different parts of the app
  return localStorage.getItem("token") || localStorage.getItem("authToken") || null;
}

/**
 * Fetch all partner requests (admin endpoint).
 * Throws Error on network / API failure.
 */
export async function fetchPartnerRequests(): Promise<PartnerRequest[]> {
  const token = readTokenFromLocalStorage();
  const res = await fetch(`${BASE}/partner-admin/requests`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
  }

  const json = (await res.json()) as ApiListResp;
  if (!json.success) throw new Error("API returned success: false");
  return json.requests ?? [];
}

/**
 * Approve a partner request by id.
 * Returns the raw API response (useful for messages).
 */
export async function approvePartnerRequest(id: string): Promise<any> {
  const token = readTokenFromLocalStorage();
  const res = await fetch(`${BASE}/partner-admin/requests/${encodeURIComponent(id)}/approve`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
  }

  return res.json();
}

/**
 * Reject a partner request by id.
 * Returns the raw API response (useful for messages).
 */
export async function rejectPartnerRequest(id: string): Promise<any> {
  const token = readTokenFromLocalStorage();
  const res = await fetch(`${BASE}/partner-admin/requests/${encodeURIComponent(id)}/reject`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
  }

  return res.json();
}

/**
 * Create an onboard (new partner) request.
 * Returns the API JSON (expected { success: true, message, request }).
 */
export async function createPartnerOnboard(payload: OnboardForm): Promise<any> {
  const token = readTokenFromLocalStorage();
  const res = await fetch(`${BASE}/partners/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
  }

  return res.json();
}

/* Optional exports for tests or upper layers */
export const partnersService = {
  fetchPartnerRequests,
  approvePartnerRequest,
  rejectPartnerRequest,
  createPartnerOnboard,
  readTokenFromLocalStorage,
  BASE,
};

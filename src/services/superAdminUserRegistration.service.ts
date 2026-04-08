import { Preferences } from "@capacitor/preferences";

export type SuperAdminUserRegistrationPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobileNumber: string;
  dob: string;
  bloodGroup: string;
  gender: "male" | "female" | "other";
  availability: "available" | "unavailable";
  country: string;
  state: string;
  district: string;
  city: string;
  referredBy?: string;
};

type RegisterResponse = {
  success: boolean;
  message: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
  };
};

const BASE =
  (typeof import.meta !== "undefined" &&
    (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } })?.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

async function readToken(): Promise<string | null> {
  const { value } = await Preferences.get({ key: "token" });
  return value || null;
}

export async function registerUserBySuperAdmin(
  payload: SuperAdminUserRegistrationPayload
): Promise<RegisterResponse> {
  const token = await readToken();

  const res = await fetch(`${BASE}/superadmins/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.message || body?.msg || `HTTP ${res.status}`);
  }
  return body as RegisterResponse;
}

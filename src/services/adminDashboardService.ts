import { Preferences } from "@capacitor/preferences";

export type StatOverview = {
  totalUsers: number;
  newUsers7d: number;
  newUsersToday?: number;
  totalOrders: number;
  testsBookedToday: number;
  revenue30d: number;
  selectedRangeOrders?: number;
  selectedRangeRevenue?: number;
  lastUpdated?: string;
  partnerRequestsCount?: number;
  totalLabs?: number;
  activeLabs?: number;
  inactiveLabs?: number;
  newLabs7d?: number;
  totalLabAdmins?: number;
  totalPartners?: number;
  activePartners?: number;
  verifiedPartners?: number;
  totalPhlebos?: number;
  activePromos?: number;
  totalGuests?: number;
  verifiedGuests?: number;
  unverifiedGuests?: number;
  guests7d?: number;
  newGuestsToday?: number;
};

export type TrendPoint = {
  date: string;
  users?: number;
  revenue?: number;
  orders?: number;
  completed?: number;
};

export type BookingByLab = { lab: string; bookings: number };
export type PaymentMethod = { name: string; value: number };
export type TopTest = { test: string; bookings: number };
export type LabsTrendPoint = { date: string; labs: number };
export type OrderStatusSummary = { status: string; count: number };
export type GuestTrendPoint = { date: string; guests: number; verified: number };

export type DashboardLab = {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
  rating?: number | null;
  createdAt?: string;
  updatedAt?: string;
  counts: {
    admins: number;
    tests: number;
    packages: number;
    orders: number;
    phlebos: number;
  };
  performance: {
    ordersInRange: number;
    revenueInRange: number;
  };
};

export type DashboardGuest = {
  id: string;
  fullName?: string | null;
  mobile?: string | null;
  verified: boolean;
  isGuest: boolean;
  createdAt?: string;
  updatedAt?: string;
  hasRegisteredAccount: boolean;
  performance: {
    ordersInRange: number;
    spendInRange: number;
  };
};

export type DashboardDateRange = {
  from: string;
  to: string;
};

export type DashboardBundle = {
  overview: StatOverview;
  usersTrend: TrendPoint[];
  revenueTrend: TrendPoint[];
  ordersTrend: TrendPoint[];
  bookingsByLab: BookingByLab[];
  paymentMethods: PaymentMethod[];
  topTests: TopTest[];
  labsTrend: LabsTrendPoint[];
  orderStatusSummary: OrderStatusSummary[];
  guestTrend: GuestTrendPoint[];
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalAll?: number;
  totalFiltered?: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type DashboardUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  dob?: string;
  bloodGroup?: string;
  gender?: string;
  availability?: string;
  country?: string;
  state?: string;
  district?: string;
  city?: string;
  referredBy?: string;
  termsAccepted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type DashboardUsersResp = {
  success: boolean;
  users: DashboardUser[];
  pagination: PaginationMeta;
};

export type DashboardUserDetailsResp = {
  success: boolean;
  user: DashboardUser;
};

export type DashboardLabsResp = {
  success: boolean;
  labs: DashboardLab[];
  pagination: PaginationMeta;
};

export type DashboardGuestsResp = {
  success: boolean;
  guests: DashboardGuest[];
  pagination: PaginationMeta;
};

export type DashboardUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  bloodGroup?: string;
  city?: string;
  state?: string;
  from?: string;
  to?: string;
};

export type DashboardLabsParams = {
  page?: number;
  limit?: number;
  search?: string;
  onlyActive?: boolean;
  from?: string;
  to?: string;
};

export type DashboardGuestsParams = {
  page?: number;
  limit?: number;
  search?: string;
  onlyVerified?: boolean;
  from?: string;
  to?: string;
};

type ViteImportMeta = ImportMeta & { env?: { VITE_API_URL?: string } };

const BASE =
  (typeof import.meta !== "undefined"
    ? (import.meta as ViteImportMeta).env?.VITE_API_URL
    : undefined) ||
  "http://localhost:5000/api";

async function readToken(): Promise<string | null> {
  const { value } = await Preferences.get({ key: "token" });
  return value || null;
}

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const token = await readToken();

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

function buildRangeQuery(range: DashboardDateRange): string {
  const qp = new URLSearchParams();
  qp.set("from", range.from);
  qp.set("to", range.to);
  return qp.toString();
}

export async function fetchStats(range: DashboardDateRange): Promise<StatOverview> {
  return apiFetch<StatOverview>(`${BASE}/admin/stats?${buildRangeQuery(range)}`);
}

export async function fetchUsersTrend(range: DashboardDateRange): Promise<TrendPoint[]> {
  return apiFetch<TrendPoint[]>(`${BASE}/admin/users-trend?${buildRangeQuery(range)}`);
}

export async function fetchRevenueTrend(range: DashboardDateRange): Promise<TrendPoint[]> {
  return apiFetch<TrendPoint[]>(`${BASE}/admin/revenue-trend?${buildRangeQuery(range)}`);
}

export async function fetchOrdersTrend(range: DashboardDateRange): Promise<TrendPoint[]> {
  return apiFetch<TrendPoint[]>(`${BASE}/admin/orders-trend?${buildRangeQuery(range)}`);
}

export async function fetchBookingsByLab(range: DashboardDateRange): Promise<BookingByLab[]> {
  return apiFetch<BookingByLab[]>(`${BASE}/admin/bookings-by-lab?${buildRangeQuery(range)}`);
}

export async function fetchPaymentMethods(range: DashboardDateRange): Promise<PaymentMethod[]> {
  return apiFetch<PaymentMethod[]>(`${BASE}/admin/payment-methods?${buildRangeQuery(range)}`);
}

export async function fetchTopTests(range: DashboardDateRange): Promise<TopTest[]> {
  return apiFetch<TopTest[]>(`${BASE}/admin/top-tests?${buildRangeQuery(range)}`);
}

export async function fetchLabsTrend(range: DashboardDateRange): Promise<LabsTrendPoint[]> {
  return apiFetch<LabsTrendPoint[]>(`${BASE}/admin/labs-trend?${buildRangeQuery(range)}`);
}

export async function fetchOrderStatusSummary(range: DashboardDateRange): Promise<OrderStatusSummary[]> {
  return apiFetch<OrderStatusSummary[]>(`${BASE}/admin/order-status-summary?${buildRangeQuery(range)}`);
}

export async function fetchGuestTrend(range: DashboardDateRange): Promise<GuestTrendPoint[]> {
  return apiFetch<GuestTrendPoint[]>(`${BASE}/admin/guests-trend?${buildRangeQuery(range)}`);
}

export async function fetchPartnerRequestsCount(): Promise<number | null> {
  const json = await apiFetch<{ success?: boolean; count?: number }>(`${BASE}/admin/partner-requests/count`);
  if (typeof json?.count === "number") return json.count;
  return null;
}

export async function fetchDashboardBundle(range: DashboardDateRange): Promise<DashboardBundle> {
  const settled = await Promise.allSettled([
    fetchStats(range),
    fetchUsersTrend(range),
    fetchRevenueTrend(range),
    fetchOrdersTrend(range),
    fetchBookingsByLab(range),
    fetchPaymentMethods(range),
    fetchTopTests(range),
    fetchLabsTrend(range),
    fetchOrderStatusSummary(range),
    fetchGuestTrend(range),
  ]);

  const overview = settled[0].status === "fulfilled" ? settled[0].value : ({
    totalUsers: 0,
    newUsers7d: 0,
    totalOrders: 0,
    testsBookedToday: 0,
    revenue30d: 0,
  } as StatOverview);

  return {
    overview,
    usersTrend: settled[1].status === "fulfilled" && Array.isArray(settled[1].value) ? settled[1].value : [],
    revenueTrend: settled[2].status === "fulfilled" && Array.isArray(settled[2].value) ? settled[2].value : [],
    ordersTrend: settled[3].status === "fulfilled" && Array.isArray(settled[3].value) ? settled[3].value : [],
    bookingsByLab: settled[4].status === "fulfilled" && Array.isArray(settled[4].value) ? settled[4].value : [],
    paymentMethods: settled[5].status === "fulfilled" && Array.isArray(settled[5].value) ? settled[5].value : [],
    topTests: settled[6].status === "fulfilled" && Array.isArray(settled[6].value) ? settled[6].value : [],
    labsTrend: settled[7].status === "fulfilled" && Array.isArray(settled[7].value) ? settled[7].value : [],
    orderStatusSummary: settled[8].status === "fulfilled" && Array.isArray(settled[8].value) ? settled[8].value : [],
    guestTrend: settled[9].status === "fulfilled" && Array.isArray(settled[9].value) ? settled[9].value : [],
  };
}

export async function fetchDashboardUsers(params?: DashboardUsersParams): Promise<DashboardUsersResp> {
  const qp = new URLSearchParams();
  qp.set("page", String(params?.page || 1));
  qp.set("limit", String(params?.limit || 10));
  if (params?.search?.trim()) qp.set("search", params.search.trim());
  if (params?.bloodGroup?.trim()) qp.set("bloodGroup", params.bloodGroup.trim());
  if (params?.city?.trim()) qp.set("city", params.city.trim());
  if (params?.state?.trim()) qp.set("state", params.state.trim());
  if (params?.from) qp.set("from", params.from);
  if (params?.to) qp.set("to", params.to);

  return apiFetch<DashboardUsersResp>(`${BASE}/admin/users?${qp.toString()}`);
}

export async function fetchDashboardUserDetails(userId: string): Promise<DashboardUserDetailsResp> {
  return apiFetch<DashboardUserDetailsResp>(`${BASE}/admin/users/${encodeURIComponent(userId)}`);
}

export async function fetchDashboardLabs(params?: DashboardLabsParams): Promise<DashboardLabsResp> {
  const qp = new URLSearchParams();
  qp.set("page", String(params?.page || 1));
  qp.set("limit", String(params?.limit || 10));
  if (params?.search?.trim()) qp.set("search", params.search.trim());
  if (params?.onlyActive) qp.set("onlyActive", "true");
  if (params?.from) qp.set("from", params.from);
  if (params?.to) qp.set("to", params.to);

  return apiFetch<DashboardLabsResp>(`${BASE}/admin/labs?${qp.toString()}`);
}

export async function fetchDashboardGuests(params?: DashboardGuestsParams): Promise<DashboardGuestsResp> {
  const qp = new URLSearchParams();
  qp.set("page", String(params?.page || 1));
  qp.set("limit", String(params?.limit || 10));
  if (params?.search?.trim()) qp.set("search", params.search.trim());
  if (params?.onlyVerified) qp.set("onlyVerified", "true");
  if (params?.from) qp.set("from", params.from);
  if (params?.to) qp.set("to", params.to);

  return apiFetch<DashboardGuestsResp>(`${BASE}/admin/guests?${qp.toString()}`);
}

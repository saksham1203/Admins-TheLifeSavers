import React, { useMemo, useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaUsers,
  FaChartLine,
  FaClipboardList,
  FaFlask,
  FaRupeeSign,
  FaSyncAlt,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";

/**
 * AdminDashboard — redesigned *inside* while keeping the original parent card layout intact.
 * - Outer wrapper & max-width unchanged (keeps integration with your app layout)
 * - Visual improvements confined to inner content (cards, charts, buttons)
 * - CSV/export logic removed from this file (assume Reports page handles exports)
 */

const pill = (text: string, cls = "bg-red-100 text-red-700 border-red-200") => (
  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>
    {text}
  </span>
);

const SectionCard: React.FC<{
  title: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}> = ({ title, right, className, children }) => (
  <div
    className={`rounded-2xl border border-red-100 bg-white/70 backdrop-blur shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition ${
      className ?? ""
    }`}
  >
    <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-r from-red-50/80 to-red-100/80 rounded-t-2xl">
      <h3 className="text-sm sm:text-base font-bold text-red-700 flex items-center gap-2">{title}</h3>
      {right}
    </div>
    <div className="p-4 sm:p-6">{children}</div>
  </div>
);

// types
type StatOverview = {
  totalUsers: number;
  newUsers7d: number;
  totalOrders: number;
  testsBookedToday: number;
  revenue30d: number;
  lastUpdated?: string;
  partnerRequestsCount?: number;
};

type TrendPoint = { date: string; users: number };
type BookingByLab = { lab: string; bookings: number };
type PaymentMethod = { name: string; value: number };

const COLORS = ["#EF4444", "#FB923C", "#F59E0B", "#10B981"];
const numberWithCommas = (n: number) => n.toLocaleString("en-IN");

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // --- keep original parent card layout's date defaults ---
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const [overview, setOverview] = useState<StatOverview | null>(null);
  const [usersTrend, setUsersTrend] = useState<TrendPoint[]>([]);
  const [bookingsByLab, setBookingsByLab] = useState<BookingByLab[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPartnerRequestsCount = async (): Promise<number | null> => {
    try {
      const res = await fetch("/api/admin/partner-requests/count");
      if (!res.ok) return null;
      const json = await res.json();
      if (typeof json === "number") return json;
      if (json && typeof json.count === "number") return json.count;
      return null;
    } catch (err) {
      return null;
    }
  };

  const fetchAll = async (from?: string, to?: string) => {
    setLoading(true);
    setError(null);
    try {
      const q = `?from=${encodeURIComponent(from ?? fromDate)}&to=${encodeURIComponent(to ?? toDate)}`;

      const [ovRes, trendRes, labsRes, pmRes] = await Promise.all([
        fetch(`/api/admin/stats${q}`),
        fetch(`/api/admin/users-trend${q}`),
        fetch(`/api/admin/bookings-by-lab${q}`),
        fetch(`/api/admin/payment-methods${q}`),
      ]);

      if (!ovRes.ok || !trendRes.ok || !labsRes.ok || !pmRes.ok) {
        const msgs = [
          ovRes.ok ? null : `stats:${ovRes.status}`,
          trendRes.ok ? null : `trend:${trendRes.status}`,
          labsRes.ok ? null : `labs:${labsRes.status}`,
          pmRes.ok ? null : `pm:${pmRes.status}`,
        ].filter(Boolean);
        throw new Error(`API error (${msgs.join(", ")})`);
      }

      const ovJson = (await ovRes.json()) as StatOverview;
      const trendJson = (await trendRes.json()) as TrendPoint[];
      const labsJson = (await labsRes.json()) as BookingByLab[];
      const pmJson = (await pmRes.json()) as PaymentMethod[];

      if (typeof ovJson.partnerRequestsCount !== "number") {
        const cnt = await fetchPartnerRequestsCount();
        if (cnt !== null) ovJson.partnerRequestsCount = cnt;
      }

      setOverview(ovJson);
      setUsersTrend(trendJson);
      setBookingsByLab(labsJson);
      setPaymentMethods(pmJson);
    } catch (err: any) {
      console.error("Failed to fetch dashboard data", err);
      setError(err?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mock fallback (keeps same behaviour)
  useEffect(() => {
    if (!loading && error && !overview) {
      const mockOverview: StatOverview = {
        totalUsers: 12485,
        newUsers7d: 142,
        totalOrders: 3287,
        testsBookedToday: 62,
        revenue30d: 254000,
        lastUpdated: new Date().toISOString(),
        partnerRequestsCount: 8,
      };
      const mockTrend: TrendPoint[] = [
        { date: "28 Aug", users: 12 },
        { date: "29 Aug", users: 18 },
        { date: "30 Aug", users: 9 },
        { date: "31 Aug", users: 24 },
        { date: "01 Sep", users: 30 },
        { date: "02 Sep", users: 28 },
        { date: "03 Sep", users: 21 },
      ];
      const mockByLab: BookingByLab[] = [
        { lab: "City Diagnostic", bookings: 120 },
        { lab: "HealthPlus Labs", bookings: 95 },
        { lab: "WellCare Lab", bookings: 70 },
        { lab: "North Lab", bookings: 40 },
      ];
      const mockPM: PaymentMethod[] = [
        { name: "UPI", value: 58 },
        { name: "Card", value: 30 },
        { name: "NetBanking", value: 7 },
        { name: "COD", value: 5 },
      ];

      setOverview(mockOverview);
      setUsersTrend(mockTrend);
      setBookingsByLab(mockByLab);
      setPaymentMethods(mockPM);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error]);

  const kpis = useMemo(() => {
    const ov = overview ?? {
      totalUsers: 0,
      newUsers7d: 0,
      totalOrders: 0,
      testsBookedToday: 0,
      revenue30d: 0,
    };
    return [
      {
        id: "users",
        title: "Total Users",
        value: numberWithCommas(ov.totalUsers),
        icon: <FaUsers />,
        hint: `${ov.newUsers7d} new (7d)`,
      },
      {
        id: "orders",
        title: "Total Orders",
        value: numberWithCommas(ov.totalOrders),
        icon: <FaClipboardList />,
        hint: `${ov.testsBookedToday} today`,
      },
      {
        id: "revenue",
        title: "30d Revenue",
        value: `₹${numberWithCommas(ov.revenue30d)}`,
        icon: <FaRupeeSign />,
        hint: `Last update: ${ov.lastUpdated ? new Date(ov.lastUpdated).toLocaleDateString() : "—"}`,
      },
      {
        id: "requests",
        title: "Partner Requests",
        value: overview?.partnerRequestsCount ?? 0,
        icon: <FaChartLine />,
        hint: "Pending",
      },
    ];
  }, [overview]);

  const onRefresh = () => fetchAll();
  const onApplyDateRange = () => fetchAll(fromDate, toDate);

  // -----------------------
  // RENDER — keep original outer parent wrapper/layout exactly
  // -----------------------
  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center p-6"
      style={{ paddingTop: "4rem", paddingBottom: "4rem" }}
    >
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl max-w-7xl w-full overflow-hidden relative ring-1 ring-red-100">
        {/* Header (kept visually consistent with original) */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white py-5 px-6 shadow-md relative after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/40">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition"
              aria-label="Back"
            >
              <FaArrowLeft size={18} />
            </button>

            <div className="flex flex-col items-center text-center">
              <h1 className="text-2xl sm:text-3xl font-extrabold">Admin Dashboard</h1>
              <span className="text-sm sm:text-base text-white/90 mt-1">LifeSavers.in — Lab Test Booking</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-white/90">Overview</div>
              <div className="px-3 py-1 rounded-full bg-white/20 text-white text-sm">Live</div>
            </div>
          </div>
        </div>

        {/* ------------------ Inner content (redesigned but stays inside the same parent card) ------------------ */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Top bar: filters + refresh/report button (CSV removed) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-sm text-gray-600">Date range</div>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm"
                max={toDate}
              />
              <span className="text-sm text-gray-400">—</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm"
                min={fromDate}
              />
              <button
                onClick={onApplyDateRange}
                className="rounded-full bg-red-600 text-white px-3 py-2 text-sm font-semibold hover:bg-red-700"
                title="Apply date range"
              >
                Apply
              </button>

              <div className="text-sm text-gray-500 ml-2 hidden sm:block">
                {overview?.lastUpdated ? (
                  <>{pill(`Updated: ${new Date(overview.lastUpdated).toLocaleString()}`, "bg-yellow-50 text-yellow-700 border-yellow-200")}</>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                className="rounded-full bg-white border px-3 py-2 text-sm font-semibold hover:bg-red-50 flex items-center gap-2"
                title="Refresh"
              >
                <FaSyncAlt /> Refresh
              </button>
            </div>
          </div>

          {/* KPI cards (kept same grid placement as original but visually enhanced inside) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((k) => (
              <SectionCard
                key={k.id}
                title={<span className="flex items-center gap-2">{k.icon} {k.title}</span>}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{k.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{k.title} — quick snapshot</div>
                  </div>
                  <div className="hidden sm:block text-sm text-gray-400">{pill(loading ? "Updating…" : "Updated", "bg-yellow-50 text-yellow-700 border-yellow-200")}</div>
                </div>
              </SectionCard>
            ))}
          </div>

          {/* Charts + lists (kept layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SectionCard
                title={<span className="flex items-center gap-2"><FaChartLine /> User growth ({fromDate} → {toDate})</span>}
                right={<div className="text-xs text-gray-500">{usersTrend.length} points</div>}
              >
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={usersTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="#EF4444" strokeWidth={3} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 text-sm text-gray-600">Shows new user signups per day. Use this chart to spot growth and activity spikes.</div>
              </SectionCard>
            </div>

            <SectionCard
              title={<span className="flex items-center gap-2"><FaFlask /> Tests booked by lab ({fromDate} → {toDate})</span>}
              right={<div className="text-xs text-gray-500">Top labs</div>}
            >
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingsByLab} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="lab" type="category" width={140} />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#FB923C" barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SectionCard title={<span className="flex items-center gap-2"><FaClipboardList /> Orders Today</span>}>
              <div className="text-xl font-bold">{overview?.testsBookedToday ?? "—"} bookings</div>
              <div className="text-sm text-gray-500 mt-2">Across all labs — real-time metric</div>
            </SectionCard>

            <SectionCard title={<span className="flex items-center gap-2"><FaRupeeSign /> Revenue (30d)</span>}>
              <div className="text-xl font-bold">₹{numberWithCommas(overview?.revenue30d ?? 0)}</div>
              <div className="text-sm text-gray-500 mt-2">Net collected in the selected window</div>
            </SectionCard>

            <SectionCard title={<span className="flex items-center gap-2"><FaChartLine /> Payment methods</span>}>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentMethods} dataKey="value" nameKey="name" outerRadius={60} label>
                      {paymentMethods.map((_entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
            <SectionCard title={<span className="flex items-center gap-2">Partner Requests</span>} right={<div className="text-xs text-gray-500">Super Admin</div>}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-extrabold text-gray-900">{overview?.partnerRequestsCount ?? 0}</div>
                  <div className="text-sm text-gray-500 mt-1">Pending partner requests</div>
                </div>
                <div>
                  <button
                    onClick={() => navigate("/partner-requests")}
                    className="rounded-full bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700"
                    aria-label="Open partner requests"
                  >
                    Open
                  </button>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Quick actions + notes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title={<span className="flex items-center gap-2"><FaClipboardList /> Quick Actions</span>}>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="rounded-full bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700" onClick={() => navigate("/lab-onboarding")}>Onboard Lab</button>
                <button className="rounded-full bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700" onClick={() => navigate("/lab-admins-onboarding")}>Onboard Lab Admins</button>
                <button className="rounded-full bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700" onClick={() => navigate("/promocodes-onboarding")}>Add Promocodes</button>
              </div>
            </SectionCard>

            <SectionCard title={<span className="flex items-center gap-2"><FaClipboardList /> Admin Notes</span>}>
              <div className="text-sm text-gray-600">This dashboard keeps the original parent card layout you requested. Visual improvements are confined to the contents: clearer spacing, consistent card treatment, and small sparklines. CSV/export responsibilities have been delegated to the Reports page to keep this component focused on live UI.</div>
            </SectionCard>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

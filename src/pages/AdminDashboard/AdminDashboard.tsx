// AdminDashboard.tsx — responsive tweaks so charts take full width on small devices
import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  FaArrowLeft,
  FaUsers,
  FaChartLine,
  FaClipboardList,
  FaFlask,
  FaRupeeSign,
  FaSyncAlt,
  FaRegStar,
  FaBolt,
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
  AreaChart,
  Area,
} from "recharts";
import { useNavigate } from "react-router-dom";

/**
 * AdminDashboard — redesigned for a bigger application
 * - Charts take full width on small screens
 * - Responsive heights for chart containers using Tailwind classes
 * - Quick actions stack on small devices; buttons become full-width
 * - Kept your APIs, mock fallbacks and red theme
 */

// small helpers
const numberWithCommas = (n: number) => n.toLocaleString("en-IN");
const COLORS = ["#EF4444", "#FB923C", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"];

const pill = (text: string, cls = "bg-red-100 text-red-700 border-red-200") => (
  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>{text}</span>
);

// Section card wrapper — responsive padding adjustments
const SectionCard: React.FC<{
  title: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}> = ({ title, right, className, children }) => (
  <div
    className={`rounded-2xl border border-red-100 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-lg transition-transform transform-gpu ${className ?? ""}`}
  >
    <div className="flex items-center justify-between px-3 sm:px-6 py-3 bg-gradient-to-r from-red-50/90 to-red-100/90 rounded-t-2xl">
      <h3 className="text-sm sm:text-base font-bold text-red-700 flex items-center gap-2">{title}</h3>
      {right}
    </div>
    <div className="p-3 sm:p-6">{children}</div>
  </div>
);

// Types
type StatOverview = {
  totalUsers: number;
  newUsers7d: number;
  totalOrders: number;
  testsBookedToday: number;
  revenue30d: number;
  lastUpdated?: string;
  partnerRequestsCount?: number;
};

type TrendPoint = { date: string; users?: number; revenue?: number; orders?: number; completed?: number };
type BookingByLab = { lab: string; bookings: number };
type PaymentMethod = { name: string; value: number };
type TopTest = { test: string; bookings: number };

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // date range state (defaults to 7-day window)
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // data state
  const [overview, setOverview] = useState<StatOverview | null>(null);
  const [usersTrend, setUsersTrend] = useState<TrendPoint[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<TrendPoint[]>([]);
  const [ordersTrend, setOrdersTrend] = useState<TrendPoint[]>([]);
  const [bookingsByLab, setBookingsByLab] = useState<BookingByLab[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [topTests, setTopTests] = useState<TopTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  // helper to fetch partner requests count (existing)
  const fetchPartnerRequestsCount = async (): Promise<number | null> => {
    try {
      const res = await fetch("/api/admin/partner-requests/count");
      if (!res.ok) return null;
      const json = await res.json();
      if (typeof json === "number") return json;
      if (json && typeof json.count === "number") return json.count;
      return null;
    } catch {
      return null;
    }
  };

  // combined fetch — add extra endpoints for revenue & orders & top-tests
  const fetchAll = useCallback(
    async (from?: string, to?: string) => {
      setLoading(true);
      setError(null);
      try {
        const q = `?from=${encodeURIComponent(from ?? fromDate)}&to=${encodeURIComponent(to ?? toDate)}`;

        // request multiple endpoints in parallel
        const endpoints = [
          `/api/admin/stats${q}`,
          `/api/admin/users-trend${q}`,
          `/api/admin/revenue-trend${q}`,
          `/api/admin/orders-trend${q}`,
          `/api/admin/bookings-by-lab${q}`,
          `/api/admin/payment-methods${q}`,
          `/api/admin/top-tests${q}`,
        ];

        const responses = await Promise.all(endpoints.map((e) => fetch(e)));

        // check ok
        const bad = responses
          .map((r, idx) => (!r.ok ? `${endpoints[idx]}:${r.status}` : null))
          .filter(Boolean);
        if (bad.length) {
          // fallback: attempt to read any successful ones, but throw to use mocks for missing
          console.warn("Some endpoints failed:", bad);
        }

        // parse bodies when ok, otherwise use empty defaults
        const [ovRes, trendRes, revRes, ordersRes, labsRes, pmRes, topTestsRes] = responses;

        const ovJson = ovRes.ok ? await ovRes.json() : null;
        const trendJson = trendRes.ok ? await trendRes.json() : [];
        const revJson = revRes.ok ? await revRes.json() : [];
        const ordersJson = ordersRes.ok ? await ordersRes.json() : [];
        const labsJson = labsRes.ok ? await labsRes.json() : [];
        const pmJson = pmRes.ok ? await pmRes.json() : [];
        const topTestsJson = topTestsRes.ok ? await topTestsRes.json() : [];

        const ov: StatOverview =
          ovJson && typeof ovJson === "object"
            ? ovJson
            : {
                totalUsers: 0,
                newUsers7d: 0,
                totalOrders: 0,
                testsBookedToday: 0,
                revenue30d: 0,
              };

        // fill partnerRequestsCount if absent
        if (typeof ov.partnerRequestsCount !== "number") {
          const cnt = await fetchPartnerRequestsCount();
          if (cnt !== null) ov.partnerRequestsCount = cnt;
        }

        setOverview(ov);
        setUsersTrend(Array.isArray(trendJson) ? trendJson : []);
        setRevenueTrend(Array.isArray(revJson) ? revJson : []);
        setOrdersTrend(Array.isArray(ordersJson) ? ordersJson : []);
        setBookingsByLab(Array.isArray(labsJson) ? labsJson : []);
        setPaymentMethods(Array.isArray(pmJson) ? pmJson : []);
        setTopTests(Array.isArray(topTestsJson) ? topTestsJson : []);
      } catch (err: any) {
        console.error("Failed to fetch dashboard data", err);
        setError(err?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [fromDate, toDate]
  );

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fallback mock data if nothing fetched
  useEffect(() => {
    if (!loading && !overview) {
      const now = new Date();
      const mockOverview: StatOverview = {
        totalUsers: 12485,
        newUsers7d: 142,
        totalOrders: 3287,
        testsBookedToday: 62,
        revenue30d: 254000,
        lastUpdated: new Date().toISOString(),
        partnerRequestsCount: 8,
      };

      // create 7 points of mock trend
      const dates: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        dates.push(d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }));
      }
      const mockUsers = dates.map((dt) => ({ date: dt, users: 10 + Math.round(Math.random() * 30) }));
      const mockRevenue = dates.map((dt) => ({ date: dt, revenue: 2000 + Math.round(Math.random() * 8000) }));
      const mockOrders = dates.map((dt) => ({ date: dt, orders: 8 + Math.round(Math.random() * 30), completed: 5 + Math.round(Math.random() * 25) }));

      const mockLabs: BookingByLab[] = [
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
      const mockTopTests: TopTest[] = [
        { test: "CBC", bookings: 420 },
        { test: "Lipid Panel", bookings: 312 },
        { test: "Thyroid Profile", bookings: 220 },
        { test: "Blood Sugar", bookings: 180 },
      ];

      setOverview(mockOverview);
      setUsersTrend(mockUsers);
      setRevenueTrend(mockRevenue);
      setOrdersTrend(mockOrders);
      setBookingsByLab(mockLabs);
      setPaymentMethods(mockPM);
      setTopTests(mockTopTests);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, overview]);

  // KPI cards data with mini-sparkline
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
        hint: `${ov.newUsers7d} new (7d)`,
        spark: usersTrend.map((p) => ({ date: p.date, v: p.users ?? 0 })),
        icon: <FaUsers className="text-red-600" />,
      },
      {
        id: "orders",
        title: "Total Orders",
        value: numberWithCommas(ov.totalOrders),
        hint: `${ov.testsBookedToday} today`,
        spark: ordersTrend.map((p) => ({ date: p.date, v: p.orders ?? 0 })),
        icon: <FaClipboardList className="text-red-600" />,
      },
      {
        id: "revenue",
        title: "30d Revenue",
        value: `₹${numberWithCommas(ov.revenue30d)}`,
        hint: `Last: ${ov.lastUpdated ? new Date(ov.lastUpdated).toLocaleDateString() : "—"}`,
        spark: revenueTrend.map((p) => ({ date: p.date, v: p.revenue ?? 0 })),
        icon: <FaRupeeSign className="text-red-600" />,
      },
      {
        id: "requests",
        title: "Partner Requests",
        value: overview?.partnerRequestsCount ?? 0,
        hint: "Pending",
        spark: usersTrend.slice(-7).map((p) => ({ date: p.date, v: p.users ?? 0 })), // placeholder spark
        icon: <FaChartLine className="text-red-600" />,
      },
    ];
  }, [overview, usersTrend, revenueTrend, ordersTrend]);

  const onRefresh = () => fetchAll();
  const onApplyDateRange = () => fetchAll(fromDate, toDate);

  // ---------- render ----------
  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-3 sm:p-6" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl w-full max-w-7xl overflow-hidden relative ring-1 ring-red-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white py-5 px-4 sm:px-6 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 bg-red-600 rounded-full shadow-md hover:bg-red-700 transition" aria-label="Back">
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold">Admin Dashboard</h1>
                <div className="text-sm text-white/90 mt-1">LifeSavers.in — Lab Test Booking</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-white/90">Overview</div>
              <div className="px-3 py-1 rounded-full bg-white/20 text-white text-sm">Live</div>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-6 space-y-6">
          {/* Top controls (date + quick actions + refresh) */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-sm text-gray-600 mr-1">Date range</div>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" max={toDate} />
              <span className="text-sm text-gray-400">—</span>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" min={fromDate} />
              <button onClick={onApplyDateRange} className="rounded-full bg-red-600 text-white px-3 py-2 text-sm font-semibold hover:bg-red-700 ml-1">Apply</button>

              <div className="text-sm text-gray-500 hidden sm:block ml-3">
                {overview?.lastUpdated ? pill(`Updated: ${new Date(overview.lastUpdated).toLocaleString()}`, "bg-yellow-50 text-yellow-700 border-yellow-200") : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={onRefresh} className="rounded-full bg-white border px-3 py-2 text-sm font-semibold hover:bg-red-50 flex items-center gap-2">
                <FaSyncAlt /> <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* QUICK ACTIONS — moved to top; stack on small devices */}
          <SectionCard title={<span className="flex items-center gap-2"><FaBolt /> Quick Actions</span>} right={<div className="text-xs text-gray-500">Admin shortcuts</div>}>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="w-full sm:w-auto rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700" onClick={() => navigate("/lab-onboarding")}>Onboard Lab</button>
              <button className="w-full sm:w-auto rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700" onClick={() => navigate("/lab-admins-onboarding")}>Onboard Lab Admins</button>
              <button className="w-full sm:w-auto rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700" onClick={() => navigate("/promocodes-onboarding")}>Add Promocodes</button>
              <button className="w-full sm:w-auto rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700" onClick={() => navigate("/phlebos-onboarding")}>Onboard Phlebo</button>
              <button className="w-full sm:w-auto rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700" onClick={() => navigate("/partner-requests")}>Onboard Partners</button>
              <button className="w-full sm:w-auto rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700" onClick={() => navigate("/partnerspricinglists")}>Partners Pricing Lists</button>
              <button className="w-full sm:w-auto rounded-lg bg-white border px-4 py-2 text-sm font-semibold hover:bg-red-50" onClick={() => navigate("/reports")}>Go to Reports</button>
            </div>
          </SectionCard>

          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((k) => (
              <SectionCard key={k.id} title={<span className="flex items-center gap-2">{k.icon} {k.title}</span>}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{k.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{k.hint}</div>
                  </div>

                  {/* mini sparkline */}
                  <div className="w-28 h-12 sm:w-32 sm:h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={k.spark}>
                        <Line type="monotone" dataKey="v" stroke="#EF4444" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </SectionCard>
            ))}
          </div>

          {/* Primary charts: users + revenue + orders vs completed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SectionCard title={<span className="flex items-center gap-2"><FaChartLine /> Users & Revenue ({fromDate} → {toDate})</span>} right={<div className="text-xs text-gray-500">{usersTrend.length} points</div>}>
                {/* responsive height: small devices get taller chart area to use full width */}
                <div className="w-full h-56 sm:h-64 md:h-72 lg:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={usersTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Line yAxisId="left" type="monotone" dataKey="users" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} name="New users" />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#FB923C" strokeWidth={2} dot={false} name="Revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 text-sm text-gray-600">Combined view to spot correlation between signups and revenue. Revenue uses right axis.</div>
              </SectionCard>
            </div>

            <SectionCard title={<span className="flex items-center gap-2"><FaRupeeSign /> Revenue Trend</span>} right={<div className="text-xs text-gray-500">30d</div>}>
              <div className="w-full h-56 sm:h-64 md:h-72 lg:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrend}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FB923C" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#FB923C" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#FB923C" fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          {/* Orders vs Completed (stacked bar) + bookings by lab + top tests
              On small screens each card stacks and occupies full width */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SectionCard title={<span className="flex items-center gap-2"><FaClipboardList /> Orders vs Completed</span>} right={<div className="text-xs text-gray-500">Trend</div>}>
              <div className="w-full h-56 sm:h-64 md:h-64 lg:h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" stackId="a" fill="#EF4444" name="Orders" />
                    <Bar dataKey="completed" stackId="a" fill="#10B981" name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title={<span className="flex items-center gap-2"><FaFlask /> Tests by Lab</span>} right={<div className="text-xs text-gray-500">Top labs</div>}>
              <div className="w-full h-56 sm:h-64 md:h-64 lg:h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingsByLab} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="lab" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#3B82F6" barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title={<span className="flex items-center gap-2"><FaRegStar /> Top Tests</span>} right={<div className="text-xs text-gray-500">This period</div>}>
              <div className="w-full h-56 sm:h-64 md:h-64 lg:h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={topTests} dataKey="bookings" nameKey="test" outerRadius={80} label>
                      {topTests.map((_entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          {/* bottom row: orders today / revenue / payment methods / notes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SectionCard title={<span className="flex items-center gap-2"><FaClipboardList /> Orders Today</span>}>
              <div className="text-2xl font-bold">{overview?.testsBookedToday ?? "—"} bookings</div>
              <div className="text-sm text-gray-500 mt-2">Across all labs — real-time snapshot</div>
            </SectionCard>

            <SectionCard title={<span className="flex items-center gap-2"><FaRupeeSign /> Revenue (30d)</span>}>
              <div className="text-2xl font-bold">₹{numberWithCommas(overview?.revenue30d ?? 0)}</div>
              <div className="text-sm text-gray-500 mt-2">Net collected in the selected window</div>
            </SectionCard>

            <SectionCard title={<span className="flex items-center gap-2"><FaChartLine /> Payment methods</span>}>
              <div className="w-full h-44 sm:h-44 md:h-44 lg:h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentMethods} dataKey="value" nameKey="name" outerRadius={60} label>
                      {paymentMethods.map((_entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          {/* Final notes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title={<span className="flex items-center gap-2"><FaClipboardList /> Admin Notes</span>}>
              <div className="text-sm text-gray-600">
                • This dashboard is designed to scale: when your backend provides the endpoints `/revenue-trend`, `/orders-trend`, and `/top-tests`, the charts will show live data.  
                • Quick Actions are now at the top for faster workflows.  
                • Next suggestions: Active user retention, LTV cohort chart, test-level conversion funnel, and alerts for sudden drops/spikes.
              </div>
            </SectionCard>

            <SectionCard title={<span className="flex items-center gap-2"><FaBolt /> Suggested Alerts</span>}>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Spike in cancellations</span>
                  <span className="text-xs text-gray-400 ml-auto">Threshold: 15%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Drop in revenue</span>
                  <span className="text-xs text-gray-400 ml-auto">Threshold: 20%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">High pending partner requests</span>
                  <span className="text-xs text-gray-400 ml-auto">Threshold: 10+</span>
                </div>
                <div className="mt-3 text-sm text-gray-500">I can add alert rules UI to let admins configure thresholds and notifications (email / slack / in-app).</div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

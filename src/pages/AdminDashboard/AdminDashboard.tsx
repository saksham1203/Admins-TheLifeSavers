
import React, { useMemo, useState } from "react";
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
  ComposedChart,
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
  RadialBarChart,
  RadialBar,
  AreaChart,
  Area,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { useAdminDashboard, type DashboardLab, type DashboardGuest } from "../../hooks/useAdminDashboard";

const numberWithCommas = (n: number) => n.toLocaleString("en-IN");
const percent = (n: number) => `${Math.round(n)}%`;
const COLORS = ["#EF4444", "#FB923C", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"];

const pill = (text: string, cls = "bg-red-100 text-red-700 border-red-200") => (
  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>{text}</span>
);

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

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    loading,
    error,
    overview,
    usersTrend,
    revenueTrend,
    usersRevenueTrend,
    ordersTrend,
    bookingsByLab,
    paymentMethods,
    topTests,
    labsTrend,
    orderStatusSummary,
    guestTrend,
    applyDateRange,
    refresh,
    users,
    usersLoading,
    usersError,
    usersQuery,
    setUsersQuery,
    usersPage,
    setUsersPage,
    usersPagination,
    selectedUser,
    selectedUserDetails,
    userDetailsLoading,
    openUserDetails,
    closeUserDetails,
    labs,
    labsLoading,
    labsError,
    labsQuery,
    setLabsQuery,
    labsPage,
    setLabsPage,
    labsPagination,
    guests,
    guestsLoading,
    guestsError,
    guestsQuery,
    setGuestsQuery,
    guestsPage,
    setGuestsPage,
    guestsPagination,
  } = useAdminDashboard();
  const [selectedLabDetails, setSelectedLabDetails] = useState<DashboardLab | null>(null);
  const [selectedGuestDetails, setSelectedGuestDetails] = useState<DashboardGuest | null>(null);

  const kpis = useMemo(
    () => [
      {
        id: "users",
        title: "Total Users",
        value: numberWithCommas(overview.totalUsers || 0),
        hint: `${overview.newUsers7d || 0} new (7d)`,
        spark: usersTrend.map((p) => ({ date: p.date, v: p.users ?? 0 })),
        icon: <FaUsers className="text-red-600" />,
      },
      {
        id: "orders",
        title: "Total Orders",
        value: numberWithCommas(overview.totalOrders || 0),
        hint: `${overview.testsBookedToday || 0} today`,
        spark: ordersTrend.map((p) => ({ date: p.date, v: p.orders ?? 0 })),
        icon: <FaClipboardList className="text-red-600" />,
      },
      {
        id: "revenue",
        title: "30d Revenue",
        value: `Rs${numberWithCommas(overview.revenue30d || 0)}`,
        hint: `Last: ${overview.lastUpdated ? new Date(overview.lastUpdated).toLocaleDateString() : "-"}`,
        spark: revenueTrend.map((p) => ({ date: p.date, v: p.revenue ?? 0 })),
        icon: <FaRupeeSign className="text-red-600" />,
      },
      {
        id: "requests",
        title: "Partner Requests",
        value: overview.partnerRequestsCount ?? 0,
        hint: "Pending",
        spark: usersTrend.slice(-7).map((p) => ({ date: p.date, v: p.users ?? 0 })),
        icon: <FaChartLine className="text-red-600" />,
      },
    ],
    [overview, usersTrend, revenueTrend, ordersTrend]
  );

  const efficiencyTrend = useMemo(() => {
    const revenueByDate = new Map<string, number>();
    for (const row of revenueTrend) revenueByDate.set(row.date, Number(row.revenue || 0));
    return ordersTrend.map((row) => {
      const orders = Number(row.orders || 0);
      const completed = Number(row.completed || 0);
      const revenue = revenueByDate.get(row.date) || 0;
      return {
        date: row.date,
        orders,
        completed,
        revenue,
        avgOrderValue: orders > 0 ? Math.round(revenue / orders) : 0,
        completionRate: orders > 0 ? Math.round((completed * 100) / orders) : 0,
      };
    });
  }, [ordersTrend, revenueTrend]);

  const cumulativeRevenueTrend = useMemo(() => {
    let running = 0;
    return revenueTrend.map((row) => {
      running += Number(row.revenue || 0);
      return {
        date: row.date,
        cumulativeRevenue: Math.round(running),
      };
    });
  }, [revenueTrend]);

  const orderStatusPie = useMemo(
    () => (orderStatusSummary || []).filter((s) => Number(s.count || 0) > 0),
    [orderStatusSummary]
  );

  const paymentMix = useMemo(() => {
    const total = (paymentMethods || []).reduce((acc, row) => acc + Number(row.value || 0), 0);
    return (paymentMethods || []).map((row) => ({
      ...row,
      pct: total > 0 ? Math.round((Number(row.value || 0) * 100) / total) : 0,
    }));
  }, [paymentMethods]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-3 sm:p-6" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl w-full max-w-7xl overflow-hidden relative ring-1 ring-red-100">
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white py-5 px-4 sm:px-6 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 bg-red-600 rounded-full shadow-md hover:bg-red-700 transition" aria-label="Back">
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold">Admin Dashboard</h1>
                <div className="text-sm text-white/90 mt-1">LifeSavers.in - Lab Test Booking</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-white/90">Overview</div>
              <div className="px-3 py-1 rounded-full bg-white/20 text-white text-sm">Live</div>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-sm text-gray-600 mr-1">Date range</div>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" max={toDate} />
              <span className="text-sm text-gray-400">-</span>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" min={fromDate} />
              <button onClick={applyDateRange} className="rounded-full bg-red-600 text-white px-3 py-2 text-sm font-semibold hover:bg-red-700 ml-1">Apply</button>
              <div className="text-sm text-gray-500 hidden sm:block ml-3">
                {overview.lastUpdated
                  ? pill(`Updated: ${new Date(overview.lastUpdated).toLocaleString()}`, "bg-yellow-50 text-yellow-700 border-yellow-200")
                  : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={refresh} className="rounded-full bg-white border px-3 py-2 text-sm font-semibold hover:bg-red-50 flex items-center gap-2">
                <FaSyncAlt /> <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
              Failed to load dashboard: {error}
            </div>
          ) : null}

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((k) => (
              <SectionCard key={k.id} title={<span className="flex items-center gap-2">{k.icon} {k.title}</span>}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{k.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{k.hint}</div>
                  </div>
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

          <SectionCard title={<span className="flex items-center gap-2"><FaBolt /> Operations Snapshot</span>} right={<div className="text-xs text-gray-500">Selected range + live totals</div>}>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">Guests Snapshot</div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2"><div className="text-xs text-emerald-700">Total Guests</div><div className="text-xl font-bold text-gray-900">{numberWithCommas(overview.totalGuests || 0)}</div></div>
              <div className="rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2"><div className="text-xs text-cyan-700">Verified Guests</div><div className="text-xl font-bold text-gray-900">{numberWithCommas(overview.verifiedGuests || 0)}</div></div>
              <div className="rounded-lg border border-orange-100 bg-orange-50 px-3 py-2"><div className="text-xs text-orange-700">Unverified Guests</div><div className="text-xl font-bold text-gray-900">{numberWithCommas(overview.unverifiedGuests || 0)}</div></div>
              <div className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-2"><div className="text-xs text-sky-700">New Guests (7d)</div><div className="text-xl font-bold text-gray-900">{numberWithCommas(overview.guests7d || 0)}</div></div>
              <div className="rounded-lg border border-violet-100 bg-violet-50 px-3 py-2"><div className="text-xs text-violet-700">New Registrations Today</div><div className="text-xl font-bold text-gray-900">{numberWithCommas(overview.newUsersToday || 0)}</div></div>
              <div className="rounded-lg border border-lime-100 bg-lime-50 px-3 py-2"><div className="text-xs text-lime-700">New Guest Today</div><div className="text-xl font-bold text-gray-900">{numberWithCommas(overview.newGuestsToday || 0)}</div></div>
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mt-4 mb-2">Business Snapshot</div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2"><div className="text-xs text-red-700">Range Orders</div><div className="text-xl font-bold text-gray-900">{numberWithCommas(overview.selectedRangeOrders || 0)}</div></div>
              <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2"><div className="text-xs text-amber-700">Range Revenue</div><div className="text-xl font-bold text-gray-900">Rs{numberWithCommas(overview.selectedRangeRevenue || 0)}</div></div>
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2"><div className="text-xs text-blue-700">Total Labs</div><div className="text-xl font-bold text-gray-900">{numberWithCommas(overview.totalLabs || 0)}</div></div>
              <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2"><div className="text-xs text-indigo-700">Active Partners</div><div className="text-xl font-bold text-gray-900">{numberWithCommas(overview.activePartners || 0)}</div></div>
              <div className="rounded-lg border border-fuchsia-100 bg-fuchsia-50 px-3 py-2"><div className="text-xs text-fuchsia-700">Active Promocodes</div><div className="text-xl font-bold text-gray-900">{numberWithCommas(overview.activePromos || 0)}</div></div>
              <div className="rounded-lg border border-teal-100 bg-teal-50 px-3 py-2"><div className="text-xs text-teal-700">Total Phlebos</div><div className="text-xl font-bold text-gray-900">{numberWithCommas(overview.totalPhlebos || 0)}</div></div>
            </div>
          </SectionCard>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SectionCard title={<span className="flex items-center gap-2"><FaChartLine /> Users and Revenue ({fromDate} to {toDate})</span>} right={<div className="text-xs text-gray-500">{usersRevenueTrend.length} points</div>}>
                <div className="w-full h-56 sm:h-64 md:h-72 lg:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={usersRevenueTrend}>
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
                <div className="mt-3 text-sm text-gray-600">Combined view of signups and revenue for the selected dates.</div>
              </SectionCard>
            </div>

            <SectionCard title={<span className="flex items-center gap-2"><FaRupeeSign /> Revenue Trend</span>} right={<div className="text-xs text-gray-500">Selected range</div>}>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title={<span className="flex items-center gap-2"><FaFlask /> Labs Onboarded Trend</span>} right={<div className="text-xs text-gray-500">{labsTrend.length} points</div>}>
              <div className="w-full h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={labsTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="labs" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title={<span className="flex items-center gap-2"><FaClipboardList /> Order Status Breakdown</span>} right={<div className="text-xs text-gray-500">Selected range</div>}>
              <div className="w-full h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orderStatusSummary}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title={<span className="flex items-center gap-2"><FaUsers /> Guests Trend</span>} right={<div className="text-xs text-gray-500">{guestTrend.length} points</div>}>
              <div className="w-full h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={guestTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="guests" stroke="#14B8A6" strokeWidth={2} dot={{ r: 2 }} name="Guests" />
                    <Line type="monotone" dataKey="verified" stroke="#0EA5E9" strokeWidth={2} dot={false} name="Verified" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title={<span className="flex items-center gap-2"><FaChartLine /> Conversion Snapshot</span>} right={<div className="text-xs text-gray-500">Guest to registered</div>}>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-white px-3 py-2">
                  <div className="text-xs text-gray-500">Verified Rate</div>
                  <div className="text-2xl font-bold text-gray-900">{overview.totalGuests ? `${Math.round(((overview.verifiedGuests || 0) * 100) / overview.totalGuests)}%` : "0%"}</div>
                </div>
                <div className="rounded-lg border bg-white px-3 py-2">
                  <div className="text-xs text-gray-500">Guest Share (vs users)</div>
                  <div className="text-2xl font-bold text-gray-900">{(overview.totalGuests || 0) + (overview.totalUsers || 0) ? `${Math.round(((overview.totalGuests || 0) * 100) / ((overview.totalGuests || 0) + (overview.totalUsers || 0)))}%` : "0%"}</div>
                </div>
                <div className="rounded-lg border bg-white px-3 py-2 col-span-2 text-sm text-gray-600">These KPIs are computed live from guest/user totals. Detailed guest-level conversion is shown in guest directory below.</div>
              </div>
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SectionCard title={<span className="flex items-center gap-2"><FaClipboardList /> Orders vs Completed</span>} right={<div className="text-xs text-gray-500">Trend</div>}>
              <div className="w-full h-56 sm:h-64 md:h-64 lg:h-60"><ResponsiveContainer width="100%" height="100%"><BarChart data={ordersTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Bar dataKey="orders" stackId="a" fill="#EF4444" name="Orders" /><Bar dataKey="completed" stackId="a" fill="#10B981" name="Completed" /></BarChart></ResponsiveContainer></div>
            </SectionCard>
            <SectionCard title={<span className="flex items-center gap-2"><FaFlask /> Tests by Lab</span>} right={<div className="text-xs text-gray-500">Top labs</div>}>
              <div className="w-full h-56 sm:h-64 md:h-64 lg:h-60"><ResponsiveContainer width="100%" height="100%"><BarChart data={bookingsByLab} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="lab" type="category" width={150} /><Tooltip /><Bar dataKey="bookings" fill="#3B82F6" barSize={12} /></BarChart></ResponsiveContainer></div>
            </SectionCard>
            <SectionCard title={<span className="flex items-center gap-2"><FaRegStar /> Top Tests</span>} right={<div className="text-xs text-gray-500">This period</div>}>
              <div className="w-full h-56 sm:h-64 md:h-64 lg:h-60"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={topTests} dataKey="bookings" nameKey="test" outerRadius={80} label>{topTests.map((_entry, idx) => (<Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />))}</Pie><Legend verticalAlign="bottom" height={36} /><Tooltip /></PieChart></ResponsiveContainer></div>
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title={<span className="flex items-center gap-2"><FaChartLine /> Revenue Efficiency</span>} right={<div className="text-xs text-gray-500">AOV + completion</div>}>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={efficiencyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="orders" fill="#FCA5A5" name="Orders" />
                    <Line yAxisId="right" dataKey="avgOrderValue" stroke="#7C3AED" strokeWidth={2} dot={false} name="Avg order value (Rs)" />
                    <Line yAxisId="right" dataKey="completionRate" stroke="#0EA5E9" strokeWidth={2} dot={false} name="Completion rate (%)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title={<span className="flex items-center gap-2"><FaRupeeSign /> Cumulative Revenue</span>} right={<div className="text-xs text-gray-500">Running total</div>}>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cumulativeRevenueTrend}>
                    <defs>
                      <linearGradient id="colorCumRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.08} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="cumulativeRevenue" stroke="#10B981" fill="url(#colorCumRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title={<span className="flex items-center gap-2"><FaClipboardList /> Order Status Mix</span>} right={<div className="text-xs text-gray-500">Distribution</div>}>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={orderStatusPie} dataKey="count" nameKey="status" innerRadius={55} outerRadius={90} label>
                      {orderStatusPie.map((_entry, idx) => (
                        <Cell key={`status-cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title={<span className="flex items-center gap-2"><FaUsers /> Payment Mix</span>} right={<div className="text-xs text-gray-500">Share by method</div>}>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="25%" outerRadius="95%" data={paymentMix} startAngle={180} endAngle={0}>
                    <RadialBar dataKey="pct" background cornerRadius={8}>
                      {paymentMix.map((_entry, idx) => (
                        <Cell key={`pay-cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </RadialBar>
                    <Legend
                      verticalAlign="bottom"
                      formatter={(value, _entry, idx) => `${value} (${percent(paymentMix[idx]?.pct || 0)})`}
                    />
                    <Tooltip formatter={(value: number) => `${value}%`} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          <SectionCard title={<span className="flex items-center gap-2"><FaUsers /> Users Directory</span>} right={<div className="text-xs text-gray-500">Total: {usersPagination.totalAll ?? usersPagination.total} | In range: {usersPagination.totalFiltered ?? usersPagination.total}</div>}>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-3">
              <input value={usersQuery} onChange={(e) => { setUsersPage(1); setUsersQuery(e.target.value); }} placeholder="Search users" className="w-full sm:max-w-md rounded-lg border px-3 py-2 text-sm" />
              <div className="text-xs text-gray-500">Page {usersPagination.page}/{usersPagination.totalPages}</div>
            </div>
            {usersError ? <div className="text-sm text-red-600 mb-3">{usersError}</div> : null}
            <div className="overflow-auto border rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-red-50 text-red-700">
                  <tr>
                    <th className="text-left px-3 py-2">Name</th>
                    <th className="text-left px-3 py-2">Email</th>
                    <th className="text-left px-3 py-2">Mobile</th>
                    <th className="text-left px-3 py-2">City</th>
                    <th className="text-left px-3 py-2">Created</th>
                    <th className="text-left px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    <tr><td className="px-3 py-3 text-gray-500" colSpan={6}>Loading users...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td className="px-3 py-3 text-gray-500" colSpan={6}>No users found.</td></tr>
                  ) : users.map((u) => (
                    <tr key={u._id} className="border-t">
                      <td className="px-3 py-2">{`${u.firstName || ""} ${u.lastName || ""}`.trim() || "-"}</td>
                      <td className="px-3 py-2">{u.email || "-"}</td>
                      <td className="px-3 py-2">{u.mobileNumber || "-"}</td>
                      <td className="px-3 py-2">{u.city || "-"}</td>
                      <td className="px-3 py-2">{u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}</td>
                      <td className="px-3 py-2"><button className="rounded-full border px-3 py-1 text-xs font-semibold hover:bg-red-50" onClick={() => openUserDetails(u)}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                className="rounded-full border px-3 py-1 text-xs font-semibold hover:bg-red-50 disabled:opacity-50"
                disabled={!usersPagination.hasPrevPage || usersLoading}
                onClick={() => setUsersPage(Math.max(1, usersPage - 1))}
              >
                Prev
              </button>
              <button
                className="rounded-full border px-3 py-1 text-xs font-semibold hover:bg-red-50 disabled:opacity-50"
                disabled={!usersPagination.hasNextPage || usersLoading}
                onClick={() => setUsersPage(usersPage + 1)}
              >
                Next
              </button>
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title={<span className="flex items-center gap-2"><FaFlask /> Labs Directory</span>} right={<div className="text-xs text-gray-500">Total: {labsPagination.totalAll ?? labsPagination.total} | In range: {labsPagination.totalFiltered ?? labsPagination.total}</div>}>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-3">
                <input value={labsQuery} onChange={(e) => { setLabsPage(1); setLabsQuery(e.target.value); }} placeholder="Search labs" className="w-full sm:max-w-md rounded-lg border px-3 py-2 text-sm" />
                <div className="text-xs text-gray-500">Page {labsPagination.page}/{labsPagination.totalPages}</div>
              </div>
              {labsError ? <div className="text-sm text-red-600 mb-3">{labsError}</div> : null}
              <div className="overflow-auto border rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-red-50 text-red-700">
                    <tr>
                      <th className="text-left px-3 py-2">Lab</th>
                      <th className="text-left px-3 py-2">Status</th>
                      <th className="text-left px-3 py-2">Admins</th>
                      <th className="text-left px-3 py-2">Tests</th>
                      <th className="text-left px-3 py-2">Packages</th>
                      <th className="text-left px-3 py-2">Orders</th>
                      <th className="text-left px-3 py-2">Range Revenue</th>
                      <th className="text-left px-3 py-2">Created</th>
                      <th className="text-left px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labsLoading ? (
                      <tr><td className="px-3 py-3 text-gray-500" colSpan={9}>Loading labs...</td></tr>
                    ) : labs.length === 0 ? (
                      <tr><td className="px-3 py-3 text-gray-500" colSpan={9}>No labs found.</td></tr>
                    ) : labs.map((lab) => (
                      <tr key={lab.id} className="border-t">
                        <td className="px-3 py-2"><div className="font-semibold text-gray-800">{lab.name}</div><div className="text-xs text-gray-500">{lab.address || "-"}</div></td>
                        <td className="px-3 py-2">{lab.isActive ? "ACTIVE" : "INACTIVE"}</td>
                        <td className="px-3 py-2">{lab.counts.admins}</td>
                        <td className="px-3 py-2">{lab.counts.tests}</td>
                        <td className="px-3 py-2">{lab.counts.packages}</td>
                        <td className="px-3 py-2">{lab.performance.ordersInRange}</td>
                        <td className="px-3 py-2">Rs{numberWithCommas(lab.performance.revenueInRange || 0)}</td>
                        <td className="px-3 py-2">{lab.createdAt ? new Date(lab.createdAt).toLocaleDateString() : "-"}</td>
                        <td className="px-3 py-2"><button className="rounded-full border px-3 py-1 text-xs font-semibold hover:bg-red-50" onClick={() => setSelectedLabDetails(lab)}>View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button className="rounded-full border px-3 py-1 text-xs font-semibold hover:bg-red-50 disabled:opacity-50" disabled={!labsPagination.hasPrevPage || labsLoading} onClick={() => setLabsPage(Math.max(1, labsPage - 1))}>Prev</button>
                <button className="rounded-full border px-3 py-1 text-xs font-semibold hover:bg-red-50 disabled:opacity-50" disabled={!labsPagination.hasNextPage || labsLoading} onClick={() => setLabsPage(labsPage + 1)}>Next</button>
              </div>
            </SectionCard>

            <SectionCard title={<span className="flex items-center gap-2"><FaUsers /> Guest Users Directory</span>} right={<div className="text-xs text-gray-500">Total: {guestsPagination.totalAll ?? guestsPagination.total} | In range: {guestsPagination.totalFiltered ?? guestsPagination.total}</div>}>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-3">
                <input value={guestsQuery} onChange={(e) => { setGuestsPage(1); setGuestsQuery(e.target.value); }} placeholder="Search guests" className="w-full sm:max-w-md rounded-lg border px-3 py-2 text-sm" />
                <div className="text-xs text-gray-500">Page {guestsPagination.page}/{guestsPagination.totalPages}</div>
              </div>
              {guestsError ? <div className="text-sm text-red-600 mb-3">{guestsError}</div> : null}
              <div className="overflow-auto border rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-red-50 text-red-700">
                    <tr>
                      <th className="text-left px-3 py-2">Guest</th>
                      <th className="text-left px-3 py-2">Mobile</th>
                      <th className="text-left px-3 py-2">Verified</th>
                      <th className="text-left px-3 py-2">Registered User</th>
                      <th className="text-left px-3 py-2">Orders (Range)</th>
                      <th className="text-left px-3 py-2">Spend (Range)</th>
                      <th className="text-left px-3 py-2">Created</th>
                      <th className="text-left px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guestsLoading ? (
                      <tr><td className="px-3 py-3 text-gray-500" colSpan={8}>Loading guests...</td></tr>
                    ) : guests.length === 0 ? (
                      <tr><td className="px-3 py-3 text-gray-500" colSpan={8}>No guests found.</td></tr>
                    ) : guests.map((g) => (
                      <tr key={g.id} className="border-t">
                        <td className="px-3 py-2">{g.fullName || "-"}</td>
                        <td className="px-3 py-2">{g.mobile || "-"}</td>
                        <td className="px-3 py-2">{g.verified ? "YES" : "NO"}</td>
                        <td className="px-3 py-2">{g.hasRegisteredAccount ? "YES" : "NO"}</td>
                        <td className="px-3 py-2">{g.performance?.ordersInRange || 0}</td>
                        <td className="px-3 py-2">Rs{numberWithCommas(g.performance?.spendInRange || 0)}</td>
                        <td className="px-3 py-2">{g.createdAt ? new Date(g.createdAt).toLocaleDateString() : "-"}</td>
                        <td className="px-3 py-2"><button className="rounded-full border px-3 py-1 text-xs font-semibold hover:bg-red-50" onClick={() => setSelectedGuestDetails(g)}>View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button className="rounded-full border px-3 py-1 text-xs font-semibold hover:bg-red-50 disabled:opacity-50" disabled={!guestsPagination.hasPrevPage || guestsLoading} onClick={() => setGuestsPage(Math.max(1, guestsPage - 1))}>Prev</button>
                <button className="rounded-full border px-3 py-1 text-xs font-semibold hover:bg-red-50 disabled:opacity-50" disabled={!guestsPagination.hasNextPage || guestsLoading} onClick={() => setGuestsPage(guestsPage + 1)}>Next</button>
              </div>
            </SectionCard>
          </div>

          {loading ? <div className="text-sm text-gray-500">Refreshing dashboard data...</div> : null}
        </div>
      </div>

      {selectedUser ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center" onClick={closeUserDetails}>
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl border border-red-100" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b bg-red-50 flex items-center justify-between"><h3 className="text-base font-bold text-red-700">User Details</h3><button className="text-red-700 text-sm font-semibold" onClick={closeUserDetails}>Close</button></div>
            <div className="p-4 text-sm text-gray-700">{userDetailsLoading ? <div>Loading details...</div> : <pre className="bg-gray-50 border rounded p-3 overflow-auto max-h-[60vh] text-xs">{JSON.stringify(selectedUserDetails || selectedUser, null, 2)}</pre>}</div>
          </div>
        </div>
      ) : null}

      {selectedLabDetails ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center" onClick={() => setSelectedLabDetails(null)}>
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl border border-red-100" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b bg-red-50 flex items-center justify-between"><h3 className="text-base font-bold text-red-700">Lab Details</h3><button className="text-red-700 text-sm font-semibold" onClick={() => setSelectedLabDetails(null)}>Close</button></div>
            <div className="p-4 text-sm text-gray-700"><pre className="bg-gray-50 border rounded p-3 overflow-auto max-h-[60vh] text-xs">{JSON.stringify(selectedLabDetails, null, 2)}</pre></div>
          </div>
        </div>
      ) : null}

      {selectedGuestDetails ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center" onClick={() => setSelectedGuestDetails(null)}>
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl border border-red-100" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b bg-red-50 flex items-center justify-between"><h3 className="text-base font-bold text-red-700">Guest Details</h3><button className="text-red-700 text-sm font-semibold" onClick={() => setSelectedGuestDetails(null)}>Close</button></div>
            <div className="p-4 text-sm text-gray-700"><pre className="bg-gray-50 border rounded p-3 overflow-auto max-h-[60vh] text-xs">{JSON.stringify(selectedGuestDetails, null, 2)}</pre></div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminDashboard;


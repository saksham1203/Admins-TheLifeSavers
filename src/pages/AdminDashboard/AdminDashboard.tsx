
import React, { useMemo, useRef, useState } from "react";
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
  FaFileAlt,
  FaFileInvoiceDollar,
  FaGlobe,
  FaHandshake,
  FaHospital,
  FaMoneyBillWave,
  FaSyringe,
  FaTags,
  FaUser,
  FaUsersCog,
  FaUserShield,
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
import { getCities, getDistricts, getStates } from "../../Components/indiaData";

const numberWithCommas = (n: number) => n.toLocaleString("en-IN");
const percent = (n: number) => `${Math.round(n)}%`;
const COLORS = ["#EF4444", "#FB923C", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"];
const shortLabel = (value: string, max = 28) => (value.length > max ? `${value.slice(0, max - 1)}...` : value);


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
    revenueProfitSplitTrend,
    applyDateRange,
    refresh,
    users,
    usersLoading,
    usersError,
    usersQuery,
    setUsersQuery,
    setUsersBloodGroup,
    setUsersState,
    setUsersDistrict,
    setUsersCity,
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
  const usersNameInputRef = useRef<HTMLInputElement | null>(null);
  const [usersBloodGroupDraft, setUsersBloodGroupDraft] = useState("");
  const [usersStateDraft, setUsersStateDraft] = useState("");
  const [usersDistrictDraft, setUsersDistrictDraft] = useState("");
  const [usersCityDraft, setUsersCityDraft] = useState("");

  const bloodGroups = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const statesOptions = useMemo(() => getStates(), []);
  const districtsOptions = useMemo(() => (usersStateDraft ? getDistricts(usersStateDraft) : []), [usersStateDraft]);
  const citiesOptions = useMemo(
    () => (usersStateDraft && usersDistrictDraft ? getCities(usersStateDraft, usersDistrictDraft) : []),
    [usersStateDraft, usersDistrictDraft]
  );


    const kpis = useMemo(
    () => [
      {
        id: "users",
        title: "Total Users",
        value: numberWithCommas(usersPagination.totalFiltered ?? usersPagination.total ?? 0),
        hint: `Users in selected range (${fromDate} to ${toDate})`,
        spark: usersTrend.map((p) => ({ date: p.date, v: p.users ?? 0 })),
        icon: <FaUsers className="text-red-600" />,
      },
      {
        id: "orders",
        title: "Total Orders",
        value: numberWithCommas(overview.selectedRangeOrders || 0),
        hint: `Orders in selected range (${fromDate} to ${toDate})`,
        spark: ordersTrend.map((p) => ({ date: p.date, v: p.orders ?? 0 })),
        icon: <FaClipboardList className="text-red-600" />,
      },
      {
        id: "revenue",
        title: "Online Gross Revenue",
        value: `Rs${numberWithCommas(overview.selectedRangeOnlineRevenue || 0)}`,
        hint: `Gross sales (before deductions) - ${fromDate} to ${toDate}`,
        spark: revenueTrend.map((p) => ({ date: p.date, v: p.revenue ?? 0 })),
        icon: <FaRupeeSign className="text-red-600" />,
      },
      {
        id: "offline_revenue",
        title: "Offline Gross Revenue",
        value: `Rs${numberWithCommas(overview.selectedRangeOfflineRevenue || 0)}`,
        hint: `Gross sales (before deductions) - ${fromDate} to ${toDate}`,
        spark: revenueProfitSplitTrend.map((p) => ({ date: p.date, v: p.offlineRevenue ?? 0 })),
        icon: <FaRupeeSign className="text-red-600" />,
      },
      {
        id: "total_revenue",
        title: "Total Gross Revenue",
        value: `Rs${numberWithCommas(overview.selectedRangeCombinedRevenue || 0)}`,
        hint: `Online + Offline gross sales - ${fromDate} to ${toDate}`,
        spark: revenueProfitSplitTrend.map((p) => ({ date: p.date, v: p.combinedRevenue ?? 0 })),
        icon: <FaRupeeSign className="text-red-600" />,
      },
      {
        id: "online_profit",
        title: "Online Profit / Loss",
        value: `Rs${numberWithCommas(Math.abs(overview.selectedRangeOnlineProfit || 0))}`,
        hint:
          (overview.selectedRangeOnlineProfit || 0) >= 0
            ? "Online net after deductions"
            : "Online net loss after deductions",
        spark: revenueProfitSplitTrend.map((p) => ({ date: p.date, v: p.onlineProfit ?? 0 })),
        icon: <FaRupeeSign className="text-red-600" />,
      },
      {
        id: "offline_profit",
        title: "Offline Profit / Loss",
        value: `Rs${numberWithCommas(Math.abs(overview.selectedRangeOfflineProfit || 0))}`,
        hint:
          (overview.selectedRangeOfflineProfit || 0) >= 0
            ? "Offline net after deductions"
            : "Offline net loss after deductions",
        spark: revenueProfitSplitTrend.map((p) => ({ date: p.date, v: p.offlineProfit ?? 0 })),
        icon: <FaRupeeSign className="text-red-600" />,
      },
      {
        id: "total_profit",
        title: "Total Profit / Loss",
        value: `Rs${numberWithCommas(Math.abs(overview.selectedRangeCombinedProfit || 0))}`,
        hint:
          (overview.selectedRangeCombinedProfit || 0) >= 0
            ? "Net after cost + commissions + adjustments"
            : "Net loss after cost + commissions + adjustments",
        spark: revenueProfitSplitTrend.map((p) => ({ date: p.date, v: p.combinedProfit ?? 0 })),
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
    [
      overview,
      usersPagination.total,
      usersPagination.totalFiltered,
      usersTrend,
      revenueTrend,
      ordersTrend,
      fromDate,
      toDate,
      revenueProfitSplitTrend,
    ]
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

  const forecastTrend = useMemo(() => {
    const data: Array<{ date: string; revenue: number | null; projectedRevenue: number | null }> = (revenueTrend || []).slice(-14).map((r) => ({
      date: r.date,
      revenue: Number(r.revenue || 0),
      projectedRevenue: null,
    }));
    if (data.length < 2) return data;
    let deltaSum = 0;
    for (let i = 1; i < data.length; i += 1) {
      deltaSum += Number(data[i].revenue || 0) - Number(data[i - 1].revenue || 0);
    }
    const avgDelta = deltaSum / (data.length - 1);
    let last = Number(data[data.length - 1]?.revenue || 0);
    const out = [...data];
    for (let i = 1; i <= 7; i += 1) {
      last = Math.max(0, Math.round(last + avgDelta));
      out.push({
        date: `F+${i}`,
        revenue: null,
        projectedRevenue: last,
      });
    }
    return out;
  }, [revenueTrend]);

  const funnelRows = useMemo(() => {
    const registered = Number(overview.newUsers7d || 0);
    const ordered = Number(overview.selectedRangeOrders || 0);
    const completed = ordersTrend.reduce((sum, row) => sum + Number(row.completed || 0), 0);
    const reportReadyEstimate = Math.max(0, Math.round(completed * 0.9));
    return [
      { stage: "Registered", count: registered },
      { stage: "Ordered", count: ordered },
      { stage: "Completed", count: completed },
      { stage: "Report Ready", count: reportReadyEstimate },
    ];
  }, [overview, ordersTrend]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-3 sm:p-6" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl w-full max-w-7xl overflow-hidden relative ring-1 ring-red-100">
        <div className="bg-gradient-to-r from-red-600 via-red-600 to-red-600 text-white py-5 px-4 sm:px-6 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 bg-red-600 rounded-full shadow-md hover:bg-red-700 transition" aria-label="Back">
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold">Admin Dashboard</h1>
                <div className="text-sm text-white/90 mt-1">The Life Savers </div>
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

            <div className="flex items-center gap-2"><button onClick={refresh} className="rounded-full bg-white border px-3 py-2 text-sm font-semibold hover:bg-red-50 flex items-center gap-2">
                <FaSyncAlt /> <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
              Failed to load dashboard: {error}
            </div>
          ) : null}

          <SectionCard
            title={
              <span className="flex items-center gap-2">
                <FaBolt /> Quick Actions
              </span>
            }
            right={<div className="text-xs text-gray-500">Admin shortcuts</div>}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">

              {/* Card */}
              <div onClick={() => navigate("/lab-onboarding")}
                className="cursor-pointer group rounded-xl border bg-white p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-red-400 transition">
                <FaHospital className="text-xl text-red-600 mb-2 group-hover:scale-110 transition" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-red-600">Labs</span>
              </div>

              <div onClick={() => navigate("/users-onboarding")}
                className="cursor-pointer group rounded-xl border bg-white p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-red-400 transition">
                <FaUser className="text-xl text-red-600 mb-2 group-hover:scale-110 transition" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-red-600">Users</span>
              </div>

              <div onClick={() => navigate("/lab-admins-onboarding")}
                className="cursor-pointer group rounded-xl border bg-white p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-red-400 transition">
                <FaUserShield className="text-xl text-red-600 mb-2 group-hover:scale-110 transition" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-red-600">Lab Admins</span>
              </div>

              <div onClick={() => navigate("/promocodes-onboarding")}
                className="cursor-pointer group rounded-xl border bg-white p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-red-400 transition">
                <FaTags className="text-xl text-red-600 mb-2 group-hover:scale-110 transition" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-red-600">Promocodes</span>
              </div>

              <div onClick={() => navigate("/phlebos-onboarding")}
                className="cursor-pointer group rounded-xl border bg-white p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-red-400 transition">
                <FaSyringe className="text-xl text-red-600 mb-2 group-hover:scale-110 transition" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-red-600">Phlebotomists</span>
              </div>

              <div onClick={() => navigate("/partner-requests")}
                className="cursor-pointer group rounded-xl border bg-white p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-red-400 transition">
                <FaHandshake className="text-xl text-red-600 mb-2 group-hover:scale-110 transition" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-red-600">Partners</span>
              </div>

              <div onClick={() => navigate("/partnerspricinglists")}
                className="cursor-pointer group rounded-xl border bg-white p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-red-400 transition">
                <FaMoneyBillWave className="text-xl text-red-600 mb-2 group-hover:scale-110 transition" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-red-600">Pricing</span>
              </div>

              <div onClick={() => navigate("/offline-sales")}
                className="cursor-pointer group rounded-xl border bg-white p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-red-400 transition">
                <FaChartLine className="text-xl text-red-600 mb-2 group-hover:scale-110 transition" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-red-600">Offline Sales</span>
              </div>

              <div onClick={() => navigate("/online-sales-history")}
                className="cursor-pointer group rounded-xl border bg-white p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-red-400 transition">
                <FaGlobe className="text-xl text-red-600 mb-2 group-hover:scale-110 transition" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-red-600">Online Sales</span>
              </div>

              <div onClick={() => navigate("/office-expenses")}
                className="cursor-pointer group rounded-xl border bg-white p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-red-400 transition">
                <FaFileInvoiceDollar className="text-xl text-red-600 mb-2 group-hover:scale-110 transition" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-red-600">Expenses</span>
              </div>

              <div onClick={() => navigate("/employee-management")}
                className="cursor-pointer group rounded-xl border bg-white p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-red-400 transition">
                <FaUsersCog className="text-xl text-red-600 mb-2 group-hover:scale-110 transition" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-red-600">Employees</span>
              </div>

              <div onClick={() => navigate("/report-generator")}
                className="cursor-pointer group rounded-xl border bg-white p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-red-400 transition">
                <FaFileAlt className="text-xl text-red-600 mb-2 group-hover:scale-110 transition" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-red-600">Reports</span>
              </div>

            </div>
          </SectionCard>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {kpis.map((k) => (
              <SectionCard key={k.id} className="min-h-[220px]" title={<span className="flex items-center gap-2">{k.icon} {k.title}</span>}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{k.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{k.hint}</div>
                  </div>
                  <div className="w-32 h-14 sm:w-40 sm:h-16">
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
              <div className="rounded-lg border border-green-100 bg-green-50 px-3 py-2"><div className="text-xs text-green-700">Online Revenue</div><div className="text-xl font-bold text-gray-900">Rs{numberWithCommas(overview.selectedRangeOnlineRevenue || 0)}</div></div>
              <div className="rounded-lg border border-lime-100 bg-lime-50 px-3 py-2"><div className="text-xs text-lime-700">Online Profit</div><div className="text-xl font-bold text-gray-900">Rs{numberWithCommas(overview.selectedRangeOnlineProfit || 0)}</div></div>
              <div className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2"><div className="text-xs text-rose-700">Partner Commissions (Month)</div><div className="text-xl font-bold text-gray-900">Rs{numberWithCommas(overview.selectedRangePartnerCommission || 0)}</div></div>
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2"><div className="text-xs text-blue-700">Offline Revenue</div><div className="text-xl font-bold text-gray-900">Rs{numberWithCommas(overview.selectedRangeOfflineRevenue || 0)}</div></div>
              <div className="rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2"><div className="text-xs text-cyan-700">Offline Profit</div><div className="text-xl font-bold text-gray-900">Rs{numberWithCommas(overview.selectedRangeOfflineProfit || 0)}</div></div>
              <div className="rounded-lg border border-purple-100 bg-purple-50 px-3 py-2"><div className="text-xs text-purple-700">Combined Revenue</div><div className="text-xl font-bold text-gray-900">Rs{numberWithCommas(overview.selectedRangeCombinedRevenue || 0)}</div></div>
              <div className="rounded-lg border border-fuchsia-100 bg-fuchsia-50 px-3 py-2"><div className="text-xs text-fuchsia-700">Combined Profit</div><div className="text-xl font-bold text-gray-900">Rs{numberWithCommas(overview.selectedRangeCombinedProfit || 0)}</div></div>
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2"><div className="text-xs text-blue-700">Total Labs</div><div className="text-xl font-bold text-gray-900">{numberWithCommas(overview.totalLabs || 0)}</div></div>
              <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2"><div className="text-xs text-indigo-700">Active Partners</div><div className="text-xl font-bold text-gray-900">{numberWithCommas(overview.activePartners || 0)}</div></div>
              <div className="rounded-lg border border-fuchsia-100 bg-fuchsia-50 px-3 py-2"><div className="text-xs text-fuchsia-700">Active Promocodes</div><div className="text-xl font-bold text-gray-900">{numberWithCommas(overview.activePromos || 0)}</div></div>
              <div className="rounded-lg border border-teal-100 bg-teal-50 px-3 py-2"><div className="text-xs text-teal-700">Total Phlebos</div><div className="text-xl font-bold text-gray-900">{numberWithCommas(overview.totalPhlebos || 0)}</div></div>
            </div>
          </SectionCard>

          <SectionCard title={<span className="flex items-center gap-2"><FaChartLine /> Revenue & Profit Split (Online vs Offline)</span>} right={<div className="text-xs text-gray-500">Selected range</div>}>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={revenueProfitSplitTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="onlineRevenue" fill="#16a34a" name="Online Revenue" />
                  <Bar dataKey="offlineRevenue" fill="#2563eb" name="Offline Revenue" />
                  <Line type="monotone" dataKey="onlineProfit" stroke="#65a30d" strokeWidth={2} name="Online Profit" />
                  <Line type="monotone" dataKey="offlineProfit" stroke="#0891b2" strokeWidth={2} name="Offline Profit" />
                  <Line type="monotone" dataKey="combinedProfit" stroke="#7c3aed" strokeWidth={2} name="Combined Profit" />
                </ComposedChart>
              </ResponsiveContainer>
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
            <SectionCard title={<span className="flex items-center gap-2"><FaChartLine /> Revenue Forecast (7D)</span>} right={<div className="text-xs text-gray-500">Simple projection</div>}>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#FB923C" strokeWidth={2} dot={false} name="Actual Revenue" />
                    <Line type="monotone" dataKey="projectedRevenue" stroke="#7C3AED" strokeWidth={2} strokeDasharray="6 6" dot={false} name="Projected Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title={<span className="flex items-center gap-2"><FaUsers /> Conversion Funnel</span>} right={<div className="text-xs text-gray-500">Registration to report-ready</div>}>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelRows}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#EF4444" />
                  </BarChart>
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
              <div className="w-full h-72 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={topTests} dataKey="bookings" nameKey="test" outerRadius="62%" labelLine={false}>
                      {topTests.map((_entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                {topTests.map((entry, idx) => (
                  <div key={`${entry.test}-${idx}`} className="flex items-center gap-2 text-gray-600 min-w-0">
                    <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="truncate" title={entry.test}>{shortLabel(entry.test, 34)}</span>
                    <span className="ml-auto font-semibold text-gray-700 shrink-0">{entry.bookings}</span>
                  </div>
                ))}
              </div>
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
            <div className="flex flex-col gap-3 mb-3">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <input
                  ref={usersNameInputRef}
                  defaultValue={usersQuery}
                  placeholder="Search by name"
                  className="w-full sm:max-w-md rounded-lg border px-3 py-2 text-sm"
                />
                <div className="flex items-center gap-2"><div className="text-xs text-gray-500">Page {usersPagination.page}/{usersPagination.totalPages}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                <select value={usersBloodGroupDraft} onChange={(e) => setUsersBloodGroupDraft(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
                  {bloodGroups.map((bg) => (
                    <option key={bg || "all"} value={bg}>
                      {bg || "All Blood Groups"}
                    </option>
                  ))}
                </select>
                <select
                  value={usersStateDraft}
                  onChange={(e) => {
                    setUsersStateDraft(e.target.value);
                    setUsersDistrictDraft("");
                    setUsersCityDraft("");
                  }}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">All States</option>
                  {statesOptions.map((st) => (
                    <option key={st} value={st}>
                      {st.split("_").join(" ")}
                    </option>
                  ))}
                </select>
                <select
                  value={usersDistrictDraft}
                  onChange={(e) => {
                    setUsersDistrictDraft(e.target.value);
                    setUsersCityDraft("");
                  }}
                  className="rounded-lg border px-3 py-2 text-sm"
                  disabled={!usersStateDraft}
                >
                  <option value="">All Districts</option>
                  {districtsOptions.map((d) => (
                    <option key={d} value={d}>
                      {d.split("_").join(" ")}
                    </option>
                  ))}
                </select>
                <select
                  value={usersCityDraft}
                  onChange={(e) => setUsersCityDraft(e.target.value)}
                  className="rounded-lg border px-3 py-2 text-sm"
                  disabled={!usersStateDraft || !usersDistrictDraft}
                >
                  <option value="">All Cities</option>
                  {citiesOptions.map((c) => (
                    <option key={c} value={c}>
                      {c.split("_").join(" ")}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg bg-red-600 text-white px-3 py-2 text-sm font-semibold hover:bg-red-700"
                      onClick={() => {
                        setUsersPage(1);
                        setUsersQuery((usersNameInputRef.current?.value || "").trim());
                        setUsersBloodGroup(usersBloodGroupDraft);
                        setUsersState(usersStateDraft);
                        setUsersDistrict(usersDistrictDraft);
                      setUsersCity(usersCityDraft);
                    }}
                  >
                    Apply Filters
                  </button>
                  <button
                    className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-red-50"
                    onClick={() => {
                      if (usersNameInputRef.current) usersNameInputRef.current.value = "";
                      setUsersBloodGroupDraft("");
                      setUsersStateDraft("");
                      setUsersDistrictDraft("");
                      setUsersCityDraft("");
                      setUsersPage(1);
                      setUsersQuery("");
                      setUsersBloodGroup("");
                      setUsersState("");
                      setUsersDistrict("");
                      setUsersCity("");
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
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









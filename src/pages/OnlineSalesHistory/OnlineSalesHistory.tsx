import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSyncAlt } from "react-icons/fa";
import {
  downloadOnlineSalesOrdersReport,
  fetchOnlineSalesOrders,
  type SalesOrderHistoryRow,
} from "../../services/offlineSales.service";

const monthStartYmd = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
};

const monthEndYmd = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
};

const money = (n: number) => `Rs${Number(n || 0).toLocaleString("en-IN")}`;

const OnlineSalesHistory: React.FC = () => {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState<string>(monthStartYmd());
  const [toDate, setToDate] = useState<string>(monthEndYmd());
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [orders, setOrders] = useState<SalesOrderHistoryRow[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const load = async (nextPage = page) => {
    setLoading(true);
    try {
      const resp = await fetchOnlineSalesOrders({
        from: fromDate,
        to: toDate,
        search: search || undefined,
        page: nextPage,
        limit,
      });
      setOrders(resp.orders || []);
      setPagination(resp.pagination || pagination);
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                <h1 className="text-2xl sm:text-3xl font-extrabold">Online Order History</h1>
                <div className="text-sm text-white/90 mt-1">Separate from offline management • export-ready</div>
              </div>
            </div>
            <button onClick={() => load(page)} className="rounded-full bg-white/20 px-3 py-2 text-sm font-semibold hover:bg-white/30 flex items-center gap-2">
              <FaSyncAlt /> Refresh
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-gray-600">Date range</div>
            <input type="date" className="rounded-lg border px-3 py-2 text-sm" value={fromDate} max={toDate} onChange={(e) => setFromDate(e.target.value)} />
            <span className="text-gray-400">-</span>
            <input type="date" className="rounded-lg border px-3 py-2 text-sm" value={toDate} min={fromDate} onChange={(e) => setToDate(e.target.value)} />
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Search order/patient" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button onClick={() => load(1)} className="rounded-full bg-red-600 text-white px-3 py-2 text-sm font-semibold hover:bg-red-700">Apply</button>
            <button
              onClick={() => {
                setFromDate("2000-01-01");
                setToDate(new Date().toISOString().slice(0, 10));
                setTimeout(() => load(1), 0);
              }}
              className="rounded-full bg-white border px-3 py-2 text-sm font-semibold hover:bg-red-50"
            >
              All Time
            </button>
            <button
              onClick={async () => {
                await downloadOnlineSalesOrdersReport({ from: fromDate, to: toDate, search: search || undefined });
              }}
              className="rounded-full bg-white border px-3 py-2 text-sm font-semibold hover:bg-red-50"
            >
              Download Excel
            </button>
            {loading ? <span className="text-xs text-gray-500">Loading...</span> : null}
          </div>

          <div className="rounded-2xl border border-red-100 bg-white overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-2">Order</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Patient</th>
                  <th className="p-2">Lab</th>
                  <th className="p-2">Revenue</th>
                  <th className="p-2">Partner Commission</th>
                  <th className="p-2">Net Profit</th>
                  <th className="p-2">Order Status</th>
                  <th className="p-2">Payment</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="p-2 font-semibold">{o.orderId}</td>
                    <td className="p-2">{new Date(o.createdAt).toLocaleString()}</td>
                    <td className="p-2">{o.patientName}</td>
                    <td className="p-2">{o.lab?.name || "-"}</td>
                    <td className="p-2">{money(o.finance?.revenue || o.total || 0)}</td>
                    <td className="p-2">{money(o.finance?.partnerCommission || 0)}</td>
                    <td className="p-2">{money(o.finance?.netProfit || 0)}</td>
                    <td className="p-2">{o.status || "-"}</td>
                    <td className="p-2">{o.paymentStatus || "-"}</td>
                  </tr>
                ))}
                {!orders.length ? (
                  <tr><td className="p-3 text-gray-500" colSpan={9}>No online orders found for this range.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="px-1 py-2 flex items-center justify-between text-sm">
            <div className="text-gray-600">
              Showing page {pagination.page} of {pagination.totalPages} • Total {pagination.total}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded border px-3 py-1 disabled:opacity-50"
                disabled={!pagination.hasPrevPage}
                onClick={() => load(Math.max(1, page - 1))}
              >
                Prev
              </button>
              <button
                className="rounded border px-3 py-1 disabled:opacity-50"
                disabled={!pagination.hasNextPage}
                onClick={() => load(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineSalesHistory;

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaChartLine, FaPlus, FaRupeeSign, FaSyncAlt, FaTrash } from "react-icons/fa";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  LineChart,
  Legend,
  Bar,
  ComposedChart,
} from "recharts";
import {
  createOfflineSalesOrder,
  downloadOfflineSalesOrdersReport,
  fetchOfflineSalesCatalog,
  fetchOfflineSalesLabs,
  fetchOfflineSalesOrders,
  fetchOfflineSalesSummary,
  fetchOfflineSalesTrend,
  type OfflineCatalogRow,
  type OfflineSalesLab,
  type SalesOrderHistoryRow,
} from "../../services/offlineSales.service";

type FormItem = {
  uid: string;
  itemType: "TEST" | "PACKAGE";
  priceRowId: string;
  quantity: number;
  sellingPrice: number;
  costPrice: number;
};

const todayYmd = () => new Date().toISOString().slice(0, 10);
const monthStartYmd = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
};
const monthEndYmd = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
};
const money = (n: number) => `Rs${Number(n || 0).toLocaleString("en-IN")}`;
const uid = () => Math.random().toString(36).slice(2, 10);

const OfflineSales: React.FC = () => {
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState<string>(monthStartYmd());
  const [toDate, setToDate] = useState<string>(monthEndYmd());
  const [ordersPage, setOrdersPage] = useState<number>(1);
  const [ordersLimit] = useState<number>(20);
  const [ordersSearch, setOrdersSearch] = useState<string>("");
  const [ordersPagination, setOrdersPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(false);

  const [labs, setLabs] = useState<OfflineSalesLab[]>([]);
  const [catalogRows, setCatalogRows] = useState<OfflineCatalogRow[]>([]);
  const [catalogLabs, setCatalogLabs] = useState<string[]>([]);

  const [summary, setSummary] = useState<{
    totalOrders: number;
    revenue: number;
    cost: number;
    grossProfit: number;
    netProfit: number;
    profitMarginPercent: number;
  } | null>(null);
  const [trend, setTrend] = useState<Array<Record<string, unknown>>>([]);
  const [orders, setOrders] = useState<SalesOrderHistoryRow[]>([]);

  const [selectedLabId, setSelectedLabId] = useState<string>("");
  const [selectedPricingLab, setSelectedPricingLab] = useState<string>("");
  const [orderDate, setOrderDate] = useState<string>(todayYmd());
  const [paymentMode, setPaymentMode] = useState<"CASH" | "ONLINE">("CASH");
  const collectionTimeRef = useRef<HTMLInputElement | null>(null);
  const patientNameRef = useRef<HTMLInputElement | null>(null);
  const patientPhoneRef = useRef<HTMLInputElement | null>(null);
  const patientEmailRef = useRef<HTMLInputElement | null>(null);
  const ageRef = useRef<HTMLInputElement | null>(null);
  const addressRef = useRef<HTMLInputElement | null>(null);
  const cityRef = useRef<HTMLInputElement | null>(null);
  const pincodeRef = useRef<HTMLInputElement | null>(null);
  const notesRef = useRef<HTMLTextAreaElement | null>(null);

  const [items, setItems] = useState<FormItem[]>([{ uid: uid(), itemType: "TEST", priceRowId: "", quantity: 1, sellingPrice: 0, costPrice: 0 }]);
  const [submitLoading, setSubmitLoading] = useState(false);

  const loadAll = async (page = ordersPage) => {
    setLoading(true);
    try {
      const [labsResp, catalogResp, summaryResp, trendResp, ordersResp] = await Promise.all([
        fetchOfflineSalesLabs(),
        fetchOfflineSalesCatalog({ limit: 400 }),
        fetchOfflineSalesSummary({ from: fromDate, to: toDate }),
        fetchOfflineSalesTrend({ from: fromDate, to: toDate }),
        fetchOfflineSalesOrders({
          from: fromDate,
          to: toDate,
          page,
          limit: ordersLimit,
          search: ordersSearch || undefined,
        }),
      ]);

      setLabs(labsResp.labs || []);
      setCatalogRows(catalogResp.rows || []);
      setCatalogLabs(catalogResp.filters?.labs || []);
      setSummary(summaryResp.summary || null);
      setTrend(trendResp.trend || []);
      setOrders(ordersResp.orders || []);
      setOrdersPagination(ordersResp.pagination || {
        page: 1,
        limit: ordersLimit,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
      setOrdersPage(page);

      if (!selectedLabId && (labsResp.labs || []).length) setSelectedLabId(labsResp.labs[0].id);
      if (!selectedPricingLab && (catalogResp.filters?.labs || []).length) setSelectedPricingLab(catalogResp.filters.labs[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRows = useMemo(() => {
    return catalogRows.filter((row) => {
      if (selectedPricingLab && row.lab.toLowerCase() !== selectedPricingLab.toLowerCase()) return false;
      return true;
    });
  }, [catalogRows, selectedPricingLab]);

  const itemOptionsByType = useMemo(() => {
    return {
      TEST: filteredRows.filter((r) => r.itemType === "TEST"),
      PACKAGE: filteredRows.filter((r) => r.itemType === "PACKAGE"),
    };
  }, [filteredRows]);

  const itemOptionNodesByType = useMemo(
    () => ({
      TEST: itemOptionsByType.TEST.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name} ({money(r.rates.defaultSell)} / cost {money(r.rates.defaultCost)})
        </option>
      )),
      PACKAGE: itemOptionsByType.PACKAGE.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name} ({money(r.rates.defaultSell)} / cost {money(r.rates.defaultCost)})
        </option>
      )),
    }),
    [itemOptionsByType]
  );

  const computed = useMemo(() => {
    let revenue = 0;
    let cost = 0;
    items.forEach((it) => {
      const qty = Math.max(1, Number(it.quantity || 1));
      revenue += Number(it.sellingPrice || 0) * qty;
      cost += Number(it.costPrice || 0) * qty;
    });
    const grossProfit = revenue - cost;
    return {
      revenue,
      cost,
      grossProfit,
      estimatedNet: grossProfit,
    };
  }, [items]);

  const updateItem = (rowUid: string, patch: Partial<FormItem>) => {
    setItems((prev) => prev.map((x) => (x.uid === rowUid ? { ...x, ...patch } : x)));
  };

  const onPickCatalogRow = (rowUid: string, rowId: string) => {
    const row = catalogRows.find((r) => r.id === rowId);
    if (!row) return;
    updateItem(rowUid, {
      priceRowId: row.id,
      sellingPrice: row.rates.defaultSell,
      costPrice: row.rates.defaultCost,
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { uid: uid(), itemType: "TEST", priceRowId: "", quantity: 1, sellingPrice: 0, costPrice: 0 }]);
  };

  const removeItem = (rowUid: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((x) => x.uid !== rowUid) : prev));
  };

  const submitOrder = async () => {
    const patientName = (patientNameRef.current?.value || "").trim();
    const patientPhone = (patientPhoneRef.current?.value || "").trim();
    const patientEmail = (patientEmailRef.current?.value || "").trim();
    const ageRaw = (ageRef.current?.value || "").trim();
    const address = (addressRef.current?.value || "").trim();
    const city = (cityRef.current?.value || "").trim();
    const pincode = (pincodeRef.current?.value || "").trim();
    const notes = (notesRef.current?.value || "").trim();
    const collectionTime = (collectionTimeRef.current?.value || "").trim();

    if (!selectedLabId || !patientName || !address) {
      alert("Please fill mandatory fields: Lab, Patient Name, Address");
      return;
    }
    if (!items.length || items.some((x) => !x.priceRowId)) {
      alert("Please select at least one valid test/package row");
      return;
    }

    setSubmitLoading(true);
    try {
      await createOfflineSalesOrder({
        labId: selectedLabId,
        lab: selectedPricingLab || undefined,
        orderDate: orderDate || undefined,
        collectionTime: collectionTime || undefined,
        patientName,
        patientPhone: patientPhone || undefined,
        patientEmail: patientEmail || undefined,
        age: ageRaw ? Number(ageRaw) : undefined,
        address,
        city: city || undefined,
        pincode: pincode || undefined,
        notes: notes || undefined,
        paymentMode,
        items: items.map((it) => ({
          itemType: it.itemType,
          priceRowId: it.priceRowId,
          quantity: Math.max(1, Number(it.quantity || 1)),
          sellingPrice: Number(it.sellingPrice || 0),
          costPrice: Number(it.costPrice || 0),
        })),
      });

      alert("Offline order created successfully");
      if (patientNameRef.current) patientNameRef.current.value = "";
      if (patientPhoneRef.current) patientPhoneRef.current.value = "";
      if (patientEmailRef.current) patientEmailRef.current.value = "";
      if (ageRef.current) ageRef.current.value = "";
      if (addressRef.current) addressRef.current.value = "";
      if (cityRef.current) cityRef.current.value = "";
      if (pincodeRef.current) pincodeRef.current.value = "";
      if (notesRef.current) notesRef.current.value = "";
      if (collectionTimeRef.current) collectionTimeRef.current.value = "";
      setPaymentMode("CASH");
      setItems([{ uid: uid(), itemType: "TEST", priceRowId: "", quantity: 1, sellingPrice: 0, costPrice: 0 }]);

      await loadAll();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create order";
      alert(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

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
                <h1 className="text-2xl sm:text-3xl font-extrabold">Offline Sales Management</h1>
                <div className="text-sm text-white/90 mt-1">SuperAdmin manual bookings with catalog cost + profit tracking</div>
              </div>
            </div>
            <button onClick={loadAll} className="rounded-full bg-white/20 px-3 py-2 text-sm font-semibold hover:bg-white/30 flex items-center gap-2">
              <FaSyncAlt /> Refresh
            </button>
            <button onClick={() => navigate("/online-sales-history")} className="rounded-full bg-white text-red-600 px-3 py-2 text-sm font-semibold hover:bg-red-50">
              Online History
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-gray-600">Date range</div>
            <input type="date" className="rounded-lg border px-3 py-2 text-sm" value={fromDate} max={toDate} onChange={(e) => setFromDate(e.target.value)} />
            <span className="text-gray-400">-</span>
            <input type="date" className="rounded-lg border px-3 py-2 text-sm" value={toDate} min={fromDate} onChange={(e) => setToDate(e.target.value)} />
            <button onClick={loadAll} className="rounded-full bg-red-600 text-white px-3 py-2 text-sm font-semibold hover:bg-red-700">Apply</button>
            <button
              onClick={() => {
                setFromDate("2000-01-01");
                setToDate(todayYmd());
                setTimeout(() => loadAll(1), 0);
              }}
              className="rounded-full bg-white border px-3 py-2 text-sm font-semibold hover:bg-red-50"
            >
              All Time
            </button>
            {loading ? <span className="text-xs text-gray-500">Loading...</span> : null}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2"><div className="text-xs text-red-700">Orders</div><div className="text-xl font-bold">{summary?.totalOrders || 0}</div></div>
            <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2"><div className="text-xs text-amber-700">Revenue</div><div className="text-xl font-bold">{money(summary?.revenue || 0)}</div></div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2"><div className="text-xs text-blue-700">Cost</div><div className="text-xl font-bold">{money(summary?.cost || 0)}</div></div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2"><div className="text-xs text-emerald-700">Gross Profit</div><div className="text-xl font-bold">{money(summary?.grossProfit || 0)}</div></div>
            <div className="rounded-lg border border-purple-100 bg-purple-50 px-3 py-2"><div className="text-xs text-purple-700">Net Profit</div><div className="text-xl font-bold">{money(summary?.netProfit || 0)}</div><div className="text-[11px] text-gray-500">Margin {summary?.profitMarginPercent || 0}%</div></div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"><div className="text-xs text-slate-700">Profit Quality</div><div className="text-xl font-bold">{summary?.profitMarginPercent || 0}%</div></div>
          </div>

          <div className="rounded-2xl border border-red-100 bg-white">
            <div className="px-4 py-3 border-b bg-red-50/70 rounded-t-2xl font-bold text-red-700 flex items-center gap-2"><FaChartLine /> Revenue / Cost / Net Trend</div>
            <div className="p-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#93c5fd" name="Orders" />
                  <Line dataKey="revenue" stroke="#f97316" strokeWidth={2} name="Revenue" />
                  <Line dataKey="cost" stroke="#3b82f6" strokeWidth={2} name="Cost" />
                  <Line dataKey="netProfit" stroke="#10b981" strokeWidth={2} name="Net Profit" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-red-100 bg-white">
            <div className="px-4 py-3 border-b bg-red-50/70 rounded-t-2xl font-bold text-red-700 flex items-center gap-2"><FaRupeeSign /> Create Offline Order</div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Fulfillment Lab</label>
                  <select className="mt-1 w-full border rounded-lg px-3 py-2" value={selectedLabId} onChange={(e) => setSelectedLabId(e.target.value)}>
                    <option value="">Select lab</option>
                    {labs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Pricing Lab Source</label>
                  <select className="mt-1 w-full border rounded-lg px-3 py-2" value={selectedPricingLab} onChange={(e) => setSelectedPricingLab(e.target.value)}>
                    <option value="">Select pricing lab</option>
                    {catalogLabs.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                  <div className="text-xs text-red-700">Offline sales are internal only</div>
                  <div className="text-sm font-semibold text-gray-800">No partner/referral logic applied</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Order Date</label>
                  <input
                    type="date"
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Collection Time</label>
                  <input
                    type="time"
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    ref={collectionTimeRef}
                    defaultValue=""
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Age</label>
                  <input
                    type="number"
                    min={0}
                    max={130}
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    placeholder="Patient age"
                    ref={ageRef}
                    defaultValue=""
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Payment Mode</label>
                  <select
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode((e.target.value || "CASH") as "CASH" | "ONLINE")}
                  >
                    <option value="CASH">Cash</option>
                    <option value="ONLINE">Online</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input className="border rounded-lg px-3 py-2" placeholder="Patient Name *" ref={patientNameRef} defaultValue="" />
                <input className="border rounded-lg px-3 py-2" placeholder="Mobile" ref={patientPhoneRef} defaultValue="" />
                <input className="border rounded-lg px-3 py-2" placeholder="Email" ref={patientEmailRef} defaultValue="" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input className="md:col-span-2 border rounded-lg px-3 py-2" placeholder="Address *" ref={addressRef} defaultValue="" />
                <div className="grid grid-cols-2 gap-2">
                  <input className="border rounded-lg px-3 py-2" placeholder="City" ref={cityRef} defaultValue="" />
                  <input className="border rounded-lg px-3 py-2" placeholder="Pincode" ref={pincodeRef} defaultValue="" />
                </div>
              </div>

              <div className="border rounded-xl p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-700">Items</div>
                  <button type="button" onClick={addItem} className="text-sm rounded-lg bg-red-600 text-white px-3 py-1.5 hover:bg-red-700 inline-flex items-center gap-2"><FaPlus /> Add Item</button>
                </div>

                {items.map((it, idx) => {
                  return (
                    <div key={it.uid} className="grid grid-cols-1 lg:grid-cols-12 gap-2 border rounded-lg p-2">
                      <select className="lg:col-span-2 border rounded-lg px-2 py-2" value={it.itemType} onChange={(e) => updateItem(it.uid, { itemType: e.target.value as "TEST" | "PACKAGE", priceRowId: "" })}>
                        <option value="TEST">TEST</option>
                        <option value="PACKAGE">PACKAGE</option>
                      </select>
                      <select className="lg:col-span-4 border rounded-lg px-2 py-2" value={it.priceRowId} onChange={(e) => onPickCatalogRow(it.uid, e.target.value)}>
                        <option value="">Select from catalog</option>
                        {itemOptionNodesByType[it.itemType]}
                      </select>
                      <input className="lg:col-span-1 border rounded-lg px-2 py-2" type="number" min={1} value={it.quantity} onChange={(e) => updateItem(it.uid, { quantity: Math.max(1, Number(e.target.value || 1)) })} placeholder="Qty" />
                      <input className="lg:col-span-2 border rounded-lg px-2 py-2" type="number" value={it.costPrice} onChange={(e) => updateItem(it.uid, { costPrice: Number(e.target.value || 0) })} placeholder="Cost / unit" />
                      <input className="lg:col-span-2 border rounded-lg px-2 py-2" type="number" value={it.sellingPrice} onChange={(e) => updateItem(it.uid, { sellingPrice: Number(e.target.value || 0) })} placeholder="Sell / unit" />
                      <button type="button" onClick={() => removeItem(it.uid)} className="lg:col-span-1 border rounded-lg px-2 py-2 text-red-600 hover:bg-red-50"><FaTrash /></button>
                      <div className="lg:col-span-12 text-xs text-gray-500">Row {idx + 1} total: {money(Number(it.sellingPrice || 0) * Number(it.quantity || 1))}</div>
                    </div>
                  );
                })}

                <textarea className="w-full border rounded-lg px-3 py-2" rows={2} placeholder="Notes (optional)" ref={notesRef} defaultValue="" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div className="rounded-lg bg-slate-50 border p-2"><div className="text-xs text-gray-500">Revenue</div><div className="font-bold">{money(computed.revenue)}</div></div>
                  <div className="rounded-lg bg-slate-50 border p-2"><div className="text-xs text-gray-500">Cost</div><div className="font-bold">{money(computed.cost)}</div></div>
                  <div className="rounded-lg bg-slate-50 border p-2"><div className="text-xs text-gray-500">Gross Profit</div><div className="font-bold">{money(computed.grossProfit)}</div></div>
                  <div className="rounded-lg bg-slate-50 border p-2"><div className="text-xs text-gray-500">Estimated Net</div><div className="font-bold">{money(computed.estimatedNet)}</div></div>
                </div>

                <button type="button" onClick={submitOrder} disabled={submitLoading} className="rounded-lg bg-red-600 text-white px-4 py-2 hover:bg-red-700 disabled:opacity-60">
                  {submitLoading ? "Saving..." : "Create Offline Order"}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-red-100 bg-white">
            <div className="px-4 py-3 border-b bg-red-50/70 rounded-t-2xl font-bold text-red-700 flex flex-wrap items-center justify-between gap-2">
              <span>Offline Order History</span>
              <div className="flex items-center gap-2">
                <input
                  className="border rounded-lg px-2 py-1.5 text-sm font-normal text-gray-700"
                  placeholder="Search order/patient..."
                  value={ordersSearch}
                  onChange={(e) => setOrdersSearch(e.target.value)}
                />
                <button
                  className="rounded-lg bg-white border px-3 py-1.5 text-sm hover:bg-red-50"
                  onClick={() => loadAll(1)}
                >
                  Search
                </button>
                <button
                  className="rounded-lg bg-red-600 text-white px-3 py-1.5 text-sm hover:bg-red-700"
                  onClick={async () => {
                    await downloadOfflineSalesOrdersReport({
                      from: fromDate,
                      to: toDate,
                      search: ordersSearch || undefined,
                    });
                  }}
                >
                  Download Excel
                </button>
              </div>
            </div>
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-2">Order</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Patient</th>
                    <th className="p-2">Lab</th>
                    <th className="p-2">Revenue</th>
                    <th className="p-2">Cost</th>
                    <th className="p-2">Net Profit</th>
                    <th className="p-2">Order Status</th>
                    <th className="p-2">Payment Status</th>
                    <th className="p-2">Payment Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t">
                      <td className="p-2 font-semibold">{o.orderId}</td>
                      <td className="p-2">{new Date(o.createdAt).toLocaleString()}</td>
                      <td className="p-2">{o.patientName}</td>
                      <td className="p-2">{o.lab?.name || "-"}</td>
                      <td className="p-2">{money(o.finance?.revenue || 0)}</td>
                      <td className="p-2">{money(o.finance?.cost || 0)}</td>
                      <td className="p-2">{money(o.finance?.netProfit || 0)}</td>
                      <td className="p-2">{o.status || "-"}</td>
                      <td className="p-2">{o.paymentStatus || "-"}</td>
                      <td className="p-2">{(o.paymentMode || "CASH").toString().toUpperCase()}</td>
                    </tr>
                  ))}
                  {!orders.length ? (
                    <tr><td className="p-3 text-gray-500" colSpan={10}>No offline orders found for this range.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t flex items-center justify-between text-sm">
              <div className="text-gray-600">
                Showing page {ordersPagination.page} of {ordersPagination.totalPages} • Total {ordersPagination.total}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded border px-3 py-1 disabled:opacity-50"
                  disabled={!ordersPagination.hasPrevPage}
                  onClick={() => loadAll(Math.max(1, ordersPage - 1))}
                >
                  Prev
                </button>
                <button
                  className="rounded border px-3 py-1 disabled:opacity-50"
                  disabled={!ordersPagination.hasNextPage}
                  onClick={() => loadAll(ordersPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineSales;


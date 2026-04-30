import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaDownload, FaEdit, FaPlus, FaSyncAlt, FaTrash } from "react-icons/fa";
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";
import { useOfficeExpenses } from "../../hooks/useOfficeExpenses";

const money = (n: number) => `Rs${Number(n || 0).toLocaleString("en-IN")}`;

type FormState = {
  title: string;
  category: string;
  amount: string;
  paymentMode: "CASH" | "ONLINE";
  expenseDate: string;
  vendor: string;
  billReference: string;
  notes: string;
  billFile: File | null;
};

const OfficeExpenses: React.FC = () => {
  const navigate = useNavigate();
  const x = useOfficeExpenses();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    title: "",
    category: "",
    amount: "",
    paymentMode: "CASH",
    expenseDate: x.fromDate,
    vendor: "",
    billReference: "",
    notes: "",
    billFile: null,
  });

  const save = async () => {
    if (!form.title.trim() || !form.category.trim() || !form.amount.trim() || !form.expenseDate) return alert("Please fill required fields");
    const payload = {
      title: form.title.trim(),
      category: form.category.trim(),
      amount: Number(form.amount),
      paymentMode: form.paymentMode,
      expenseDate: form.expenseDate,
      vendor: form.vendor || undefined,
      billReference: form.billReference || undefined,
      notes: form.notes || undefined,
      billFile: form.billFile,
    };
    if (!Number.isFinite(payload.amount) || payload.amount <= 0) return alert("Amount must be greater than 0");
    if (editingId) await x.updateExpense(editingId, payload); else await x.createExpense(payload);
    await x.load(1);
    setEditingId(null);
    setForm({ title: "", category: "", amount: "", paymentMode: "CASH", expenseDate: x.fromDate, vendor: "", billReference: "", notes: "", billFile: null });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-3 sm:p-6" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-7xl overflow-hidden border border-red-100">
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white py-5 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 bg-red-600 rounded-full"><FaArrowLeft /></button>
              <div><h1 className="text-2xl sm:text-3xl font-extrabold">Office Expenses</h1><div className="text-sm text-white/90">Internal cost tracking + bill uploads</div></div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => x.load(x.page)} className="rounded-full bg-white text-red-700 px-3 py-2 text-sm font-semibold flex items-center gap-2"><FaSyncAlt />Refresh</button>
              <button onClick={x.downloadReport} className="rounded-full bg-white text-red-700 px-3 py-2 text-sm font-semibold flex items-center gap-2"><FaDownload />Excel</button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex flex-wrap items-end gap-2">
            <input type="date" value={x.fromDate} onChange={(e) => x.setFromDate(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
            <input type="date" value={x.toDate} onChange={(e) => x.setToDate(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
            <input value={x.search} onChange={(e) => x.setSearch(e.target.value)} placeholder="Search" className="rounded-lg border px-3 py-2 text-sm" />
            <input value={x.category} onChange={(e) => x.setCategory(e.target.value)} placeholder="Category" className="rounded-lg border px-3 py-2 text-sm" />
            <select value={x.paymentMode} onChange={(e) => x.setPaymentMode(e.target.value)} className="rounded-lg border px-3 py-2 text-sm"><option value="">All</option><option value="CASH">Cash</option><option value="ONLINE">Online</option></select>
            <button onClick={() => x.load(1)} className="rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold">Apply</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2"><div className="text-xs text-red-700">Total Expense</div><div className="text-2xl font-bold">{money(x.summary?.totalAmount || 0)}</div></div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2"><div className="text-xs text-blue-700">Entries</div><div className="text-2xl font-bold">{x.summary?.totalCount || 0}</div></div>
            <div className="rounded-lg border border-green-100 bg-green-50 px-3 py-2"><div className="text-xs text-green-700">Average</div><div className="text-2xl font-bold">{money(x.summary?.averageExpense || 0)}</div></div>
          </div>

          <div className="h-56 border rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%"><LineChart data={x.trend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} placeholder="Title*" className="rounded-lg border px-3 py-2 text-sm" />
            <input value={form.category} onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))} placeholder="Category*" className="rounded-lg border px-3 py-2 text-sm" />
            <input value={form.amount} onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))} placeholder="Amount*" type="number" className="rounded-lg border px-3 py-2 text-sm" />
            <input value={form.expenseDate} onChange={(e) => setForm((s) => ({ ...s, expenseDate: e.target.value }))} type="date" className="rounded-lg border px-3 py-2 text-sm" />
            <select value={form.paymentMode} onChange={(e) => setForm((s) => ({ ...s, paymentMode: e.target.value as "CASH" | "ONLINE" }))} className="rounded-lg border px-3 py-2 text-sm"><option value="CASH">Cash</option><option value="ONLINE">Online</option></select>
            <input value={form.vendor} onChange={(e) => setForm((s) => ({ ...s, vendor: e.target.value }))} placeholder="Vendor" className="rounded-lg border px-3 py-2 text-sm" />
            <input value={form.billReference} onChange={(e) => setForm((s) => ({ ...s, billReference: e.target.value }))} placeholder="Bill Ref" className="rounded-lg border px-3 py-2 text-sm" />
            <input value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} placeholder="Notes" className="rounded-lg border px-3 py-2 text-sm" />
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setForm((s) => ({ ...s, billFile: e.target.files?.[0] || null }))} className="rounded-lg border px-3 py-2 text-sm md:col-span-2" />
          </div>
          <div className="flex gap-2"><button onClick={save} className="rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold flex items-center gap-2"><FaPlus />{editingId ? "Update" : "Add"}</button>{editingId ? <button onClick={() => { setEditingId(null); }} className="rounded-lg border px-3 py-2 text-sm">Cancel</button> : null}</div>

          {x.error ? <div className="text-sm text-red-600">{x.error}</div> : null}
          <div className="overflow-auto border rounded-lg">
            <table className="min-w-full text-sm"><thead className="bg-red-50 text-red-700"><tr><th className="text-left px-3 py-2">Date</th><th className="text-left px-3 py-2">Title</th><th className="text-left px-3 py-2">Category</th><th className="text-left px-3 py-2">Amount</th><th className="text-left px-3 py-2">Mode</th><th className="text-left px-3 py-2">Bill</th><th className="text-left px-3 py-2">Action</th></tr></thead>
              <tbody>{x.loading ? <tr><td className="px-3 py-2" colSpan={7}>Loading...</td></tr> : x.expenses.length === 0 ? <tr><td className="px-3 py-2" colSpan={7}>No data</td></tr> : x.expenses.map((e) => <tr className="border-t" key={e.id}><td className="px-3 py-2">{new Date(e.expenseDate).toLocaleDateString()}</td><td className="px-3 py-2">{e.title}</td><td className="px-3 py-2">{e.category}</td><td className="px-3 py-2">{money(e.amount)}</td><td className="px-3 py-2">{e.paymentMode}</td><td className="px-3 py-2">{e.billViewUrl ? <a className="text-red-600 underline" href={e.billViewUrl} target="_blank" rel="noreferrer">View Bill</a> : "-"}</td><td className="px-3 py-2"><div className="flex gap-2"><button className="rounded-full border px-2 py-1" onClick={() => { setEditingId(e.id); setForm({ title: e.title, category: e.category, amount: String(e.amount), paymentMode: e.paymentMode === "ONLINE" ? "ONLINE" : "CASH", expenseDate: new Date(e.expenseDate).toISOString().slice(0,10), vendor: e.vendor || "", billReference: e.billReference || "", notes: e.notes || "", billFile: null }); }}><FaEdit /></button><button className="rounded-full border border-red-200 text-red-600 px-2 py-1" onClick={async () => { if (!window.confirm(`Delete ${e.title}?`)) return; await x.deleteExpense(e.id); await x.load(x.page); }}><FaTrash /></button></div></td></tr>)}</tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2"><button disabled={!x.pagination.hasPrevPage} onClick={() => x.load(Math.max(1, x.page - 1))} className="rounded-full border px-3 py-1 text-xs disabled:opacity-50">Prev</button><span className="text-xs text-gray-500">Page {x.pagination.page}/{x.pagination.totalPages}</span><button disabled={!x.pagination.hasNextPage} onClick={() => x.load(x.page + 1)} className="rounded-full border px-3 py-1 text-xs disabled:opacity-50">Next</button></div>
        </div>
      </div>
    </div>
  );
};

export default OfficeExpenses;

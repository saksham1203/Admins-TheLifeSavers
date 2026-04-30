import { useCallback, useEffect, useState } from "react";
import {
  createOfficeExpense,
  deleteOfficeExpense,
  downloadOfficeExpensesReport,
  fetchOfficeExpenses,
  fetchOfficeExpensesSummary,
  fetchOfficeExpensesTrend,
  updateOfficeExpense,
  type OfficeExpense,
  type OfficeExpenseSummary,
  type OfficeExpenseTrendPoint,
} from "../services/officeExpenses.service";

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const monthStart = () => { const d = new Date(); return ymd(new Date(d.getFullYear(), d.getMonth(), 1)); };
const monthEnd = () => { const d = new Date(); return ymd(new Date(d.getFullYear(), d.getMonth() + 1, 0)); };

export function useOfficeExpenses() {
  const [fromDate, setFromDate] = useState(monthStart());
  const [toDate, setToDate] = useState(monthEnd());
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expenses, setExpenses] = useState<OfficeExpense[]>([]);
  const [summary, setSummary] = useState<OfficeExpenseSummary | null>(null);
  const [trend, setTrend] = useState<OfficeExpenseTrendPoint[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false });

  const load = useCallback(async (targetPage = page) => {
    setLoading(true);
    setError("");
    try {
      const [list, sum, tr] = await Promise.all([
        fetchOfficeExpenses({ from: fromDate, to: toDate, page: targetPage, limit: 20, search: search || undefined, category: category || undefined, paymentMode: paymentMode || undefined }),
        fetchOfficeExpensesSummary({ from: fromDate, to: toDate }),
        fetchOfficeExpensesTrend({ from: fromDate, to: toDate }),
      ]);
      setExpenses(list.expenses || []);
      setPagination(list.pagination);
      setSummary(sum.summary || null);
      setTrend(tr.trend || []);
      setPage(targetPage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load office expenses");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, page, search, category, paymentMode]);

  useEffect(() => { load(1); }, [load]);

  return {
    fromDate, toDate, setFromDate, setToDate,
    search, setSearch, category, setCategory, paymentMode, setPaymentMode,
    page, setPage, loading, error, expenses, summary, trend, pagination, load,
    createExpense: createOfficeExpense,
    updateExpense: updateOfficeExpense,
    deleteExpense: deleteOfficeExpense,
    downloadReport: () => downloadOfficeExpensesReport({ from: fromDate, to: toDate, search: search || undefined, category: category || undefined, paymentMode: paymentMode || undefined }),
  };
}


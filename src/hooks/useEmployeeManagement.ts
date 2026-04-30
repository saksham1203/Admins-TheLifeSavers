import { useEffect, useState } from "react";
import {
  fetchEmployees,
  getEmployeeById,
  fetchActiveLetterhead,
  fetchAttendance,
  fetchSalarySlips,
  type Employee,
} from "../services/employeeManagement.service";

export function useEmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [salarySlips, setSalarySlips] = useState<any[]>([]);
  const [letterhead, setLetterhead] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [designation, setDesignation] = useState("");

  const loadEmployees = async (targetPage = page) => {
    setLoading(true);
    setError("");
    try {
      const resp = await fetchEmployees({ page: targetPage, limit: 20, search: search || undefined, status: status || undefined, designation: designation || undefined });
      setEmployees(resp.employees || []);
      setPagination(resp.pagination);
      setPage(targetPage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeDetails = async (id: string) => {
    const emp = await getEmployeeById(id);
    setSelectedEmployee(emp.employee);
    return emp.employee;
  };

  const loadAttendance = async (employeeId: string, from: string, to: string) => {
    const r = await fetchAttendance(employeeId, from, to);
    setAttendance(r.attendance || []);
  };

  const loadSalarySlips = async (employeeId: string) => {
    const r = await fetchSalarySlips(employeeId);
    setSalarySlips(r.slips || []);
  };

  const loadLetterhead = async () => {
    const r = await fetchActiveLetterhead();
    setLetterhead(r.letterhead || null);
  };

  useEffect(() => {
    loadEmployees(1);
    loadLetterhead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    employees,
    selectedEmployee,
    setSelectedEmployee,
    attendance,
    salarySlips,
    letterhead,
    loading,
    error,
    page,
    setPage,
    pagination,
    search,
    setSearch,
    status,
    setStatus,
    designation,
    setDesignation,
    loadEmployees,
    loadEmployeeDetails,
    loadAttendance,
    loadSalarySlips,
    loadLetterhead,
  };
}

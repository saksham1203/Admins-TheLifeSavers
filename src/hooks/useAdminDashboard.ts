import { useCallback, useEffect, useMemo, useState } from "react";
import * as service from "../services/adminDashboardService";

function ymdDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

const EMPTY_OVERVIEW: service.StatOverview = {
  totalUsers: 0,
  newUsers7d: 0,
  newUsersToday: 0,
  totalOrders: 0,
  testsBookedToday: 0,
  revenue30d: 0,
  selectedRangeOrders: 0,
  partnerRequestsCount: 0,
  newGuestsToday: 0,
};

export function useAdminDashboard() {
  const [fromDate, setFromDate] = useState<string>(() => ymdDaysAgo(6));
  const [toDate, setToDate] = useState<string>(() => ymdDaysAgo(0));

  const [overview, setOverview] = useState<service.StatOverview>(EMPTY_OVERVIEW);
  const [usersTrend, setUsersTrend] = useState<service.TrendPoint[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<service.TrendPoint[]>([]);
  const [ordersTrend, setOrdersTrend] = useState<service.TrendPoint[]>([]);
  const [bookingsByLab, setBookingsByLab] = useState<service.BookingByLab[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<service.PaymentMethod[]>([]);
  const [topTests, setTopTests] = useState<service.TopTest[]>([]);
  const [labsTrend, setLabsTrend] = useState<service.LabsTrendPoint[]>([]);
  const [orderStatusSummary, setOrderStatusSummary] = useState<service.OrderStatusSummary[]>([]);
  const [guestTrend, setGuestTrend] = useState<service.GuestTrendPoint[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<service.DashboardUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersQuery, setUsersQuery] = useState("");
  const [usersPage, setUsersPage] = useState(1);
  const [usersLimit] = useState(10);
  const [usersPagination, setUsersPagination] = useState<service.PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [selectedUser, setSelectedUser] = useState<service.DashboardUser | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<service.DashboardUser | null>(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);

  const [labs, setLabs] = useState<service.DashboardLab[]>([]);
  const [labsLoading, setLabsLoading] = useState(false);
  const [labsError, setLabsError] = useState<string | null>(null);
  const [labsQuery, setLabsQuery] = useState("");
  const [labsPage, setLabsPage] = useState(1);
  const [labsLimit] = useState(10);
  const [labsPagination, setLabsPagination] = useState<service.PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [guests, setGuests] = useState<service.DashboardGuest[]>([]);
  const [guestsLoading, setGuestsLoading] = useState(false);
  const [guestsError, setGuestsError] = useState<string | null>(null);
  const [guestsQuery, setGuestsQuery] = useState("");
  const [guestsPage, setGuestsPage] = useState(1);
  const [guestsLimit] = useState(10);
  const [guestsPagination, setGuestsPagination] = useState<service.PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchDashboard = useCallback(async (from?: string, to?: string) => {
    const range = { from: from ?? fromDate, to: to ?? toDate };
    setLoading(true);
    setError(null);

    try {
      const bundle = await service.fetchDashboardBundle(range);
      let nextOverview = bundle.overview;

      if (typeof nextOverview?.partnerRequestsCount !== "number") {
        const count = await service.fetchPartnerRequestsCount().catch(() => null);
        if (count !== null) {
          nextOverview = { ...nextOverview, partnerRequestsCount: count };
        }
      }

      setOverview({ ...EMPTY_OVERVIEW, ...(nextOverview || {}) });
      setUsersTrend(bundle.usersTrend || []);
      setRevenueTrend(bundle.revenueTrend || []);
      setOrdersTrend(bundle.ordersTrend || []);
      setBookingsByLab(bundle.bookingsByLab || []);
      setPaymentMethods(bundle.paymentMethods || []);
      setTopTests(bundle.topTests || []);
      setLabsTrend(bundle.labsTrend || []);
      setOrderStatusSummary(bundle.orderStatusSummary || []);
      setGuestTrend(bundle.guestTrend || []);

      const hasSomeData =
        (bundle.usersTrend?.length || 0) +
          (bundle.revenueTrend?.length || 0) +
          (bundle.ordersTrend?.length || 0) +
          (bundle.bookingsByLab?.length || 0) +
          (bundle.topTests?.length || 0) +
          (bundle.paymentMethods?.length || 0) +
          (bundle.labsTrend?.length || 0) +
          (bundle.orderStatusSummary?.length || 0) +
          (bundle.guestTrend?.length || 0) >
        0;
      if (!hasSomeData && (nextOverview?.totalUsers || 0) === 0 && (nextOverview?.totalOrders || 0) === 0) {
        setError("Dashboard returned empty data for this range. Try widening date range.");
      }
    } catch (err: unknown) {
      console.error("fetchDashboard failed", err);
      setError(getErrorMessage(err, "Failed to fetch dashboard"));
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  const fetchUsers = useCallback(async (args?: { page?: number; search?: string }) => {
    const page = args?.page ?? usersPage;
    const search = args?.search ?? usersQuery;

    setUsersLoading(true);
    setUsersError(null);
    try {
      const res = await service.fetchDashboardUsers({
        page,
        limit: usersLimit,
        search,
        from: fromDate,
        to: toDate,
      });
      if (!res?.success) throw new Error("Failed to fetch users");

      setUsers(res.users || []);
      setUsersPagination(
        res.pagination || {
          page,
          limit: usersLimit,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        }
      );
    } catch (err: unknown) {
      console.error("fetchUsers failed", err);
      setUsersError(getErrorMessage(err, "Failed to fetch users"));
    } finally {
      setUsersLoading(false);
    }
  }, [usersLimit, usersPage, usersQuery, fromDate, toDate]);

  const openUserDetails = useCallback(async (user: service.DashboardUser) => {
    setSelectedUser(user);
    setUserDetailsLoading(true);
    try {
      const res = await service.fetchDashboardUserDetails(user._id);
      if (!res?.success || !res.user) throw new Error("Failed to fetch user details");
      setSelectedUserDetails(res.user);
    } catch (err) {
      console.error("openUserDetails failed", err);
      setSelectedUserDetails(user);
    } finally {
      setUserDetailsLoading(false);
    }
  }, []);

  const fetchLabs = useCallback(async (args?: { page?: number; search?: string }) => {
    const page = args?.page ?? labsPage;
    const search = args?.search ?? labsQuery;

    setLabsLoading(true);
    setLabsError(null);
    try {
      const res = await service.fetchDashboardLabs({
        page,
        limit: labsLimit,
        search,
        from: fromDate,
        to: toDate,
      });
      if (!res?.success) throw new Error("Failed to fetch labs");

      setLabs(res.labs || []);
      setLabsPagination(
        res.pagination || {
          page,
          limit: labsLimit,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        }
      );
    } catch (err: unknown) {
      console.error("fetchLabs failed", err);
      setLabsError(getErrorMessage(err, "Failed to fetch labs"));
    } finally {
      setLabsLoading(false);
    }
  }, [labsLimit, labsPage, labsQuery, fromDate, toDate]);

  const closeUserDetails = useCallback(() => {
    setSelectedUser(null);
    setSelectedUserDetails(null);
  }, []);

  const fetchGuests = useCallback(async (args?: { page?: number; search?: string }) => {
    const page = args?.page ?? guestsPage;
    const search = args?.search ?? guestsQuery;

    setGuestsLoading(true);
    setGuestsError(null);
    try {
      const res = await service.fetchDashboardGuests({
        page,
        limit: guestsLimit,
        search,
        from: fromDate,
        to: toDate,
      });
      if (!res?.success) throw new Error("Failed to fetch guests");

      setGuests(res.guests || []);
      setGuestsPagination(
        res.pagination || {
          page,
          limit: guestsLimit,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        }
      );
    } catch (err: unknown) {
      console.error("fetchGuests failed", err);
      setGuestsError(getErrorMessage(err, "Failed to fetch guests"));
    } finally {
      setGuestsLoading(false);
    }
  }, [guestsLimit, guestsPage, guestsQuery, fromDate, toDate]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers({ page: usersPage, search: usersQuery });
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers, usersPage, usersQuery, fromDate, toDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLabs({ page: labsPage, search: labsQuery });
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchLabs, labsPage, labsQuery, fromDate, toDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGuests({ page: guestsPage, search: guestsQuery });
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchGuests, guestsPage, guestsQuery, fromDate, toDate]);

  const usersRevenueTrend = useMemo(() => {
    const revByDate = new Map<string, number>();
    for (const row of revenueTrend) {
      revByDate.set(row.date, Number(row.revenue || 0));
    }
    return usersTrend.map((row) => ({
      ...row,
      revenue: revByDate.get(row.date) || 0,
    }));
  }, [usersTrend, revenueTrend]);

  const applyDateRange = useCallback(() => {
    fetchDashboard(fromDate, toDate);
    fetchUsers({ page: usersPage, search: usersQuery });
    fetchLabs({ page: labsPage, search: labsQuery });
    fetchGuests({ page: guestsPage, search: guestsQuery });
  }, [fetchDashboard, fetchUsers, fetchLabs, fetchGuests, fromDate, toDate, usersPage, usersQuery, labsPage, labsQuery, guestsPage, guestsQuery]);

  const refresh = useCallback(() => {
    fetchDashboard();
    fetchUsers({ page: usersPage, search: usersQuery });
    fetchLabs({ page: labsPage, search: labsQuery });
    fetchGuests({ page: guestsPage, search: guestsQuery });
  }, [fetchDashboard, fetchUsers, usersPage, usersQuery, fetchLabs, labsPage, labsQuery, fetchGuests, guestsPage, guestsQuery]);

  return {
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
  };
}

export type {
  StatOverview,
  TrendPoint,
  BookingByLab,
  PaymentMethod,
  TopTest,
  LabsTrendPoint,
  OrderStatusSummary,
  GuestTrendPoint,
  DashboardUser,
  DashboardLab,
  DashboardGuest,
} from "../services/adminDashboardService";





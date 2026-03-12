// src/hooks/usePartnerRequests.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import * as service from "../services/partnersService";

export type { PartnerRequest, OnboardForm } from "../services/partnersService";

export function usePartnerRequests() {
  // ---------------- Existing Partner Request Flow ----------------
  const [items, setItems] = useState<service.PartnerRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [selectedStatus, setSelectedStatus] = useState<
    "ALL" | "PENDING" | "ACCEPTED" | "REJECTED"
  >("ALL");

  const [selected, setSelected] = useState<service.PartnerRequest | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    { id: string; type: "approve" | "reject"; name?: string } | null
  >(null);

  const [onboardOpen, setOnboardOpen] = useState(false);
  const [onboardSubmitting, setOnboardSubmitting] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await service.fetchPartnerRequests();
      setItems(list ?? []);
      setPage(1);
    } catch (err: any) {
      console.error("fetchPartnerRequests failed", err);
      setError(err?.message ?? "Failed to fetch partner requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items;
    if (selectedStatus !== "ALL") list = list.filter((it) => it.status === selectedStatus);
    if (!q) return list;

    return list.filter((it) => {
      const name = `${it.firstName ?? ""} ${it.lastName ?? ""}`.toLowerCase();
      return (
        name.includes(q) ||
        (it.email ?? "").toLowerCase().includes(q) ||
        (it.mobile ?? "").toLowerCase().includes(q) ||
        (it.shopName ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, query, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const requestCounts = useMemo(
    () => ({
      pending: items.filter((i) => i.status === "PENDING").length,
      acceptedFromRequests: items.filter((i) => i.status === "ACCEPTED").length,
      rejected: items.filter((i) => i.status === "REJECTED").length,
    }),
    [items]
  );

  const openDetails = useCallback((r: service.PartnerRequest) => {
    setSelected(r);
    setShowModal(true);
  }, []);

  const askConfirm = useCallback((id: string, type: "approve" | "reject", name?: string) => {
    setPendingAction({ id, type, name });
    setConfirmOpen(true);
  }, []);

  const performAction = useCallback(
    async (id: string, type: "approve" | "reject") => {
      setConfirmLoading(true);
      setActionLoadingId(id);
      try {
        const res = type === "approve" ? await service.approvePartnerRequest(id) : await service.rejectPartnerRequest(id);

        if (!res || res.success === false) throw new Error(res?.message || `${type} failed`);

        setItems((prev) =>
          prev.map((it) =>
            it.id === id ? { ...it, status: type === "approve" ? "ACCEPTED" : "REJECTED" } : it
          )
        );

        return res;
      } catch (err: any) {
        console.error(`${type} failed`, err);
        throw err;
      } finally {
        setConfirmLoading(false);
        setActionLoadingId(null);
        setConfirmOpen(false);
        setPendingAction(null);
      }
    },
    []
  );

  const onboardSubmit = useCallback(async (data: service.OnboardForm) => {
    setOnboardSubmitting(true);
    try {
      const json = await service.createPartnerOnboard(data);
      if (!json || json.success === false) throw new Error(json?.message || "Onboarding failed");

      const newReq: service.PartnerRequest = {
        id: json.request?.id || json.request?._id || Math.random().toString(36).slice(2, 9),
        email: json.request?.email,
        status: (json.request?.status as service.PartnerRequest["status"]) || "PENDING",
        createdAt: new Date().toISOString(),
        firstName: data.firstName,
        lastName: data.lastName,
        partnerType: data.partnerType,
        shopName: data.shopName,
        mobile: data.mobile,
        pincode: data.pincode,
        address: data.address,
        isAdmin: data.isAdmin ?? false,
      };

      setItems((prev) => [newReq, ...prev]);
      setOnboardOpen(false);
      return json;
    } catch (err) {
      console.error("onboardSubmit failed", err);
      throw err;
    } finally {
      setOnboardSubmitting(false);
    }
  }, []);

  // ---------------- New SuperAdmin Partner Management Flow ----------------
  const [partners, setPartners] = useState<service.SuperAdminPartner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [partnersError, setPartnersError] = useState<string | null>(null);
  const [partnersQuery, setPartnersQuery] = useState("");
  const [partnersPage, setPartnersPage] = useState(1);
  const [partnersLimit] = useState(10);
  const [partnersPagination, setPartnersPagination] = useState<service.PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [completedCycles, setCompletedCycles] = useState<service.SuperAdminCompletedCycleRow[]>([]);
  const [completedCyclesLoading, setCompletedCyclesLoading] = useState(false);
  const [completedCyclesError, setCompletedCyclesError] = useState<string | null>(null);
  const [completedCyclesQuery, setCompletedCyclesQuery] = useState("");
  const [completedCyclesPage, setCompletedCyclesPage] = useState(1);
  const [completedCyclesLimit] = useState(10);
  const [completedCyclesPayoutStatus, setCompletedCyclesPayoutStatus] = useState<"PAID" | "PENDING" | "CANCELLED" | "">("");
  const [completedCyclesOnlyActionable, setCompletedCyclesOnlyActionable] = useState(false);
  const [completedCyclesPagination, setCompletedCyclesPagination] = useState<service.PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [managerOpen, setManagerOpen] = useState(false);
  const [managerLoading, setManagerLoading] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [partnerDetails, setPartnerDetails] = useState<service.PartnerDetailsResp | null>(null);
  const [partnerBank, setPartnerBank] = useState<service.PartnerBank | null>(null);
  const [partnerCycles, setPartnerCycles] = useState<service.PartnerCycle[]>([]);
  const [partnerCyclesSummary, setPartnerCyclesSummary] = useState<{
    totalPatients: number;
    totalRevenue: number;
    totalBonus: number;
    totalCommission: number;
  } | null>(null);
  const [workingCycleId, setWorkingCycleId] = useState<string | null>(null);
  const [cyclesStored, setCyclesStored] = useState(0);
  const [partnerCyclesPage, setPartnerCyclesPage] = useState(1);
  const [partnerCyclesLimit] = useState(10);
  const [partnerCyclesPagination, setPartnerCyclesPagination] = useState<service.PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [bankActionLoading, setBankActionLoading] = useState(false);
  const [payoutActionLoadingKey, setPayoutActionLoadingKey] = useState<string | null>(null);
  const [partnerStatusLoadingId, setPartnerStatusLoadingId] = useState<string | null>(null);
  const [partnerDeleteLoadingId, setPartnerDeleteLoadingId] = useState<string | null>(null);
  const [completedCycleActionLoadingKey, setCompletedCycleActionLoadingKey] = useState<string | null>(null);
  const [partnersExporting, setPartnersExporting] = useState(false);
  const [cycleReferralsOpen, setCycleReferralsOpen] = useState(false);
  const [cycleReferralsLoading, setCycleReferralsLoading] = useState(false);
  const [cycleReferralsLoadingMore, setCycleReferralsLoadingMore] = useState(false);
  const [cycleReferralsCursor, setCycleReferralsCursor] = useState<string | null>(null);
  const [cycleReferralsStatus, setCycleReferralsStatus] = useState<string>("");
  const [selectedCycleForReferrals, setSelectedCycleForReferrals] =
    useState<service.PartnerCycle | null>(null);
  const [cycleReferrals, setCycleReferrals] = useState<
    service.PartnerCycleReferralsResp["referrals"]
  >([]);
  const [deletedArchives, setDeletedArchives] = useState<service.DeletedPartnerArchive[]>([]);
  const [deletedArchivesLoading, setDeletedArchivesLoading] = useState(false);
  const [deletedArchivesError, setDeletedArchivesError] = useState<string | null>(null);
  const [deletedArchivesQuery, setDeletedArchivesQuery] = useState("");
  const [deletedArchivesPage, setDeletedArchivesPage] = useState(1);
  const [deletedArchivesLimit] = useState(10);
  const [deletedArchivesPagination, setDeletedArchivesPagination] = useState<service.PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [deletedArchiveDetailsOpen, setDeletedArchiveDetailsOpen] = useState(false);
  const [deletedArchiveDetailsLoading, setDeletedArchiveDetailsLoading] = useState(false);
  const [selectedDeletedArchive, setSelectedDeletedArchive] = useState<service.DeletedPartnerArchive | null>(null);

  const fetchPartners = useCallback(
    async (args?: { page?: number; search?: string }) => {
      const nextPage = args?.page ?? 1;
      const nextSearch = args?.search ?? "";

      setPartnersLoading(true);
      setPartnersError(null);
      try {
        const res = await service.fetchSuperAdminPartners({
          page: nextPage,
          limit: partnersLimit,
          search: nextSearch,
        });

        if (!res?.success) throw new Error("Failed to fetch partners");

        setPartners(res.partners || []);
        setPartnersPagination(
          res.pagination || {
            page: nextPage,
            limit: partnersLimit,
            total: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          }
        );
      } catch (err: any) {
        console.error("fetchPartners failed", err);
        setPartnersError(err?.message || "Failed to fetch partners");
      } finally {
        setPartnersLoading(false);
      }
    },
    [partnersLimit]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPartners({ page: partnersPage, search: partnersQuery });
    }, 300);
    return () => clearTimeout(timer);
  }, [partnersPage, partnersQuery, fetchPartners]);

  const fetchCompletedCycles = useCallback(
    async (args?: {
      page?: number;
      search?: string;
      payoutStatus?: "PAID" | "PENDING" | "CANCELLED" | "";
      onlyActionable?: boolean;
    }) => {
      const nextPage = args?.page ?? 1;
      const nextSearch = args?.search ?? "";
      const nextPayoutStatus = args?.payoutStatus ?? "";
      const nextOnlyActionable = args?.onlyActionable ?? false;

      setCompletedCyclesLoading(true);
      setCompletedCyclesError(null);
      try {
        const res = await service.fetchSuperAdminCompletedCycles({
          page: nextPage,
          limit: completedCyclesLimit,
          search: nextSearch,
          payoutStatus: nextPayoutStatus,
          onlyActionable: nextOnlyActionable,
        });

        if (!res?.success) throw new Error("Failed to fetch completed cycles");

        setCompletedCycles(res.cycles || []);
        setCompletedCyclesPagination(
          res.pagination || {
            page: nextPage,
            limit: completedCyclesLimit,
            total: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          }
        );
      } catch (err: any) {
        console.error("fetchCompletedCycles failed", err);
        setCompletedCyclesError(err?.message || "Failed to fetch completed cycles");
      } finally {
        setCompletedCyclesLoading(false);
      }
    },
    [completedCyclesLimit]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompletedCycles({
        page: completedCyclesPage,
        search: completedCyclesQuery,
        payoutStatus: completedCyclesPayoutStatus,
        onlyActionable: completedCyclesOnlyActionable,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [
    completedCyclesPage,
    completedCyclesQuery,
    completedCyclesPayoutStatus,
    completedCyclesOnlyActionable,
    fetchCompletedCycles,
  ]);

  const fetchDeletedArchives = useCallback(
    async (args?: { page?: number; search?: string }) => {
      const nextPage = args?.page ?? 1;
      const nextSearch = args?.search ?? "";

      setDeletedArchivesLoading(true);
      setDeletedArchivesError(null);
      try {
        const res = await service.fetchSuperAdminDeletedPartners({
          page: nextPage,
          limit: deletedArchivesLimit,
          search: nextSearch,
        });

        if (!res?.success) throw new Error("Failed to fetch deleted partner archives");
        setDeletedArchives(res.archives || []);
        setDeletedArchivesPagination(
          res.pagination || {
            page: nextPage,
            limit: deletedArchivesLimit,
            total: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          }
        );
      } catch (err: any) {
        console.error("fetchDeletedArchives failed", err);
        setDeletedArchivesError(err?.message || "Failed to fetch deleted archives");
      } finally {
        setDeletedArchivesLoading(false);
      }
    },
    [deletedArchivesLimit]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDeletedArchives({ page: deletedArchivesPage, search: deletedArchivesQuery });
    }, 300);
    return () => clearTimeout(timer);
  }, [deletedArchivesPage, deletedArchivesQuery, fetchDeletedArchives]);

  const fetchPartnerCycles = useCallback(
    async (partnerId: string, page = 1) => {
      const cycleRes = await service.fetchSuperAdminPartnerCycles(partnerId, {
        page,
        limit: partnerCyclesLimit,
      });

      if (!cycleRes?.success) throw new Error("Failed to fetch partner cycles");

      setPartnerCycles(cycleRes.cycles || []);
      setPartnerCyclesSummary(cycleRes.summary || null);
      setWorkingCycleId(cycleRes.workingCycleId || null);
      setCyclesStored(cycleRes.cyclesStored || 0);
      setPartnerCyclesPage(page);
      setPartnerCyclesPagination(
        cycleRes.pagination || {
          page,
          limit: partnerCyclesLimit,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        }
      );
    },
    [partnerCyclesLimit]
  );

  const openPartnerManager = useCallback(
    async (partnerId: string) => {
      setManagerOpen(true);
      setManagerLoading(true);
      setSelectedPartnerId(partnerId);

      try {
        const [detailRes, bankRes] = await Promise.all([
          service.fetchSuperAdminPartnerDetails(partnerId),
          service.fetchSuperAdminPartnerBank(partnerId),
        ]);

        if (!detailRes?.success) throw new Error("Failed to load partner details");

        setPartnerDetails(detailRes);
        setPartnerBank(bankRes?.bank || null);

        await fetchPartnerCycles(partnerId, 1);
      } catch (err) {
        console.error("openPartnerManager failed", err);
        throw err;
      } finally {
        setManagerLoading(false);
      }
    },
    [fetchPartnerCycles]
  );

  const closePartnerManager = useCallback(() => {
    setManagerOpen(false);
    setSelectedPartnerId(null);
    setPartnerDetails(null);
    setPartnerBank(null);
    setPartnerCycles([]);
    setPartnerCyclesSummary(null);
    setWorkingCycleId(null);
    setCyclesStored(0);
    setPartnerCyclesPage(1);
    setCycleReferralsOpen(false);
    setSelectedCycleForReferrals(null);
    setCycleReferrals([]);
    setCycleReferralsCursor(null);
    setCycleReferralsStatus("");
  }, []);

  const refreshSelectedPartner = useCallback(async () => {
    if (!selectedPartnerId) return;

    const [detailRes, bankRes] = await Promise.all([
      service.fetchSuperAdminPartnerDetails(selectedPartnerId),
      service.fetchSuperAdminPartnerBank(selectedPartnerId),
    ]);

    setPartnerDetails(detailRes || null);
    setPartnerBank(bankRes?.bank || null);
    await fetchPartnerCycles(selectedPartnerId, partnerCyclesPage);
  }, [selectedPartnerId, fetchPartnerCycles, partnerCyclesPage]);

  const verifyPartnerBank = useCallback(
    async (payload: { status: "VERIFIED" | "REJECTED"; rejectionReason?: string }) => {
      if (!selectedPartnerId) throw new Error("Partner not selected");

      setBankActionLoading(true);
      try {
        const res = await service.verifySuperAdminPartnerBank(selectedPartnerId, payload);
        if (!res || res.success === false) throw new Error(res?.message || "Bank verification failed");

        await refreshSelectedPartner();
        await fetchPartners({ page: partnersPage, search: partnersQuery });
        return res;
      } finally {
        setBankActionLoading(false);
      }
    },
    [selectedPartnerId, refreshSelectedPartner, fetchPartners, partnersPage, partnersQuery]
  );

  const markCyclePayout = useCallback(
    async (cycle: service.PartnerCycle, status: "PAID" | "CANCELLED") => {
      if (!selectedPartnerId) throw new Error("Partner not selected");

      const key = `${cycle.start}_${cycle.end}_${status}`;
      setPayoutActionLoadingKey(key);
      try {
        const res = await service.markSuperAdminPartnerCyclePayout(selectedPartnerId, {
          cycleId: cycle.cycleId,
          start: cycle.start,
          end: cycle.end,
          status,
        });

        if (!res || res.success === false) throw new Error(res?.message || "Failed to mark payout");

        await fetchPartnerCycles(selectedPartnerId, partnerCyclesPage);
        await refreshSelectedPartner();
        return res;
      } finally {
        setPayoutActionLoadingKey(null);
      }
    },
    [selectedPartnerId, fetchPartnerCycles, partnerCyclesPage, refreshSelectedPartner]
  );

  const markCompletedCyclePayout = useCallback(
    async (row: service.SuperAdminCompletedCycleRow, status: "PAID" | "CANCELLED") => {
      const partnerId = row.partner?.id;
      if (!partnerId) throw new Error("Partner id missing on cycle");

      const key = `${row.cycleId}_${status}`;
      setCompletedCycleActionLoadingKey(key);
      try {
        const res = await service.markSuperAdminPartnerCyclePayout(partnerId, {
          cycleId: row.cycleId,
          start: row.start,
          end: row.end,
          status,
        });
        if (!res || res.success === false) throw new Error(res?.message || "Failed to mark cycle payout");

        await fetchCompletedCycles({
          page: completedCyclesPage,
          search: completedCyclesQuery,
          payoutStatus: completedCyclesPayoutStatus,
          onlyActionable: completedCyclesOnlyActionable,
        });

        if (selectedPartnerId === partnerId) {
          await fetchPartnerCycles(partnerId, partnerCyclesPage);
        }

        return res;
      } finally {
        setCompletedCycleActionLoadingKey(null);
      }
    },
    [
      fetchCompletedCycles,
      completedCyclesPage,
      completedCyclesQuery,
      completedCyclesPayoutStatus,
      completedCyclesOnlyActionable,
      selectedPartnerId,
      fetchPartnerCycles,
      partnerCyclesPage,
    ]
  );

  const togglePartnerStatus = useCallback(
    async (partnerId: string, isActive: boolean) => {
      setPartnerStatusLoadingId(partnerId);
      try {
        const res = await service.toggleSuperAdminPartnerStatus(partnerId, { isActive });
        if (!res || res.success === false) {
          throw new Error(res?.message || "Failed to update partner status");
        }

        setPartners((prev) =>
          prev.map((p) => (p.id === partnerId ? { ...p, isActive } : p))
        );

        if (selectedPartnerId === partnerId) {
          setPartnerDetails((prev) =>
            prev
              ? {
                  ...prev,
                  partner: {
                    ...prev.partner,
                    isActive,
                  },
                }
              : prev
          );
        }

        return res;
      } finally {
        setPartnerStatusLoadingId(null);
      }
    },
    [selectedPartnerId]
  );

  const deletePartner = useCallback(
    async (partnerId: string, reason?: string) => {
      setPartnerDeleteLoadingId(partnerId);
      try {
        const res = await service.deleteSuperAdminPartner(partnerId, { reason });
        if (!res || res.success === false) {
          throw new Error(res?.message || "Failed to delete partner");
        }

        setPartners((prev) => prev.filter((p) => p.id !== partnerId));

        if (selectedPartnerId === partnerId) {
          closePartnerManager();
        }

        await fetchPartners({ page: partnersPage, search: partnersQuery });
        await fetchDeletedArchives({ page: 1, search: deletedArchivesQuery });
        setDeletedArchivesPage(1);
        return res;
      } finally {
        setPartnerDeleteLoadingId(null);
      }
    },
    [
      selectedPartnerId,
      closePartnerManager,
      fetchPartners,
      partnersPage,
      partnersQuery,
      fetchDeletedArchives,
      deletedArchivesQuery,
    ]
  );

  const openDeletedArchiveDetails = useCallback(async (archiveId: string) => {
    setDeletedArchiveDetailsOpen(true);
    setDeletedArchiveDetailsLoading(true);
    try {
      const res = await service.fetchSuperAdminDeletedPartnerArchiveDetails(archiveId);
      if (!res?.success) throw new Error("Failed to load archive details");
      setSelectedDeletedArchive(res.archive || null);
      return res;
    } finally {
      setDeletedArchiveDetailsLoading(false);
    }
  }, []);

  const closeDeletedArchiveDetails = useCallback(() => {
    setDeletedArchiveDetailsOpen(false);
    setSelectedDeletedArchive(null);
  }, []);

  const partnerCounts = useMemo(
    () => ({
      total: partnersPagination.total,
      verified: partners.filter((p) => p.isVerified).length,
      pendingBank: partners.filter((p) => (p.bankAccount?.status || "PENDING") === "PENDING").length,
      verifiedBank: partners.filter((p) => p.bankAccount?.status === "VERIFIED").length,
    }),
    [partners, partnersPagination.total]
  );

  const counts = useMemo(() => {
    const accepted =
      requestCounts.acceptedFromRequests > 0
        ? requestCounts.acceptedFromRequests
        : partners.filter((p) => p.isVerified).length;
    return {
      total: requestCounts.pending + accepted + requestCounts.rejected,
      pending: requestCounts.pending,
      accepted,
      rejected: requestCounts.rejected,
    };
  }, [requestCounts, partners]);

  const downloadPartnersExcel = useCallback(async () => {
    setPartnersExporting(true);
    try {
      const allPartners: service.SuperAdminPartner[] = [];
      let page = 1;
      let totalPages = 1;

      do {
        const res = await service.fetchSuperAdminPartners({
          page,
          limit: 100,
          search: partnersQuery,
        });

        if (!res?.success) throw new Error("Failed to fetch partners for export");
        allPartners.push(...(res.partners || []));
        totalPages = res.pagination?.totalPages || 1;
        page += 1;
      } while (page <= totalPages);

      const esc = (value: unknown) => {
        const str = value == null ? "" : String(value);
        return `"${str.replace(/"/g, '""')}"`;
      };

      const rows = allPartners.map((p) => [
        p.id,
        p.firstName || "",
        p.lastName || "",
        p.email || "",
        p.mobile || "",
        p.partnerType || "",
        p.specifyCategory || "",
        p.shopName || "",
        p.pincode || "",
        p.address || "",
        p.isVerified ? "Yes" : "No",
        p.isActive ? "Active" : "Inactive",
        p.referralCode || "",
        p.createdAt || "",
        p.cycleAnchor || "",
        p.bankAccount?.status || "PENDING",
        p.bankAccount?.updatedAt || "",
      ]);

      const header = [
        "Partner ID",
        "First Name",
        "Last Name",
        "Email",
        "Mobile",
        "Partner Type",
        "Category",
        "Shop Name",
        "Pincode",
        "Address",
        "Verified",
        "Account Status",
        "Referral Code",
        "Created At",
        "Cycle Anchor",
        "Bank Status",
        "Bank Updated At",
      ];

      const csv = [header, ...rows].map((row) => row.map(esc).join(",")).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      anchor.href = url;
      anchor.download = `partners-export-${stamp}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } finally {
      setPartnersExporting(false);
    }
  }, [partnersQuery]);

  const filteredCycleReferrals = useMemo(() => {
    if (!cycleReferralsStatus) return cycleReferrals;
    return cycleReferrals.filter((r) => r.status === cycleReferralsStatus);
  }, [cycleReferrals, cycleReferralsStatus]);

  const cycleReferralsCounts = useMemo(() => {
    const total = cycleReferrals.length;
    const placed = cycleReferrals.filter((r) => r.status === "PLACED").length;
    const orderAccepted = cycleReferrals.filter((r) => r.status === "ORDER_ACCEPTED").length;
    const sampleCollected = cycleReferrals.filter((r) => r.status === "SAMPLE_COLLECTED").length;
    const inProgress = cycleReferrals.filter((r) => r.status === "IN_PROGRESS").length;
    const reportReady = cycleReferrals.filter((r) => r.status === "REPORT_READY").length;
    const completed = cycleReferrals.filter((r) => r.status === "COMPLETED").length;
    const cancelled = cycleReferrals.filter((r) => r.status === "CANCELLED").length;
    return {
      total,
      placed,
      orderAccepted,
      sampleCollected,
      inProgress,
      reportReady,
      completed,
      cancelled,
    };
  }, [cycleReferrals]);

  const openCycleReferrals = useCallback(
    async (cycle: service.PartnerCycle, statusFilter = "") => {
      if (!selectedPartnerId) throw new Error("Partner not selected");
      if (!cycle.cycleId) throw new Error("Cycle id is missing");

      setSelectedCycleForReferrals(cycle);
      setCycleReferralsStatus(statusFilter);
      setCycleReferralsOpen(true);
      setCycleReferralsLoading(true);
      setCycleReferrals([]);
      setCycleReferralsCursor(null);

      try {
        const res = await service.fetchSuperAdminPartnerCycleReferrals(
          selectedPartnerId,
          cycle.cycleId,
          { limit: 20 }
        );
        if (!res?.success) throw new Error("Failed to load cycle referrals");
        setCycleReferrals(res.referrals || []);
        setCycleReferralsCursor(res.nextCursor || null);
      } finally {
        setCycleReferralsLoading(false);
      }
    },
    [selectedPartnerId]
  );

  const loadMoreCycleReferrals = useCallback(async () => {
    if (!selectedPartnerId || !selectedCycleForReferrals?.cycleId || !cycleReferralsCursor) return;

    setCycleReferralsLoadingMore(true);
    try {
      const res = await service.fetchSuperAdminPartnerCycleReferrals(
        selectedPartnerId,
        selectedCycleForReferrals.cycleId,
        {
          limit: 20,
          cursor: cycleReferralsCursor,
        }
      );
      if (!res?.success) throw new Error("Failed to load more referrals");
      setCycleReferrals((prev) => [...prev, ...(res.referrals || [])]);
      setCycleReferralsCursor(res.nextCursor || null);
    } finally {
      setCycleReferralsLoadingMore(false);
    }
  }, [selectedPartnerId, selectedCycleForReferrals, cycleReferralsCursor, cycleReferralsStatus]);

  const closeCycleReferrals = useCallback(() => {
    setCycleReferralsOpen(false);
    setSelectedCycleForReferrals(null);
    setCycleReferrals([]);
    setCycleReferralsCursor(null);
    setCycleReferralsStatus("");
  }, []);

  return {
    // existing request flow
    items,
    pageItems,
    filtered,
    counts,
    loading,
    error,
    page,
    setPage,
    totalPages,
    pageSize,
    query,
    setQuery,
    selectedStatus,
    setSelectedStatus,
    selected,
    showModal,
    setShowModal,
    openDetails,
    confirmOpen,
    setConfirmOpen,
    confirmLoading,
    pendingAction,
    askConfirm,
    performAction,
    actionLoadingId,
    onboardOpen,
    setOnboardOpen,
    onboardSubmitting,
    onboardSubmit,
    fetchRequests,

    // superadmin partner flow
    partners,
    partnersLoading,
    partnersError,
    partnersQuery,
    setPartnersQuery,
    partnersPage,
    setPartnersPage,
    partnersLimit,
    partnersPagination,
    partnerCounts,
    fetchPartners,
    completedCycles,
    completedCyclesLoading,
    completedCyclesError,
    completedCyclesQuery,
    setCompletedCyclesQuery,
    completedCyclesPage,
    setCompletedCyclesPage,
    completedCyclesPayoutStatus,
    setCompletedCyclesPayoutStatus,
    completedCyclesOnlyActionable,
    setCompletedCyclesOnlyActionable,
    completedCyclesPagination,
    fetchCompletedCycles,

    managerOpen,
    managerLoading,
    openPartnerManager,
    closePartnerManager,
    selectedPartnerId,
    partnerDetails,
    partnerBank,
    partnerCycles,
    partnerCyclesSummary,
    workingCycleId,
    cyclesStored,
    partnerCyclesPage,
    partnerCyclesPagination,
    fetchPartnerCycles,

    bankActionLoading,
    verifyPartnerBank,
    payoutActionLoadingKey,
    markCyclePayout,
    completedCycleActionLoadingKey,
    markCompletedCyclePayout,
    partnerStatusLoadingId,
    togglePartnerStatus,
    partnerDeleteLoadingId,
    deletePartner,
    partnersExporting,
    downloadPartnersExcel,
    deletedArchives,
    deletedArchivesLoading,
    deletedArchivesError,
    deletedArchivesQuery,
    setDeletedArchivesQuery,
    deletedArchivesPage,
    setDeletedArchivesPage,
    deletedArchivesPagination,
    fetchDeletedArchives,
    deletedArchiveDetailsOpen,
    deletedArchiveDetailsLoading,
    selectedDeletedArchive,
    openDeletedArchiveDetails,
    closeDeletedArchiveDetails,
    cycleReferralsOpen,
    cycleReferralsLoading,
    cycleReferralsLoadingMore,
    cycleReferralsCursor,
    cycleReferralsStatus,
    setCycleReferralsStatus,
    selectedCycleForReferrals,
    cycleReferrals,
    filteredCycleReferrals,
    cycleReferralsCounts,
    openCycleReferrals,
    loadMoreCycleReferrals,
    closeCycleReferrals,
  } as const;
}

export default usePartnerRequests;

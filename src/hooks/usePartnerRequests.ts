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

  const counts = useMemo(
    () => ({
      total: items.length,
      pending: items.filter((i) => i.status === "PENDING").length,
      accepted: items.filter((i) => i.status === "ACCEPTED").length,
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

  const [managerOpen, setManagerOpen] = useState(false);
  const [managerLoading, setManagerLoading] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [partnerDetails, setPartnerDetails] = useState<service.PartnerDetailsResp | null>(null);
  const [partnerBank, setPartnerBank] = useState<service.PartnerBank | null>(null);
  const [partnerCycles, setPartnerCycles] = useState<service.PartnerCycle[]>([]);
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

  const fetchPartnerCycles = useCallback(
    async (partnerId: string, page = 1) => {
      const cycleRes = await service.fetchSuperAdminPartnerCycles(partnerId, {
        page,
        limit: partnerCyclesLimit,
      });

      if (!cycleRes?.success) throw new Error("Failed to fetch partner cycles");

      setPartnerCycles(cycleRes.cycles || []);
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
    setPartnerCyclesPage(1);
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

  const partnerCounts = useMemo(
    () => ({
      total: partnersPagination.total,
      verified: partners.filter((p) => p.isVerified).length,
      pendingBank: partners.filter((p) => (p.bankAccount?.status || "PENDING") === "PENDING").length,
      verifiedBank: partners.filter((p) => p.bankAccount?.status === "VERIFIED").length,
    }),
    [partners, partnersPagination.total]
  );

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

    managerOpen,
    managerLoading,
    openPartnerManager,
    closePartnerManager,
    selectedPartnerId,
    partnerDetails,
    partnerBank,
    partnerCycles,
    partnerCyclesPage,
    partnerCyclesPagination,
    fetchPartnerCycles,

    bankActionLoading,
    verifyPartnerBank,
    payoutActionLoadingKey,
    markCyclePayout,
    partnerStatusLoadingId,
    togglePartnerStatus,
  } as const;
}

export default usePartnerRequests;

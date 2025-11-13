// src/hooks/usePartnerRequests.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import * as service from "../services/partnersService";

export type { PartnerRequest, OnboardForm } from "../services/partnersService";

/**
 * usePartnerRequests
 * - Encapsulates state and actions for PartnerRequests page.
 * - Keeps UI/component files thin.
 */
export function usePartnerRequests() {
  // core data
  const [items, setItems] = useState<service.PartnerRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // action state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // UI / filtering / paging
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [selectedStatus, setSelectedStatus] = useState<
    "ALL" | "PENDING" | "ACCEPTED" | "REJECTED"
  >("ALL");

  // modal & confirm state
  const [selected, setSelected] = useState<service.PartnerRequest | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    { id: string; type: "approve" | "reject"; name?: string } | null
  >(null);

  // onboard modal state
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [onboardSubmitting, setOnboardSubmitting] = useState(false);

  // Fetch requests from service
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

  // derived: filtered + paginated
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items;
    if (selectedStatus !== "ALL") {
      list = list.filter((it) => it.status === selectedStatus);
    }
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

  // counts
  const counts = useMemo(
    () => ({
      total: items.length,
      pending: items.filter((i) => i.status === "PENDING").length,
      accepted: items.filter((i) => i.status === "ACCEPTED").length,
      rejected: items.filter((i) => i.status === "REJECTED").length,
    }),
    [items]
  );

  // UI helpers
  const openDetails = useCallback((r: service.PartnerRequest) => {
    setSelected(r);
    setShowModal(true);
  }, []);

  const askConfirm = useCallback((id: string, type: "approve" | "reject", name?: string) => {
    setPendingAction({ id, type, name });
    setConfirmOpen(true);
  }, []);

  // perform approve/reject via service, update UI state optimistically on success
  const performAction = useCallback(
    async (id: string, type: "approve" | "reject") => {
      setConfirmLoading(true);
      setActionLoadingId(id);
      try {
        const res = type === "approve"
          ? await service.approvePartnerRequest(id)
          : await service.rejectPartnerRequest(id);

        if (!res || res.success === false) {
          throw new Error(res?.message || `${type} failed`);
        }

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

  // onboard (create partner request)
  const onboardSubmit = useCallback(async (data: service.OnboardForm) => {
    setOnboardSubmitting(true);
    try {
      const json = await service.createPartnerOnboard(data);
      if (!json || json.success === false) {
        throw new Error(json?.message || "Onboarding failed");
      }

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
      };

      // optimistic append
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

  return {
    // data
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

    // ui
    query,
    setQuery,
    selectedStatus,
    setSelectedStatus,

    // modals
    selected,
    showModal,
    setShowModal,
    openDetails,

    // confirm modal
    confirmOpen,
    setConfirmOpen,
    confirmLoading,
    pendingAction,
    askConfirm,
    performAction,
    actionLoadingId,

    // onboard
    onboardOpen,
    setOnboardOpen,
    onboardSubmitting,
    onboardSubmit,

    // helpers
    fetchRequests,
  } as const;
}

export default usePartnerRequests;

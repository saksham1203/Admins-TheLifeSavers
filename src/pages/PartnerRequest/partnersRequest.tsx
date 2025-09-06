// PartnersRequestPage.tsx (improved)
import React, { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaSearch,
  FaSyncAlt,
  FaUserCheck,
  FaUserTimes,
  FaEye,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

/**
 * Improved PartnersRequestPage
 * - Modernized header with stats
 * - Search with clear button
 * - Status tabs (All / Pending / Accepted / Rejected)
 * - Responsive card list on small screens + table on larger screens
 * - Better action buttons, avatars, subtle shadows and transitions
 * - Preserves existing API contract and behaviour
 */

// ----------------- Small UI helpers -----------------
const pill = (text: string, cls = "bg-red-100 text-red-700 border-red-200") => (
  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}
  >
    {text}
  </span>
);

const SectionCard: React.FC<{
  title: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}> = ({ title, right, className, children }) => (
  <div
    className={`rounded-2xl border border-red-100 bg-white/90 backdrop-blur shadow-sm p-0 overflow-hidden ${
      className ?? ""
    }`}
  >
    <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-r from-red-50/90 to-red-100/90">
      <h3 className="text-sm sm:text-base font-bold text-red-700 flex items-center gap-2">
        {title}
      </h3>
      {right}
    </div>
    <div className="p-4 sm:p-6">{children}</div>
  </div>
);

// ----------------- Confirm Modal -----------------
const ConfirmModal: React.FC<{
  open: boolean;
  title?: string;
  message?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({
  open,
  title = "Confirm",
  message = "",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-full bg-gray-100 px-4 py-2 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-full bg-red-600 text-white px-4 py-2 font-semibold hover:bg-red-700"
          >
            {loading ? "Working..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------- Types -----------------
type PartnerRequest = {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  dob?: string;
  gender?: string;
  partnerType?: string;
  specifyCategory?: string | null;
  shopName?: string;
  pincode?: string;
  address?: string;
  status?: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt?: string;
  updatedAt?: string;
};

type ApiListResp = {
  success: boolean;
  requests: PartnerRequest[];
};

// ----------------- Helpers -----------------
function readTokenFromLocalStorage(): string | null {
  return (
    localStorage.getItem("token") || localStorage.getItem("authToken") || null
  );
}

function fmtDateIST(iso?: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  } catch {
    return iso;
  }
}

function initials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// ----------------- Component -----------------
const PartnersRequestPage: React.FC = () => {
  const navigate = useNavigate();

  // state
  const [items, setItems] = useState<PartnerRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [, setError] = useState<string | null>(null);

  // UI controls
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [selectedStatus, setSelectedStatus] = useState<
    "ALL" | "PENDING" | "ACCEPTED" | "REJECTED"
  >("ALL");

  // detail modal
  const [selected, setSelected] = useState<PartnerRequest | null>(null);
  const [showModal, setShowModal] = useState(false);

  // confirm modal for approve/reject
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    type: "approve" | "reject";
    name?: string;
  } | null>(null);

  // fetch requests from your endpoint
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = readTokenFromLocalStorage();
      const res = await fetch(
        "https://dev-service-thelifesavers-in.onrender.com/api/partner-admin/requests",
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
      }

      const json = (await res.json()) as ApiListResp;
      if (!json.success) {
        throw new Error("API returned success: false");
      }

      setItems(json.requests ?? []);
      setPage(1);
    } catch (err: any) {
      console.error("Failed to fetch partner requests", err);
      setError(err?.message ?? "Failed to fetch");
      toast.error("Failed to fetch partner requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived: filtered + paginated + status
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

  // perform approve/reject action (with confirm modal + toast)
  const performAction = async (id: string, type: "approve" | "reject") => {
    setConfirmLoading(true);
    setActionLoadingId(id);
    try {
      const token = readTokenFromLocalStorage();
      const res = await fetch(
        `https://dev-service-thelifesavers-in.onrender.com/api/partner-admin/requests/${id}/${
          type === "approve" ? "approve" : "reject"
        }`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.message || `${type} failed`);

      // update UI status
      setItems((prev) =>
        prev.map((it) =>
          it.id === id
            ? { ...it, status: type === "approve" ? "ACCEPTED" : "REJECTED" }
            : it
        )
      );
      toast.success(
        data.message ?? (type === "approve" ? "Approved" : "Rejected")
      );
    } catch (err: any) {
      console.error(`${type} failed`, err);
      toast.error(
        `${type === "approve" ? "Approve" : "Reject"} failed: ${
          err?.message ?? "Unknown"
        }`
      );
    } finally {
      setConfirmLoading(false);
      setActionLoadingId(null);
      setConfirmOpen(false);
      setPendingAction(null);
    }
  };

  // ask confirm instead of window.confirm
  const askConfirm = (id: string, type: "approve" | "reject", name?: string) => {
    setPendingAction({ id, type, name });
    setConfirmOpen(true);
  };

  const openDetails = (r: PartnerRequest) => {
    setSelected(r);
    setShowModal(true);
  };

  const counts = useMemo(() => {
    return {
      total: items.length,
      pending: items.filter((i) => i.status === "PENDING").length,
      accepted: items.filter((i) => i.status === "ACCEPTED").length,
      rejected: items.filter((i) => i.status === "REJECTED").length,
    };
  }, [items]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-6" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
      <Toaster position="top-right" />

      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white rounded-2xl p-5 shadow-lg mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-red-600/70 hover:bg-red-700 rounded-full shadow transition"
                aria-label="Back"
              >
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold">Partner Requests</h1>
                <div className="text-sm text-white/90">Review and manage partner onboarding</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setQuery(""); setPage(1); fetchRequests(); }}
                className="rounded-full bg-white/20 hover:bg-white/30 text-white px-3 py-2 text-sm font-semibold flex items-center gap-2 transition"
              >
                <FaSyncAlt />
                Refresh
              </button>
            </div>
          </div>

          {/* stats */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/10 rounded-xl p-3 flex flex-col">
              <div className="text-xs text-white/90">Total</div>
              <div className="text-lg font-bold">{counts.total}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 flex flex-col">
              <div className="text-xs text-white/90">Pending</div>
              <div className="text-lg font-bold">{counts.pending}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 flex flex-col">
              <div className="text-xs text-white/90">Accepted</div>
              <div className="text-lg font-bold">{counts.accepted}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 flex flex-col">
              <div className="text-xs text-white/90">Rejected</div>
              <div className="text-lg font-bold">{counts.rejected}</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-10 pr-10 py-2 rounded-full border bg-white/90"
                placeholder="Search by name, email, phone or shop"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') setPage(1); }}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
                  title="Clear"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <div>Showing <span className="font-semibold">{filtered.length}</span> requests</div>
            </div>
          </div>

          {/* status tabs */}
          <div className="flex items-center gap-2 overflow-auto">
            {(["ALL", "PENDING", "ACCEPTED", "REJECTED"] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setSelectedStatus(s as any); setPage(1); }}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition ${selectedStatus === s ? "bg-red-600 text-white" : "bg-white border"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <SectionCard title={<span className="flex items-center gap-2">Requests</span>} right={<div className="text-xs text-gray-500">Actions: Approve / Reject</div>}>
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading requests…</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No requests available.
              <div className="mt-3">
                <button onClick={fetchRequests} className="rounded-full bg-red-600 text-white px-4 py-2">Reload</button>
              </div>
            </div>
          ) : (
            <>
              {/* table for large screens */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-red-50 to-red-100 text-red-700">
                      <th className="px-4 py-2 text-left font-semibold">Name</th>
                      <th className="px-4 py-2 text-left font-semibold">Shop / Type</th>
                      <th className="px-4 py-2 text-left font-semibold">Contact</th>
                      <th className="px-4 py-2 text-left font-semibold">Submitted</th>
                      <th className="px-4 py-2 text-left font-semibold">Status</th>
                      <th className="px-4 py-2 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((r) => (
                      <tr key={r.id} className="odd:bg-white even:bg-gray-50 hover:bg-red-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold">{initials(`${r.firstName} ${r.lastName ?? ""}`)}</div>
                            <div>
                              <div className="font-medium">{r.firstName} {r.lastName ?? ""}</div>
                              <div className="text-xs text-gray-500">{r.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{r.shopName ?? "—"}</div>
                          <div className="text-xs text-gray-500">{r.partnerType ?? "—"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{r.mobile ?? "—"}</div>
                          <div className="text-xs text-gray-500">{r.pincode ?? ""}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{fmtDateIST(r.createdAt)}</td>
                        <td className="px-4 py-3">
                          {r.status === "PENDING" ? pill("Pending", "bg-amber-50 text-amber-700 border-amber-200") : r.status === "ACCEPTED" ? pill("Accepted", "bg-green-50 text-green-700 border-green-200") : pill("Rejected", "bg-gray-50 text-gray-700 border-gray-200")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button title="View details" onClick={() => openDetails(r)} className="rounded-full border px-3 py-1 text-xs hover:bg-red-50">
                              <FaEye />
                            </button>

                            {r.status === "PENDING" ? (
                              <>
                                <button onClick={() => askConfirm(r.id, "approve", `${r.firstName} ${r.lastName ?? ""}`)} disabled={actionLoadingId === r.id} className="rounded-full bg-green-600 text-white px-3 py-1 text-xs font-semibold hover:bg-green-700">
                                  {actionLoadingId === r.id ? "..." : (<><FaUserCheck className="inline mr-1" />Approve</>)}
                                </button>
                                <button onClick={() => askConfirm(r.id, "reject", `${r.firstName} ${r.lastName ?? ""}`)} disabled={actionLoadingId === r.id} className="rounded-full bg-white border px-3 py-1 text-xs font-semibold hover:bg-red-50">
                                  {actionLoadingId === r.id ? "..." : (<><FaUserTimes className="inline mr-1" />Reject</>)}
                                </button>
                              </>
                            ) : (
                              <div className="text-xs text-gray-500">{r.status}</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* card list for small screens */}
              <div className="md:hidden space-y-3">
                {pageItems.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl p-3 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold">{initials(`${r.firstName} ${r.lastName ?? ""}`)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="font-medium">{r.firstName} {r.lastName ?? ""}</div>
                            <div className="text-xs text-gray-500">{r.shopName ?? "—"}</div>
                          </div>
                          <div className="text-xs text-gray-500">{fmtDateIST(r.createdAt)}</div>
                        </div>

                        <div className="mt-2 text-sm text-gray-600">{r.email ?? "—"} • {r.mobile ?? "—"}</div>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div>{r.status === "PENDING" ? pill("Pending", "bg-amber-50 text-amber-700 border-amber-200") : r.status === "ACCEPTED" ? pill("Accepted", "bg-green-50 text-green-700 border-green-200") : pill("Rejected", "bg-gray-50 text-gray-700 border-gray-200")}</div>

                          <div className="flex items-center gap-2">
                            <button onClick={() => openDetails(r)} className="rounded-full border px-3 py-1 text-xs">View</button>
                            {r.status === "PENDING" && (
                              <>
                                <button onClick={() => askConfirm(r.id, "approve", `${r.firstName} ${r.lastName ?? ""}`)} className="rounded-full bg-green-600 text-white px-3 py-1 text-xs">Approve</button>
                                <button onClick={() => askConfirm(r.id, "reject", `${r.firstName} ${r.lastName ?? ""}`)} className="rounded-full bg-white border px-3 py-1 text-xs">Reject</button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">Page {page} of {totalPages}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { if (page > 1) setPage(page - 1); }} className="rounded-full border px-3 py-1 text-sm" disabled={page <= 1}>Prev</button>
                  <button onClick={() => { if (page < totalPages) setPage(page + 1); }} className="rounded-full border px-3 py-1 text-sm" disabled={page >= totalPages}>Next</button>
                </div>
              </div>
            </>
          )}
        </SectionCard>
      </div>

      {/* Details modal */}
      {showModal && selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 rounded-full bg-red-50 hover:bg-red-100">✕</button>
            <h3 className="text-xl font-bold mb-2">Request details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Name</div>
                <div className="font-medium">{selected.firstName} {selected.lastName}</div>
                <div className="text-sm text-gray-500 mt-2">Shop</div>
                <div>{selected.shopName ?? "—"}</div>
                <div className="text-sm text-gray-500 mt-2">Type</div>
                <div>{selected.partnerType ?? "—"}</div>
                <div className="text-sm text-gray-500 mt-2">Category</div>
                <div>{selected.specifyCategory ?? "—"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Contact</div>
                <div>{selected.email ?? "—"}</div>
                <div className="text-sm text-gray-500 mt-2">Mobile</div>
                <div>{selected.mobile ?? "—"}</div>
                <div className="text-sm text-gray-500 mt-2">Address</div>
                <div className="text-sm">{selected.address ?? "—"}</div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
              {selected.status === "PENDING" && (
                <>
                  <button onClick={() => { setShowModal(false); askConfirm(selected.id, "approve", `${selected.firstName} ${selected.lastName ?? ""}`); }} className="rounded-full bg-green-600 text-white px-4 py-2 font-semibold hover:bg-green-700">Approve</button>
                  <button onClick={() => { setShowModal(false); askConfirm(selected.id, "reject", `${selected.firstName} ${selected.lastName ?? ""}`); }} className="rounded-full bg-white border px-4 py-2 font-semibold hover:bg-red-50">Reject</button>
                </>
              )}
              <button onClick={() => setShowModal(false)} className="rounded-full bg-gray-100 px-4 py-2 font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      <ConfirmModal
        open={confirmOpen}
        loading={confirmLoading}
        title={pendingAction ? pendingAction.type === "approve" ? "Approve partner" : "Reject partner" : "Confirm"}
        message={pendingAction ? `Are you sure you want to ${pendingAction.type} ${pendingAction.name ?? "this partner"}?` : ""}
        onConfirm={() => { if (pendingAction) performAction(pendingAction.id, pendingAction.type); }}
        onCancel={() => { setConfirmOpen(false); setPendingAction(null); }}
      />
    </div>
  );
};

export default PartnersRequestPage;

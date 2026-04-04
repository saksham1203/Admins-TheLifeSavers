// src/pages/PartnersRequestPage.tsx
import React from "react";
import { FaArrowLeft, FaSearch, FaSyncAlt, FaUserCheck, FaUserTimes, FaEye, FaTimes, FaPlus, FaSpinner, FaMoneyBillWave, FaUniversity, FaDownload, FaArchive } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { usePartnerRequests } from "../../hooks/usePartnerRequests";
import type { OnboardForm } from "../../services/partnersService";

/**
 * PartnersRequestPage
 * UI-only page that uses usePartnerRequests hook.
 */

// ----------------- Small UI helpers -----------------
const pill = (text: string, cls = "bg-red-100 text-red-700 border-red-200") => (
  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}>{text}</span>
);

const SectionCard: React.FC<{
  title: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}> = ({ title, right, className, children }) => (
  <div className={`rounded-2xl border border-red-100 bg-white/90 backdrop-blur shadow-sm p-0 overflow-hidden ${className ?? ""}`}>
    <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-r from-red-50/90 to-red-100/90">
      <h3 className="text-sm sm:text-base font-bold text-red-700 flex items-center gap-2">{title}</h3>
      {right}
    </div>
    <div className="p-3 sm:p-6">{children}</div>
  </div>
);

function fmtDateIST(iso?: string) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  } catch {
    return iso;
  }
}

function fmtMoney(n?: number) {
  return Number(n || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
}

function cleanText(value?: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return "-";

  const normalized = raw
    .replace(/Â/g, "")
    .replace(/â€”|—/g, "-")
    .trim();

  if (!normalized || normalized === "-") return "-";
  if (/^[\uFFFD\-]+$/.test(normalized)) return "-";
  return normalized;
}

function initials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const MODAL_HEADER_HEIGHT = 64; // px (approx)
const modalBackdropCls = "fixed inset-0 bg-slate-900/60 backdrop-blur-[3px] flex items-center justify-center z-50 p-4";
const modalShellCls = "w-full rounded-[24px] border border-red-100 bg-white shadow-[0_30px_80px_-20px_rgba(220,38,38,0.45)] overflow-hidden";
const modalHeaderCls = "flex-none bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white py-4 px-5 sm:px-7 relative border-b border-white/20";
const modalCloseBtnCls = "absolute top-3 right-3 h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold transition";
const modalBodyCls = "flex-1 overflow-auto bg-gradient-to-b from-white to-red-50/40 p-5 sm:p-7";
const modalCardCls = "rounded-2xl border border-red-100 bg-white p-5 shadow-[0_12px_30px_-18px_rgba(239,68,68,0.55)]";
const statCardCls = "rounded-xl border border-red-100 bg-red-50/60 px-3 py-2 text-xs";

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 py-1.5">
    <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
    <div className="text-sm font-medium text-gray-800 break-words">{value}</div>
  </div>
);

// ----------------- Page -----------------
const PartnersRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const hook = usePartnerRequests();

  // react-hook-form for onboard
  const { register, handleSubmit, reset, formState } = useForm<OnboardForm>({
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      mobile: "",
      dob: "",
      gender: "",
      partnerType: "chemist",
      shopName: "",
      pincode: "",
      address: "",
      isAdmin: false, // ðŸ‘ˆ ADD THIS
    },
  });

  // wrapper: perform confirm action and show toast
  const confirmAndPerform = async () => {
    if (!hook.pendingAction) return;
    try {
      await hook.performAction(hook.pendingAction.id, hook.pendingAction.type);
      toast.success(hook.pendingAction.type === "approve" ? "Approved" : "Rejected");
    } catch (err: any) {
      toast.error(err?.message || "Action failed");
    }
  };

  const onboardSubmit = async (data: OnboardForm) => {
    try {
      await hook.onboardSubmit(data);
      toast.success("Partner request submitted. Awaiting SuperAdmin review.");
      reset();
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit partner request");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 sm:p-6" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
      <Toaster position="top-right" />

      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-600 to-red-600 text-white rounded-2xl p-4 sm:p-5 shadow-lg mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button onClick={() => navigate(-1)} className="p-2 bg-red-600/70 hover:bg-red-700 rounded-full shadow transition" aria-label="Back">
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-extrabold">Partner Requests</h1>
                <div className="text-xs sm:text-sm text-white/90">Review and manage partner onboarding</div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    hook.setQuery("");
                    hook.setPage(1);
                    hook.fetchRequests();
                    hook.fetchPartners({ page: hook.partnersPage, search: hook.partnersQuery });
                  }}
                  className="rounded-full bg-white/20 hover:bg-white/30 text-white px-3 py-2 text-xs sm:text-sm font-semibold flex items-center gap-2 transition"
                >
                  <FaSyncAlt />
                  <span>Refresh</span>
                </button>

                <button onClick={() => hook.setOnboardOpen(true)} className="ml-0 sm:ml-2 inline-flex items-center gap-2 bg-white text-red-600 font-semibold px-3 sm:px-4 py-2 rounded-full shadow hover:shadow-md text-xs sm:text-sm">
                  <FaPlus />
                  <span>New Partner</span>
                </button>
              </div>
            </div>
          </div>

          {/* stats */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3">
            <div className="bg-white/10 rounded-xl p-2 sm:p-3 flex flex-col">
              <div className="text-xs text-white/90">Total</div>
              <div className="text-lg font-bold">{hook.counts.total}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-2 sm:p-3 flex flex-col">
              <div className="text-xs text-white/90">Pending</div>
              <div className="text-lg font-bold">{hook.counts.pending}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-2 sm:p-3 flex flex-col">
              <div className="text-xs text-white/90">Accepted</div>
              <div className="text-lg font-bold">{hook.counts.accepted}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-2 sm:p-3 flex flex-col">
              <div className="text-xs text-white/90">Rejected</div>
              <div className="text-lg font-bold">{hook.counts.rejected}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-2 sm:p-3 flex flex-col">
              <div className="text-xs text-white/90">Deleted</div>
              <div className="text-lg font-bold">{hook.deletedArchivesPagination.total}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-2 sm:p-3 flex flex-col">
              <div className="text-xs text-white/90">Archived</div>
              <div className="text-lg font-bold">{hook.deletedArchivesPagination.total}</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-10 pr-10 py-2 rounded-full border bg-white/90 text-sm"
                placeholder="Search by name, email, phone or shop"
                value={hook.query}
                onChange={(e) => hook.setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") hook.setPage(1); }}
              />
              {hook.query && (
                <button onClick={() => hook.setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100" title="Clear">
                  <FaTimes />
                </button>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 ml-3">
              <div>Showing <span className="font-semibold">{hook.filtered.length}</span> requests</div>
            </div>
          </div>

          {/* status tabs */}
          <div className="flex items-center gap-2 overflow-auto mt-2 sm:mt-0">
            {(["ALL", "PENDING", "ACCEPTED", "REJECTED"] as const).map((s) => (
              <button
                key={s}
                onClick={() => { hook.setSelectedStatus(s as any); hook.setPage(1); }}
                className={`rounded-full px-3 py-2 text-xs sm:text-sm font-semibold transition ${hook.selectedStatus === s ? "bg-red-600 text-white" : "bg-white border"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <SectionCard title={<span className="flex items-center gap-2">Requests</span>} right={<div className="text-xs text-gray-500">Actions: Approve / Reject</div>}>
          {hook.loading ? (
            <div className="py-12 text-center text-gray-500">Loading requestsâ€¦</div>
          ) : hook.items.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No requests available.
              <div className="mt-3">
                <button onClick={() => hook.fetchRequests()} className="rounded-full bg-red-600 text-white px-4 py-2">Reload</button>
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
                    {hook.pageItems.map((r) => (
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
                          <div className="text-sm">{r.shopName ?? "â€”"}</div>
                          <div className="text-xs text-gray-500">{r.partnerType ?? "â€”"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{r.mobile ?? "â€”"}</div>
                          <div className="text-xs text-gray-500">{r.pincode ?? ""}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{fmtDateIST(r.createdAt)}</td>
                        <td className="px-4 py-3">
                          {r.status === "PENDING" ? pill("Pending", "bg-amber-50 text-amber-700 border-amber-200") : r.status === "ACCEPTED" ? pill("Accepted", "bg-green-50 text-green-700 border-green-200") : pill("Rejected", "bg-gray-50 text-gray-700 border-gray-200")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            <button title="View details" onClick={() => hook.openDetails(r)} className="rounded-full border px-2 py-1 text-xs hover:bg-red-50">
                              <FaEye />
                            </button>

                            {r.status === "PENDING" ? (
                              <>
                                <button onClick={() => hook.askConfirm(r.id, "approve", `${r.firstName} ${r.lastName ?? ""}`)} disabled={hook.actionLoadingId === r.id} className="rounded-full bg-green-600 text-white px-3 py-1 text-xs font-semibold hover:bg-green-700">
                                  {hook.actionLoadingId === r.id ? "..." : (<><FaUserCheck className="inline mr-1" />Approve</>)}
                                </button>
                                <button onClick={() => hook.askConfirm(r.id, "reject", `${r.firstName} ${r.lastName ?? ""}`)} disabled={hook.actionLoadingId === r.id} className="rounded-full bg-white border px-3 py-1 text-xs font-semibold hover:bg-red-50">
                                  {hook.actionLoadingId === r.id ? "..." : (<><FaUserTimes className="inline mr-1" />Reject</>)}
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
                {hook.pageItems.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl p-3 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-sm">{initials(`${r.firstName} ${r.lastName ?? ""}`)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">{r.firstName} {r.lastName ?? ""}</div>
                            <div className="text-xs text-gray-500 truncate">{r.shopName ?? "â€”"}</div>
                          </div>
                          <div className="text-xs text-gray-500">{fmtDateIST(r.createdAt)}</div>
                        </div>

                        <div className="mt-2 text-sm text-gray-600 truncate">{r.email ?? "â€”"} â€¢ {r.mobile ?? "â€”"}</div>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div>{r.status === "PENDING" ? pill("Pending", "bg-amber-50 text-amber-700 border-amber-200") : r.status === "ACCEPTED" ? pill("Accepted", "bg-green-50 text-green-700 border-green-200") : pill("Rejected", "bg-gray-50 text-gray-700 border-gray-200")}</div>

                          <div className="flex items-center gap-2">
                            <button onClick={() => hook.openDetails(r)} className="rounded-full border px-3 py-1 text-xs">View</button>
                            {r.status === "PENDING" && (
                              <>
                                <button onClick={() => hook.askConfirm(r.id, "approve", `${r.firstName} ${r.lastName ?? ""}`)} className="rounded-full bg-green-600 text-white px-3 py-1 text-xs">Approve</button>
                                <button onClick={() => hook.askConfirm(r.id, "reject", `${r.firstName} ${r.lastName ?? ""}`)} className="rounded-full bg-white border px-3 py-1 text-xs">Reject</button>
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
              <div className="mt-4 flex items-center justify-between flex-col sm:flex-row gap-3">
                <div className="text-sm text-gray-500">Page {hook.page} of {hook.totalPages}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { if (hook.page > 1) hook.setPage(hook.page - 1); }} className="rounded-full border px-3 py-1 text-sm" disabled={hook.page <= 1}>Prev</button>
                  <button onClick={() => { if (hook.page < hook.totalPages) hook.setPage(hook.page + 1); }} className="rounded-full border px-3 py-1 text-sm" disabled={hook.page >= hook.totalPages}>Next</button>
                </div>
              </div>
            </>
          )}
        </SectionCard>
        <div className="h-6" />

        <SectionCard title={<span className="flex items-center gap-2">Partners Management</span>} right={<div className="text-xs text-gray-500">Actions: Activate / Deactivate, Bank Verify, Payout</div>}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative w-full sm:w-80">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="w-full pl-10 pr-10 py-2 rounded-full border bg-white/90 text-sm" placeholder="Search partners" value={hook.partnersQuery} onChange={(e) => { hook.setPartnersQuery(e.target.value); hook.setPartnersPage(1); }} />
              </div>
              <button
                onClick={async () => {
                  try {
                    await hook.downloadPartnersExcel();
                    toast.success("Partners file downloaded");
                  } catch (err: any) {
                    toast.error(err?.message || "Failed to download partners file");
                  }
                }}
                disabled={hook.partnersExporting}
                className="inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold hover:bg-red-50 disabled:opacity-60"
              >
                {hook.partnersExporting ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                <span>{hook.partnersExporting ? "Preparing..." : "Download Excel"}</span>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
              <div className="rounded-lg bg-gray-50 border px-3 py-2 text-xs">Total: <span className="font-semibold">{hook.partnerCounts.total}</span></div>
              <div className="rounded-lg bg-gray-50 border px-3 py-2 text-xs">Verified: <span className="font-semibold">{hook.partnerCounts.verified}</span></div>
              <div className="rounded-lg bg-gray-50 border px-3 py-2 text-xs">Bank Pending: <span className="font-semibold">{hook.partnerCounts.pendingBank}</span></div>
              <div className="rounded-lg bg-gray-50 border px-3 py-2 text-xs">Bank Verified: <span className="font-semibold">{hook.partnerCounts.verifiedBank}</span></div>
            </div>
          </div>

          {hook.partnersLoading ? (
            <div className="py-10 text-center text-gray-500">Loading partners...</div>
          ) : hook.partners.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No partners found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-red-50 to-red-100 text-red-700">
                    <th className="px-4 py-2 text-left font-semibold">Partner</th>
                    <th className="px-4 py-2 text-left font-semibold">Shop / Referral</th>
                    <th className="px-4 py-2 text-left font-semibold">Bank</th>
                    <th className="px-4 py-2 text-left font-semibold">Account</th>
                    <th className="px-4 py-2 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {hook.partners.map((p) => (
                    <tr key={p.id} className="odd:bg-white even:bg-gray-50 hover:bg-red-50 transition">
                      <td className="px-4 py-3"><div className="font-medium">{p.firstName} {p.lastName ?? ""}</div><div className="text-xs text-gray-500">{p.email ?? "-"} • {p.mobile ?? "-"}</div></td>
                      <td className="px-4 py-3"><div>{p.shopName ?? "-"}</div><div className="text-xs text-gray-500">{p.referralCode || "No Referral"}</div></td>
                      <td className="px-4 py-3">{p.bankAccount?.status === "VERIFIED" ? pill("Verified", "bg-green-50 text-green-700 border-green-200") : p.bankAccount?.status === "REJECTED" ? pill("Rejected", "bg-gray-50 text-gray-700 border-gray-200") : pill("Pending", "bg-amber-50 text-amber-700 border-amber-200")}</td>
                      <td className="px-4 py-3">{p.isActive ? pill("Active", "bg-green-50 text-green-700 border-green-200") : pill("Inactive", "bg-gray-50 text-gray-700 border-gray-200")}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button className="rounded-full bg-red-600 text-white px-3 py-1 text-xs font-semibold hover:bg-red-700" onClick={async () => { try { await hook.openPartnerManager(p.id); } catch (err: any) { toast.error(err?.message || "Failed to load partner details"); } }}>Manage</button>
                          <button
                            className="rounded-full border px-3 py-1 text-xs font-semibold hover:bg-red-50 disabled:opacity-60"
                            disabled={hook.partnerStatusLoadingId === p.id}
                            onClick={async () => {
                              try {
                                await hook.togglePartnerStatus(p.id, !p.isActive);
                                toast.success(`Partner ${!p.isActive ? "activated" : "deactivated"} successfully`);
                              } catch (err: any) {
                                toast.error(err?.message || "Failed to update partner status");
                              }
                            }}
                          >
                            {hook.partnerStatusLoadingId === p.id ? "..." : p.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            className="rounded-full border border-red-200 text-red-700 px-3 py-1 text-xs font-semibold hover:bg-red-50 disabled:opacity-60"
                            disabled={hook.partnerDeleteLoadingId === p.id}
                            onClick={async () => {
                              const confirmed = window.confirm(
                                "Delete this partner permanently? All associated partner records will be archived first."
                              );
                              if (!confirmed) return;
                              const reason = window.prompt("Reason for deletion (optional)") || undefined;
                              try {
                                await hook.deletePartner(p.id, reason);
                                toast.success("Partner deleted and archived");
                              } catch (err: any) {
                                toast.error(err?.message || "Failed to delete partner");
                              }
                            }}
                          >
                            {hook.partnerDeleteLoadingId === p.id ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button onClick={() => { if (hook.partnersPagination.hasPrevPage) hook.setPartnersPage(hook.partnersPage - 1); }} className="rounded-full border px-3 py-1 text-sm" disabled={!hook.partnersPagination.hasPrevPage}>Prev</button>
                <button onClick={() => { if (hook.partnersPagination.hasNextPage) hook.setPartnersPage(hook.partnersPage + 1); }} className="rounded-full border px-3 py-1 text-sm" disabled={!hook.partnersPagination.hasNextPage}>Next</button>
              </div>
            </div>
          )}
        </SectionCard>
        <div className="h-6" />

        <SectionCard title={<span className="flex items-center gap-2"><FaArchive /> Deleted Partners Archive</span>} right={<div className="text-xs text-gray-500">History of removed partners</div>}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="relative w-full sm:w-80">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-10 pr-10 py-2 rounded-full border bg-white/90 text-sm"
                placeholder="Search deleted partner archive"
                value={hook.deletedArchivesQuery}
                onChange={(e) => { hook.setDeletedArchivesQuery(e.target.value); hook.setDeletedArchivesPage(1); }}
              />
            </div>
            <div className="text-xs rounded-lg bg-gray-50 border px-3 py-2">
              Total Archives: <span className="font-semibold">{hook.deletedArchivesPagination.total}</span>
            </div>
          </div>

          {hook.deletedArchivesLoading ? (
            <div className="py-8 text-center text-gray-500">Loading deleted archives...</div>
          ) : hook.deletedArchivesError ? (
            <div className="py-8 text-center text-red-600">{hook.deletedArchivesError}</div>
          ) : hook.deletedArchives.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No deleted partner archives found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-red-50 to-red-100 text-red-700">
                    <th className="px-4 py-2 text-left font-semibold">Partner</th>
                    <th className="px-4 py-2 text-left font-semibold">Referral</th>
                    <th className="px-4 py-2 text-left font-semibold">Deleted By</th>
                    <th className="px-4 py-2 text-left font-semibold">Deleted At</th>
                    <th className="px-4 py-2 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {hook.deletedArchives.map((a) => (
                    <tr key={a.id} className="odd:bg-white even:bg-gray-50 hover:bg-red-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-medium">{a.partnerEmail || "-"}</div>
                        <div className="text-xs text-gray-500">{a.partnerMobile || "-"}</div>
                      </td>
                      <td className="px-4 py-3">{a.partnerReferralCode || "-"}</td>
                      <td className="px-4 py-3">
                        <div>{a.deletedBy?.name || "-"}</div>
                        <div className="text-xs text-gray-500">{a.deletedBy?.email || "-"}</div>
                      </td>
                      <td className="px-4 py-3">{fmtDateIST(a.deletedAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          className="rounded-full border px-3 py-1 text-xs font-semibold hover:bg-red-50"
                          onClick={async () => {
                            try {
                              await hook.openDeletedArchiveDetails(a.id);
                            } catch (err: any) {
                              toast.error(err?.message || "Failed to load archive details");
                            }
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button onClick={() => { if (hook.deletedArchivesPagination.hasPrevPage) hook.setDeletedArchivesPage(hook.deletedArchivesPage - 1); }} className="rounded-full border px-3 py-1 text-sm" disabled={!hook.deletedArchivesPagination.hasPrevPage}>Prev</button>
                <button onClick={() => { if (hook.deletedArchivesPagination.hasNextPage) hook.setDeletedArchivesPage(hook.deletedArchivesPage + 1); }} className="rounded-full border px-3 py-1 text-sm" disabled={!hook.deletedArchivesPagination.hasNextPage}>Next</button>
              </div>
            </div>
          )}
        </SectionCard>
        <div className="h-6" />

        <SectionCard title={<span className="flex items-center gap-2"><FaMoneyBillWave /> Completed Cycles Queue</span>} right={<div className="text-xs text-gray-500">All completed cycles across partners for payout action</div>}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-4">
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative w-full sm:w-80">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-10 pr-10 py-2 rounded-full border bg-white/90 text-sm"
                  placeholder="Search partner/shop/referral"
                  value={hook.completedCyclesQuery}
                  onChange={(e) => { hook.setCompletedCyclesQuery(e.target.value); hook.setCompletedCyclesPage(1); }}
                />
              </div>
              <select
                value={hook.completedCyclesPayoutStatus}
                onChange={(e) => { hook.setCompletedCyclesPayoutStatus(e.target.value as any); hook.setCompletedCyclesPage(1); }}
                className="rounded-full border px-3 py-2 text-sm bg-white"
              >
                <option value="">All Payout Status</option>
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              <label className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-full border bg-white">
                <input
                  type="checkbox"
                  checked={hook.completedCyclesOnlyActionable}
                  onChange={(e) => { hook.setCompletedCyclesOnlyActionable(e.target.checked); hook.setCompletedCyclesPage(1); }}
                />
                Actionable only
              </label>
            </div>
            <div className="text-xs rounded-lg bg-gray-50 border px-3 py-2">
              Total Cycles: <span className="font-semibold">{hook.completedCyclesPagination.total}</span>
            </div>
          </div>

          {hook.completedCyclesLoading ? (
            <div className="py-8 text-center text-gray-500">Loading completed cycles...</div>
          ) : hook.completedCyclesError ? (
            <div className="py-8 text-center text-red-600">{hook.completedCyclesError}</div>
          ) : hook.completedCycles.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No completed cycles found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-red-50 to-red-100 text-red-700">
                    <th className="px-4 py-2 text-left font-semibold">Partner</th>
                    <th className="px-4 py-2 text-left font-semibold">Cycle</th>
                    <th className="px-4 py-2 text-left font-semibold">Bank</th>
                    <th className="px-4 py-2 text-left font-semibold">Revenue</th>
                    <th className="px-4 py-2 text-left font-semibold">Bonus</th>
                    <th className="px-4 py-2 text-left font-semibold">Commission</th>
                    <th className="px-4 py-2 text-left font-semibold">Payout</th>
                    <th className="px-4 py-2 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hook.completedCycles.map((c) => {
                    const keyPaid = `${c.cycleId}_PAID`;
                    const keyCancel = `${c.cycleId}_CANCELLED`;
                    const payoutStatus = c.payout?.status || "PENDING";
                    const isAutoZeroCancelled =
                      Boolean(c.isZeroEarningCycle) ||
                      (payoutStatus === "CANCELLED" &&
                        (c.payout?.note || "") === "AUTO_ZERO_EARNING_CYCLE");
                    const disablePaidAction =
                      !c.canMarkPayout ||
                      payoutStatus === "PAID" ||
                      isAutoZeroCancelled ||
                      hook.completedCycleActionLoadingKey === keyPaid;
                    const disableCancelAction =
                      payoutStatus === "CANCELLED" ||
                      isAutoZeroCancelled ||
                      hook.completedCycleActionLoadingKey === keyCancel;
                    return (
                      <tr key={c.cycleId} className="odd:bg-white even:bg-gray-50 hover:bg-red-50 transition">
                        <td className="px-4 py-3">
                          <div className="font-medium">{c.partner?.firstName || ""} {c.partner?.lastName || ""}</div>
                          <div className="text-xs text-gray-500">{c.partner?.shopName || "-"} • {c.partner?.referralCode || "-"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div>{c.label || `${fmtDateIST(c.start)} to ${fmtDateIST(c.end)}`}</div>
                          <div className="text-xs text-gray-500">{fmtDateIST(c.end)}</div>
                        </td>
                        <td className="px-4 py-3">
                          {c.partner?.bankStatus === "VERIFIED"
                            ? pill("VERIFIED", "bg-green-50 text-green-700 border-green-200")
                            : c.partner?.bankStatus === "REJECTED"
                              ? pill("REJECTED", "bg-gray-50 text-gray-700 border-gray-200")
                              : pill("PENDING", "bg-amber-50 text-amber-700 border-amber-200")}
                        </td>
                        <td className="px-4 py-3">{fmtMoney(c.revenue)}</td>
                        <td className="px-4 py-3">{fmtMoney(c.bonus)}</td>
                        <td className="px-4 py-3">{fmtMoney(c.commission)}</td>
                        <td className="px-4 py-3">
                          <div>{payoutStatus}</div>
                          {isAutoZeroCancelled && (
                            <div className="text-xs text-gray-500">Auto-cancelled (0 earning)</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-2 flex-wrap justify-end">
                            <button
                              className="rounded-full border px-3 py-1 text-xs font-semibold hover:bg-red-50"
                              onClick={async () => {
                                try {
                                  await hook.openPartnerManager(c.partner.id);
                                } catch (err: any) {
                                  toast.error(err?.message || "Failed to open partner manager");
                                }
                              }}
                            >
                              Manage
                            </button>
                            <button
                              disabled={disablePaidAction}
                              onClick={async () => {
                                try {
                                  await hook.markCompletedCyclePayout(c, "PAID");
                                  toast.success("Cycle marked as PAID");
                                } catch (err: any) {
                                  toast.error(err?.message || "Failed to mark cycle paid");
                                }
                              }}
                              className="rounded-full bg-green-600 text-white px-3 py-1 text-xs font-semibold hover:bg-green-700 disabled:opacity-60"
                            >
                              {hook.completedCycleActionLoadingKey === keyPaid ? "..." : "Mark PAID"}
                            </button>
                            <button
                              disabled={disableCancelAction}
                              onClick={async () => {
                                try {
                                  await hook.markCompletedCyclePayout(c, "CANCELLED");
                                  toast.success("Cycle marked as CANCELLED");
                                } catch (err: any) {
                                  toast.error(err?.message || "Failed to mark cycle cancelled");
                                }
                              }}
                              className="rounded-full bg-white border px-3 py-1 text-xs font-semibold hover:bg-red-50 disabled:opacity-60"
                            >
                              {hook.completedCycleActionLoadingKey === keyCancel ? "..." : "Mark CANCELLED"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button onClick={() => { if (hook.completedCyclesPagination.hasPrevPage) hook.setCompletedCyclesPage(hook.completedCyclesPage - 1); }} className="rounded-full border px-3 py-1 text-sm" disabled={!hook.completedCyclesPagination.hasPrevPage}>Prev</button>
                <button onClick={() => { if (hook.completedCyclesPagination.hasNextPage) hook.setCompletedCyclesPage(hook.completedCyclesPage + 1); }} className="rounded-full border px-3 py-1 text-sm" disabled={!hook.completedCyclesPagination.hasNextPage}>Next</button>
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Details modal (header fixed, body scrollable, constrained to 85vh) */}
      {hook.showModal && hook.selected && (
        <div className={modalBackdropCls}>
          <div
            className={`${modalShellCls} max-w-2xl`}
            style={{ maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            {/* Header (fixed) */}
            <div className={modalHeaderCls}>
              <button onClick={() => hook.setShowModal(false)} className={modalCloseBtnCls}>x</button>
              <h3 className="text-lg sm:text-xl font-bold">Request details</h3>
            </div>

            {/* Body (scrollable) */}
            <div className={modalBodyCls} style={{ maxHeight: `calc(85vh - ${MODAL_HEADER_HEIGHT}px)` }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={modalCardCls}>
                  <div className="text-sm font-bold text-red-700 mb-2">Business Details</div>
                  <InfoRow label="Name" value={cleanText(`${hook.selected.firstName || ""} ${hook.selected.lastName || ""}`)} />
                  <InfoRow label="Shop" value={cleanText(hook.selected.shopName)} />
                  <InfoRow label="Type" value={cleanText(hook.selected.partnerType)} />
                  <InfoRow label="Category" value={cleanText(hook.selected.specifyCategory)} />
                </div>
                <div className={modalCardCls}>
                  <div className="text-sm font-bold text-red-700 mb-2">Contact Details</div>
                  <InfoRow label="Email" value={cleanText(hook.selected.email)} />
                  <InfoRow label="Mobile" value={cleanText(hook.selected.mobile)} />
                  <InfoRow label="Address" value={cleanText(hook.selected.address)} />
                </div>
              </div>

              <div className="mt-5 border-t border-red-100 pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                {hook.selected.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => { hook.setShowModal(false); hook.askConfirm(hook.selected!.id, "approve", `${hook.selected!.firstName} ${hook.selected!.lastName ?? ""}`); }}
                      className="rounded-full bg-green-600 text-white px-4 py-2 font-semibold hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => { hook.setShowModal(false); hook.askConfirm(hook.selected!.id, "reject", `${hook.selected!.firstName} ${hook.selected!.lastName ?? ""}`); }}
                      className="rounded-full bg-white border px-4 py-2 font-semibold hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button onClick={() => hook.setShowModal(false)} className="rounded-full bg-gray-100 px-4 py-2 font-semibold">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Partner manager modal */}
      {hook.managerOpen && (
        <div className={modalBackdropCls}>
          <div className={`${modalShellCls} max-w-5xl`} style={{ maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div className={modalHeaderCls}>
              <button onClick={hook.closePartnerManager} className={modalCloseBtnCls}>x</button>
              <h3 className="text-lg sm:text-xl font-bold">Partner management</h3>
            </div>
            <div className={modalBodyCls}>
              {hook.managerLoading || !hook.partnerDetails ? (
                <div className="py-12 text-center text-gray-500">Loading partner details...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className={modalCardCls}>
                      <h4 className="font-bold text-red-700 mb-2">Partner profile</h4>
                      <InfoRow label="Name" value={`${hook.partnerDetails.partner.firstName} ${hook.partnerDetails.partner.lastName ?? ""}`} />
                      <InfoRow label="Email" value={hook.partnerDetails.partner.email ?? "-"} />
                      <InfoRow label="Mobile" value={hook.partnerDetails.partner.mobile ?? "-"} />
                      <InfoRow label="Referral" value={hook.partnerDetails.partner.referralCode ?? "-"} />
                      <InfoRow label="Account" value={hook.partnerDetails.partner.isActive ? "Active" : "Inactive"} />
                      <InfoRow label="Completed Referrals" value={hook.partnerDetails.stats?.totalCompletedReferrals ?? 0} />
                      <InfoRow label="Paid Cycles" value={hook.partnerDetails.stats?.totalPaidCycles ?? 0} />
                      <InfoRow label="Paid Patients" value={hook.partnerDetails.stats?.totalPaidPatients ?? 0} />
                      <InfoRow label="Paid Commission" value={fmtMoney(hook.partnerDetails.stats?.totalPaidCommission)} />
                      <InfoRow label="Bonus Earned" value={fmtMoney(hook.partnerDetails.earnedSummary?.totalBonus)} />
                      <InfoRow label="Commission Earned" value={fmtMoney(hook.partnerDetails.earnedSummary?.totalCommission)} />
                      <div className="mt-4 pt-3 border-t border-red-100">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            disabled={hook.partnerStatusLoadingId === hook.partnerDetails.partner.id}
                            onClick={async () => {
                              try {
                                const nextStatus = !hook.partnerDetails?.partner?.isActive;
                                await hook.togglePartnerStatus(hook.partnerDetails!.partner.id, nextStatus);
                                toast.success(`Partner ${nextStatus ? "activated" : "deactivated"} successfully`);
                              } catch (err: any) {
                                toast.error(err?.message || "Failed to update partner status");
                              }
                            }}
                            className="rounded-full bg-white border px-3 py-1 text-xs font-semibold hover:bg-red-50 disabled:opacity-60"
                          >
                            {hook.partnerStatusLoadingId === hook.partnerDetails.partner.id
                              ? "..."
                              : hook.partnerDetails.partner.isActive
                                ? "Deactivate Partner"
                                : "Activate Partner"}
                          </button>
                          <button
                            disabled={hook.partnerDeleteLoadingId === hook.partnerDetails.partner.id}
                            onClick={async () => {
                              const confirmed = window.confirm(
                                "Delete this partner permanently? All associated partner records will be archived first."
                              );
                              if (!confirmed) return;
                              const reason = window.prompt("Reason for deletion (optional)") || undefined;
                              try {
                                await hook.deletePartner(hook.partnerDetails!.partner.id, reason);
                                toast.success("Partner deleted and archived");
                              } catch (err: any) {
                                toast.error(err?.message || "Failed to delete partner");
                              }
                            }}
                            className="rounded-full border border-red-200 text-red-700 px-3 py-1 text-xs font-semibold hover:bg-red-50 disabled:opacity-60"
                          >
                            {hook.partnerDeleteLoadingId === hook.partnerDetails.partner.id ? "..." : "Delete Partner"}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className={modalCardCls}>
                      <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2"><FaUniversity /> Bank verification</h4>
                      <InfoRow label="Holder" value={hook.partnerBank?.holderName ?? "-"} />
                      <InfoRow label="Bank" value={hook.partnerBank?.bankName ?? "-"} />
                      <InfoRow label="A/C" value={hook.partnerBank?.accountNo ?? "-"} />
                      <InfoRow label="IFSC" value={hook.partnerBank?.ifsc ?? "-"} />
                      <InfoRow label="Status" value={hook.partnerBank?.status || "PENDING"} />
                      <div className="mt-4 pt-3 border-t border-red-100 flex gap-2 flex-wrap">
                        <button disabled={hook.bankActionLoading} onClick={async () => { try { await hook.verifyPartnerBank({ status: "VERIFIED" }); toast.success("Bank marked as VERIFIED"); } catch (err: any) { toast.error(err?.message || "Failed to verify bank"); } }} className="rounded-full bg-green-600 text-white px-3 py-1 text-xs font-semibold hover:bg-green-700 disabled:opacity-60">{hook.bankActionLoading ? "..." : "Mark VERIFIED"}</button>
                        <button disabled={hook.bankActionLoading} onClick={async () => { const reason = window.prompt("Enter rejection reason"); if (!reason) return; try { await hook.verifyPartnerBank({ status: "REJECTED", rejectionReason: reason }); toast.success("Bank marked as REJECTED"); } catch (err: any) { toast.error(err?.message || "Failed to reject bank"); } }} className="rounded-full bg-white border px-3 py-1 text-xs font-semibold hover:bg-red-50 disabled:opacity-60">{hook.bankActionLoading ? "..." : "Mark REJECTED"}</button>
                      </div>
                    </div>
                  </div>
                  <div className={`mt-5 ${modalCardCls}`}>
                    <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2"><FaMoneyBillWave /> Cycles & payout</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                      <div className={statCardCls}>Patients: <span className="font-semibold">{hook.partnerCyclesSummary?.totalPatients ?? 0}</span></div>
                      <div className={statCardCls}>Revenue: <span className="font-semibold">{fmtMoney(hook.partnerCyclesSummary?.totalRevenue)}</span></div>
                      <div className={statCardCls}>Bonus: <span className="font-semibold">{fmtMoney(hook.partnerCyclesSummary?.totalBonus)}</span></div>
                      <div className={statCardCls}>Commission: <span className="font-semibold">{fmtMoney(hook.partnerCyclesSummary?.totalCommission)}</span></div>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      Working cycle id: <span className="font-semibold">{hook.workingCycleId ?? "-"}</span> | Total cycles: <span className="font-semibold">{hook.cyclesStored}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="bg-gray-50"><th className="px-3 py-2 text-left">Cycle</th><th className="px-3 py-2 text-left">Patients</th><th className="px-3 py-2 text-left">Revenue</th><th className="px-3 py-2 text-left">Bonus</th><th className="px-3 py-2 text-left">Commission</th><th className="px-3 py-2 text-left">Payout</th><th className="px-3 py-2 text-right">Actions</th></tr></thead>
                        <tbody>
                          {hook.partnerCycles.map((c) => {
                            const keyPaid = `${c.start}_${c.end}_PAID`;
                            const keyCancel = `${c.start}_${c.end}_CANCELLED`;
                            const payoutStatus = c.payout?.status || "PENDING";
                            const isAutoZeroCancelled =
                              Boolean(c.isZeroEarningCycle) ||
                              (payoutStatus === "CANCELLED" &&
                                (c.payout?.note || "") === "AUTO_ZERO_EARNING_CYCLE");
                            const disablePaidAction =
                              !c.payable ||
                              payoutStatus === "PAID" ||
                              isAutoZeroCancelled ||
                              hook.payoutActionLoadingKey === keyPaid;
                            const disableCancelAction =
                              payoutStatus === "CANCELLED" ||
                              isAutoZeroCancelled ||
                              hook.payoutActionLoadingKey === keyCancel;

                            return (
                              <tr key={c.cycleId || `${c.start}_${c.end}`} className="border-t">
                                <td className="px-3 py-2">
                                  <div className="font-medium">
                                    {c.label || `${fmtDateIST(c.start)} to ${fmtDateIST(c.end)}`}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {c.isRunning ? "Running cycle" : c.status || "-"}
                                  </div>
                                </td>
                                <td className="px-3 py-2">{c.patients}</td>
                                <td className="px-3 py-2">{fmtMoney(c.revenue)}</td>
                                <td className="px-3 py-2">
                                  <div>{fmtMoney(c.bonus)}</div>
                                  <div className="text-xs text-gray-500">
                                    {(c.bonusPercent || 0) > 0 ? `${c.bonusPercent}% applied` : "No bonus"}
                                  </div>
                                </td>
                                <td className="px-3 py-2">{fmtMoney(c.commission)}</td>
                                <td className="px-3 py-2">
                                  <div>{payoutStatus}</div>
                                  {isAutoZeroCancelled && (
                                    <div className="text-xs text-gray-500">Auto-cancelled (0 earning)</div>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <div className="inline-flex gap-2 flex-wrap justify-end">
                                    <button
                                      onClick={async () => {
                                        try {
                                          await hook.openCycleReferrals(c);
                                        } catch (err: any) {
                                          toast.error(err?.message || "Failed to load referrals");
                                        }
                                      }}
                                      className="rounded-full border px-3 py-1 text-xs font-semibold hover:bg-red-50"
                                    >
                                      View Referrals
                                    </button>
                                    <button
                                      disabled={disablePaidAction}
                                      onClick={async () => {
                                        try {
                                          await hook.markCyclePayout(c, "PAID");
                                          toast.success("Cycle marked as PAID");
                                        } catch (err: any) {
                                          toast.error(err?.message || "Failed to mark paid");
                                        }
                                      }}
                                      className="rounded-full bg-green-600 text-white px-3 py-1 text-xs font-semibold hover:bg-green-700 disabled:opacity-60"
                                    >
                                      {hook.payoutActionLoadingKey === keyPaid ? "..." : "Mark PAID"}
                                    </button>
                                    <button
                                      disabled={disableCancelAction}
                                      onClick={async () => {
                                        try {
                                          await hook.markCyclePayout(c, "CANCELLED");
                                          toast.success("Cycle marked as CANCELLED");
                                        } catch (err: any) {
                                          toast.error(err?.message || "Failed to mark cancelled");
                                        }
                                      }}
                                      className="rounded-full bg-white border px-3 py-1 text-xs font-semibold hover:bg-red-50 disabled:opacity-60"
                                    >
                                      {hook.payoutActionLoadingKey === keyCancel ? "..." : "Mark CANCELLED"}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          if (hook.selectedPartnerId && hook.partnerCyclesPagination.hasPrevPage) {
                            hook.fetchPartnerCycles(hook.selectedPartnerId, hook.partnerCyclesPage - 1);
                          }
                        }}
                        className="rounded-full border px-3 py-1 text-sm"
                        disabled={!hook.partnerCyclesPagination.hasPrevPage}
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => {
                          if (hook.selectedPartnerId && hook.partnerCyclesPagination.hasNextPage) {
                            hook.fetchPartnerCycles(hook.selectedPartnerId, hook.partnerCyclesPage + 1);
                          }
                        }}
                        className="rounded-full border px-3 py-1 text-sm"
                        disabled={!hook.partnerCyclesPagination.hasNextPage}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {hook.cycleReferralsOpen && (
        <div className={modalBackdropCls}>
          <div className={`${modalShellCls} max-w-5xl`} style={{ maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div className={modalHeaderCls}>
              <button onClick={hook.closeCycleReferrals} className={modalCloseBtnCls}>x</button>
              <h3 className="text-lg sm:text-xl font-bold">Cycle referrals</h3>
            </div>
            <div className={modalBodyCls}>
              <div className="mb-3 text-sm text-gray-600 font-medium">
                {hook.selectedCycleForReferrals?.label || (hook.selectedCycleForReferrals ? `${fmtDateIST(hook.selectedCycleForReferrals.start)} to ${fmtDateIST(hook.selectedCycleForReferrals.end)}` : "-")}
              </div>
              <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs w-full sm:w-auto">
                  <div className={statCardCls}>Total: <span className="font-semibold">{hook.cycleReferralsCounts.total}</span></div>
                  <div className={statCardCls}>Placed: <span className="font-semibold">{hook.cycleReferralsCounts.placed}</span></div>
                  <div className={statCardCls}>Accepted: <span className="font-semibold">{hook.cycleReferralsCounts.orderAccepted}</span></div>
                  <div className={statCardCls}>Sample Collected: <span className="font-semibold">{hook.cycleReferralsCounts.sampleCollected}</span></div>
                  <div className={statCardCls}>In Progress: <span className="font-semibold">{hook.cycleReferralsCounts.inProgress}</span></div>
                  <div className={statCardCls}>Report Ready: <span className="font-semibold">{hook.cycleReferralsCounts.reportReady}</span></div>
                  <div className={statCardCls}>Completed: <span className="font-semibold">{hook.cycleReferralsCounts.completed}</span></div>
                  <div className={statCardCls}>Cancelled: <span className="font-semibold">{hook.cycleReferralsCounts.cancelled}</span></div>
                </div>
                <div className="w-full sm:w-56">
                  <select
                    value={hook.cycleReferralsStatus}
                    onChange={(e) => {
                      hook.setCycleReferralsStatus(e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                  >
                    <option value="">All statuses</option>
                    <option value="PLACED">PLACED</option>
                    <option value="ORDER_ACCEPTED">ORDER_ACCEPTED</option>
                    <option value="SAMPLE_COLLECTED">SAMPLE_COLLECTED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="REPORT_READY">REPORT_READY</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>
              {hook.cycleReferralsLoading ? (
                <div className="py-12 text-center text-gray-500">Loading referrals...</div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-xl border border-red-100 bg-white shadow-sm">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-3 py-2 text-left">Order ID</th>
                          <th className="px-3 py-2 text-left">Patient</th>
                          <th className="px-3 py-2 text-left">Status</th>
                          <th className="px-3 py-2 text-left">Partner Margin</th>
                          <th className="px-3 py-2 text-left">Commission</th>
                          <th className="px-3 py-2 text-left">Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hook.filteredCycleReferrals.length === 0 ? (
                          <tr>
                            <td className="px-3 py-4 text-center text-gray-500" colSpan={6}>
                              No referrals found for this cycle.
                            </td>
                          </tr>
                        ) : (
                          hook.filteredCycleReferrals.map((r) => (
                            <tr key={r.id} className="border-t">
                              <td className="px-3 py-2">{r.orderId || "-"}</td>
                              <td className="px-3 py-2">{r.patientName || "-"}</td>
                              <td className="px-3 py-2">{r.status || "-"}</td>
                              <td className="px-3 py-2">{fmtMoney(r.partnerMargin)}</td>
                              <td className="px-3 py-2">{fmtMoney(r.commissionGranted)}</td>
                              <td className="px-3 py-2">{fmtDateIST(r.createdAt)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 pt-3 border-t border-red-100 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Showing {hook.filteredCycleReferrals.length} referral(s)
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={hook.closeCycleReferrals} className="rounded-full border px-3 py-1 text-sm">Close</button>
                      <button
                        onClick={async () => {
                          try {
                            await hook.loadMoreCycleReferrals();
                          } catch (err: any) {
                            toast.error(err?.message || "Failed to load more referrals");
                          }
                        }}
                        disabled={!hook.cycleReferralsCursor || hook.cycleReferralsLoadingMore}
                        className="rounded-full bg-red-600 text-white px-3 py-1 text-sm disabled:opacity-60"
                      >
                        {hook.cycleReferralsLoadingMore ? "Loading..." : "Load More"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {hook.deletedArchiveDetailsOpen && (
        <div className={modalBackdropCls}>
          <div className={`${modalShellCls} max-w-5xl`} style={{ maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div className={modalHeaderCls}>
              <button onClick={hook.closeDeletedArchiveDetails} className={modalCloseBtnCls}>x</button>
              <h3 className="text-lg sm:text-xl font-bold">Deleted Partner Archive</h3>
            </div>
            <div className={modalBodyCls}>
              {hook.deletedArchiveDetailsLoading || !hook.selectedDeletedArchive ? (
                <div className="py-12 text-center text-gray-500">Loading archive details...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className={modalCardCls}>
                      <InfoRow label="Archive ID" value={hook.selectedDeletedArchive.id} />
                      <InfoRow label="Original Partner ID" value={hook.selectedDeletedArchive.originalPartnerId} />
                      <InfoRow label="Partner Email" value={hook.selectedDeletedArchive.partnerEmail || "-"} />
                      <InfoRow label="Partner Mobile" value={hook.selectedDeletedArchive.partnerMobile || "-"} />
                      <InfoRow label="Referral Code" value={hook.selectedDeletedArchive.partnerReferralCode || "-"} />
                    </div>
                    <div className={modalCardCls}>
                      <InfoRow label="Deleted At" value={fmtDateIST(hook.selectedDeletedArchive.deletedAt)} />
                      <InfoRow label="Deleted By" value={hook.selectedDeletedArchive.deletedBy?.name || "-"} />
                      <InfoRow label="Deleted By Email" value={hook.selectedDeletedArchive.deletedBy?.email || "-"} />
                      <InfoRow label="Reason" value={hook.selectedDeletedArchive.reason || "-"} />
                    </div>
                  </div>
                  <div className={modalCardCls}>
                    <div className="text-sm font-bold text-red-700 mb-2">Archived Snapshot (JSON)</div>
                    <pre className="text-xs bg-gray-50 border rounded-lg p-3 overflow-auto max-h-[42vh]">
{JSON.stringify(hook.selectedDeletedArchive.snapshot, null, 2)}
                    </pre>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button onClick={hook.closeDeletedArchiveDetails} className="rounded-full border px-4 py-2 text-sm font-semibold hover:bg-red-50">Close</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Onboarding modal (header fixed, body scrollable, constrained to 85vh) */}
      {hook.onboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[3px]" onClick={() => hook.setOnboardOpen(false)} />
          <div
            className={`relative ${modalShellCls} max-w-xl`}
            style={{ maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            {/* Header fixed */}
            <div className={modalHeaderCls}>
              <h3 id="new-partner-title" className="text-lg sm:text-2xl font-bold">New Partner Registration</h3>
              <button aria-label="Close" onClick={() => hook.setOnboardOpen(false)} className={modalCloseBtnCls}>x</button>
            </div>

            {/* Body scrollable */}
            <div className={modalBodyCls} style={{ maxHeight: `calc(85vh - ${MODAL_HEADER_HEIGHT}px)` }}>
              <form onSubmit={handleSubmit(onboardSubmit)} className="space-y-4 sm:space-y-5" aria-live="polite">
                <div className={modalCardCls}>
                <div className="text-sm font-bold text-red-700 mb-3">Basic Information</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First name</label>
                    <input id="firstName" type="text" {...register("firstName", { required: "First name is required" })} className={`mt-1 block w-full px-3 py-2 text-sm border ${formState.errors.firstName ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    {formState.errors.firstName && (<p className="text-red-500 text-sm mt-1" role="alert">{formState.errors.firstName.message}</p>)}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last name</label>
                    <input id="lastName" type="text" {...register("lastName")} className={`mt-1 block w-full px-3 py-2 text-sm border ${formState.errors.lastName ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                  </div>
                </div>
                </div>

                <div className={modalCardCls}>
                <div className="text-sm font-bold text-red-700 mb-3">Business Information</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input id="email" type="email" {...register("email", { required: "Email is required" })} className={`mt-1 block w-full px-3 py-2 text-sm border ${formState.errors.email ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    {formState.errors.email && (<p className="text-red-500 text-sm mt-1" role="alert">{formState.errors.email.message}</p>)}
                  </div>

                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile</label>
                    <input id="mobile" type="tel" {...register("mobile", { required: "Mobile is required", minLength: { value: 6, message: "Enter a valid mobile" } })} className={`mt-1 block w-full px-3 py-2 text-sm border ${formState.errors.mobile ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    {formState.errors.mobile && (<p className="text-red-500 text-sm mt-1" role="alert">{formState.errors.mobile.message}</p>)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input id="password" type="password" {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password too short" } })} className={`mt-1 block w-full px-3 py-2 text-sm border ${formState.errors.password ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                    {formState.errors.password && (<p className="text-red-500 text-sm mt-1" role="alert">{formState.errors.password.message}</p>)}
                  </div>

                  <div>
                    <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of birth</label>
                    <input id="dob" type="date" {...register("dob")} className={`mt-1 block w-full px-3 py-2 text-sm border ${formState.errors.dob ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                    <select id="gender" {...register("gender")} className={`mt-1 block w-full px-3 py-2 text-sm border ${formState.errors.gender ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="partnerType" className="block text-sm font-medium text-gray-700">Partner type</label>
                    <select id="partnerType" {...register("partnerType", { required: true })} className={`mt-1 block w-full px-3 py-2 text-sm border ${formState.errors.partnerType ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`}>
                      <option value="chemist">Chemist</option>
                      <option value="lab">Lab</option>
                      <option value="clinic">Clinic</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">Shop / Organisation name</label>
                  <input id="shopName" type="text" {...register("shopName")} className={`mt-1 block w-full px-3 py-2 text-sm border ${formState.errors.shopName ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">Pincode</label>
                    <input id="pincode" type="text" {...register("pincode")} className={`mt-1 block w-full px-3 py-2 text-sm border ${formState.errors.pincode ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                    <input id="address" type="text" {...register("address")} className={`mt-1 block w-full px-3 py-2 text-sm border ${formState.errors.address ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500`} />
                  </div>
                </div>
                </div>

                <div className={`${modalCardCls} flex items-start gap-3`}>
                  <input
                    id="isAdmin"
                    type="checkbox"
                    {...register("isAdmin")}
                    className="mt-1 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="isAdmin" className="text-sm text-gray-700">
                    <span className="font-semibold">Register as Admin Partner</span>
                    <div className="text-xs text-gray-500 mt-1">
                      Admin partners may get access to additional dashboards and management tools.
                    </div>
                  </label>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-end">
                  <button type="button" onClick={() => { reset(); }} className="w-full sm:w-auto px-4 py-2 rounded-md border">Reset</button>
                  <button type="submit" disabled={!formState.isValid || hook.onboardSubmitting} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                    {hook.onboardSubmitting ? <FaSpinner className="animate-spin" /> : <span>Submit</span>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {hook.confirmOpen && (
        <div className={modalBackdropCls}>
          <div className={`${modalShellCls} max-w-md p-6`}>
            <h3 className="text-lg font-bold text-red-700 mb-2">{hook.pendingAction ? (hook.pendingAction.type === "approve" ? "Approve partner" : "Reject partner") : "Confirm"}</h3>
            <p className="text-sm text-gray-600 mb-4">{hook.pendingAction ? `Are you sure you want to ${hook.pendingAction.type} ${hook.pendingAction.name ?? "this partner"}?` : ""}</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => { hook.setConfirmOpen(false); }} className="rounded-full bg-gray-100 px-4 py-2 font-semibold">
                Cancel
              </button>
              <button onClick={confirmAndPerform} disabled={hook.confirmLoading} className="rounded-full bg-red-600 text-white px-4 py-2 font-semibold hover:bg-red-700">
                {hook.confirmLoading ? "Working..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnersRequestPage;






// src/pages/PartnersRequestPage.tsx
import React from "react";
import { FaArrowLeft, FaSearch, FaSyncAlt, FaUserCheck, FaUserTimes, FaEye, FaTimes, FaPlus, FaSpinner } from "react-icons/fa";
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

const MODAL_HEADER_HEIGHT = 64; // px (approx)

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
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white rounded-2xl p-4 sm:p-5 shadow-lg mb-6">
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
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
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
            <div className="py-12 text-center text-gray-500">Loading requests…</div>
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
                            <div className="text-xs text-gray-500 truncate">{r.shopName ?? "—"}</div>
                          </div>
                          <div className="text-xs text-gray-500">{fmtDateIST(r.createdAt)}</div>
                        </div>

                        <div className="mt-2 text-sm text-gray-600 truncate">{r.email ?? "—"} • {r.mobile ?? "—"}</div>

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
      </div>

      {/* Details modal (header fixed, body scrollable, constrained to 85vh) */}
      {hook.showModal && hook.selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
            style={{ maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            {/* Header (fixed) */}
            <div className="flex-none bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white py-3 px-4 sm:px-6 relative">
              <button onClick={() => hook.setShowModal(false)} className="absolute top-3 right-3 p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-white">✕</button>
              <h3 className="text-lg sm:text-xl font-bold">Request details</h3>
            </div>

            {/* Body (scrollable) */}
            <div className="flex-1 overflow-auto p-4 sm:p-6" style={{ maxHeight: `calc(85vh - ${MODAL_HEADER_HEIGHT}px)` }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium">{hook.selected.firstName} {hook.selected.lastName}</div>
                  <div className="text-sm text-gray-500 mt-2">Shop</div>
                  <div>{hook.selected.shopName ?? "—"}</div>
                  <div className="text-sm text-gray-500 mt-2">Type</div>
                  <div>{hook.selected.partnerType ?? "—"}</div>
                  <div className="text-sm text-gray-500 mt-2">Category</div>
                  <div>{hook.selected.specifyCategory ?? "—"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Contact</div>
                  <div className="break-words">{hook.selected.email ?? "—"}</div>
                  <div className="text-sm text-gray-500 mt-2">Mobile</div>
                  <div>{hook.selected.mobile ?? "—"}</div>
                  <div className="text-sm text-gray-500 mt-2">Address</div>
                  <div className="text-sm break-words">{hook.selected.address ?? "—"}</div>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
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

      {/* Onboarding modal (header fixed, body scrollable, constrained to 85vh) */}
      {hook.onboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => hook.setOnboardOpen(false)} />
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full"
            style={{ maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            {/* Header fixed */}
            <div className="flex-none bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white py-3 px-4 sm:px-6 relative">
              <h3 id="new-partner-title" className="text-lg sm:text-2xl font-bold">New Partner Registration</h3>
              <button aria-label="Close" onClick={() => hook.setOnboardOpen(false)} className="absolute top-3 right-3 text-white p-2 rounded-full bg-red-500/20 hover:bg-red-500/30">✕</button>
            </div>

            {/* Body scrollable */}
            <div className="flex-1 overflow-auto p-4 sm:p-6" style={{ maxHeight: `calc(85vh - ${MODAL_HEADER_HEIGHT}px)` }}>
              <form onSubmit={handleSubmit(onboardSubmit)} className="space-y-3 sm:space-y-4" aria-live="polite">
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

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-end">
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-2">{hook.pendingAction ? (hook.pendingAction.type === "approve" ? "Approve partner" : "Reject partner") : "Confirm"}</h3>
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

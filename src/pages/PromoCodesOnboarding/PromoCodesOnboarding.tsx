import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Preferences } from "@capacitor/preferences";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FaPlus, FaSpinner, FaTicketAlt, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";

interface PromoFormInput {
  code: string;
  description: string;
  discountType: "PERCENT" | "FLAT";
  amount: number | string;
  maxDiscount?: number | string;
  minOrderAmount?: number | string;
  startsAt?: string;
  expiresAt?: string;
  usageLimit?: number | string;
  perUserLimit?: number | string;
  isHidden?: boolean;
}

interface PromoItem {
  id: string;
  code: string;
  description?: string;
  discountType: "PERCENT" | "FLAT";
  amount: number;
  maxDiscount?: number | null;
  minOrderAmount?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
  isHidden?: boolean;
  usageLimit?: number | null;
  usedCount?: number;
  perUserLimit?: number;
  createdAt?: string;
}

interface DeletedPromoItem {
  id: string;
  originalPromoId: string;
  code: string;
  reason?: string | null;
  deletedAt: string;
  snapshot?: Partial<PromoItem>;
}

const API_BASE = "https://services.thelifesavers.in/api";

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString() : "-");

async function getAuthToken(): Promise<string | null> {
  const { value } = await Preferences.get({ key: "token" });
  return value ?? null;
}

async function axiosWithAuth() {
  const token = await getAuthToken();
  return axios.create({
    baseURL: API_BASE,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}

async function createPromo(payload: Partial<PromoFormInput>) {
  const client = await axiosWithAuth();
  const res = await client.post("/promocodes", payload);
  return res.data;
}

async function listPromos(): Promise<PromoItem[]> {
  const client = await axiosWithAuth();
  const res = await client.get("/promocodes");
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.promos)) return res.data.promos;
  return [];
}

async function listDeletedPromos(): Promise<DeletedPromoItem[]> {
  const client = await axiosWithAuth();
  const res = await client.get("/promocodes/deleted");
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.deletedPromos)) return res.data.deletedPromos;
  return [];
}

async function togglePromo(id: string) {
  const client = await axiosWithAuth();
  const res = await client.patch(`/promocodes/${id}/toggle`);
  return res.data;
}

async function deletePromo(id: string) {
  const client = await axiosWithAuth();
  const res = await client.delete(`/promocodes/${id}`);
  return res.data;
}

const chip = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";

const PromoCodesOnboarding: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [deletedPromos, setDeletedPromos] = useState<DeletedPromoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletedLoading, setDeletedLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [busyPromoId, setBusyPromoId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<PromoFormInput>({
    mode: "onChange",
    defaultValues: {
      code: "",
      description: "",
      discountType: "PERCENT",
      amount: "",
      maxDiscount: "",
      minOrderAmount: "",
      startsAt: "",
      expiresAt: "",
      usageLimit: "",
      perUserLimit: 1,
      isHidden: false,
    },
  });

  const discountType = watch("discountType");

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await listPromos();
      setPromos(items);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load promos");
      setPromos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDeletedPromos = useCallback(async () => {
    setDeletedLoading(true);
    try {
      const items = await listDeletedPromos();
      setDeletedPromos(items);
    } catch {
      setDeletedPromos([]);
    } finally {
      setDeletedLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
    fetchDeletedPromos();
  }, [fetchPromos, fetchDeletedPromos]);

  const stats = useMemo(() => {
    const total = promos.length;
    const active = promos.filter((p) => p.isActive).length;
    const hidden = promos.filter((p) => p.isHidden).length;
    const limited = promos.filter((p) => p.usageLimit != null).length;
    return { total, active, hidden, limited, deleted: deletedPromos.length };
  }, [promos, deletedPromos]);

  const onSubmit: SubmitHandler<PromoFormInput> = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload: Partial<PromoFormInput> = {
        code: formData.code.trim(),
        description: formData.description?.trim() || undefined,
        discountType: formData.discountType,
        amount: Number(formData.amount),
        maxDiscount: formData.maxDiscount !== "" ? Number(formData.maxDiscount) : undefined,
        minOrderAmount: formData.minOrderAmount !== "" ? Number(formData.minOrderAmount) : undefined,
        startsAt: formData.startsAt || undefined,
        expiresAt: formData.expiresAt || undefined,
        usageLimit: formData.usageLimit !== "" ? Number(formData.usageLimit) : undefined,
        perUserLimit: formData.perUserLimit !== "" ? Number(formData.perUserLimit) : undefined,
        isHidden: Boolean(formData.isHidden),
      };

      const res = await createPromo(payload);
      if (!res?.success || !res?.promo) throw new Error(res?.message || "Failed to create promo");
      toast.success("Promo created");
      reset();
      setIsModalOpen(false);
      await fetchPromos();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create promo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onTogglePromo = async (p: PromoItem) => {
    setBusyPromoId(p.id);
    try {
      const res = await togglePromo(p.id);
      if (!res?.success) throw new Error(res?.message || "Failed to toggle promo");
      toast.success(res?.message || "Updated");
      await fetchPromos();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to toggle promo");
    } finally {
      setBusyPromoId(null);
    }
  };

  const onDeletePromo = async (p: PromoItem) => {
    const ok = window.confirm(`Delete promo ${p.code}? This will move it to archive.`);
    if (!ok) return;
    setBusyPromoId(p.id);
    try {
      const res = await deletePromo(p.id);
      if (!res?.success) throw new Error(res?.message || "Failed to delete promo");
      toast.success("Promo deleted and archived");
      await Promise.all([fetchPromos(), fetchDeletedPromos()]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete promo");
    } finally {
      setBusyPromoId(null);
    }
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gray-50 flex items-start justify-center p-6 pt-20">
        <div className="w-full max-w-6xl">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white py-8 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold">Promo Codes</h1>
                <p className="mt-2 text-sm sm:text-base opacity-90">Create and manage active, hidden, and archived promo codes.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    fetchPromos();
                    fetchDeletedPromos();
                  }}
                  className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-4 py-2 rounded-full hover:bg-white/30 transition"
                >
                  Refresh
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-white text-red-600 font-semibold px-5 py-2.5 rounded-full shadow-lg hover:bg-red-50 transition"
                >
                  <FaPlus />
                  New Promo
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="rounded-xl border border-red-100 bg-red-50/60 p-3"><div className="text-xs text-gray-600">Total</div><div className="text-xl font-bold">{stats.total}</div></div>
                <div className="rounded-xl border border-red-100 bg-red-50/60 p-3"><div className="text-xs text-gray-600">Active</div><div className="text-xl font-bold">{stats.active}</div></div>
                <div className="rounded-xl border border-red-100 bg-red-50/60 p-3"><div className="text-xs text-gray-600">Hidden</div><div className="text-xl font-bold">{stats.hidden}</div></div>
                <div className="rounded-xl border border-red-100 bg-red-50/60 p-3"><div className="text-xs text-gray-600">With Limit</div><div className="text-xl font-bold">{stats.limited}</div></div>
                <div className="rounded-xl border border-red-100 bg-red-50/60 p-3"><div className="text-xs text-gray-600">Archived</div><div className="text-xl font-bold">{stats.deleted}</div></div>
              </div>

              {loading ? (
                <div className="py-14 text-center text-gray-500"><FaSpinner className="animate-spin inline-block mr-2" /> Loading promos...</div>
              ) : error ? (
                <div className="py-12 text-center text-red-600">{error}</div>
              ) : promos.length === 0 ? (
                <div className="py-12 text-center text-gray-500">No promos found.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {promos.map((promo) => (
                    <article key={promo.id} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition">
                      <div className="flex justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-gray-800 flex items-center gap-2"><FaTicketAlt className="text-red-500" /> {promo.code}</h3>
                          <p className="text-xs text-gray-500 mt-1">{promo.description || "-"}</p>
                        </div>
                        <div className="text-right">
                          <span className={`${chip} ${promo.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{promo.isActive ? "ACTIVE" : "INACTIVE"}</span>
                          <div className="mt-1">
                            <span className={`${chip} ${promo.isHidden ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{promo.isHidden ? "HIDDEN" : "PUBLIC"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-gray-600 space-y-1">
                        <div>Type: <span className="font-semibold">{promo.discountType}</span></div>
                        <div>Amount: <span className="font-semibold">{promo.amount}{promo.discountType === "PERCENT" ? "%" : ""}</span></div>
                        <div>Max Discount: {promo.maxDiscount ?? "-"}</div>
                        <div>Min Order: {promo.minOrderAmount ?? "-"}</div>
                        <div>Per User Limit: {promo.perUserLimit ?? "-"}</div>
                        <div>Usage: {promo.usedCount ?? 0} / {promo.usageLimit ?? "Unlimited"}</div>
                        <div>Validity: {fmtDate(promo.startsAt)} {"->"} {fmtDate(promo.expiresAt)}</div>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <button
                          disabled={busyPromoId === promo.id}
                          onClick={() => onTogglePromo(promo)}
                          className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 disabled:opacity-60"
                        >
                          {promo.isActive ? <FaToggleOff /> : <FaToggleOn />}
                          {promo.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          disabled={busyPromoId === promo.id}
                          onClick={() => onDeletePromo(promo)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-200 text-red-600 px-3 py-1.5 text-xs font-semibold hover:bg-red-50 disabled:opacity-60"
                        >
                          <FaTrash />
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t">
                <button
                  onClick={() => setShowDeleted((v) => !v)}
                  className="text-sm font-semibold text-red-600 underline"
                >
                  {showDeleted ? "Hide Archived Promos" : `Show Archived Promos (${stats.deleted})`}
                </button>
                {showDeleted && (
                  <div className="mt-4 rounded-xl border">
                    {deletedLoading ? (
                      <div className="p-5 text-gray-500"><FaSpinner className="animate-spin inline-block mr-2" /> Loading archived promos...</div>
                    ) : deletedPromos.length === 0 ? (
                      <div className="p-5 text-gray-500">No archived promos found.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left">Code</th>
                              <th className="px-4 py-3 text-left">Reason</th>
                              <th className="px-4 py-3 text-left">Deleted At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {deletedPromos.map((p) => (
                              <tr key={p.id} className="border-t">
                                <td className="px-4 py-3 font-semibold">{p.code}</td>
                                <td className="px-4 py-3">{p.reason || "-"}</td>
                                <td className="px-4 py-3">{fmtDate(p.deletedAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white text-center py-5 px-4 relative">
              <h3 className="text-2xl font-bold">New Promo Code</h3>
              <button aria-label="Close" onClick={() => setIsModalOpen(false)} className="absolute top-3 right-3 text-white">x</button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Code</label>
                  <input
                    type="text"
                    placeholder="HEALTH20"
                    {...register("code", { required: "Code is required", minLength: { value: 3, message: "Enter valid code" } })}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.code ? "border-red-500" : "border-gray-300"} rounded-md`}
                  />
                  {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input type="text" {...register("description")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Discount Type</label>
                    <select {...register("discountType", { required: true })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="PERCENT">PERCENT</option>
                      <option value="FLAT">FLAT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("amount", { required: "Amount is required", min: { value: 0.01, message: "Must be > 0" } })}
                      className={`mt-1 block w-full px-3 py-2 border ${errors.amount ? "border-red-500" : "border-gray-300"} rounded-md`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Discount</label>
                    <input
                      type="number"
                      step="0.01"
                      disabled={discountType === "FLAT"}
                      {...register("maxDiscount")}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Min Order Amount</label>
                    <input type="number" step="0.01" {...register("minOrderAmount")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Usage Limit</label>
                    <input type="number" {...register("usageLimit")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Per User Limit</label>
                    <input type="number" {...register("perUserLimit")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Starts At</label>
                    <input type="date" {...register("startsAt")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expires At</label>
                    <input type="date" {...register("expiresAt")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input type="checkbox" {...register("isHidden")} />
                  Hidden coupon (not visible to users list, but works when typed)
                </label>

                <div className="flex items-center gap-3 justify-end">
                  <button type="button" onClick={() => reset()} className="px-4 py-2 rounded-md border">Reset</button>
                  <button type="submit" disabled={!isValid || isSubmitting} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                    {isSubmitting ? <FaSpinner className="animate-spin" /> : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(PromoCodesOnboarding);

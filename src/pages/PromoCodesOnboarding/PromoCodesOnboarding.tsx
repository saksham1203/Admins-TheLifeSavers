import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { FaSpinner, FaPlus, FaTicketAlt } from "react-icons/fa";
import axios from "axios";
import { Preferences } from "@capacitor/preferences";

interface PromoFormInput {
  code: string;
  description: string;
  discountType: "PERCENT" | "FIXED";
  amount: number | string;
  maxDiscount?: number | string;
  minOrderAmount?: number | string;
  startsAt?: string; // YYYY-MM-DD
  expiresAt?: string; // YYYY-MM-DD
  usageLimit?: number | string;
}

interface PromoItem {
  id: string;
  code: string;
  description?: string;
  discountType: string;
  amount: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
  usageLimit?: number;
  usedCount?: number;
  createdAt?: string;
}

const API_BASE = "https://dev-service-thelifesavers-in.onrender.com/api";

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

async function postPromoToApi(payload: Partial<PromoFormInput>) {
  const client = await axiosWithAuth();
  const res = await client.post("/promocodes", payload);
  return res.data;
}

// NEW: fetch promos
async function fetchPromosFromApi(): Promise<PromoItem[]> {
  const client = await axiosWithAuth();
  const res = await client.get("/promocodes");
  const data: any = res.data;
  // support both shapes: { promos: [...] } or an array
  if (Array.isArray(data)) return data as PromoItem[];
  if (data?.promos && Array.isArray(data.promos)) return data.promos as PromoItem[];
  return [];
}

const PromoCodesOnboarding: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [isLoadingPromos, setIsLoadingPromos] = useState(false);
  const [promosError, setPromosError] = useState<string | null>(null);

  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
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
    },
  });

  // NEW: fetchPromos wrapper for component
  const fetchPromos = useCallback(async () => {
    setIsLoadingPromos(true);
    setPromosError(null);
    try {
      const items = await fetchPromosFromApi();
      setPromos(items);
    } catch (err: any) {
      console.error("fetchPromos error", err);
      setPromosError(err?.response?.data?.message || err?.message || "Failed to fetch promos");
      setPromos([]);
    } finally {
      setIsLoadingPromos(false);
    }
  }, []);

  // fetch promos on mount
  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  useEffect(() => {
    if (!isModalOpen) return;
    const t = setTimeout(() => firstInputRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, [isModalOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsModalOpen(false);
    }
    if (isModalOpen) {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [isModalOpen]);

  const onSubmit: SubmitHandler<PromoFormInput> = useCallback(
    async (formData) => {
      setIsSubmitting(true);
      try {
        const payload: Partial<PromoFormInput> = {
          code: (formData.code || "").toString().trim(),
          description: (formData.description || "").toString().trim(),
          discountType: formData.discountType,
          amount: Number(formData.amount) || 0,
          maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
          minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : undefined,
          startsAt: formData.startsAt || undefined,
          expiresAt: formData.expiresAt || undefined,
          usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        };

        const res = await postPromoToApi(payload);
        if (res?.success && res?.promo) {
          toast.success(res.message || "Promo code created");
          const p: PromoItem = {
            id: res.promo.id || res.promo._id,
            code: res.promo.code,
            description: res.promo.description,
            discountType: res.promo.discountType,
            amount: Number(res.promo.amount) || 0,
            maxDiscount: res.promo.maxDiscount ?? undefined,
            minOrderAmount: res.promo.minOrderAmount ?? undefined,
            startsAt: res.promo.startsAt,
            expiresAt: res.promo.expiresAt,
            isActive: res.promo.isActive,
            usageLimit: res.promo.usageLimit,
            usedCount: res.promo.usedCount,
            createdAt: res.promo.createdAt,
          };
          // append locally (optimistic)
          setPromos((prev) => [p, ...prev]);
          reset();
          setIsModalOpen(false);

          setTimeout(() => {
            try {
              const el = document.getElementById(`promo-card-${p.id}`);
              el?.scrollIntoView({ behavior: "smooth", block: "center" });
              el?.classList.add("ring", "ring-red-200");
              setTimeout(() => el?.classList.remove("ring", "ring-red-200"), 1600);
            } catch {}
          }, 120);
        } else {
          toast.error(res?.message || "Unexpected server response");
        }
      } catch (err: any) {
        console.error("postPromo error", err);
        toast.error(err?.response?.data?.message || err?.message || "Failed to create promo code");
      } finally {
        setIsSubmitting(false);
      }
    },
    [reset]
  );

  return (
    <>
      <Toaster />

      <div className="min-h-screen bg-gray-50 flex items-start justify-center p-6 pt-20">
        <div className="w-full max-w-5xl">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white py-8 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-extrabold">Promo Codes</h1>
                <p className="mt-2 text-sm sm:text-base opacity-90">Create promo codes and manage active promotions.</p>
              </div>

              <div className="flex justify-center sm:justify-end">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-white text-red-600 font-semibold px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:bg-red-50 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/60"
                >
                  <FaPlus className="text-sm" />
                  <span className="text-sm sm:text-base">New Promo</span>
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Created Promo Codes</h2>
                <div className="flex items-center gap-3">
                  {/* Refresh now triggers fetchPromos */}
                  <button onClick={() => fetchPromos()} className="text-sm underline">Refresh</button>
                </div>
              </div>

              {isLoadingPromos ? (
                <div className="py-16 text-center text-gray-500"><FaSpinner className="animate-spin inline-block mr-2" /> Loading promos...</div>
              ) : promosError ? (
                <div className="py-12 text-center text-red-500">Failed to load promos: {promosError}</div>
              ) : promos.length === 0 ? (
                <div className="py-12 text-center text-gray-500">No promos yet. Click "New Promo" to create one.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {promos.map((promo) => (
                    <article id={`promo-card-${promo.id}`} key={promo.id} className="group bg-white border rounded-xl p-4 overflow-hidden shadow-sm transform transition hover:-translate-y-1 hover:shadow-lg">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-800">{promo.code}</h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{promo.description}</p>
                          <div className="text-xs text-gray-400 mt-2">ID: <span className="font-mono text-xs text-gray-600">{promo.id}</span></div>
                        </div>

                        <div className="flex-shrink-0 text-right">
                          <div className="inline-flex items-center gap-1 text-sm font-medium text-yellow-600">
                            <FaTicketAlt />
                          </div>
                          <div className="text-xs text-gray-400 mt-1">{promo.createdAt ? new Date(promo.createdAt).toLocaleDateString() : '—'}</div>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-gray-500 flex flex-col gap-2">
                        <div>Type: {promo.discountType}</div>
                        <div>Amount: {promo.amount}{promo.discountType === 'PERCENT' ? '%' : ''}</div>
                        <div>Max Discount: {promo.maxDiscount ?? '—'}</div>
                        <div>Min Order: {promo.minOrderAmount ?? '—'}</div>
                        <div>Usage Limit: {promo.usageLimit ?? '—'}</div>
                        <div>Valid: {promo.startsAt ? new Date(promo.startsAt).toLocaleDateString() : '—'} → {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : '—'}</div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="new-promo-title" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setIsModalOpen(false)} />

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white text-center py-5 px-4 relative">
              <h3 id="new-promo-title" className="text-2xl font-bold">New Promo Code</h3>
              <button aria-label="Close" onClick={() => setIsModalOpen(false)} className="absolute top-3 right-3 text-white hover:text-gray-200">✕</button>
            </div>

            <div className="p-6 sm:p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-live="polite">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">Code</label>
                  <input id="code" type="text" placeholder="HEALTH20" {...register("code", { required: "Code is required", minLength: { value: 3, message: "Enter a valid code" } })} ref={(el) => { (register("code").ref as any)(el); firstInputRef.current = el; }} className={`mt-1 block w-full px-3 py-2 border ${errors.code ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`} />
                  {errors.code && (<p className="text-red-500 text-sm mt-1" role="alert">{errors.code.message}</p>)}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <input id="description" type="text" placeholder="20% off on lab orders" {...register("description")} className={`mt-1 block w-full px-3 py-2 border ${errors.description ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="discountType" className="block text-sm font-medium text-gray-700">Discount Type</label>
                    <select id="discountType" {...register("discountType", { required: true })} className={`mt-1 block w-full px-3 py-2 border ${errors.discountType ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}>
                      <option value="PERCENT">PERCENT</option>
                      <option value="FIXED">FIXED</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                    <input id="amount" type="number" step="0.01" {...register("amount", { required: "Amount is required", min: { value: 0, message: "Must be >= 0" } })} className={`mt-1 block w-full px-3 py-2 border ${errors.amount ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`} />
                    {errors.amount && (<p className="text-red-500 text-sm mt-1" role="alert">{errors.amount.message}</p>)}
                  </div>

                  <div>
                    <label htmlFor="maxDiscount" className="block text-sm font-medium text-gray-700">Max Discount</label>
                    <input id="maxDiscount" type="number" step="0.01" {...register("maxDiscount")} className={`mt-1 block w-full px-3 py-2 border ${errors.maxDiscount ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="minOrderAmount" className="block text-sm font-medium text-gray-700">Min Order Amount</label>
                    <input id="minOrderAmount" type="number" step="0.01" {...register("minOrderAmount")} className={`mt-1 block w-full px-3 py-2 border ${errors.minOrderAmount ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`} />
                  </div>

                  <div>
                    <label htmlFor="startsAt" className="block text-sm font-medium text-gray-700">Starts At</label>
                    <input id="startsAt" type="date" {...register("startsAt")} className={`mt-1 block w-full px-3 py-2 border ${errors.startsAt ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`} />
                  </div>

                  <div>
                    <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700">Expires At</label>
                    <input id="expiresAt" type="date" {...register("expiresAt")} className={`mt-1 block w-full px-3 py-2 border ${errors.expiresAt ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`} />
                  </div>
                </div>

                <div>
                  <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700">Usage Limit</label>
                  <input id="usageLimit" type="number" {...register("usageLimit")} className={`mt-1 block w-full px-3 py-2 border ${errors.usageLimit ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`} />
                </div>

                <div className="flex items-center gap-3 justify-end">
                  <button type="button" onClick={() => { reset(); }} className="px-4 py-2 rounded-md border">Reset</button>
                  <button type="submit" disabled={!isValid || isSubmitting} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                    {isSubmitting ? <FaSpinner className="animate-spin" /> : <span>Create</span>}
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

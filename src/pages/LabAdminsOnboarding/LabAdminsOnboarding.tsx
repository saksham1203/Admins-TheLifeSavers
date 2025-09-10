import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { FaSpinner, FaPlus, FaUser } from "react-icons/fa";
import axios from "axios";
import { Preferences } from "@capacitor/preferences";

interface LabAdminFormInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  labId: string;
}

interface LabItem {
  id: string;
  name: string;
  address?: string;
}

interface AdminItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  labId?: string;
  createdAt?: string;
}

const API_BASE = "https://dev-service-thelifesavers-in.onrender.com/api"; // adjust to your environment

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

async function fetchLabsFromApi(): Promise<LabItem[]> {
  const client = await axiosWithAuth();
  const res = await client.get("/labs");
  const data: any = res.data;
  if (Array.isArray(data)) return data.map((d: any) => ({ id: d.id || d._id, name: d.name, address: d.address }));
  if (data?.labs && Array.isArray(data.labs)) return data.labs.map((d: any) => ({ id: d.id || d._id, name: d.name, address: d.address }));
  return [];
}

async function postAdminToApi(payload: Partial<LabAdminFormInput>) {
  const client = await axiosWithAuth();
  const res = await client.post("/lab-admins/register", payload);
  return res.data;
}

const LabAdminsOnboarding: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [labs, setLabs] = useState<LabItem[]>([]);
  const [isLoadingLabs, setIsLoadingLabs] = useState(false);
  const [, setLabsError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [isLoadingAdmins] = useState(false);

  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<LabAdminFormInput>({ mode: "onChange", defaultValues: { name: "", email: "", password: "", phone: "", labId: "" } });

  const fetchLabs = useCallback(async () => {
    setIsLoadingLabs(true);
    setLabsError(null);
    try {
      const items = await fetchLabsFromApi();
      setLabs(items);
    } catch (err: any) {
      console.error("fetchLabs error", err);
      setLabsError(err?.response?.data?.message || err?.message || "Failed to fetch labs");
      setLabs([]);
    } finally {
      setIsLoadingLabs(false);
    }
  }, []);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  useEffect(() => {
    if (!isModalOpen) return;
    const t = setTimeout(() => firstInputRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, [isModalOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    }
    if (isModalOpen) {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [isModalOpen]);

  const onSubmit: SubmitHandler<LabAdminFormInput> = useCallback(
    async (formData) => {
      setIsSubmitting(true);
      try {
        const payload: Partial<LabAdminFormInput> = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          labId: formData.labId,
        };

        const res = await postAdminToApi(payload);
        if (res?.success && res?.admin) {
          toast.success(res.message || "Admin registered");
          const newAdmin: AdminItem = {
            id: res.admin.id || res.admin._id,
            name: res.admin.name,
            email: res.admin.email,
            phone: payload.phone,
            labId: payload.labId,
            createdAt: new Date().toISOString(),
          };
          setAdmins((p) => [newAdmin, ...p]);
          reset();
          setIsModalOpen(false);

          setTimeout(() => {
            try {
              const el = document.getElementById(`admin-card-${newAdmin.id}`);
              el?.scrollIntoView({ behavior: "smooth", block: "center" });
              el?.classList.add("ring", "ring-red-200");
              setTimeout(() => el?.classList.remove("ring", "ring-red-200"), 1600);
            } catch (e) {}
          }, 120);
        } else {
          toast.error(res?.message || "Unexpected server response");
        }
      } catch (err: any) {
        console.error("register admin error", err);
        toast.error(err?.response?.data?.message || err?.message || "Failed to register admin");
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
                <h1 className="text-3xl sm:text-4xl font-extrabold">Lab Admins Onboarding</h1>
                <p className="mt-2 text-sm sm:text-base opacity-90">Register lab admins and assign them to labs.</p>
              </div>

              <div className="flex justify-center sm:justify-end">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-white text-red-600 font-semibold px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:bg-red-50 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/60"
                  aria-haspopup="dialog"
                >
                  <FaPlus className="text-sm" />
                  <span className="text-sm sm:text-base">New Admin</span>
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Registered Admins</h2>
                <div className="flex items-center gap-3">
                  <button onClick={() => fetchLabs()} className="text-sm underline">Refresh</button>
                </div>
              </div>

              {isLoadingAdmins ? (
                <div className="py-16 text-center text-gray-500"><FaSpinner className="animate-spin inline-block mr-2" /> Loading admins...</div>
              ) : admins.length === 0 ? (
                <div className="py-12 text-center text-gray-500">No admins registered yet. Click "New Admin" to add one.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {admins.map((admin) => (
                    <article id={`admin-card-${admin.id}`} key={admin.id} className="group bg-white border rounded-xl p-0 overflow-hidden shadow-sm transform transition hover:-translate-y-1 hover:shadow-lg">
                      <div className="p-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-800">{admin.name}</h3>
                            <p className="text-xs text-gray-500 mt-1 truncate">{admin.email}</p>
                            <div className="text-xs text-gray-400 mt-2">ID: <span className="font-mono text-xs text-gray-600">{admin.id}</span></div>
                          </div>

                          <div className="flex-shrink-0 text-right">
                            <div className="inline-flex items-center gap-1 text-sm font-medium text-gray-600">
                              <FaUser />
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '—'}</div>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-xs text-gray-500">Phone: {admin.phone ?? '—'}</div>
                          <div className="text-xs text-gray-500">Lab: {labs.find(l => l.id === admin.labId)?.name ?? (admin.labId ?? '—')}</div>
                        </div>
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
        <div role="dialog" aria-modal="true" aria-labelledby="new-admin-title" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setIsModalOpen(false)} />

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white text-center py-5 px-4 relative">
              <h3 id="new-admin-title" className="text-2xl font-bold">New Lab Admin</h3>
              <button aria-label="Close" onClick={() => setIsModalOpen(false)} className="absolute top-3 right-3 text-white hover:text-gray-200">✕</button>
            </div>

            <div className="p-6 sm:p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-live="polite">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Lab Manager"
                    {...register("name", { required: "Name is required", minLength: { value: 2, message: "Enter a valid name" } })}
                    ref={(el) => { const r = register('name'); if (r && (r as any).ref) (r as any).ref(el); firstInputRef.current = el; }}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                    aria-invalid={errors.name ? "true" : "false"}
                  />
                  {errors.name && (<p className="text-red-500 text-sm mt-1" role="alert">{errors.name.message}</p>)}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="labadmin@example.com"
                    {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" } })}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                    aria-invalid={errors.email ? "true" : "false"}
                  />
                  {errors.email && (<p className="text-red-500 text-sm mt-1" role="alert">{errors.email.message}</p>)}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="StrongPass123"
                    {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                    aria-invalid={errors.password ? "true" : "false"}
                  />
                  {errors.password && (<p className="text-red-500 text-sm mt-1" role="alert">{errors.password.message}</p>)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      {...register("phone", { required: "Phone is required", minLength: { value: 10, message: "Enter a valid phone" } })}
                      className={`mt-1 block w-full px-3 py-2 border ${errors.phone ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                      aria-invalid={errors.phone ? "true" : "false"}
                    />
                    {errors.phone && (<p className="text-red-500 text-sm mt-1" role="alert">{errors.phone.message}</p>)}
                  </div>

                  <div>
                    <label htmlFor="labId" className="block text-sm font-medium text-gray-700">Assign to Lab</label>
                    <select
                      id="labId"
                      {...register("labId", { required: "Select a lab" })}
                      className={`mt-1 block w-full px-3 py-2 border ${errors.labId ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                      aria-invalid={errors.labId ? "true" : "false"}
                    >
                      <option value="">Select lab</option>
                      {isLoadingLabs ? <option value="">Loading labs...</option> : labs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    {errors.labId && (<p className="text-red-500 text-sm mt-1" role="alert">{errors.labId.message}</p>)}
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-end">
                  <button type="button" onClick={() => { reset(); }} className="px-4 py-2 rounded-md border">Reset</button>

                  <button type="submit" disabled={!isValid || isSubmitting} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                    {isSubmitting ? <FaSpinner className="animate-spin" /> : <span>Register</span>}
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

export default React.memo(LabAdminsOnboarding);

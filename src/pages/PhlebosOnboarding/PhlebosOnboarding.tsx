import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { FaSpinner, FaPlus, FaTrash, FaToggleOn } from "react-icons/fa";
import axios from "axios";
import { Preferences } from "@capacitor/preferences";

interface LabItem {
  id: string;
  name: string;
  address?: string;
}

interface PhleboFormInput {
  labId: string;
  firstName: string;
  lastName: string;
  mobile: string;
  alternate?: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isActive?: boolean;
}

interface PhleboItem {
  id: string;
  labId: string;
  firstName: string;
  lastName: string;
  mobile: string;
  alternate?: string | null;
  email?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
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

/* API helpers */
async function fetchLabsFromApi(): Promise<LabItem[]> {
  const client = await axiosWithAuth();
  const res = await client.get("/labs");
  const data: any = res.data;
  if (Array.isArray(data)) return data;
  if (data?.labs && Array.isArray(data.labs)) return data.labs;
  return [];
}

async function fetchPhlebosFromApi(labId: string): Promise<PhleboItem[]> {
  const client = await axiosWithAuth();
  const res = await client.get(`/phlebos`, { params: { labId } });
  const data: any = res.data;
  if (Array.isArray(data)) return data;
  if (data?.phlebos && Array.isArray(data.phlebos)) return data.phlebos;
  return [];
}

async function postPhleboToApi(payload: Partial<PhleboFormInput>) {
  const client = await axiosWithAuth();
  const res = await client.post("/phlebos", payload);
  return res.data;
}

async function togglePhleboApi(id: string) {
  const client = await axiosWithAuth();
  const res = await client.patch(`/phlebos/${id}/toggle`);
  return res.data;
}

async function deletePhleboApi(id: string) {
  const client = await axiosWithAuth();
  const res = await client.delete(`/phlebos/${id}`);
  return res.data;
}

/* Component */
const PhlebosOnboarding: React.FC = () => {
  const [labs, setLabs] = useState<LabItem[]>([]);
  const [selectedLabId, setSelectedLabId] = useState<string>("");
  const [, setIsLoadingLabs] = useState(false);
  const [, setLabsError] = useState<string | null>(null);

  const [phlebos, setPhlebos] = useState<PhleboItem[]>([]);
  const [isLoadingPhlebos, setIsLoadingPhlebos] = useState(false);
  const [phlebosError, setPhlebosError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    setValue,
  } = useForm<PhleboFormInput>({
    mode: "onChange",
    defaultValues: {
      labId: "",
      firstName: "",
      lastName: "",
      mobile: "",
      alternate: "",
      email: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      isActive: true,
    },
  });

  /* Fetch labs */
  const fetchLabs = useCallback(async () => {
    setIsLoadingLabs(true);
    setLabsError(null);
    try {
      const items = await fetchLabsFromApi();
      setLabs(items);
      if (items.length > 0 && !selectedLabId) {
        setSelectedLabId(items[0].id);
        setValue("labId", items[0].id);
      }
    } catch (err: any) {
      console.error("fetchLabs error", err);
      setLabsError(
        err?.response?.data?.message || err?.message || "Failed to fetch labs"
      );
      setLabs([]);
    } finally {
      setIsLoadingLabs(false);
    }
  }, [selectedLabId, setValue]);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  /* Fetch phlebos for selected lab */
  const fetchPhlebos = useCallback(
    async (labId?: string) => {
      const id = labId ?? selectedLabId;
      if (!id) {
        setPhlebos([]);
        return;
      }
      setIsLoadingPhlebos(true);
      setPhlebosError(null);
      try {
        const items = await fetchPhlebosFromApi(id);
        setPhlebos(items);
      } catch (err: any) {
        console.error("fetchPhlebos error", err);
        setPhlebosError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch phlebos"
        );
        setPhlebos([]);
      } finally {
        setIsLoadingPhlebos(false);
      }
    },
    [selectedLabId]
  );

  useEffect(() => {
    if (selectedLabId) fetchPhlebos(selectedLabId);
  }, [selectedLabId, fetchPhlebos]);

  /* modal focus */
  useEffect(() => {
    if (!isModalOpen) return;
    const t = setTimeout(() => firstInputRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, [isModalOpen]);

  /* Submit create phlebo */
  const onSubmit: SubmitHandler<PhleboFormInput> = useCallback(
    async (formData) => {
      setIsSubmitting(true);
      try {
        const payload: Partial<PhleboFormInput> = {
          labId: formData.labId,
          firstName: (formData.firstName || "").trim(),
          lastName: (formData.lastName || "").trim(),
          mobile: (formData.mobile || "").trim(),
          alternate: formData.alternate
            ? (formData.alternate || "").trim()
            : undefined,
          email: formData.email ? (formData.email || "").trim() : undefined,
          addressLine1: (formData.addressLine1 || "").trim(),
          addressLine2: formData.addressLine2
            ? (formData.addressLine2 || "").trim()
            : undefined,
          city: (formData.city || "").trim(),
          state: (formData.state || "").trim(),
          pincode: (formData.pincode || "").trim(),
          isActive:
            typeof formData.isActive === "boolean" ? formData.isActive : true,
        };

        const res = await postPhleboToApi(payload);
        if (res?.success && res?.phlebo) {
          toast.success("Phlebotomist created");
          // prepend to list if same lab
          if (res.phlebo.labId === selectedLabId) {
            setPhlebos((p) => [res.phlebo as PhleboItem, ...p]);
          } else {
            // if created for another lab, optionally refresh current list
            fetchPhlebos(selectedLabId);
          }
          reset();
          setIsModalOpen(false);

          setTimeout(() => {
            try {
              const el = document.getElementById(
                `phlebo-card-${res.phlebo.id}`
              );
              el?.scrollIntoView({ behavior: "smooth", block: "center" });
              el?.classList.add("ring", "ring-red-200");
              setTimeout(
                () => el?.classList.remove("ring", "ring-red-200"),
                1600
              );
            } catch {}
          }, 120);
        } else {
          toast.error(res?.message || "Unexpected server response");
        }
      } catch (err: any) {
        console.error("postPhlebo error", err);
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to create phlebotomist"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [reset, selectedLabId, fetchPhlebos]
  );

  /* Toggle active */
  const handleToggle = useCallback(async (id: string) => {
    setIsTogglingId(id);
    try {
      const res = await togglePhleboApi(id);
      if (res?.success) {
        toast.success(res.message || "Updated");
        // optimistic update
        setPhlebos((prev) =>
          prev.map((p) => (p.id === id ? (res.phlebo as PhleboItem) : p))
        );
      } else {
        toast.error(res?.message || "Failed to update");
      }
    } catch (err: any) {
      console.error("togglePhlebo error", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to update"
      );
    } finally {
      setIsTogglingId(null);
    }
  }, []);

  /* Delete */
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete phlebotomist? This action cannot be undone.")) return;
    setIsDeletingId(id);
    try {
      const res = await deletePhleboApi(id);
      if (res?.success) {
        toast.success(res.message || "Deleted");
        setPhlebos((prev) => prev.filter((p) => p.id !== id));
      } else {
        toast.error(res?.message || "Failed to delete");
      }
    } catch (err: any) {
      console.error("deletePhlebo error", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to delete"
      );
    } finally {
      setIsDeletingId(null);
    }
  }, []);

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gray-50 flex items-start justify-center p-6 pt-20">
        <div className="w-full max-w-6xl">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white py-8 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-extrabold">
                  Phlebotomists
                </h1>
                <p className="mt-2 text-sm sm:text-base opacity-90">
                  Create and manage phlebotomists across labs.
                </p>
              </div>

              <div className="flex justify-center sm:justify-end items-center gap-3">
                <div className="hidden sm:block">
                  <div className="relative">
                    <select
                      value={selectedLabId}
                      onChange={(e) => {
                        setSelectedLabId(e.target.value);
                        setValue("labId", e.target.value);
                      }}
                      className="appearance-none w-36 sm:w-40 px-3 py-2 rounded-full bg-white text-red-600 font-semibold text-sm shadow-md border border-gray-200 cursor-pointer hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-white/60 transition"
                    >
                      <option value="">Select Lab</option>
                      {labs.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>

                    {/* custom caret */}
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-red-500 text-xs">
                      ▼
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    // prefill labId in form if we have selectedLabId
                    if (selectedLabId) setValue("labId", selectedLabId);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 bg-white text-red-600 font-semibold px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:bg-red-50 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/60"
                >
                  <FaPlus className="text-sm" />
                  <span className="text-sm sm:text-base">New Phlebo</span>
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  Registered Phlebotomists
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      // if no lab selected, refresh labs, else refresh phlebos
                      if (!selectedLabId) fetchLabs();
                      fetchPhlebos(selectedLabId);
                    }}
                    className="text-sm underline"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {isLoadingPhlebos ? (
                <div className="py-16 text-center text-gray-500">
                  <FaSpinner className="animate-spin inline-block mr-2" />{" "}
                  Loading phlebos...
                </div>
              ) : phlebosError ? (
                <div className="py-12 text-center text-red-500">
                  Failed to load phlebos: {phlebosError}
                </div>
              ) : phlebos.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  No phlebotomists for this lab. Create one using "New Phlebo".
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {phlebos.map((p) => (
                    <article
                      id={`phlebo-card-${p.id}`}
                      key={p.id}
                      className="group bg-white border rounded-xl p-4 overflow-hidden shadow-sm transform transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                            {p.firstName} {p.lastName}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {p.email || p.mobile}
                          </p>
                          <div className="text-xs text-gray-400 mt-2">
                            ID:{" "}
                            <span className="font-mono text-xs text-gray-600">
                              {p.id}
                            </span>
                          </div>
                        </div>

                        <div className="flex-shrink-0 text-right">
                          <div className="text-xs text-gray-400 mt-1">
                            {p.createdAt
                              ? new Date(p.createdAt).toLocaleDateString()
                              : "—"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-gray-500 flex flex-col gap-2">
                        <div>Mobile: {p.mobile}</div>
                        <div>Alternate: {p.alternate ?? "—"}</div>
                        <div>
                          Address: {p.addressLine1 ?? "—"}{" "}
                          {p.addressLine2 ? `, ${p.addressLine2}` : ""}
                        </div>
                        <div>
                          {p.city ?? "—"} {p.state ? `, ${p.state}` : ""}{" "}
                          {p.pincode ? `— ${p.pincode}` : ""}
                        </div>
                        <div className="flex items-center gap-2 justify-end mt-2">
                          <button
                            onClick={() => handleToggle(p.id)}
                            disabled={isTogglingId === p.id}
                            className="text-xs px-2 py-1 rounded-md border hover:bg-gray-50 inline-flex items-center gap-2"
                            title={p.isActive ? "Deactivate" : "Activate"}
                          >
                            {isTogglingId === p.id ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <FaToggleOn />
                            )}
                            <span>{p.isActive ? "Active" : "Inactive"}</span>
                          </button>

                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={isDeletingId === p.id}
                            className="text-xs px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-2"
                          >
                            {isDeletingId === p.id ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <FaTrash />
                            )}
                            <span>Delete</span>
                          </button>
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

      {/* Modal: New Phlebo */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-phlebo-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-auto max-h-[90vh] animate-fade-in">
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white text-center py-5 px-4 relative">
              <h3 id="new-phlebo-title" className="text-2xl font-bold">
                New Phlebotomist
              </h3>
              <button
                aria-label="Close"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-3 right-3 text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="p-6 sm:p-8">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                aria-live="polite"
              >
                <div>
                  <label
                    htmlFor="labId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Assign Lab
                  </label>
                  <select
                    id="labId"
                    {...register("labId", { required: "Lab is required" })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.labId ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                  >
                    <option value="">Select lab</option>
                    {labs.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  {errors.labId && (
                    <p className="text-red-500 text-sm mt-1" role="alert">
                      {errors.labId.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      First name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      {...register("firstName", {
                        required: "First name is required",
                      })}
                      ref={(el) => {
                        (register("firstName").ref as any)(el);
                        firstInputRef.current = el;
                      }}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.firstName ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm sm:text-sm`}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1" role="alert">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Last name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      {...register("lastName", {
                        required: "Last name is required",
                      })}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.lastName ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm sm:text-sm`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1" role="alert">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="mobile"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Mobile
                    </label>
                    <input
                      id="mobile"
                      type="text"
                      {...register("mobile", {
                        required: "Mobile is required",
                        minLength: {
                          value: 7,
                          message: "Enter a valid mobile",
                        },
                      })}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.mobile ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm sm:text-sm`}
                    />
                    {errors.mobile && (
                      <p className="text-red-500 text-sm mt-1" role="alert">
                        {errors.mobile.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="alternate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Alternate (optional)
                    </label>
                    <input
                      id="alternate"
                      type="text"
                      {...register("alternate")}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email (optional)
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register("email", {
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email",
                      },
                    })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm sm:text-sm`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="addressLine1"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address line 1
                  </label>
                  <input
                    id="addressLine1"
                    type="text"
                    {...register("addressLine1", {
                      required: "Address is required",
                    })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.addressLine1 ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm sm:text-sm`}
                  />
                  {errors.addressLine1 && (
                    <p className="text-red-500 text-sm mt-1" role="alert">
                      {errors.addressLine1.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="addressLine2"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address line 2 (optional)
                  </label>
                  <input
                    id="addressLine2"
                    type="text"
                    {...register("addressLine2")}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700"
                    >
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      {...register("city", { required: "City is required" })}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm sm:text-sm`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1" role="alert">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-700"
                    >
                      State
                    </label>
                    <input
                      id="state"
                      type="text"
                      {...register("state", { required: "State is required" })}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.state ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm sm:text-sm`}
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1" role="alert">
                        {errors.state.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="pincode"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Pincode
                    </label>
                    <input
                      id="pincode"
                      type="text"
                      {...register("pincode", {
                        required: "Pincode is required",
                        minLength: {
                          value: 4,
                          message: "Enter a valid pincode",
                        },
                      })}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.pincode ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm sm:text-sm`}
                    />
                    {errors.pincode && (
                      <p className="text-red-500 text-sm mt-1" role="alert">
                        {errors.pincode.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                    }}
                    className="px-4 py-2 rounded-md border"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <span>Create</span>
                    )}
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

export default React.memo(PhlebosOnboarding);

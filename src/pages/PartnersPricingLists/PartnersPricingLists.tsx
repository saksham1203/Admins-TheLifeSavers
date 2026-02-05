import React, { useCallback, useRef, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FaPlus, FaSpinner, FaUpload, FaFileCsv, } from "react-icons/fa";
import { Preferences } from "@capacitor/preferences";

const API_BASE = "https://services.thelifesavers.in/api";

async function getAuthToken(): Promise<string | null> {
  const { value } = await Preferences.get({ key: "token" });
  return value ?? null;
}

async function axiosWithAuth() {
  const token = await getAuthToken();
  return axios.create({
    baseURL: API_BASE,
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });
}

const LAB_OPTIONS = [
  { label: "Healthians", value: "healthians" },
  { label: "Thyrocare", value: "thyrocare" },
  { label: "Dr. Mittal", value: "dr_mittal" },
];

const PARTNER_TYPES = [
  { label: "Chemist", value: "chemist" },
  { label: "Clinic", value: "clinics" },
  { label: "Gym", value: "gyms" },
  { label: "Others", value: "others" },
];

const PartnersPricingLists: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lab, setLab] = useState("healthians");
  const [partnerType, setPartnerType] = useState("chemist");
  const [pricingType, setPricingType] = useState<"tests" | "packages">("tests");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetForm = () => {
    setLab("healthians");
    setPartnerType("chemist");
    setPricingType("tests");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submitPricing = useCallback(async () => {
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    setIsSubmitting(true);
    try {
      const client = await axiosWithAuth();
      const formData = new FormData();
      formData.append("file", file);

      const url = `/admin/pricing/${pricingType}?lab=${lab}&partnerType=${partnerType}`;
      const res = await client.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        toast.success(`Uploaded successfully • ${res.data.finalCount} rows`);
        resetForm();
        setIsModalOpen(false);
      } else {
        toast.error(res.data?.message || "Upload failed");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  }, [file, lab, partnerType, pricingType]);

  return (
    <>
      <Toaster />

      {/* Full screen loader */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur">
          <FaSpinner className="animate-spin text-red-600 text-4xl mb-3" />
          <p className="text-sm text-gray-600">Uploading pricing… please wait</p>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 flex items-start justify-center p-6 pt-20">
        <div className="w-full max-w-5xl">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white py-10 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Partner Pricing Lists</h1>
                <p className="mt-2 text-sm opacity-90 max-w-xl">Upload CSV pricing sheets for partner-specific test and package pricing. Strict file matching is enforced.</p>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-white text-red-600 font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-red-50 transition"
              >
                <FaPlus /> Upload Pricing
              </button>
            </div>

            <div className="p-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">How to prepare your CSV</h2>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                    <li>File must be in <strong>.csv</strong> format</li>
                    <li>Column names must match <strong>exactly</strong> (case‑sensitive)</li>
                    <li>Prices should be numeric (no symbols)</li>
                    <li>For packages, use <strong>PACKAGE NAME</strong> instead of TEST NAME</li>
                    <li>STRICT_FILE_MATCH is enforced on upload</li>
                  </ul>
                </div>

                <div className="bg-gray-50 border rounded-xl p-4 overflow-auto">
                  <p className="text-sm font-medium text-gray-700 mb-2">Sample CSV format</p>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-200 text-gray-700">
                        <th className="border px-2 py-1">S. No.</th>
                        <th className="border px-2 py-1">TEST NAME</th>
                        <th className="border px-2 py-1">B2B Price</th>
                        <th className="border px-2 py-1">B2C Price</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      <tr>
                        <td className="border px-2 py-1">1</td>
                        <td className="border px-2 py-1">CBC</td>
                        <td className="border px-2 py-1">50</td>
                        <td className="border px-2 py-1">100</td>
                      </tr>
                      <tr>
                        <td className="border px-2 py-1">2</td>
                        <td className="border px-2 py-1">HbA1c</td>
                        <td className="border px-2 py-1">120</td>
                        <td className="border px-2 py-1">250</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-2 text-[11px] text-gray-500">For packages, replace <strong>TEST NAME</strong> with <strong>PACKAGE NAME</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setIsModalOpen(false)} />

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white text-center py-6">
              <h3 className="text-2xl font-bold">Upload Partner Pricing</h3>
              <p className="text-xs opacity-90 mt-1">CSV only • strict matching</p>
              <button onClick={() => setIsModalOpen(false)} className="absolute top-3 right-3">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <select value={pricingType} onChange={(e) => setPricingType(e.target.value as any)} className="border rounded-md px-3 py-2">
                  <option value="tests">Tests</option>
                  <option value="packages">Packages</option>
                </select>

                <select value={lab} onChange={(e) => setLab(e.target.value)} className="border rounded-md px-3 py-2">
                  {LAB_OPTIONS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>

              <select value={partnerType} onChange={(e) => setPartnerType(e.target.value)} className="w-full border rounded-md px-3 py-2">
                {PARTNER_TYPES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>

              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-8 cursor-pointer hover:border-red-400 transition">
                <FaFileCsv className="text-3xl text-red-500 mb-2" />
                <span className="text-sm text-gray-600">{file ? file.name : "Click to upload CSV file"}</span>
                <input ref={fileInputRef} type="file" accept=".csv" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={resetForm} type="button" className="px-4 py-2 border rounded-md">Reset</button>
                <button onClick={submitPricing} disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">
                  <FaUpload /> Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(PartnersPricingLists);

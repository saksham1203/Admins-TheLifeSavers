import React, { useCallback, useRef, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  FaPlus,
  FaSpinner,
  FaUpload,
  FaFileExcel,
} from "react-icons/fa";
import { Preferences } from "@capacitor/preferences";

/* ================= API ================= */
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

/* ================= OPTIONS ================= */

const LAB_OPTIONS = [
  { label: "Healthians", value: "healthians" },
  { label: "Thyrocare", value: "thyrocare" },
  { label: "Dr. Mittal", value: "dr_mittal" },
];

const PARTNER_TYPES = [
  { label: "Chemist", value: "chemist" },
  { label: "Clinic", value: "clinic" },
  { label: "Gym", value: "gym" },
];

/* ================= COMPONENT ================= */

const PartnersPricingLists: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lab, setLab] = useState("healthians");
  const [partnerType, setPartnerType] = useState("chemist");
  const [pricingType, setPricingType] =
    useState<"tests" | "packages">("tests");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ================= RESET ================= */
  const resetForm = () => {
    setLab("healthians");
    setPartnerType("chemist");
    setPricingType("tests");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ================= FILE VALIDATION ================= */
  const handleFileChange = (f?: File) => {
    if (!f) return;

    const valid =
      f.name.endsWith(".csv") ||
      f.name.endsWith(".xlsx") ||
      f.name.endsWith(".xls");

    if (!valid) {
      toast.error("Upload Excel (.xlsx) or CSV file");
      return;
    }

    setFile(f);
  };

  /* ================= UPLOAD ================= */
  const submitPricing = useCallback(async () => {
    if (!file) {
      toast.error("Please select a file");
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
        toast.success(
          `Uploaded successfully • ${res.data.totalProcessed} rows`
        );
        resetForm();
        setIsModalOpen(false);
      } else {
        toast.error(res.data?.message || "Upload failed");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err.message ||
          "Upload failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [file, lab, partnerType, pricingType]);

  return (
    <>
      <Toaster />

      {/* Loader */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur">
          <FaSpinner className="animate-spin text-red-600 text-4xl mb-3" />
          <p className="text-sm text-gray-600">
            Uploading pricing…
          </p>
        </div>
      )}

      {/* PAGE */}
      <div className="min-h-screen bg-gray-50 flex justify-center p-6 pt-20">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* HEADER */}
          <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white py-8 px-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold">
                Partner Pricing Lists
              </h1>
              <p className="text-sm opacity-90 mt-1">
                Upload Excel or CSV pricing sheets. Columns auto-detected.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-white text-red-600 font-semibold px-6 py-3 rounded-full shadow hover:bg-red-50"
            >
              <FaPlus /> Upload Pricing
            </button>
          </div>

          {/* FORMAT GUIDE */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* INFO */}
              <div>
                <h2 className="text-lg font-semibold mb-3">
                  Excel Preparation
                </h2>

                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                  <li>Upload .xlsx or .csv</li>
                  <li>Use TEST NAME or PACKAGE NAME</li>
                  <li>Headers auto-detected</li>
                  <li>Prices must be numeric</li>
                  <li>File mirrors database</li>
                  <li className="text-green-600 font-medium">
                    ✔ Header wording & casing do not matter
                  </li>
                </ul>
              </div>

              {/* EXCEL PREVIEW */}
              <div className="lg:col-span-2 bg-gray-50 border rounded-xl p-4">
                <p className="text-sm font-medium mb-3">
                  Sample Excel Structure
                </p>

                <div className="overflow-x-auto">
                  <table className="min-w-[950px] text-xs border-collapse">
                    <thead className="bg-gray-200">
                      <tr>
                        {[
                          "SR NO",
                          "TEST NAME",
                          "ACTUAL MRP",
                          "ADD 10%",
                          "MRP AFTER ADD",
                          "DISCOUNTED",
                          "B2B",
                          "TOTAL PROFIT",
                          "TLS MARGIN",
                          "PARTNER MARGIN",
                          "NEW B2P PRICE",
                        ].map((h) => (
                          <th
                            key={h}
                            className="border px-2 py-1 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <td className="border px-2 py-1">1</td>
                        <td className="border px-2 py-1">CBC</td>
                        <td className="border px-2 py-1">320</td>
                        <td className="border px-2 py-1">32</td>
                        <td className="border px-2 py-1">352</td>
                        <td className="border px-2 py-1">320</td>
                        <td className="border px-2 py-1">101</td>
                        <td className="border px-2 py-1">219</td>
                        <td className="border px-2 py-1">131</td>
                        <td className="border px-2 py-1">88</td>
                        <td className="border px-2 py-1 font-semibold">
                          232
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="mt-2 text-[11px] text-gray-500">
                  Replace TEST NAME with PACKAGE NAME for package uploads.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">

            <h3 className="text-xl font-bold text-center">
              Upload Partner Pricing
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <select
                value={pricingType}
                onChange={(e) =>
                  setPricingType(e.target.value as any)
                }
                className="border rounded-md px-3 py-2"
              >
                <option value="tests">Tests</option>
                <option value="packages">Packages</option>
              </select>

              <select
                value={lab}
                onChange={(e) => setLab(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                {LAB_OPTIONS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={partnerType}
              onChange={(e) => setPartnerType(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              {PARTNER_TYPES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>

            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-10 cursor-pointer hover:border-red-400">
              <FaFileExcel className="text-4xl text-red-500 mb-3" />
              <span className="text-sm text-gray-600">
                {file
                  ? file.name
                  : "Click to upload Excel / CSV"}
              </span>

              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".csv,.xlsx,.xls"
                onChange={(e) =>
                  handleFileChange(e.target.files?.[0])
                }
              />
            </label>

            <div className="flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 border rounded-md"
              >
                Reset
              </button>

              <button
                onClick={submitPricing}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                <FaUpload /> Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(PartnersPricingLists);
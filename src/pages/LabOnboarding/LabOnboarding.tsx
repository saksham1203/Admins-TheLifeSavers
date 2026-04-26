// src/pages/LabOnboarding.tsx
import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { FaSpinner, FaPlus, FaStar, FaPencilAlt } from "react-icons/fa";
import axios from "axios";
import { Preferences } from "@capacitor/preferences";

interface LabFormInput {
  name: string;
  imageUrl: string;
  address: string;
  rating: number | "";
}

interface PackageItem {
  id: string;
  labId: string;
  labName?: string;
  packageId?: string;
  name: string;
  includedTests?: string | string[]; // server sometimes returns a stringified array
  totalParams?: number;
  mrp?: number;
  discounted?: number;
  preparation?: string;
  reportTime?: string;
  description?: string;
}

interface TestItem {
  id: string;
  labId: string;
  labName?: string;
  testId?: string;
  name: string;
  code?: string;
  parameters?: number;
  includedTests?: string | string[]; // âœ… NEW
  mrp?: number;
  discounted?: number;
  preparation?: string;
  reportTime?: string;
  description?: string;
}

interface LabItem {
  id: string;
  name: string;
  imageUrl?: string;
  address?: string;
  rating?: number | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  packages?: PackageItem[];
  tests?: TestItem[];
}

interface PostLabResponse {
  success: boolean;
  message: string;
  lab: LabItem;
}

interface GetLabsResponse {
  success: boolean;
  labs: LabItem[];
}

const API_BASE = "https://services.thelifesavers.in/api";

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
  const res = await client.get<GetLabsResponse | LabItem[]>("/labs");
  const data = res.data as any;
  if (Array.isArray(data)) return data;
  if (data?.labs && Array.isArray(data.labs)) return data.labs;
  return [];
}

async function postLabToApi(payload: Partial<LabFormInput>): Promise<PostLabResponse> {
  const client = await axiosWithAuth();
  const res = await client.post<PostLabResponse>("/labs", payload);
  return res.data;
}

async function patchLabToApi(labId: string, payload: Partial<LabFormInput> & { isActive?: boolean }) {
  const client = await axiosWithAuth();
  const res = await client.patch(`/labs/${labId}`, payload);
  return res.data;
}

async function deleteLabFromApi(labId: string) {
  const client = await axiosWithAuth();
  const res = await client.delete(`/labs/${labId}`);
  return res.data;
}

// Post package to /labs/:id/packages
async function postPackageToApi(labId: string, payload: any) {
  const client = await axiosWithAuth();
  const res = await client.post(`/labs/${labId}/packages`, payload);
  return res.data;
}

async function patchPackageToApi(labId: string, packageEntryId: string, payload: any) {
  const client = await axiosWithAuth();
  const res = await client.patch(`/labs/${labId}/packages/${packageEntryId}`, payload);
  return res.data;
}

// Post test to /labs/:id/tests
async function postTestToApi(labId: string, payload: any) {
  const client = await axiosWithAuth();
  const res = await client.post(`/labs/${labId}/tests`, payload);
  return res.data;
}

async function patchTestToApi(labId: string, testEntryId: string, payload: any) {
  const client = await axiosWithAuth();
  const res = await client.patch(`/labs/${labId}/tests/${testEntryId}`, payload);
  return res.data;
}

const LabOnboarding: React.FC = () => {
  // UI & data state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [labs, setLabs] = useState<LabItem[]>([]);
  const [isLoadingLabs, setIsLoadingLabs] = useState(false);
  const [labsError, setLabsError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // package/test modal state (Actions)
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [activeLabForPackage, setActiveLabForPackage] = useState<LabItem | null>(null);
  const [isPostingPackage, setIsPostingPackage] = useState(false);
  const [isPostingTest, setIsPostingTest] = useState(false);
  const [isUpdatingLab, setIsUpdatingLab] = useState<string | null>(null);
  const [isDeletingLab, setIsDeletingLab] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"packages" | "tests">("packages");
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);

  // details modal state (Details)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [activeLabForDetails, setActiveLabForDetails] = useState<LabItem | null>(null);
  const [detailsTab, setDetailsTab] = useState<"packages" | "tests">("packages");
  const [detailsSearch, setDetailsSearch] = useState("");
  const deferredDetailsSearch = useDeferredValue(detailsSearch);

  // small success banners
  const [packageSuccess, setPackageSuccess] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  // autofocus ref for modal first input
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // React Hook Form for lab onboarding
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<LabFormInput>({
    mode: "onChange",
    defaultValues: { name: "", imageUrl: "", address: "", rating: "" },
  });

  // forms for package & test using local state
  const [pkgForm, setPkgForm] = useState({
    packageId: "",
    name: "",
    includedTests: "",
    totalParams: "",
    mrp: "",
    discounted: "",
    preparation: "",
    reportTime: "",
    description: "",
  });

  const [pkgErrors, setPkgErrors] = useState<Record<string, string>>({});

  // testForm with full fields
  const [testForm, setTestForm] = useState({
    testId: "",
    name: "",
    code: "",
    parameters: "",
    includedTests: "", // âœ… NEW
    mrp: "",
    discounted: "",
    preparation: "",
    reportTime: "",
    description: "",
  });

  const [testErrors, setTestErrors] = useState<Record<string, string>>({});

  function normalizeIncludedTestsToCsv(value: string | string[] | undefined) {
    if (Array.isArray(value)) return value.map((x) => String(x).trim()).filter(Boolean).join(", ");
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.map((x) => String(x).trim()).filter(Boolean).join(", ");
      } catch {
        // fall through
      }
      return value
        .replace(/^\[|\]$/g, "")
        .split(",")
        .map((x) => x.trim().replace(/^"+|"+$/g, ""))
        .filter(Boolean)
        .join(", ");
    }
    return "";
  }

  // fetch labs
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

  // focus first input when modal opens
  useEffect(() => {
    if (!isModalOpen) return;
    const t = setTimeout(() => firstInputRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, [isModalOpen]);

  // close modal on Escape (both)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setPackageModalOpen(false);
        setDetailsModalOpen(false);
      }
    }
    if (isModalOpen || packageModalOpen || detailsModalOpen) {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [isModalOpen, packageModalOpen, detailsModalOpen]);

  // Name register handlers (so we can forward events and ref manually)
  const nameReg = register("name", {
    required: "Lab name is required",
    minLength: { value: 2, message: "Enter a valid name" },
  });

  // Submit handler (used inside modal)
  const onSubmit: SubmitHandler<LabFormInput> = useCallback(
    async (formData) => {
      setIsSubmitting(true);
      try {
        const payload: Partial<LabFormInput> = {
          name: formData.name.trim(),
          imageUrl: formData.imageUrl.trim(),
          address: formData.address.trim(),
          rating: formData.rating === "" ? undefined : Number(formData.rating),
        };

        const res = await postLabToApi(payload);
        if (res?.success) {
          toast.success(res.message || "Lab onboarded successfully!");
          if (res.lab) setLabs((prev) => [res.lab, ...prev]);
          else fetchLabs();
          reset();
          setIsModalOpen(false);
          setTimeout(() => {
            try {
              const el = document.getElementById(`lab-card-${res.lab?.id}`);
              el?.scrollIntoView({ behavior: "smooth", block: "center" });
              el?.classList.add("ring", "ring-red-200");
              setTimeout(() => el?.classList.remove("ring", "ring-red-200"), 1600);
            } catch (e) {
              // ignore
            }
          }, 120);
        } else {
          toast.error(res?.message || "Unexpected server response");
        }
      } catch (err: any) {
        console.error("postLab error", err);
        toast.error(err?.response?.data?.message || err?.message || "Failed to onboard lab");
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchLabs, reset]
  );

  // open package modal for a particular lab (Actions)
  function openPackageModal(lab: LabItem) {
    setActiveLabForPackage(lab);
    setEditingPackageId(null);
    setEditingTestId(null);
    setPkgForm({
      packageId: "",
      name: "",
      includedTests: "",
      totalParams: "",
      mrp: "",
      discounted: "",
      preparation: "",
      reportTime: "",
      description: "",
    });
    setTestForm({
      testId: "",
      name: "",
      code: "",
      parameters: "",
      includedTests: "",
      mrp: "",
      discounted: "",
      preparation: "",
      reportTime: "",
      description: "",
    });
    setPkgErrors({});
    setTestErrors({});
    setActiveTab("packages");
    setPackageModalOpen(true);
    setPackageSuccess(null);
    setTestSuccess(null);
  }

  // open details modal for a lab (Details)
  function openDetailsModal(lab: LabItem) {
    // ensure latest lab reference from state (find by id)
    const fresh = labs.find((L) => L.id === lab.id) || lab;
    setActiveLabForDetails(fresh);
    setDetailsTab("packages");
    setDetailsSearch("");
    setDetailsModalOpen(true);
  }

  function beginEditPackage(lab: LabItem, pkg: PackageItem) {
    setActiveLabForPackage(lab);
    setActiveTab("packages");
    setPackageModalOpen(true);
    setDetailsModalOpen(false);
    setEditingTestId(null);
    setEditingPackageId(pkg.id);
    setPkgErrors({});
    setPackageSuccess(null);
    setPkgForm({
      packageId: String(pkg.packageId || ""),
      name: String(pkg.name || ""),
      includedTests: normalizeIncludedTestsToCsv(pkg.includedTests),
      totalParams: String(pkg.totalParams ?? ""),
      mrp: String(pkg.mrp ?? ""),
      discounted: String(pkg.discounted ?? ""),
      preparation: String(pkg.preparation || ""),
      reportTime: String(pkg.reportTime || ""),
      description: String(pkg.description || ""),
    });
  }

  function beginEditTest(lab: LabItem, test: TestItem) {
    setActiveLabForPackage(lab);
    setActiveTab("tests");
    setPackageModalOpen(true);
    setDetailsModalOpen(false);
    setEditingPackageId(null);
    setEditingTestId(test.id);
    setTestErrors({});
    setTestSuccess(null);
    setTestForm({
      testId: String(test.testId || ""),
      name: String(test.name || ""),
      code: String(test.code || ""),
      parameters: String(test.parameters ?? ""),
      includedTests: normalizeIncludedTestsToCsv(test.includedTests),
      mrp: String(test.mrp ?? ""),
      discounted: String(test.discounted ?? ""),
      preparation: String(test.preparation || ""),
      reportTime: String(test.reportTime || ""),
      description: String(test.description || ""),
    });
  }

  // update lab in labs state by id (helper)
  function updateLabInState(updated: LabItem) {
    setLabs((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    // if activeLabForPackage refers to same id, update it too
    if (activeLabForPackage?.id === updated.id) {
      setActiveLabForPackage(updated);
    }
    if (activeLabForDetails?.id === updated.id) {
      setActiveLabForDetails(updated);
    }
  }

  // ---------- Validation helpers ----------
  function validatePackageForm() {
    const e: Record<string, string> = {};
    if (!pkgForm.packageId.trim()) e.packageId = "Package ID is required";
    if (!pkgForm.name.trim()) e.name = "Package name is required";
    if (!pkgForm.includedTests.trim()) e.includedTests = "At least one included test is required";
    if (!pkgForm.totalParams.trim() || Number(pkgForm.totalParams) <= 0) e.totalParams = "Total params must be a positive number";
    if (!pkgForm.mrp.trim() || Number(pkgForm.mrp) <= 0) e.mrp = "MRP must be a positive number";
    if (pkgForm.discounted && Number(pkgForm.discounted) < 0) e.discounted = "Discounted must be >= 0";
    if (pkgForm.discounted && pkgForm.mrp && Number(pkgForm.discounted) > Number(pkgForm.mrp)) e.discounted = "Discounted cannot exceed MRP";
    // description is optional - no validation
    setPkgErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateTestForm() {
    const e: Record<string, string> = {};
    if (!testForm.testId.trim()) e.testId = "Test ID is required";
    if (!testForm.name.trim()) e.name = "Test name is required";
    if (!testForm.parameters.trim() || Number(testForm.parameters) <= 0) e.parameters = "Parameters must be a positive number";
    if (!testForm.includedTests.trim())e.includedTests = "At least one included test is required"; // âœ… NEW
    if (!testForm.mrp.trim() || Number(testForm.mrp) <= 0) e.mrp = "MRP must be a positive number";
    if (testForm.discounted && Number(testForm.discounted) < 0) e.discounted = "Discounted must be >= 0";
    if (testForm.discounted && testForm.mrp && Number(testForm.discounted) > Number(testForm.mrp)) e.discounted = "Discounted cannot exceed MRP";
    // description optional
    setTestErrors(e);
    return Object.keys(e).length === 0;
  }

  // handle adding package
  async function handleAddPackage(e?: React.FormEvent) {
    e?.preventDefault();
    if (!activeLabForPackage) return;
    if (!validatePackageForm()) return;
    setIsPostingPackage(true);
    try {
      const body = {
        labName: activeLabForPackage.name?.trim() || undefined,
        packageId: pkgForm.packageId.trim(),
        name: pkgForm.name.trim(),
        includedTests: pkgForm.includedTests.split(",").map((s) => s.trim()).filter(Boolean),
        totalParams: Number(pkgForm.totalParams) || 0,
        mrp: Number(pkgForm.mrp) || 0,
        discounted: Number(pkgForm.discounted) || 0,
        preparation: pkgForm.preparation || undefined,
        reportTime: pkgForm.reportTime || undefined,
        description: pkgForm.description?.trim() || undefined,
      };
      const res = editingPackageId
        ? await patchPackageToApi(activeLabForPackage.id, editingPackageId, body)
        : await postPackageToApi(activeLabForPackage.id, body);
      if (res?.success) {
        toast.success(res.message || (editingPackageId ? "Package updated" : "Package added"));
        // server returns pkg object (often in res.pkg). fallbacks applied.
        const newPkg: PackageItem = res.pkg || res.data || {
          id: editingPackageId || Math.random().toString(36).slice(2),
          labId: activeLabForPackage.id,
          ...body,
        };

        // ensure includedTests is an array
        if (typeof newPkg.includedTests === "string") {
          try {
            newPkg.includedTests = JSON.parse(newPkg.includedTests);
          } catch {
            newPkg.includedTests = (newPkg.includedTests as any).toString().replace(/^\[|\]$/g, "").split(",").map((s: string) => s.trim()).filter(Boolean);
          }
        }

        // append to activeLabForPackage and global labs
        const updatedLab: LabItem = {
          ...activeLabForPackage,
          packages: editingPackageId
            ? (activeLabForPackage.packages || []).map((p) => (p.id === editingPackageId ? { ...p, ...newPkg } : p))
            : [...(activeLabForPackage.packages || []), newPkg],
        };
        updateLabInState(updatedLab);
        setActiveLabForPackage(updatedLab);
        setPackageSuccess(editingPackageId ? "Package updated successfully" : "Package added successfully âœ…");
        setEditingPackageId(null);
        setPkgForm({
          packageId: "",
          name: "",
          includedTests: "",
          totalParams: "",
          mrp: "",
          discounted: "",
          preparation: "",
          reportTime: "",
          description: "",
        });
        setTimeout(() => setPackageSuccess(null), 2500);
      } else {
        toast.error(res?.message || "Failed to add package");
      }
    } catch (err: any) {
      console.error("add package error", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to add package");
    } finally {
      setIsPostingPackage(false);
    }
  }

  // handle adding individual test
  async function handleAddTest(e?: React.FormEvent) {
    e?.preventDefault();
    if (!activeLabForPackage) return;
    if (!validateTestForm()) return;
    setIsPostingTest(true);
    try {
      const body = {
        labName: activeLabForPackage.name?.trim() || undefined,
        testId: testForm.testId.trim(),
        name: testForm.name.trim(),
        parameters: Number(testForm.parameters) || 0,
        mrp: Number(testForm.mrp) || 0,
        includedTests: testForm.includedTests.split(",").map((s) => s.trim()).filter(Boolean), // âœ… SAME AS PACKAGE
        discounted: Number(testForm.discounted) || 0,
        preparation: testForm.preparation || undefined,
        reportTime: testForm.reportTime || undefined,
        description: testForm.description?.trim() || undefined,
        code: testForm.code?.trim() || undefined,
      };
      const res = editingTestId
        ? await patchTestToApi(activeLabForPackage.id, editingTestId, body)
        : await postTestToApi(activeLabForPackage.id, body);
      if (res?.success) {
        toast.success(res.message || (editingTestId ? "Test updated" : "Test added"));
        // server likely returns test in res.test or res.data; fallback to local shape
        const newTest: TestItem = res.test || res.data || {
          id: editingTestId || Math.random().toString(36).slice(2),
          labId: activeLabForPackage.id,
          ...body,
        };

        // append to activeLabForPackage and global labs
        const updatedLab: LabItem = {
          ...activeLabForPackage,
          tests: editingTestId
            ? (activeLabForPackage.tests || []).map((t) => (t.id === editingTestId ? { ...t, ...newTest } : t))
            : [...(activeLabForPackage.tests || []), newTest],
        };
        updateLabInState(updatedLab);
        setActiveLabForPackage(updatedLab);
        setTestSuccess(editingTestId ? "Test updated successfully" : "Test added successfully âœ…");
        setEditingTestId(null);
        setTestForm({
          testId: "",
          name: "",
          includedTests: "",
          code: "",
          parameters: "",
          mrp: "",
          discounted: "",
          preparation: "",
          reportTime: "",
          description: "",
        });
        setTimeout(() => setTestSuccess(null), 2500);
      } else {
        toast.error(res?.message || "Failed to add test");
      }
    } catch (err: any) {
      console.error("add test error", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to add test");
    } finally {
      setIsPostingTest(false);
    }
  }

  async function handleToggleLabStatus(lab: LabItem) {
    try {
      setIsUpdatingLab(lab.id);
      const res = await patchLabToApi(lab.id, { isActive: !lab.isActive });
      if (res?.success && res?.lab) {
        updateLabInState(res.lab);
        toast.success(`Lab ${res.lab.isActive ? "enabled" : "disabled"} successfully`);
      } else {
        toast.error(res?.message || "Failed to update lab status");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update lab status");
    } finally {
      setIsUpdatingLab(null);
    }
  }

  async function handleEditLab(lab: LabItem) {
    const name = window.prompt("Lab name", lab.name || "");
    if (name === null) return;
    const address = window.prompt("Lab address", lab.address || "");
    if (address === null) return;
    const imageUrl = window.prompt("Image URL (optional)", lab.imageUrl || "");
    if (imageUrl === null) return;
    const ratingInput = window.prompt("Rating (0-5, optional)", lab.rating == null ? "" : String(lab.rating));
    if (ratingInput === null) return;

    const rating = String(ratingInput).trim() === "" ? null : Number(ratingInput);
    if (rating !== null && (!Number.isFinite(rating) || rating < 0 || rating > 5)) {
      toast.error("Rating must be between 0 and 5");
      return;
    }

    try {
      setIsUpdatingLab(lab.id);
      const res = await patchLabToApi(lab.id, {
        name: String(name || "").trim(),
        address: String(address || "").trim(),
        imageUrl: String(imageUrl || "").trim(),
        rating: rating === null ? undefined : rating,
      });
      if (res?.success && res?.lab) {
        updateLabInState(res.lab);
        toast.success("Lab updated successfully");
      } else {
        toast.error(res?.message || "Failed to update lab");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update lab");
    } finally {
      setIsUpdatingLab(null);
    }
  }

  async function handleDeleteLab(lab: LabItem) {
    const ok = window.confirm(
      `Delete lab \"${lab.name}\"?\n\nThis will delete related tests/packages/orders/phlebos/lab-admin mappings and pricing rows.`
    );
    if (!ok) return;

    try {
      setIsDeletingLab(lab.id);
      const res = await deleteLabFromApi(lab.id);
      if (res?.success) {
        setLabs((prev) => prev.filter((x) => x.id !== lab.id));
        if (activeLabForDetails?.id === lab.id) setDetailsModalOpen(false);
        if (activeLabForPackage?.id === lab.id) setPackageModalOpen(false);
        toast.success("Lab deleted successfully");
      } else {
        toast.error(res?.message || "Failed to delete lab");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete lab");
    } finally {
      setIsDeletingLab(null);
    }
  }

  const filteredDetailPackages = useMemo(() => {
    const all = activeLabForDetails?.packages || [];
    const q = deferredDetailsSearch.trim().toLowerCase();
    if (!q) return all;
    return all.filter((pkg) => {
      const searchable = [
        pkg.name,
        pkg.packageId,
        pkg.id,
        pkg.description,
        pkg.preparation,
        pkg.reportTime,
        normalizeIncludedTestsToCsv(pkg.includedTests),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(q);
    });
  }, [activeLabForDetails, deferredDetailsSearch]);

  const filteredDetailTests = useMemo(() => {
    const all = activeLabForDetails?.tests || [];
    const q = deferredDetailsSearch.trim().toLowerCase();
    if (!q) return all;
    return all.filter((test) => {
      const searchable = [
        test.name,
        test.testId,
        test.id,
        test.code,
        test.description,
        test.preparation,
        test.reportTime,
        normalizeIncludedTestsToCsv(test.includedTests),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(q);
    });
  }, [activeLabForDetails, deferredDetailsSearch]);

  return (
    <>
      <Toaster />

      <div className="min-h-screen bg-gray-50 flex items-start justify-center p-6 pt-20">
        <div className="w-full max-w-5xl">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white py-8 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-extrabold">Lab Onboarding</h1>
                <p className="mt-2 text-sm sm:text-base opacity-90">Quickly add a new lab and manage onboarded labs.</p>
              </div>

              <div className="flex justify-center sm:justify-end">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-white text-red-600 font-semibold px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:bg-red-50 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/60"
                  aria-haspopup="dialog"
                >
                  <FaPlus className="text-sm" />
                  <span className="text-sm sm:text-base">New Lab</span>
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3"><h2 className="text-xl font-semibold">Onboarded Labs</h2><span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">{labs.length} labs</span></div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fetchLabs()}
                    className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {isLoadingLabs ? (
                <div className="py-16 text-center text-gray-500"><FaSpinner className="animate-spin inline-block mr-2" /> Loading labs...</div>
              ) : labsError ? (
                <div className="py-12 text-center text-red-500">Failed to load labs: {labsError}</div>
              ) : labs.length === 0 ? (
                <div className="py-12 text-center text-gray-500">No labs onboarded yet. Click "New lab" to add one.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {labs.map((lab) => (
                    <article
                      id={`lab-card-${lab.id}`}
                      key={lab.id}
                      className="group bg-gradient-to-b from-white via-white to-red-50/30 border border-gray-200 rounded-2xl p-0 overflow-hidden shadow-sm transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-red-200"
                    >
                      <div className="p-4 flex flex-col gap-3"><div className="h-1.5 w-full rounded-full bg-gradient-to-r from-red-400 via-red-300 to-red-200" />
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm sm:text-base font-semibold text-gray-800">{lab.name}</h3>
                              <button
                                className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-600 transition"
                                onClick={() => handleEditLab(lab)}
                                disabled={isUpdatingLab === lab.id || isDeletingLab === lab.id}
                                title="Edit lab"
                                aria-label="Edit lab"
                              >
                                <FaPencilAlt className="text-xs" />
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{lab.address || "-"}</p>
                            <div className="text-xs text-gray-400 mt-2">ID: <span className="font-mono text-xs text-gray-600">{lab.id}</span></div>
                          </div>

                          <div className="flex-shrink-0 text-right">
                            <div className="inline-flex items-center gap-1 text-sm font-medium text-yellow-600">
                              <FaStar /> <span className="text-xs text-gray-700">{lab.rating ?? "-"}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{lab.createdAt ? new Date(lab.createdAt).toLocaleDateString() : "-"}</div>
                          </div>
                        </div>

                        <div className="mt-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                          <div className="mb-2 text-xs text-gray-600">
                            Status: <span className={`font-semibold ${lab.isActive ? "text-emerald-700" : "text-amber-700"}`}>{lab.isActive ? "Active" : "Inactive"}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 auto-rows-fr">

                            <button
                              className={`w-full h-9 text-[11px] sm:text-xs leading-none whitespace-nowrap px-2 rounded-lg border font-semibold transition-all duration-150 ${
                                lab.isActive ? "text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100" : "text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                              }`}
                              onClick={() => handleToggleLabStatus(lab)}
                              disabled={isUpdatingLab === lab.id || isDeletingLab === lab.id}
                            >
                              {isUpdatingLab === lab.id ? "Updating..." : lab.isActive ? "Disable" : "Enable"}
                            </button>

                            <button
                              className="w-full h-9 text-[11px] sm:text-xs leading-none whitespace-nowrap px-2 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-150"
                              onClick={() => openDetailsModal(lab)}
                              disabled={isDeletingLab === lab.id}
                            >
                              Details
                            </button>

                            <button
                              className="w-full h-9 text-[11px] sm:text-xs leading-none whitespace-nowrap px-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-all duration-150 shadow-sm"
                              onClick={() => openPackageModal(lab)}
                              disabled={isDeletingLab === lab.id}
                            >
                              Add Test + Package
                            </button>

                            <button
                              className="w-full h-9 text-[11px] sm:text-xs leading-none whitespace-nowrap px-2 rounded-lg border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-all duration-150"
                              onClick={() => handleDeleteLab(lab)}
                              disabled={isDeletingLab === lab.id}
                            >
                              {isDeletingLab === lab.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
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

      {/* Modal: New Lab */}
      {isModalOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="new-lab-title" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* backdrop */}
          <div className="fixed inset-0 bg-black/45 backdrop-blur-[2px]" onClick={() => setIsModalOpen(false)} />

          {/* modal card */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in ring-1 ring-red-100">
            <div className="pointer-events-none absolute -top-24 -left-24 h-52 w-52 rounded-full bg-red-200/50 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-orange-100/60 blur-3xl" />
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white text-center py-5 px-4 relative">
              <h3 id="new-lab-title" className="text-2xl font-bold">New Lab</h3><p className="mt-1 text-xs text-white/90">Add fulfillment partner details with complete profile</p>
              <button aria-label="Close" onClick={() => setIsModalOpen(false)} className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 text-white hover:bg-white/30">x</button>
            </div>

            <div className="relative p-6 sm:p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-live="polite">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Lab Name</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="The Life Savers Labs"
                    name={nameReg.name}
                    onChange={nameReg.onChange}
                    onBlur={nameReg.onBlur}
                    ref={(el) => {
                      // forward RHF ref and keep local ref for autofocus
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (nameReg.ref as any)(el);
                      firstInputRef.current = el;
                    }}
                    className={`mt-1 block w-full px-3 py-2 border bg-gray-50/70 ${errors.name ? "border-red-500" : "border-gray-300"} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 sm:text-sm`}
                    aria-invalid={errors.name ? "true" : "false"}
                  />
                  {errors.name && (<p className="text-red-500 text-sm mt-1" role="alert">{errors.name.message}</p>)}
                </div>

                {/* Image URL */}
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
                  <input
                    id="imageUrl"
                    type="url"
                    placeholder="https://example.com/lab.jpg"
                    {...register("imageUrl", {
                      required: "Image URL is required",
                      pattern: { value: /^(https?:\/\/).+$/, message: "Enter a valid URL (must start with http/https)" },
                    })}
                    className={`mt-1 block w-full px-3 py-2 border bg-gray-50/70 ${errors.imageUrl ? "border-red-500" : "border-gray-300"} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 sm:text-sm`}
                    aria-invalid={errors.imageUrl ? "true" : "false"}
                  />
                  {errors.imageUrl && (<p className="text-red-500 text-sm mt-1" role="alert">{errors.imageUrl.message}</p>)}
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    id="address"
                    type="text"
                    placeholder="Kurukshetra"
                    {...register("address", { required: "Address is required" })}
                    className={`mt-1 block w-full px-3 py-2 border bg-gray-50/70 ${errors.address ? "border-red-500" : "border-gray-300"} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 sm:text-sm`}
                    aria-invalid={errors.address ? "true" : "false"}
                  />
                  {errors.address && (<p className="text-red-500 text-sm mt-1" role="alert">{errors.address.message}</p>)}
                </div>

                {/* Rating */}
                <div>
                  <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Rating (optional)</label>
                  <input
                    id="rating"
                    type="number"
                    step="0.1"
                    min={0}
                    max={5}
                    placeholder="4.5"
                    {...register("rating", {
                      min: { value: 0, message: "Minimum rating is 0" },
                      max: { value: 5, message: "Maximum rating is 5" },
                      valueAsNumber: true,
                    })}
                    className={`mt-1 block w-full px-3 py-2 border bg-gray-50/70 ${errors.rating ? "border-red-500" : "border-gray-300"} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 sm:text-sm`}
                    aria-invalid={errors.rating ? "true" : "false"}
                  />
                  {errors.rating && (<p className="text-red-500 text-sm mt-1" role="alert">{errors.rating.message}</p>)}
                </div>

                <div className="flex items-center gap-3 justify-end">
                  <button type="submit" disabled={!isValid || isSubmitting} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50">
                    {isSubmitting ? <FaSpinner className="animate-spin" /> : <span>Create</span>}
                  </button>

                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 bg-white font-semibold hover:bg-gray-50">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Package/Test modal (Actions) */}
      {packageModalOpen && activeLabForPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* backdrop */}
          <div className="fixed inset-0 bg-black/55 backdrop-blur-sm transition-opacity" onClick={() => setPackageModalOpen(false)} aria-hidden="true" />

          {/* modal */}
          <div className="relative w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-auto max-h-[90vh] ring-1 ring-black/5">
            <div className="pointer-events-none absolute -top-28 -right-24 h-64 w-64 rounded-full bg-red-200/40 blur-3xl" />
            {/* header */}
            <div className="flex items-center gap-4 p-4 sm:p-5 bg-gradient-to-r from-red-600 via-red-500 to-red-400 rounded-t-2xl text-white">
              {/* avatar */}
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 text-lg font-bold">{activeLabForPackage.name?.charAt(0)?.toUpperCase() || "L"}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-semibold truncate">{activeLabForPackage.name}</h3>
                  <span className="ml-1 text-xs sm:text-sm bg-white/20 px-2 py-0.5 rounded-full">{activeLabForPackage.isActive ? "Active" : "Inactive"}</span>
                </div>
                <div className="text-xs text-white/90 mt-0.5">
                  <span className="font-mono text-xs">{activeLabForPackage.id}</span>
                  <span className="hidden sm:inline-block ml-3 text-white/80">Manage packages & tests</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setPackageModalOpen(false)} className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 transition" aria-label="Close modal" title="Close">x</button>
              </div>
            </div>

            {/* body */}
            <div className="relative p-5 sm:p-6">
              {/* tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="inline-flex items-center gap-2 bg-gray-50 p-1 rounded-lg shadow-sm">
                  <button onClick={() => setActiveTab("packages")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "packages" ? "bg-white shadow text-red-600" : "text-gray-600 hover:text-gray-800"}`} aria-pressed={activeTab === "packages"}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M3 7l9-4 9 4v8l-9 4L3 15V7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Packages
                  </button>

                  <button onClick={() => setActiveTab("tests")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "tests" ? "bg-white shadow text-red-600" : "text-gray-600 hover:text-gray-800"}`} aria-pressed={activeTab === "tests"}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M3 12h18M7 6h10M7 18h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Individual Tests
                  </button>
                </div>

                <div className="text-xs text-gray-500">
                  <span className="hidden sm:inline">Use these forms to add packages or single tests quickly.</span>
                  <span className="sm:hidden">Add package / test</span>
                </div>
              </div>

              {/* forms area */}
              <div className="mt-6">
                {/* PACKAGES */}
                {activeTab === "packages" && (
                  <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl p-4 sm:p-5 shadow-inner border border-gray-100">
                    {packageSuccess && (<div className="mb-3 p-2 text-sm bg-green-50 border border-green-100 text-green-800 rounded">{packageSuccess}</div>)}

                    <form onSubmit={handleAddPackage} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Package ID</label>
                        <input value={pkgForm.packageId} onChange={(e) => setPkgForm((p) => ({ ...p, packageId: e.target.value }))} className={`mt-1 block w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100 ${pkgErrors.packageId ? "border-red-500 ring-red-50" : "border-gray-200"}`} placeholder="PKG_1001" />
                        {pkgErrors.packageId && <p className="text-red-500 text-xs mt-1">{pkgErrors.packageId}</p>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Package name</label>
                          <input value={pkgForm.name} onChange={(e) => setPkgForm((p) => ({ ...p, name: e.target.value }))} className={`mt-1 block w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100 ${pkgErrors.name ? "border-red-500 ring-red-50" : "border-gray-200"}`} placeholder="Full Body Checkup" />
                          {pkgErrors.name && <p className="text-red-500 text-xs mt-1">{pkgErrors.name}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700">Total params</label>
                          <input value={pkgForm.totalParams} onChange={(e) => setPkgForm((p) => ({ ...p, totalParams: e.target.value }))} className={`mt-1 block w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100 ${pkgErrors.totalParams ? "border-red-500 ring-red-50" : "border-gray-200"}`} placeholder="60" />
                          {pkgErrors.totalParams && <p className="text-red-500 text-xs mt-1">{pkgErrors.totalParams}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700">Included tests (comma separated)</label>
                        <input value={pkgForm.includedTests} onChange={(e) => setPkgForm((p) => ({ ...p, includedTests: e.target.value }))} className={`mt-1 block w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100 ${pkgErrors.includedTests ? "border-red-500 ring-red-50" : "border-gray-200"}`} placeholder="CBC, Thyroid, Diabetes" />
                        {pkgErrors.includedTests && <p className="text-red-500 text-xs mt-1">{pkgErrors.includedTests}</p>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input value={pkgForm.mrp} onChange={(e) => setPkgForm((p) => ({ ...p, mrp: e.target.value }))} placeholder="MRP" className={`mt-1 block w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100 ${pkgErrors.mrp ? "border-red-500 ring-red-50" : "border-gray-200"}`} />
                        <input value={pkgForm.discounted} onChange={(e) => setPkgForm((p) => ({ ...p, discounted: e.target.value }))} placeholder="Discounted" className={`mt-1 block w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100 ${pkgErrors.discounted ? "border-red-500 ring-red-50" : "border-gray-200"}`} />
                        <input value={pkgForm.reportTime} onChange={(e) => setPkgForm((p) => ({ ...p, reportTime: e.target.value }))} placeholder="Report time" className="mt-1 block w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200" />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700">Preparation</label>
                        <input value={pkgForm.preparation} onChange={(e) => setPkgForm((p) => ({ ...p, preparation: e.target.value }))} placeholder="Fasting 12 hrs" className="mt-1 block w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200" />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700">Description (optional)</label>
                        <textarea value={pkgForm.description} onChange={(e) => setPkgForm((p) => ({ ...p, description: e.target.value }))} placeholder="Short description about the package" className="mt-1 block w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200" rows={3} />
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPackageId(null);
                            setPkgForm({ packageId: "", name: "", includedTests: "", totalParams: "", mrp: "", discounted: "", preparation: "", reportTime: "", description: "" });
                          }}
                          className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
                        >
                          {editingPackageId ? "Cancel Edit" : "Reset"}
                        </button>

                        <button type="submit" disabled={isPostingPackage} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white shadow hover:brightness-95 transition disabled:opacity-60">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          {isPostingPackage ? "Saving..." : editingPackageId ? "Save Package" : "Add Package"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* TESTS */}
                {activeTab === "tests" && (
                  <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl p-4 sm:p-5 shadow-inner border border-gray-100">
                    {testSuccess && (<div className="mb-3 p-2 text-sm bg-green-50 border border-green-100 text-green-800 rounded">{testSuccess}</div>)}

                    <form onSubmit={handleAddTest} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Test ID</label>
                        <input value={testForm.testId} onChange={(e) => setTestForm((p) => ({ ...p, testId: e.target.value }))} className={`mt-1 block w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100 ${testErrors.testId ? "border-red-500 ring-red-50" : "border-gray-200"}`} placeholder="TEST_1001" />
                        {testErrors.testId && <p className="text-red-500 text-xs mt-1">{testErrors.testId}</p>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Test name</label>
                          <input value={testForm.name} onChange={(e) => setTestForm((p) => ({ ...p, name: e.target.value }))} className={`mt-1 block w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100 ${testErrors.name ? "border-red-500 ring-red-50" : "border-gray-200"}`} placeholder="KFT" />
                          {testErrors.name && <p className="text-red-500 text-xs mt-1">{testErrors.name}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700">Test code (optional)</label>
                          <input value={testForm.code} onChange={(e) => setTestForm((p) => ({ ...p, code: e.target.value }))} className="mt-1 block w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200" placeholder="KFT01" />
                        </div>
                      </div>

                      <div>
  <label className="block text-xs font-medium text-gray-700">
    Included tests (comma separated)
  </label>
  <input
    value={testForm.includedTests}
    onChange={(e) =>
      setTestForm((p) => ({ ...p, includedTests: e.target.value }))
    }
    placeholder="Urea, Creatinine, Sodium"
    className={`mt-1 block w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100 ${
      testErrors.includedTests ? "border-red-500 ring-red-50" : "border-gray-200"
    }`}
  />
  {testErrors.includedTests && (
    <p className="text-red-500 text-xs mt-1">
      {testErrors.includedTests}
    </p>
  )}
</div>


                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Parameters (count)</label>
                          <input value={testForm.parameters} onChange={(e) => setTestForm((p) => ({ ...p, parameters: e.target.value }))} placeholder="20" className={`mt-1 block w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100 ${testErrors.parameters ? "border-red-500 ring-red-50" : "border-gray-200"}`} />
                          {testErrors.parameters && <p className="text-red-500 text-xs mt-1">{testErrors.parameters}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700">MRP</label>
                          <input value={testForm.mrp} onChange={(e) => setTestForm((p) => ({ ...p, mrp: e.target.value }))} placeholder="500" className={`mt-1 block w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100 ${testErrors.mrp ? "border-red-500 ring-red-50" : "border-gray-200"}`} />
                          {testErrors.mrp && <p className="text-red-500 text-xs mt-1">{testErrors.mrp}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Discounted</label>
                          <input value={testForm.discounted} onChange={(e) => setTestForm((p) => ({ ...p, discounted: e.target.value }))} placeholder="300" className={`mt-1 block w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100 ${testErrors.discounted ? "border-red-500 ring-red-50" : "border-gray-200"}`} />
                          {testErrors.discounted && <p className="text-red-500 text-xs mt-1">{testErrors.discounted}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700">Report time</label>
                          <input value={testForm.reportTime} onChange={(e) => setTestForm((p) => ({ ...p, reportTime: e.target.value }))} placeholder="6 hours" className="mt-1 block w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700">Preparation</label>
                        <input value={testForm.preparation} onChange={(e) => setTestForm((p) => ({ ...p, preparation: e.target.value }))} placeholder="No special preparation required" className="mt-1 block w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200" />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700">Description (optional)</label>
                        <textarea value={testForm.description} onChange={(e) => setTestForm((p) => ({ ...p, description: e.target.value }))} placeholder="Short description about the test" className="mt-1 block w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100 border-gray-200" rows={3} />
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTestId(null);
                            setTestForm({ testId: "", name: "", includedTests: "", code: "", parameters: "", mrp: "", discounted: "", preparation: "", reportTime: "", description: "" });
                          }}
                          className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
                        >
                          {editingTestId ? "Cancel Edit" : "Reset"}
                        </button>

                        <button type="submit" disabled={isPostingTest} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white shadow hover:brightness-95 transition disabled:opacity-60">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          {isPostingTest ? "Saving..." : editingTestId ? "Save Test" : "Add Test"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal (shows packages and tests for a lab) */}
      {detailsModalOpen && activeLabForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/55 backdrop-blur-sm transition-opacity" onClick={() => setDetailsModalOpen(false)} aria-hidden="true" />

          <div className="relative w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-auto max-h-[90vh] ring-1 ring-black/5">
            <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-red-200/35 blur-3xl" />
            <div className="flex items-center gap-4 p-4 sm:p-5 bg-gradient-to-r from-red-600 via-red-500 to-red-400 rounded-t-2xl text-white shadow-md">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 text-lg font-bold">{activeLabForDetails.name?.charAt(0)?.toUpperCase() || "L"}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold truncate">{activeLabForDetails.name}</h3>
                <div className="text-xs text-white/90 mt-0.5">
                  <span className="font-mono text-xs">{activeLabForDetails.id}</span>
                  <span className="hidden sm:inline-block ml-3 text-white/80">Packages & Tests</span>
                </div>
              </div>
              <div>
                <button onClick={() => setDetailsModalOpen(false)} className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 transition" aria-label="Close details">x</button>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="inline-flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100">
                  <button
                    onClick={() => setDetailsTab("packages")}
                    className={`px-3 py-1.5 text-xs sm:text-sm rounded-md font-medium transition ${
                      detailsTab === "packages" ? "bg-white text-red-600 shadow" : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Packages ({activeLabForDetails.packages?.length || 0})
                  </button>
                  <button
                    onClick={() => setDetailsTab("tests")}
                    className={`px-3 py-1.5 text-xs sm:text-sm rounded-md font-medium transition ${
                      detailsTab === "tests" ? "bg-white text-red-600 shadow" : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Tests ({activeLabForDetails.tests?.length || 0})
                  </button>
                </div>

                <input
                  className="w-full sm:w-80 border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300"
                  placeholder={detailsTab === "packages" ? "Search package by name/id/description..." : "Search test by name/id/code..."}
                  value={detailsSearch}
                  onChange={(e) => setDetailsSearch(e.target.value)}
                />
              </div>

              {detailsTab === "packages" ? (
                <section>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-800">Packages</h4>
                    <div className="text-xs text-gray-500">{filteredDetailPackages.length} shown</div>
                  </div>

                  <div className="mt-3 space-y-3">
                    {filteredDetailPackages.length > 0 ? (
                      filteredDetailPackages.map((pkg) => {
                        const included = normalizeIncludedTestsToCsv(pkg.includedTests);
                        return (
                          <div key={pkg.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <div className="font-medium text-gray-800 truncate">{pkg.name}</div>
                                  <div className="text-xs text-gray-500 font-mono">{pkg.id}</div>
                                </div>
                                <div className="text-xs text-gray-500 mt-2">{included || "No tests listed"}</div>
                                {pkg.description && <div className="mt-2 text-sm text-gray-700">{pkg.description}</div>}
                              </div>

                              <div className="text-right shrink-0">
                                <div className="text-sm font-semibold text-gray-800">Rs{pkg.discounted ?? "-"}</div>
                                <div className="text-xs line-through text-gray-400">Rs{pkg.mrp ?? "-"}</div>
                                <button
                                  className="mt-2 text-xs px-3 py-1.5 rounded-lg border border-gray-200 font-semibold hover:bg-gray-50 transition"
                                  onClick={() => beginEditPackage(activeLabForDetails, pkg)}
                                >
                                  Edit
                                </button>
                              </div>
                            </div>

                            <div className="mt-2 text-xs text-gray-500 flex gap-3 flex-wrap">
                              <div>Params: {pkg.totalParams ?? "-"}</div>
                              <div>Prep: {pkg.preparation || "-"}</div>
                              <div>Report: {pkg.reportTime || "-"}</div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-6 text-center text-gray-500">No packages match your search.</div>
                    )}
                  </div>
                </section>
              ) : (
                <section>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-800">Individual Tests</h4>
                    <div className="text-xs text-gray-500">{filteredDetailTests.length} shown</div>
                  </div>

                  <div className="mt-3 space-y-3">
                    {filteredDetailTests.length > 0 ? (
                      filteredDetailTests.map((t) => {
                        const included = normalizeIncludedTestsToCsv(t.includedTests);
                        return (
                          <div key={t.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-gray-800 truncate">{t.name}</div>
                                <div className="text-xs text-gray-500 font-mono">{t.id}</div>
                              </div>
                              <div className="text-xs text-gray-500 mt-2">{included || t.preparation || "No preparation specified"}</div>
                              {t.description && <div className="mt-2 text-sm text-gray-700">{t.description}</div>}
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-sm font-semibold text-gray-800">Rs{t.discounted ?? "-"}</div>
                              <div className="text-xs line-through text-gray-400">Rs{t.mrp ?? "-"}</div>
                              <div className="text-xs text-gray-500 mt-1">Params: {t.parameters ?? "-"}</div>
                              <button
                                className="mt-2 text-xs px-3 py-1.5 rounded-lg border border-gray-200 font-semibold hover:bg-gray-50 transition"
                                onClick={() => beginEditTest(activeLabForDetails, t)}
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-6 text-center text-gray-500">No tests match your search.</div>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(LabOnboarding);



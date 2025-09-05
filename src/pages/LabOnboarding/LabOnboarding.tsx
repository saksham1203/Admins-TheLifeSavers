import React from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import {
  FaArrowLeft,
  FaFlask,
  FaUpload,
  FaSpinner,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

type Package = {
  name: string;
  price: number;
  discountedPrice: number;
  tests: string;
};

type Test = {
  testName: string;
  price: number;
};

type FormData = {
  labName: string;
  ownerName: string;
  contact: string;
  email: string;
  address: string;
  labType: string;
  services: string;
  licenseNumber: string;
  licenseProof: FileList;
  packages: Package[];
  individualTests: Test[];
};

const LabOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid, isSubmitting },
    watch,
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      packages: [{ name: "", price: 0, discountedPrice: 0, tests: "" }],
      individualTests: [{ testName: "", price: 0 }],
    },
  });

  const {
    fields: packageFields,
    append: addPackage,
    remove: removePackage,
  } = useFieldArray({
    control,
    name: "packages",
  });

  const {
    fields: testFields,
    append: addTest,
    remove: removeTest,
  } = useFieldArray({
    control,
    name: "individualTests",
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log("Lab Data Submitted:", data);
    toast.success("Lab onboarded successfully!");
    reset();
  };

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center p-6"
      style={{ paddingTop: "4rem", paddingBottom: "4rem" }}
    >
      <div className="bg-white rounded-2xl shadow-lg max-w-6xl w-full overflow-hidden relative animate-fade-in">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white text-center py-6 px-4 relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 sm:top-1/2 sm:left-6 transform sm:-translate-y-1/2 p-2 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition"
            aria-label="Go back"
          >
            <FaArrowLeft size={18} />
          </button>
          <h1 className="text-3xl font-bold mb-2 mt-4 sm:mt-0 flex items-center justify-center gap-2">
            <FaFlask /> Lab Onboarding
          </h1>
          <p className="text-md max-w-xl mx-auto">
            Register a new lab partner by filling out the details below.
          </p>
        </div>

        {/* Form Section */}
        <div className="py-10 px-6 sm:px-10 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Lab Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Lab Name
                </label>
                <input
                  {...register("labName", { required: "Lab Name is required" })}
                  className={`w-full px-3 py-2 border ${
                    errors.labName ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
                  placeholder="Enter Lab Name"
                />
                {errors.labName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.labName.message}
                  </p>
                )}
              </div>

              {/* Owner Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Owner Name
                </label>
                <input
                  {...register("ownerName", {
                    required: "Owner Name is required",
                  })}
                  className={`w-full px-3 py-2 border ${
                    errors.ownerName ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
                  placeholder="Enter Owner Name"
                />
                {errors.ownerName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.ownerName.message}
                  </p>
                )}
              </div>

              {/* Contact */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  {...register("contact", {
                    required: "Contact Number is required",
                    pattern: {
                      value: /^\+?\d{10,15}$/,
                      message: "Enter a valid phone number",
                    },
                  })}
                  className={`w-full px-3 py-2 border ${
                    errors.contact ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
                  placeholder="Enter Contact Number"
                />
                {errors.contact && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.contact.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                  className={`w-full px-3 py-2 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
                  placeholder="Enter Email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="block text-gray-700 font-medium mb-1">
                  Address
                </label>
                <textarea
                  {...register("address", { required: "Address is required" })}
                  className={`w-full px-3 py-2 border ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
                  rows={3}
                  placeholder="Enter Address"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* Lab Type */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Lab Type
                </label>
                <select
                  {...register("labType", { required: "Lab Type is required" })}
                  className={`w-full px-3 py-2 border ${
                    errors.labType ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
                >
                  <option value="">Select Lab Type</option>
                  <option value="Pathology">Pathology</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Multi-specialty">Multi-specialty</option>
                </select>
                {errors.labType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.labType.message}
                  </p>
                )}
              </div>

              {/* Services */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Services Offered
                </label>
                <input
                  {...register("services")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Comma separated services"
                />
              </div>

              {/* License Number */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  License/Registration Number
                </label>
                <input
                  {...register("licenseNumber")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter License Number"
                />
              </div>

              {/* License Proof */}
              <div className="sm:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2 items-center gap-2">
                  📄 Upload License Proof
                </label>

                <label
                  htmlFor="licenseProof"
                  className="flex items-center gap-3 border-2 border-dashed border-gray-300 rounded-lg px-4 py-6 cursor-pointer hover:border-red-400 hover:bg-red-50 transition"
                >
                  <FaUpload className="text-red-500 text-2xl" />
                  <span className="text-gray-600">
                    Click to{" "}
                    <span className="text-red-600 font-semibold">Upload</span>{" "}
                    or Drag & Drop
                  </span>
                  <input
                    id="licenseProof"
                    type="file"
                    {...register("licenseProof")}
                    className="hidden"
                  />
                </label>

                {/* Show file name if uploaded */}
                {watch("licenseProof")?.length > 0 && (
                  <p className="mt-2 text-sm text-green-600 font-medium">
                    ✅ Uploaded: {watch("licenseProof")[0].name}
                  </p>
                )}

                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: JPG, PNG, PDF (Max size: 5MB)
                </p>
              </div>
            </div>

            {/* Packages Section */}
            <div className="bg-white shadow-md rounded-xl p-5 border border-gray-200 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  📦 Packages
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    addPackage({
                      name: "",
                      price: 0,
                      discountedPrice: 0,
                      tests: "",
                    })
                  }
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg shadow hover:from-green-600 hover:to-green-700 transition-all duration-200"
                >
                  <FaPlus /> Add Package
                </button>
              </div>

              {packageFields.length === 0 && (
                <p className="text-gray-500 italic mb-4">
                  No packages added yet.
                </p>
              )}

              {packageFields.map((field, index) => (
                <div
                  key={field.id}
                  className="bg-gray-50 p-4 rounded-lg mb-3 grid grid-cols-1 sm:grid-cols-5 gap-3 items-center border border-gray-200"
                >
                  <input
                    {...register(`packages.${index}.name` as const)}
                    placeholder="Package Name"
                    className="border p-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                  />
                  <input
                    type="number"
                    {...register(`packages.${index}.price` as const)}
                    placeholder="Price"
                    className="border p-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                  />
                  <input
                    type="number"
                    {...register(`packages.${index}.discountedPrice` as const)}
                    placeholder="Discounted Price"
                    className="border p-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                  />
                  <input
                    {...register(`packages.${index}.tests` as const)}
                    placeholder="Tests (comma separated)"
                    className="border p-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removePackage(index)}
                    className="bg-red-500 text-white p-2 rounded-lg shadow hover:bg-red-600 transition-all duration-200 flex justify-center"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            {/* Individual Tests Section */}
            <div className="bg-white shadow-md rounded-xl p-5 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  🧪 Individual Tests
                </h2>
                <button
                  type="button"
                  onClick={() => addTest({ testName: "", price: 0 })}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                >
                  <FaPlus /> Add Test
                </button>
              </div>

              {testFields.length === 0 && (
                <p className="text-gray-500 italic mb-4">No tests added yet.</p>
              )}

              {testFields.map((field, index) => (
                <div
                  key={field.id}
                  className="bg-gray-50 p-4 rounded-lg mb-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center border border-gray-200"
                >
                  <input
                    {...register(`individualTests.${index}.testName` as const)}
                    placeholder="Test Name"
                    className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                  <input
                    type="number"
                    {...register(`individualTests.${index}.price` as const)}
                    placeholder="Price"
                    className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeTest(index)}
                    className="bg-red-500 text-white p-2 rounded-lg shadow hover:bg-red-600 transition-all duration-200 flex justify-center"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-transform transform hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin h-4 w-4 mr-2 text-white" />{" "}
                    Onboarding...
                  </>
                ) : (
                  "Onboard Lab"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LabOnboarding;

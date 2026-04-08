import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { FiCheck } from "react-icons/fi";
import { FaArrowLeft, FaSpinner } from "react-icons/fa";
import {
  registerUserBySuperAdmin,
  type SuperAdminUserRegistrationPayload,
} from "../../services/superAdminUserRegistration.service";
import { getStates, getDistricts, getCities } from "../../Components/indiaData";

type FormValues = SuperAdminUserRegistrationPayload;

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const countries = ["India"];
const steps = [
  { id: 1, label: "Personal Details" },
  { id: 2, label: "Additional details" },
  { id: 3, label: "Preview" },
] as const;

const stepFields: Array<Array<keyof FormValues>> = [
  ["firstName", "lastName", "email", "password", "mobileNumber", "dob", "gender"],
  ["bloodGroup", "availability", "country", "state", "district", "city", "referredBy"],
  [],
];

const inputClass =
  "mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm";

const SuperAdminUserOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      mobileNumber: "",
      dob: "",
      bloodGroup: "",
      gender: "male",
      availability: "available",
      country: "India",
      state: "",
      district: "",
      city: "",
      referredBy: "",
    },
  });

  const formValues = watch();
  const selectedState = watch("state");

  React.useEffect(() => {
    setStates(getStates());
  }, []);

  const handleCountryChange = (selectedCountry: string) => {
    if (selectedCountry === "India") {
      setStates(getStates());
    } else {
      setStates([]);
      setDistricts([]);
      setCities([]);
      setValue("state", "");
      setValue("district", "");
      setValue("city", "");
    }
  };

  const handleStateChange = (state: string) => {
    setDistricts(getDistricts(state));
    setCities([]);
    setValue("district", "");
    setValue("city", "");
  };

  const handleDistrictChange = (district: string, state: string) => {
    setCities(getCities(state, district));
    setValue("city", "");
  };

  const onSubmit: SubmitHandler<FormValues> = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload: FormValues = {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        mobileNumber: formData.mobileNumber.replace(/\D/g, ""),
        country: formData.country.trim(),
        state: formData.state.trim(),
        district: formData.district.trim(),
        city: formData.city.trim(),
        referredBy: formData.referredBy?.trim() || undefined,
      };

      const res = await registerUserBySuperAdmin(payload);
      toast.success(res.message || "User registered successfully");

      reset({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        mobileNumber: "",
        dob: "",
        bloodGroup: "",
        gender: "male",
        availability: "available",
        country: "India",
        state: "",
        district: "",
        city: "",
        referredBy: "",
      });
      setDistricts([]);
      setCities([]);
      setStep(1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to register user";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goNext = async () => {
    const fields = stepFields[step - 1];
    if (!fields.length) {
      setStep((prev) => Math.min(prev + 1, steps.length));
      return;
    }
    const ok = await trigger(fields);
    if (ok) setStep((prev) => Math.min(prev + 1, steps.length));
  };

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center p-4"
      style={{ paddingTop: "4rem", paddingBottom: "4rem" }}
    >
      <Toaster />

      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden relative animate-fade-in ring-1 ring-red-100/70">
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white py-8 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-red-600 rounded-full shadow-md hover:bg-red-700 transition"
                aria-label="Back"
              >
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="text-4xl font-extrabold mb-1">Register User</h1>
                <p className="text-sm text-white/90">SuperAdmin registration flow (mobile OTP bypassed)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
            Be a <span className="text-3xl text-red-600 font-bold">Life Saver:</span> Donate Blood, Save Lives!
          </h2>

          <div className="flex items-center mb-2 w-full">
            <hr className="flex-1 border-gray-300" />
            <span className="mx-4 text-sm text-gray-600">Register here</span>
            <hr className="flex-1 border-gray-300" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
            <div className="w-full max-w-3xl mx-auto">
              <div className="flex items-center justify-between relative mb-8">
                <div className="absolute top-5 left-0 w-full">
                  <div className="absolute h-[2px] bg-gray-200 w-full max-w-[calc(100%-8rem)] left-1/2 -translate-x-1/2" />
                  <div
                    className="absolute h-[3px] bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300"
                    style={{
                      width: `${Math.max(0, ((step - 1) / (steps.length - 1)) * (100 - 100 / steps.length))}%`,
                      left: "3.7rem",
                    }}
                  />
                </div>

                <div className="relative z-10 w-full flex justify-between items-center gap-4">
                  {steps.map((s) => (
                    <div key={s.id} className="flex-1 flex flex-col items-center min-w-[80px]">
                      <div className="relative">
                        {step >= s.id && <div className="absolute inset-0 bg-red-400/20 rounded-full blur-lg animate-pulse" />}
                        <div
                          className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full transition-all duration-300 ${
                            step >= s.id
                              ? "bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30"
                              : "border-2 border-gray-200 bg-white"
                          }`}
                        >
                          {step > s.id ? (
                            <FiCheck className="h-4 w-4 md:h-5 md:w-5 text-white" />
                          ) : (
                            <span className={`text-xs md:text-sm font-bold ${step >= s.id ? "text-white" : "text-gray-400"}`}>
                              {String(s.id).padStart(2, "0")}
                            </span>
                          )}
                          {step === s.id && <div className="absolute inset-0 border-2 border-red-500/50 rounded-full animate-ping" />}
                        </div>
                      </div>
                      <span className={`mt-2 text-xs md:text-sm font-bold text-center ${step >= s.id ? "text-gray-900" : "text-gray-400"}`}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {step === 1 && (
                <>
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      id="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      {...register("firstName", {
                        required: "First name is required",
                        maxLength: { value: 50, message: "First name cannot exceed 50 characters" },
                      })}
                      className={`${inputClass} ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
                      aria-invalid={!!errors.firstName}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      {...register("lastName", {
                        required: "Last name is required",
                        maxLength: { value: 50, message: "Last name cannot exceed 50 characters" },
                      })}
                      className={`${inputClass} ${errors.lastName ? "border-red-500" : "border-gray-300"}`}
                      aria-invalid={!!errors.lastName}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: { value: /^\S+@\S+\.\S+$/i, message: "Invalid email address" },
                      })}
                      className={`${inputClass} ${errors.email ? "border-red-500" : "border-gray-300"}`}
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>

                  <div className="relative">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...register("password", {
                          required: "Password is required",
                          minLength: { value: 8, message: "Password must be at least 8 characters long" },
                        })}
                        className={`${inputClass} pr-10 ${errors.password ? "border-red-500" : "border-gray-300"}`}
                        aria-invalid={!!errors.password}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <AiFillEyeInvisible className="text-gray-500" /> : <AiFillEye className="text-gray-500" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                    <div className="mt-1 flex rounded-md shadow-sm relative">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        +91
                      </span>
                      <input
                        id="mobileNumber"
                        placeholder="Please Enter Your Mobile Number"
                        {...register("mobileNumber", {
                          required: "Mobile number is required",
                          pattern: { value: /^[0-9]{10,15}$/, message: "Mobile number must be 10-15 digits" },
                        })}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.value = target.value.replace(/[^0-9]/g, "");
                        }}
                        className={`flex-1 block w-full px-3 py-2 border ${errors.mobileNumber ? "border-red-500" : "border-gray-300"} rounded-r-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                        aria-invalid={!!errors.mobileNumber}
                      />
                    </div>
                    {errors.mobileNumber && <p className="text-red-500 text-sm mt-1">{errors.mobileNumber.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input
                      type="date"
                      id="dob"
                      {...register("dob", {
                        required: "Date of Birth is required",
                        validate: (value) => {
                          const today = new Date();
                          const dob = new Date(value);
                          const age = today.getFullYear() - dob.getFullYear();
                          const isOldEnough =
                            age > 18 ||
                            (age === 18 && today >= new Date(dob.setFullYear(today.getFullYear())));
                          return isOldEnough || "You must be at least 18 years old to register";
                        },
                      })}
                      className={`${inputClass} ${errors.dob ? "border-red-500" : "border-gray-300"}`}
                      aria-invalid={!!errors.dob}
                    />
                    {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      id="gender"
                      {...register("gender", { required: "Gender is required" })}
                      className={`${inputClass} ${errors.gender ? "border-red-500" : "border-gray-300"}`}
                      aria-invalid={!!errors.gender}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">Blood Group</label>
                    <select
                      id="bloodGroup"
                      {...register("bloodGroup", { required: "Blood group is required" })}
                      className={`${inputClass} ${errors.bloodGroup ? "border-red-500" : "border-gray-300"}`}
                      aria-invalid={!!errors.bloodGroup}
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                    {errors.bloodGroup && <p className="text-red-500 text-sm mt-1">{errors.bloodGroup.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="availability" className="block text-sm font-medium text-gray-700">Availability</label>
                    <select
                      id="availability"
                      {...register("availability", { required: "Availability is required" })}
                      className={`${inputClass} ${errors.availability ? "border-red-500" : "border-gray-300"}`}
                      aria-invalid={!!errors.availability}
                    >
                      <option value="available">Available</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                    {errors.availability && <p className="text-red-500 text-sm mt-1">{errors.availability.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                    <select
                      id="country"
                      {...register("country", { required: "Country is required" })}
                      onChange={(e) => {
                        setValue("country", e.target.value, { shouldValidate: true });
                        handleCountryChange(e.target.value);
                      }}
                      className={`${inputClass} ${errors.country ? "border-red-500" : "border-gray-300"}`}
                      aria-invalid={!!errors.country}
                    >
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                    {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                    <select
                      id="state"
                      {...register("state", { required: "State is required" })}
                      onChange={(e) => {
                        setValue("state", e.target.value, { shouldValidate: true });
                        handleStateChange(e.target.value);
                      }}
                      className={`${inputClass} ${errors.state ? "border-red-500" : "border-gray-300"}`}
                      aria-invalid={!!errors.state}
                    >
                      <option value="">Select State</option>
                      {states.map((stateName) => (
                        <option key={stateName} value={stateName}>
                          {stateName.split("_").join(" ")}
                        </option>
                      ))}
                    </select>
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700">District</label>
                    <select
                      id="district"
                      {...register("district", { required: "District is required" })}
                      onChange={(e) => {
                        setValue("district", e.target.value, { shouldValidate: true });
                        handleDistrictChange(e.target.value, selectedState || "");
                      }}
                      className={`${inputClass} ${errors.district ? "border-red-500" : "border-gray-300"}`}
                      aria-invalid={!!errors.district}
                    >
                      <option value="">Select District</option>
                      {districts.map((districtName) => (
                        <option key={districtName} value={districtName}>
                          {districtName.split("_").join(" ")}
                        </option>
                      ))}
                    </select>
                    {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">Sub Districts/City</label>
                    <select
                      id="city"
                      {...register("city", { required: "City is required" })}
                      onChange={(e) => setValue("city", e.target.value, { shouldValidate: true })}
                      className={`${inputClass} ${errors.city ? "border-red-500" : "border-gray-300"}`}
                      aria-invalid={!!errors.city}
                    >
                      <option value="">Select City</option>
                      {cities.map((cityName) => (
                        <option key={cityName} value={cityName}>
                          {cityName.split("_").join(" ")}
                        </option>
                      ))}
                    </select>
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="referredBy" className="block text-sm font-medium text-gray-700">Referred By (optional)</label>
                    <input
                      type="text"
                      id="referredBy"
                      placeholder="Enter referral code or name (if any)"
                      {...register("referredBy", {
                        maxLength: { value: 100, message: "Referred By cannot exceed 100 characters" },
                      })}
                      className={`${inputClass} ${errors.referredBy ? "border-red-500" : "border-gray-300"}`}
                      aria-invalid={!!errors.referredBy}
                    />
                    {errors.referredBy && <p className="text-red-500 text-sm mt-1">{errors.referredBy.message}</p>}
                  </div>
                </>
              )}
            </div>

            {step === 3 && (
              <div className="w-full">
                <div className="w-full bg-gray-50 border rounded-lg p-6 shadow-sm text-center">
                  <h3 className="text-2xl font-semibold text-gray-700 mb-6">Confirm Your Details</h3>

                  <div className="max-w-2xl mx-auto space-y-3 text-left">
                    {[
                      ["First Name", formValues.firstName],
                      ["Last Name", formValues.lastName],
                      ["Email", formValues.email],
                      ["Mobile Number", formValues.mobileNumber],
                      ["DOB", formValues.dob],
                      ["Blood Group", formValues.bloodGroup],
                      ["Gender", formValues.gender],
                      ["Availability", formValues.availability],
                      ["Country", formValues.country],
                      ["State", formValues.state],
                      ["District", formValues.district],
                      ["City", formValues.city],
                      ["Referred By", formValues.referredBy || "-"],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-600">{label}:</span>
                        <span className="text-gray-800">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-600 hover:text-white"
                  >
                    Previous
                  </button>
                  {step < steps.length && (
                    <button
                      type="button"
                      onClick={goNext}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      Next
                    </button>
                  )}
                </>
              ) : (
                <div className="flex justify-end w-full">
                  <button
                    type="button"
                    onClick={goNext}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Next
                  </button>
                </div>
              )}

              {step === steps.length && (
                <button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className={`px-4 py-2 text-white rounded-lg bg-red-500 hover:bg-red-600 transition-transform transform duration-300 ${
                    (!isValid || isSubmitting) && "opacity-50 cursor-not-allowed hover:bg-red-500"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <FaSpinner className="animate-spin h-5 w-5 text-white mr-2" />
                      Registering...
                    </div>
                  ) : (
                    "Confirm & Register"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminUserOnboarding;

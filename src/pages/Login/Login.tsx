import React, { useState, useCallback } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useAuth } from "../../Context/AuthContext";
import useAuthLogic from "../../hooks/useAuthLogic";
import { FaSpinner } from "react-icons/fa"; // Spinner for loading feedback

interface LoginFormInput {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

const Login: React.FC = () => {
  const { setAuthenticated, login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormInput>({ mode: "onChange" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state for button feedback

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  // Using custom hook for authentication logic
  const { isFormSubmitted, setIsFormSubmitted, mutate } = useAuthLogic(
    setAuthenticated,
    login,
    toast
  );

  const onSubmit: SubmitHandler<LoginFormInput> = async (data) => {
    setIsFormSubmitted(true);
    setIsLoading(true); // Set loading state before API call

    try {
      let identifier = data.identifier.trim();
      if (/^\d{10}$/.test(identifier)) {
        identifier = `+91${identifier}`;
      }
      const updatedData = { ...data, identifier };

      await mutate(updatedData, {
        onSuccess: () => {
          setIsLoading(false); // Reset loading state on success
        },
        onError: () => {
          setIsLoading(false); // Reset loading state on error
        },
      });
    } catch (error) {
      setIsLoading(false); // Ensure loading state is reset on any error
      console.error("Login failed:", error);
    }
  };

  return (
    <>
      <div
        className="min-h-screen bg-white flex items-center justify-center p-4"
        style={{ paddingTop: "4rem", paddingBottom: "4rem" }}
      >
        <Toaster />
        <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden relative animate-fade-in">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white text-center py-8 px-6">
            <h1 className="text-4xl font-extrabold mb-2">Lab Login</h1>
          </div>

          {/* Content Section */}
          <div className="flex flex-col sm:flex-row">
            <div className="hidden sm:flex sm:w-1/2 h-[350px] justify-center items-center relative mt-8">
              <video
                src="https://res.cloudinary.com/dqm7wf4zi/video/upload/v1734541688/theLifeSaversVideo_mrchef.mp4"
                poster="https://res.cloudinary.com/dqm7wf4zi/image/upload/v1734541684/thelifesaverslogo_odohxz.png"
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-contain"
                aria-label="Background video"
                preload="auto"
              />
            </div>
            <div className="w-full sm:w-1/2 p-8 flex flex-col justify-center items-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                Welcome,{" "}
                <span className="text-3xl text-red-600 font-bold">
                  Lab Partner
                </span>
              </h2>

              <div className="flex items-center mb-2 w-full">
                <hr className="flex-1 border-gray-300" />
                <span className="mx-4 text-sm text-gray-600">
                  Use email or mobile number to login
                </span>
                <hr className="flex-1 border-gray-300" />
              </div>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 w-full"
                aria-live="polite"
              >
                <div>
                  <label
                    htmlFor="identifier"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email or Mobile Number
                  </label>
                  <input
                    type="text"
                    id="identifier"
                    placeholder="Enter your email or mobile number"
                    {...register("identifier", {
                      required: "Email or mobile number is required",
                      validate: {
                        isValidMobileNumber: (value) => {
                          const cleanedValue = value.replace(/\D/g, "");
                          const hasCountryCode = value.startsWith("+91");
                          if (hasCountryCode && value.length > 13) {
                            return "Please enter valid mobile number";
                          }
                          if (!hasCountryCode && cleanedValue.length > 10) {
                            return "Mobile number cannot be more than 10 digits";
                          }
                          return true;
                        },
                      },
                    })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.identifier ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                    aria-invalid={errors.identifier ? "true" : "false"}
                  />
                  {errors.identifier && (
                    <p className="text-red-500 text-sm mt-1" role="alert">
                      {errors.identifier.message}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters long",
                      },
                    })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                    aria-invalid={errors.password ? "true" : "false"}
                  />
                  <div
                    className="absolute inset-y-11 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <AiFillEyeInvisible className="text-gray-500" />
                    ) : (
                      <AiFillEye className="text-gray-500" />
                    )}
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1" role="alert">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      {...register("rememberMe")}
                      className="h-4 w-4 accent-red-500 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="rememberMe"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="font-medium text-red-600 hover:text-red-500"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={!isValid || isFormSubmitted}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-transform duration-300 transform hover:scale-105"
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin h-5 w-5 mr-2 text-white" />
                        Logging in...
                      </>
                    ) : (
                      "Log in"
                    )}
                  </button>
                </div>
              </form>
              <div className="flex items-center mt-4 w-full">
                <hr className="flex-1 border-gray-300" />
                <span className="mx-4 text-sm text-gray-600 text-center">
                  Need access? Please contact your Life Savers administrator.
                </span>
                <hr className="flex-1 border-gray-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(Login);

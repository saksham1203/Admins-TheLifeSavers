import React, {
  ReactNode,
  useState,
  FormEvent,
  useEffect,
  useRef,
} from "react";
import { useForm, SubmitHandler } from "react-hook-form";
// import { useDonorsQuery, useVerifyPasswordMutation } from "../hooks/useDashboardHooks";
import {
  useDonorsQuery,
  useVerifyPasswordMutation,
} from "../../hooks/useDashboardHooks";

import { getStates, getDistricts, getCities } from "../../Components/indiaData";
import { FaLock, FaPhoneAlt } from "react-icons/fa";

export interface FindDonor {
  bloodGroup: string;
  country: string;
  state: string;
  district: string;
  city: string;
}

export interface Donor {
  gender: ReactNode;
  firstName: ReactNode;
  lastName: ReactNode;
  name: string;
  availability: boolean;
  mobile: string;
  reportUrl: string;
  mobileNumber?: string;
}

export interface VerifyPasswordResponse {
  isValid: boolean;
  msg?: string;
}

const Dashboard: React.FC = () => {
  const donorListRef = useRef<HTMLDivElement>(null); // Ref for Donors List section
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<FindDonor>({ mode: "onChange" });

  // const [, setSelectedCountry] = useState<string>("");
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [bloodGroups] = useState<string[]>([
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
  ]);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [selectedDonor] = useState<Donor | null>(null);
  // const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [password, setPassword] = useState<string>("");
  const [showFullNumber, setShowFullNumber] = useState<boolean>(false);
  const [popupMessage, setPopupMessage] = useState<string>("");

  const countries = ["Select Country", "India"];

  const handleCountryChange = (selectedCountry: string) => {
    if (selectedCountry === "India") {
      setStates(getStates()); // Fetch states from indiaData.ts
      setDistricts([]); // Reset districts
      setCities([]); // Reset cities
    } else {
      setStates([]);
      setDistricts([]);
      setCities([]);
    }
  };

  const handleStateChange = (selectedState: string) => {
    const fetchedDistricts = getDistricts(selectedState); // Fetch districts dynamically
    setDistricts(fetchedDistricts); // Set districts for selected state
    setCities([]); // Reset cities
  };

  const handleDistrictChange = (
    selectedDistrict: string,
    selectedState: string
  ) => {
    const fetchedCities = getCities(selectedState, selectedDistrict); // Fetch cities dynamically
    setCities(fetchedCities); // Set cities for selected district
  };

  // const handleCityChange = (selectedCity: string) => {
  //   console.log(`Selected City: ${selectedCity}`); // Log the selected city
  // };

  const { data: donors, isLoading, isError, refetch } = useDonorsQuery(watch);

  useEffect(() => {
    if (showResult) {
      const donorListSection = document.getElementById("donor-list");
      if (donorListSection) {
        donorListSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [showResult]); // Run when showResult changes

  // UseEffect to scroll when showResult becomes true
  useEffect(() => {
    if (showResult && donorListRef.current) {
      donorListRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showResult]); // Trigger this effect when showResult changes

  const onSubmit: SubmitHandler<FindDonor> = (data) => {
    console.log(data);
    setShowResult(true);
    refetch();

    donorListRef.current?.scrollIntoView({ behavior: "smooth" });

    // Scroll to Donor List using getElementById
    const donorListSection = document.getElementById("donor-list");
    if (donorListSection) {
      donorListSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // const handleMobileClick = (donor: Donor) => {
  //   setSelectedDonor(donor);
  //   setShowPopup(true);
  //   setShowFullNumber(false);
  //   setPopupMessage(""); // Clear any previous message
  // };

  const mutation = useVerifyPasswordMutation();

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate(password, {
      onSuccess: (data) => {
        if (data.isValid) {
          setShowFullNumber(true);
          setPopupMessage(""); // Clear the error message
        } else {
          setPopupMessage(data.msg || "Password is incorrect");
        }
      },
      onError: (error: any) => {
        if (error.response && error.response.data && error.response.data.msg) {
          setPopupMessage(error.response.data.msg);
        } else {
          setPopupMessage("An error occurred while verifying the password");
        }
      },
    });
    setPassword("");
  };

  const maskedMobile = (mobile?: string) => {
    if (!mobile) return ""; // Handle case where mobile is undefined or null

    return `${mobile.slice(0, 2)}xxxxxx${mobile.slice(-2)}`;
  };

  return (
    <>
      <div
        className="min-h-screen bg-white flex items-center justify-center p-4"
        style={{ paddingTop: "4rem", paddingBottom: "4rem" }}
      >
        <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden relative animate-fade-in">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white text-center py-8 px-6">
            <h1 className="text-4xl font-extrabold mb-2">Find Blood Donor</h1>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="bloodGroup"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Blood Group
                  </label>
                  <select
                    id="bloodGroup"
                    {...register("bloodGroup", {
                      required: "Blood group is required",
                    })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.bloodGroup ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map((group, index) => (
                      <option key={index} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                  {errors.bloodGroup && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.bloodGroup.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Country
                  </label>
                  <select
                    id="country"
                    {...register("country", {
                      required: "Country is required",
                    })}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.country ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                  >
                    {countries.map((country, index) => (
                      <option key={index} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.country.message}
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
                  <select
                    id="state"
                    {...register("state", { required: "State is required" })}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.state ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                  >
                    <option value="">Select State</option>
                    {states.map((state, index) => (
                      <option key={index} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.state.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="district"
                    className="block text-sm font-medium text-gray-700"
                  >
                    District
                  </label>
                  <select
                    id="district"
                    {...register("district", {
                      required: "District is required",
                    })}
                    onChange={(e) =>
                      handleDistrictChange(e.target.value, watch("state"))
                    }
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.district ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                  >
                    <option value="">Select District</option>
                    {districts.map((district, index) => (
                      <option key={index} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                  {errors.district && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.district.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Sub Districts/City
                  </label>
                  <select
                    id="city"
                    {...register("city", { required: "City is required" })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.city ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                  >
                    <option value="">Select City</option>
                    {cities.map((city, index) => (
                      <option key={index} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={!isValid}
                  className={`w-full bg-red-500 text-white py-2 px-4 mt-4 rounded-md ${
                    !isValid
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-105"
                  }`}
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* show result on pc */}

      {showResult && (
        <div
          id="donor-list"
          className="hidden sm:flex min-h-screen bg-white items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden relative">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-red-600 via-red-600 to-red-600 text-white text-center py-8 px-6">
              <h1 className="text-4xl font-extrabold mb-2">Donors List</h1>
            </div>

            {/* Content Section */}
            <div className="p-0">
              {/* Loading state */}
              {isLoading && (
                <div className="flex justify-center h-34 p-6">
                  <div className="inline-block text-center">
                    <div
                      className="inline-block h-16 w-16 animate-spin rounded-full border-8 border-solid border-red-500 border-r-transparent align-[-0.125em] text-danger motion-reduce:animate-[spin_1.5s_linear_infinite]"
                      role="status"
                    >
                      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                        Finding Donors...
                      </span>
                    </div>
                    <p className="text-lg text-gray-600 mt-4">Finding Donors...</p>
                  </div>
                </div>
              )}

              {/* Error state */}
              {!isLoading && isError && (
                <div className="flex flex-col items-center justify-center h-34 p-6">
                  <p className="text-red-500 text-lg mb-4">
                    No users found with the specified details.
                  </p>
                  <svg
                    onClick={() => {
                      refetch();
                    }}
                    className="w-10 h-10 text-red-600 cursor-pointer hover:text-red-500 transition-colors duration-300 transform"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}

              {/* Donor Table */}
              {!isLoading && donors && donors.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300 text-sm text-center shadow-2xl overflow-hidden">
                    <thead>
                      <tr className="bg-gradient-to-r from-red-600 via-red-600 to-red-600 text-white">
                        <th className="px-6 py-4 uppercase font-bold tracking-wider">
                          #
                        </th>
                        <th className="px-6 py-4 uppercase font-bold tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 uppercase font-bold tracking-wider">
                          Gender
                        </th>
                        <th className="px-6 py-4 uppercase font-bold tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 uppercase font-bold tracking-wider">
                          Mobile
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-800">
                      {donors.map((donor: Donor, index: number) => (
                        <tr
                          key={index}
                          className={`transition duration-300 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-red-50`}
                        >
                          <td className="px-6 py-4 font-bold text-red-700 text-base text-center">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-center justify-center">
                              <span className="font-medium">
                                {donor.firstName} {donor.lastName}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 capitalize text-center">
                            {donor.gender}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`px-3 py-1 text-xs font-bold rounded-full ${
                                donor.availability
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {donor.availability ? "Available" : "Unavailable"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <a
                              href={`tel:${donor.mobileNumber}`}
                              className="text-blue-600 hover:underline font-medium"
                            >
                              📞 {donor.mobileNumber}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* show result on mobile */}

      {showResult && (
        <div
          ref={donorListRef}
          id="donor-list"
          className="min-h-screen sm:hidden flex items-center justify-center px-4 py-14"
        >
          <div className="rounded-3xl shadow-2xl w-full max-w-3xl bg-white/90 backdrop-blur-md overflow-hidden animate-fade-in-up relative border border-red-200">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white text-center py-6 px-4">
              <h1 className="text-3xl font-extrabold tracking-wide">
                Donors List
              </h1>
              <p className="text-sm font-light mt-1">
                Real heroes don’t wear capes
              </p>
            </div>

            <div className="p-4 space-y-4">
              {/* Loading State */}
              {isLoading && (
                <div className="flex flex-col justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-500 border-t-transparent"></div>
                  <p className="text-gray-600 text-sm mt-3">
                    Fetching donors...
                  </p>
                </div>
              )}

              {/* Error State */}
              {!isLoading && isError && (
                <div className="text-center text-red-600 font-medium">
                  No users found with the specified details.
                </div>
              )}

              {/* Donor List */}
              {!isLoading &&
                donors &&
                donors.length > 0 &&
                donors.map((donor: Donor, index: number) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex justify-between items-center transition hover:shadow-lg hover:border-red-300"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-sm font-semibold text-red-600">
                        {index + 1}.
                      </div>
                      <div>
                        <p className="text-base font-semibold text-gray-800">
                          {donor.firstName} {donor.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{donor.gender}</p>
                        <p className="text-xs mt-1">
                          {donor.availability ? (
                            <span className="text-green-600 font-medium">
                              ✅ Available
                            </span>
                          ) : (
                            <span className="text-red-500 font-medium">
                              ❌ Not Available
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`tel:${donor.mobileNumber}`}
                      className="text-blue-600 text-sm font-semibold hover:underline"
                    >
                      📞 {donor.mobileNumber}
                    </a>
                  </div>
                ))}

              {/* Fallback for empty list */}
              {!isLoading && donors && donors.length === 0 && (
                <div className="text-center text-gray-500 text-lg py-8">
                  No donors found. Try different criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="fixed z-10 inset-0 overflow-y-auto animate-fade-in">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl w-full max-w-2xl animate-slide-in">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="sm:flex sm:items-start justify-center sm:justify-start sm:space-x-6">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-green-100 sm:mx-0 sm:h-16 sm:w-16">
                    <FaPhoneAlt className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left sm:w-4/5">
                    <h3 className="text-2xl leading-6 font-medium text-gray-900">
                      Mobile Number
                    </h3>
                    <div className="mt-3">
                      <p className="text-lg text-blue-500">
                        {selectedDonor && showFullNumber ? (
                          <a
                            href={`tel:${selectedDonor.mobileNumber}`}
                            className="hover:underline"
                          >
                            {selectedDonor.mobileNumber}
                          </a>
                        ) : (
                          maskedMobile(selectedDonor?.mobileNumber || "")
                        )}
                      </p>
                      {!showFullNumber && (
                        <form onSubmit={handlePasswordSubmit}>
                          <div className="mt-4 flex items-center justify-center relative">
                            <FaLock className="absolute left-3 text-gray-600" />
                            <input
                              type="password"
                              placeholder="Enter password to reveal"
                              className="block w-full px-4 py-2 pl-10 pr-4 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 sm:text-sm"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                          </div>
                        </form>
                      )}
                      {popupMessage && (
                        <p className="mt-2 text-sm text-red-500">
                          {popupMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-center sm:justify-end space-x-6">
                {!showFullNumber && (
                  <button
                    type="submit"
                    className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform duration-300 transform hover:scale-105"
                    onClick={handlePasswordSubmit}
                  >
                    Submit
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg shadow-sm text-sm font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-transform duration-300 transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;

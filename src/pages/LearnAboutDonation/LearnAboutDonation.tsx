import React from "react";
import {
  FaTint,
  FaHandsHelping,
  FaRegHeart,
  FaArrowLeft,
  FaUserShield,
  FaLightbulb,
  FaSmile,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const LearnAboutDonation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center p-6"
      style={{ paddingTop: "4rem", paddingBottom: "4rem" }}
    >
      <div className="bg-white rounded-2xl shadow-lg max-w-5xl w-full overflow-hidden relative animate-fade-in">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white text-center py-8 px-6 relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 sm:top-1/2 sm:left-6 transform sm:-translate-y-1/2 p-2 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition"
            aria-label="Go back"
          >
            <FaArrowLeft size={18} />
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 mt-4 sm:mt-0">
            Learn About Blood Donation
          </h1>
          <p className="text-md sm:text-lg max-w-3xl mx-auto">
            The Gift of Life is in Your Veins
          </p>
        </div>

        {/* Content Section */}

        <div className="py-10 px-6 sm:px-10 space-y-8">
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
            Blood donation is a selfless act of giving that can save countless
            lives. Every second, someone in the world needs blood, and your
            donation could be the critical difference in someone’s survival.
          </p>

          <div className=" sm:flex h-[350px] justify-center items-center relative mt-8">
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

          {/* Compatible Blood Type Donors Table */}
          <div>
            <h2 className="text-3xl font-bold text-red-600 mb-6 text-center">
              Compatible Blood Type Donors
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm text-center shadow-lg rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-red-600 via-red-600 to-red-600 text-white">
                    <th className="px-4 py-3 uppercase font-semibold">
                      Blood Type
                    </th>
                    <th className="px-4 py-3 uppercase font-semibold">
                      Donate Blood To
                    </th>
                    <th className="px-4 py-3 uppercase font-semibold">
                      Receive Blood From
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white border-b hover:bg-red-50 transition">
                    <td className="px-4 py-3 font-semibold text-red-600">A+</td>
                    <td className="px-4 py-3">A+, AB+</td>
                    <td className="px-4 py-3">A+, A-, O+, O-</td>
                  </tr>
                  <tr className="bg-gray-100 border-b hover:bg-red-50 transition">
                    <td className="px-4 py-3 font-semibold text-red-600">O+</td>
                    <td className="px-4 py-3">O+, A+, B+, AB+</td>
                    <td className="px-4 py-3">O+, O-</td>
                  </tr>
                  <tr className="bg-white border-b hover:bg-red-50 transition">
                    <td className="px-4 py-3 font-semibold text-red-600">B+</td>
                    <td className="px-4 py-3">B+, AB+</td>
                    <td className="px-4 py-3">B+, B-, O+, O-</td>
                  </tr>
                  <tr className="bg-gray-100 border-b hover:bg-red-50 transition">
                    <td className="px-4 py-3 font-semibold text-red-600">
                      AB+
                    </td>
                    <td className="px-4 py-3">AB+</td>
                    <td className="px-4 py-3">Everyone</td>
                  </tr>
                  <tr className="bg-white border-b hover:bg-red-50 transition">
                    <td className="px-4 py-3 font-semibold text-red-600">A-</td>
                    <td className="px-4 py-3">A+, A-, AB+, AB-</td>
                    <td className="px-4 py-3">A-, O-</td>
                  </tr>
                  <tr className="bg-gray-100 border-b hover:bg-red-50 transition">
                    <td className="px-4 py-3 font-semibold text-red-600">O-</td>
                    <td className="px-4 py-3">Everyone</td>
                    <td className="px-4 py-3">O-</td>
                  </tr>
                  <tr className="bg-white border-b hover:bg-red-50 transition">
                    <td className="px-4 py-3 font-semibold text-red-600">B-</td>
                    <td className="px-4 py-3">B+, B-, AB+, AB-</td>
                    <td className="px-4 py-3">B-, O-</td>
                  </tr>
                  <tr className="bg-gray-100 hover:bg-red-50 transition">
                    <td className="px-4 py-3 font-semibold text-red-600">
                      AB-
                    </td>
                    <td className="px-4 py-3">AB+, AB-</td>
                    <td className="px-4 py-3">AB-, A-, B-, O-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
            Whether you're a first-time donor or a regular, understanding the
            importance of blood donation is the first step towards making a
            meaningful contribution to your community.
          </p>

          {/* Icon Grid Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="text-red-600">
                <FaTint size={50} />
              </div>
              <h2 className="text-xl font-semibold">Why Donate Blood?</h2>
              <p className="text-md text-gray-600">
                Blood cannot be manufactured. It is only through donations that
                we can help trauma victims, patients undergoing surgery, and
                those with chronic illnesses.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="text-red-500">
                <FaHandsHelping size={50} />
              </div>
              <h2 className="text-xl font-semibold">Who Can Donate?</h2>
              <p className="text-md text-gray-600">
                Most healthy individuals aged 18–65, weighing at least 50 kg,
                can donate blood. A simple health screening will confirm your
                eligibility.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="text-red-400">
                <FaRegHeart size={50} />
              </div>
              <h2 className="text-xl font-semibold">The Benefits</h2>
              <p className="text-md text-gray-600">
                Donating blood not only helps recipients but also promotes
                better health for donors by reducing iron overload and boosting
                mental well-being.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="text-red-500">
                <FaUserShield size={50} />
              </div>
              <h2 className="text-xl font-semibold">Safety Measures</h2>
              <p className="text-md text-gray-600">
                Blood donation is a safe process. Sterile needles and equipment
                ensure no risk to the donor.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="text-red-600">
                <FaLightbulb size={50} />
              </div>
              <h2 className="text-xl font-semibold">How Often?</h2>
              <p className="text-md text-gray-600">
                Men can donate every 12 weeks, and women every 16 weeks.
                Platelet donors can donate more frequently.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="text-red-400">
                <FaSmile size={50} />
              </div>
              <h2 className="text-xl font-semibold">Join the Heroes</h2>
              <p className="text-md text-gray-600">
                Every donor is a hero. Be part of a life-saving mission and make
                a lasting impact.
              </p>
            </div>
          </div>

          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
            Your one act of kindness could save up to three lives. Let’s make
            the world a better place, one donation at a time.
          </p>

          {/* Contact Section */}
          {/* <div className="flex justify-center py-6">
            <button className="px-6 py-3 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition">
              Learn More: info@blooddonation.org
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LearnAboutDonation;

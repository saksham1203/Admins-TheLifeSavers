import React from "react";
import {
  FaHeartbeat,
  FaUsers,
  FaGlobe,
  FaRegSmileBeam,
  FaArrowLeft,
  FaShieldAlt,
  FaLightbulb,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AboutUs: React.FC = () => {
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
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 mt-4 sm:mt-0">About Us</h1>
          <p className="text-md sm:text-lg max-w-3xl mx-auto">
            Together for a Healthier Tomorrow
          </p>
        </div>

        {/* Content Section */}
        <div className="py-10 px-6 sm:px-10 space-y-8">
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
            At <strong>The Life Savers</strong>, we believe in the power of
            kindness, compassion, and community. Every drop of blood can mean
            the difference between life and death, and our mission is to make
            sure that no one faces this battle alone. We have created a platform
            where those in need of life-saving blood can connect with generous
            donors willing to give the gift of life.
          </p>

          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
            Our story is not just about technology; it's about{" "}
            <strong>human connection</strong>. It’s about building a bridge
            between those who want to help and those who desperately need it.
            Whether you are someone looking to donate or a person in need of
            blood, you are part of this mission – a mission that unites us all.
          </p>

          {/* Icon Grid Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="text-red-600">
                <FaHeartbeat size={50} />
              </div>
              <h2 className="text-xl font-semibold">Our Mission</h2>
              <p className="text-md text-gray-600">
                Our mission is to ensure that no one suffers due to the lack of
                timely blood donations. Together, we can save lives and spread
                hope.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="text-red-500">
                <FaUsers size={50} />
              </div>
              <h2 className="text-xl font-semibold">Our Vision</h2>
              <p className="text-md text-gray-600">
                To build a future where no one is left helpless. We envision a
                world where acts of kindness are common and accessible to all.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="text-red-400">
                <FaRegSmileBeam size={50} />
              </div>
              <h2 className="text-xl font-semibold">Our Values</h2>
              <p className="text-md text-gray-600">
                Compassion, community, trust, and accessibility are at the core
                of what we do. We ensure our platform is simple and secure for
                all users.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="text-red-500">
                <FaGlobe size={50} />
              </div>
              <h2 className="text-xl font-semibold">Who We Are</h2>
              <p className="text-md text-gray-600">
                We are a non-fundable organization working to connect people in
                need with donors, without seeking profit or financial support.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="text-red-600">
                <FaShieldAlt size={50} />
              </div>
              <h2 className="text-xl font-semibold">Trust and Security</h2>
              <p className="text-md text-gray-600">
                Your privacy and safety matter to us. Our platform ensures
                secure interactions between donors and recipients.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="text-red-400">
                <FaLightbulb size={50} />
              </div>
              <h2 className="text-xl font-semibold">Join Us</h2>
              <p className="text-md text-gray-600">
                Every donor is a hero, and every recipient is a reminder that
                hope is always within reach. Together, we can build a healthier,
                kinder tomorrow.
              </p>
            </div>
          </div>

          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
            Whether you’re a potential donor or someone searching for help, you
            are part of this family. Together, we are <strong>The Life Savers</strong>.
          </p>

          {/* Contact Section */}
          <div className="flex justify-center py-6">
            <button className="px-6 py-3 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition">
              Contact Us: thelifesaversofficials@gmail.com
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

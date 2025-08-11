import React from "react";
import { FaArrowLeft, FaArrowUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const TermsAndConditions: React.FC = () => {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center p-6"
      style={{ paddingTop: "4rem", paddingBottom: "4rem" }}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden relative animate-fade-in">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white text-center py-8 px-6 relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 sm:top-1/2 sm:left-6 transform sm:-translate-y-1/2 p-2 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition"
            aria-label="Go back"
          >
            <FaArrowLeft size={18} />
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 mt-4 sm:mt-0">Terms & Conditions</h1>
          <p className="text-md sm:text-lg max-w-2xl mx-auto">
            By using our platform, you agree to abide by the following terms and conditions. Failure to comply may result in legal consequences.
          </p>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="text-lg text-gray-700 mb-4">
            1.1. The Life Savers is a non-fundable organization that connects
            individuals in need of blood with potential donors through an online
            platform.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            1.2. By using our services, you agree to these Terms and Conditions,
            which constitute a legally binding agreement between you (the
            "User") and The Life Savers ("we," "us," or "our")
          </p>
          <p className="text-lg text-gray-700 mb-4">
            1.3. If you do not agree to these terms, please do not use the
            website. We reserve the right to amend these Terms at any time, with
            changes effective immediately upon posting.
          </p>

          <h2 className="text-2xl font-semibold mb-4">
            2. Platform Usage and User Obligations
          </h2>
          {/* <p className="text-lg text-gray-700 mb-4">
            2.1. **Eligibility:** Users must be at least 18 years old or have
            parental/guardian consent to use the platform.
          </p> */}
          <p className="text-lg text-gray-700 mb-4">
            2.1. **Eligibility:**
          </p>
          <p className="text-lg text-gray-700 mb-4">
            2.2. **Account Registration:** To access certain features, you must
            create an account. You are responsible for safeguarding your account
            credentials and any activity conducted under your account.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            2.3. **User Conduct:** Users must not engage in any fraudulent,
            abusive, or illegal activities on the platform. You agree to provide
            accurate information while registering or interacting with donors
            and recipients.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            2.4. **Donor and Recipient Responsibility:** We only provide a list
            of available and non-available donors. It is the user’s
            responsibility to contact donors and verify their suitability,
            availability, and eligibility.
          </p>

          <h2 className="text-2xl font-semibold mb-4">
            3. Non-Fundable Nature of Our Services
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            3.1. The Life Savers operates without external funding or financial
            support. We do not solicit donations or payments for the services
            offered.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            3.2. All connections facilitated through the platform are provided
            as a public service with no monetary transactions involved.
          </p>
          {/* <p className="text-lg text-gray-700 mb-4">
            3.3. The services provided are free to ensure public accessibility and inclusivity.
          </p> */}

          <h2 className="text-2xl font-semibold mb-4">
            4. Health and Medical Liability Disclaimer
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            4.1. We are not a medical service provider and do not offer
            professional health advice or medical consultations.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            4.2. Users must consult with healthcare professionals to ensure the
            suitability of any donor for their medical needs.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            4.3. We do not guarantee the health status, eligibility, or
            availability of any donor listed on the platform. All interactions
            between donors and recipients are conducted at the users' own risk.
          </p>

          <h2 className="text-2xl font-semibold mb-4">
            5. Privacy and Security
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            5.1. **User Data Privacy:** We are committed to protecting your
            personal data. Please review our Privacy Policy for more details on
            how we collect, store, and use your data.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            5.2. **Security:** While we employ industry-standard security
            measures to protect your information, we cannot guarantee complete
            protection from data breaches or cyber-attacks.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            5.3. **User Responsibility:** Users must take reasonable precautions
            to protect their accounts and personal information, including using
            strong passwords and keeping login credentials confidential.
          </p>

          <h2 className="text-2xl font-semibold mb-4">
            6. Third-Party Links and Content
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            6.1. The website may contain links to third-party websites or
            services. These links are provided for convenience only, and we are
            not responsible for the content, practices, or policies of any
            external sites.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            6.2. Users interact with third-party websites at their own risk. We
            are not liable for any losses, damages, or issues arising from the
            use of these external services.
          </p>
          {/* <p className="text-lg text-gray-700 mb-4">
            6.3. Any interaction with third-party websites is at the user's own risk.
          </p> */}

          <h2 className="text-2xl font-semibold mb-4">
            7. Limitation of Liability
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            7.1. We do not guarantee that the platform will always be available,
            uninterrupted, or error-free.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            7.2. The Life Savers and its team shall not be liable for any
            direct, indirect, incidental, or consequential damages, including
            (but not limited to) loss of data, personal injury, or emotional
            distress, arising from the use of the platform.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            7.3. We are not liable for any disputes, issues, or damages
            resulting from interactions between users and donors.
          </p>

          <h2 className="text-2xl font-semibold mb-4">
            8. Termination and Suspension of Accounts
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            8.1. We reserve the right to suspend or terminate accounts at our
            discretion if we detect any fraudulent or abusive behavior.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            8.2. Users who violate these Terms and Conditions may have their
            accounts terminated without prior notice.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            8.3. Upon termination, users are prohibited from creating new
            accounts without our express permission.
          </p>

          <h2 className="text-2xl font-semibold mb-4">
            9.Changes to Services and Information
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            9.1. We reserve the right to modify, update, or remove any
            information or features on the platform without prior notice.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            9.2. The Life Savers shall not be liable for any disruptions or
            inconveniences caused by such changes.
          </p>

          <h2 className="text-2xl font-semibold mb-4">
            10. Intellectual Property
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            10.1. All content on the website, including text, images, graphics,
            and logos, is the intellectual property of The Life Savers, unless
            otherwise stated.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            10.2. Users may not reproduce, distribute, or use any content from
            the website without prior written consent from us.
          </p>

          <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
          <p className="text-lg text-gray-700 mb-4">
            11.1. Users agree to indemnify and hold harmless The Life Savers,
            its affiliates, and team members from any claims, damages, or legal
            actions arising from their use of the platform or violation of these
            Terms and Conditions.
          </p>

          <h2 className="text-2xl font-semibold mb-4">
            12. Governing Law and Jurisdiction
          </h2>
          {/* <p className="text-lg text-gray-700 mb-4">
            12.1. These Terms and Conditions shall be governed by and construed
            in accordance with the laws of [Insert Country/Region].
          </p>
          <p className="text-lg text-gray-700 mb-4">
            12.2. Any disputes arising from these Terms will be resolved through
            mediation or arbitration in [Insert Jurisdiction].
          </p> */}
          <p className="text-lg text-gray-700 mb-4">
            12.1. These Terms and Conditions shall be governed by and construed
            in accordance with the laws.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            12.2. Any disputes arising from these Terms will be resolved through
            mediation or arbitration.
          </p>

          <h2 className="text-2xl font-semibold mb-4">
            13. Contact Information
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            13.1. For any inquiries, please contact us:
          </p>
          {/* <p className="text-lg text-gray-700 mb-4">
            Email: [Insert Email]  
            Phone: [Insert Phone Number]  
            Address: [Insert Address]
          </p>
          <p className="text-lg text-gray-700 mb-4">
            12.2. We aim to respond to inquiries within 3 business days.
          </p> */}

          <h2 className="text-2xl font-semibold mb-4">
            14.Acceptance of Terms
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            By accessing or using The Life Savers, you agree to be bound by
            these Terms and Conditions. If you do not agree with any part of
            these Terms, please discontinue your use of the platform.
          </p>

          {/* Back Button */}
          {/* Move to Top Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={scrollToTop}
              className="px-6 py-3 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition"
            >
              <FaArrowUp className="inline-block mr-2" />
              Move to Top
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;

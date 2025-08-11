import { FC, useEffect, useState } from 'react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DisclaimerModal: FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      document.body.style.overflow = 'hidden'; // Disable background scrolling
    } else {
      const timeout = setTimeout(() => setShowModal(false), 300);
      document.body.style.overflow = 'auto'; // Restore background scrolling
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto'; // Ensure scroll is restored on unmount
    };
  }, []);

  if (!showModal) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-in-out transform ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Background overlay */}
      <div
        className={`absolute inset-0 bg-black bg-opacity-60 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      ></div>

      {/* Modal content */}
      <div
        className={`relative bg-white rounded-lg shadow-xl max-w-lg w-11/12 p-8 transform transition-all duration-500 ease-in-out ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">Disclaimer</h2>

        {/* Scrollable content without top and bottom lines */}
        <div
          className="max-h-96 overflow-y-auto mt-4 mb-6"
          style={{
            scrollbarWidth: 'thin', // For Firefox
            WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
          }}
        >
          <p className="text-sm text-gray-700 mb-3">
            Welcome to <strong>The Life Savers</strong> – "Together for a Healthier Tomorrow." This platform helps users search for blood donors by filtering based on location and blood group. The website consists of features including user registration, login, a dashboard to search for donors, user profile management, and resources like About Us and Terms and Conditions.
          </p>
          <p className="text-sm text-gray-700 mb-3">
            We only provide a list of available and non-available donors on our platform. We do not guarantee the availability, eligibility, or health status of any donor. Users are responsible for verifying this information independently.
          </p>
          <ul className="text-sm text-gray-700 list-disc ml-5 mb-4 space-y-2">
            <li>
              <strong>No Medical or Emergency Guarantee:</strong> We are not a medical service provider. We only facilitate connections between users and donors. Users must verify donor availability and eligibility independently.
            </li>
            <li>
              <strong>Use at Your Own Risk:</strong> All interactions between donors and recipients are conducted at the users' discretion and risk. The Life Savers holds no responsibility for any issues, disputes, or outcomes resulting from these interactions.
            </li>
            <li>
              <strong>No Endorsement or Verification:</strong> The platform does not endorse or verify the identity, health condition, or credibility of donors. Users are advised to conduct necessary due diligence before proceeding.
            </li>
            <li>
              <strong>Third-Party Responsibility:</strong> We may provide links to third-party websites or services. The Life Savers is not responsible for the content, policies, or practices of these external sites.
            </li>
            <li>
              <strong>Limitation of Liability:</strong> The Life Savers and its team are not liable for any injuries, losses, damages, or disputes—whether direct or indirect—arising from the use of this platform or reliance on the information provided.
            </li>
            <li>
              <strong>Changes to Information and Services:</strong> We reserve the right to modify, update, or remove any information or services provided on this platform at any time without prior notice.
            </li>
          </ul>
        </div>

        {/* Modal close button */}
        <div className="flex justify-end mt-6">
          <button
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-300 ease-in-out transform active:scale-95"
            onClick={onClose}
            aria-label="Close the disclaimer modal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;

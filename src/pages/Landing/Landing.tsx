import React, { useRef, useState } from "react";
import CountUp from "react-countup";
import Slider from "react-slick";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const keywords = [
  "Blood Donation",
  "Donation",
  "Donate Blood",
  "Blood",
  "Near me",
  "Emergency blood requirement",
  "Urgent blood need",
  "Blood needed immediately",
  "Find blood donor",
  "Blood bank contact number",
  "Nearest blood bank",
  "Blood available near me",
  "AB positive blood urgent",
  "O negative blood requirement",
  "A positive blood needed",
  "B positive blood requirement",
  "AB negative blood availability",
  "Rare blood group urgent",
  "Where to get blood in Delhi",
  "Blood for surgery Mumbai",
  "Blood for accident victim Chennai",
  "Thalassemia blood requirement Bangalore",
  "Dengue blood needed Kolkata",
  "Platelets required Hyderabad",
  "Plasma needed Pune",
  "Blood appeal",
  "Help for blood",
  "Blood donor search",
  "Online blood request",
  "Blood request form",
  "Urgent blood appeal Delhi",
  "Blood shortage",
  "Get blood fast",
  "List of blood banks",
  "Government blood bank",
  "Private blood bank",
  "Hospital blood bank",
  "Blood transfusion services",
  "Safe blood source",
  "Cost of blood",
  "Free blood",
  "Blood donation camp for specific group",
  "Blood donor directory",
  "Emergency blood group search",
  "Blood for critical patient",
  "Nearest blood bank contact",
  "Blood needed for patient ",
  "How to find blood quickly",
  "Urgent medical blood",
  "Blood for operation",
  "Blood required for medical emergency",
  "Blood availability status",
  "Blood requirement for Disease",
  "Connect with blood donors",
  "Blood request app",
  "Delhi blood bank contact",
  "Mumbai blood bank number",
  "Kolkata blood urgent",
  "Chennai blood availability",
  "Hyderabad blood donors list",
  "Bangalore urgent blood",
  "Ahmedabad blood needed",
  "Pune blood requirement",
  "Jaipur blood bank",
  "Lucknow blood availability",
  "Bhopal urgent blood",
  "Patna blood bank",
  "Chandigarh blood needed",
  "Coimbatore blood bank",
  "Nagpur blood requirement",
  "Indore urgent blood",
  "Visakhapatnam blood availability",
  "Amritsar blood bank",
  "Thiruvananthapuram blood need",
  "Blood group specific search",
  "Nearest blood donation center for urgent need",
  "Blood helpline number",
  "24 hour blood bank",
  "Blood bank near [Area/Locality]",
  "Blood availability dashboard",
  "Online blood matching",
  "Blood donation for patient",
  "Where can I get blood for emergency?",
  "Immediate blood requirement",
  "Blood for my relative",
  "Blood needed for child",
  "Blood for mother",
  "Blood for father",
  "Blood for sister",
  "Blood for brother",
  "Help for blood transfusion",
  "Nearest blood center for patient",
  "Blood supply",
  "Blood bank stock",
  "Blood for medical treatment",
  "Need blood urgently",
  "How to arrange blood",
  "Blood for [Blood Group]",
  "Emergency blood services",
  "Blood bank locator",
  "Blood donor database",
  "Blood for specific disease",
  "Contact blood bank",
  "Blood donation camp for specific blood type",
  "Blood unit needed",
  "One unit blood requirement",
  "Donate blood",
  "Blood donation near me",
  "Become a blood donor",
  "Blood donor registration",
  "Volunteer to donate blood",
  "Blood donation requirements",
  "Who can donate blood",
  "Benefits of blood donation",
  "Blood donation camp",
  "Blood donation drive",
  "How to donate blood",
  "Blood donation process",
  "Eligibility for blood donation",
  "Blood donation facts",
  "Importance of blood donation",
  "Where to donate blood",
  "Donate plasma",
  "Plasma donation near me",
  "Platelet donation",
  "Whole blood donation",
  "Types of blood donation",
  "Red cross blood donation",
  "Blood donation camps",
  "Blood donation in Delhi",
  "Blood donation in Mumbai",
  "Blood donation in Bangalore",
  "Blood donation in Chennai",
  "Blood donation in Kolkata",
  "Blood donation during COVID",
  "Blood donation after vaccination",
  "Blood donation age limit",
  "Blood donation weight limit",
  "Blood donation health benefits",
  "Blood donation side effects",
  "Blood donation myths",
  "Blood donation statistics",
  "Blood donation app",
  "Blood donor card",
  "Pledge to donate blood",
  "Blood donation awareness",
  "World blood donor day",
  "National blood donation drive",
  "Blood donation campaign",
  "Upcoming blood donation camps",
  "Organize blood donation camp",
  "Blood donor login",
  "Register as blood donor",
  "Blood donation centre Delhi",
  "Blood donation hospital Mumbai",
  "Voluntary blood donation",
  "Why donate blood",
  "First time blood donor",
  "How often can I donate blood",
  "What to eat before blood donation",
  "What to do after blood donation",
  "Blood donation information",
  "Blood donation guidelines",
  "Safe blood donation",
  "Camps for blood donation",
  "Donate blood save lives",
  "Blood donation certificate",
  "Nearest place to donate blood",
  "e-raktkosh",
  "red cross",
  "Hospital",
  "Hospitals",
  "Governmnet",
  "India",
  "Indian",
  "help",
  "blood bank",
  "Online blood donation registration",
  "Blood donation for new donors",
  "Blood donation check-up",
  "Blood donor requirements list",
  "Blood donation benefits for donor",
  "Blood donation facts and myths",
  "Blood donation process steps",
  "Blood donation FAQ",
  "Blood donation drive near me",
  "Blood donation camp dates",
  "Blood donation volunteer",
  "Blood donation for good cause",
  "Blood donor rewards",
  "Can I donate blood if I have a tattoo",
  "Can I donate blood if I have fever",
  "Can I donate blood after drinking alcohol",
  "How long after illness can I donate blood",
  "Blood donation for women",
  "Blood donation for men",
  "Blood donation for specific blood group",
  "Where can I give blood",
  "Blood donation drive registration",
  "Blood donation facts",
  "Blood donation benefits for heart",
  "Blood donation and iron levels",
  "Blood donation mobile van",
  "Donate blood at home",
  "Blood donation near",
  "Blood donation helpline",
  "Become a regular blood donor",
  "Blood donation and weight loss",
  "Blood donation and immunity",
  "Blood donation and health check-up",
  "Online registration for blood donation",
  "Register for blood donation camp",
  "Donate blood",
  "Give blood for free",
  "Blood donation awareness campaign",
  "Blood donation requirements checklist",
  "Blood donation eligibility criteria",
];

const services = [
  {
    icon: "🩸",
    title: "Instant Donor Matching",
    desc: "Connects receivers with nearby compatible donors in real-time to reduce delays during emergencies.",
  },
  {
    icon: "👥",
    title: "Live Community Chat",
    desc: "Real‑time conversations with donors, recipients, volunteers & staff – ask questions, share experiences, or offer help live.",
  },
  {
    icon: "📝",
    title: "Educational Blogs & Stories",
    desc: "Informative articles about blood donation facts, health advice, inspiring donor/recipient stories and platform updates.",
  },
  {
    icon: "🔔",
    title: "Emergency Alerts",
    desc: "Get alerts when there's a shortage in your area so you can respond quickly and help.",
  },
  {
    icon: "💬",
    title: "Support",
    desc: "Need help? Our support connects you with our team instantly for any questions.",
  },
  {
    icon: "📣",
    title: "Awareness Campaigns",
    desc: "Join community‑led drives, share referral links, and host local events to spread awareness and boost donations.",
  },
  {
    icon: "🔒",
    title: "End-to-End Data Security",
    desc: "All user data, messages, and health info are encrypted and securely stored—privacy and safety are our top priorities.",
  },
  {
    icon: "📍",
    title: "Location-Based Search",
    desc: "Easily discover donors or receivers near you using smart, GPS-powered search filters tailored to your city or state.",
  },
  {
    icon: "🧪",
    title: "Health & Eligibility Guidelines",
    desc: "Stay informed with clear, up-to-date criteria for safe blood donation, including medical conditions, age, and donation intervals.",
  },
];

const AdminsTestimonials = [
  {
    name: "Himanshu | Founder",
    image:
      "https://res.cloudinary.com/dqm7wf4zi/image/upload/v1752081662/Himanshu_uhykhh.jpg",
    review:
      "As the founder, my vision was to build a platform that not only facilitates blood donation but also fosters a community driven by compassion. Seeing lives saved every day through our efforts is truly humbling.",
  },
];

const testimonials = [
  {
    name: "Shivam",
    image:
      "https://res.cloudinary.com/dqm7wf4zi/image/upload/v1752081662/1_hsk6ve.jpg",
    review:
      "Amazing initiative. I got help for my uncle within 2 hours. Thank you!",
  },
  {
    name: "Lakshay",
    image:
      "https://res.cloudinary.com/dqm7wf4zi/image/upload/v1752081662/2_cabtni.jpg",
    review:
      "Simple interface, fast response, and real-life impact. A must for every city.",
  },
];

const SectionTitle = ({ title }: { title: string }) => (
  <h2 className="text-3xl sm:text-4xl font-extrabold text-red-600 mb-10 text-center">
    {title}
  </h2>
);

const formatIndianNumber = (num: number): string => {
  return new Intl.NumberFormat("en-IN").format(num);
};

const StatCard = ({
  label,
  value,
  color,
  visible,
}: {
  label: string;
  value: number;
  color: string;
  visible: boolean;
}) => (
  <motion.div
    className="bg-white rounded-2xl p-6 shadow-[inset_4px_4px_12px_#e0e0e0,inset_-4px_-4px_12px_#ffffff] border border-gray-100"
    initial={{ opacity: 0, y: 40 }}
    animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
    transition={{ duration: 0.6 }}
  >
    <p className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
      {label}
    </p>
    <p className={`text-3xl sm:text-4xl font-bold ${color} min-h-[2.5rem]`}>
      {/* Reserve height with min-h to avoid layout shift */}
      <CountUp
        end={visible ? value : 0}
        duration={visible ? 2 : 0}
        formattingFn={formatIndianNumber}
      />
    </p>
  </motion.div>
);

const ServiceCard = ({
  icon,
  title,
  desc,
  delay,
  visible,
}: {
  icon: string;
  title: string;
  desc: string;
  delay: number;
  visible: boolean;
}) => (
  <motion.div
    className="bg-white rounded-2xl p-6 shadow-[inset_4px_4px_12px_#e0e0e0,inset_-4px_-4px_12px_#ffffff] border border-gray-100"
    initial={{ opacity: 0, y: 40 }}
    animate={visible ? { opacity: 1, y: 0 } : {}}
    transition={{ delay, duration: 0.6 }}
  >
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600 text-sm">{desc}</p>
  </motion.div>
);

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const initialVisibleCount = 100;
  const handleVideoToggle = () => {
    if (videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const { ref: introRef, inView: introInView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });
  const { ref: statsRef, inView: statsInView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  const { ref: serviceRef, inView: serviceInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white pt-14">
        <div className="bg-white w-full overflow-hidden relative">
          {/* Hero section */}
          <motion.header
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative z-0 bg-red-600 text-white py-20 px-6 overflow-hidden"
          >
            {/* Decorative background */}
            <div
              aria-hidden="true"
              className="absolute inset-0 -skew-y-6 bg-gradient-to-r from-red-700 via-red-500 to-red-400 opacity-90 transform-gpu"
            />

            <div className="relative z-10 max-w-4xl mx-auto text-center">
              {/* Main headline for SEO */}
              <motion.h1
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-tight"
              >
                Donate Blood. Save Lives. Make a Difference.
              </motion.h1>

              {/* Supporting description */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto"
              >
                Join a nationwide movement to support urgent blood donation
                needs.
                <br className="hidden sm:inline" />
                Connect with donors and recipients instantly — anytime,
                anywhere.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <button
                  onClick={() => navigate("/register")}
                  className="border border-white text-white font-semibold py-3 px-8 rounded-full hover:bg-white hover:text-red-600 transition duration-300"
                  aria-label="Join as a Blood Donor"
                >
                  Join Us
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="border border-white text-white font-semibold py-3 px-8 rounded-full hover:bg-white hover:text-red-600 transition duration-300"
                  aria-label="Find Blood Donors"
                >
                  Find Donors
                </button>
              </motion.div>
            </div>
          </motion.header>

          <main className="py-10 px-4 sm:px-10 space-y-8">
            {/* Intro/About  */}
            <section
              ref={introRef}
              className=" pb-6 px-4 sm:px-10 bg-white text-center"
            >
              <motion.h2
                className="text-3xl sm:text-4xl font-extrabold text-red-600 mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={introInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
              >
                Every Drop Counts. Every Life Matters.
              </motion.h2>

              <motion.p
                className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={introInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <span className="text-red-600 font-semibold">
                  The Life Savers
                </span>{" "}
                is a purpose-driven initiative committed to making life-saving
                blood donation faster, easier, and more accessible across{" "}
                <span className="text-red-600 font-semibold">India</span> We
                connect generous blood donors with patients facing urgent
                medical emergencies — in real time.
                <br />
                <br />
                Whether you're here to{" "}
                <span className="text-red-600 font-semibold">
                  donate blood online
                </span>{" "}
                or find a{" "}
                <span className="text-red-600 font-semibold">
                  blood donor near you
                </span>{" "}
                , you're already part of something bigger — a compassionate
                movement that saves lives with every heartbeat.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={introInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <button
                  onClick={() => navigate("/login")}
                  className="inline-block bg-red-600 text-white text-lg font-semibold py-3 px-8 rounded-full shadow-md hover:bg-red-700 transition"
                >
                  Become a Lifesaver Today
                </button>
              </motion.div>
            </section>

            {/* why */}
            <section className=" px-4 sm:px-10 bg-gradient-to-b to-white text-center">
              <SectionTitle title="Why Join Us?" />
              <motion.p
                className="text-lg text-gray-700 max-w-3xl mx-auto mb-14"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Join a movement that goes beyond donation. Together, we’re
                building a community of compassion, action, and life-saving
                impact. Here’s why you should be part of it:
              </motion.p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-2">
                {[
                  {
                    icon: "🌍",
                    title: "Make a Real Impact",
                    desc: "Every action you take helps save lives and brings hope to those in need.",
                  },
                  {
                    icon: "🤝",
                    title: "Be Part of a Community",
                    desc: "Connect with like-minded individuals who care deeply about helping others.",
                  },
                  {
                    icon: "🚀",
                    title: "Opportunities to Grow",
                    desc: "Develop leadership, teamwork, and communication skills through real-world contribution.",
                  },
                  {
                    icon: "⏰",
                    title: "Flexible Involvement",
                    desc: "Choose how and when you contribute—every effort counts, big or small.",
                  },
                  {
                    icon: "🏅",
                    title: "Recognition & Support",
                    desc: "Your time and dedication are valued and celebrated within our network.",
                  },
                  {
                    icon: "⚡",
                    title: "Drive Change",
                    desc: "Play a vital role in transforming how communities respond to emergencies.",
                  },
                ].map((item, i) => (
                  <ServiceCard
                    key={i}
                    icon={item.icon}
                    title={item.title}
                    desc={item.desc}
                    delay={i * 0.2}
                    visible={true}
                  />
                ))}
              </div>
            </section>

            {/* Video */}
            <div className="relative w-full max-w-5xl mx-auto mt-8 rounded-xl overflow-hidden border border-gray-200">
              <video
                ref={videoRef}
                src="https://res.cloudinary.com/dqm7wf4zi/video/upload/v1734541688/theLifeSaversVideo_mrchef.mp4"
                poster="https://res.cloudinary.com/dqm7wf4zi/image/upload/v1734541684/thelifesaverslogo_odohxz.png"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-auto object-contain bg-black"
              />
              <div className="absolute bottom-4 right-4">
                <button
                  onClick={handleVideoToggle}
                  className="bg-white/90 hover:bg-white text-red-600 font-semibold px-4 py-2 rounded-full shadow-md transition duration-300"
                >
                  {isPlaying ? "❚❚ Pause" : "▶ Play"}
                </button>
              </div>
            </div>

            {/* our services */}
            <section
              ref={serviceRef}
              className=" px-4 sm:px-10 bg-gradient-to-b to-white text-center"
            >
              <SectionTitle title="Our Services" />
              <motion.p
                className="text-lg text-gray-700 max-w-3xl mx-auto mb-14"
                initial={{ opacity: 0, y: 20 }}
                animate={serviceInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                We are committed to saving lives by bridging the gap between
                blood donors and those in urgent need. Here’s how we help:
              </motion.p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-2">
                {services.map((s, i) => (
                  <ServiceCard
                    key={i}
                    {...s}
                    delay={i * 0.2}
                    visible={serviceInView}
                  />
                ))}
              </div>
            </section>

            {/* Stats */}
            <section
              ref={statsRef}
              className=" px-4 sm:px-10 bg-gradient-to-b to-white text-center"
            >
              <SectionTitle title="Daily Blood Donation Stats" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-2">
                {[
                  {
                    label: "Avg. Units Needed / Year",
                    value: 14600000,
                    color: "text-red-600",
                  },
                  {
                    label: "Avg. Units Collected / Year",
                    value: 13600000,
                    color: "text-green-600",
                  },
                  {
                    label: "Avg. Units Shortage / Year",
                    value: 1000000,
                    color: "text-yellow-600",
                  },
                ].map((stat, idx) => (
                  <StatCard key={idx} {...stat} visible={statsInView} />
                ))}
              </div>
            </section>

            {/* LIfe savers - trust secure */}
            <section className=" px-4 sm:px-10 bg-gradient-to-b to-white text-center">
              <SectionTitle title="The Life Savers – Safe, Secure and Trusted" />
              <motion.p
                className="text-lg text-gray-700 max-w-3xl mx-auto mb-14"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Meet the real heroes behind the mission. Our platform brings
                together verified, compassionate donors and ensures every
                connection is private, safe, and trustworthy.
              </motion.p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-2">
                {[
                  {
                    icon: "🔐",
                    title: "End-to-End Data Security",
                    desc: "All user data, messages, and health info are encrypted and securely stored—privacy and safety are our top priorities.",
                  },
                  {
                    icon: "✅",
                    title: "Community-Backed Trust",
                    desc: "Ratings, reviews, and a transparent history help ensure trusted, reliable interactions at every step.",
                  },
                  {
                    icon: "🔄",
                    title: "Regular Platform Updates",
                    desc: "Stay informed with the latest features, safety guidelines, and donor community news to keep you engaged and aware.",
                  },
                ].map((item, i) => (
                  <ServiceCard
                    key={i}
                    icon={item.icon}
                    title={item.title}
                    desc={item.desc}
                    delay={i * 0.2}
                    visible={true}
                  />
                ))}
              </div>
            </section>

            {/* table */}
            <section>
              <SectionTitle title="Compatible Blood Type Donors" />
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 text-sm text-center shadow-2xl rounded-2xl overflow-hidden">
                  <thead>
                    <tr className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-600 text-white">
                      <th className="px-6 py-4 uppercase font-bold tracking-wider">
                        Blood Type
                      </th>
                      <th className="px-6 py-4 uppercase font-bold tracking-wider">
                        Donate Blood To
                      </th>
                      <th className="px-6 py-4 uppercase font-bold tracking-wider">
                        Receive Blood From
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800">
                    {[
                      ["A+", "A+, AB+", "A+, A-, O+, O-"],
                      ["O+", "O+, A+, B+, AB+", "O+, O-"],
                      ["B+", "B+, AB+", "B+, B-, O+, O-"],
                      ["AB+", "AB+", "Everyone"],
                      ["A-", "A+, A-, AB+, AB-", "A-, O-"],
                      ["O-", "Everyone", "O-"],
                      ["B-", "B+, B-, AB+, AB-", "B-, O-"],
                      ["AB-", "AB+, AB-", "AB-, A-, B-, O-"],
                    ].map((row, i) => (
                      <tr
                        key={i}
                        className={`transition duration-300 ${
                          i % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-red-50`}
                      >
                        {/* Blood Group with drop emoji */}
                        <td className="px-6 py-4 font-bold text-red-700 text-lg">
                          🩸 {row[0]}
                        </td>

                        {/* Donate To */}
                        <td className="px-6 py-4">
                          <div className="flex justify-center flex-wrap gap-1">
                            {row[1].split(", ").map((type, idx) => (
                              <span
                                key={idx}
                                className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Receive From */}
                        <td className="px-6 py-4">
                          <div className="flex justify-center flex-wrap gap-1">
                            {row[2] === "Everyone" ? (
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                Everyone
                              </span>
                            ) : (
                              row[2].split(", ").map((type, idx) => (
                                <span
                                  key={idx}
                                  className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium"
                                >
                                  {type}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Life Savers hero speakes */}
            <section className="px-4 sm:px-10 bg-gradient-to-b to-white text-center">
              {/* Section Title */}
              <SectionTitle title="Life Saver Heroes Speak" />

              {/* Flex container to hold both sliders side-by-side on desktop */}
              <div className="flex flex-col lg:flex-row justify-center gap-6">
                {/* First Slider */}
                <motion.div
                  className="w-full lg:w-1/2"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="text-center mb-10">
                    <h2 className="text-2xl sm:text-3xl font-bold text-red-600 tracking-tight relative inline-block">
                      Voices of Leadership
                      <span className="block w-12 h-0.5 bg-red-500 mx-auto mt-2 rounded-full"></span>
                    </h2>
                    <p className="mt-2 text-gray-600 text-sm sm:text-base max-w-md mx-auto">
                      Insights from our core team and leaders.
                    </p>
                  </div>

                  {AdminsTestimonials.map((t, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.95 }}
                      whileHover={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6 mx-4 sm:mx-10 min-h-[240px] flex flex-col justify-between">
                        <div className="flex flex-col sm:flex-row items-center gap-6 text-left">
                          <div className="flex-shrink-0">
                            <img
                              src={t.image}
                              alt={t.name}
                              className="w-24 h-24 rounded-full object-cover border-4 border-red-500"
                            />
                          </div>
                          <div className="flex flex-col justify-between flex-1 h-full relative">
                            <svg
                              className="w-6 h-6 text-red-400 mb-2"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M7.17 5.59A6 6 0 001 12v7h6v-7H4a4 4 0 014-4V5.59zm9 0A6 6 0 0010 12v7h6v-7h-3a4 4 0 014-4V5.59z" />
                            </svg>

                            <p className="text-base italic text-gray-700 mb-2">
                              {t.review}
                            </p>

                            <div className="flex justify-end">
                              <svg
                                className="w-6 h-6 text-red-400 mt-2"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M16.83 18.41A6 6 0 0023 12V5h-6v7h3a4 4 0 01-4 4v2.41zm-9 0A6 6 0 0014 12V5H8v7h3a4 4 0 01-4 4v2.41z" />
                              </svg>
                            </div>

                            <div className="flex justify-end mt-4">
                              <p className="text-sm sm:text-base font-semibold text-red-600 tracking-wide italic drop-shadow-sm">
                                — {t.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Second Slider - exact same structure */}
                <motion.div
                  className="w-full lg:w-1/2"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="text-center mb-10">
                    <h2 className="text-2xl sm:text-3xl font-bold text-red-600 tracking-tight relative inline-block">
                      Stories That Inspire
                      <span className="block w-12 h-0.5 bg-red-500 mx-auto mt-2 rounded-full"></span>
                    </h2>
                    <p className="mt-2 text-gray-600 text-sm sm:text-base max-w-md mx-auto">
                      Real experiences shared by our life savers and grateful
                      families.
                    </p>
                  </div>

                  <Slider
                    dots
                    infinite
                    speed={500}
                    slidesToShow={1}
                    slidesToScroll={1}
                    autoplay
                    autoplaySpeed={5000}
                    arrows={false}
                  >
                    {testimonials.map((t, i) => (
                      <motion.div
                        key={`second-${i}`}
                        initial={{ scale: 0.95 }}
                        whileHover={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6 mx-4 sm:mx-10 min-h-[240px] flex flex-col justify-between">
                          <div className="flex flex-col sm:flex-row items-center gap-6 text-left">
                            <div className="flex-shrink-0">
                              <img
                                src={t.image}
                                alt={t.name}
                                className="w-24 h-24 rounded-full object-cover border-4 border-red-500"
                              />
                            </div>
                            <div className="flex flex-col justify-between flex-1 h-full relative">
                              <svg
                                className="w-6 h-6 text-red-400 mb-2"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M7.17 5.59A6 6 0 001 12v7h6v-7H4a4 4 0 014-4V5.59zm9 0A6 6 0 0010 12v7h6v-7h-3a4 4 0 014-4V5.59z" />
                              </svg>

                              <p className="text-base italic text-gray-700 mb-2">
                                {t.review}
                              </p>

                              <div className="flex justify-end">
                                <svg
                                  className="w-6 h-6 text-red-400 mt-2"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M16.83 18.41A6 6 0 0023 12V5h-6v7h3a4 4 0 01-4 4v2.41zm-9 0A6 6 0 0014 12V5H8v7h3a4 4 0 01-4 4v2.41z" />
                                </svg>
                              </div>

                              <div className="flex justify-end mt-4">
                                <p className="text-sm sm:text-base font-semibold text-red-600 tracking-wide italic drop-shadow-sm">
                                  — {t.name}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </Slider>
                </motion.div>
              </div>
            </section>
          </main>

          <footer className="py-16 px-4 sm:px-10 bg-gradient-to-b to-white text-center">
            {/* Keywords list */}
            <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mb-6">
              {keywords.map((keyword, index) => (
                <div
                  key={index}
                  className={`flex items-center ${
                    showAll || index < initialVisibleCount
                      ? "inline-flex"
                      : "hidden"
                  }`}
                >
                  <button
                    onClick={() => navigate("/register")}
                    className="text-gray-500 hover:text-red-600 transition-colors duration-200 text-sm"
                  >
                    {keyword}
                  </button>
                  {index < keywords.length - 1 && (
                    <span className="text-gray-400 mx-1">|</span>
                  )}
                </div>
              ))}
            </div>

            {/* Show More / Less Button */}
            {keywords.length > initialVisibleCount && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-red-500 font-medium text-sm mb-6 hover:underline transition"
              >
                {showAll ? "Show Less" : "Show More"}
              </button>
            )}

            {/* Footer Text */}
            <p className="text-md sm:text-lg max-w-3xl mx-auto">
              © 2025{" "}
              <span className="text-red-600 font-semibold">
                The Life Savers.
              </span>{" "}
              All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Landing;

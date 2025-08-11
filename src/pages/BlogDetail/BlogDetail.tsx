import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUser, FaCalendarAlt } from "react-icons/fa";

const BlogDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { blog } = location.state as { blog: { title: string; author: string; date: string; content: string; image: string; tag: string; } };

  if (!blog) {
    return <div>Blog not found</div>;
  }

  const { title, author, date, content, image, tag } = blog;

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center p-8"
      style={{ paddingTop: "6rem", paddingBottom: "6rem" }}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full overflow-hidden relative animate-fade-in">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white text-center py-12 px-8 relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 p-3 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition"
          >
            <FaArrowLeft size={20} />
          </button>

          <h1 className="text-5xl font-extrabold mb-4">{title}</h1>
          <p className="text-xl max-w-3xl mx-auto">In-depth insights and stories</p>
        </div>

        {/* Blog Content Section */}
        <div className="py-16 px-12 space-y-8">
          <img
            src={image}
            alt={title}
            className="w-full h-96 object-fill rounded-3xl shadow-lg"
          />
          <div className="flex items-center text-gray-500 mb-4 space-x-4">
            <div className="flex items-center">
              <FaUser className="mr-2" />
              <span>{author}</span>
            </div>
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2" />
              <span>{date}</span>
            </div>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">{content}</p>
          <div className="text-sm text-gray-400 mt-8 text-right" style={{ opacity: 0.5 }}>
            {tag}
          </div>
        </div>

        {/* Contact Section */}
        <div className="flex justify-center py-8">
          <button className="px-8 py-4 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition">
            Contact Us: thelifesaversofficials@gmail.com
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;

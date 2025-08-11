import React, { useState } from "react";
import { FaArrowLeft, FaUser, FaCalendarAlt, FaFilter, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface BlogPost {
  _id: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  content: string;
  image: string;
  tag: string;
}

const fetchBlogs = async (): Promise<BlogPost[]> => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/blogs`);
  return data;
};

const Blogs: React.FC = () => {
  const navigate = useNavigate();
  const { data: blogPosts, isLoading, isError } = useQuery<BlogPost[], Error>({
    queryKey: ["blogs"],
    queryFn: fetchBlogs,
  });

  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "latest" ? "oldest" : "latest"));
  };

  const sortedBlogPosts = blogPosts?.slice().sort((a, b) => {
    return sortOrder === "latest"
      ? new Date(b.date).getTime() - new Date(a.date).getTime()
      : new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center p-6"
      style={{ paddingTop: "4rem", paddingBottom: "4rem" }}
    >
      <div className="bg-white rounded-2xl shadow-lg max-w-5xl w-full overflow-hidden relative animate-fade-in">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white text-center py-8 px-4 relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 sm:top-1/2 sm:left-6 transform sm:-translate-y-1/2 p-2 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition"
            aria-label="Go back"
          >
            <FaArrowLeft size={18} />
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 mt-4 sm:mt-0">Our Blogs</h1>
          <p className="text-md sm:text-lg max-w-3xl mx-auto">
            Insights and Stories for a Healthier Tomorrow
          </p>
          <button
            onClick={toggleSortOrder}
            className="absolute top-4 right-4 sm:top-1/2 sm:right-6 transform sm:-translate-y-1/2 p-2 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition"
            title={`Sort by ${sortOrder === "latest" ? "Oldest" : "Latest"} Date`}
          >
            <FaFilter size={18} />
          </button>
        </div>

        {/* Blog Posts Section */}
        <div className="py-10 px-6 max-w-5xl mx-auto">
          {/* Loading Spinner Section */}
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="inline-block text-center">
                <div
                  className="inline-block h-16 w-16 animate-spin rounded-full border-8 border-solid border-red-500 border-r-transparent align-[-0.125em] text-danger motion-reduce:animate-[spin_1.5s_linear_infinite]"
                  role="status"
                >
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                    Loading...
                  </span>
                </div>
                <p className="text-lg text-gray-600 mt-4">Loading...</p>
              </div>
            </div>
          )}

          {/* Error Section */}
          {isError && (
            <div className="bg-gray-100 rounded-xl shadow-md p-6 flex flex-col items-center text-center">
              <FaExclamationTriangle size={48} className="text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-red-600 mb-2">Error Fetching Blogs</h2>
              <p className="text-gray-700 mb-4">
                There was an issue connecting to the blogs service. Please check your internet connection or try again later.
              </p>
            </div>
          )}

          {/* Display Blog Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedBlogPosts && sortedBlogPosts.map((post) => (
              <div
                key={post._id}
                className="bg-gray-100 rounded-xl shadow-md hover:shadow-lg transition overflow-hidden relative"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    objectFit: 'cover' 
                  }} 
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-red-600 mb-2">
                    {post.title}
                  </h2>
                  <div className="flex items-center text-gray-500 mb-2 space-x-2">
                    <div className="flex items-center text-sm">
                      <FaUser className="mr-1" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <FaCalendarAlt className="mr-1" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-base text-gray-700 leading-relaxed mb-2">
                    {post.excerpt}
                  </p>
                  <Link
                    to={`/blogs/${post.title.replace(/\s+/g, "-").toLowerCase()}`}
                    state={{ blog: post }}
                    className="text-red-600 font-semibold hover:underline"
                  >
                    Read More
                  </Link>
                  <div
                    className="text-xs text-gray-400 absolute bottom-2 right-2"
                    style={{ opacity: 0.5 }}
                  >
                    {post.tag}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="flex justify-center py-6">
          <button
            onClick={() => navigate("/contact-us")}
            className="px-6 py-3 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition"
          >
            Need Assistance? Reach Out Anytime!
          </button>
        </div>
      </div>
    </div>
  );
};

export default Blogs;

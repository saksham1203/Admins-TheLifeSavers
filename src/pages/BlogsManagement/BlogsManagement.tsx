import React, { useEffect, useMemo, useState } from "react";
import { FaEdit, FaPlus, FaSearch, FaTag, FaTrash } from "react-icons/fa";

type ViteImportMeta = ImportMeta & { env?: { VITE_API_URL?: string } };
const API_BASE =
  (typeof import.meta !== "undefined" ? (import.meta as ViteImportMeta).env?.VITE_API_URL : undefined) ||
  "http://localhost:5000/api";

type BlogRow = {
  _id: string;
  title: string;
  author: string;
  excerpt: string;
  content: string;
  image: string;
  tag?: string;
  date?: string;
};

const emptyForm = {
  title: "",
  author: "",
  excerpt: "",
  content: "",
  image: "",
  tag: "General",
};

const BlogsManagement: React.FC = () => {
  const [rows, setRows] = useState<BlogRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        String(r.title || "").toLowerCase().includes(q) ||
        String(r.author || "").toLowerCase().includes(q) ||
        String(r.tag || "").toLowerCase().includes(q),
    );
  }, [rows, search]);

  const loadBlogs = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${API_BASE}/blogs`);
      const json = await res.json();
      if (!res.ok) throw new Error((json as any)?.error || "Failed to fetch blogs");
      setRows(Array.isArray(json) ? json : []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const saveBlog = async () => {
    if (!form.title.trim() || !form.author.trim() || !form.excerpt.trim() || !form.content.trim() || !form.image.trim()) {
      window.alert("Title, author, excerpt, content, and image URL are required.");
      return;
    }
    setLoading(true);
    setErr("");
    setMsg("");
    try {
      const url = editingId ? `${API_BASE}/blogs/${editingId}` : `${API_BASE}/blogs`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as any)?.error || "Save failed");
      setMsg(editingId ? "Blog updated successfully." : "Blog created successfully.");
      setForm(emptyForm);
      setEditingId(null);
      await loadBlogs();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const editBlog = (row: BlogRow) => {
    setEditingId(row._id);
    setForm({
      title: row.title || "",
      author: row.author || "",
      excerpt: row.excerpt || "",
      content: row.content || "",
      image: row.image || "",
      tag: row.tag || "General",
    });
  };

  const deleteBlog = async (id: string) => {
    const ok = window.confirm("Delete this blog?");
    if (!ok) return;
    setLoading(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch(`${API_BASE}/blogs/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as any)?.error || "Delete failed");
      setMsg("Blog deleted.");
      await loadBlogs();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
      <div className="mx-auto max-w-7xl rounded-2xl border border-red-100 bg-white shadow-lg">
        <div className="rounded-t-2xl bg-gradient-to-r from-red-600 to-red-400 px-5 py-4 text-white">
          <div className="text-xl font-bold">Blogs Management</div>
          <div className="text-sm text-white/90">Create, edit and delete blog posts.</div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-red-100 bg-gradient-to-b from-red-50/50 to-white p-4 shadow-sm">
            <div className="mb-3 font-bold text-red-700">{editingId ? "Edit Blog" : "Create Blog"}</div>
            <div className="space-y-2">
              <input value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} placeholder="Blog Title" className="w-full rounded-xl border border-red-100 bg-white px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100" />
              <input value={form.author} onChange={(e) => setForm((s) => ({ ...s, author: e.target.value }))} placeholder="Author Name" className="w-full rounded-xl border border-red-100 bg-white px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100" />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input value={form.tag} onChange={(e) => setForm((s) => ({ ...s, tag: e.target.value }))} placeholder="Category Tag" className="w-full rounded-xl border border-red-100 bg-white px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100" />
                <input value={form.image} onChange={(e) => setForm((s) => ({ ...s, image: e.target.value }))} placeholder="Cover Image URL" className="w-full rounded-xl border border-red-100 bg-white px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100" />
              </div>
              <textarea value={form.excerpt} onChange={(e) => setForm((s) => ({ ...s, excerpt: e.target.value }))} placeholder="Short Excerpt (summary)" className="min-h-[80px] w-full rounded-xl border border-red-100 bg-white px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100" />
              <textarea value={form.content} onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))} placeholder="Full Blog Content" className="min-h-[180px] w-full rounded-xl border border-red-100 bg-white px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100" />
              <div className="flex gap-2">
                <button disabled={loading} onClick={saveBlog} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                  <FaPlus className="mr-2 inline" />
                  {editingId ? "Update Blog" : "Create Blog"}
                </button>
                {editingId ? (
                  <button className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-red-50" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-red-100 bg-gradient-to-b from-red-50/30 to-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-bold text-red-700">Existing Blogs</div>
              <div className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">{filteredRows.length} posts</div>
            </div>
            <div className="mb-3 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, author, tag" className="w-full rounded-xl border border-red-100 bg-white pl-8 pr-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100" />
            </div>
            <div className="max-h-[62vh] overflow-auto rounded-xl border border-red-100 bg-white">
              {loading ? (
                <div className="px-3 py-3 text-sm text-gray-500">Loading...</div>
              ) : filteredRows.length === 0 ? (
                <div className="px-3 py-3 text-sm text-gray-500">No blogs found.</div>
              ) : (
                filteredRows.map((r) => (
                  <div key={r._id} className="border-b border-red-50 px-3 py-3 hover:bg-red-50/40 transition">
                    <div className="font-semibold text-gray-800">{r.title}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>{r.author}</span>
                      <span className="text-gray-300">|</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-red-700"><FaTag /> {r.tag || "General"}</span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button className="rounded border border-red-200 px-2 py-1 text-xs font-semibold hover:bg-red-50" onClick={() => editBlog(r)}>
                        <FaEdit className="mr-1 inline" /> Edit
                      </button>
                      <button className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700" onClick={() => deleteBlog(r._id)}>
                        <FaTrash className="mr-1 inline" /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {msg ? <div className="mx-5 mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{msg}</div> : null}
        {err ? <div className="mx-5 mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div> : null}
      </div>
    </div>
  );
};

export default BlogsManagement;

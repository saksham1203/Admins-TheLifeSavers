import React, { useMemo, useState } from "react";
import { FaBell, FaBullhorn, FaPaperPlane, FaUsers } from "react-icons/fa";

type ViteImportMeta = ImportMeta & { env?: { VITE_API_URL?: string } };
const API_BASE =
  (typeof import.meta !== "undefined" ? (import.meta as ViteImportMeta).env?.VITE_API_URL : undefined) ||
  "http://localhost:5000/api";

const PushNotifications: React.FC = () => {
  const [allTitle, setAllTitle] = useState("");
  const [allBody, setAllBody] = useState("");
  const [singleToken, setSingleToken] = useState("");
  const [singleTitle, setSingleTitle] = useState("");
  const [singleBody, setSingleBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const allCharCount = useMemo(() => allBody.trim().length, [allBody]);
  const singleCharCount = useMemo(() => singleBody.trim().length, [singleBody]);

  const sendAll = async () => {
    if (!allTitle.trim() || !allBody.trim()) {
      window.alert("Title and message are required for broadcast.");
      return;
    }
    setLoading(true);
    setMsg("");
    setErr("");
    try {
      const res = await fetch(`${API_BASE}/notifications/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: allTitle.trim(), body: allBody.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as any)?.error || "Broadcast failed");
      setMsg("Broadcast sent successfully.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Broadcast failed");
    } finally {
      setLoading(false);
    }
  };

  const sendSpecific = async () => {
    if (!singleToken.trim() || !singleTitle.trim() || !singleBody.trim()) {
      window.alert("Token, title and message are required.");
      return;
    }
    setLoading(true);
    setMsg("");
    setErr("");
    try {
      const res = await fetch(`${API_BASE}/notifications/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: singleToken.trim(),
          title: singleTitle.trim(),
          body: singleBody.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as any)?.error || "Send failed");
      setMsg("Notification sent to specific token.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Send failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
      <div className="mx-auto max-w-6xl rounded-2xl border border-red-100 bg-white shadow-lg">
        <div className="rounded-t-2xl bg-gradient-to-r from-red-600 to-red-400 px-5 py-4 text-white">
          <div className="flex items-center gap-2 text-xl font-bold">
            <FaBell /> Push Notifications
          </div>
          <div className="text-sm text-white/90">Send notification to all users or a specific device token.</div>
        </div>
        <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-red-100 bg-gradient-to-b from-red-50/60 to-white p-4 shadow-sm">
            <div className="mb-1 flex items-center gap-2 font-bold text-red-700">
              <FaBullhorn /> Broadcast (All)
            </div>
            <div className="mb-3 text-xs text-gray-500">Use this for announcements that must reach all registered devices.</div>
            <div className="space-y-2">
              <input value={allTitle} onChange={(e) => setAllTitle(e.target.value)} placeholder="Title (e.g. Service Update)" className="w-full rounded-xl border border-red-100 bg-white px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100" />
              <textarea value={allBody} onChange={(e) => setAllBody(e.target.value)} placeholder="Message for all users" className="min-h-[130px] w-full rounded-xl border border-red-100 bg-white px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100" />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="inline-flex items-center gap-1"><FaUsers /> Broadcast audience: all token holders</span>
                <span>{allCharCount} chars</span>
              </div>
              <button disabled={loading} onClick={sendAll} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                {loading ? "Sending..." : "Send to All"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-red-100 bg-gradient-to-b from-red-50/40 to-white p-4 shadow-sm">
            <div className="mb-1 flex items-center gap-2 font-bold text-red-700">
              <FaPaperPlane /> Specific Token
            </div>
            <div className="mb-3 text-xs text-gray-500">Use this for test pushes or individual device targeting.</div>
            <div className="space-y-2">
              <textarea value={singleToken} onChange={(e) => setSingleToken(e.target.value)} placeholder="FCM Token (device token)" className="min-h-[95px] w-full rounded-xl border border-red-100 bg-white px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100" />
              <input value={singleTitle} onChange={(e) => setSingleTitle(e.target.value)} placeholder="Title for this device" className="w-full rounded-xl border border-red-100 bg-white px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100" />
              <textarea value={singleBody} onChange={(e) => setSingleBody(e.target.value)} placeholder="Message for this device" className="min-h-[105px] w-full rounded-xl border border-red-100 bg-white px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100" />
              <div className="text-right text-xs text-gray-500">{singleCharCount} chars</div>
              <button disabled={loading} onClick={sendSpecific} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                {loading ? "Sending..." : "Send to Specific"}
              </button>
            </div>
          </div>
        </div>
        {msg ? <div className="mx-5 mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{msg}</div> : null}
        {err ? <div className="mx-5 mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div> : null}
      </div>
    </div>
  );
};

export default PushNotifications;

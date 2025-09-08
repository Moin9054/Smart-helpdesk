// client/src/pages/Config.jsx
import { useEffect, useState } from "react";
import api from "../api";  // Updated import path

export default function Config() {
  const [loading, setLoading] = useState(true);
  const [autoCloseEnabled, setEnabled] = useState(true);
  const [confidenceThreshold, setThreshold] = useState(0.78);
  const [slaHours, setSla] = useState(24);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/config");
        setEnabled(!!data.autoCloseEnabled);
        setThreshold(typeof data.confidenceThreshold === "number" ? data.confidenceThreshold : 0.78);
        setSla(typeof data.slaHours === "number" ? data.slaHours : 24);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setMsg("");
    await api.put("/config", {
      autoCloseEnabled,
      confidenceThreshold: Number(confidenceThreshold),
      slaHours: Number(slaHours),
    });
    setMsg("Saved ✅");
  };

  if (loading) return <div className="p-4">Loading config…</div>;

  return (
    <div className="p-4 max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={autoCloseEnabled} onChange={e => setEnabled(e.target.checked)} />
        <span>Enable Auto-Close</span>
      </label>

      <div>
        <label className="block text-sm">Confidence Threshold (0–1)</label>
        <input
          className="border p-2 w-full"
          type="number"
          min="0"
          max="1"
          step="0.01"
          value={confidenceThreshold}
          onChange={e => setThreshold(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm">SLA Hours</label>
        <input
          className="border p-2 w-full"
          type="number"
          min="1"
          value={slaHours}
          onChange={e => setSla(e.target.value)}
        />
      </div>

      <button onClick={save} className="bg-black text-white px-4 py-2 rounded">
        Save
      </button>
      {msg && <div className="text-green-600">{msg}</div>}
    </div>
  );
}
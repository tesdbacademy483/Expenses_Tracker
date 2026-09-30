import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function TargetManagement() {
  const { isAdmin } = useAuth();
  const [targets, setTargets] = useState([]);
  const [branches, setBranches] = useState([]);
  const [managers, setManagers] = useState([]);
  const [form, setForm] = useState({ name: "", type: "daily", branch: "", manager: "" });
  const [entryForm, setEntryForm] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const requests = [api.get("/targets/")];
    if (isAdmin) {
      requests.push(api.get("/branches/"), api.get("/managers/"));
    }
    const results = await Promise.all(requests);
    setTargets(results[0].data.results ?? results[0].data);
    if (isAdmin) {
      setBranches(results[1].data.results ?? results[1].data);
      setManagers(results[2].data.results ?? results[2].data);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateTarget = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { name: form.name, type: form.type };
      if (isAdmin) {
        payload.branch = Number(form.branch);
        payload.manager = Number(form.manager);
      }
      await api.post("/targets/", payload);
      setForm({ name: "", type: "daily", branch: "", manager: "" });
      loadData();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || "Failed to create target"));
    }
  };

  const handleAddEntry = async (targetId) => {
    const entry = entryForm[targetId];
    if (!entry?.date || !entry?.target_amount) return;
    try {
      await api.post("/targets/entries/", {
        target: targetId,
        date: entry.date,
        target_amount: entry.target_amount,
        achieved_amount: entry.achieved_amount || 0,
      });
      setEntryForm({ ...entryForm, [targetId]: {} });
      loadData();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || "Failed to add entry"));
    }
  };

  return (
    <div className="page">
      <h1>Target Management</h1>

      <div className="card">
        <h3>Create Target</h3>
        <form className="inline-form" onSubmit={handleCreateTarget}>
          <input placeholder="Target name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>
          {isAdmin && (
            <>
              <select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} required>
                <option value="">Branch</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <select value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} required>
                <option value="">Manager</option>
                {managers.map((m) => <option key={m.id} value={m.id}>{m.user.name}</option>)}
              </select>
            </>
          )}
          <button type="submit">Create Target</button>
        </form>
        {error && <p className="alert-error">{error}</p>}
      </div>

      {loading ? <p>Loading…</p> : targets.map((t) => (
        <div className="card" key={t.id}>
          <h3>{t.name} <span className="badge badge-blue">{t.type}</span></h3>
          <p className="muted">{t.branch_name} · Managed by {t.manager_name}</p>

          <table className="data-table">
            <thead><tr><th>Date</th><th>Target Amount</th><th>Achieved</th><th>Achievement %</th></tr></thead>
            <tbody>
              {t.entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.date}</td>
                  <td>₹{Number(entry.target_amount).toLocaleString()}</td>
                  <td>₹{Number(entry.achieved_amount).toLocaleString()}</td>
                  <td>{entry.achievement_percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          <form
            className="inline-form small"
            onSubmit={(e) => { e.preventDefault(); handleAddEntry(t.id); }}
          >
            <input
              type="date"
              value={entryForm[t.id]?.date || ""}
              onChange={(e) => setEntryForm({ ...entryForm, [t.id]: { ...entryForm[t.id], date: e.target.value } })}
              required
            />
            <input
              type="number" step="0.01" placeholder="Target amount"
              value={entryForm[t.id]?.target_amount || ""}
              onChange={(e) => setEntryForm({ ...entryForm, [t.id]: { ...entryForm[t.id], target_amount: e.target.value } })}
              required
            />
            <input
              type="number" step="0.01" placeholder="Achieved amount"
              value={entryForm[t.id]?.achieved_amount || ""}
              onChange={(e) => setEntryForm({ ...entryForm, [t.id]: { ...entryForm[t.id], achieved_amount: e.target.value } })}
            />
            <button type="submit">Add Entry</button>
          </form>
        </div>
      ))}
    </div>
  );
}
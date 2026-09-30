import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [targets, setTargets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [entryForm, setEntryForm] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [targetsRes, expensesRes] = await Promise.all([
        api.get("/targets/"),   // already scoped to this manager's branch
        api.get("/expenses/"),  // already scoped to this manager's branch
      ]);
      setTargets(targetsRes.data.results ?? targetsRes.data);
      setExpenses(expensesRes.data.results ?? expensesRes.data);
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAddEntry = async (targetId) => {
    const entry = entryForm[targetId];
    if (!entry?.date || !entry?.achieved_amount) return;
    setError("");
    try {
      // Use the same target_amount already set, just add today's achieved amount
      const target = targets.find((t) => t.id === targetId);
      const lastTargetAmount = target.entries[0]?.target_amount || 0;
      await api.post("/targets/entries/", {
        target: targetId,
        date: entry.date,
        target_amount: entry.target_amount || lastTargetAmount,
        achieved_amount: entry.achieved_amount,
      });
      setEntryForm({ ...entryForm, [targetId]: {} });
      loadData(); // refresh so percentage updates immediately
    } catch (err) {
      setError(JSON.stringify(err.response?.data || "Failed to add entry"));
    }
  };

  if (loading) return <div className="page"><p>Loading dashboard…</p></div>;

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="page">
      <h1>Welcome, {user?.name}</h1>
      <p className="page-subtitle">{user?.branch_name} branch overview</p>
      {error && <p className="alert-error">{error}</p>}

      {targets.length === 0 && (
        <div className="card"><p className="muted">No target assigned yet. Contact your admin.</p></div>
      )}

      {targets.map((t) => {
        const latestEntry = t.entries[0]; // most recent entry (ordering="-date" on backend)
        return (
          <div className="card" key={t.id}>
            <h3>{t.name} <span className="badge badge-blue">{t.type}</span></h3>

            <div className="kpi-grid">
              <div className="kpi-card">
                <span className="kpi-label">Target Amount</span>
                <span className="kpi-value">₹{Number(latestEntry?.target_amount || 0).toLocaleString()}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Achieved</span>
                <span className="kpi-value">₹{Number(latestEntry?.achieved_amount || 0).toLocaleString()}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Achievement %</span>
                <span className="kpi-value">{latestEntry?.achievement_percent || 0}%</span>
              </div>
            </div>

            <table className="data-table">
              <thead><tr><th>Date</th><th>Target</th><th>Achieved</th><th>%</th></tr></thead>
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
              />
              <input
                type="number" step="0.01" placeholder="Achieved amount"
                value={entryForm[t.id]?.achieved_amount || ""}
                onChange={(e) => setEntryForm({ ...entryForm, [t.id]: { ...entryForm[t.id], achieved_amount: e.target.value } })}
                required
              />
              <button type="submit">Add Entry</button>
            </form>
          </div>
        );
      })}

      <div className="card">
        <h3>My Expenses (Total: ₹{totalExpenses.toLocaleString()})</h3>
        <table className="data-table">
          <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Description</th></tr></thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id}>
                <td>{exp.date}</td>
                <td><span className="badge badge-orange">{exp.type}</span></td>
                <td>₹{Number(exp.amount).toLocaleString()}</td>
                <td>{exp.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
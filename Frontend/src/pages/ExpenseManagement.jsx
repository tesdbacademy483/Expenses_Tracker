import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ExpenseManagement() {
  const { isAdmin } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [managers, setManagers] = useState([]);
  const [form, setForm] = useState({ type: "salary", amount: "", date: "", description: "", branch: "", manager: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const requests = [api.get("/expenses/")];
    if (isAdmin) requests.push(api.get("/branches/"), api.get("/managers/"));
    const results = await Promise.all(requests);
    setExpenses(results[0].data.results ?? results[0].data);
    if (isAdmin) {
      setBranches(results[1].data.results ?? results[1].data);
      setManagers(results[2].data.results ?? results[2].data);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        type: form.type, amount: form.amount, date: form.date, description: form.description,
      };
      if (isAdmin) {
        payload.branch = Number(form.branch);
        payload.manager = Number(form.manager);
      }
      await api.post("/expenses/", payload);
      setForm({ type: "salary", amount: "", date: "", description: "", branch: "", manager: "" });
      loadData();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || "Failed to create expense"));
    }
  };

  const typeBadge = (type) => {
    const map = { salary: "badge-blue", tax: "badge-orange", other: "badge-gray" };
    return <span className={"badge " + (map[type] || "badge-gray")}>{type}</span>;
  };

  return (
    <div className="page">
      <h1>Expense Management</h1>

      <div className="card">
        <h3>Add Expense</h3>
        <form className="inline-form" onSubmit={handleSubmit}>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="salary">Salary</option>
            <option value="tax">Tax</option>
            <option value="other">Other</option>
          </select>
          <input type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
          <button type="submit">Add Expense</button>
        </form>
        {error && <p className="alert-error">{error}</p>}
      </div>

      <div className="card">
        <h3>All Expenses</h3>
        {loading ? <p>Loading…</p> : (
          <table className="data-table">
            <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Branch</th><th>Manager</th><th>Description</th></tr></thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id}>
                  <td>{exp.date}</td>
                  <td>{typeBadge(exp.type)}</td>
                  <td>₹{Number(exp.amount).toLocaleString()}</td>
                  <td>{exp.branch_name}</td>
                  <td>{exp.manager_name}</td>
                  <td>{exp.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
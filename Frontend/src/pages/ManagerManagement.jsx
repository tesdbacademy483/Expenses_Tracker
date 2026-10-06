import { useEffect, useState } from "react";
import api from "../api/axios";

export default function ManagerManagement() {
  const [managers, setManagers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", branch_id: "", location: "", designation: "Branch Manager" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [mgrRes, branchRes] = await Promise.all([api.get("/managers/"), api.get("/branches/")]);
    setManagers(mgrRes.data.results ?? mgrRes.data);
    setBranches(branchRes.data.results ?? branchRes.data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/managers/", { ...form, branch_id: Number(form.branch_id) });
      setForm({ name: "", email: "", password: "", branch_id: "", designation: "Branch Manager" });
      loadData();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || "Failed to create manager"));
    }
  };

  return (
    <div className="page">
      <h1>Managers</h1>

      <div className="card">
        <h3>Add New Manager</h3>
        <form className="inline-form" onSubmit={handleSubmit}>
          <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input type="password" placeholder="Temporary password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          <select value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })} required>
            <option value="">Select Company</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          <select
              value={form.location}
              onChange={(e) =>
                  setForm({
                      ...form,
                      location: e.target.value
                  })
              }
              required
          >
              <option value="">Select location</option>

              {branches.map((b) => (
                  <option key={b.id} value={b.location}>
                      {b.location}
                  </option>
              ))}
          </select>

          <input placeholder="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          <button type="submit">Add Manager</button>
        </form>
        {error && <p className="alert-error">{error}</p>}
      </div>

      <div className="card">
        <h3>All Managers</h3>
        {loading ? <p>Loading…</p> : (
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Branch</th><th>Designation</th><th>Since</th></tr></thead>
            <tbody>
              {managers.map((m) => (
                <tr key={m.id}>
                  <td>{m.user.name}</td>
                  <td>{m.user.email}</td>
                  <td>{m.branch.name}</td>
                  <td>{m.designation}</td>
                  <td>{new Date(m.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
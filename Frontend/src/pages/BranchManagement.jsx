import { useEffect, useState } from "react";
import api from "../api/axios";

export default function BranchManagement() {
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({ name: "", location: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadBranches = async () => {
    setLoading(true);
    const { data } = await api.get("/branches/");
    setBranches(data.results ?? data);
    setLoading(false);
  };

  useEffect(() => { loadBranches(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/branches/", form);
      setForm({ name: "", location: "" });
      loadBranches();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || "Failed to create branch"));
    }
  };

  const toggleActive = async (branch) => {
    await api.patch(`/branches/${branch.id}/`, { is_active: !branch.is_active });
    loadBranches();
  };

  return (
    <div className="page">
      <h1>Branch Management</h1>

      <div className="card">
        <h3>Add New Branch</h3>
        <form className="inline-form" onSubmit={handleSubmit}>
          <input
            placeholder="Branch name (e.g. Chennai)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
          />
          <button type="submit">Add Branch</button>
        </form>
        {error && <p className="alert-error">{error}</p>}
      </div>

      <div className="card">
        <h3>All Branches</h3>
        {loading ? <p>Loading…</p> : (
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Location</th><th>Managers</th><th>Status</th><th>Created</th><th>Status</th><th>Branch Id</th></tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td>{b.location}</td>
                  <td>{b.manager_count}</td>
                  <td>
                    <span className={"badge " + (b.is_active ? "badge-green" : "badge-gray")}>
                      {b.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{new Date(b.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="link-btn" onClick={() => toggleActive(b)}>
                      {b.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
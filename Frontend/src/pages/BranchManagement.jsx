/* import { useEffect, useState } from "react";
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
              <tr><th>Company Name</th><th>Location</th><th>Managers</th><th>Status</th><th>Created</th><th>Status</th><th>Branch Id</th></tr>
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
} */


import { useEffect, useState } from "react";
import api from "../api/axios";

export default function BranchManagement() {
  const [branches, setBranches] = useState([]);

  const [form, setForm] = useState({
    name: "",
    location: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit mode
  const [editingId, setEditingId] = useState(null);

  const loadBranches = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/branches/");

      setBranches(data.results ?? data);
    } catch (err) {
      setError(
        JSON.stringify(
          err.response?.data || "Failed to load branches"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  // Create / Update Branch
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingId) {
        // UPDATE
        await api.patch(`/branches/${editingId}/`, {
          name: form.name,
          location: form.location,
        });
      } else {
        // CREATE
        await api.post("/branches/", form);
      }

      // Reset form
      setForm({
        name: "",
        location: "",
      });

      setEditingId(null);

      loadBranches();
    } catch (err) {
      setError(
        JSON.stringify(
          err.response?.data ||
            (editingId
              ? "Failed to update branch"
              : "Failed to create branch")
        )
      );
    }
  };

  // Edit button
  const handleEdit = (branch) => {
    setEditingId(branch.id);

    setForm({
      name: branch.name,
      location: branch.location,
    });

    setError("");
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);

    setForm({
      name: "",
      location: "",
    });

    setError("");
  };

  // Delete branch
  const handleDelete = async (branch) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${branch.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/branches/${branch.id}/`);

      // If currently editing this branch
      if (editingId === branch.id) {
        handleCancelEdit();
      }

      loadBranches();
    } catch (err) {
      setError(
        JSON.stringify(
          err.response?.data || "Failed to delete branch"
        )
      );
    }
  };

  return (
    <div className="page">

      <h1>Branch Management</h1>

      {/* CREATE / EDIT FORM */}
      <div className="card">

        <h3>
          {editingId ? "Edit Branch" : "Add New Branch"}
        </h3>

        <form
          className="inline-form"
          onSubmit={handleSubmit}
        >

          <input
            placeholder="Branch name (e.g. Chennai)"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            required
          />

          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) =>
              setForm({
                ...form,
                location: e.target.value,
              })
            }
            required
          />

          <button type="submit">
            {editingId ? "Update Branch" : "Add Branch"}
          </button>

          {/* Cancel Edit */}
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          )}

        </form>

        {error && (
          <p className="alert-error">
            {error}
          </p>
        )}
      </div>


      {/* ALL BRANCHES */}
      <div className="card">

        <h3>All Branches</h3>

        {loading ? (
          <p>Loading…</p>
        ) : (
          <table className="data-table">

            <thead>
              <tr>
                <th>Company Name</th>
                <th>Location</th>
                <th>Managers</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {branches.map((b) => (

                <tr key={b.id}>

                  <td>
                    {b.name}
                  </td>

                  <td>
                    {b.location}
                  </td>

                  <td>
                    {b.manager_count}
                  </td>

                  <td>
                    {new Date(
                      b.created_at
                    ).toLocaleDateString()}
                  </td>

                  <td>

                    <button
                      className="link-btn"
                      onClick={() => handleEdit(b)}
                    >
                      Edit
                    </button>

                    <button
                      className="link-btn"
                      onClick={() => handleDelete(b)}
                      style={{
                        marginLeft: "15px",
                        color: "red",
                      }}
                    >
                      Delete
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
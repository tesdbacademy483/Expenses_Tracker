import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function TargetManagement() {
  const { isAdmin } = useAuth();
  const [targets, setTargets] = useState([]);
  const [branches, setBranches] = useState([]);
  const [managers, setManagers] = useState([]);
  const [form, setForm] = useState({
  name: "",
  type: "daily",
  branch: "",
  manager: "",
  location: "",
  target_amount: "",
  start_date: "",
  end_date: ""
});
  const [entryForm, setEntryForm] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editEntry, setEditEntry] = useState(null);

  const handleEditEntry = (targetId, entry) => {
  if (!isAdmin) return;

  setEditEntry({
        id: entry.id,
        target: targetId,
        date: entry.date,
        achieved_amount: entry.achieved_amount,
        payment_type: entry.payment_type,
      });
    };

    const handleUpdateEntry = async () => {
  if (!isAdmin || !editEntry) return;

  try {
    await api.patch(
      `/targets/entries/${editEntry.id}/`,
      {
        date: editEntry.date,
        achieved_amount: editEntry.achieved_amount,
        payment_type: editEntry.payment_type,
      }
    );

    setEditEntry(null);
    loadData();

  } catch (err) {
    setError(
      JSON.stringify(
        err.response?.data || "Failed to update payment"
      )
    );
  }
};

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
      const payload = {
        name: form.name,
        type: form.type,
        location: form.location,
        target_amount: Number(form.target_amount),
        start_date: form.start_date,
        end_date: form.end_date
      };
      if (isAdmin) {
        payload.branch = Number(form.branch);
        payload.manager = Number(form.manager);
      }
      await api.post("/targets/", payload);
      setForm({
        name: "",
        type: "daily",
        branch: "",
        manager: "",
        location: "",
        target_amount: "",  
        start_date: "",
        end_date: ""
      });
      loadData();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || "Failed to create target"));
    }
  };



  const handleAddEntry = async (targetId) => {
  const entry = entryForm[targetId];

  if (
      !entry?.date ||
      !entry?.achieved_amount ||
      !entry?.payment_type
      ) {
          return;
      }

  try {
    await api.post("/targets/entries/", {
      target: targetId,
      date: entry.date,
      achieved_amount: entry.achieved_amount,
      payment_type: entry.payment_type,
    });

    setEntryForm({
      ...entryForm,
      [targetId]: {}
    });

    loadData();

  } catch (err) {
    setError(
      JSON.stringify(
        err.response?.data || "Failed to add entry"
      )
    );
  }
};

  return (
    <div className="page">
      <h1>Target Management</h1>
    {isAdmin && (
      <div className="card">
        <h3>Create Target</h3>
  

      <form className="inline-form" onSubmit={handleCreateTarget}>

          <input
            placeholder="Target name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value
              })
            }
            required
          />

          <select
            value={form.type}
            onChange={(e) =>
              setForm({
                ...form,
                type: e.target.value
              })
            }
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>

          {isAdmin && (
            <>
              <select
                value={form.branch}
                onChange={(e) =>
                  setForm({
                    ...form,
                    branch: e.target.value
                  })
                }
                required
              >
                <option value="">Branch</option>

                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <select
                value={form.manager}
                onChange={(e) =>
                  setForm({
                    ...form,
                    manager: e.target.value
                  })
                }
                required
              >
                <option value="">Manager</option>

                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.user.name}
                  </option>
                ))}
              </select>

            
            </>
          )}
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
                  <option
                      key={b.id}
                      value={b.location}
                  >
                      {b.location}
                  </option>
              ))}
        </select>

          {/* NEW - Target Amount */}
          <input
            type="number"
            step="0.01"
            placeholder="Target Amount"
            value={form.target_amount}
            onChange={(e) =>
              setForm({
                ...form,
                target_amount: e.target.value
              })
            }
            required
          />

          {/* NEW - Start Date */}
          <input
            type="date"
            value={form.start_date}
            onChange={(e) =>
              setForm({
                ...form,
                start_date: e.target.value
              })
            }
            required
          />

          {/* NEW - End Date */}
          <input
            type="date"
            value={form.end_date}
            min={form.start_date || undefined}
            onChange={(e) =>
              setForm({
                ...form,
                end_date: e.target.value
              })
            }
            required
          />

          <button type="submit">
            Create Target
          </button>

        </form>
        
        {error && <p className="alert-error">{error}</p>}
      </div>
    )}

      {loading ? <p>Loading…</p> : targets.map((t) => (


        <div className="card" key={t.id}>

          <h3>
            {t.name}
            <span className="badge badge-blue">
              {t.type}
            </span>
          </h3>

          <p className="muted">
            {t.branch_name} · {t.location} · Managed by {t.manager_name}
          </p>

          <p className="muted">
            Start Date: <strong>{t.start_date}</strong>
            {"  "}
            End Date: <strong>{t.end_date}</strong>
          </p>

          <p>
            Target Amount:
            <strong>
              ₹{Number(t.target_amount).toLocaleString()}
            </strong>
          </p>

          <table className="data-table">

            <thead>
              <tr>
                <th>Date</th>
                <th>Achieved</th>
                <th>Payment Type</th>
                <th>Achievement %</th>
                {isAdmin && <th>Action</th>}
              </tr>
            </thead>

            <tbody>

              {t.entries.map((entry) => (
                <tr key={entry.id}>

                  <td>{entry.date}</td>

                  <td>
                    ₹{Number(
                      entry.achieved_amount
                    ).toLocaleString()}
                  </td>

                  <td>
                      <span className="badge badge-blue">
                        {entry.payment_type === "cash"
                          ? "Cash"
                          : entry.payment_type === "card"
                          ? "Card"
                          : "UPI"}
                      </span>
                  </td>

                  <td>
                    {entry.achievement_percent}%
                  </td>

                  {isAdmin && (
                    <td>
                      <button
                        type="button"
                        onClick={() => handleEditEntry(t.id, entry)}
                      >
                        Edit
                      </button>
                    </td>
                  )}

                </tr>
              ))}

            </tbody>

          </table>

   {isAdmin &&
  editEntry &&
  editEntry.target === t.id && (
    <div className="card">
      <h4>Edit Payment</h4>

      <input
        type="date"
        value={editEntry.date}
        onChange={(e) =>
          setEditEntry({
            ...editEntry,
            date: e.target.value,
          })
        }
      />

      <input
        type="number"
        step="0.01"
        placeholder="Achieved amount"
        value={editEntry.achieved_amount}
        onChange={(e) =>
          setEditEntry({
            ...editEntry,
            achieved_amount: e.target.value,
          })
        }
      />

      <select
        value={editEntry.payment_type}
        onChange={(e) =>
          setEditEntry({
            ...editEntry,
            payment_type: e.target.value,
          })
        }
      >
        <option value="cash">Cash</option>
        <option value="card">Card</option>
        <option value="upi">UPI</option>
      </select>

      <button
        type="button"
        onClick={handleUpdateEntry}
      >
        Update
      </button>

      <button
        type="button"
        onClick={() => setEditEntry(null)}
      >
        Cancel
      </button>
    </div>
  )}

{!isAdmin && (
            <form
              className="inline-form small"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddEntry(t.id);
              }}
            >

              <input
                type="date"
                min={t.start_date}
                max={t.end_date}
                value={entryForm[t.id]?.date || ""}
                onChange={(e) =>
                  setEntryForm({
                    ...entryForm,
                    [t.id]: {
                      ...entryForm[t.id],
                      date: e.target.value
                    }
                  })
                }
                required
              />

              <input
                type="number"
                step="0.01"
                placeholder="Achieved amount"
                value={entryForm[t.id]?.achieved_amount || ""}
                onChange={(e) =>
                  setEntryForm({
                    ...entryForm,
                    [t.id]: {
                      ...entryForm[t.id],
                      achieved_amount: e.target.value
                    }
                  })
                }
                required
              />

              <select
                value={entryForm[t.id]?.payment_type || ""}
                onChange={(e) =>
                    setEntryForm({
                        ...entryForm,
                        [t.id]: {
                            ...entryForm[t.id],
                            payment_type: e.target.value
                        }
                    })
                }
                required
              >
                <option value="">Payment Mode</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
            </select>

              <button type="submit">

                Add Entry
              </button>

            </form>
)}
        </div>
      ))}
    </div>
  );
}
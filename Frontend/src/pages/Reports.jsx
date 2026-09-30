import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../api/axios";

const COLORS = ["#3b82f6", "#f97316", "#a855f7", "#22c55e", "#ef4444", "#eab308"];

export default function Reports() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/reports/branch-summary/").then(({ data }) => {
      setSummary(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="page"><p>Loading reports…</p></div>;

  return (
    <div className="page">
      <h1>Reports</h1>
      {summary.map((b) => {
        const pieData = [
          { name: "Salary", value: Number(b.expenses.salary) },
          { name: "Tax", value: Number(b.expenses.tax) },
          { name: "Other", value: Number(b.expenses.other) },
        ].filter((d) => d.value > 0);

        return (
          <div className="card" key={b.branch_id}>
            <h3>{b.branch_name} ({b.location})</h3>
            <div className="report-grid">
              <div>
                <p><strong>Total Target:</strong> ₹{Number(b.total_target).toLocaleString()}</p>
                <p><strong>Total Achieved:</strong> ₹{Number(b.total_achieved).toLocaleString()}</p>
                <p><strong>Achievement:</strong> {b.achievement_percent}%</p>
                <p><strong>Total Expenses:</strong> ₹{Number(b.expenses.total).toLocaleString()}</p>
              </div>
              <div style={{ width: "100%", height: 220 }}>
                {pieData.length > 0 ? (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                        {pieData.map((entry, i) => (
                          <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="muted">No expense data yet.</p>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [branchSummary, setBranchSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, summaryRes] = await Promise.all([
          api.get("/reports/dashboard-stats/"),
          api.get("/reports/branch-summary/"),
        ]);
        setStats(statsRes.data);
        setBranchSummary(summaryRes.data);
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="page"><p>Loading dashboard…</p></div>;
  if (error) return <div className="page"><p className="alert-error">{error}</p></div>;

  const chartData = branchSummary.map((b) => ({
    name: b.branch_name,
    Target: b.total_target,
    Achieved: b.total_achieved,
    Expenses: b.expenses.total,
  }));

  return (
    <div className="page">
      <h1>Welcome, {user?.name}</h1>
      <p className="page-subtitle">Company-wide overview</p>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Branches</span>
          <span className="kpi-value">{stats.branch_count}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Total Target</span>
          <span className="kpi-value">₹{Number(stats.total_target).toLocaleString()}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Total Achieved</span>
          <span className="kpi-value">₹{Number(stats.total_achieved).toLocaleString()}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Achievement</span>
          <span className="kpi-value">{stats.achievement_percent}%</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Total Expenses</span>
          <span className="kpi-value">₹{Number(stats.total_expenses).toLocaleString()}</span>
        </div>
      </div>

      <div className="card">
        <h3>Target vs Achieved vs Expenses by Branch</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Target" fill="#3b82f6" />
            <Bar dataKey="Achieved" fill="#22c55e" />
            <Bar dataKey="Expenses" fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3>Branch Summary</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Branch</th><th>Target</th><th>Achieved</th><th>Achievement %</th>
              <th>Salary</th><th>Tax</th><th>Other</th><th>Total Expenses</th>
            </tr>
          </thead>
          <tbody>
            {branchSummary.map((b) => (
              <tr key={b.branch_id}>
                <td>{b.branch_name}</td>
                <td>₹{Number(b.total_target).toLocaleString()}</td>
                <td>₹{Number(b.total_achieved).toLocaleString()}</td>
                <td>{b.achievement_percent}%</td>
                <td>₹{Number(b.expenses.salary).toLocaleString()}</td>
                <td>₹{Number(b.expenses.tax).toLocaleString()}</td>
                <td>₹{Number(b.expenses.other).toLocaleString()}</td>
                <td>₹{Number(b.expenses.total).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
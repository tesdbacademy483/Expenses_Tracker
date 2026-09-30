import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const adminLinks = [
  { to: "/", label: "Dashboard" },
  { to: "/branches", label: "Branch Management" },
  { to: "/managers", label: "Managers" },
  { to: "/targets", label: "Target Management" },
  { to: "/expenses", label: "Expense Management" },
  { to: "/reports", label: "Reports" },
];

const managerLinks = [
  { to: "/", label: "Dashboard" },
  { to: "/targets", label: "Target Management" },
  { to: "/expenses", label: "Expense Management" },
  { to: "/reports", label: "Reports" },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const links = isAdmin ? adminLinks : managerLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Branch Manager</h2>
        <p className="sidebar-user">{user?.name} · {user?.role}</p>
        {user?.branch_name && <p className="sidebar-branch">{user.branch_name}</p>}
      </div>
      <nav>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <button className="logout-btn" onClick={handleLogout}>Log out</button>
    </aside>
  );
}
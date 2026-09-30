import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import BranchManagement from "./pages/BranchManagement";
import ManagerManagement from "./pages/ManagerManagement";
import TargetManagement from "./pages/TargetManagement";
import ExpenseManagement from "./pages/ExpenseManagement";
import Reports from "./pages/Reports";
import { useAuth } from "./context/AuthContext";

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

// This is the "switch" — checks role and shows the right dashboard
function RoleDashboard() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <ManagerDashboard />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout><RoleDashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/branches"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout><BranchManagement /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/managers"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout><ManagerManagement /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/targets"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <Layout><TargetManagement /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <Layout><ExpenseManagement /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <Layout><Reports /></Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
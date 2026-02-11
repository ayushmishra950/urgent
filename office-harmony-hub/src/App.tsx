import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/Users";
import Companies from "@/pages/Companies";
import Departments from "@/pages/Departments";
import Attendance from "@/pages/Attendance";
import Leave from "@/pages/Leave";
import Expenses from "@/pages/Expenses";
import Payroll from "@/pages/Payroll";
import Notifications from "@/pages/Notifications";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import NotFound from "./pages/NotFound";
import EmployeeDashboard from "@/components/cards/EmployeeCard";
import TaskLayout from "@/task/TaskLayout";
import TaskDashboard from "./task/Task-Dashboard";
import Task from "./task/Task";
import SubTask from "./task/Sub-Task";
import Project from "./task/Project";
import OverdueTask from "./task/OverDue-Task";
import TaskManager from "./task/TaskManager";
import { NotificationProvider } from "@/contexts/NotificationContext";

// global.d.ts
export {};

declare global {
  interface Window {
    reactRouterNavigate?: (path: string) => void;
  }
}


const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
   window.reactRouterNavigate = navigate;

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />

      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/user/:id" element={<EmployeeDashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/departments" element={<Departments />} />
        {/* <Route path="/tasks" element={<Tasks />} /> */}
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/leave" element={<Leave />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />



        {/* Task Routes */}
        <Route path="/tasks" element={<TaskLayout />}>
          <Route index element={<TaskDashboard />} />
          <Route path="projects" element={<Project />} />
          <Route path="task" element={<Task />} />
          <Route path="sub-task" element={<SubTask />} />
          <Route path="overdue" element={<OverdueTask />} />
          <Route path="manager" element={<TaskManager />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

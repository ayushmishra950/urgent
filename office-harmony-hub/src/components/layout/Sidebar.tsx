
import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Users, Building2, FolderKanban, Clock, CalendarDays, Receipt, Wallet, Bell, BarChart3, Settings, LogOut, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}
interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  roles: ('super_admin' | 'admin' | 'employee')[];
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['super_admin', 'admin', 'employee'] },
  { icon: Users, label: 'Employees', path: '/users', roles: ['super_admin', 'admin'] },
  { icon: Building2, label: 'Companies', path: '/companies', roles: ['super_admin'] },
  { icon: Briefcase, label: 'Departments', path: '/departments', roles: ['admin'] },
  { icon: FolderKanban, label: 'Tasks', path: '/tasks', roles: ['admin', 'employee'] },
  { icon: Clock, label: 'Attendance', path: '/attendance', roles: ['admin', 'employee'] },
  { icon: CalendarDays, label: 'Leave', path: '/leave', roles: ['admin', 'employee'] },
  { icon: Receipt, label: 'Expenses', path: '/expenses', roles: ['admin'] },
  { icon: Wallet, label: 'Payroll', path: '/payroll', roles: ['admin', 'employee'] },
  { icon: Bell, label: 'Notifications', path: '/notifications', roles: ['super_admin', 'admin', 'employee'] },
  { icon: BarChart3, label: 'Reports', path: '/reports', roles: ['admin'] },
  { icon: Settings, label: 'Settings', path: '/settings', roles: ['super_admin', 'admin', 'employee'] },
];

/** Task Submenu (Admin/Super Admin Only) */
const taskSubMenu = [
  { label: 'Dashboard', path: '/tasks', roles: ["admin", "manager", "employee"] },
  { label: 'Projects', path: '/tasks/projects', roles: ["admin"] },
  { label: 'Tasks', path: '/tasks/task', roles: ["admin", "manager", "employee"] },
  { label: 'Sub Tasks', path: '/tasks/sub-task', roles: ["admin", "manager"] },
  { label: 'Overdue Tasks', path: '/tasks/overdue', roles: ["admin", "manager", "employee"] },
  { label: "Task Manager", path: "/tasks/manager", roles: ["admin"] }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const taskItemRef = useRef<HTMLLIElement>(null);

  const [showTaskSubMenu, setShowTaskSubMenu] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const effectiveRole = user?.role === "admin" ? "admin" : user?.role === "employee" && user?.taskRole === "manager" ? "manager" : "employee";

  const filteredTaskSubMenu = taskSubMenu.filter(sub => sub.roles.includes(effectiveRole));

  const getRoleBadge = (role: string) => {
    const roleLabels = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      employee: 'Employee',
    };
    return roleLabels[role as keyof typeof roleLabels] || role;
  };

  /** Close sidebar on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        onToggle();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  /** Hover handlers with delay to prevent flicker */
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setShowTaskSubMenu(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowTaskSubMenu(false);
    }, 150); // 150ms delay for smooth hover
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className="fixed top-0 left-0 h-full z-50 w-64 flex flex-col bg-sidebar shadow-lg"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-sidebar-foreground text-lg">OfficeHub</h1>
            <p className="text-xs text-sidebar-muted">Management System</p>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="font-semibold text-sidebar-accent-foreground">
                  {user.username?.charAt(0) || user.fullName?.charAt(0)}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white font-medium truncate">
                  {user.username || user.fullName}
                </p>
                <p className="text-xs text-sidebar-primary">
                  {getRoleBadge(user.role)} <br />
                  {user?.role === "employee" && user?.taskRole === "manager" && " (Department Manager)"}
                </p>

              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {filteredNavItems.map((item) => {
              /** Tasks with Dropdown for Admin/Super Admin */
              if (
                item.label === 'Tasks' &&
                user &&
                (user.role === 'admin' || user.role === 'employee')
              ) {
                return (
                  <li
                    key={item.path}
                    ref={taskItemRef}
                    className="relative"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Main Tasks Button */}
                    <NavLink
                      to="/tasks"
                      className={cn(
                        'sidebar-item',
                        location.pathname.startsWith('/tasks') &&
                        'sidebar-item-active'
                      )}
                    >
                      <FolderKanban className="w-5 h-5" />
                      <span>Tasks</span>
                    </NavLink>

                    {/* Dropdown */}
                    {showTaskSubMenu && (
                      <div
                        className="
                          fixed
                          left-[256px]
                          top-[var(--task-menu-top)]
                          w-48
                          rounded-md
                          bg-sidebar
                          shadow-xl
                          border
                          border-sidebar-border
                          z-[60]
                          transition-all duration-150 ease-out
                        "
                      >
                        <ul className="py-2">
                          {filteredTaskSubMenu?.map((sub) => (
                            <li key={sub.path}>
                              <NavLink
                                to={sub.path}
                                className={({ isActive }) => {
                                  // Default active Dashboard only if location is /tasks exactly
                                  let active = false;

                                  if (location.pathname === '/tasks' && sub.label === 'Dashboard') {
                                    active = true;
                                  }

                                  // Override default if real isActive (clicked item) is true
                                  if (isActive) {
                                    active = true;
                                  }

                                  // But if some other dropdown item is active, Dashboard default should not be active
                                  if (sub.label === 'Dashboard' && location.pathname !== '/tasks') {
                                    active = false;
                                  }

                                  return cn(
                                    'block px-4 py-2 text-sm text-white hover:bg-sidebar-accent',
                                    active ? 'bg-sidebar-accent font-medium' : ''
                                  );
                                }}
                              >
                                {sub.label}
                              </NavLink>
                            </li>
                          ))}

                        </ul>
                      </div>
                    )}
                  </li>
                );
              }

              /** Normal Sidebar Item */
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'sidebar-item',
                      isActive && 'sidebar-item-active'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.path === '/users' ? user?.role === 'super_admin' ? 'Admins' : 'Employees' : item.label}</span>

                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border mt-auto">
          <button
            onClick={logout}
            className="sidebar-item w-full text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onToggle}
      />
    </>
  );
};

export default Sidebar;

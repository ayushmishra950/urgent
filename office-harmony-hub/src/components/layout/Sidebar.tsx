
// import React, { useEffect, useRef, useState } from 'react';
// import { NavLink, useLocation } from 'react-router-dom';
// import { useAuth } from '@/contexts/AuthContext';
// import { FolderKanban, LogOut} from 'lucide-react';
// import { cn } from '@/lib/utils';
// import {SidebarProps,navItems, taskSubMenu, JobSubMenu } from "@/services/allFunctions";

// const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
//   const { user, logout } = useAuth();
//   const location = useLocation();
//   const sidebarRef = useRef<HTMLDivElement>(null);
//   const taskItemRef = useRef<HTMLLIElement>(null);

//   const [showTaskSubMenu, setShowTaskSubMenu] = useState(false);
//   const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const [showJobSubMenu, setShowJobSubMenu] = useState(false);
// const jobItemRef = useRef<HTMLLIElement | null>(null);


//   const filteredNavItems = navItems.filter(
//     (item) => user && item.roles.includes(user.role)
//   );

//   const effectiveRole = user?.role === "admin" ? "admin" : user?.role === "employee" && user?.taskRole === "manager" ? "manager" : "employee";

//   const filteredTaskSubMenu = taskSubMenu.filter(sub => sub.roles.includes(effectiveRole));

//   const getRoleBadge = (role: string) => {
//     const roleLabels = {
//       super_admin: 'Super Admin',
//       admin: 'Admin',
//       employee: 'Employee',
//     };
//     return roleLabels[role as keyof typeof roleLabels] || role;
//   };

//   /** Close sidebar on outside click */
//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (
//         isOpen &&
//         sidebarRef.current &&
//         !sidebarRef.current.contains(e.target as Node)
//       ) {
//         onToggle();
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [isOpen, onToggle]);

//   /** Hover handlers with delay to prevent flicker */
//   const handleMouseEnter = () => {
//     if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
//     setShowTaskSubMenu(true);
//   };

//   const handleMouseLeave = () => {
//     hoverTimeoutRef.current = setTimeout(() => {
//       setShowTaskSubMenu(false);
//     }, 150); // 150ms delay for smooth hover
//   };


//   const handleJobMouseEnter = () => {
//   if (jobItemRef.current) {
//     const rect = jobItemRef.current.getBoundingClientRect();
//     document.documentElement.style.setProperty(
//       "--job-menu-top",
//       `${rect.top}px`
//     );
//   }
//   setShowJobSubMenu(true);
// };

// const handleJobMouseLeave = () => {
//   setShowJobSubMenu(false);
// };


//   if (!isOpen) return null;

//   return (
//     <>
//       {/* Sidebar */}
//       <aside
//         ref={sidebarRef}
//         className="fixed top-0 left-0 h-full z-50 w-64 flex flex-col bg-sidebar shadow-lg"
//       >
//         {/* Logo */}
//         <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
//           <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center overflow-hidden">
//             {user?.companyId?.logo || user?.createdBy?.logo ? (
//               <img
//                 src={user?.companyId?.logo || user?.createdBy?.logo}   // company logo url
//                 alt={user?.companyId?.name || user?.createdBy?.name}
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <span className="text-white font-semibold text-lg">
//                 {user?.companyId?.name?.charAt(0) || user?.createdBy?.name?.charAt(0) || "C"}
//               </span>
//             )}
//           </div>

//           <div>
//             <h1 className="font-bold text-sidebar-foreground text-lg">{user?.role === "admin" || user?.role === "employee" ? user?.companyId?.name || user?.createdBy?.name : "Super Admin (All Companies)"}</h1>
//             <p className="text-xs text-sidebar-muted">Management System</p>
//           </div>
//         </div>

//         {/* User Info */}
//         {user && (
//           <div className="p-4 border-b border-sidebar-border">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
//                 <span className="font-semibold text-sidebar-accent-foreground">
//                   {user.username?.charAt(0) || user.fullName?.charAt(0)}
//                 </span>
//               </div>
//               <div className="min-w-0">
//                 <p className="text-sm text-white font-medium truncate">
//                   {user.username || user.fullName}
//                 </p>
//                 <p className="text-xs text-sidebar-primary">
//                   {getRoleBadge(user.role)} <br />
//                   {user?.role === "employee" && user?.taskRole === "manager" && " (Department Manager)"}
//                 </p>

//               </div>
//             </div>
//           </div>
//         )}

//         {/* Navigation */}
//         <nav className="flex-1 overflow-y-auto py-4">
//           <ul className="space-y-1 px-3">
//             {filteredNavItems.map((item) => {
//               /** Tasks with Dropdown for Admin/Super Admin */
//               if (
//                 item.label === 'Tasks' &&
//                 user &&
//                 (user.role === 'admin' || user.role === 'employee')
//               ) {
//                 return (
//                   <li
//                     key={item.path}
//                     ref={taskItemRef}
//                     className="relative"
//                     onMouseEnter={handleMouseEnter}
//                     onMouseLeave={handleMouseLeave}
//                   >
//                     {/* Main Tasks Button */}
//                     <NavLink
//                       to="/tasks"
//                       className={cn(
//                         'sidebar-item',
//                         location.pathname.startsWith('/tasks') &&
//                         'sidebar-item-active'
//                       )}
//                     >
//                       <FolderKanban className="w-5 h-5" />
//                       <span>Tasks</span>
//                     </NavLink>

//                     {/* Dropdown */}
//                     {showTaskSubMenu && (
//                       <div
//                         className="
//                           fixed
//                           left-[256px]
//                           top-[var(--task-menu-top)]
//                           w-48
//                           rounded-md
//                           bg-sidebar
//                           shadow-xl
//                           border
//                           border-sidebar-border
//                           z-[60]
//                           transition-all duration-150 ease-out
//                         "
//                       >
//                         <ul className="py-2">
//                           {filteredTaskSubMenu?.map((sub) => (
//                             <li key={sub.path}>
//                               <NavLink
//                                 to={sub.path}
//                                 className={({ isActive }) => {
//                                   // Default active Dashboard only if location is /tasks exactly
//                                   let active = false;

//                                   if (location.pathname === '/tasks' && sub.label === 'Dashboard') {
//                                     active = true;
//                                   }

//                                   // Override default if real isActive (clicked item) is true
//                                   if (isActive) {
//                                     active = true;
//                                   }

//                                   // But if some other dropdown item is active, Dashboard default should not be active
//                                   if (sub.label === 'Dashboard' && location.pathname !== '/tasks') {
//                                     active = false;
//                                   }

//                                   return cn(
//                                     'block px-4 py-2 text-sm text-white hover:bg-sidebar-accent',
//                                     active ? 'bg-sidebar-accent font-medium' : ''
//                                   );
//                                 }}
//                               >
//                                 {sub.label}
//                               </NavLink>
//                             </li>
//                           ))}

//                         </ul>
//                       </div>
//                     )}
//                   </li>
//                 );
//               }

//               /** Jobs with Dropdown */
// if (
//   item.label === "Job-Portal" &&
//   user &&
//   (user.role === "admin" || user.role === "employee")
// ) {
//   return (
//     <li
//       key={item.path}
//       ref={jobItemRef}
//       className="relative"
//       onMouseEnter={handleJobMouseEnter}
//       onMouseLeave={handleJobMouseLeave}
//     >
//       {/* Main Jobs Button */}
//       <NavLink
//         to="/jobs"
//         className={cn(
//           "sidebar-item",
//           location.pathname.startsWith("/jobs") &&
//             "sidebar-item-active"
//         )}
//       >
//         <item.icon className="w-5 h-5" />
//         <span>Job-Portal</span>
//       </NavLink>

//       {/* Jobs Dropdown */}
//       {showJobSubMenu && (
//         <div
//           className="
//             fixed
//             left-[256px]
//             top-[var(--job-menu-top)]
//             w-48
//             rounded-md
//             bg-sidebar
//             shadow-xl
//             border
//             border-sidebar-border
//             z-[60]
//             transition-all duration-150 ease-out
//           "
//         >
//           <ul className="py-2">
//             {JobSubMenu?.map((sub) => (
//               <li key={sub.path}>
//                 <NavLink
//                   to={sub.path}
//                   className={({ isActive }) => {
//                     let active = false;

//                     if (
//                       location.pathname === "/jobs" &&
//                       sub.label === "Dashboard"
//                     ) {
//                       active = true;
//                     }

//                     if (isActive) {
//                       active = true;
//                     }

//                     if (
//                       sub.label === "Dashboard" &&
//                       location.pathname !== "/jobs"
//                     ) {
//                       active = false;
//                     }

//                     return cn(
//                       "block px-4 py-2 text-sm text-white hover:bg-sidebar-accent",
//                       active ? "bg-sidebar-accent font-medium" : ""
//                     );
//                   }}
//                 >
//                   {sub.label}
//                 </NavLink>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </li>
//   );
// }


//               /** Normal Sidebar Item */
//               const isActive = location.pathname === item.path;

//               return (
//                 <li key={item.path}>
//                   <NavLink
//                     to={item.path}
//                     className={cn(
//                       'sidebar-item',
//                       isActive && 'sidebar-item-active'
//                     )}
//                   >
//                     <item.icon className="w-5 h-5" />
//                     <span>{item.path === '/users' ? user?.role === 'super_admin' ? 'Admins' : 'Employees' : item.label}</span>

//                   </NavLink>
//                 </li>
//               );
//             })}
//           </ul>
//         </nav>

//         {/* Logout */}
//         <div className="p-4 border-t border-sidebar-border mt-auto">
//           <button
//             onClick={logout}
//             className="sidebar-item w-full text-destructive hover:bg-destructive/10"
//           >
//             <LogOut className="w-5 h-5" />
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>

//       {/* Overlay */}
//       <div
//         className="fixed inset-0 bg-black/50 z-40"
//         onClick={onToggle}
//       />
//     </>
//   );
// };

// export default Sidebar;









































import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FolderKanban, LogOut, Menu, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarProps, navItems, taskSubMenu, JobSubMenu } from "@/services/allFunctions";
import { useAuth } from '@/contexts/AuthContext';
import { createPortal } from 'react-dom';

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Default sidebar open
  const [isLocalOpen, setLocalOpen] = useState<boolean>(isOpen);

  // Submenus
  const [showTaskSubMenu, setShowTaskSubMenu] = useState(false);
  const [showJobSubMenu, setShowJobSubMenu] = useState(false);

  const [dropdownPos, setDropdownPos] = useState<{ top: number, left: number }>({ top: 0, left: 0 });
  const [jobDropdownPos, setJobDropdownPos] = useState<{ top: number, left: number }>({ top: 0, left: 0 });

  const handleTaskMouseEnter = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({ top: rect.top, left: rect.right }); // dropdown sidebar ke right me appear hoga
    setShowTaskSubMenu(true);
  };

  const handleTaskMouseLeave = () => {
    setShowTaskSubMenu(false);
  };


  // Li ke mouse events
  const handleJobMouseEnter = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setJobDropdownPos({ top: rect.top, left: rect.right }); // sidebar ke right me dropdown
    setShowJobSubMenu(true);
  };

  const handleJobMouseLeave = () => setShowJobSubMenu(false);


  // Toggle sidebar: call both local state and parent callback
  const toggleSidebar = () => {
    setLocalOpen(prev => !prev); // for internal animation
    onToggle();                  // call parent so main content adjusts width
  };
  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const effectiveRole = user?.role === "admin" ? "admin" :
    user?.role === "employee" && user?.taskRole === "manager" ? "manager" : "employee";

  const filteredTaskSubMenu = taskSubMenu.filter(sub => sub.roles.includes(effectiveRole));

  const getRoleBadge = (role: string) => {
    const roleLabels = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      employee: user?.taskRole==="manager"?`Department Manager(${user?.department})` : "Employee",
    };
    return roleLabels[role as keyof typeof roleLabels] || role;
  };

  useEffect(() => {
    if (!isOpen) {
      setShowTaskSubMenu(false);
      setShowJobSubMenu(false);
    }
  }, [isOpen]);

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed top-0 left-0 h-full z-50 flex flex-col bg-sidebar shadow-lg transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-16"
        )}
      >
        {/* Top Menu Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {isOpen && (
            <div className='flex items-center justify-between gap-2'>
              <img className='w-9 h-9 rounded'
                src={user?.companyId?.logo || user?.createdBy?.logo || "https://imgs.search.brave.com/fyjiYJDWqHKM10ialxrNUXefvIkntePcZxIe4bW0UkY/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93MC5w/ZWFrcHguY29tL3dh/bGxwYXBlci82MDAv/NzA3L0hELXdhbGxw/YXBlci1zLWctbmFh/bS1rZS1nb2xkLXMt/Zy1nb2xkLXNnLWxl/dHRlci1zZy5qcGc"} />
              <h1 className="font-bold text-lg text-sidebar-foreground truncate">
                {user?.companyId?.name || user?.createdBy?.name || 'Super Admin'}
              </h1>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-sidebar-accent/20"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className={cn("p-4 border-b border-sidebar-border transition-all", !isOpen && "justify-center flex items-center")}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="font-semibold text-sidebar-accent-foreground">
                  {user.username?.charAt(0) || user.fullName?.charAt(0)}
                </span>
              </div>
              {isOpen && (
                <div>
                  <p className="text-sm text-white font-medium truncate">{user.username || user.fullName}</p>
                  <p className="text-xs text-sidebar-primary">{getRoleBadge(user.role)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 relative">
          <ul className="space-y-1 px-2">
            {filteredNavItems.map(item => {
              const isActive = location.pathname === item.path;

              const renderItem = () => (
                <NavLink
                  to={item.path}
                  className={cn(
                    "sidebar-item flex items-center justify-between p-2",
                    isActive && "sidebar-item-active",
                    !isOpen && "justify-center"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {isOpen && <span>{item.label === "Employees"?user?.role === "super_admin" ? "Admins" : "Employees": item?.label}</span>}
                  </div>

                  {/* Arrow only for Tasks & Job-Portal */}
                  {isOpen && (item.label === "Tasks" || item.label === "Job-Portal") && (
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        item.label === "Tasks" && showTaskSubMenu && "rotate-90",
                        item.label === "Job-Portal" && showJobSubMenu && "rotate-90"
                      )}
                    />
                  )}
                </NavLink>
              );


              // Tasks Dropdown
              if (item.label === "Tasks") {
                return (
                  <li
                    key={item.path}

                    onMouseEnter={() => isOpen && setShowTaskSubMenu(true)}
                    onMouseLeave={() => setShowTaskSubMenu(false)}
                  >
                    {renderItem()}
                
                    {showTaskSubMenu && createPortal(
                      <div
                        style={{ top: dropdownPos.top, left: dropdownPos.left }}
                        className="fixed w-48 bg-sidebar shadow-lg border border-sidebar-border z-50 md:ml-56 md:mt-52"
                        onMouseEnter={() => setShowTaskSubMenu(true)}
                        onMouseLeave={handleTaskMouseLeave}
                      >
                        <ul>
                          {filteredTaskSubMenu.map(sub => (
                            <li key={sub.path}>
                              <NavLink
                                to={sub.path}
                                end={sub.path === "/tasks"} // only for dashboard
                                className={({ isActive }) => cn(
                                  "block px-4 py-2 text-sm text-white hover:bg-sidebar-accent",
                                  isActive && "bg-sidebar-accent font-medium"
                                )}
                              >
                                {sub.label}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </div>,
                      document.body
                    )}

                  </li>
                );
              }

              // Job Dropdown
              if (item.label === "Job-Portal") {
                return (
                  <li
                    key={item.path}
                    className="relative"
                    onMouseEnter={e => isOpen && handleJobMouseEnter(e)}
                    onMouseLeave={handleJobMouseLeave}
                  >
                    {renderItem()}

                    {isOpen && showJobSubMenu && createPortal(
                      <div
                        style={{ top: jobDropdownPos.top, left: jobDropdownPos.left }}
                        className="fixed w-48 bg-sidebar shadow-lg border border-sidebar-border z-50"
                        onMouseEnter={() => setShowJobSubMenu(true)}
                        onMouseLeave={handleJobMouseLeave}
                      >
                        <ul>
                          {JobSubMenu.map(sub => (
                            <li key={sub.path}>
                              <NavLink
                                to={sub.path}
                                className={({ isActive }) => cn(
                                  "block px-4 py-2 text-sm text-white hover:bg-sidebar-accent",
                                  isActive && "bg-sidebar-accent font-medium"
                                )}
                              >
                                {sub.label}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </div>,
                      document.body
                    )}
                  </li>
                );
              }

              return <li key={item.path}>{renderItem()}</li>;
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border mt-auto">
          <button
            onClick={logout}
            className={cn(
              "sidebar-item w-full flex items-center gap-3 text-destructive hover:bg-destructive/10",
              !isOpen && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

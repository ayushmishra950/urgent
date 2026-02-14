
import { LayoutDashboard, Users, Building2, FolderKanban, Clock, CalendarDays, Receipt, Wallet, Bell, BarChart3, Settings, LogOut, Briefcase } from 'lucide-react';

//   date ko frontend m normal show karne k liye
export function formatDate(isoDate, format = 'short', locale = 'en-US') {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  let options;
  switch (format) {
    case 'short':   // 31/01/2026
      options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      break;
    case 'medium':  // 31 Jan 2026
      options = { day: '2-digit', month: 'short', year: 'numeric' };
      break;
    case 'long':    // 31 January 2026
      options = { day: '2-digit', month: 'long', year: 'numeric' };
      break;
    default:
      options = { day: '2-digit', month: 'short', year: 'numeric' };
  }

  return date.toLocaleDateString(locale, options);
}

//  date ko date input m convert karne k liye taki input samajhkar ise input  m show kar sake
 export const formatDateFromInput = (date: string | Date | undefined) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};



 export const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  export const getPriorityColor = (priority:string)=>{
    switch (priority){
      case "low": return "bg-yellow-100 text-yellow-800";
      case "high" : return "bg-blue-100 text-blue-800";
      case "medium" : return "bg-green-100 text-green-800";
      case "urgent" : return "bg-red-100 text-red-800";
       default: return "bg-gray-100 text-gray-800";
    }
  }

  
 export const getStatusColorfromEmployee = (status: string) => {

    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-500';
      case 'RELIEVED': return 'bg-red-100 text-red-800 border-red-500';
      case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      default: return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

 export const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'Salary Change': return 'bg-purple-100 text-purple-800';
      case 'Profile Update': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

// utils/tasks.ts
export const getOverdueTasks = (projects: any[], role: string) => {
  const today = new Date();
  let overdueTasks: any[] = [];

  if (role === "admin") {
    // Admin: go through all projects and their tasks
    projects?.forEach(project => {
      project?.tasks?.forEach(task => {
        const taskEndDate = new Date(task.endDate);
        if (
          (task.status === "pending" || task.status === "active") &&
          taskEndDate < today
        ) {
          overdueTasks.push(task);
        }
      });
    });
  } else {
    // Manager / Employee: only check their own tasks
    projects?.forEach(task => {
      const taskEndDate = new Date(task.endDate);
      if (
        (task.status === "pending" || task.status === "active") &&
        taskEndDate < today
      ) {
        overdueTasks.push(task);
      }
    });
  }

  return overdueTasks;
};

export const getTaskCountByStatus = (
  projects: any[] = [],
  status?: string,
role: "admin" | "employee" = "employee"
) => {
  if (role === "admin") {
    // Admin: iterate through projects
    return projects.reduce((total, project) => {
      if (!Array.isArray(project.tasks)) return total;

      if (!status) {
        return total + project.tasks.length;
      }

      const filteredTasks = project.tasks.filter(task => task.status === status);
      return total + filteredTasks.length;
    }, 0);
  } else {
    // Manager / Employee: iterate through own tasks
    if (!Array.isArray(projects)) return 0;

    if (!status) {
      return projects.length;
    }

    const filteredTasks = projects.filter(task => task.status === status);
    return filteredTasks.length;
  }
};


export const months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];



export interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}
export interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  roles: ('super_admin' | 'admin' | 'employee')[];
}

export const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['super_admin', 'admin', 'employee'] },
  { icon: Building2, label: 'Companies', path: '/companies', roles: ['super_admin'] },
  { icon: FolderKanban, label: 'Tasks', path: '/tasks', roles: ['admin', 'employee'] },
  { icon: Clock, label: 'Attendance', path: '/attendance', roles: ['admin', 'employee'] },
  { icon: CalendarDays, label: 'Leave', path: '/leave', roles: ['admin', 'employee'] },
   { icon: Briefcase, label: 'Departments', path: '/departments', roles: ['admin'] },
  { icon: Users, label: 'Employees', path: '/users', roles: ['super_admin', 'admin'] },
  { icon: Receipt, label: 'Expenses', path: '/expenses', roles: ['admin'] },
  { icon: Wallet, label: 'Payroll', path: '/payroll', roles: ['admin', 'employee'] },
  // { icon: Bell, label: 'Notifications', path: '/notifications', roles: ['super_admin', 'admin', 'employee'] },
  { icon: Bell, label: 'Job-Portal', path: '/jobs', roles: ['super_admin', 'admin'] },
  { icon: BarChart3, label: 'Reports', path: '/reports', roles: ['admin'] },
  { icon: Settings, label: 'Settings', path: '/settings', roles: ['super_admin', 'admin', 'employee'] },
];

/** Task Submenu (Admin/Super Admin Only) */
 export const taskSubMenu = [
  { label: 'Dashboard', path: '/tasks', roles: ["admin", "manager", "employee"] },
  { label: 'Projects', path: '/tasks/projects', roles: ["admin"] },
  { label: 'Tasks', path: '/tasks/task', roles: ["admin", "manager", "employee"] },
  { label: 'Sub Tasks', path: '/tasks/sub-task', roles: ["admin", "manager"] },
  { label: 'Overdue Tasks', path: '/tasks/overdue', roles: ["admin", "manager", "employee"] },
  { label: "Task Manager", path: "/tasks/manager", roles: ["admin"] }
];


export const JobSubMenu = [
  { label: 'Dashboard', path: '/jobs', roles: ["admin", "manager", "employee"] },
  { label: 'Candidates', path: '/jobs/candidates', roles: ["admin"] },
  { label: 'Applications', path: '/jobs/application', roles: ["admin"] },
  { label: 'Companys', path: '/jobs/companys', roles: ["admin", "manager", "employee"] },
  { label: 'Jobs', path: '/jobs/jobs', roles: ["admin", "manager"] },
  { label: 'Revenue', path: '/jobs/revenues', roles: ["admin", "manager", "employee"] },
  { label: "Setting", path: "/jobs/setting", roles: ["admin"] }
];





  export const getStatusStyle = (status: string) => {
    switch (status) {
      case "Present": return { bg: "bg-green-100 text-green-800", text: "Present" };
      case "Absent": return { bg: "bg-red-100 text-red-800", text: "Absent" };
      case "Half Day": return { bg: "bg-yellow-100 text-yellow-800", text: "Half Day" };
      case "Late": return { bg: "bg-orange-100 text-orange-800", text: "Late" };
      case "No Data": return { bg: "bg-blue-50 text-blue-400", text: "-" };
      default: return { bg: "bg-gray-100 text-gray-500", text: "-" };
    }
  };

  export const getMonthlySummary = (userId: string, attendanceMap) => {
    const userData = attendanceMap[userId];
    const summary = { present: 0, absent: 0, halfDay: 0, late: 0 };
    if (!userData) return summary;

    Object.values(userData.attendanceByDate).forEach((att: any) => {
      switch (att.status) {
        case "Present": summary.present++; break;
        case "Absent": summary.absent++; break;
        case "Half Day": summary.halfDay++; break;
        case "Late": summary.late++; break;
      }
    });

    return summary;
  };
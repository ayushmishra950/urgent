export type UserRole = 'super_admin' | 'admin' | 'employee';

interface CompanyDetail {
  _id: string;
  name: string;
  logo:string;
}
export interface User {
  _id: string;
  username : string;
  fullName : string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: UserRole;
  joiningDate: string;
  avatar?: string;
  companyId?: CompanyDetail;
  createdBy?:CompanyDetail;
  taskRole?: string;
  taskRoleStatus?: string;
  taskRoleDescription?: string;
}

export interface Company {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  createdAt: string;
}


export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  deadline: string;
  assignedTo: string;
  assignedBy: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  totalHours?: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  type: 'sick' | 'casual' | 'annual' | 'emergency';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  reviewedBy?: string;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedBy?: string;
}

export interface SalarySlip {
  id: string;
  userId: string;
  month: string;
  year: number;
  basic: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  generatedAt: string;
}



export interface SubTask {
  id: number;
  title: string;
  name: string;
  description: string;
  parentTask: string;
  startDate: string;
  endDate: string;
  assignedTo: string;
  priority: "Low" | "Medium" | "High";
  status: Status;
  notes: string;
}

export type Status = "Pending" | "In-Progress" | "Completed" | "Blocked"  | "Overdue";

export type ModalType = "view" | "edit" | "statusChange" | null;


export interface SubTaskFormData {
  _id?: string;
  taskId?: string;
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  employee?: string;
  priority?: Priority;
  remarks?: string;
}

export interface SubTaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  setSubTaskListRefresh: (value: boolean) => void;
  taskId:string;
}

interface createdBy{
  _id:string;
  username:string;
  fullName: string;
}

// types/notification.d.ts
export interface Notification {
  _id: string;
  userId: string;
  message: string;
  type: string;
  referenceId?: string | null;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy:createdBy
}




export interface AttendanceItem {
  _id: string;
  clockIn: string;
  clockOut: string;
  date: string;
  hoursWorked: number;
  status: string;
  userId: {
    _id: string;
    fullName: string;
    profileImage: string;
  };
}

export interface Props {
  attendanceRefresh: number; // trigger refresh from parent
}
export const months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];






export interface TaskFormData {
  _id?: string;
  projectId?: string;
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  manager?: string;
  priority?: Priority;
  status?: Status;
  remarks?: string;
}

export interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  setTaskListRefresh: (value: boolean) => void;
  projectId:string;
}


export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface ProjectFormData {
  _id?: string;
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  priority?: Priority;
  remarks?: string;
  status?: string;
}

export interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ProjectFormData | null;
  setProjectListRefresh: (value: boolean) => void;
}






export interface EmployeeFormDialogProps {
  open: boolean;
  onClose: () => void;
  isEditMode?: boolean;
  initialData: any;
  setEmployeeListRefresh: (refresh: boolean) => void;
  selectedDepartmentName:string;
}


export interface Department {
  id: string;
  name: string;
  description: string;
  managerId?: string;
  companyId: string;
  employeeCount: number;
}

 export interface EmployeeDepartment {
  _id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}
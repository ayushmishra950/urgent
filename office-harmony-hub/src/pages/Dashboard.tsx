import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StatCard from '@/components/dashboard/StatCard';
import {
  Users,
  Building2,
  FolderKanban,
  Clock,
  CalendarDays,
  Receipt,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Timer,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {getDashboardPage} from "@/services/Service";
import { useToast } from '@/hooks/use-toast';
import {formatDate} from "@/services/allFunctions";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const {toast} = useToast();
  const[dashboardData, setDashboardData] = useState(null);

  const getRoleTitle = () => {
    switch (user?.role) {
      case 'super_admin':
        return 'Super Admin Dashboard';
      case 'admin':
        return 'Admin Dashboard';
      case 'employee':
        return 'Employee Dashboard';
      default:
        return 'Dashboard';
    }
  };

  const recentTasks = [
    { id: 1, title: 'Complete project proposal', status: 'in_progress', priority: 'high', deadline: '2024-01-20' },
    { id: 2, title: 'Review team performance', status: 'pending', priority: 'medium', deadline: '2024-01-22' },
    { id: 3, title: 'Update documentation', status: 'completed', priority: 'low', deadline: '2024-01-18' },
    { id: 4, title: 'Client meeting preparation', status: 'pending', priority: 'urgent', deadline: '2024-01-19' },
  ];

  const recentActivities = [
    { id: 1, action: 'Task completed', user: 'Sarah Admin', time: '2 hours ago' },
    { id: 2, action: 'Leave approved', user: 'John Super Admin', time: '4 hours ago' },
    { id: 3, action: 'Expense submitted', user: 'Mike Employee', time: '5 hours ago' },
    { id: 4, action: 'New employee added', user: 'Sarah Admin', time: '1 day ago' },
  ];

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      low: 'badge-info',
      medium: 'badge-warning',
      high: 'badge-destructive',
      urgent: 'bg-destructive text-destructive-foreground',
    };
    return <span className={`${styles[priority]} px-2 py-1 rounded-full text-xs font-medium`}>{priority}</span>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'in_progress':
        return <Timer className="w-4 h-4 text-warning" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const handleGetDashboard = async()=>{
    if(user && user?.role !== "super_admin"){
    if(!user?._id || (!user?.companyId?._id && !user?.createdBy?._id)) return toast({title:"Error", description:"required field Missing.", variant:"destructive"});
    }
    try{
       const res = await getDashboardPage(user?._id, user?.companyId?._id || user?.createdBy?._id);
       console.log(res);
       if(res.status===200){
        setDashboardData(res?.data?.summary)
       }
    }
    catch(err){
      console.log(err);
     toast({title:"Error", description:err?.response?.data?.message || err?.message, variant:"destructive"})
    }
  };

  useEffect(()=>{
    handleGetDashboard()
  },[])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-header">{getRoleTitle()}</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {user?.role === 'super_admin' && (
          <>
            <StatCard
              title="Total Companies"
              value={dashboardData?.totalCompanies}
              change={`+${dashboardData?.newCompaniesThisMonth} this month`}
              changeType="positive"
              icon={Building2}
            />
            <StatCard
              title="Total Admins"
              value={dashboardData?.totalAdmins}
              change={`+${dashboardData?.newAdminsThisMonth} this month`}
              changeType="positive"
              icon={Users}
            />
             <StatCard
              title="Total Employees"
              value={dashboardData?.totalEmployees}
              change={`+${dashboardData?.newEmployeesThisMonth} this month`}
              changeType="positive"
              icon={Users}
            />
          </>
        )}
        
        {(user?.role === 'admin') && (
          <>
            <StatCard
              title="Total Employees"
              value={dashboardData?.totalEmployees}
              change={`+${dashboardData?.employeeGrowth} this month`}
              changeType="positive"
              icon={Users}
            />
            <StatCard
              title="Pending Tasks"
              value={dashboardData?.pendingTask}
              change={`${dashboardData?.urgentTask} urgent`}
              changeType="negative"
              icon={FolderKanban}
            />
        <StatCard
          title="Today's Attendance"
          value={`${dashboardData?.attendancePercentage}%`}
          change={`${dashboardData?.todayPresentCount}/${dashboardData?.totalEmployees} present`}
          changeType="neutral"
          icon={Clock}
        />
        
        <StatCard
          title="Pending Leaves"
          value={dashboardData?.pendingLeave}
          change={`${dashboardData?.newLeavesThisMonth} new requests`}
          changeType="neutral"
          icon={CalendarDays}
        />
       
          <StatCard
            title="Expenses"
            value={`₹${dashboardData?.expenseThisMonth}`}
            // change="12 requests"
            changeType="neutral"
            icon={Receipt}
          />
        </>
        )}


          {(user?.role === 'employee') && (
          <>
           
         <StatCard
              title="Pending Tasks"
              value={dashboardData?.pendingTask}
              change={`${dashboardData?.urgentTask} urgent`}
              changeType="negative"
              icon={FolderKanban}
            />
        
        <StatCard
          title="Pending Leaves"
          value={dashboardData?.pendingLeave}
          change={`${dashboardData?.leavesThisMonth} new requests`}
          changeType="neutral"
          icon={CalendarDays}
        />
       
        </>
        )}

       
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-primary" />
              Recent {user?.role==="super_admin"?"Projects":"Tasks"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.recentTasks?.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <p className="font-medium text-sm">{task.name}</p>
                      <p className="text-xs text-muted-foreground">Due: {formatDate(task.endDate)}</p>
                    </div>
                  </div>
                  {getPriorityBadge(task.priority)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {
                dashboardData?.recentActivity.length ===0?
                <>
              <div className="flex items-center mt-6 justify-center h-full text-center text-muted-foreground">
  No Recent Activity.
</div>

                </>
                :
              dashboardData?.recentActivity?.map((activity) => (
                <div
                  key={activity?._id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      by {activity?.createdBy?.username || activity?.createdBy?.fullName} • {formatDate(activity?.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Employee */}
      {user?.role === 'employee' && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors">
                <Clock className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium">Clock In</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-success/10 hover:bg-success/20 transition-colors">
                <CalendarDays className="w-8 h-8 text-success" />
                <span className="text-sm font-medium">Apply Leave</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-warning/10 hover:bg-warning/20 transition-colors">
                <Receipt className="w-8 h-8 text-warning" />
                <span className="text-sm font-medium">Submit Expense</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-info/10 hover:bg-info/20 transition-colors">
                <FolderKanban className="w-8 h-8 text-info" />
                <span className="text-sm font-medium">View Tasks</span>
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;

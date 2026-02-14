import React, { useEffect, useState } from 'react';
import { BarChart3, Users, Clock, Receipt, Wallet, TrendingUp,ArrowLeft, Download, Calendar} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell} from 'recharts';
import {getAnalyticsReportPage} from "@/services/Service";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from "react-helmet-async";


const Reports: React.FC = () => {
  const {user} = useAuth();
  const {toast} = useToast();
  const[analyticsData,setAnalyticsData] = useState(null);

  const handleGetReport = async()=>{
    try{  console.log(user?._id, user?.companyId)
        if(!user?._id || !user?.companyId?._id) return toast({title:"Error", description:"userId or companyId is missing.", variant:"destructive"});

        const res = await getAnalyticsReportPage(user?._id , user?.companyId?._id);
        console.log(res)
        if(res.status === 200){
          setAnalyticsData(res?.data?.summary)
        }
    }
     catch(err){
      console.log(err);
      toast({title:"Error", description:err?.response?.data?.message || err?.message, variant:"destructive"})
     }
  };
  useEffect(()=>{
    handleGetReport()
  }, [])

const attendanceData = analyticsData?.attendanceLast7Days?.map(day => ({
  name: day.day,       // Mon, Tue, etc.
  present: day.present,
  absent: day.absent,
}));


const expenseData = analyticsData?.expenseGrouped?.map((expense)=>({
   name: new Date(expense?._id?.year, expense?._id?.month - 1).toLocaleString("en-US", {
  month: "short"   // "Jan", "Feb", etc
}),
   amount: expense?.totalExpense
}))


const taskDistribution = [
  { name: 'Completed', value: analyticsData?.taskSummary?.completed ?? 0, color: 'hsl(142, 76%, 36%)' },
  { name: 'In Progress', value: analyticsData?.taskSummary?.active?? 0, color: 'hsl(38, 92%, 50%)' },
  { name: 'Pending', value: analyticsData?.taskSummary?.pending ?? 0, color: 'hsl(215, 16%, 47%)' },
];

const departmentPerformance = analyticsData?.departmentAnalytics?.map((v)=>{
  return (
    {name:v?.departmentName, tasks: v?.completedTaskPercentage, attendance: v?.attendancePercentage}
  )
})

  return (
    <>
    <Helmet>
        <title>Report Page</title>
        <meta name="description" content="This is the home page of our app" />
      </Helmet>
      <div className="md:mt-[-20px] md:mb-[5px]">
        <button
          onClick={() => window.history.back()}
          className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-gray-800 dark:text-white" />
        </button>
      </div>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-primary" />
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">Comprehensive insights into your organization's performance</p>
        </div>

        <div className="flex gap-3">
          {/* <Select defaultValue="this-month">
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select> */}
          {/* <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button> */}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-xl font-bold">{analyticsData?.totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Clock className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Attendance</p>
                <p className="text-xl font-bold">{analyticsData?.attendancePercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Receipt className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-xl font-bold">₹{analyticsData?.expenseThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Wallet className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Payroll</p>
                <p className="text-xl font-bold">₹{analyticsData?.payrollThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Weekly Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="present" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Expense Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={expenseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {taskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {taskDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Task Completion %" />
                  <Bar dataKey="attendance" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} name="Attendance %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

export default Reports;

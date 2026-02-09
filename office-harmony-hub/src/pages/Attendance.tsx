
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AttendanceTable from "@/components/cards/AttendanceCard";
import { useToast } from "@/hooks/use-toast";
import { getEmployees, submitClockIn, submitClockOut } from "@/services/Service";
import axios from "axios";
const months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];
 const today = new Date();
const getTodayDate = () => today.toISOString().split("T")[0];


const Attendance: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [employeeList, setEmployeeList] = useState<any[]>([]);
  const [attendanceRefresh, setAttendanceRefresh] = useState(0);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  // =================== Fetch Employees ===================
  const handleGetEmployees = async () => {
    try {
      const data = await getEmployees(user?._id);
      if (Array.isArray(data)) setEmployeeList(data);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  // =================== Fetch Attendance ===================
  const handleGetAttendances = async (date: string) => {
    const selected = new Date(date);

      const month = selected.getMonth() + 1; // JS months = 0–11
      const year = selected.getFullYear();
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance`,
        {params : {month, year, companyId : user?.role === "employee" ? user?.createdBy?._id : user?.companyId?._id}});
      if (Array.isArray(res?.data?.records)) setAttendanceList(res?.data?.records);
    } catch (err: any) {
      // toast({
      //   title: "Error",
      //   description: err?.response?.data?.message || "Something went wrong",
      //   variant: "destructive",
      // });
    }
  };

  useEffect(() => {
    handleGetEmployees();
    handleGetAttendances(selectedDate);
  }, []);

  // =================== Clock In/Out ===================
  const handleClockIn = async () => {
    try {
      const res = await submitClockIn(user?._id, user?.createdBy?._id);
      if (res.status === 200) {
        toast({ title: "Success", description: "You have successfully clocked in." });
       setAttendanceRefresh(prev => prev + 1);
       handleGetAttendances(selectedDate);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.error || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleClockOut = async () => {
    try {
      const res = await submitClockOut(user?._id, user?.createdBy?._id);
      if (res.status === 200) {
        toast({ title: "Success", description: "You have successfully clocked out." });
        setAttendanceRefresh(prev => prev + 1);
        handleGetAttendances(selectedDate);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.error || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  // =================== Today's Attendance ===================
  const todayStr = new Date().toISOString().split("T")[0];
  const todayAttendance = attendanceList.find((att) => {
    const attDate = new Date(att.date).toISOString().split("T")[0];
    return attDate === todayStr && att.userId?._id === user?._id;
  });

  const attendanceUIState = useMemo(() => {
    if (!todayAttendance) return "NO_RECORD";

    switch (todayAttendance.status) {
      case "Clocked In":
        return "WORKING";
      case "Present":
      case "Half Day":
      case "Late":
        return "DAY_COMPLETED";
      case "Absent":
        return "DAY_MISSED";
      default:
        return "NO_RECORD";
    }
  }, [todayAttendance]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Clock className="w-8 h-8 text-primary" />
          Attendance
        </h1>
        <p className="text-muted-foreground mt-1">
          {user?.role === "admin"
            ? "Overview of all employees' attendance"
            : "Your daily attendance record"}
        </p>
      </div>

      {/* Clock In/Out Card */}
      {user?.role === "employee" && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                {attendanceUIState === "WORKING" ? "Currently Working" : "Today's Attendance"}
              </h2>
              <p className="text-muted-foreground">
                {attendanceUIState === "WORKING" && `Clocked in at ${todayAttendance?.clockIn}`}
                {attendanceUIState === "DAY_COMPLETED" && `Status: ${todayAttendance?.status}`}
                {attendanceUIState === "DAY_MISSED" && "You were marked absent today"}
                {attendanceUIState === "NO_RECORD" &&
                  new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </p>
            </div>

            {/* Buttons */}
            {attendanceUIState === "NO_RECORD" && (
              <Button onClick={handleClockIn} size="lg" className="gap-2">
                <LogIn className="w-5 h-5" /> Clock In
              </Button>
            )}
            {attendanceUIState === "WORKING" && (
              <Button variant="destructive" onClick={handleClockOut} size="lg" className="gap-2">
                <LogOut className="w-5 h-5" /> Clock Out
              </Button>
            )}
            {attendanceUIState === "DAY_COMPLETED" && (
              <Button variant="secondary" size="lg" disabled className="gap-2">
                Day Completed
              </Button>
            )}
            {attendanceUIState === "DAY_MISSED" && (
              <Button variant="outline" size="lg" disabled className="gap-2">
                Absent
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Attendance Table */}
      <AttendanceTable attendanceRefresh={attendanceRefresh} />
    </div>
  );
};

export default Attendance;

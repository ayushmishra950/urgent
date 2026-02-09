

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AttendanceItem {
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

interface Props {
  attendanceRefresh: number; // trigger refresh from parent
}
const months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];

const AttendanceTable: React.FC<Props> = ({ attendanceRefresh }) => {
  const [attendanceList, setAttendanceList] = useState<AttendanceItem[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const daysInMonth = 31;

  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();
  const isCurrentMonth = todayMonth === new Date().getMonth() && todayYear === new Date().getFullYear();

  const getTodayDate = () => today.toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  // ================= Fetch Attendance =================
  const fetchAttendances = async (date: string) => {
    try {
      const selected = new Date(date);

      const month = selected.getMonth() + 1; // JS months = 0–11
      const year = selected.getFullYear();

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/attendance`,
      {params : {month, year, companyId : user?.role === "employee" ? user?.createdBy?._id : user?.companyId?._id}});
      

      if (Array.isArray(res?.data?.records)) {
        setAttendanceList(res.data.records);
      }
    } catch (err: any) {
      console.log(err);
      toast({
        title: "Error",
        description:
          err?.response?.data?.error || "Something went wrong",
      });
    }
  };

  useEffect(() => {
    fetchAttendances(selectedDate);
  }, [attendanceRefresh]);


  // ================= Process Attendance =================
  const attendanceMap = useMemo(() => {
    const map: Record<string, { name: string; profilePic: string; attendanceByDate: Record<number, any> }> = {};

    // Filter: employee sees only own data
    const filteredList =
      user?.role === "employee"
        ? attendanceList.filter(att => att.userId._id === user?._id)
        : attendanceList;

    filteredList.forEach((item) => {
      const userId = item.userId._id;
      const day = new Date(item.date).getDate();

      if (!map[userId]) {
        map[userId] = {
          name: item.userId.fullName,
          profilePic: item.userId.profileImage,
          attendanceByDate: {},
        };
      }

      map[userId].attendanceByDate[day] = {
        status: item.status,
        clockIn: item.clockIn,
        clockOut: item.clockOut,
        hours: item.hoursWorked,
      };
    });

    return map;
  }, [attendanceList, user]);

  const users = useMemo(
    () => Object.keys(attendanceMap).map(id => ({ _id: id, ...attendanceMap[id] })),
    [attendanceMap]
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Present": return { bg: "bg-green-100 text-green-800", text: "Present" };
      case "Absent": return { bg: "bg-red-100 text-red-800", text: "Absent" };
      case "Half Day": return { bg: "bg-yellow-100 text-yellow-800", text: "Half Day" };
      case "Late": return { bg: "bg-orange-100 text-orange-800", text: "Late" };
      case "No Data": return { bg: "bg-blue-50 text-blue-400", text: "-" };
      default: return { bg: "bg-gray-100 text-gray-500", text: "-" };
    }
  };

  const getMonthlySummary = (userId: string) => {
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

  // ================= Render =================
  return (
    <Card className="overflow-hidden shadow-sm relative">
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            {months[today.getMonth()]} {todayYear} Attendance
          </div>
          <div className="flex items-center gap-3">
            <input type="month" value={selectedDate} onChange={(e) => {
              const date = e.target.value;
              setSelectedDate(date);
              fetchAttendances(date);
            }} className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 relative" style={{ minHeight: "450px" }}>
        <div className="absolute inset-0 overflow-x-auto overflow-y-auto">
          <table className="table-auto border-separate border-spacing-0 min-w-max">
            <thead className="sticky top-0 z-20 bg-muted/80 backdrop-blur-sm">
              <tr>
                <th className="sticky left-0 z-30 bg-muted/80 border-r px-5 py-4 text-left font-semibold min-w-[240px]">
                  Employee
                </th>
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const isToday = isCurrentMonth && day === todayDate;
                  return (
                    <th key={day} className={cn("text-center px-4 py-4 font-medium min-w-[100px] border-b", isToday && "bg-primary text-white")}>
                      {day}
                      {isToday && <div className="text-[10px] font-semibold">Today</div>}
                    </th>
                  );
                })}
                <th className="text-center px-4 py-4 font-medium min-w-[120px] border-l border-b bg-muted/80">Summary</th>
              </tr>
            </thead>

            <tbody>
              {users.map((emp) => {
                const summary = getMonthlySummary(emp._id);
                return (
                  <tr key={emp._id} className="hover:bg-muted/30">
                    <td className="sticky left-0 z-10 bg-white border-r px-5 py-4 font-medium min-w-[240px] shadow-md">
                      <div className="flex items-center gap-3">
                        <img src={emp.profilePic} alt={emp.name} className="w-9 h-9 rounded-full object-cover border" />
                        <span className="text-sm">{emp.name}</span>
                      </div>
                    </td>

                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      const isToday = isCurrentMonth && day === todayDate;
                      const data = emp.attendanceByDate[day] || { status: "No Data", clockIn: "-", clockOut: "-", hours: 0 };
                      const { bg, text } = getStatusStyle(data.status);

                      return (
                        <td key={`${emp._id}-${day}`} className={cn("text-center px-3 py-4 border-b text-xs min-w-[100px]", bg, isToday && "ring-2 ring-primary ring-inset")}>
                          <div className="font-semibold mb-1">{text}</div>
                          <div className="text-[10px] opacity-80">{data.clockIn} - {data.clockOut}</div>
                          <div className="text-[10px] font-medium">{data.hours > 0 ? `${data.hours.toFixed(1)}h` : "-"}</div>
                        </td>
                      );
                    })}

                    <td className="text-center px-3 py-4 border-b border-l text-xs min-w-[120px] bg-gray-50">
                      <div className="font-semibold text-green-700">P: {summary.present}</div>
                      <div className="font-semibold text-red-700">A: {summary.absent}</div>
                      {summary.halfDay > 0 && <div className="font-semibold text-yellow-700">H: {summary.halfDay}</div>}
                      {summary.late > 0 && <div className="font-semibold text-orange-700">L: {summary.late}</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceTable;

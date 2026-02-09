// import React from 'react';
// import {
//   Bell,
//   FolderKanban,
//   CalendarDays,
//   Receipt,
//   CheckCircle2,
//   Clock,
//   AlertCircle,
// } from 'lucide-react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { cn } from '@/lib/utils';
// import { Notification } from '@/types';

// const mockNotifications = [
//   { id: '1', userId: '3', title: 'New Task Assigned', message: 'You have been assigned a new high priority task: Complete project documentation', type: 'task', read: false, createdAt: '2024-01-15 10:30 AM' },
//   { id: '2', userId: '3', title: 'Leave Request Approved', message: 'Your leave request for January 25-28 has been approved by Sarah Admin', type: 'leave', read: false, createdAt: '2024-01-15 09:15 AM' },
//   { id: '3', userId: '3', title: 'Expense Claim Processed', message: 'Your expense claim of $150 for travel has been approved', type: 'expense', read: true, createdAt: '2024-01-14 04:45 PM' },
//   { id: '4', userId: '3', title: 'Task Deadline Reminder', message: 'Task "Fix login bug" is due tomorrow. Please ensure timely completion.', type: 'task', read: true, createdAt: '2024-01-14 02:00 PM' },
//   { id: '5', userId: '3', title: 'Salary Slip Available', message: 'Your salary slip for January 2024 is now available for download', type: 'general', read: true, createdAt: '2024-01-14 10:00 AM' },
//   { id: '6', userId: '3', title: 'New Policy Update', message: 'Please review the updated remote work policy effective from February 1, 2024', type: 'general', read: true, createdAt: '2024-01-13 03:30 PM' },
// ];

// const Notifications: React.FC = () => {
//   const getTypeIcon = (type: string) => {
//     switch (type) {
//       case 'task':
//         return <FolderKanban className="w-5 h-5 text-primary" />;
//       case 'leave':
//         return <CalendarDays className="w-5 h-5 text-success" />;
//       case 'expense':
//         return <Receipt className="w-5 h-5 text-warning" />;
//       default:
//         return <Bell className="w-5 h-5 text-info" />;
//     }
//   };

//   const unreadCount = mockNotifications.filter((n) => !n.read).length;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="page-header flex items-center gap-2">
//             <Bell className="w-7 h-7 text-primary" />
//             Notifications
//             {unreadCount > 0 && (
//               <span className="px-2 py-0.5 text-sm bg-destructive text-destructive-foreground rounded-full">
//                 {unreadCount}
//               </span>
//             )}
//           </h1>
//           <p className="text-muted-foreground">Stay updated with your latest alerts and messages</p>
//         </div>

//         <Button variant="outline">Mark All as Read</Button>
//       </div>

//       {/* Notifications List */}
//       <Card>
//         <CardHeader>
//           <CardTitle>All Notifications</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-1">
//             {mockNotifications.map((notification) => (
//               <div
//                 key={notification.id}
//                 className={cn(
//                   "flex gap-4 p-4 rounded-lg transition-colors cursor-pointer",
//                   !notification.read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted"
//                 )}
//               >
//                 <div className="p-2 rounded-lg bg-card border self-start">
//                   {getTypeIcon(notification.type)}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-start justify-between gap-4">
//                     <div>
//                       <h3 className={cn("font-medium", !notification.read && "text-primary")}>
//                         {notification.title}
//                       </h3>
//                       <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
//                     </div>
//                     {!notification.read && (
//                       <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
//                     )}
//                   </div>
//                   <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
//                     <Clock className="w-3 h-3" />
//                     {notification.createdAt}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       {mockNotifications.length === 0 && (
//         <div className="text-center py-12">
//           <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
//           <p className="text-muted-foreground">No notifications yet.</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Notifications;

























import React, { useState } from "react";
import {
  Bell,
  FolderKanban,
  CalendarDays,
  Receipt,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {getNotificationData} from "@/services/Service";

const Notifications: React.FC = () => {
 const { user } = useAuth();
  const { toast } = useToast();
    const { notifications, markAsRead, deleteNotification } = useNotifications();
  const[notificationList, setNotificationList] = useState([])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "task":
        return <FolderKanban className="w-5 h-5 text-primary" />;
      case "leave":
        return <CalendarDays className="w-5 h-5 text-success" />;
      case "expense":
        return <Receipt className="w-5 h-5 text-warning" />;
      default:
        return <Bell className="w-5 h-5 text-info" />;
    }
  };

  const handleGetNotificationData = async()=>{
      try{
           if(!user?._id || (!user?.companyId?._id && !user?.createdBy?._id)) return toast({title:"Error", description:"required field Missing.", variant:"destructive"});
           const res = await getNotificationData(user?._id, user?.companyId?._id || user?.createdBy?._id);
           console.log(res);
           if(res.status===200){
            setNotificationList(res.data)
           }
      }
      catch(error){
         console.error(error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Something went wrong",
      });
      }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <Bell className="w-7 h-7 text-primary" />
            Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-sm bg-destructive text-destructive-foreground rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">
            Stay updated with your latest alerts and messages
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() =>
            notifications.forEach((n) => {
              if (!n.read) markAsRead(n._id);
            })
          }
        >
          Mark All as Read
        </Button>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {notifications.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No notifications yet.</p>
              </div>
            )}

            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={cn(
                  "flex gap-4 p-4 rounded-lg transition-colors cursor-pointer",
                  !notification.read
                    ? "bg-primary/5 hover:bg-primary/10"
                    : "hover:bg-muted"
                )}
              >
                <div className="p-2 rounded-lg bg-card border self-start">
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div onClick={() => markAsRead(notification._id)}>
                      <h3
                        className={cn(
                          "font-medium",
                          !notification.read && "text-primary"
                        )}
                      >
                        {/* Show message with createdBy full name */}
                        {notification?.createdBy
                          ? `${notification?.createdBy.fullName || notification?.createdBy.username} : ${notification.message}`
                          : notification.message}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {/* Optional extra info can go here */}
                      </p>
                    </div>

                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification._id)}
                    >
                      Delete
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;

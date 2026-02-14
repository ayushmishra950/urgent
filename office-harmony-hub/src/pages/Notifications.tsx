
import React, { useEffect, useState } from "react";
import { Bell, FolderKanban, CalendarDays, Receipt, Clock, ArrowLeft} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {getNotificationData, deleteNotifications, deleteAllNotifications} from "@/services/Service";
import DeleteCard from "@/components/cards/DeleteCard";
import { Trash } from "lucide-react";
import { Helmet } from "react-helmet-async";

const Notifications: React.FC = () => {
 const { user } = useAuth();
  const { toast } = useToast();
    const { notifications, markAsRead, deleteNotification } = useNotifications();
  const[notificationList, setNotificationList] = useState([]);
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);

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

  useEffect(()=>{
    if(notifications){
      setNotificationList(prev => [notifications, ...prev]);
    }
  },[notifications]);

 const handleConfirmDelete = async () => {
  setIsDeleting(true);
  try {
    const companyId = user?.companyId?._id ?? user?.createdBy?._id;
   if(user && user?.role!=="super_admin")
   {
 if (!user?._id) {
      throw new Error("User not found");
    }

    if (!companyId) {
      throw new Error("Company not found");
    }
   }
   

    let res;

    if (!selectedNotificationId) {
      // delete all notifications
      res = await deleteAllNotifications(user._id, companyId);
    } else {
      // delete single notification
      res = await deleteNotifications(
        selectedNotificationId,
        user._id,
        companyId
      );
    }

    if (res?.status === 200) {
      handleGetNotificationData();
      toast({
        title: "Notification Deleted",
        description: res?.data?.message,
      });
    }
  } catch (error) {
    console.error(error);
    toast({
      title: "Error",
      description:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong",
        variant:"destructive"
    });
  } finally {
    setIsDeleting(false);
    setIsDeleteDialogOpen(false);
  }
};


  const handleGetNotificationData = async()=>{
      try{
          if(user && user?.role !== "super_admin") {if(!user?._id || (!user?.companyId?._id && !user?.createdBy?._id)) return toast({title:"Error", description:"required field Missing.", variant:"destructive"});}
           const res = await getNotificationData(user?._id, user?.companyId?._id || user?.createdBy?._id);
           console.log(res);
           if(res.status===200){
            setNotificationList(res?.data?.notification)
           }
      }
      catch(error){
         console.error(error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.response?.data || "Something went wrong",
        variant:"destructive"
      });
      }
  }

   useEffect(()=>{
    handleGetNotificationData();
   }, [])
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
    <Helmet>
        <title>Notification Page</title>
        <meta name="description" content="This is the home page of our app" />
      </Helmet>

      <DeleteCard
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title={selectedNotificationId?"Delete  Notification Message?" : "Delete All Notification Message?"}
        message={selectedNotificationId?`This Action Will Permanently Delete This Notification Message.`: `This Action Will Permanently Delete All Notification Message.`}
      />

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
          onClick={() =>{setIsDeleteDialogOpen(true)}}

        >
          <Trash size={18} className="text-red-500"/>
          All Deleted
        </Button>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {notificationList?.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No notifications yet.</p>
              </div>
            )}

            {notificationList?.map((notification) => (
              <div
                key={notification?._id}
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
                      onClick={() =>{ setSelectedNotificationId(notification?._id); setIsDeleteDialogOpen(true)}}
                    >
                    <Trash size={18} className="text-red-500" />
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
    </>
  );
};

export default Notifications;

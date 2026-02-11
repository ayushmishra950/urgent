
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarDays, Plus, CheckCircle2, XCircle, Clock, Calendar,ArrowLeft, FileText, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import LeaveTypeDialog from "@/Forms/LeaveTypeDialog";
import ApplyLeaveDialog from '@/Forms/ApplyLeaveDialog';
import DeleteCard from "@/components/cards/DeleteCard"
import { useToast } from '@/hooks/use-toast';
import { getleaveRequests,getSingleleaveRequests,  getleaveTypes, leaveDelete, leaveStatusChange } from "@/services/Service";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import { useNotifications } from '@/contexts/NotificationContext';
import {formatDate} from "@/services/allFunctions";
import { Helmet } from "react-helmet-async";

const Leave: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leaveTypeOpenForm, setLeaveTypeOpenForm] = useState(false);
  const [leaveTypeData, setLeaveTypeData] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState(null);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [allLeaveRequests, setAllLeaveRequests] = useState([]);
  const [leaveTypeRefresh, setLeaveTypeRefresh] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [mode, setMode] = useState(false);
   const { notifications, markAsRead, deleteNotification } = useNotifications();

  const handleGetleaveTypes = async () => {
    try {
      const response = await getleaveTypes(user?.role === "employee"?user?.createdBy?._id : user?.companyId?._id);
      console.log(response)
      if (response.status === 200) {
        setLeaveTypes(response?.data?.leaves);
        setLeaveTypeRefresh(false);
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: error?.response?.data?.message || "Something went wrong" });
    }
  };

  const handleGetleaveRequests = async () => {
    try {
      let response = null;
        if(user?.role === "admin"){
        response = await getleaveRequests(user?.companyId?._id);
        }
        else if(user?.role === "employee"){
          response = await getSingleleaveRequests(user?._id, user?.createdBy?._id)
        }
        console.log(response)
      if (response.status === 200) {
        setAllLeaveRequests(response?.data?.requests);

      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: error?.response?.data?.message || "Something went wrong" });
    }
  };

  useEffect(() => {
    handleGetleaveRequests();
    if (leaveTypeRefresh || leaveTypes.length === 0) {
      handleGetleaveTypes();
    }
  }, [leaveTypeRefresh, notifications]);

  const handleDeleteClick = (leaveTypeId) => {
    setSelectedLeaveTypeId(leaveTypeId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedLeaveTypeId) {
      toast({ title: "Error", description: "No Leave Type Selected for Deletion." });
      return
    };
    setIsDeleting(true);
    try {
      const response = await leaveDelete(selectedLeaveTypeId, user?.companyId?._id);
      if (response.status === 200) {
        setLeaveTypeRefresh(true);
        toast({
          title: "Delete Leave Type",
          description: "Leave Type deleted successfully.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: error?.response?.data?.message || "Something went wrong" });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleStatusChange = async (newStatus: string, request) => {
    if (!request?.user?._id && !newStatus || !user?.companyId?._id || !user?._id) return;
    try {
      const response = await leaveStatusChange(newStatus, request, user?.companyId?._id, user?._id );
      console.log("Status Change Response:", response);
      if (response.status === 200) {
        handleGetleaveRequests();
        toast({
          title: "Leave Request Updated",
          description: `Leave request has been ${newStatus.toLowerCase()} successfully.`,
        });
      }
    }
    catch (error) {
      console.error(error);
      toast({ title: "Error", description: error?.response?.data?.message || "Something went wrong" });
    }
  }

  // We'll show leave types only to admin/manager for now
  const isAdmin = user?.role !== 'employee';

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ElementType; className: string }> = {
      pending: { icon: Clock, className: 'badge-warning' },
      approved: { icon: CheckCircle2, className: 'badge-success' },
      rejected: { icon: XCircle, className: 'badge-destructive' },
    };
    const key = status?.toLowerCase();
    const { icon: Icon, className } = config[key];

    return (
      <span className={cn('inline-flex items-center gap-1 capitalize', className)}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };
  const filteredRequests = user?.role === 'employee'
    ? allLeaveRequests.filter(req => req?.user?._id === user?._id) // sirf apna data
    : allLeaveRequests; // admin ke liye sab data
  let totalLeaves = leaveTypes?.length
  let usedLeaves = filteredRequests?.filter((leave) => leave?.status === "Approved").length;

  let pendingLeaves = filteredRequests?.filter( (leave) => leave?.status === "Pending").length;

  let remainingLeaves = Math.max( totalLeaves - usedLeaves, 0 );

  return (
    <>
    <Helmet>
        <title>Leave Page</title>
        <meta name="description" content="This is the home page of our app" />
      </Helmet>
    <div className="space-y-6">

      <LeaveTypeDialog
        isOpen={leaveTypeOpenForm}
        onOpenChange={() => setLeaveTypeOpenForm(false)}
        initialData={leaveTypeData}
        setLeaveTypeRefresh={setLeaveTypeRefresh}
      />

      <DeleteCard
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title="Delete Leave Type?"
        message="This Action Will permanently Delete This Leave Type."
      />
      <div className="mb-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 text-gray-800 dark:text-white" />
              </button>
            </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-primary" />
            Leave Management
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'employee'
              ? 'Apply for leave and track your requests'
              : 'Manage employee leave requests & types'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {user?.role === 'employee' && (
            <ApplyLeaveDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} setLeaveTypeRefresh={setLeaveTypeRefresh} initialData={initialData} mode={mode} />
          )}

          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => { setLeaveTypeData(null); setLeaveTypeOpenForm(true) }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Leave Type
            </Button>
          )}
        </div>
      </div>

      {/* Leave Balance (Employee View) */}
      {user?.role === 'employee' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Leaves Types</p>
              <p className="text-2xl font-bold">
                {totalLeaves}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Used</p>
              <p className="text-2xl font-bold text-destructive">
                {usedLeaves}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-2xl font-bold text-success">
                {remainingLeaves}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-warning">
                {pendingLeaves}
              </p>
            </CardContent>
          </Card>
        </div>

      )}

      {/* Main Content: Leave Requests and Leave Types side-by-side on larger screens */}
      <div
        className={cn(
          "grid gap-6",
          isAdmin ? "lg:grid-cols-2" : "lg:grid-cols-1"
        )}
      >  {/* Leave Requests (always shown first/on left) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {user?.role === 'employee' ? 'My Leave Requests' : 'Leave Requests'}
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            {filteredRequests.length === 0 ? (
      /* EMPTY STATE */
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No request found
      </div>
    ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request._id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {user?.role !== "employee" && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={request?.user?.profileImage}
                              alt={request?.user?.fullName}
                            />
                            <AvatarFallback>
                              {request?.user?.fullName
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <span className="font-medium">
                            {request?.user?.fullName}
                          </span>
                        </div>
                      )}

                      {request?.leaveType && (
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium`}
                          style={{ backgroundColor: request.leaveType.color, color: '#fff' }}
                        >
                          {request.leaveType.name}
                        </span>
                      )}                {getStatusBadge(request?.status)}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(request.fromDate)} - {formatDate(request.toDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Applied: {formatDate(request.appliedDate)}</span>
                      </div>
                    </div>
                    <p className="text-sm">{request.description}</p>
                    {request.reviewedBy && (
                      <p className="text-xs text-muted-foreground">
                        Reviewed by: {request.reviewedBy}
                      </p>
                    )}
                  </div>

                  {user?.role !== 'employee' && request.status.toLowerCase() === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-success border-success hover:bg-success hover:text-success-foreground"
                        onClick={() => handleStatusChange("Approved", request)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleStatusChange("Rejected", request)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
    )}
          </CardContent>
        </Card>

        {/* Leave Types Management (Admin/Manager Only, shown on right/below) */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Leave Types
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {leaveTypes?.length === 0 ? (
      /* EMPTY STATE */
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No leave types found
      </div>
    ) : (
              <div className="space-y-3">
                {leaveTypes?.map((type) => (
                  <div
                    key={type._id}
                    className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    {/* Icons for mobile (smaller, top-right) */}
                    <div className="absolute top-2 right-2 flex gap-1 sm:hidden">
                      <Button
                        size="icon" // use icon size button
                        variant="outline"
                        className="w-7 h-7 p-1 text-amber-600 hover:text-amber-700"
                        onClick={() => { setLeaveTypeData(type); setLeaveTypeOpenForm(true); }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="w-7 h-7 p-1 text-destructive hover:text-destructive/90"
                        onClick={() => handleDeleteClick(type?._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Card Content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-lg">{type.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Max Days: <span className="font-medium">{type.maxDaysAllowed}</span>
                      </p>
                      <p className="text-sm">{type.description}</p>
                    </div>

                    {/* Icons for desktop */}
                    <div className="hidden sm:flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-amber-600 hover:text-amber-700"
                        onClick={() => { setLeaveTypeData(type); setLeaveTypeOpenForm(true); }}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive/90"
                        onClick={() => handleDeleteClick(type?._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
    )}
            </CardContent>
          </Card>
        )}
      </div>

    </div>
    </>
  );
};

export default Leave;
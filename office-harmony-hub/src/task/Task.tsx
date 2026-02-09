import React, { useEffect, useState } from "react";
import { Plus, MoreHorizontal, Search, Filter, Eye, Edit, UserCheck, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import TaskForm from "./forms/TaskForm";
import ReassignForm from "./forms/ReassignForm";
import TaskStatusChangeModal from "./cards/TaskStatusChangeModal";
import TaskDetailCard from "./cards/TaskDetailCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getTask, taskStatusChange, reassignTask, deleteTask } from "@/services/Service";
import { formatDate, getStatusColor, getPriorityColor } from "@/services/allFunctions";
import DeleteCard from "@/components/cards/DeleteCard";
import SubTaskDetailCard from "./cards/SubTaskDetailCard";

interface TaskItem {
  id: number;
  title: string;
  project: string;
  assignee: string;
  status: "pending" | "In Progress" | "completed" | "overdue" | "active";
  priority: "Low" | "Medium" | "High";
  dueDate: string;
}

const Task: React.FC = () => {
  const [tasks] = useState<TaskItem[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [reasignForm, setReasignForm] = useState(false);
  const [isTaskStatusChangeModalOpen, setIsTaskStatusChangeModalOpen] = useState(false);
  const [name, setName] = useState("Task");
  const [taskCard, setTaskCard] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const [taskListRefresh, setTaskListRefresh] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [reassignName, setReassignName] = useState("Manager");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
const today = new Date();

const filteredTasks = taskList.filter((t) => {
  const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());

  const matchesStatus = filterStatus === "all" || (filterStatus === "overdue"
      ? new Date(t.endDate) < today : t.status === filterStatus);

  return matchesSearch && matchesStatus;
});


  const handleReassignTask = async (object) => {
        if(!user?._id || (!user?.companyId?._id&& !user?.createdBy?._id))return;

    let obj = { ...object, adminId: user?._id, companyId: user?.companyId?._id || user?.createdBy?._id }
    console.log(obj)
    try {
      const res = await reassignTask(obj);
      console.log(res);
      if (res.status === 200) {
        toast({ title: "Reassign Task", description: res.data.message });
        setReasignForm(false);
        setTaskListRefresh(true);
      }
    }
    catch (err) {
      console.log(err);
      toast({ title: "Error", description: err.response.data.message, variant: "destructive" });
    }
  }


  const handleChangeStatus = async () => {
    if(!user?._id || (!user?.companyId?._id&& !user?.createdBy?._id) || !selectedTask?._id || !newStatus)return;
    let obj = { adminId: user?._id, companyId: user?.companyId?._id || user?.createdBy?._id, taskId: selectedTask?._id, status: newStatus }
    try {
      const res = await taskStatusChange(obj);
      console.log(res);
      if (res.status === 200) {
        toast({ title: "Task Status.", description: res.data.message });
        setTaskListRefresh(true);

      }
    }
    catch (err) {
      console.log(err);
      toast({ title: "Error", description: err.response.data.message, variant: "destructive" })
    }
  }

  const handleGetTask = async () => {
    if (!user?._id || (!user?.companyId?._id && !user?.createdBy?._id)) { return }
    let obj = { companyId: user?.companyId?._id || user?.createdBy?._id, adminId: user?._id }
    try {
      const res = await getTask(obj);
      console.log(res)
      if (res.status === 200) {
        setTaskList(Array.isArray(res?.data?.data) ? res?.data?.data : Object.values(res?.data?.data));
        setTaskListRefresh(false);
        setIsTaskStatusChangeModalOpen(false);
      }
    }
    catch (err) {
      console.log(err);
      toast({ title: "Error", description: err.response.data.message, variant: "destructive" })
    }
  }

  useEffect(() => {

    handleGetTask();
  }, [taskListRefresh])

  const handleConfirmDelete = async () => {
    if (!selectedTaskId || (!user?.companyId?._id&& !user?.createdBy?._id) || !user?._id) return;
    let obj = { taskId: selectedTaskId, companyId: user?.companyId?._id || user?.createdBy?._id, adminId: user?._id }
    setIsDeleting(true);
    try {
      const res = await deleteTask(obj);
      console.log(res)
      if (res.status === 200) {
        setTaskListRefresh(true);
        toast({
          title: "Task Deleted.",
          description: `${res?.data?.message}`,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };


  return (
    <>
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={initialData}
        setTaskListRefresh={setTaskListRefresh}
      />
      <DeleteCard
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title="Confirm Task Deletion"
        message="Are you sure you want to permanently delete this task? All associated subtasks will also be deleted and cannot be recovered."
      />
      <ReassignForm
        isOpen={reasignForm}
        onClose={() => { setReasignForm(false) }}
        data={selectedTask}
        reassignName={reassignName}
        onSave={handleReassignTask}
      />
      <TaskStatusChangeModal name={name} task={selectedTask} isOpen={isTaskStatusChangeModalOpen} newStatus={newStatus} setNewStatus={setNewStatus} onConfirm={handleChangeStatus} onClose={() => setIsTaskStatusChangeModalOpen(false)} />
     {(user?.role === "admin" || user?.taskRole === "manager") ? (
  <TaskDetailCard isOpen={taskCard} taskId={selectedTaskId} onClose={() => setTaskCard(false)} />
) : user?.taskRole === "none" ? (
  <SubTaskDetailCard isOpen={taskCard} subTaskId={selectedTaskId} onClose={() => setTaskCard(false)} />
) : null}


      <div className="flex flex-col min-h-screen bg-gray-50/50 p-3 sm:p-6 space-y-6 max-w-[100vw] sm:max-w-none">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Tasks
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage ongoing tasks and track progress.
            </p>
          </div>
         { user?.taskRole !== "none"? <Button
            className="w-full sm:w-auto"
            onClick={() => {
              setInitialData(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Create Task
          </Button> : ""}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Task List</CardTitle>
            <CardDescription>
              Tasks with project, priority, and deadlines.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="cursor-pointer">All</SelectItem>
                  <SelectItem value="pending" className="cursor-pointer">Pending</SelectItem>
                  <SelectItem value="active" className="cursor-pointer">In Progress</SelectItem>
                  <SelectItem value="completed" className="cursor-pointer">Completed</SelectItem>
                  <SelectItem value="overdue" className="cursor-pointer">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>{user?.taskRole === "none"?"Parent Task" : "Project"}</TableHead>
                    {user?.taskRole !=="none"?<TableHead>Manager</TableHead> : ""}
                    <TableHead>AssignedBy</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.length ? (
                    filteredTasks.map((task) => (
                      <TableRow key={task._id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {task.name}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{task?.projectId?.name || task?.taskId?.name}</TableCell>
                        {user?.taskRole !== "none"?<TableCell className="whitespace-nowrap">{task.managerId?.fullName} ({task?.managerId?.department})</TableCell>:""}
                       <TableCell >{task?.createdBy?.username ||task?.createdBy?.fullName} ({task?.createdByRole==="Employee"?"Manager":"Admin"})</TableCell>
                        <TableCell>
                          <Badge className={`${getPriorityColor(task.priority)} whitespace-nowrap`}>
                            {task.priority}</Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge className={getStatusColor(task.status)}>
                            {task.status === "active" ? "In_Progress" : (task.status.charAt(0).toUpperCase() + task.status.slice(1))}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{formatDate(task.endDate)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => {
                                  setSelectedTaskId(task?._id);
                                  setTaskCard(true);
                                }}
                              >
                                <Eye className="h-4 w-4 text-green-600" />
                                View Task
                              </DropdownMenuItem>
                             {user?.taskRole !== "none"? <><DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => {
                                  setInitialData(task);
                                  setIsFormOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4 text-green-600" />
                                Edit Task
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => { setSelectedTask(task); setReasignForm(true) }} className="flex items-center gap-2 cursor-pointer">
                                <UserCheck className="h-4 w-4 text-blue-600 " />
                                Reassign
                              </DropdownMenuItem>
                              </>
                              : ""
}
                              <DropdownMenuItem onClick={() => { setSelectedTask(task); setIsTaskStatusChangeModalOpen(true) }} className="flex items-center gap-2 cursor-pointer">
                                <Filter className="h-4 w-4 text-purple-600" />
                                Change Status
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                            { user?.taskRole !== "none"?  <DropdownMenuItem onClick={() => { setSelectedTaskId(task?._id); setIsDeleteDialogOpen(true) }} className="flex items-center gap-2 text-red-600 cursor-pointer">
                                <Trash2 className="h-4 w-4" />
                                Delete Task
                              </DropdownMenuItem> : ""}
                            </DropdownMenuContent>

                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        No tasks found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Task;

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Priority, Status } from "@/types"; // Assuming types exist as per original file
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getProject, getTaskManager, addTask, updateTask } from "@/services/Service";
import {formatDateFromInput} from "@/services/allFunctions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from "@/components/ui/alert-dialog";


interface TaskFormData {
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

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  setTaskListRefresh:(value:boolean) => void;
}

const TaskForm: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  setTaskListRefresh
}) => {
  const [taskForm, setTaskForm] = useState<TaskFormData>({});
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(initialData);
  const today = new Date().toISOString().split("T")[0];
  const { toast } = useToast();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [managers, setManagers] = useState([]);
  const [startDateTouched, setStartDateTouched] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
const [pendingPayload, setPendingPayload] = useState<any>(null);


  useEffect(() => {
    if (isOpen || initialData) {
      setTaskForm({
        _id : initialData?._id,
        projectId : initialData?.projectId?._id,
        name : initialData?.name,
        description : initialData?.description,
        startDate: formatDateFromInput(initialData?.startDate),
        endDate : formatDateFromInput(initialData?.endDate),
        manager : initialData?.managerId?._id,
        priority : initialData?.priority,
        remarks : initialData?.remarks

      })
    }
    else{
      setTaskForm({});
    }
  }, [isOpen, initialData]);



  // const handleSubmit = async (e?: React.FormEvent) => {
  //   e?.preventDefault();
  //   let obj = {
  //     companyId: user?.companyId?._id || user?.createdBy?._id,
  //     projectId: taskForm?.projectId,
  //     createdBy: user?._id,
  //     createdByRole: user?.role === "admin" ? "Admin" : "Employee",
  //     managerId: taskForm?.manager,
  //     name: taskForm?.name,
  //     description: taskForm?.description,
  //     remarks: taskForm?.remarks,
  //     startDate: taskForm?.startDate,
  //     endDate: taskForm?.endDate,
  //     priority: taskForm?.priority,
  //     taskId: taskForm?._id
  //   }
  //   setLoading(true);
  //   try {
  //     let res = null;
  //     if (isEdit === true) {
  //       res = await updateTask(obj);
  //     }
  //     else {
  //       res = await addTask(obj);
  //     }
  //     if (res.status === 200 || res.status === 201) {
  //       setTaskListRefresh(true);
  //       return toast({ title: `${isEdit ? "Update Task Successfully." : "Add Task Successfully"}`, description: res.data.message })
  //     }
  //     else {
  //       setLoading(false);
  //       return toast({ title: `${isEdit ? "Update Task Failed." : "Add Task Failed."}`, description: res.data.message });
  //     }
  //   }
  //   catch (err) {
  //     console.log(err);
  //     toast({ title: "Error", description: err.response.data.message, variant: "destructive" });
  //   }
  //   finally {
  //     setLoading(false);
  //     onClose();
  //     setTaskForm({});
  //   }
  // }




  const handleSubmit = async (
  e?: React.FormEvent,
  forceCreate: boolean = false
) => {
  e?.preventDefault();

  const payload = {
    companyId: user?.companyId?._id || user?.createdBy?._id,
    projectId: taskForm?.projectId,
    createdBy: user?._id,
    createdByRole: user?.role === "admin" ? "Admin" : "Employee",
    managerId: taskForm?.manager,
    name: taskForm?.name,
    description: taskForm?.description,
    remarks: taskForm?.remarks,
    startDate: taskForm?.startDate,
    endDate: taskForm?.endDate,
    priority: taskForm?.priority,
    taskId: taskForm?._id,
    forceCreate, // 🔥 important
  };

  setLoading(true);

  try {
    const res = isEdit
      ? await updateTask(payload)
      : await addTask(payload);

    // ⚠️ Warning case
    if (res.data?.warning) {
      setPendingPayload(payload);
      setConfirmOpen(true);
      return;
    }

    if (res.status === 200 || res.status === 201) {
      setTaskListRefresh(true);
      toast({
        title: isEdit
          ? "Update Task Successfully"
          : "Add Task Successfully",
        description: res.data.message,
      });
      onClose();
      setTaskForm({});
    } else {
      toast({
        title: isEdit ? "Update Failed" : "Add Failed",
        description: res.data.message,
        variant: "destructive",
      });
    }
  } catch (err: any) {
    toast({
      title: "Error",
      description: err?.response?.data?.message || "Something went wrong",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};



  const handleGetProject = async () => {
    if (!user?._id || (!user?.companyId?._id && !user?.createdBy?._id)) { return }
    try {
      const res = await getProject(user?._id, user?.companyId?._id || user?.createdBy?._id);
      if (res.status === 200) {
        setProjects(res.data);
      }
    }
    catch (err) {
      console.log(err);
      toast({ title: "Error", description: err.response.data.message });
    }
  };

  const handleGetManager = async () => {
    try {
      const res = await getTaskManager(user?._id, user?.companyId?._id || user?.createdBy?._id);
      if (res.status === 200) {
        setManagers(res.data);
      }
    }
    catch (err) {
      console.log(err);
      toast({ title: "Error", description: `Error := ${err.response.message}` })
    }
  };

  useEffect(() => {
    if(user?.role === "admin" || user?.taskRole==="manager"){
 handleGetManager();
  handleGetProject();
    }
   
   
  }, [])


  return (
    <>
    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>
        Manager already has active tasks
      </AlertDialogTitle>
      <AlertDialogDescription>
        Do you still want to assign this task?
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction
        onClick={() => {
          setConfirmOpen(false);
          handleSubmit(undefined, true); // 🔥 forceCreate
        }}
      >
        Continue
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] sm:max-h-[90vh] overflow-y-auto w-[95vw] pb-6">
       <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Row: Project & Task Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="project">Project</Label>
              <Select
                value={taskForm.projectId?.toString() || ""}
                onValueChange={(value) =>
                  setTaskForm({ ...taskForm, projectId: value })
                }
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p._id} value={p._id.toString()} className="cursor-pointer">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="taskName">Task Name</Label>
              <Input
                id="taskName"
                placeholder="Enter task name"
                value={taskForm.name || ""}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, name: e.target.value })
                }
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              rows={3}
              value={taskForm.description || ""}
              onChange={(e) =>
                setTaskForm({ ...taskForm, description: e.target.value })
              }
            />
          </div>

          {/* Row: Start Date & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                min={
                                        isEdit
                                            ? startDateTouched
                                                ? today       // edit + changed → today/future only
                                                : taskForm?.startDate || today  // edit + untouched → old date allowed
                                            : today         // create → today/future only
                                    }
                value={taskForm.startDate || ""}
                onChange={(e) =>{ setStartDateTouched(true);
                  setTaskForm((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                    // agar endDate pehle ki hai to reset
                    endDate:
                      prev.endDate && e.target.value && prev.endDate < e.target.value
                        ? ""
                        : prev.endDate,
                  }))}
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={taskForm.endDate || ""}
                min={taskForm.startDate || today}
                disabled={!taskForm.startDate}
                onChange={(e) =>
                  setTaskForm((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
              />

              {!taskForm.startDate && (
                <p className="text-xs text-muted-foreground">
                  Please select start date first
                </p>
              )}
            </div>
          </div>


          {/* Row: Manager & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="manager">Manager</Label>
              <Select
                value={taskForm.manager || ""}
                onValueChange={(value) =>
                  setTaskForm({ ...taskForm, manager: value })
                }
              >
                <SelectTrigger id="manager">
                  <SelectValue placeholder="Select Manager" />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((m) => (
                    <SelectItem key={m._id} value={m._id} className="cursor-pointer">
                      {m.fullName} ({m.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={taskForm.priority || "low"}
                onValueChange={(value) =>
                  setTaskForm({ ...taskForm, priority: value as Priority })
                }
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low" className="cursor-pointer">Low</SelectItem>
                  <SelectItem value="medium" className="cursor-pointer">Medium</SelectItem>
                  <SelectItem value="high" className="cursor-pointer">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Remarks */}
          <div className="grid gap-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              placeholder="Additional comments or remarks"
              rows={2}
              value={taskForm.remarks || ""}
              onChange={(e) =>
                setTaskForm({ ...taskForm, remarks: e.target.value })
              }
            />
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sticky bottom-0 bg-white pt-4">
          <Button
          type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            // onClick={handleSubmit}
            disabled={loading || !taskForm.name || !taskForm.priority || !taskForm.startDate || !taskForm.endDate || !taskForm.description || !taskForm.remarks || !taskForm.manager}
            className="w-full sm:w-auto"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Task" : "Create Task"}
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default TaskForm;

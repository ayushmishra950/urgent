import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AwardIcon, Loader2 } from "lucide-react";
import { Priority, Status } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getTask, getEmployeebyDepartment, addSubTask, updateSubTask } from "@/services/Service";
import { formatDateFromInput } from "@/services/allFunctions";
import {TaskFormData, TaskFormModalProps} from "@/types/index";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from "@/components/ui/alert-dialog";

const SubTaskForm: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  setSubTaskListRefresh
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [taskForm, setTaskForm] = useState<TaskFormData>({});
  const [loading, setLoading] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const [employeeList, setEmployeeList] = useState([])
  const [startDateTouched, setStartDateTouched] = useState(false);
const [localIsEdit, setLocalIsEdit] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
 const [pendingPayload, setPendingPayload] = useState<any>(null);

  const isEdit = Boolean(initialData);
  const today = new Date().toISOString().split("T")[0];
useEffect(() => {
  const initializeForm = async () => {
    if (!isOpen) return;
     console.log(initialData)
    if (initialData?._id) {
      setLocalIsEdit(true);
      
      // 1. Pehle Parent Task ki details nikalen API call ke liye
      const selectedTaskId = initialData.taskId?._id || initialData.taskId;
      const selectedTask = taskList.find(t => t._id === selectedTaskId);
      console.log(selectedTask, taskList, selectedTaskId)

      if(!user?.companyId?._id && !user?.createdBy?._id) return;

      if (selectedTask) {
        const obj = {
          taskId: selectedTask._id,
          department: selectedTask.managerId?.department,
          companyId: user?.companyId?._id || user?.createdBy?._id,
          adminId: user._id
        };
        try {
          // 2. API Call karke puri list fetch karein (Await karein)
          const res = await getEmployeebyDepartment(obj);
          console.log(res)
          if (res.status === 200) {
            setEmployeeList(res.data.data);
            
            // 3. JAB LIST AA JAYE, tab form state update karein
            setTaskForm({
              _id: initialData._id,
              taskId: selectedTaskId,
              name: initialData.name,
              description: initialData.description,
              startDate: formatDateFromInput(initialData.startDate),
              endDate: formatDateFromInput(initialData.endDate),
              // Ab list ready hai, toh yeh value Select mein show hogi
              employee: initialData.employeeId?._id || initialData.employeeId || "",
              priority: initialData.priority,
              remarks: initialData.remarks
            });
          }
        } catch (err) {
          console.error("Error fetching employees on refresh:", err);
        }
      } else {
        // Fallback: Agar task list abhi nahi aayi, toh sirf initial data wala employee list mein daalein
        const fallbackEmp = initialData.employeeId ? [initialData.employeeId] : [];
        setEmployeeList(fallbackEmp);
        // ... setTaskForm logic yahan bhi repeat kar sakte hain
      }
    } else {
      // Create Mode Logic
      setLocalIsEdit(false);
      setTaskForm({});
      setEmployeeList([]);
    }
  };

  initializeForm();
}, [isOpen, initialData, taskList]); // taskList add kiya taaki refresh ke baad list aate hi trigger ho

// ---------------------------------------------------
const handleParentTaskChange = async (taskId) => {
 if (localIsEdit || initialData?._id) return; 

  const selectedTask = taskList.find(t => t._id === taskId);
  if (!selectedTask) return;

  if ((!user?.companyId?._id&& !user?.createdBy?._id) || !user?._id) return;

  const obj = {
    taskId: selectedTask._id,
    department: selectedTask.managerId?.department,
    companyId: user?.companyId?._id || user?.createdBy?._id,
    adminId: user._id
  };
  try {
    const res = await getEmployeebyDepartment(obj);
    console.log(res)
    if (res.status === 200) {
      setEmployeeList(res.data.data);
      // Reset employee field on create
     if (!isEdit && !initialData) {
  setTaskForm(prev => ({ ...prev, taskId: selectedTask._id, employee: "" }));
}
    }
  } catch (err) {
    toast({ title: "Error", description: err.response?.data?.message, variant: "destructive"});
  }
};

  // const handleSave = async (e?: React.FormEvent) => {
  //   e?.preventDefault();
  //   let obj = {
  //     _id: initialData?._id,
  //     companyId: user?.companyId?._id || user?.createdBy?._id,
  //     taskId: taskForm?.taskId,
  //     createdBy: user?._id,
  //     createdByRole: user?.role === "admin" ? "Admin" : "Employee",
  //     employeeId: taskForm?.employee,
  //     name: taskForm?.name,
  //     description: taskForm?.description,
  //     remarks: taskForm?.remarks,
  //     startDate: taskForm?.startDate,
  //     endDate: taskForm?.endDate,
  //     priority: taskForm?.priority,
  //   };
  //   setLoading(true);
  //   try {
  //     let res = null;
  //     if (isEdit === true) {  res = await updateSubTask(obj);}
  //     else { res = await addSubTask(obj);}
  //     if (res.status === 200 || res.status === 201) {
  //       onClose();
  //       setSubTaskListRefresh(true);
  //       return toast({ title: `${isEdit ? "Update Sub Task Successfully" : "Add Sub Task Successfully"}`, description: res.data.message })
  //     }
  //     else {
  //       setLoading(false)
  //       return toast({ title: `${isEdit ? "Update Sub Task Failed" : "Add Sub Task Failed"}`, description: res.data.message })
  //     }
  //   }
  //   catch (err) {
  //     console.log(err);
  //     setLoading(false)
  //     return toast({ title: "Error", description: err.response.data.message, variant: "destructive" })
  //   }
  //   finally {
  //     setLoading(false)
  //   }
  // };



  const handleSave = async (e?: React.FormEvent, forceCreate: boolean = false) => {
    e?.preventDefault();
    const obj = {
      _id: initialData?._id,
      companyId: user?.companyId?._id || user?.createdBy?._id,
      taskId: taskForm?.taskId,
      createdBy: user?._id,
      createdByRole: user?.role === "admin" ? "Admin" : "Employee",
      employeeId: taskForm?.employee,
      name: taskForm?.name,
      description: taskForm?.description,
      remarks: taskForm?.remarks,
      startDate: taskForm?.startDate,
      endDate: taskForm?.endDate,
      priority: taskForm?.priority,
      forceCreate,
    };
    setLoading(true);

    try {
      let res = null;
      if (isEdit) {
        res = await updateSubTask(obj);
      } else {
        res = await addSubTask(obj);
      }

      if (res.data?.warning) {
      setPendingPayload(obj);
      setConfirmOpen(true);
      return;
    }

      if (res.status === 200 || res.status === 201) {
        // ✅ Success
        onClose();
        setSubTaskListRefresh(true);
        toast({
          title: isEdit ? "Update Sub Task Successfully" : "Add Sub Task Successfully",
          description: res.data.message,
        });
      }  else {
        toast({
          title: isEdit ? "Update Sub Task Failed" : "Add Sub Task Failed",
          description: res.data.message,
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleGetTask = async () => {
    if (!user?._id || (!user?.companyId?._id && !user?.createdBy?._id)) { return }
    let obj = { companyId: user?.companyId?._id || user?.createdBy?._id, adminId: user?._id }
    try {
      const res = await getTask(obj);
      console.log(res)
      if (res.status === 200) {
        setTaskList(Array.isArray(res?.data?.data) ? res?.data?.data : Object.values(res?.data?.data));
      }
    }
    catch (err) {
      console.log(err);
      return toast({ title: "Error", description: err.response.data.message, variant: "destructive" })
    }
  }

 useEffect(() => {
  if (!isOpen) return;
  if (!taskList.length) handleGetTask();
}, [isOpen]);

  return (
    <>
    
      {/* ⚠️ AlertDialog for existing active subtasks */}
     <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Employee already has active tasks
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
              handleSave(undefined, true); // 🔥 forceCreate
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] sm:max-h-[90vh] overflow-y-auto w-[95vw] pb-6">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Sub-Task" : "Create New Sub-Task"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Row: Project & Task Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="project">Parent Task</Label>
                <Select
                  value={taskForm?.taskId?.toString() || ""}
                  onValueChange={handleParentTaskChange}>
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Select Parent Task" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskList.map((p) => (
                      <SelectItem key={p._id} value={p._id} className="cursor-pointer"> {p.name} </SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taskName">Sub Task Name</Label>
                <Input
                  id="taskName"
                  placeholder="Enter task name"
                  value={taskForm?.name || ""}
                  onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })  } />
              </div>
            </div>
            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter task description"
                rows={3}
                value={taskForm?.description || ""}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value }) }/>
            </div>
            {/* Row: Start Date & End Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={taskForm?.startDate || ""}
                  min={ isEdit ? startDateTouched ? today : taskForm?.startDate || today   : today }
                  onChange={(e) => { setStartDateTouched(true);
                    setTaskForm({ ...taskForm, startDate: e.target.value,
                      // agar start date change hui aur end date usse chhoti hai to reset
                      endDate: taskForm.endDate && e.target.value && taskForm.endDate < e.target.value ? "" : taskForm.endDate }) } } />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={taskForm?.endDate || ""}
                  min={taskForm?.startDate || today}
                  disabled={!taskForm?.startDate} // start date ke bina end date disabled
                  onChange={(e) => setTaskForm({ ...taskForm, endDate: e.target.value }) } />
                {!taskForm?.startDate && (
                  <p className="text-xs text-muted-foreground">
                    Please select start date first
                  </p>
                )}
              </div>
            </div>
            {/* Row: Manager & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="manager">Employee</Label>
                <Select
                  disabled={!taskForm?.taskId}
                  value={taskForm?.employee|| ""}
                  onValueChange={(value) => setTaskForm({ ...taskForm, employee: value }) }>
                  <SelectTrigger id="manager">
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employeeList.map(emp => (
                      <SelectItem key={emp._id} value={emp._id} className="cursor-pointer" disabled={emp?.taskRole === "manager"}>
                        {emp.fullName} ({emp.department}) {emp.taskRole === "manager" ? "Manager" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!taskForm?.taskId && (
                  <p className="text-xs text-muted-foreground">
                    Please select parent task first
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={taskForm?.priority || "low"}
                  onValueChange={(value) => setTaskForm({ ...taskForm, priority: value as Priority }) } >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low" className="cursor-pointer">Low</SelectItem>
                    <SelectItem value="medium" className="cursor-pointer">Medium</SelectItem>
                    <SelectItem value="high" className="cursor-pointer">High</SelectItem>
                    <SelectItem value="urgent" className="cursor-pointer">Urgent</SelectItem>
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
                value={taskForm?.remarks || ""}
                onChange={(e) => setTaskForm({ ...taskForm, remarks: e.target.value }) }/>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sticky bottom-0 bg-white pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              disabled={loading || !taskForm?.name || !taskForm?.description || !taskForm?.startDate || !taskForm?.endDate || !taskForm?.employee || !taskForm?.priority || !taskForm?.remarks}
              className="w-full sm:w-auto" >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update Sub-Task" : "Create Sub-Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default SubTaskForm;

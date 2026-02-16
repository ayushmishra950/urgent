// import React, { useState, useEffect } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Loader2 } from "lucide-react";
// import { Priority, Status } from "@/types"; // Assuming types exist as per original file
// import { useAuth } from "@/contexts/AuthContext";
// import { useToast } from "@/hooks/use-toast";
// import { getProject, getTaskManager, addTask, updateTask } from "@/services/Service";
// import { formatDateFromInput } from "@/services/allFunctions";
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
// import ProjectForm from "./ProjectForm";
// import { TaskFormData, TaskFormModalProps } from "@/types/index";


// const TaskForm: React.FC<TaskFormModalProps> = ({
//   isOpen,
//   onClose,
//   initialData,
//   setTaskListRefresh,
//   projectId
// }) => {
//   const [taskForm, setTaskForm] = useState<TaskFormData>({});
//   const [loading, setLoading] = useState(false);
//   const isEdit = Boolean(initialData);
//   const today = new Date().toISOString().split("T")[0];
//   const { toast } = useToast();
//   const { user } = useAuth();
//   const [projects, setProjects] = useState([]);
//   const [managers, setManagers] = useState([]);
//   const [startDateTouched, setStartDateTouched] = useState(false);
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [pendingPayload, setPendingPayload] = useState<any>(null);
//   const [isFormOpen, setIsFormOpen] = useState(false);
//   const [projectListRefresh, setProjectListRefresh] = useState(false);


//   useEffect(() => {
//     if (isOpen || initialData || projectId) {
//       setTaskForm({
//         _id: initialData?._id,
//         projectId: projectId ? projectId : initialData?.projectId?._id,
//         name: initialData?.name,
//         description: initialData?.description,
//         startDate: formatDateFromInput(initialData?.startDate),
//         endDate: formatDateFromInput(initialData?.endDate),
//         manager: initialData?.managerId?._id,
//         priority: initialData?.priority,
//         remarks: initialData?.remarks

//       })
//     }
//     else {
//       setTaskForm({});
//     }
//   }, [isOpen, initialData, projectId]);

//   const handleSubmit = async (
//     e?: React.FormEvent,
//     forceCreate: boolean = false
//   ) => {
//     e?.preventDefault();

//     const payload = {
//       companyId: user?.companyId?._id || user?.createdBy?._id,
//       projectId: taskForm?.projectId,
//       createdBy: user?._id,
//       createdByRole: user?.role === "admin" ? "Admin" : "Employee",
//       managerId: taskForm?.manager,
//       name: taskForm?.name,
//       description: taskForm?.description,
//       remarks: taskForm?.remarks,
//       startDate: taskForm?.startDate,
//       endDate: taskForm?.endDate,
//       priority: taskForm?.priority,
//       taskId: taskForm?._id,
//       forceCreate, // 🔥 important
//     };

//     setLoading(true);

//     try {
//       const res = isEdit
//         ? await updateTask(payload)
//         : await addTask(payload);

//       // ⚠️ Warning case
//       if (res.data?.warning) {
//         setPendingPayload(payload);
//         setConfirmOpen(true);
//         return;
//       }

//       if (res.status === 200 || res.status === 201) {
//         setTaskListRefresh(true);
//         toast({
//           title: isEdit
//             ? "Update Task Successfully"
//             : "Add Task Successfully",
//           description: res.data.message,
//         });
//         onClose();
//         setTaskForm({});
//       } else {
//         toast({
//           title: isEdit ? "Update Failed" : "Add Failed",
//           description: res.data.message,
//           variant: "destructive",
//         });
//       }
//     } catch (err: any) {
//       toast({
//         title: "Error",
//         description: err?.response?.data?.message || "Something went wrong",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };



//   const handleGetProject = async () => {
//     if (!user?._id || (!user?.companyId?._id && !user?.createdBy?._id)) { return }
//     try {
//       const res = await getProject(user?._id, user?.companyId?._id || user?.createdBy?._id);
//       if (res.status === 200) {
//         setProjects(res.data);
//       }
//     }
//     catch (err) {
//       console.log(err);
//       toast({ title: "Error", description: err.response.data.message });
//     }
//   };

//   const handleGetManager = async () => {
//     try {
//       const res = await getTaskManager(user?._id, user?.companyId?._id || user?.createdBy?._id);
//       if (res.status === 200) {
//         setManagers(res.data);
//       }
//     }
//     catch (err) {
//       console.log(err);
//       toast({ title: "Error", description: `Error := ${err.response.message}` })
//     }
//   };

//   useEffect(() => {
//     if (user?.role === "admin" || user?.taskRole === "manager") {
//       handleGetManager();
//       handleGetProject();
//     }


//   }, [projectListRefresh])


//   return (
//     <>
//       <ProjectForm
//         isOpen={isFormOpen}
//         onClose={() => setIsFormOpen(false)}
//         initialData={null}
//         setProjectListRefresh={setProjectListRefresh}
//       />
//       <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>
//               Manager already has active tasks
//             </AlertDialogTitle>
//             <AlertDialogDescription>
//               Do you still want to assign this task?
//             </AlertDialogDescription>
//           </AlertDialogHeader>

//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={() => {
//                 setConfirmOpen(false);
//                 handleSubmit(undefined, true); // 🔥 forceCreate
//               }}
//             >
//               Continue
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       <Dialog open={isOpen} onOpenChange={onClose}>
//         <DialogContent className="sm:max-w-[650px] max-h-[80vh] sm:max-h-[90vh] overflow-y-auto w-[95vw] pb-6">
//           <form onSubmit={handleSubmit}>
//             <DialogHeader>
//               <DialogTitle>{isEdit ? "Edit Task" : "Create New Task"}</DialogTitle>
//             </DialogHeader>

//             <div className="grid gap-4 py-4">
//               {/* Row: Project & Task Name */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

//                 <div className="grid gap-2">
//                   <Label htmlFor="project">Project</Label>
//                   <Select
//                     value={taskForm.projectId?.toString() || ""}
//                     onValueChange={(value) =>
//                       setTaskForm({ ...taskForm, projectId: value })
//                     }
//                     disabled={projects?.length === 0} // disable if no data
//                   >
//                     <SelectTrigger id="project" className="h-9 sm:h-10 text-sm">
//                       <SelectValue placeholder="Select Project" />
//                     </SelectTrigger>

//                     {/* Only show content if projects exist */}
//                     {projects?.length > 0 && (
//                       <SelectContent className="max-h-48 overflow-y-auto">
//                         {projects.map((p) => (
//                           <SelectItem key={p._id} value={p._id.toString()} className="cursor-pointer">
//                             {p.name}
//                           </SelectItem>
//                         ))}

//                         {/* Divider + Add New Project button at the end */}
//                         <div className="border-t my-1" />
//                         <button
//                           type="button"
//                           onClick={() => setIsFormOpen(true)}
//                           className="w-full text-left px-2 py-1.5 text-sm text-primary hover:bg-muted rounded-sm"
//                         >
//                           + Add New Project
//                         </button>
//                       </SelectContent>
//                     )}
//                   </Select>

//                   {/* Message + Add button if no projects */}
//                   {projects?.length === 0 && (
//                     <div className="flex items-center justify-between text-xs text-red-500 mt-1">
//                       <span>Please add a project first</span>
//                       <Button
//                         type="button"
//                         size="sm"
//                         onClick={() => setIsFormOpen(true)}
//                         className="h-7 px-3 text-xs"
//                       >
//                         + Add Project
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//                 <div className="grid gap-2">
//                   <Label htmlFor="taskName">Task Name</Label>
//                   <Input
//                     id="taskName"
//                     placeholder="Enter task name"
//                     value={taskForm.name || ""}
//                     onChange={(e) =>
//                       setTaskForm({ ...taskForm, name: e.target.value })
//                     }
//                   />
//                 </div>
//               </div>
//               {/* Description */}
//               <div className="grid gap-2">
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea
//                   id="description"
//                   placeholder="Enter task description"
//                   rows={3}
//                   value={taskForm.description || ""}
//                   onChange={(e) =>
//                     setTaskForm({ ...taskForm, description: e.target.value })
//                   }
//                 />
//               </div>

//               {/* Row: Start Date & End Date */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div className="grid gap-2">
//                   <Label htmlFor="startDate">Start Date</Label>
//                   <Input
//                     id="startDate"
//                     type="date"
//                     min={
//                       isEdit
//                         ? startDateTouched
//                           ? today       // edit + changed → today/future only
//                           : taskForm?.startDate || today  // edit + untouched → old date allowed
//                         : today         // create → today/future only
//                     }
//                     value={taskForm.startDate || ""}
//                     onChange={(e) => {
//                       setStartDateTouched(true);
//                       setTaskForm((prev) => ({
//                         ...prev,
//                         startDate: e.target.value,
//                         // agar endDate pehle ki hai to reset
//                         endDate:
//                           prev.endDate && e.target.value && prev.endDate < e.target.value
//                             ? ""
//                             : prev.endDate,
//                       }))
//                     }
//                     }
//                   />
//                 </div>

//                 <div className="grid gap-2">
//                   <Label htmlFor="endDate">End Date</Label>
//                   <Input
//                     id="endDate"
//                     type="date"
//                     value={taskForm.endDate || ""}
//                     min={taskForm.startDate || today}
//                     disabled={!taskForm.startDate}
//                     onChange={(e) =>
//                       setTaskForm((prev) => ({
//                         ...prev,
//                         endDate: e.target.value,
//                       }))
//                     }
//                   />

//                   {!taskForm.startDate && (
//                     <p className="text-xs text-muted-foreground">
//                       Please select start date first
//                     </p>
//                   )}
//                 </div>
//               </div>


//               {/* Row: Manager & Priority */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div className="grid gap-2">
//                   <Label htmlFor="manager">Manager</Label>
//                   <Select
//                     value={taskForm.manager || ""}
//                     onValueChange={(value) =>
//                       setTaskForm({ ...taskForm, manager: value })
//                     }
//                   >
//                     <SelectTrigger id="manager">
//                       <SelectValue placeholder="Select Manager" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {managers.map((m) => (
//                         <SelectItem key={m._id} value={m._id} className="cursor-pointer">
//                           {m.fullName} ({m.department})
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="grid gap-2">
//                   <Label htmlFor="priority">Priority</Label>
//                   <Select
//                     value={taskForm.priority || "low"}
//                     onValueChange={(value) =>
//                       setTaskForm({ ...taskForm, priority: value as Priority })
//                     }
//                   >
//                     <SelectTrigger id="priority">
//                       <SelectValue placeholder="Select Priority" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="low" className="cursor-pointer">Low</SelectItem>
//                       <SelectItem value="medium" className="cursor-pointer">Medium</SelectItem>
//                       <SelectItem value="high" className="cursor-pointer">High</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               {/* Remarks */}
//               <div className="grid gap-2">
//                 <Label htmlFor="remarks">Remarks</Label>
//                 <Textarea
//                   id="remarks"
//                   placeholder="Additional comments or remarks"
//                   rows={2}
//                   value={taskForm.remarks || ""}
//                   onChange={(e) =>
//                     setTaskForm({ ...taskForm, remarks: e.target.value })
//                   }
//                 />
//               </div>
//             </div>

//             <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sticky bottom-0 bg-white pt-4">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={onClose}
//                 disabled={loading}
//                 className="w-full sm:w-auto"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 // onClick={handleSubmit}
//                 disabled={loading || !taskForm.name || !taskForm.priority || !taskForm.startDate || !taskForm.endDate || !taskForm.description || !taskForm.remarks || !taskForm.manager}
//                 className="w-full sm:w-auto"
//               >
//                 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                 {isEdit ? "Update Task" : "Create Task"}
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// export default TaskForm;

























































import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ChevronDown } from "lucide-react";
import { Priority } from "@/types"; // assuming types
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getProject, getTaskManager, addTask, updateTask } from "@/services/Service";
import { formatDateFromInput } from "@/services/allFunctions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import ProjectForm from "./ProjectForm";
import AddManagerForm from "./AddManagerForm";
import { TaskFormData, TaskFormModalProps } from "@/types";

const TaskForm: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  setTaskListRefresh,
  projectId
}) => {
  const [taskForm, setTaskForm] = useState<TaskFormData>({});
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(initialData);
  const today = new Date().toISOString().split("T")[0];
  const { toast } = useToast();
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [startDateTouched, setStartDateTouched] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projectListRefresh, setProjectListRefresh] = useState(false);
  const [projectDates, setProjectDates] = useState<{ startDate?: string; endDate?: string }>({});
  const [isManagerFormOpen, setIsManagerFormOpen] = useState(false);
  const [managerRefresh, setManagerRefresh] = useState(false);
  const formRef = useRef(null);
  const [showArrow, setShowArrow] = useState(true);
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  const handleScroll = () => {
    const el = formRef.current;

    const isBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - 2;

    setShowArrow(!isBottom);
  };


  useEffect(() => {
    if (isOpen || initialData || projectId) {
      setTaskForm({
        _id: initialData?._id,
        projectId: projectId ? projectId : initialData?.projectId?._id,
        name: initialData?.name,
        description: initialData?.description,
        startDate: formatDateFromInput(initialData?.startDate),
        endDate: formatDateFromInput(initialData?.endDate),
        manager: initialData?.managerId?._id,
        priority: initialData?.priority,
        remarks: initialData?.remarks
      });
    } else {
      setTaskForm({});
    }
  }, [isOpen, initialData, projectId]);


  const handleSubmit = async (e?: React.FormEvent, forceCreate = false) => {
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
      forceCreate,
    };

    setLoading(true);

    try {
      const res = isEdit
        ? await updateTask(payload)
        : await addTask(payload);

      if (res.data?.warning) {
        setPendingPayload(payload);
        setConfirmOpen(true);
        return;
      }

      if (res.status === 200 || res.status === 201) {
        setTaskListRefresh(true);
        toast({
          title: isEdit ? "Update Task Successfully" : "Add Task Successfully",
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
        title: "Error in Manage Task",
        description: err?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetProject = async () => {
    if (!user?._id || (!user?.companyId?._id && !user?.createdBy?._id)) return;
    try {
      const res = await getProject(user._id, user.companyId?._id || user.createdBy?._id);
      if (res.status === 200) setProjects(res.data);
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to load projects" });
    }
  };

  const handleGetManager = async () => {
    try {
      const res = await getTaskManager(user?._id, user?.companyId?._id || user?.createdBy?._id);
      if (res.status === 200) setManagers(res.data);
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to load managers" });
    }
  };

  useEffect(() => {
    if (user?.role === "admin" || user?.taskRole === "manager") {
      handleGetManager();
      handleGetProject();
    }
  }, [projectListRefresh, user, managerRefresh]);

  return (
    <>
      <ProjectForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={null}
        setProjectListRefresh={setProjectListRefresh}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Manager already has active tasks</AlertDialogTitle>
            <AlertDialogDescription>
              Do you still want to assign this task?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                handleSubmit(undefined, true);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent ref={formRef}
          onScroll={handleScroll} className={`sm:max-w-[580px] w-[92vw] max-h-[94vh] p-0 gap-0 rounded-lg overflow-y-auto no-scrollbar`}>
          <form id="manage-task-form" onSubmit={handleSubmit} className="flex flex-col h-full">
            <DialogHeader className="px-5 pt-2 pb-1 border-b shrink-0">
              <DialogTitle className="text-lg font-semibold">
                {isEdit ? "Edit Task" : "Create New Task"}
              </DialogTitle>
            </DialogHeader>

            <div
              className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm"
            >
              {/* Project & Task Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="grid gap-1.5">
                  <Label htmlFor="project" className="text-sm font-medium">Project</Label>
                  <Select
                    value={taskForm.projectId?.toString() || ""}
                    // onValueChange={(value) => setTaskForm({ ...taskForm, projectId: value })}
                    onValueChange={(value) => {
                      const selectedProject = projects.find(p => p._id === value);
                      setTaskForm({ ...taskForm, projectId: value });
                      // Store project dates separately (optional, for min/max logic)
                      setProjectDates({
                        startDate: formatDateFromInput(selectedProject?.startDate),
                        endDate: formatDateFromInput(selectedProject?.endDate),
                      });
                    }}

                    disabled={projects.length === 0}
                  >
                    <SelectTrigger id="project" className="h-9 text-sm">
                      <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                    <SelectContent className="max-h-52">
                      {projects.map((p) => (
                        <SelectItem key={p._id} value={p._id.toString()}>
                          {p.name}
                        </SelectItem>
                      ))}
                      {user?.role === "admin" && <>  <div className="border-t my-1" />
                        <button
                          type="button"
                          onClick={() => setIsFormOpen(true)}
                          className="w-full text-left px-2 py-1.5 text-sm text-primary hover:bg-muted rounded-sm"
                        >
                          + Add New Project
                        </button>
                      </>}
                    </SelectContent>
                  </Select>

                  {projects.length === 0 && (
                    <div className="flex items-center justify-between text-xs text-red-500 mt-1">
                      <span>Please add a project first. {user?.role !== "admin" && "Please Contact to Admin."}</span>
                      {user?.role === "admin" && <Button
                        type="button"
                        size="sm"
                        onClick={() => setIsFormOpen(true)}
                        className="h-7 px-3 text-xs"
                      >
                        + Add Project
                      </Button>}
                    </div>
                  )}
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="taskName" className="text-sm font-medium">Task Name</Label>
                  <Input
                    id="taskName"
                    placeholder="Enter task name"
                    value={taskForm.name || ""}
                    onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="grid gap-1.5">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Briefly describe the task (Optional)"
                  value={taskForm.description || ""}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="min-h-[76px] text-sm resize-y"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    ref={startDateRef}
                   onClick={()=>{if(startDateRef.current?.showPicker){startDateRef.current.showPicker()}}}                 
                    min={projectDates.startDate} // project start date ya today
                    max={projectDates.endDate}            // project end date
                    value={taskForm.startDate || ""}
                    onChange={(e) => {
                      setStartDateTouched(true);
                      setTaskForm((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                        endDate:
                          prev.endDate && e.target.value && prev.endDate < e.target.value
                            ? ""
                            : prev.endDate,
                      }));
                    }}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    ref={endDateRef}
                   onClick={()=>{if(endDateRef.current?.showPicker){endDateRef.current.showPicker()}}}              
                    min={taskForm.startDate || projectDates.startDate}
                    max={projectDates.endDate}
                    disabled={!taskForm.startDate}
                    value={taskForm.endDate || ""}
                    onChange={(e) => setTaskForm({ ...taskForm, endDate: e.target.value })}
                    className="h-9 text-sm"
                  />
                  {!taskForm.startDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Please select start date first
                    </p>
                  )}
                </div>
              </div>

              {/* Manager & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="manager" className="text-sm font-medium">
                    Manager *
                  </Label>

                  <Select
                    value={taskForm.manager || ""}
                    onValueChange={(value) => setTaskForm({ ...taskForm, manager: value })}
                    disabled={managers.length === 0}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select Manager" />
                    </SelectTrigger>

                    {/* Agar managers list me data ho */}
                    {managers.length > 0 && (
                      <>
                        <SelectContent className="max-h-48 overflow-y-auto">
                          {managers.map((m) => (
                            <SelectItem key={m._id} value={m._id}>
                              {m.fullName} ({m.department})
                            </SelectItem>
                          ))}

                          {/* Add More button outside SelectContent */}
                          {user?.role === "admin" && (
                            <Button type="button" onClick={()=>setIsManagerFormOpen(true)} variant="ghost" size='sm' className="w-full">
                                            + Add More Manager
                                        </Button>
                            
                          )}
                        </SelectContent>
                      </>
                    )}

                  </Select>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
                  <Select
                    value={taskForm.priority || ""}
                    onValueChange={(value) => setTaskForm({ ...taskForm, priority: value as Priority })}
                  >
                    <SelectTrigger className="h-9 text-sm md:mb-8">
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {showArrow && <div className="relative w-full">
                <span className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 flex justify-center">
                  <ChevronDown className="w-5 h-5 text-gray-400 animate-bounce" />
                </span>
              </div>}

              {/* Remarks */}
              <div className="grid gap-1.5">
                <Label htmlFor="remarks" className="text-sm font-medium">Remarks</Label>
                <Textarea
                  id="remarks"
                  placeholder="Add any additional notes (Optional)"
                  value={taskForm.remarks || ""}
                  onChange={(e) => setTaskForm({ ...taskForm, remarks: e.target.value })}
                  className="min-h-[70px] text-sm resize-y"
                />
              </div>
            </div>


            {/* Footer + indicator */}
            <div className="relative shrink-0 border-t bg-background">
              <DialogFooter className="px-5 py-4 gap-3 flex-col-reverse sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="h-9 text-sm w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    !taskForm.name ||
                    !taskForm.priority ||
                    !taskForm.startDate ||
                    !taskForm.endDate ||
                    !taskForm.manager ||
                    !taskForm.projectId
                  }
                  form="manage-task-form"
                  className="h-9 text-sm w-full sm:w-auto"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? "Update Task" : "Create Task"}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <AddManagerForm isOpen={isManagerFormOpen}
                              onIsOpenChange={setIsManagerFormOpen}
                              initialData={null}
                              setManagerRefresh={setManagerRefresh} />
    </>
  );
};

export default TaskForm;

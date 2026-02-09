
import React, { useEffect, useState } from "react";
import { Plus, MoreHorizontal, Search, Filter, Eye, Edit, UserCheck, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import ProjectForm from "./forms/ProjectForm";
import ProjectDetailCard from "./cards/ProjectDetailCard";
import TaskStatusChangeModal from "./cards/TaskStatusChangeModal";
import { getProject, projectStatusChange, deleteProject } from "@/services/Service";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDate, getStatusColor, getPriorityColor } from "@/services/allFunctions";
import DeleteCard from "@/components/cards/DeleteCard";

type Priority = 'low' | 'medium' | 'high' | 'urgent';
interface ProjectItem {
  _id: string;
  name: string;
  status: "pending" | "in_progress" | "completed" | "overdue" | "active" | "cancelled";
  endDate: string;
  startDate: string;
  priority: Priority;
}

const Project: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);
  const [isTaskStatusChangeModalOpen, setIsTaskStatusChangeModalOpen] = useState(false);
  const [name, setName] = useState("Project");
  const [initialData, setInitialData] = useState<ProjectItem | null>(null);
  const [projectListRefresh, setProjectListRefresh] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const today = new Date();

const filteredProjects = projects.filter((t) => {
  const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());

  const matchesStatus = filterStatus === "all" || (filterStatus === "overdue"
      ? new Date(t.endDate) < today : t.status === filterStatus);

  return matchesSearch && matchesStatus;
});

  const handleChangeStatus = async () => {
    let obj = { adminId: user?._id, companyId: user?.companyId?._id, projectId: selectedProject?._id, status: newStatus }
    try {
      const res = await projectStatusChange(obj);
      console.log(res);
      if (res.status === 200) {
        toast({ title: "Project Status.", description: res.data.message });
        setProjectListRefresh(true);

      }
    }
    catch (err) {
      console.log(err);
      toast({ title: "Error", description: err.response.data.message, variant: "destructive" })
    }
  }

  const handleGetProject = async () => {
    if (!user?._id || !user?.companyId?._id) { return }
    try {
      const res = await getProject(user?._id, user?.companyId?._id);
      console.log(res)
      if (res.status === 200) {
        setProjects(res.data);
        setProjectListRefresh(false);
        setIsTaskStatusChangeModalOpen(false);
      }
    }
    catch (err) {
      console.log(err);
      toast({ title: "Error", description: err.response.data.message });
    }
  };
  useEffect(() => {
    handleGetProject();
  }, [projectListRefresh])

  const handleConfirmDelete = async () => {
    console.log(selectedProjectId, user?.companyId?._id, user?._id)
    if (!selectedProjectId || !user?.companyId?._id || !user?._id) return alert("missing fields");
    let obj = { projectId: selectedProjectId, companyId: user?.companyId?._id, adminId: user?._id }
    setIsDeleting(true);
    try {
      const res = await deleteProject(obj);
      console.log(res)
      if (res.status === 200) {
        setProjectListRefresh(true);
        toast({
          title: "Project Deleted.",
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
      <DeleteCard
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title="Confirm Project Deletion"
        message="Are you sure you want to permanently delete this project? All associated tasks and subtasks will be removed and cannot be recovered."
      />
      <ProjectForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} initialData={initialData} setProjectListRefresh={setProjectListRefresh} />
      <ProjectDetailCard isOpen={isProjectDetailOpen} onClose={() => setIsProjectDetailOpen(false)} projectId={selectedProjectId} />
      <TaskStatusChangeModal name={name} task={selectedProject} isOpen={isTaskStatusChangeModalOpen} newStatus={newStatus} setNewStatus={setNewStatus} onConfirm={handleChangeStatus} onClose={() => setIsTaskStatusChangeModalOpen(false)} />
      <div className="flex flex-col min-h-screen bg-gray-50/50 p-3 sm:p-6 space-y-6 max-w-[100vw] sm:max-w-none">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Projects
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage and track your ongoing projects.
            </p>
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={() => { setInitialData(null); setIsFormOpen(true) }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project List</CardTitle>
            <CardDescription>
              All projects with status and due dates.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
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
                  <SelectItem className="cursor-pointer" value="all">All</SelectItem>
                  <SelectItem className="cursor-pointer" value="pending">Pending</SelectItem>
                  <SelectItem className="cursor-pointer" value="active">In Progress</SelectItem>
                  <SelectItem className="cursor-pointer" value="completed">Completed</SelectItem>
                  <SelectItem className="cursor-pointer" value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Start Day</TableHead>
                    <TableHead>End Day</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.length ? (
                    filteredProjects.map((project) => (
                      <TableRow key={project._id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {project.name}
                        </TableCell>
                        <TableCell>{formatDate(project.startDate)}</TableCell>
                        <TableCell>{formatDate(project.endDate)}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(project.priority)}>
                            {project.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status === "active" ? "In_Progress" : (project.status.charAt(0).toUpperCase() + project.status.slice(1))}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => {setSelectedProjectId(project?._id);setIsProjectDetailOpen(true)}} className="flex items-center gap-2 cursor-pointer">
                                <Eye className="h-4 w-4 text-gray-600" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedProject(project); setIsTaskStatusChangeModalOpen(true) }} className="flex items-center gap-2 cursor-pointer">
                                <Filter className="h-4 w-4 text-blue-600" />
                                Change Status
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => {
                                  setInitialData(project);
                                  setIsFormOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4 text-green-600" />
                                Edit
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem onClick={()=>{setSelectedProjectId(project?._id);setIsDeleteDialogOpen(true)}} className="flex items-center gap-2 text-red-600 cursor-pointer">
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        No projects found
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

export default Project;

import React, { useEffect, useState } from 'react';
import { Briefcase, Plus, Search, Users, MoreHorizontal, Edit, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import DepartmentDialog from "@/Forms/DepartmentDialog";
import DeleteCard from "@/components/cards/DeleteCard";
import DepartmentCard from "@/components/cards/DepartmentCard";
import { getDepartments, getEmployees } from "@/services/Service";
import axios from 'axios';
import { useAuth } from "@/contexts/AuthContext";
import { Helmet } from "react-helmet-async";


const departmentColors = [
  'bg-primary/10 text-primary',
  'bg-success/10 text-success',
  'bg-warning/10 text-warning',
  'bg-info/10 text-info',
  'bg-destructive/10 text-destructive',
  'bg-accent text-accent-foreground',
];

const Departments: React.FC = () => {
  const { toast } = useToast();
    const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [showDepartment, setShowDepartment] = useState(false);
  const [departmentList, setDepartmentList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [departmentRefresh, setDepartmentRefresh] = useState(false);
  const [departmentName, setDepartmentName] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<null | any>(null);
  const [selectedDepartmentEmployees, setSelectedDepartmentEmployees] = useState<any[]>([]);

  const filteredDepartments = departmentList.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGetDepartment = async () => {
    try {
      const data = await getDepartments(user?.companyId?._id);
      console.log(data)
      if (Array.isArray(data)) {
        setDepartmentList(data);
        setDepartmentRefresh(false);
      }
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Something went wrong",
      });
    }
  };


  const handleGetEmployees = async () => {
    try {
      const data = await getEmployees(user?.companyId?._id);
      console.log("employee Data:", data);
      if (Array.isArray(data)) {
        setEmployeeList(data);
      }
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Something went wrong",
      });
    }
  };


  useEffect(() => {
    if (!departmentList?.length || departmentRefresh) {
      handleGetDepartment();
      handleGetEmployees();
    }
  }, [departmentRefresh]);

  const handleDeleteClick = (employeeId) => {
    console.log(employeeId)
    setSelectedDepartmentId(employeeId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/departments/deleteDepartment/${selectedDepartmentId}`
        ,{data :  {companyId : user?.companyId?._id}}
      )
      console.log(res)
      if (res.status === 200) {
        setDepartmentRefresh(true);
        toast({
          title: "Department Deleted",
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
    <Helmet>
        <title>Department Page</title>
        <meta name="description" content="This is the home page of our app" />
      </Helmet>
    <div className="space-y-6">
      <DepartmentDialog
        isOpen={isDialogOpen}
        setIsOpen={() => { setIsDialogOpen(false) }}
        setDepartmentRefresh={setDepartmentRefresh}
        initialData={initialData}
        mode={isEditDialogOpen}
      />

      <DeleteCard
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title="Delete Department?"
        message="This Action Will Permanently Delete This Department."
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Briefcase className="w-7 h-7 text-primary" />
            Departments
          </h1>
          <p className="text-muted-foreground">
            Manage company departments and team structure
          </p>
        </div>

        {/* Right: Add Department Button */}
        <Button
          onClick={() => { setInitialData(null); setIsEditDialogOpen(false); setIsDialogOpen(true) }}
          className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </Button>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departments</p>
                <p className="text-xl font-bold">{departmentList?.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Users className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-xl font-bold">{employeeList?.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Users className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg per Dept</p>
                <p className="text-xl font-bold">
                  {Math.round(employeeList?.length / departmentList?.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search departments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredDepartments.map((dept, index) => (
          <Card key={dept._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${departmentColors[index % departmentColors.length]}`}>
                  <Briefcase className="w-6 h-6" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className='cursor-pointer' onClick={() => { setInitialData(dept); setIsEditDialogOpen(true); setIsDialogOpen(true) }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => { handleDeleteClick(dept?._id) }}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h3 className="text-lg font-semibold mb-2">{dept.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{dept.description}</p>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{dept.employeeCount} employees</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDepartmentName(dept.name); // optional if still needed
                    setSelectedDepartment(dept); // pura dept object
                    setSelectedDepartmentEmployees(
                      employeeList.filter((emp) => emp.department === dept.name)
                    );
                    setShowDepartment(true);
                  }}
                >
                  View
                </Button>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showDepartment && selectedDepartment && (
        <DepartmentCard
          departmentData={selectedDepartment} // pura dept object
          employees={selectedDepartmentEmployees} // us dept ke employees
          onClose={() => setShowDepartment(false)}
        />
      )}


      {filteredDepartments.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No departments found.</p>
        </div>
      )}
    </div>
    </>
  );
};

export default Departments;

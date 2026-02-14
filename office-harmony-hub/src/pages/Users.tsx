import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Users as UsersIcon, Plus, Search, MoreHorizontal,ArrowLeft , FileMinus, Award, Mail, FileCheck, Phone, UserPlus, Building2, FileText, Calendar, Edit, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { EmployeeFormDialog } from "@/Forms/EmployeeFormDialog"
import DeleteCard from "@/components/cards/DeleteCard"
import { getEmployees, getAdmins, handleGetPdfLetter, deleteAdmin, updateAdminStatus } from "@/services/Service";
import { useToast } from '@/hooks/use-toast';
import RelieveEmployeeCard from "@/components/cards/RelieveEmployeeCard"
import AdminFormDialog from "@/Forms/AdminFormDialog";
import AdminListCard from "@/components/cards/AdminListCard";
import { Helmet } from "react-helmet-async";
import {formatDate} from "@/services/allFunctions"


const Users: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdminDialog, setIsAdminDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [userList, setUserlist] = useState<any>([]);
  const [employeeListRefresh, setEmployeeListRefresh] = useState(false);
  const [allLetter, setAllLetter] = useState([]);
  const [showRelieve, setShowRelieve] = useState(false);
  const [adminInitialData, setAdminInitialData] = useState(null);
  const [adminListRefresh, setadminListRefresh] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ name: string; url: string, type: "pdf" | "image" } | null>({
    name: "",
    url: "",
    type: "image"
  });
  const [isPreview, setIsPreview] = useState(false);
   const [adminList, setAdminList] = useState([])
  const navigate = useNavigate();
   
  const filteredUsers = userList.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleGetEmployee = async () => {
    if(!user?.companyId?._id){
      toast({title : "Error", description : "Company Id Not Found."})
      return;
    }
    try {
      const data = await getEmployees(user?.companyId?._id);
      console.log(data)
      if (Array.isArray(data)) {
        setUserlist(data);
        setEmployeeListRefresh(false);
      }
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Something went wrong",
      });
    }
  };

   const handleGetAdmins = async () => {
    if(!user?._id){
      toast({title : "Error", description : "User Id Not Found."})
      return;
    }
    try {
      const data = await getAdmins(user?._id);
      console.log(data)
      if (Array.isArray(data?.data?.admins)) {
        setAdminList(data?.data?.admins);
        // setEmployeeListRefresh(false);
      }
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Something went wrong",
      });
    }
  };

  useEffect(()=>{
    if(user?.role === "super_admin"){
      handleGetAdmins();
    }
  },[user, adminListRefresh])


 useEffect(() => {
  if (user?.role !== "super_admin" && (!userList?.length || employeeListRefresh)) {
    handleGetEmployee();
  }
}, [employeeListRefresh, user]);



  const handleDeleteClick = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
         const res = await deleteAdmin(selectedEmployeeId ,user?._id);
         if(res.status===200){
          handleGetAdmins();
          toast({title:"Delete Admin.", description:res.data?.message})
         }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleAdminStatus = async(adminId, status) => {
    try{
      const res = await updateAdminStatus(adminId, user?._id, status);
      if(res.status===200){
        handleGetAdmins();
        toast({title:"Admin Status:-", description:res.data?.message})
      }
    }
     catch(err){
         toast({title:"Error", description:err?.response?.data?.message, variant:"destructive"})
     }
  }


  const getPageTitle = () => {
    if (user?.role === 'super_admin') return 'Manage Admins';
    return 'Manage Employees';
  };
  const getStatusBadge = (status: "ACTIVE" | "RELIEVED" | "ON_HOLD") => {
    // 1️⃣ Background & text color
    const styles: Record<string, string> = {
      ACTIVE: "bg-success/10 text-success text-xs font-medium px-2 py-1 rounded",
      RELIEVED: "bg-destructive/10 text-destructive text-xs font-medium px-2 py-1 rounded",
      ON_HOLD: "bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-1 rounded",
    };

    // 2️⃣ Labels
    const labels: Record<string, string> = {
      ACTIVE: "Active",
      RELIEVED: "Relieved",
      ON_HOLD: "On Hold",
    };

    return (
      <span className={styles[status]}>
        {labels[status]}
      </span>
    );
  };


  const handleGetPreview = (type: string) => {
    const existingLetter = allLetter?.find(
      (letter) => letter.letterType === type
    );
    console.log(existingLetter)
    if (!existingLetter || !existingLetter.pdfData) {
      toast({
        title: "Preview not available",
        description: "This document does not exist.",
        variant: "destructive",
      });
      return;
    }

    const byteCharacters = atob(existingLetter.pdfData);
    const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));
    const blob = new Blob([new Uint8Array(byteNumbers)], {
      type: "application/pdf",
    });

    const url = URL.createObjectURL(blob);

    setPreviewDoc({
      name: existingLetter.letterType,
      url,
      type: "pdf",
    });
    setIsPreview(true);
  };

  const fetchLetters = async () => {
    const letters = await handleGetPdfLetter(selectedEmployeeId);
    setAllLetter(letters); // ya jo bhi state me store karna ho
  };

  useEffect(() => {
    if (selectedEmployeeId && user?.role !==  "super_admin") {
      fetchLetters();
    }
  }, [selectedEmployeeId])


  return (
    <>
    <Helmet>
        <title>{user?.role === "super_admin"?"Admin":"Employee"} Page</title>
        <meta name="description" content="This is the home page of our app" />
      </Helmet>
    <div className="space-y-6">
      <EmployeeFormDialog
        open={isDialogOpen}
        onClose={() => { setIsDialogOpen(false) }}
        isEditMode={isEditDialogOpen}
        initialData={initialData}
        setEmployeeListRefresh={setEmployeeListRefresh}
        selectedDepartmentName={""} //blank hai kyuki y sirf department k case m use hoga
      />

      <AdminFormDialog
        open={isAdminDialog}
        setOpen={() => { setIsAdminDialog(false) }}
        mode={isEditDialogOpen}
        initialData={adminInitialData}
        setadminListRefresh={setadminListRefresh}
      />

      {
        showRelieve && (
          <RelieveEmployeeCard
            onClose={() => setShowRelieve(false)}
            employeeId={selectedEmployeeId}
            setRelieveEmployeeId={setSelectedEmployeeId}
            setEmployeeListRefresh={setEmployeeListRefresh}

          />
        )
      }
      <DeleteCard
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title="Delete Admin?"
        message="This Action Will permanently Soft Delete ya In-active This Admin."
      />

      {isPreview && previewDoc && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">

          {/* Modal Card */}
          <div
            className={`
                  bg-white dark:bg-gray-900
                  ${previewDoc.type === "pdf"
                ? "w-[95vw] sm:w-[700px] md:w-[900px] max-h-[95vh]"
                : "w-[90vw] sm:w-[420px] md:w-[500px] max-h-[85vh]"
              }
                  rounded-xl shadow-lg
                  p-4 sm:p-5
                  relative
                  overflow-hidden
                `}
          >

            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base sm:text-lg font-semibold truncate">
                {previewDoc.name}
              </h3>
              <button
                onClick={() => setIsPreview(false)}
                className="text-xl px-2 hover:opacity-70"
              >
                ✕
              </button>
            </div>

            {/* Preview */}
            <div
              className={`
                  border rounded-md
                  ${previewDoc.type === "pdf"
                  ? "h-[400px] sm:h-[520px] md:h-[600px]"
                  : "h-[220px] sm:h-[300px] md:h-[350px]"
                }
                  flex items-center justify-center
                `}
            >
              {previewDoc.type === "pdf" ? (
                <iframe
                  src={previewDoc.url}
                  className="w-full h-full"
                  title={previewDoc.name}
                />
              ) : (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.name}
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>

            {/* Actions (only for image) */}
            {previewDoc.type === "image" && (
              <div className="flex justify-end gap-3 mt-4">
                <a
                  href={previewDoc.url}
                  download
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                >
                  Download
                </a>
              </div>
            )}
          </div>
        </div>
      )}

{/* Back Button */}
<div className="md:mt-[-20px] md:mb-[-10px]">
  <button
    onClick={() => window.history.back()}
    className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
  >
    <ArrowLeft className="w-5 h-5 text-gray-800 dark:text-white" />
  </button>
</div>


      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        
        {/* Left side: Title + description */}
        <div>
          <h1 className="page-header flex items-center gap-2 text-2xl font-semibold">
            <UsersIcon className="w-7 h-7 text-primary" />
            {getPageTitle()}
          </h1>
          <p className="text-muted-foreground text-sm">
            {user?.role === 'super_admin'
              ? 'Create and manage admin accounts'
              : 'Create and manage employee accounts'}
          </p>
        </div>

        {/* Right side: Add Employee button */}
        {
          user?.role === "super_admin" ?
            <button
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            onClick={() => {setAdminInitialData(null);setIsEditDialogOpen(false);setIsAdminDialog(true); }}
            >
              <Plus className="w-4 h-4" />
              Add Admin
            </button>
            :
            <button
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              onClick={() => {setInitialData(null);setIsEditDialogOpen(false);setIsDialogOpen(true)}}
            >
              <Plus className="w-4 h-4" />
              Add Employee
            </button>
        }


      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredUsers.map((userData) => (
          <Card key={userData._id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/user/${userData._id}`)} >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-primary/10">
                    {userData?.profileImage ? (
                      <img
                        src={userData.profileImage}
                        alt={userData.fullName || "Profile"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-primary">
                        {userData?.fullName?.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold">{userData?.fullName}</h3>
                    {getStatusBadge(userData?.status)}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        setInitialData(userData);
                        setIsEditDialogOpen(true);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer"
                      disabled={userData?.status === "RELIEVED"}
                      onClick={() => { setShowRelieve(true); setSelectedEmployeeId(userData?._id) }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Relieve
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => { setSelectedEmployeeId(userData?._id); handleGetPreview("offer") }}  >
                      <FileText className="w-4 h-4 mr-2" />
                      Offer Letter
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => { setSelectedEmployeeId(userData?._id); handleGetPreview("join"); }}  >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => { setSelectedEmployeeId(userData?._id); handleGetPreview("noc"); }}
                    >
                      <FileCheck className="w-4 h-4 mr-2" />
                      NOC
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => { setSelectedEmployeeId(userData?._id); handleGetPreview("recommendation"); }}
                    >
                      <Award className="w-4 h-4 mr-2" />
                      Recommendation
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => { setSelectedEmployeeId(userData?._id); handleGetPreview("relieve"); }}
                    >
                      <FileMinus className="w-4 h-4 mr-2" />
                      Relieving Letter
                    </DropdownMenuItem>
                  </DropdownMenuContent>

                </DropdownMenu>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{userData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{userData.contact}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span>{userData.department}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(userData.joinDate)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
 {/* onClick={() => {setAdminInitialData(null);setIsEditDialogOpen(false);setIsAdminDialog(true); }} */}

     { user?.role === "super_admin" ? <AdminListCard handleStatusChange={handleAdminStatus} handleDeleteClick={handleDeleteClick} adminList={adminList} setAdminInitialData={setAdminInitialData} setIsEditDialogOpen={setIsEditDialogOpen} setIsAdminDialog={setIsAdminDialog} /> : []}

   {(
  user?.role === "super_admin"
    ? adminList.length === 0
    : filteredUsers.length === 0
) && (
  <div className="text-center py-12">
    <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
    <p className="text-muted-foreground">
      No users found matching your search.
    </p>
  </div>
)}


    </div>
    </>
  );
};

export default Users;

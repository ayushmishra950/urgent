import { useRef, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Loader2, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useToast } from '@/hooks/use-toast';
import { getDepartments } from "@/services/Service";
import { useAuth } from "@/contexts/AuthContext";


interface EmployeeFormDialogProps {
  open: boolean;
  onClose: () => void;
  isEditMode?: boolean;
  initialData: any; // employee object
  setEmployeeListRefresh: (open: boolean) => void;
}

interface Department {
  _id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export const EmployeeFormDialog: React.FC<EmployeeFormDialogProps> = ({
  open,
  onClose,
  isEditMode = false,
  initialData,
  setEmployeeListRefresh
}) => {
  console.log(initialData)
  // ----------------- STATE -----------------
  const { user } = useAuth();
  const [formStep, setFormStep] = useState(1);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [categories, setCategories] = useState<Department[]>([]);
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // previews
  const [imagePreview, setImagePreview] = useState("");
  const [salarySlipPreview, setSalarySlipPreview] = useState("");
  const [aadhaarPreview, setAadhaarPreview] = useState("");
  const [panPreview, setPanPreview] = useState("");
  const [bankPreview, setBankPreview] = useState("");

  // refs
  const profileRef = useRef<HTMLInputElement>(null);
  const salarySlipRef = useRef<HTMLInputElement>(null);
  const aadhaarRef = useRef<HTMLInputElement>(null);
  const panRef = useRef<HTMLInputElement>(null);
  const bankRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const today = new Date().toISOString().split("T")[0];
  const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return "";

    // Case 1: ISO date from backend (2026-01-09T00:00:00.000Z)
    if (dateStr.includes("T")) {
      return new Date(dateStr).toISOString().slice(0, 10);
    }

    // Case 2: Already in YYYY-MM-DD (from input[type=date])
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    // Case 3: Slash format (DD/MM/YYYY or MM/DD/YYYY)
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      let day, month, year;

      if (Number(parts[0]) > 12) {
        [day, month, year] = parts; // DD/MM/YYYY
      } else {
        [month, day, year] = parts; // MM/DD/YYYY
      }

      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    return "";
  };

  //--------------------- Get Employees Department (Category)---------------------------------------
  const handleGetDepartment = async () => {
    try {
      const data = await getDepartments(user?.companyId?._id);
      setCategories(data)
    } catch (err) {
      console.error("Error adding department:", err);
      toast({
        title: 'Error',
        description: `Something Went Wrong :- ${err.response?.data?.message}`,
      });
    }
  };
  useEffect(() => {
    if (initialData) {
      setCurrentEmployee(initialData);
    }
    else {
      setCurrentEmployee(null);
    }
  }, [initialData])

  useEffect(() => {
    if (user?.role === "admin") {
      handleGetDepartment();
    }
  }, [])

  useEffect(() => {
    if (!open) return;
    // reset previews
    setImagePreview(initialData?.profileImage);
    setSalarySlipPreview(initialData?.documents?.salarySlip);
    setAadhaarPreview(initialData?.documents?.aadhaar);
    setPanPreview(initialData?.documents?.panCard);
    setBankPreview(initialData?.documents?.bankPassbook);
    setFormStep(1);
  }, [open]);

  // ----------------- RESET FORM -----------------
  const resetForm = () => {
    setCurrentEmployee(null);
    setFormStep(1);
    setImagePreview("");
    setSalarySlipPreview("");
    setAadhaarPreview("");
    setPanPreview("");
    setBankPreview("");
  };

  // ----------------- SAVE HANDLER -----------------

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      setIsLoading(true);

      if (!token) {
        toast({ title: "Error", description: "No token found. Please login again.", variant: "destructive" });
        return;
      }

      // 🔴 REQUIRED FIELDS WITH LABELS
      const requiredFields = [
        { key: "fullName", label: "Full Name" },
        { key: "email", label: "Email" },
        { key: "department", label: "Department" },
        { key: "designation", label: "Designation" },
        { key: "contact", label: "Contact Number" },
        { key: "joinDate", label: "Join Date" },
        { key: "monthSalary", label: "Monthly Salary" },
        { key: "employeeType", label: "Employee Type" },
        { key: "position", label: "Position" },
        { key: "roleResponsibility", label: "Role Responsibility" },
        { key: "lpa", label: "LPA" },
      ];

      // find first missing field
      const missingField = requiredFields.find(
        ({ key }) =>
          !currentEmployee?.[key] ||
          currentEmployee[key]?.toString().trim() === ""
      );

      if (missingField) {
        toast({
          title: "Validation Error",
          description: `${missingField.label} is required`,
          variant: "destructive",
        });
        return;
      }

      // if (!user?.id && user?.role !== "admin") {
      //   toast({ title: "Error", description: "you have did not permission to change Profile Page. ya no id found", variant: "destructive" });
      // }
      console.log(currentEmployee)
      const formData = new FormData();
      formData.append("userId", user?._id)
      formData.append("companyId", user?.companyId?._id || "");
      formData.append("password", currentEmployee?.password || "");
      formData.append("id", currentEmployee?.id || "");
      formData.append("fullName", currentEmployee?.fullName || "");
      formData.append("email", currentEmployee?.email || "");
      formData.append("department", currentEmployee?.department || "");
      formData.append("designation", currentEmployee?.designation || "");
      formData.append("remarks", currentEmployee?.remarks || "");
      formData.append("contact", currentEmployee?.contact || "");
      formData.append("joinDate", currentEmployee?.joinDate || "");
      formData.append("monthSalary", String(currentEmployee?.monthSalary || 0));
      formData.append("employeeType", currentEmployee?.employeeType || "");
      formData.append("position", currentEmployee?.position || "");
      formData.append("roleResponsibility", currentEmployee?.roleResponsibility || "");
      formData.append("lpa", String(currentEmployee?.lpa || 0));

      if (currentEmployee?.profileImage) formData.append("profileImage", currentEmployee.profileImage);
      if (currentEmployee?.documents?.SalarySlip?.url instanceof File) {
        formData.append("salarySlip", currentEmployee.documents.SalarySlip.url);
      }

      // Aadhaar
      if (currentEmployee?.documents?.Aadhaar?.url instanceof File) {
        formData.append("aadhaar", currentEmployee.documents.Aadhaar.url);
      }

      // PAN
      if (currentEmployee?.documents?.PAN?.url instanceof File) {
        formData.append("panCard", currentEmployee.documents.PAN.url);
      }

      // Bank Passbook
      if (currentEmployee?.documents?.BankPassbook?.url instanceof File) {
        formData.append("bankPassbook", currentEmployee.documents.BankPassbook.url);
      }

      let response;

      if (isEditMode) {
        response = await axios.put(`${import.meta.env.VITE_API_URL}/api/employees/updateEmployee/${currentEmployee._id}`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        toast({ title: "Employee Updated", description: response.data.message || "Employee updated successfully" });
      } else {
        response = await axios.post(`${import.meta.env.VITE_API_URL}/api/employees/add`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        toast({ title: "Employee Added", description: response.data.message || "Employee added successfully" });
      }
      setEmployeeListRefresh(true);
      onClose();
      resetForm();
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.response?.data?.message || "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileProfileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "profileImage",
    setPreview: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCurrentEmployee(prev => ({
      ...prev,
      [field]: file // yahan file ya future me file path string
    }));

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(URL.createObjectURL(file));
    }
  };
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "Aadhaar" | "PAN" | "BankPassbook" | "SalarySlip",
    setPreview: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCurrentEmployee(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: {
          url: file,              // 👈 sirf key ka naam "url" hai
          fileName: file.name,
          fileType: file.type
        }
      }
    }));

    // Preview logic (frontend only)
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview("PDF_SELECTED");
    }
  };

  console.log(currentEmployee?.profileImage)

  // ----------------- JSX -----------------
  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          onClose();
          resetForm();
        }
      }}
    >
      <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        {/* HEADER */}
        <form onSubmit={handleSave}>
        <DialogHeader className="pb-4 sm:pb-6">
          <DialogTitle className="text-xl sm:text-2xl">
            {isEditMode ? "Edit Employee" : "Add New Employee"}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Step {formStep} of 2 • {formStep === 1 ? "Basic Details" : "Employment & Documents"}
          </DialogDescription>
        </DialogHeader>

        {/* ================= STEP 1 ================= */}
        {formStep === 1 && (
          <div className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name - Full width */}
              <div className="sm:col-span-2 space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={currentEmployee?.fullName}
                  onChange={(e) =>
                    setCurrentEmployee({ ...currentEmployee, fullName: e.target.value })
                  }
                  placeholder="Amit Kumar Sharma"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={currentEmployee?.email}
                  onChange={(e) =>
                    setCurrentEmployee({ ...currentEmployee, email: e.target.value })
                  }
                  placeholder="amit@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative space-y-2">
                <Label>Password *</Label>

                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={isEditMode === true ? null : currentEmployee?.password}
                    disabled={isEditMode === true}
                    onChange={(e) =>
                      setCurrentEmployee({ ...currentEmployee, password: e.target.value })
                    }
                    placeholder="Enter password"
                    className={`w-full pr-10 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 
                   ${isEditMode ? "bg-gray-100 cursor-not-allowed" : "focus:ring-blue-500"}`}
                  />

                  {!isEditMode && (
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
                {/* 🔴 Small helper text */}
                {isEditMode && (
                  <p className="text-xs text-gray-500">
                    Password cannot be changed in edit mode
                  </p>
                )}
              </div>
            </div>


            {/* Department & Designation */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label>Department *</Label>

                <Select
                  value={currentEmployee?.department || ""}
                  onValueChange={(val) =>
                    setCurrentEmployee({ ...currentEmployee, department: val })
                  }
                  disabled={categories?.length === 0} // optional: disable select if no data
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((dept) => (
                      <SelectItem key={dept._id} value={dept?.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 🔴 Conditional message if no departments */}
                {categories?.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Please add department first
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input
                  value={currentEmployee?.designation || ""}
                  onChange={(e) => setCurrentEmployee({ ...currentEmployee, designation: e.target.value })}
                  placeholder="Software Developer"
                  required
                />
              </div>
            </div>

            {/* Contact & Salary */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label>Contact</Label>
                <Input
                  value={currentEmployee?.contact || ""}
                  onChange={(e) => setCurrentEmployee({ ...currentEmployee, contact: e.target.value })}
                  placeholder="+91 98765 43210"
                  maxLength={10}
                  minLength={10}
                  pattern="[0-9]{10}"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Monthly Salary</Label>
                <Input
                  type="number"
                  value={currentEmployee?.monthSalary ?? ""}
                  onChange={(e) => setCurrentEmployee({ ...currentEmployee, monthSalary: Number(e.target.value) })}
                  placeholder="48000"
                  required
                />
              </div>
            </div>

            {/* Joining Date & Profile Image */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label>Joining Date</Label>
                <Input
                  type="date"
                  min={today}   // 🔴 past disable
                  disabled={isEditMode === true}
                  value={formatDateForInput(currentEmployee?.joinDate) || ""}
                  onChange={(e) => setCurrentEmployee({ ...currentEmployee, joinDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 relative">
                <Label>Profile Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  ref={profileRef}
                  onChange={(e) => handleFileProfileChange(e, "profileImage", setImagePreview)}
                />
                {imagePreview && (
                  <div className="relative w-24 h-24 mt-2 border rounded overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setCurrentEmployee({ ...currentEmployee, profileImage: undefined });
                        setImagePreview("");
                        if (profileRef.current) profileRef.current.value = "";
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 pt-5 border-t">
              <Button type="button" variant="outline" onClick={() => onClose()}>
                Cancel
              </Button>
              <Button
                onClick={() => setFormStep(2)}
                disabled={!currentEmployee?.fullName || !currentEmployee?.email || !currentEmployee?.department || !currentEmployee?.designation || !currentEmployee?.contact || !currentEmployee?.joinDate || !currentEmployee?.profileImage}
              >
                Next →
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 2 ================= */}
        {formStep === 2 && (
          <div className="space-y-5 sm:space-y-6">
            {/* Employee Type & Position */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label>Employee Type</Label>
                <Select
                  value={currentEmployee?.employeeType?.toLowerCase() || ""}
                  onValueChange={(val) => setCurrentEmployee({ ...currentEmployee, employeeType: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Input
                  value={currentEmployee?.position || ""}
                  onChange={(e) => setCurrentEmployee({ ...currentEmployee, position: e.target.value })}
                  placeholder="Senior Frontend Developer"
                  required
                />
              </div>
            </div>

            {/* Role & LPA */}
            <div className="space-y-2">
              <Label>Role & Responsibilities</Label>
              <textarea
                rows={3}
                className="w-full border rounded p-2 resize-none"
                value={currentEmployee?.roleResponsibility || ""}
                onChange={(e) => setCurrentEmployee({ ...currentEmployee, roleResponsibility: e.target.value })}
                placeholder="Key responsibilities..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label>LPA(Last Year Package)</Label>
              <Input
                type="number"
                value={currentEmployee?.lpa || ""}
                onChange={(e) => setCurrentEmployee({ ...currentEmployee, lpa: Number(e.target.value) })}
                placeholder="7.2"
                required
              />
            </div>

            {/* Documents */}
            <div className="space-y-3">
              <Label className="font-medium">Documents</Label>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/** Salary Slip */}
                <FileInput
                  label="Salary Slip"
                  ref={salarySlipRef}
                  file={
                    currentEmployee?.salarySlip ||
                    currentEmployee?.documents?.SalarySlip?.url
                  }
                  preview={salarySlipPreview}
                  setPreview={setSalarySlipPreview}
                  onChange={(e) => handleFileChange(e, "SalarySlip", setSalarySlipPreview)}
                />
                {/** Aadhaar */}
                <FileInput
                  label="Aadhaar Card"
                  ref={aadhaarRef}
                  file={currentEmployee?.documents?.Aadhaar?.url}
                  preview={aadhaarPreview}
                  setPreview={setAadhaarPreview}
                  onChange={(e) => handleFileChange(e, "Aadhaar", setAadhaarPreview)}
                />
                {/** PAN */}
                <FileInput
                  label="PAN Card"
                  ref={panRef}
                  file={currentEmployee?.documents?.PAN?.url}
                  preview={panPreview}
                  setPreview={setPanPreview}
                  onChange={(e) => handleFileChange(e, "PAN", setPanPreview)}
                />
                {/** Bank Passbook */}
                <FileInput
                  label="Bank Passbook"
                  ref={bankRef}
                  file={currentEmployee?.documents?.BankPassbook?.url}
                  preview={bankPreview}
                  setPreview={setBankPreview}
                  onChange={(e) => handleFileChange(e, "BankPassbook", setBankPreview)}
                />
              </div>
              <div className="w-full">
                <Label>Remark</Label>
                <textarea
                  rows={3}
                  className="w-full border rounded p-2 resize-none"
                  value={currentEmployee.remarks || ""}
                  onChange={(e) => setCurrentEmployee({ ...currentEmployee, remarks: e.target.value })}
                  placeholder="Add a remark..."
                  required
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-between pt-5 border-t sticky bottom-0 bg-background">
              <Button type="button" variant="outline" onClick={() => setFormStep(1)}
              >
                ← Back
              </Button>
              <Button
                disabled={isLoading || !currentEmployee?.employeeType || !currentEmployee?.position || !currentEmployee?.roleResponsibility || !currentEmployee?.lpa || !currentEmployee?.remarks}
                // onClick={handleSave}
                 className="flex items-center gap-2">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : ""}
                {isLoading ? (isEditMode ? "Updating..." : "Submitting...") : isEditMode ? "Update Employee" : "Submit Employee"}
              </Button>
            </div>
          </div>
        )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ----------------- Reusable FileInput Component -----------------
interface FileInputProps {
  label: string;
  ref: React.Ref<HTMLInputElement>;
  file: any;
  preview: string;
  setPreview: React.Dispatch<React.SetStateAction<string>>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}


const FileInput: React.FC<FileInputProps> = ({ label, ref, file, preview, setPreview, onChange }) => (

  <div className="space-y-1 relative">
    <Label className="text-xs sm:text-sm text-muted-foreground">{label}</Label>
    <Input type="file" accept=".pdf,image/*" ref={ref} onChange={onChange} />
    {preview && (
      <div className="relative w-24 h-24 mt-1 border rounded overflow-hidden">
        {preview.endsWith(".pdf") ? (
          <div className="flex items-center justify-center w-full h-full bg-gray-200 text-sm text-gray-600">
            PDF
          </div>
        ) : (
          <img src={preview} alt={`${label} Preview`} className="w-full h-full object-cover" />
        )}
        <button
          type="button"
          className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-red-600 hover:bg-red-50"
          onClick={() => {
            setPreview("");
            if (ref && "current" in ref && ref.current) ref.current.value = "";
          }}
        >
          ×
        </button>
      </div>
    )}
  </div>
);

import React, { useState, useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"; // apne project ka Dialog component path
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface DepartmentData {
  _id: string;
  name: string;
  description: string;
}

interface DepartmentDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  setDepartmentRefresh: (open: boolean) => void;
  initialData?: DepartmentData;
  mode?: boolean;
}

const DepartmentDialog: React.FC<DepartmentDialogProps> = ({
  isOpen,
  setIsOpen,
  setDepartmentRefresh,
  initialData,   // { name, description } for edit
  mode = false,       // "add" or "edit"
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (mode === true && initialData) {
      setName(initialData?.name || "");
      setDescription(initialData?.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [initialData, mode, isOpen]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name || description) {
      toast({ title: "Error", description: "All Fields Are Required." })
      return;
    }

    else if (!user?.companyId?._id) {
      toast({ title: "Error", description: "CompanyId Not Found." })
      return;
    }

    const obj = {
      name: name,
      description: description,
      companyId: user?.companyId?._id,
    };
    console.log("Submitting Department:", obj);
    try {
      let res;

      if (mode === true) {
        // 🔄 UPDATE API
        res = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/departments/updateDepartment/${initialData?._id}`,
          obj
          // {
          //   headers: {
          //     Authorization: `Bearer ${localStorage.getItem("token")}`,
          //   },
          // }
        );
      } else {
        // ➕ ADD API
        res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/departments/add`,
          obj
          // {
          //   headers: {
          //     Authorization: `Bearer ${localStorage.getItem("token")}`,
          //   },
          // }
        );
      }

      if (res.status === 200 || res.status === 201) {
        toast({
          title: mode ? "Department Updated." : "Department Added.",
          description: res?.data?.message,
        });

        setDepartmentRefresh(true);
        setIsOpen(false);
      }
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Something went wrong",
      });
    }
    finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === false ? "Create Department" : "Edit Department"}</DialogTitle>
          <DialogDescription>
            {mode === false
              ? "Add a new department to your organization."
              : "Edit the department details."}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Department Name</Label>
            <Input
              id="name"
              placeholder="e.g., Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the department's function"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name || !description}>
              {isLoading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Loader2 className="spin" />
                  Please wait
                </span>
              ) : (
                mode === false ? "Create" : "Update"
              )}
            </Button>          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentDialog;

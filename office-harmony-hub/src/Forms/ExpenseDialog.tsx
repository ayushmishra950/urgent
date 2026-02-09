import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { getExpenseCategories } from "@/services/Service";
import { useToast } from '@/hooks/use-toast';
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";


const categories = [
  { _id: 'cat1', name: 'Office Supplies' },
  { _id: 'cat2', name: 'Travel' },
  { _id: 'cat3', name: 'Food & Beverages' },
  { _id: 'cat4', name: 'Utilities' },
  { _id: 'cat5', name: 'Equipment' },
  { _id: 'cat6', name: 'Miscellaneous' },
];

const ExpenseDialog = ({
  isOpen,
  onOpenChange,
  isEditMode,
  initialData,
  setExpenseListRefresh
}) => {
  // Reset form when dialog closes (optional)
  const { user } = useAuth();
  const { toast } = useToast();
  const [categoriesList, setCategoriesList] = useState([]);
  const [expense, setExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const formatDateForInput = (date: string | Date | null | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  };



  useEffect(() => {
    if (initialData) {
      setExpense(initialData);
    }
    else {
      setExpense({})
    }
  }, [isOpen, initialData, isEditMode, setExpense]);


  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!expense?.date || !expense?.amount || !expense?.category) {
      toast({ title: "Validation Error", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      let res;

      if (isEditMode === true) {
        // ===== UPDATE (PUT) =====
        res = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/expenses/updateExpense/${initialData._id}`,
          { ...expense, companyId: user?.companyId?._id,userId:user?._id }
        );
      } else {
        // ===== CREATE (POST) =====
        res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/expenses/add`,
          { ...expense, companyId: user?.companyId?._id, userId:user?._id }
        );
      }
      if (res?.status === 201) {

        toast({ title: "Expense Added.", description: res?.data?.message });
        onOpenChange(false);
        setExpenseListRefresh(true);
      }
      else if (res?.status === 200) {
        toast({ title: "Expense Updated.", description: res?.data?.message });
        onOpenChange(false);
        setExpenseListRefresh(true);
      }
      else {
        toast({ title: "Error", description: res?.data?.message || "Something went wrong", variant: "destructive" });
      }

    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: err?.response?.data?.message || "Something went wrong", variant: "destructive", });
    }
    finally {
      setIsLoading(false);
    }
  };



  const handleGetCategory = async () => {
    try {
      const res = await getExpenseCategories(user?.companyId?._id);
      if (res) { setCategoriesList(res); }
    } catch (err) {
      console.log("Error fetching categories:", err);
      toast({ title: "Error", description: "Failed to fetch categories", variant: "destructive" });
    }
  };

  useEffect(() => {
    handleGetCategory();
  }, []);



  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg">
        <form onSubmit={handleSave}>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Expense" : "Record New Expense"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the expense details below."
              : "Enter the expense details."}
          </DialogDescription>
        </DialogHeader>

        {/* FORM */}
        <div className="grid gap-4 py-4">
          {/* Date & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                min={today}   // 🔴 past disable
                value={formatDateForInput(expense?.date)}
                onChange={(e) =>
                  setExpense({ ...expense, date: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Amount (₹) *</Label>
              <Input
                type="number"
                value={expense?.amount ?? ""}
                onChange={(e) =>
                  setExpense({
                    ...expense,
                    amount: Number(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          {/* Category & Paid By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>

              <Select
                value={expense?.category || ""}
                onValueChange={(value) =>
                  setExpense({ ...expense, category: value })
                }
                disabled={categoriesList?.length === 0} // optional: select disable bhi kar sakte ho
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesList?.map((cat) => (
                    <SelectItem key={cat._id} value={cat.name}>
                      {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 🔴 Conditional message */}
              {categoriesList?.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Please add a category first
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Paid By</Label>
              <Input
                value={expense?.paidBy || ""}
                onChange={(e) =>
                  setExpense({ ...expense, paidBy: e.target.value })
                }
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={expense?.notes || ""}
              onChange={(e) =>
                setExpense({ ...expense, notes: e.target.value })
              }
              placeholder="Add any additional details..."
            />
          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            // onClick={handleSave}
            disabled={isLoading || !expense?.date || !expense?.amount || !expense?.category || !expense?.paidBy || !expense?.notes}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isEditMode ? "Updating..." : "Saving..."}
              </>
            ) : (
              isEditMode ? "Update Expense" : "Add Expense"
            )}
          </Button>

          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialog;

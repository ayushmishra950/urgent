
import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Trash2, Download, Filter, Edit, Eye, X,ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import CategoryDialog from "@/Forms/CategoryDialog";
import ExpenseDialog from "@/Forms/ExpenseDialog";
import DeleteCard from "@/components/cards/DeleteCard";
import { getExpenseCategories, getExpenses, generatePDF } from "@/services/Service";
import axios from 'axios';
import { useAuth } from "@/contexts/AuthContext";
import { Helmet } from "react-helmet-async";


const months = Array.from({ length: 12 }, (_, i) => {
  const date = new Date(0, i);
  return {
    value: String(i + 1).padStart(2, "0"),
    label: date.toLocaleString("default", { month: "long" }),
  };
});

const generateYears = (numPastYears = 5) => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i <= numPastYears; i++) {
    years.push((currentYear - i).toString());
  }
  return years;
};

const years = generateYears(5);
const currentYear = new Date().getFullYear().toString();

export default function Expenses() {
    const { user } = useAuth();

  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const[initialCategoryData, setInitialCategoryData] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedExpenseId, setSelectedExpenseId] = useState(null);
    const[initialData, setInitialData] = useState(null);
    const [categoriesList, setCategoriesList] = useState([]);
    const [categoryListRefresh, setCategoryListRefersh] = useState(false);
  const [expenseListRefresh, setExpenseListRefresh] = useState(false);
  const [expenseList, setExpenseList] = useState([]);
  const { toast } = useToast();

  const handleGetCategory = async() => {
    try {
    const res = await getExpenseCategories(user?.companyId?._id);
    if(res)
    {
      setCategoriesList(res);  setCategoryListRefersh(false);
    }
  } catch (err) {
    console.log("Error fetching categories:", err);
    toast({ title: "Error", description: "Failed to fetch categories", variant: "destructive"});
  }
  };

  const handleGetExpenses = async() => {
    try {
    const res = await getExpenses(user?.companyId?._id);
    console.log("Expenses Fetched:", res);
    if(res)
    {
      setExpenseList(res);  setExpenseListRefresh(false);
    }
  } catch (err) {
    console.log("Error fetching expenses:", err);
    toast({ title: "Error", description: "Failed to fetch expenses", variant: "destructive"});
  }
  };

  useEffect(() => {
    if(categoryListRefresh || categoriesList.length === 0){
    handleGetCategory();
    }
  }, [categoryListRefresh]);

  useEffect(() => {
     if(expenseListRefresh || expenseList.length === 0){
    handleGetExpenses();
    }
  }, [expenseListRefresh, expenseList.length]);

  
  const handleDeleteClick = (expenseId) => {
    setSelectedExpenseId(expenseId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if(!selectedExpenseId) {toast({ title: "Error", description: "Expense ID not found.", variant: "destructive" }); return; }
    setIsDeleting(true);
    try {
        const res = await axios.delete( `${import.meta.env.VITE_API_URL}/api/expenses/deleteExpense/${selectedExpenseId}`,{data : {companyId : user?.companyId?._id}});
        if(res?.status === 200){
          toast({ title: "Expense Deleted.", description: res?.data?.message });
          setExpenseListRefresh(true);
        } else {
          toast({ title: "Error", description: res?.data?.message || "Failed to delete expense", variant: "destructive" });
        }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to delete expense", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };
  console.log(expenseList)

  const filteredExpenses = useMemo(() => {
    return expenseList?.filter(exp => {
      const expDate = new Date(exp.date);

      const matchMonth =
        selectedMonth === 'all'
          ? true
          : expDate.getMonth() + 1 === Number(selectedMonth);

      const matchYear =
        selectedYear === 'all'
          ? true
          : expDate.getFullYear() === Number(selectedYear);

      const matchCategory =
        selectedCategory === 'all' ||
        exp.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchMonth && matchYear && matchCategory;
    });
  }, [expenseList, expenseListRefresh, selectedMonth, selectedYear, selectedCategory]);

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleExportPDF = () => {
  try {
    generatePDF(filteredExpenses);
    toast({ title: "Expense PDF Exported", description: "Expense record successfully exported as PDF." });
  } catch (err) {
    console.error("PDF Export Error:", err);
    toast({ title: "Export Failed", description: "Failed to export expense record. Please try again.", variant: "destructive", });
  }
};

  const clearFilters = () => {
    setSelectedMonth('all');
    setSelectedYear('2025');
    setSelectedCategory('all');
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Office Supplies': 'bg-blue-100 text-blue-800',
      'Utilities': 'bg-purple-100 text-purple-800',
      'Travel': 'bg-green-100 text-green-800',
      'Food & Beverages': 'bg-orange-100 text-orange-800',
      'Equipment': 'bg-cyan-100 text-cyan-800',
      'Maintenance': 'bg-pink-100 text-pink-800',
      'Miscellaneous': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
    <Helmet>
        <title>Expense Page</title>
        <meta name="description" content="This is the home page of our app" />
      </Helmet>
    <div className="space-y-4 sm:space-y-6">
      <CategoryDialog
         isOpen={isCategoryDialogOpen}
         onOpenChange={setIsCategoryDialogOpen}
         initialData={initialCategoryData}
        setCategoryListRefersh={setCategoryListRefersh}
         mode={isEditMode}
      />

       <ExpenseDialog
         isOpen={isDialogOpen}
         onOpenChange={setIsDialogOpen}
         initialData={initialData}
        setExpenseListRefresh={setExpenseListRefresh}
         isEditMode={isEditMode}
      />

      <DeleteCard
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title="Delete Expense?"
        message="This Action Will permanently Delete This Expense."
      />

     <div className="md:mt-[-20px] md:mb-[-10px]">
       <button
         onClick={() => window.history.back()}
         className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
       >
         <ArrowLeft className="w-5 h-5 text-gray-800 dark:text-white" />
       </button>
     </div>

      <Card className="shadow-md">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              Filter Expenses
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">

              <div className="relative group w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 w-full sm:w-auto flex items-center justify-center whitespace-nowrap"
                  onClick={handleExportPDF}
                >
                  <Download className="h-4 w-4" />
                  <span>Export PDF</span>
                </Button>
              </div>

              <div className="relative group w-full sm:w-auto">
                <Button
                  size="sm"
                  className="gap-1.5 w-full sm:w-auto flex justify-center sm:justify-center"
                  onClick={() => {setInitialCategoryData(null);setIsEditMode(false);setIsCategoryDialogOpen(true);}}
                >
                  <Plus className="h-4 w-4" />
                  <span className="ml-1 inline whitespace-nowrap">Add Category</span>
                </Button>
              </div>

              <div className="relative group w-full sm:w-auto">
                <Button
                  size="sm"
                  className="gap-1.5 w-full sm:w-auto flex justify-center sm:justify-center"
                  onClick={() => {setInitialData(null);setIsEditMode(false);setIsDialogOpen(true);}}
                >
                  <Plus className="h-4 w-4" />
                  <span className="ml-1 inline whitespace-nowrap">Add Expense</span>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoriesList?.map(cat => (
                  <SelectItem key={cat._id} value={cat.name}>{cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters} className="w-full">
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Card className="shadow-md flex-1 bg-blue-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm">Total Expenses</p>
            <p className="text-xl sm:text-3xl font-bold">
              ₹{totalAmount.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md flex-1">
          <CardContent className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground">Records</p>
            <p className="text-xl sm:text-3xl font-bold text-foreground">{filteredExpenses.length}</p>
          </CardContent>
        </Card>

        <Card className="shadow-md flex-1">
          <CardContent className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground">Avg Expense</p>
            <p className="text-xl sm:text-3xl font-bold text-foreground">
              ₹{filteredExpenses.length ? Math.round(totalAmount / filteredExpenses.length).toLocaleString() : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Table */}
      <Card className="shadow-md hidden sm:block">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            Expense Records
            <Badge variant="secondary">{filteredExpenses.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Paid By</TableHead>
                  <TableHead className="hidden lg:table-cell">Notes</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="text-sm">
                      {new Date(expense.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                        {expense.category}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">₹{expense.amount.toLocaleString()}</TableCell>
                    <TableCell className="hidden md:table-cell">{expense.paidBy}</TableCell>
                    <TableCell className="hidden lg:table-cell max-w-xs truncate">{expense.notes || "-"}</TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit (disabled in demo)"
                        className="hover:bg-blue-600 group"
                       onClick={() => {setInitialData(expense);setIsEditMode(true);setIsDialogOpen(true);}}

                      >
                        <Edit className="h-4 w-4 text-amber-600 group-hover:text-white" />
                      </Button>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete (disabled in demo)"
                        className="hover:bg-blue-600 group"
                        onClick={()=>{handleDeleteClick(expense?._id)}}
                      >
                        <Trash2 className="h-4 w-4 text-destructive group-hover:text-white" />
                      </Button>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile View */}
      <div className="sm:hidden space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-foreground">Expense Records</h2>
          <Badge variant="secondary">{filteredExpenses.length}</Badge>
        </div>
        {filteredExpenses.map((expense) => (
          <Card key={expense.id} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                      {expense.category}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-foreground truncate max-w-[200px]">
                    {expense.notes}
                  </p>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(expense.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => {setInitialData(expense);setIsEditMode(true);setIsDialogOpen(true);}}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={()=>{handleDeleteClick(expense?._id)}}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </>
  );
}
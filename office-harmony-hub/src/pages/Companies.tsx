import React, { useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Company } from '@/types';
import CompanyFormDialog from "@/Forms/CompanyFormDialog";
import { getCompanys } from "@/services/Service";
import { useAuth } from "@/contexts/AuthContext";
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import DeleteCard from "@/components/cards/DeleteCard";

const mockCompanies: Company[] = [
  { id: '1', name: 'TechCorp Inc.', address: '123 Silicon Valley, CA 94025', email: 'contact@techcorp.com', phone: '+1 555-0100', createdAt: '2020-01-15' },
  { id: '2', name: 'Global Solutions Ltd.', address: '456 Business Park, NY 10001', email: 'info@globalsolutions.com', phone: '+1 555-0101', createdAt: '2019-06-20' },
  { id: '3', name: 'Innovation Labs', address: '789 Tech Hub, TX 75001', email: 'hello@innovationlabs.com', phone: '+1 555-0102', createdAt: '2021-03-10' },
  { id: '4', name: 'Digital Dynamics', address: '321 Cloud Street, WA 98101', email: 'support@digitaldynamics.com', phone: '+1 555-0103', createdAt: '2022-09-05' },
];

const Companies: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [refreshCompanyList, setRefreshCompanyList] = useState(false);
  const [companyList, setCompanyList] = useState([])
  const [mode, setMode] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const filteredCompanies = companyList.filter(
    (company) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.address.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleDeleteClick = (companyId) => {
    console.log(companyId)
    setSelectedCompanyId(companyId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/company/${selectedCompanyId}`)
      console.log(res)
      if (res.status === 200) {
        setRefreshCompanyList(true);
        toast({
          title: "Company Deleted",
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

  const handleGetCompany = async () => {
    try {
      const res = await getCompanys(user?._id);
      console.log(res)
      if (res.status === 200) {
        setRefreshCompanyList(false);
        setCompanyList(Array.isArray(res.data) ? res.data : []);

      }
    }
    catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    handleGetCompany()
  }, [refreshCompanyList])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side */}
        <div>
          <h1 className="page-header flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary" />
            Companies
          </h1>
          <p className="text-muted-foreground">
            Manage all registered companies in the system
          </p>
        </div>

        {/* Right side button */}
        <Button className="self-start sm:self-auto" onClick={() => { setInitialData(null); setMode(false); setIsDialogOpen(true) }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </Button>

        {/* Dialog */}
        <CompanyFormDialog
          open={isDialogOpen}
          setOpen={setIsDialogOpen}
          initialData={initialData}
          onSuccess={setRefreshCompanyList}
          mode={mode}
        />

        <DeleteCard
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
          title="Delete Company?"
          message="This Action Will Permanently Delete This Company."
        />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 justify-center">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-md transition-shadow max-w-lg mx-auto">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                    <img
                      src={company.logo} // agar logo na ho to default
                      alt={company.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{company.name}</h3>
                      {/* Active / Inactive Badge */}
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${company.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                      >
                        {company.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Since {new Date(company.createdAt).getFullYear()}
                    </p>
                  </div>

                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="cursor-pointer" onClick={() => { setInitialData(company); setMode(true); setIsDialogOpen(true) }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem className="cursor-pointer">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Admins
                    </DropdownMenuItem> */}
                    <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => { handleDeleteClick(company?._id) }}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{company.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{company.contactNumber}</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>{company.address}</span>
                </div>
              </div>

              {/* <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button size="sm" className="flex-1">
                  Manage
                </Button>
              </div> */}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No companies found.</p>
        </div>
      )}
    </div>
  );
};

export default Companies;

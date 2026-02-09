import React from "react";
import { MoreVertical, Edit, Trash2, Phone, MapPin, Building2} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const AdminListCard = ({
  adminList = [],
setAdminInitialData,
setIsEditDialogOpen,
setIsAdminDialog,
handleDeleteClick
//   onDelete,
}) => {
  if (!adminList.length) {
    return (
      <p className="text-center text-muted-foreground">
        No admins found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {adminList.filter(admin => admin.role !== "super_admin").map((admin) => (
        <div
          key={admin._id}
          className="border rounded-lg p-4 shadow-sm hover:shadow-md transition relative"
        >
          {/* Top Right Menu */}
          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                onClick={() =>{setAdminInitialData(admin); setIsEditDialogOpen(true); setIsAdminDialog(true)}}
                  className="cursor-pointer"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleDeleteClick?.(admin._id)}
                  className="text-destructive cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {admin.profileImage ? (
                <img
                  src={admin.profileImage}
                  alt={admin.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-primary">
                  {admin.username?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <h4 className="font-semibold">{admin.username}</h4>
              <p
                className={`text-xs font-medium ${
                  admin.role === "super_admin"
                    ? "text-green-600"
                    : "text-blue-600"
                }`}
              >
                {admin.role === "super_admin"
                  ? "Super Admin"
                  : "Admin"}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="break-all">{admin.email}</p>

            {admin.mobile && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{admin.mobile}</span>
              </div>
            )}

            {admin.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>{admin.address}</span>
              </div>
            )}

            {admin.companyName && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{admin.companyName}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminListCard;

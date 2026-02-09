import React from "react";
import { Briefcase, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const DepartmentCard = ({ departmentData, employees, onClose }) => {
  console.log("Department Data:", employees);
  return (
    // Overlay for center positioning
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      {/* Card */}
      <div className="bg-white rounded-lg shadow-lg w-96 max-w-full max-h-[80vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">{departmentData.name}</h2>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Employee List with scroll if height > 400px */}
        <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
          {employees.map((emp) => (
            <div
              key={emp._id}
              className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 transition"
            >
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">{emp.fullName}</p>
                <p className="text-sm text-muted-foreground">{emp.designation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DepartmentCard;

// import React from "react";
// import { Briefcase, User } from "lucide-react";
// import { Button } from "@/components/ui/button";

// const DepartmentCard = ({ departmentData, employees, onClose }) => {
//   console.log("Department Data:", employees);
//   return (
//     // Overlay for center positioning
//     <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
//       {/* Card */}
//       <div className="bg-white rounded-lg shadow-lg w-96 max-w-full max-h-[80vh]">
//         {/* Header */}
//         <div className="flex justify-between items-center p-4 border-b">
//           <div className="flex items-center gap-2">
//             <Briefcase className="w-5 h-5 text-primary" />
//             <h2 className="font-semibold text-lg">{departmentData.name}</h2>
//           </div>
//           <Button variant="ghost" onClick={onClose}>
//             Close
//           </Button>
//         </div>

//         {/* Employee List with scroll if height > 400px */}
//         <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
//           {employees.map((emp) => (
//             <div
//               key={emp._id}
//               className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 transition"
//             >
//               <User className="w-5 h-5 text-gray-500" />
//               <div className="flex items-center justify-between w-full">
//                 <div>
//                   <p className="font-medium">{emp.fullName}</p>
//                   <p className="text-sm text-muted-foreground">{emp.designation}</p>
//                 </div>
//                 <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
//                   Action
//                 </button>
//               </div>

//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DepartmentCard;








import React, { useState } from "react";
import { Briefcase, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const DepartmentCard = ({ departmentData, employees, onClose, departmentList }) => {
  const [showActionCard, setShowActionCard] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Dummy department list for Action card
  const dummyDepartments = [
    { id: 1, name: "Development" },
    { id: 2, name: "Marketing" },
    { id: 3, name: "HR" },
    { id: 4, name: "Design" },
  ];

  const handleActionClick = (emp) => {
    setSelectedEmployee(emp);
    setShowActionCard(true);
  };

  const handleSave = () => {
    console.log("Saved for employee:", selectedEmployee);
    setShowActionCard(false);
  };
      console.log(selectedEmployee)
  return (
    // Overlay for center positioning + blur effect
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-lg w-96 max-w-full max-h-[80vh] relative">
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
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="font-medium">{emp.fullName}</p>
                  <p className="text-sm text-muted-foreground">{emp.designation}</p>
                </div>
                <button
                  className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600"
                  onClick={() => handleActionClick(emp)}
                >
                  Action
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Action Card Popup */}
        {showActionCard && selectedEmployee && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                          bg-white border rounded-lg shadow-2xl w-11/12 max-w-3xl p-6 z-50">
            <h3 className="font-semibold text-xl mb-4">
              Assign Department for {selectedEmployee.fullName}
            </h3>
            <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto mb-6">
              {departmentList.map((dept) => (
                <div key={dept?._id} className="flex items-center gap-2">
                  <input type="checkbox" checked={dept?.name === selectedEmployee?.department}  id={dept?.name} className="accent-blue-500" />
                  <label htmlFor={`dept-${dept._id}`} className="text-sm">
                    {dept.name}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowActionCard(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentCard;

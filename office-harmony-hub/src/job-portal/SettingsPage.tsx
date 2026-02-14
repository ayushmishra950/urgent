import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SettingsPage = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="font-medium">Portal Name</label>
          <input className="w-full border p-2 rounded mt-1" defaultValue="My Job Portal" />
        </div>

        <div>
          <label className="font-medium">Support Email</label>
          <input className="w-full border p-2 rounded mt-1" defaultValue="support@jobportal.com" />
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Save Changes
        </button>
      </CardContent>
    </Card>
  );
};

export default SettingsPage;

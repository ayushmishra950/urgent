import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RevenuePage = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">₹1,25,000</h2>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">38</h2>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expired Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">7</h2>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenuePage;

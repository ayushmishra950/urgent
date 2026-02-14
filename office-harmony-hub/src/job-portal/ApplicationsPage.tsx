import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const ApplicationsPage = () => {
  const applications = [
    { id: 1, candidate: "Rahul Sharma", job: "Frontend Dev", status: "Pending" },
    { id: 2, candidate: "Priya Singh", job: "Backend Dev", status: "Shortlisted" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.candidate}</TableCell>
                <TableCell>{a.job}</TableCell>
                <TableCell>
                  <Badge variant="outline">{a.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ApplicationsPage;

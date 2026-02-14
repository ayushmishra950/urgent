import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CandidatesPage = () => {
  const candidates = [
    { id: 1, name: "Rahul Sharma", email: "rahul@mail.com", appliedJobs: 4 },
    { id: 2, name: "Priya Singh", email: "priya@mail.com", appliedJobs: 2 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidates Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Applied Jobs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.appliedJobs}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CandidatesPage;

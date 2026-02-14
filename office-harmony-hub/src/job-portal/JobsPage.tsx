import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const JobsPage = () => {
  const jobs = [
    { id: 1, title: "Frontend Developer", company: "TechNova", status: "Active" },
    { id: 2, title: "Backend Developer", company: "CodeCraft", status: "Closed" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jobs Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.company}</TableCell>
                <TableCell>
                  <Badge variant="outline">{job.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default JobsPage;

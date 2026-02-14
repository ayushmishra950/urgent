import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const CompaniesPage = () => {
  const companies = [
    { id: 1, name: "TechNova", email: "hr@technova.com", jobs: 12, status: "Active" },
    { id: 2, name: "CodeCraft", email: "contact@codecraft.com", jobs: 8, status: "Suspended" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Companies Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Total Jobs</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.jobs}</TableCell>
                <TableCell>
                  <Badge variant="outline">{c.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CompaniesPage;

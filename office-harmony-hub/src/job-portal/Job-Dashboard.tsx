import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Briefcase,
  Users,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  TrendingUp,
  Building2,
} from "lucide-react";
import { Helmet } from "react-helmet-async";

const AdminJobDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setData({
      totalCompanies: 45,
      totalJobs: 320,
      activeJobs: 210,
      closedJobs: 110,
      totalCandidates: 1850,
      totalApplications: 5420,
      shortlisted: 860,
      rejected: 3200,
      pending: 1360,
      recentJobs: [
        {
          _id: "1",
          title: "Full Stack Developer",
          company: "TechNova",
          status: "Active",
          applications: 120,
        },
        {
          _id: "2",
          title: "Data Analyst",
          company: "Insight Corp",
          status: "Closed",
          applications: 95,
        },
        {
          _id: "3",
          title: "HR Manager",
          company: "PeopleFirst",
          status: "Active",
          applications: 60,
        },
      ],
      topCompanies: [
        { name: "TechNova", jobs: 35 },
        { name: "Insight Corp", jobs: 28 },
        { name: "CodeCraft", jobs: 22 },
      ],
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-green-600 border-green-600";
      case "Closed":
        return "text-red-600 border-red-600";
      default:
        return "";
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Job Portal Dashboard</title>
      </Helmet>

      <div className="mb-4">
        <button
          onClick={() => window.history.back()}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col min-h-screen bg-gray-50/50 p-6 space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Complete overview of Job Portal performance
          </p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm">Total Companies</CardTitle>
              <Building2 className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.totalCompanies}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.totalJobs}</div>
              <p className="text-xs text-muted-foreground">
                {data?.activeJobs} Active / {data?.closedJobs} Closed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm">Total Candidates</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.totalCandidates}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm">Total Applications</CardTitle>
              <LayoutDashboard className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.totalApplications}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Application Status Overview</CardTitle>
            <CardDescription>
              Distribution of all job applications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Shortlisted */}
            <div>
              <div className="flex justify-between text-sm">
                <span>Shortlisted</span>
                <span>{data?.shortlisted}</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded">
                <div
                  className="bg-green-500 h-2 rounded"
                  style={{ width: "30%" }}
                />
              </div>
            </div>

            {/* Pending */}
            <div>
              <div className="flex justify-between text-sm">
                <span>Pending</span>
                <span>{data?.pending}</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded">
                <div
                  className="bg-yellow-500 h-2 rounded"
                  style={{ width: "25%" }}
                />
              </div>
            </div>

            {/* Rejected */}
            <div>
              <div className="flex justify-between text-sm">
                <span>Rejected</span>
                <span>{data?.rejected}</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded">
                <div
                  className="bg-red-500 h-2 rounded"
                  style={{ width: "45%" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Job Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">
                      Applications
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.recentJobs?.map((job: any) => (
                    <TableRow key={job._id}>
                      <TableCell>{job.title}</TableCell>
                      <TableCell>{job.company}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(job.status)}
                        >
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {job.applications}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Top Companies */}
          <Card>
            <CardHeader>
              <CardTitle>Top Hiring Companies</CardTitle>
              <CardDescription>
                Companies with most active job posts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data?.topCompanies?.map((company: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{company.name}</span>
                  </div>
                  <Badge variant="secondary">
                    {company.jobs} Jobs
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
};

export default AdminJobDashboard;

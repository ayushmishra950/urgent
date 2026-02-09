import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  AlertCircle,
  Timer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Task } from '@/types';
import { cn } from '@/lib/utils';

const mockTasks: Task[] = [
  { id: '1', title: 'Complete project documentation', description: 'Write comprehensive documentation for the new feature', priority: 'high', status: 'in_progress', deadline: '2024-01-20', assignedTo: 'Mike Williams', assignedBy: 'Sarah Admin', createdAt: '2024-01-10' },
  { id: '2', title: 'Review pull requests', description: 'Review and approve pending pull requests from team', priority: 'medium', status: 'pending', deadline: '2024-01-18', assignedTo: 'Emily Brown', assignedBy: 'Sarah Admin', createdAt: '2024-01-12' },
  { id: '3', title: 'Fix login bug', description: 'Investigate and fix the reported login issue', priority: 'urgent', status: 'in_progress', deadline: '2024-01-16', assignedTo: 'David Lee', assignedBy: 'John Smith', createdAt: '2024-01-14' },
  { id: '4', title: 'Update dependencies', description: 'Update all project dependencies to latest versions', priority: 'low', status: 'completed', deadline: '2024-01-15', assignedTo: 'Lisa Chen', assignedBy: 'Sarah Admin', createdAt: '2024-01-08' },
  { id: '5', title: 'Client presentation', description: 'Prepare slides for the quarterly client presentation', priority: 'high', status: 'pending', deadline: '2024-01-22', assignedTo: 'Mike Williams', assignedBy: 'John Smith', createdAt: '2024-01-11' },
  { id: '6', title: 'Database optimization', description: 'Optimize database queries for better performance', priority: 'medium', status: 'pending', deadline: '2024-01-25', assignedTo: 'David Lee', assignedBy: 'Sarah Admin', createdAt: '2024-01-13' },
];

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredTasks = mockTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'in_progress':
        return <Timer className="w-5 h-5 text-warning" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-destructive/10 text-destructive';
      case 'medium':
        return 'bg-warning/10 text-warning';
      case 'low':
        return 'bg-info/10 text-info';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success';
      case 'in_progress':
        return 'bg-warning/10 text-warning';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const taskStats = {
    total: mockTasks.length,
    pending: mockTasks.filter((t) => t.status === 'pending').length,
    inProgress: mockTasks.filter((t) => t.status === 'in_progress').length,
    completed: mockTasks.filter((t) => t.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <FolderKanban className="w-7 h-7 text-primary" />
            Task Management
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'employee'
              ? 'View and manage your assigned tasks'
              : 'Create and assign tasks to team members'}
          </p>
        </div>

        {user?.role !== 'employee' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Fill in the details to create and assign a new task.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input id="title" placeholder="Enter task title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Enter task description" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Deadline</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mike">Mike Williams</SelectItem>
                      <SelectItem value="emily">Emily Brown</SelectItem>
                      <SelectItem value="david">David Lee</SelectItem>
                      <SelectItem value="lisa">Lisa Chen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Task</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{taskStats.total}</p>
              </div>
              <FolderKanban className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{taskStats.pending}</p>
              </div>
              <Circle className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{taskStats.inProgress}</p>
              </div>
              <Timer className="w-8 h-8 text-warning opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{taskStats.completed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {getStatusIcon(task.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold">{task.title}</h3>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getPriorityColor(task.priority))}>
                        {task.priority}
                      </span>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusColor(task.status))}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{task.assignedTo}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {task.deadline}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Created: {task.createdAt}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    {user?.role !== 'employee' && <DropdownMenuItem>Edit Task</DropdownMenuItem>}
                    <DropdownMenuItem>Mark as Complete</DropdownMenuItem>
                    {user?.role !== 'employee' && (
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No tasks found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Tasks;

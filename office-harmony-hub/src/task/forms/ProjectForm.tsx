import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { addProject, updateProject } from "@/services/Service";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface ProjectFormData {
    _id?: string;
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    priority?: Priority;
    remarks?: string;
    status?: string;
}

interface ProjectFormProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: ProjectFormData | null;
    setProjectListRefresh: (value: boolean) => void;
}

// Helper function to convert ISO string to YYYY-MM-DD
const formatForInput = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const ProjectForm: React.FC<ProjectFormProps> = ({ isOpen, onClose, initialData = null, setProjectListRefresh }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [formData, setFormData] = useState<ProjectFormData>({
        priority: 'medium',
        startDate: '',
        endDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [startDateTouched, setStartDateTouched] = useState(false);
    const isEdit = Boolean(initialData);
    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        setStartDateTouched(false);
    }, [isOpen]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                startDate: formatForInput(initialData.startDate),
                endDate: formatForInput(initialData.endDate)
            });
        } else {
            setFormData({ priority: 'medium', startDate: '', endDate: '' });
        }
    }, [initialData, isOpen]);


    const handleSave = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const requiredFields = ['name', 'description', 'startDate', 'endDate', 'priority', 'remarks'] as const;
        for (let field of requiredFields) {
            if (!formData[field]) {
                toast({
                    title: "Missing Field",
                    description: `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`,
                    variant: "destructive",
                });
                return; // Stop function if any field is missing
            }
        };
        setLoading(true);
        try {
            let res = null;
            if (isEdit === true) { res = await updateProject(user?._id, user?.companyId?._id, formData); }
            else { res = await addProject(user?._id, user?.companyId?._id, formData); }

            if (res.status === 200 || res.status === 201) { toast({ title: `${isEdit ? "Update Project." : "Add Project."}`, description: res.data.message }); setProjectListRefresh(true) }
            else { toast({ title: `${isEdit ? "Update Project." : "Add Project."}`, description: res.data.message }); setLoading(false); }
        }
        catch (err) {
            console.log(err); toast({ title: `Error`, description: err.response.data.message }); setLoading(false);
        }
        finally {
            setLoading(false);
            setFormData({ priority: 'medium' });
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] sm:max-h-[90vh] overflow-y-auto w-[95vw] pb-6">
                <form onSubmit={handleSave}>
                    <DialogHeader>
                        <DialogTitle>{initialData ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Project Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="projectName">Project Name</Label>
                            <Input
                                id="projectName"
                                placeholder="Enter project name"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* Description */}
                        <div className="grid gap-2">
                            <Label htmlFor="projectDescription">Description</Label>
                            <Textarea
                                id="projectDescription"
                                placeholder="Enter project description"
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Start Date */}
                            <div className="grid gap-2">
                                <Label htmlFor="projectStartDate">Start Date</Label>
                                <Input
                                    id="projectStartDate"
                                    type="date"
                                    min={
                                        isEdit
                                            ? startDateTouched
                                                ? today       // edit + changed → today/future only
                                                : formData?.startDate || today  // edit + untouched → old date allowed
                                            : today         // create → today/future only
                                    }
                                    value={formData.startDate || ''}
                                    onChange={(e) => {
                                        setStartDateTouched(true);
                                        setFormData((prev) => ({
                                            ...prev,
                                            startDate: e.target.value,
                                            // agar endDate startDate se chhoti ho to reset
                                            endDate:
                                                prev.endDate && e.target.value && prev.endDate < e.target.value
                                                    ? ''
                                                    : prev.endDate,
                                        }))
                                    }
                                    }
                                />
                            </div>

                            {/* End Date */}
                            <div className="grid gap-2">
                                <Label htmlFor="projectEndDate">End Date</Label>
                                <Input
                                    id="projectEndDate"
                                    type="date"
                                    value={formData.endDate || ''}
                                    min={formData.startDate || today}
                                    disabled={!formData.startDate}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            endDate: e.target.value,
                                        }))
                                    }
                                />

                                {!formData.startDate && (
                                    <p className="text-xs text-muted-foreground">
                                        Please select start date first
                                    </p>
                                )}
                            </div>
                        </div>


                        {/* Priority */}
                        <div className="grid gap-2">
                            <Label htmlFor="projectPriority">Priority</Label>
                            <Select
                                value={formData.priority || 'medium'}
                                onValueChange={(value: Priority) => setFormData({ ...formData, priority: value })}
                            >
                                <SelectTrigger id="projectPriority">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low" className='cursor-pointer'>Low</SelectItem>
                                    <SelectItem value="medium" className='cursor-pointer'>Medium</SelectItem>
                                    <SelectItem value="high" className='cursor-pointer'>High</SelectItem>
                                    <SelectItem value="urgent" className='cursor-pointer'>Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Remarks */}
                        <div className="grid gap-2">
                            <Label htmlFor="projectRemarks">Remarks</Label>
                            <Textarea
                                id="projectRemarks"
                                placeholder="Additional comments or remarks"
                                value={formData.remarks || ''}
                                onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sticky bottom-0 bg-white pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="w-full sm:w-auto">
                            Cancel
                        </Button>
                        <Button
                            // onClick={handleSave}
                            disabled={loading || !formData.name || !formData.priority || !formData.startDate || !formData.endDate || !formData.description || !formData.remarks}
                            className="w-full sm:w-auto">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEdit ? 'Update Project' : 'Create Project'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ProjectForm;

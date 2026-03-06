import { useJobs, useCreateJob, useDeleteJob, useUpdateJob } from "@/hooks/use-jobs";
import { useResumes } from "@/hooks/use-resumes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Briefcase, Building2, Calendar, Link as LinkIcon, Plus, Trash2, Mail } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function JobTracker() {
  const { data: jobs, isLoading } = useJobs();
  const { data: resumes } = useResumes();
  const createMutation = useCreateJob();
  const deleteMutation = useDeleteJob();
  const updateMutation = useUpdateJob();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    status: "applied",
    source: "",
    appliedDate: new Date().toISOString().split('T')[0],
    link: "",
    resumeId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData as any, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setFormData({
          company: "",
          role: "",
          status: "applied",
          source: "",
          appliedDate: new Date().toISOString().split('T')[0],
          link: "",
          resumeId: "",
        });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      applied: "secondary",
      interviewing: "default",
      offered: "success",
      rejected: "destructive",
      closed: "outline"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Job Tracker</h1>
          <p className="text-muted-foreground mt-2">Manage your job applications and track your progress.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="hover-elevate shadow-md">
              <Plus className="w-4 h-4 mr-2" /> Add Application
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Job Application</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input 
                    required 
                    value={formData.company} 
                    onChange={e => setFormData({ ...formData, company: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input 
                    required 
                    value={formData.role} 
                    onChange={e => setFormData({ ...formData, role: e.target.value })} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={v => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="interviewing">Interviewing</SelectItem>
                      <SelectItem value="offered">Offered</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Applied Date</Label>
                  <Input 
                    type="date" 
                    value={formData.appliedDate} 
                    onChange={e => setFormData({ ...formData, appliedDate: e.target.value })} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Job Link</Label>
                <Input 
                  type="url" 
                  value={formData.link} 
                  onChange={e => setFormData({ ...formData, link: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Resume Used</Label>
                <Select 
                  value={formData.resumeId} 
                  onValueChange={v => setFormData({ ...formData, resumeId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    {resumes?.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Adding..." : "Add Application"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-primary/5 border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Interviewing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs?.filter(j => j.status === 'interviewing').length || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Extracted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {jobs?.filter(j => j.isAiExtracted).length || 0}
              <Badge variant="outline" className="text-[10px] uppercase">Coming Soon</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Loading applications...</TableCell>
              </TableRow>
            ) : !jobs?.length ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No applications tracked yet. Click "Add Application" to start.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      {job.company}
                    </div>
                  </TableCell>
                  <TableCell>{job.role}</TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(job.appliedDate), 'MMM d, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {job.link && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={job.link} target="_blank" rel="noreferrer">
                            <LinkIcon className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this application?")) {
                            deleteMutation.mutate(job.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="mt-12 bg-muted/50 rounded-2xl p-8 border border-dashed border-muted-foreground/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Gmail Integration (Coming Soon)</h2>
            <p className="text-muted-foreground">Automatically track job applications from your inbox using AI extraction.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

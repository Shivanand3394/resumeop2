import { Plus } from "lucide-react";
import { useResumes, useCreateResume, useDeleteResume, useDuplicateResume } from "@/hooks/use-resumes";
import { ResumeCard } from "@/components/ResumeCard";
import { Button } from "@/components/ui/button";
import { defaultResumeContent } from "@/types/resume";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: resumes, isLoading } = useResumes();
  const createMutation = useCreateResume();
  const deleteMutation = useDeleteResume();
  const duplicateMutation = useDuplicateResume();

  const handleCreate = () => {
    createMutation.mutate({
      title: "Untitled Resume",
      templateId: "minimal",
      contentJson: defaultResumeContent,
    }, {
      onSuccess: (data) => {
        setLocation(`/editor/${data.id}`);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground">My Resumes</h1>
            <p className="text-muted-foreground mt-2 text-lg">Build, edit, and export your professional journey.</p>
          </div>
          <Button 
            size="lg" 
            onClick={handleCreate} 
            disabled={createMutation.isPending}
            className="hover-elevate shadow-md rounded-xl font-semibold px-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            {createMutation.isPending ? "Creating..." : "Create New Resume"}
          </Button>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : !resumes?.length ? (
          <div className="text-center py-24 bg-card border border-dashed rounded-3xl">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-8 h-8 text-primary/40" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No resumes yet</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Get started by creating your first resume and choosing a professional template.
            </p>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              Create your first resume
            </Button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {resumes.map((resume, idx) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <ResumeCard 
                  resume={resume} 
                  onDuplicate={(id) => duplicateMutation.mutate(id)}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

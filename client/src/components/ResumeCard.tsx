import { Link } from "wouter";
import { Copy, Trash2, Edit, FileText, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import type { ResumeResponse } from "@shared/routes";

interface ResumeCardProps {
  resume: ResumeResponse;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
}

export function ResumeCard({ resume, onDuplicate, onDelete }: ResumeCardProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  return (
    <>
      <div className="group relative bg-card border rounded-2xl p-5 hover-elevate transition-all duration-300 flex flex-col h-full overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
        
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <FileText className="w-6 h-6" />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDuplicate(resume.id)}>
                <Copy className="w-4 h-4 mr-2" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteAlert(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex-1 relative z-10">
          <h3 className="font-display font-semibold text-lg text-foreground mb-1 line-clamp-1">
            {resume.title}
          </h3>
          <p className="text-sm text-muted-foreground capitalize">
            {resume.templateId} Template
          </p>
        </div>
        
        <div className="mt-6 flex items-center justify-between relative z-10">
          <div className="text-xs text-muted-foreground">
            Updated {format(new Date(resume.updatedAt), "MMM d, yyyy")}
          </div>
          <Link href={`/editor/${resume.id}`}>
            <Button size="sm" variant="secondary" className="hover-elevate font-medium">
              <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
            </Button>
          </Link>
        </div>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resume?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the resume
              "{resume.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDelete(resume.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

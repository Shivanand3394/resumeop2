import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { useDebounce } from "use-debounce";
import { v4 as uuidv4 } from "uuid";
import { ArrowLeft, Download, Save, Loader2, Settings2, Plus, Trash2 } from "lucide-react";
import { useResume, useUpdateResume } from "@/hooks/use-resumes";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import type { ResumeContent } from "@/types/resume";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const resumeId = id || "";

  const { data: resume, isLoading, isError } = useResume(resumeId);
  const updateMutation = useUpdateResume();

  const [title, setTitle] = useState("");
  const [templateId, setTemplateId] = useState("minimal");

  const { register, control, watch, reset } = useForm<ResumeContent>({
    defaultValues: {
      personalInfo: { fullName: "", email: "", phone: "", location: "", website: "", summary: "" },
      experiences: [],
      education: [],
      skills: [],
    }
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: "experiences" });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: "education" });
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({ control, name: "skills" });

  const watchedData = watch();
  const [debouncedData] = useDebounce(watchedData, 800);
  const [debouncedTitle] = useDebounce(title, 800);

  // Initialize form with backend data
  useEffect(() => {
    if (resume) {
      setTitle(resume.title);
      setTemplateId(resume.templateId);
      reset(resume.contentJson as ResumeContent);
    }
  }, [resume, reset]);

  // Auto-save effect
  useEffect(() => {
    if (!resume) return;
    // Don't save if nothing changed or still loading initial data
    if (JSON.stringify(debouncedData) === JSON.stringify(resume.contentJson) && debouncedTitle === resume.title && templateId === resume.templateId) {
      return;
    }
    
    updateMutation.mutate({
      id: resumeId,
      title: debouncedTitle,
      templateId,
      contentJson: debouncedData
    });
  }, [debouncedData, debouncedTitle, templateId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExportPDF = () => {
    window.open(`/api/resumes/${resumeId}/export/pdf`, '_blank');
  };

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  if (isError || !resume) {
    return <div className="h-screen flex items-center justify-center">Resume not found.</div>;
  }

  const saveState = updateMutation.isPending ? "Saving..." : updateMutation.isError ? "Error saving" : "Saved";

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top Header */}
      <header className="h-16 glass-panel border-b z-10 flex items-center justify-between px-4 sm:px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="shrink-0"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <Input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="border-transparent bg-transparent hover:bg-muted/50 focus-visible:bg-background text-lg font-bold w-64 px-2"
            placeholder="Resume Title"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center text-sm text-muted-foreground mr-4">
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {saveState}
          </div>
          
          <div className="flex items-center gap-2 border-r pr-4">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleExportPDF} size="sm" className="hover-elevate shadow-md">
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Panel (Left) */}
        <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col border-r bg-card/50">
          <ScrollArea className="flex-1 p-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="personal">Profile</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="space-y-4 outline-none">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input {...register("personalInfo.fullName")} placeholder="Jane Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" {...register("personalInfo.email")} placeholder="jane@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input {...register("personalInfo.phone")} placeholder="(555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input {...register("personalInfo.location")} placeholder="New York, NY" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Website / LinkedIn</Label>
                    <Input {...register("personalInfo.website")} placeholder="linkedin.com/in/janedoe" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Professional Summary</Label>
                    <Textarea {...register("personalInfo.summary")} className="h-32" placeholder="A brief summary of your professional background..." />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="experience" className="space-y-6 outline-none">
                {expFields.map((field, index) => (
                  <Card key={field.id} className="relative shadow-sm border-muted">
                    <CardContent className="pt-6 grid grid-cols-2 gap-4">
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeExp(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label>Company</Label>
                        <Input {...register(`experiences.${index}.company`)} placeholder="Acme Inc." />
                      </div>
                      <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label>Role</Label>
                        <Input {...register(`experiences.${index}.role`)} placeholder="Software Engineer" />
                      </div>
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input {...register(`experiences.${index}.startDate`)} placeholder="Jan 2020" />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input {...register(`experiences.${index}.endDate`)} placeholder="Present" />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Description</Label>
                        <Textarea {...register(`experiences.${index}.description`)} className="h-24" placeholder="Describe your achievements..." />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => appendExp({ id: uuidv4(), company: "", role: "", startDate: "", endDate: "", description: "" })}>
                  <Plus className="w-4 h-4 mr-2" /> Add Experience
                </Button>
              </TabsContent>

              <TabsContent value="education" className="space-y-6 outline-none">
                {eduFields.map((field, index) => (
                  <Card key={field.id} className="relative shadow-sm border-muted">
                    <CardContent className="pt-6 grid grid-cols-2 gap-4">
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeEdu(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="space-y-2 col-span-2">
                        <Label>Institution</Label>
                        <Input {...register(`education.${index}.institution`)} placeholder="University of Technology" />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Degree</Label>
                        <Input {...register(`education.${index}.degree`)} placeholder="Bachelor of Science in CS" />
                      </div>
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input {...register(`education.${index}.startDate`)} placeholder="2016" />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input {...register(`education.${index}.endDate`)} placeholder="2020" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => appendEdu({ id: uuidv4(), institution: "", degree: "", startDate: "", endDate: "" })}>
                  <Plus className="w-4 h-4 mr-2" /> Add Education
                </Button>
              </TabsContent>

              <TabsContent value="skills" className="space-y-4 outline-none">
                <div className="flex flex-col gap-3">
                  {skillFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-3">
                      <Input {...register(`skills.${index}.name`)} placeholder="e.g. React, Python, Project Management" />
                      <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeSkill(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" className="w-full border-dashed mt-2" onClick={() => appendSkill({ id: uuidv4(), name: "" })}>
                    <Plus className="w-4 h-4 mr-2" /> Add Skill
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </div>

        {/* Live Preview Panel (Right) */}
        <div className="hidden lg:flex flex-1 bg-muted overflow-auto relative items-center justify-center p-8">
          <div className="transform scale-[0.6] xl:scale-[0.75] 2xl:scale-90 transform-origin-top shadow-2xl transition-transform duration-300">
            <TemplateRenderer templateId={templateId} content={watchedData as ResumeContent} />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUserRole } from "@/hooks/useUserRole";
import { useRouter } from "next/navigation";
import LoaderUI from "@/components/LoaderUI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, SparklesIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function ProblemsPage() {
  const router = useRouter();
  const { isInterviewer, isLoading: roleLoading } = useUserRole();
  const problems = useQuery(api.problems.getMyProblems);
  const generateProblem = useMutation(api.problems.generateProblem);
  const deleteProblem = useMutation(api.problems.deleteProblem);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [generationForm, setGenerationForm] = useState({
    difficulty: "medium" as "easy" | "medium" | "hard",
    category: "",
    topic: "",
  });

  if (roleLoading) return <LoaderUI />;
  if (!isInterviewer) return router.push("/");

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateProblem({
        difficulty: generationForm.difficulty,
        category: generationForm.category || undefined,
        topic: generationForm.topic || undefined,
      });
      toast.success("Problem generated successfully!");
      setIsDialogOpen(false);
      setGenerationForm({ difficulty: "medium", category: "", topic: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to generate problem");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (problemId: string) => {
    if (!confirm("Are you sure you want to delete this problem?")) return;

    try {
      await deleteProblem({ problemId: problemId as any });
      toast.success("Problem deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete problem");
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Problem Library</h1>
          <p className="text-muted-foreground text-lg">
            Manage your coding problems and generate new ones with AI
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <SparklesIcon className="h-5 w-5" />
              Generate with AI
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Generate AI Problem</DialogTitle>
              <DialogDescription>
                Let AI create a custom coding problem for your interviews
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={generationForm.difficulty}
                  onValueChange={(value) =>
                    setGenerationForm({ ...generationForm, difficulty: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category (Optional)</Label>
                <Input
                  placeholder="e.g., arrays, strings, dynamic-programming"
                  value={generationForm.category}
                  onChange={(e) =>
                    setGenerationForm({ ...generationForm, category: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Topic (Optional)</Label>
                <Input
                  placeholder="e.g., two pointers, binary search, recursion"
                  value={generationForm.topic}
                  onChange={(e) =>
                    setGenerationForm({ ...generationForm, topic: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? "Generating..." : "Generate Problem"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {problems === undefined ? (
        <div className="flex justify-center py-16">
          <LoaderUI />
        </div>
      ) : problems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg mb-4">No problems yet</p>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <PlusIcon className="h-4 w-4" />
            Generate Your First Problem
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem) => (
            <Card key={problem._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{problem.title}</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={
                          problem.difficulty === "easy"
                            ? "default"
                            : problem.difficulty === "medium"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {problem.difficulty}
                      </Badge>
                      {problem.isAIGenerated && (
                        <Badge variant="outline" className="gap-1">
                          <SparklesIcon className="h-3 w-3" />
                          AI
                        </Badge>
                      )}
                      {problem.category && (
                        <Badge variant="outline">{problem.category}</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(problem._id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3 mb-4">
                  {problem.description}
                </CardDescription>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{problem.examples.length} examples</span>
                  <span>
                    {problem.hints && problem.hints.length > 0
                      ? `${problem.hints.length} hints`
                      : "No hints"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProblemsPage;


"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useUserRole } from "@/hooks/useUserRole";
import toast from "react-hot-toast";

function RoleSwitcher() {
  const { user } = useUser();
  const { isInterviewer, isCandidate, isLoading: roleLoading } = useUserRole();
  const updateRole = useMutation(api.users.updateUserRole);

  const handleRoleChange = async (newRole: "candidate" | "interviewer") => {
    if (!user?.id) return;

    try {
      await updateRole({
        clerkId: user.id,
        role: newRole,
      });
      toast.success(`Role updated to ${newRole}`);
      // Force a page reload to update the UI
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update role");
    }
  };

  if (roleLoading || !user) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Role:</span>
      <Select
        value={isInterviewer ? "interviewer" : "candidate"}
        onValueChange={(value) => handleRoleChange(value as "candidate" | "interviewer")}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="candidate">Candidate</SelectItem>
          <SelectItem value="interviewer">Interviewer</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default RoleSwitcher;


// features/workspace/components/member-management-modal.tsx
"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  Shield,
  UserMinus,
  UserPlus,
  MoreVertical,
  Crown,
  Mail,
} from "lucide-react";

import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/ui/credenza";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import InviteMemberModal from "@/features/workspace/components/invite-member-workspace-modal";
import { WorkspaceMember } from "@/features/workspace/types/api";
import { useAuthStore } from "@/features/auth/store/use-auth-store";
import { getInitials } from "@/lib/avatar";
import { useRemoveWorkspaceMember } from "../hooks/mutations/use-workspace";
interface Member {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "admin" | "member";
}

const MOCK_MEMBERS: Member[] = [
  {
    id: "1",
    name: "Andrian Lysander",
    email: "andrian@example.com",
    role: "admin",
  },
  { id: "2", name: "Sarah Connor", email: "sarah@example.com", role: "member" },
  { id: "3", name: "John Doe", email: "john@example.com", role: "member" },
];

export default function MemberManagementModal({
  workspaceMembers,
  children,
}: {
  children?: React.ReactNode;
  workspaceMembers: WorkspaceMember[];
}) {
  const [open, setOpen] = React.useState(false);
  const userId = useAuthStore((state) => state.userId);
  const userRole = workspaceMembers.find(
    (member) => member.user_id === userId,
  )?.role;
  const { workspaceId } = useParams();
  const { mutate: removeMember, isPending } = useRemoveWorkspaceMember(
    workspaceId as string,
  );

  const handleRemoveMember = (targetId: string) => {
    removeMember(targetId);
  };
  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaTrigger asChild>
        {children ? (
          children
        ) : (
          <Button variant="outline">Manage Members</Button>
        )}
      </CredenzaTrigger>

      <CredenzaContent className="md:max-w-xl ">
        <CredenzaHeader className="flex flex-row items-center justify-between py-4 border-b border-border">
          <div className="text-left">
            <CredenzaTitle>Workspace Members</CredenzaTitle>
            <CredenzaDescription>
              Manage roles, permissions, and active collaborators.
            </CredenzaDescription>
          </div>

          <InviteMemberModal>
            <Button size="sm" className="gap-2">
              <UserPlus className="size-4" />
              Invite
            </Button>
          </InviteMemberModal>
        </CredenzaHeader>

        <CredenzaBody className="max-h-96 overflow-y-auto p-4 space-y-3">
          {workspaceMembers.map((member) => {
            const canManage =
              (userRole === "owner" && member.user_id !== userId) ||
              (userRole === "admin" && member.role === "member");
            return (
              <div
                key={member.user_id}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.user.name}`}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                      {getInitials(member.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {member.user.name}
                      </span>
                      {member.role === "owner" && (
                        <Badge
                          variant="secondary"
                          className="gap-1 text-[10px] px-1.5 py-0.5 font-medium"
                        >
                          <Crown className="size-3 text-amber-500" />
                          Owner
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Mail className="size-3" />
                      {member.user.email}
                    </span>
                  </div>
                </div>

                {canManage && (
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground"
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="w-44"
                      onPointerDownOutside={(e) => {
                        e.preventDefault();
                      }}
                    >
                      {userRole === "owner" && (
                        <DropdownMenuItem className="gap-2 text-xs">
                          <Shield className="size-3.5" />
                          {member.role === "admin"
                            ? "Demote to Member"
                            : "Promote to Admin"}
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem
                        className="gap-2 text-xs text-destructive focus:text-destructive"
                        onClick={() => handleRemoveMember(member.user_id)}
                      >
                        <UserMinus className="size-3.5" />
                        Remove from workspace
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
}

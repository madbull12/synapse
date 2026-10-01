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
    Mail
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
interface Member {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role: "admin" | "member";
}

// Mock data or pass via props/tanstack query
const MOCK_MEMBERS: Member[] = [
    { id: "1", name: "Andrian Lysander", email: "andrian@example.com", role: "admin" },
    { id: "2", name: "Sarah Connor", email: "sarah@example.com", role: "member" },
    { id: "3", name: "John Doe", email: "john@example.com", role: "member" },
];

export default function MemberManagementModal({
    children,
}: {
    children?: React.ReactNode;
}) {
    const [open, setOpen] = React.useState(false);
    const params = useParams();
    const workspaceId = (params?.workspaceId as string) || "";

    const members = MOCK_MEMBERS;

    return (
        <Credenza open={open} onOpenChange={setOpen}>
            <CredenzaTrigger asChild>
                {children ? children : <Button variant="outline">Manage Members</Button>}
            </CredenzaTrigger>

            <CredenzaContent className="sm:max-w-xl ">
                <CredenzaHeader className="flex flex-row items-center justify-between py-4 border-b border-border">
                    <div>
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
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Avatar className="size-10">
                                    <AvatarImage src={member.avatarUrl} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                                        {member.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-foreground">
                                            {member.name}
                                        </span>
                                        {member.role === "admin" && (
                                            <Badge variant="secondary" className="gap-1 text-[10px] px-1.5 py-0.5 font-medium">
                                                <Crown className="size-3 text-amber-500" />
                                                Admin
                                            </Badge>
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <Mail className="size-3" />
                                        {member.email}
                                    </span>
                                </div>
                            </div>

                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                                        <MoreVertical className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                    align="end"
                                    className="w-40"
                                    onPointerDownOutside={(e) => {
                                        e.preventDefault();
                                    }}
                                >
                                    <DropdownMenuItem className="gap-2 text-xs">
                                        <Shield className="size-3.5" />
                                        {member.role === "admin" ? "Demote to Member" : "Promote to Admin"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2 text-xs text-destructive focus:text-destructive">
                                        <UserMinus className="size-3.5" />
                                        Remove from workspace
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ))}
                </CredenzaBody>
            </CredenzaContent>
        </Credenza>
    );
}
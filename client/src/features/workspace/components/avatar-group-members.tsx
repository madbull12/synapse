import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { WorkspaceMember } from "@/features/workspace/types/api";
import { getInitials } from "@/lib/avatar";

interface Props {
  workspaceMembers: WorkspaceMember[];
}

const MAX_VISIBLE = 3;

const AvatarGroupMembers = ({ workspaceMembers = [] }: Props) => {
  const visibleMembers = workspaceMembers.slice(0, MAX_VISIBLE);
  const overflowCount = workspaceMembers.length - MAX_VISIBLE;

  return (
    <AvatarGroup className="grayscale">
      {visibleMembers.map((member) => (
        <Avatar key={member.user_id}>
          <AvatarImage
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.user.name}`}
            alt={member.user.name}
          />
          <AvatarFallback>
            {getInitials(member.user.name)}
          </AvatarFallback>
        </Avatar>
      ))}

      {overflowCount > 0 && (
        <AvatarGroupCount>+{overflowCount}</AvatarGroupCount>
      )}
    </AvatarGroup>
  );
};

export default AvatarGroupMembers;
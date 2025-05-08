import { Link } from "react-router-dom";
import ProfileAvatar from "../ProfileAvatar";

const GroupMembersList = ({ members }) => {
  if (!members || members.length === 0) {
    return <p className="text-gray-400">No members in this group yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {members.map((member) => (
        <li key={member.id} className="flex items-center gap-4">
          <Link to={`/profile/${member.profile_id}`}>
            <ProfileAvatar
            avatar_url={member.profiles.avatar_url}
            className="!w-16 !h-16"
          />
          </Link>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">{member.profiles.username}</h3>
            <p className="text-sm text-gray-400">{member.role}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default GroupMembersList;
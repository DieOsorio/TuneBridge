import LazyImage from "../ui/LazyImage";
import React from "react";

export interface ProfileAvatarProps {
  avatar_url?: string | null;
  className?: string;
  loading?: boolean;
  alt?: string;
  list?: boolean;
  gender?: string | null;
  group?: boolean;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ avatar_url, className = "", loading = false, alt = "Avatar", list = false, gender = "", group = false }) => {
  const avatar = avatar_url
    ? avatar_url
    : group
    ? "/public/group-users.png"
    : gender === "Female"
    ? "https://www.w3schools.com/w3images/avatar4.png"
    : "https://www.w3schools.com/w3images/avatar2.png";

  return (
    <>
      {list ? (
        <LazyImage src={avatar} alt={alt || "Avatar"} className={className} />
      ) : (
        <div className={`w-30 h-30 rounded-full overflow-hidden border-2 border-gray-300 shadow-md ${className}`}>
          <img
            loading={loading ? "eager" : "lazy"}
            src={avatar}
            alt={alt || "Avatar"}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </>
  );
};

export default ProfileAvatar;

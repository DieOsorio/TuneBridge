import LazyImage from "../ui/LazyImage";

function ProfileAvatar({ avatar_url, className, loading, alt, list, gender, group }) {
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
            loading="lazy"
            src={avatar}
            alt={alt || "Avatar"}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </>
  );
}

export default ProfileAvatar;
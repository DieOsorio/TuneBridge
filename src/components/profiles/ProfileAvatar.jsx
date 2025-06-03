function ProfileAvatar({ avatar_url, className, alt, list, gender }) {
  const avatar = avatar_url 
  ? avatar_url 
  : gender === 'Female' 
  ? 'https://www.w3schools.com/w3images/avatar4.png'
  : 'https://www.w3schools.com/w3images/avatar2.png';

  return (
    <>
    {list ? (
      <img
        src={avatar}
        alt={alt || "Avatar"}
        className={className}
      />
    ) : (
      <div className={`w-30 h-30 rounded-full overflow-hidden border-2 border-gray-300 shadow-md ${className}`}>
        <img
          src={avatar}
          alt={alt || "Avatar"}
          className={`w-full h-full object-cover`}
        />
      </div>
    )}
    </>
  );
}

export default ProfileAvatar
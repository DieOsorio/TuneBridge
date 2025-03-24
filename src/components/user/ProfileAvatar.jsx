function ProfileAvatar({ avatar_url = 'https://www.w3schools.com/w3images/avatar2.png' }) {

  const avatarToUse = avatar_url.trim() ? avatar_url : 'https://www.w3schools.com/w3images/avatar2.png';

  return (
    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 shadow-md">
      <img 
        src={avatarToUse} 
        alt="Avatar" 
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default ProfileAvatar
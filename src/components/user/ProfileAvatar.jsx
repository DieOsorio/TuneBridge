function ProfileAvatar({ userId, avatarUrl }) {

  const avatar = avatarUrl ? avatarUrl.trim() : 'https://www.w3schools.com/w3images/avatar2.png';

  return (
    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 shadow-md">
      <img 
        src={avatar} 
        alt="Avatar" 
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default ProfileAvatar
import React from 'react'

function ProfileData({ profileData }) {

  function calculateAge(birthdate) {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  return (
    <div className="flex flex-col items-center">

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 text-lg text-gray-300">
        {profileData.firstname &&
        <li className="flex items-center">
          <span className="font-semibold w-32 text-gray-500">Name:</span>
          <span>{profileData.firstname}</span>
        </li>}

        {profileData.lastname &&
        <li className="flex items-center">
          <span className="font-semibold w-32 text-gray-500">Last Name:</span>
          <span>{profileData.lastname}</span>
        </li>}

        {profileData.country &&
        <li className="flex items-center">
          <span className="font-semibold w-32 text-gray-500">Country:</span>
          <span>{profileData.country}</span>
        </li>}

        {profileData.city &&
        <li className="flex items-center">
          <span className="font-semibold w-32 text-gray-500">City:</span>
          <span>{profileData.city}</span>
        </li>}

        {profileData.gender &&
        <li className="flex items-center">
          <span className="font-semibold w-32 text-gray-500">Gender:</span>
          <span>{profileData.gender}</span>
        </li>}

        {profileData.birthdate &&
        <li className="flex items-center">
          <span className="font-semibold w-32 text-gray-500">Age:</span>
          <span>{calculateAge(profileData.birthdate)} years</span>
        </li>}
      </ul>
    </div>
  )
}

export default ProfileData

import React from 'react'

function ProfileData({ profileData }) {
  return (
    <div className="flex flex-col items-center">
      {profileData.bio && (
        <p className="max-w-2xl text-center text-lg text-gray-700 mb-4">
          {profileData.bio}
        </p>
      )}

      {profileData.bio && (
        <hr className="w-full max-w-3xl border-t border-gray-300 mb-6" />
      )}

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 text-lg text-gray-800">
        {profileData.firstname &&
        <li className="flex items-center">
          <span className="font-semibold w-32 text-gray-600">Nombre:</span>
          <span>{profileData.firstname}</span>
        </li>}

        {profileData.lastname &&
        <li className="flex items-center">
          <span className="font-semibold w-32 text-gray-600">Apellido:</span>
          <span>{profileData.lastname}</span>
        </li>}

        {profileData.country &&
        <li className="flex items-center">
          <span className="font-semibold w-32 text-gray-600">País:</span>
          <span>{profileData.country}</span>
        </li>}

        {profileData.city &&
        <li className="flex items-center">
          <span className="font-semibold w-32 text-gray-600">Ciudad:</span>
          <span>{profileData.city}</span>
        </li>}

        {profileData.gender &&
        <li className="flex items-center">
          <span className="font-semibold w-32 text-gray-600">Género:</span>
          <span>{profileData.gender}</span>
        </li>}

        {profileData.birthdate &&
        <li className="flex items-center">
          <span className="font-semibold w-32 text-gray-600">Nacimiento:</span>
          <span>{profileData?.birthdate ? profileData.birthdate.split("T")[0] : "—"}</span>
        </li>}
      </ul>
    </div>
  )
}

export default ProfileData

import React from 'react'

function ProfileData({profileData}) {
  return (
    <div className="flex justify-center">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 text-lg text-gray-800 mt-6">
            <li className="flex items-center">
                <span className="font-semibold w-32 text-gray-600">Nombre:</span>
                <span>{profileData.firstname}</span>
            </li>

            <li className="flex items-center">
                <span className="font-semibold w-32 text-gray-600">Apellido:</span>
                <span>{profileData.lastname}</span>
            </li>

            <li className="flex items-center">
                <span className="font-semibold w-32 text-gray-600">País:</span>
                <span>{profileData.country}</span>
            </li>

            <li className="flex items-center">
                <span className="font-semibold w-32 text-gray-600">Ciudad:</span>
                <span>{profileData.city}</span>
            </li>

            <li className="flex items-center">
                <span className="font-semibold w-32 text-gray-600">Género:</span>
                <span>{profileData.gender}</span>
            </li>

            <li className="flex items-center">
                <span className="font-semibold w-32 text-gray-600">Nacimiento:</span>
                <span>{profileData?.birthdate ? profileData.birthdate.split("T")[0] : "—"}</span>
            </li>
        </ul>
    </div>
  )
}

export default ProfileData
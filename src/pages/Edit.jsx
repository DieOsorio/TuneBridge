import React, { useEffect } from 'react';
import { useView } from '../context/ViewContext';
import EditProfile from '../components/profiles/EditProfile';
import EditMusicInfo from '../components/music/EditMusicInfo';

function Edit({ profileData }) {
    const { externalView, internalView, manageView } = useView();

    // On refresh goes to edit -> editProfile View
    useEffect(() => {
        if (!externalView) {
            manageView("editProfile", "edit")
        }
    }, [externalView, manageView])

    return (
        <>
            {/* Internal Navbar*/}
            <div className="bg-gradient-to-b from-gray-800 to-gray-950 text-white p-4 rounded-t-lg h-25">
                <div className="max-w-6xl mx-auto flex space-x-8 justify-center">
                    {/* Select editProfile view */}
                    <span
                        onClick={() => manageView("editProfile", "edit")}
                        className={`cursor-pointer text-lg font-medium transition-all duration-300 ${
                            internalView === "editProfile"
                                ? "border-b-4 border-sky-800"
                                : "hover:text-sky-600"
                        }`}
                    >
                        Edit Profile
                    </span>
                    {/* Select editMusicInfo view */}
                    <span
                        onClick={() => manageView("editMusicInfo", "edit")}
                        className={`cursor-pointer text-lg font-medium transition-all duration-300 ${
                            internalView === "editMusicInfo"
                                ? "border-b-4 border-sky-800"
                                : "hover:text-sky-600"
                        }`}
                    >
                        Edit Music Info
                    </span>
                </div>
            </div>

            {/* Internal views */}
            <div>
                {internalView === "editProfile" && <EditProfile profile={profileData} />}
                {internalView === "editMusicInfo" && <EditMusicInfo profileId={profileData.id} />}
            </div>
        </>
    );
}

export default Edit;

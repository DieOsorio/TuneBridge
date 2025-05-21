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
            <div className="bg-gradient-to-b from-gray-800 to-gray-950 text-white p-4 rounded-t-lg shadow-md">
                <div className="max-w-6xl mx-auto flex justify-center space-x-4">
                    {[
                    { label: "Edit Profile", view: "editProfile" },
                    { label: "Edit Music Info", view: "editMusicInfo" },
                    ].map(({ label, view }) => {
                    const isActive = internalView === view;
                    return (
                        <button
                        key={view}
                        onClick={() => manageView(view, "edit")}
                        className={`px-4 py-2 text-sm sm:text-base rounded-t-lg font-semibold transition-all duration-300 focus:outline-none
                            ${
                            isActive
                                ? "bg-sky-700 text-white shadow-lg"
                                : "bg-gray-800 text-gray-300 hover:bg-sky-800 hover:text-white"
                            }`}
                        >
                        {label}
                        </button>
                    );
                    })}
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

import { useEffect } from 'react';
import { useView } from '../context/ViewContext';
import EditProfile from '../components/profiles/EditProfile';
import EditMusicInfo from '../components/music/EditMusicInfo';
import MediaEditPage from "../components/music/MediaEditPage"
import { useTranslation } from 'react-i18next';

function Edit({ profileData }) {
    const { t } = useTranslation("profile");
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
            <div className="bg-gradient-to-b from-gray-800 to-gray-950 text-white p-4 rounded-t-lg shadow-md max-w-4xl y mx-auto">
                <div className="max-w-6xl mx-auto flex justify-center space-x-4">
                    {[
                    { label: t("edit.navigation.editProfile"), view: "editProfile" },
                    { label: t("edit.navigation.editMusicInfo"), view: "editMusicInfo" },
                    { label: t("edit.navigation.insertMedia"), view: "insertMedia" },
                    ].map(({ label, view }) => {
                    const isActive = internalView === view;
                    return (
                        <button
                        key={view}
                        onClick={() => manageView(view, "edit")}
                        className={`px-4 py-2 text-sm border-b-2 sm:text-base text-center rounded-md font-medium transition-colors
                            ${
                            isActive
                                ? "border-yellow-600 text-white"
                                : "text-gray-300 hover:text-yellow-600"
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
                {internalView === "insertMedia" && <MediaEditPage />}
            </div>
        </>
    );
}

export default Edit;

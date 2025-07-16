import { useTranslation } from "react-i18next";
import { useSettings } from "../../context/settings/SettingsContext";
import React from "react";
import type { Profile } from "../../context/profile/profileActions"

export interface ProfileDataProps {
  profileData: Profile;
}

interface PrivacyPrefs {
  show_email?: boolean;
  [key: string]: any;
}

const ProfileData: React.FC<ProfileDataProps> = ({ profileData }) => {
  const { t } = useTranslation("profile");
  const { privacyOthers } = useSettings();
  const { data: privacyPrefs = {} as PrivacyPrefs } = privacyOthers(profileData.id);

  function calculateAge(birthdate?: string): number {
    if (!birthdate) return 0;
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
        {profileData.firstname && (
          <li className="flex items-center">
            <span className="font-semibold w-28 text-gray-500">
              {t("profile.data.firstname")}:
            </span>
            <span>{profileData.firstname}</span>
          </li>
        )}
        {profileData.lastname && (
          <li className="flex items-center">
            <span className="font-semibold w-28 text-gray-500">
              {t("profile.data.lastname")}:
            </span>
            <span>{profileData.lastname}</span>
          </li>
        )}
        {profileData.country && (
          <li className="flex items-center">
            <span className="font-semibold w-28 text-gray-500">
              {t("profile.data.country")}:
            </span>
            <span>{profileData.country}</span>
          </li>
        )}
        {profileData.state && (
          <li className="flex items-center">
            <span className="font-semibold w-28 text-gray-500">
              {t("profile.data.state")}:
            </span>
            <span>{profileData.state}</span>
          </li>
        )}
        {profileData.neighborhood && (
          <li className="flex items-center">
            <span className="font-semibold w-28 text-gray-500">
              {t("profile.data.neighborhood")}:
            </span>
            <span>{profileData.neighborhood}</span>
          </li>
        )}
        {profileData.gender && (
          <li className="flex items-center">
            <span className="font-semibold w-28 text-gray-500">
              {t("profile.data.gender")}:
            </span>
            <span>{t(`edit.placeholders.genderOptions.${profileData.gender.toLowerCase()}`)}</span>
          </li>
        )}
        {profileData.birthdate && (
          <li className="flex items-center">
            <span className="font-semibold w-28 text-gray-500">
              {t("profile.data.age")}:
            </span>
            <span>{calculateAge(profileData.birthdate)} {t("profile.data.years")}</span>
          </li>
        )}
        {privacyPrefs.show_email && profileData.email && (
          <li className="flex items-center">
            <span className="font-semibold w-28 text-gray-500">
              {t("profile.data.email")}:
            </span>
            <span>{profileData.email}</span>
          </li>
        )}
      </ul>
    </div>
  );
};

export default ProfileData;

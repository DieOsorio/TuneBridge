import { useNavigate }      from "react-router-dom";
import { useAuth }          from "../../../context/AuthContext";
import { useProfileGroupFollows } from "../../../context/groups/ProfileGroupFollowsContext";
import { useTranslation }   from "react-i18next";

import ProfileAvatar from "../ProfileAvatar";
import Button        from "../../ui/Button";

import { IoIosSettings }  from "react-icons/io";
import { HiStar, HiOutlineStar } from "react-icons/hi";

/* width classes kept in‑sync with ProfileHeader */
const GroupHeader = ({ groupData, isAdmin }) => {
  const { t }     = useTranslation("profileGroup", { keyPrefix: "groupHeader" });
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const basePath  = `/group/${groupData.id}`;
  const navBtnCls = "!bg-amber-950 hover:!bg-gray-900/60 hover:!text-white";

  /* ───── follow state ───── */
  const {
    followGroup,
    unfollowGroup,
    checkFollowStatus,
  } = useProfileGroupFollows();

  const {
    data: follow,             // null | { … }
    isLoading: loadingFollow,
  } = checkFollowStatus(groupData.id, user?.id);

  const isFollowing = Boolean(follow);

  const toggleFollow = async () => {
    if (loadingFollow || !user) return;
    if (isFollowing) await unfollowGroup({
      profile_group_id: groupData.id,
      follower_profile_id: user.id,
    });
    else await followGroup({
      profile_group_id: groupData.id,
      follower_profile_id: user.id,
    });
  };

  /* ───── badge helpers ───── */
  const badgeClasses = isFollowing
    ? "bg-neutral-900 hover:bg-amber-950"
    : "bg-amber-950 hover:bg-gray-900/60";

  const badgeLabel = isFollowing
    ? t("badges.status.following")
    : t("badges.status.follow");

  const badgeIcon = isFollowing 
    ? <HiStar  className="text-amber-600" /> 
    : <HiOutlineStar className="text-amber-600" />;

  return (
    <div className="relative bg-gradient-to-r md:min-w-2xl lg:min-w-4xl from-amber-950 to-amber-800 mb-4 p-4 rounded-b-lg">
      {/* avatar + meta + top‑right icons */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4 flex-grow">
          <ProfileAvatar
            avatar_url={groupData.avatar_url}
            className="flex-shrink-0 !w-24 !h-24"
          />
          <div className="flex flex-col gap-2 flex-grow">
            <h1 className="text-2xl sm:text-3xl font-bold text-white break-words">
              {groupData.name}
            </h1>
            <p className="text-gray-200 break-words">{groupData.bio}</p>
          </div>
        </div>

        {/* right side icons */}
        <div className="flex gap-4 ml-auto items-center mb-auto">
          {isAdmin && (
            <IoIosSettings
              className="w-8 h-8 text-white cursor-pointer"
              onClick={() => navigate(`${basePath}/settings`)}
              title={t("btnTitles.settings")}
            />
          )}

          {/* <BsFillBellFill
            className="w-7 h-7 text-white cursor-pointer"
            onClick={() => navigate(`${basePath}/notifications`)}
            title={t("btnTitles.notifications")}
          /> */}
        </div>
      </div>

      {/* navigation buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-end mt-6 flex-wrap">
        {!isAdmin && user && (
          <button
            onClick={toggleFollow}
            disabled={loadingFollow}
            title={isFollowing ? t("btnTitles.unfollow") : t("btnTitles.follow")}
            className={`${badgeClasses} cursor-pointer mr-auto mt-auto w-full justify-center md:w-auto inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition`}
          >
            {badgeIcon}
            {badgeLabel}
          </button>
        )}
        <div>
          <div className="mb-4">
            <Button className={navBtnCls} onClick={() => navigate(basePath)}>
              {t("nav.about")}
            </Button>
          </div>
          <div className="sm:mb-4">
            <Button 
            className={navBtnCls} 
            onClick={() => navigate(`${basePath}/posts`)}
            >
              {t("nav.posts")}
            </Button>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <Button className={navBtnCls} onClick={() => navigate(basePath)}>
              {t("nav.media")}
            </Button>
          </div>
          {isAdmin && (
            <div className="sm:mb-4">
              <Button className={navBtnCls} onClick={() => navigate(`${basePath}/calendar`)}>
                {t("nav.calendar")}
              </Button>
            </div>
          )}
        </div>        
      </div>

      {/* Follow badge in bottom left corner */}
      {/* {!isAdmin && user && (
        <button
          onClick={toggleFollow}
          disabled={loadingFollow}
          title={
            isFollowing
              ? t("btnTitles.unfollow")
              : t("btnTitles.follow")
          }
          className={`${badgeClasses} cursor-pointer inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition
                      absolute bottom-4 left-4`}
        >
          {badgeIcon}
          {badgeLabel}
        </button>
      )} */}
    </div>
  );
};

export default GroupHeader;

import { useNavigate } from "react-router-dom";
import ProfileAvatar from "../ProfileAvatar";
import Button from "../../ui/Button";

import { IoIosSettings }   from "react-icons/io";
import { BsFillBellFill }  from "react-icons/bs";

const GroupHeader = ({ groupData, isAdmin }) => {
  const navigate  = useNavigate();
  const basePath  = `/group/${groupData.id}`;
  const navBtnCls = "!bg-sky-700 hover:!bg-sky-800";

  return (
    <div className="bg-gradient-to-l md:min-w-2xl lg:min-w-4xl from-amber-950 to-amber-800 mb-4 p-4 rounded-b-lg">
      {/* avatar and info + top-right icons */}
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

        <div className="flex gap-4 ml-auto items-center">
          {isAdmin && (
            <IoIosSettings
              className="w-8 h-8 text-white cursor-pointer"
              onClick={() => navigate(`${basePath}/settings`)}
              title="Group settings"
            />
          )}

          <BsFillBellFill
            className="w-7 h-7 text-white cursor-pointer"
            onClick={() => navigate(`${basePath}/notifications`)}
            title="Group notifications"
          />
        </div>
      </div>

      {/* navigation buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-center sm:justify-end mt-6">
        <div>
          <div className="mb-4">
            <Button className={navBtnCls} onClick={() => navigate(basePath)}>
              About
            </Button>
          </div>
          <div className="sm:mb-4">
            <Button className={navBtnCls} onClick={() => navigate(`${basePath}/posts`)}>
              Posts
            </Button>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <Button className={navBtnCls} onClick={() => navigate(`${basePath}/`)}>
              vamo'a've
            </Button>
          </div>

          {isAdmin && (
            <div className="sm:mb-4">
              <Button className={navBtnCls} onClick={() => navigate(`${basePath}/calendar`)}>
                Calendar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupHeader;

import ProfileAvatar from "../ProfileAvatar";
import Button from "../../ui/Button"; // Import the Button component
import { useView } from "../../../context/ViewContext"; // Context to manage views

const GroupHeader = ({ groupData, isAdmin }) => {
  const { manageView } = useView(); // Manage internal/external views

  return (
    <div className="bg-gradient-to-l from-amber-800 to-amber-950 mb-4 p-4 rounded-b-lg">
      <div className="flex items-center gap-4">
        <ProfileAvatar avatar_url={groupData.avatar_url} />
        <div>
          <h1 className="text-3xl font-bold text-gray-100">{groupData.name}</h1>
          <p className="text-gray-400">{groupData.bio}</p>
        </div>
      </div>

      {/* Buttons for managing views */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end mt-4">
        {/* View Posts Button (Visible to Everyone) */}
        <div>
          <div className="sm:mb-4">
            <Button
              onClick={() => manageView("posts", "group")}
            >
              View Posts
            </Button>
          </div>
        </div>

        {/* Admin-Only Buttons */}
        <div>
          {isAdmin && (
            <>
              {/* Edit Group Button */}
              <div className="mb-4">
                <Button
                  onClick={() => manageView("edit", "group")}
                >
                  Edit Group
                </Button>
              </div>

              {/* Manage Members Button */}
              <div className="sm:mb-4">
                <Button
                  onClick={() => manageView("members", "group")}
                >
                  Manage Members
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupHeader;
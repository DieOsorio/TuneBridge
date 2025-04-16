import ProfileAvatar from "../profiles/ProfileAvatar";

function CommentCard({ 
  comment, 
  profile, 
  onDelete, 
  onEdit, 
  isMenuOpen, 
  setOpenMenuId,
  isEditing,
  editedContent,
  setEditedContent,
  onSaveEdit 
}) {
  const handleMenuToggle = () => {
    setOpenMenuId(isMenuOpen ? null : comment.id);
  };

  return (
    <div className="flex items-start mb-4">
      {/* profile avatar from comment sender */}
      <ProfileAvatar 
      avatar_url={profile?.avatar_url} 
      className="!w-8 !h-8 mr-3" />

      <div className="bg-gray-100 dark:bg-zinc-800 p-3 rounded-lg shadow-sm max-w-xl w-full">
        <div className="flex justify-between items-center">

          {/* username from comment sender */}
          <div className="font-semibold text-zinc-700 dark:text-zinc-200">
            {profile?.username || "Anonymous"}
          </div>

          {/* menu */}
          <div className="relative">
            {/* three dots to open menu options for comment */}
            <button
              onClick={handleMenuToggle}
              className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-xl px-2"
            >
              ⋮
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded shadow-lg z-10">
                {/* edit comment option */}
                <button
                  onClick={() => onEdit(comment)}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Edit
                </button>

                {/* delete comment option */}
                <button
                  onClick={() => onDelete(comment)}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* date the comment was submitted */}
        <div className="text-xs text-zinc-400 ml-2">
          {new Date(comment.created_at).toLocaleString()}
        </div>
        
        {/* comment submitted on this post */}
        <div className="text-zinc-600 dark:text-zinc-300 mt-1">{comment.content}</div>
        
        {/* like and reply options */}
        <div className="flex gap-4 mt-2 text-xs text-sky-700 dark:text-sky-400">
          <button className="hover:underline">like</button>
          <button className="hover:underline">reply</button>
        </div>
      </div>
      {/* comment on edition mode or normal */}
    `{isEditing ? (
      <div className="mt-2 w-70">
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full p-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 resize-none"
          rows={2}
        />
        <div className="flex gap-2 mt-2 justify-center">
          <button
            onClick={() => onSaveEdit(comment.id, comment.post_id)}
            className="px-3 py-1 w-16 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
          >
            Save
          </button>
          <button
            onClick={() => {
              setEditedContent('');
              onEdit(null); // salir del modo edición
            }}
            className="px-3 py-1 w-16 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
        ) : (
          ""
        )}
    </div>
  );
}

export default CommentCard;

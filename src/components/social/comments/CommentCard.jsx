import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import ProfileAvatar from "../../profiles/ProfileAvatar";
import ReplyForm from "./ReplyForm";
import EditCommentBox from "./EditCommentBox";
import CommentMenu from "./CommentMenu";
import { IoIosArrowDown, IoIosArrowUp} from "react-icons/io";
import { useView } from "../../../context/ViewContext";
import { useLikes } from "../../../context/social/LikesContext";

function CommentCard({ 
  comment, // comment object
  profile, // profile asociated with comment
  onDelete, // delete comment functionality
  onSaveEdit, // update comment functionality
  replies = [],
  profilesMap, 
  onReplySubmit,
  currentUserId 
}) {
  const { manageView } = useView();
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState(""); // manage local reply content
  const [localOpenMenuId, setLocalOpenMenuId] = useState(null); // manage local edit/delete menu
  const [isEditing, setIsEditing] = useState(false); // manage editing comment box
  const [editedContent, setEditedContent] = useState(comment.content); // manage the edited content
  const {
    commentLikesQuery,
    insertLike,
    deleteLike,
  } = useLikes();
  const {
    data: likes = [],
    isLoading: likesLoading,
  } = commentLikesQuery(comment.id);
  

  const isMenuOpen = localOpenMenuId === comment.id; 
  const isOwner = currentUserId === comment.profile_id; // check if logged user has a comment submited

  const menuRef = useRef(null); // use this ref to close the menu when the user clicks outside of it

  //handle the detection of clicks outside the menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setLocalOpenMenuId(null);
      }
    }
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);
  
  // filter the likes asociated with a specific comment
  const commentLikes = () => {  
    return likes?.filter((like) => like.comment_id === comment.id) || [];
  }
  // check if the logged user has liked the comment/comments
  const hasLiked = () => {  
    return commentLikes().some((like) => like.profile_id === currentUserId);
  }
  // return that specific like
  const existingLike = () => {
    return commentLikes().find((like) => like.profile_id === currentUserId);
  };

  // if the user already liked the comment, delete the like, otherwise insert a like
  const toggleLike = async () => {
    if (!currentUserId) return;
    const like = existingLike();
    
    if (like) {
      await deleteLike(like);
    } else {
      await insertLike({ comment_id: comment.id, profile_id: currentUserId });
    }
  };

  const handleReplySubmit = useCallback(() => {
    if (replyContent.trim() === "") return;
    
    onReplySubmit({
      content: replyContent,
      parent_id: comment.id,
    });
    setReplyContent("");
    setShowReplyForm(false);
  }, [replyContent, comment.id, onReplySubmit]);

  const onCancelReply = useCallback(() => {
    setReplyContent('');
    setShowReplyForm(false);
  }, []);

  const onSave = useCallback(() => {
    onSaveEdit(comment.id, comment.post_id, editedContent);
    setIsEditing(false);
  }, [comment.id, comment.post_id, editedContent, onSaveEdit]);

  const onCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditedContent(comment.content);
  },[comment.content]);

  const onMenu = useCallback(() => {
    setLocalOpenMenuId(isMenuOpen ? null : comment.id);
  }, [comment.id]);

  const visibleReplies = showAllReplies ? replies.slice(-10) : [];

  return (
    <div className="flex mb-4">
      {/* profile avatar from comment sender */}
      <Link 
      onClick={() => manageView("about", "profile")} 
      to={`/profile/${profile?.id}`}>

        <ProfileAvatar 
          avatar_url={profile?.avatar_url} 
          className="!w-8 !h-8 mr-3 flex-shrink-0" 
        />

      </Link>
      {/* comment box */}
      <div className="flex flex-col w-full">
        <div className="bg-gray-100 dark:bg-zinc-900 p-3 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            {/* username from comment sender */}
            <div className="font-semibold text-zinc-700 dark:text-zinc-300">
              {profile?.username || "Anonymous"}
            </div>

            <div className="flex items-center gap-2">
              {/* date the comment was made/update */}
            <div className="text-xs text-zinc-500">
            {new Date(comment.updated_at || comment.created_at).toLocaleString()}
            </div>
  
            {/* menu */}
            {isOwner && (
              <CommentMenu
                menuRef={menuRef}
                onDelete={() => onDelete(comment)}
                onEdit={() => setIsEditing(true)}
                onMenu={() => onMenu()}
                isMenuOpen={isMenuOpen}
              />
            )}
            </div>

          </div>          
  
          <div className="text-zinc-600 dark:text-zinc-300 mt-1">{comment.content}</div>
          
          {/* like and reply comment */}
          <div className="flex gap-4 mt-2 text-xs text-sky-700 dark:text-sky-500">
          <button 
            className="flex items-center gap-1 hover:underline disabled:opacity-50"
            onClick={toggleLike}
            disabled={likesLoading}
          >
            <span>{hasLiked() ? "Liked" : "Like"}</span>
            <span>{commentLikes().length}</span>
          </button>

            <button 
              className="hover:underline"
              onClick={() => setShowReplyForm(!showReplyForm)}
              >
              reply
            </button>
          </div>
        </div>
  
        {/* edition mode below */}
        {isEditing && (
          <EditCommentBox
          value={editedContent} 
          onChange={setEditedContent} 
          onSave={onSave} 
          onCancel={onCancelEdit}
          />
        )}

        {/* reply form */}
        {showReplyForm && (
          <ReplyForm 
            value={replyContent}
            onChange={setReplyContent}
            onSubmit={handleReplySubmit}
            onCancel={onCancelReply}
          />
          )}

          {/* replies */}
          {replies.length > 0 && (
            <div className="mt-4 border-zinc-300 dark:border-zinc-700">
              {/* Toggle Button */}
              <button 
                onClick={() => setShowAllReplies(!showAllReplies)} 
                className="flex items-center gap-1 text-sm font-bold text-sky-600 mb-1 hover:underline"
              >
                <>
                  {showAllReplies ? <IoIosArrowUp /> : <IoIosArrowDown />}
                  {replies.length} {replies.length === 1 ? "reply" : "replies"}
                </>
              </button>

              {/* Replies */}
              {showAllReplies && visibleReplies.map(reply => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  profile={profilesMap[reply.profile_id]}
                  onDelete={onDelete}
                  onSaveEdit={onSaveEdit}
                  replies={reply.replies || []}
                  profilesMap={profilesMap}
                  onReplySubmit={onReplySubmit}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
      </div>
    </div>
  );  
};

export default memo(CommentCard);

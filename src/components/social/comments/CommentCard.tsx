import {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  MutableRefObject,
} from "react";
import { Link } from "react-router-dom";
import ProfileAvatar from "../../profiles/ProfileAvatar";
import ReplyForm from "./ReplyForm";
import EditCommentBox from "./EditCommentBox";
import CommentMenu from "./CommentMenu";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useLikes } from "../../../context/social/LikesContext";
import { useTranslation } from "react-i18next";
import { Comment } from "../../../context/social/commentsActions";
import { Like } from "../../../context/social/likesActions";
import { Profile } from "../../../context/profile/profileActions";

type ProfilesMap = Record<string, Profile>;

type CommentCardProps = {
  comment: Comment;
  profile: Profile | undefined;
  onDelete: (comment: Comment) => void;
  onSaveEdit: (id: string, postId: string, content: string) => void;
  replies?: Comment[];
  profilesMap: ProfilesMap;
  onReplySubmit: (reply: { content: string; parent_id: string }) => void;
  currentUserId: string | null;
};

const CommentCard = ({
  comment,
  profile,
  onDelete,
  onSaveEdit,
  replies = [],
  profilesMap,
  onReplySubmit,
  currentUserId,
}: CommentCardProps) => {
  const { t } = useTranslation("comments");
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [localOpenMenuId, setLocalOpenMenuId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);

  const { commentLikesQuery, insertLike, deleteLike } = useLikes();
  const {
    data: likes = [],
    isLoading: likesLoading,
  } = commentLikesQuery(comment.id);

  const isMenuOpen = localOpenMenuId === comment.id;
  const isOwner = currentUserId === comment.profile_id;

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setLocalOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const commentLikes = (): Like[] =>
    likes?.filter((like) => like.comment_id === comment.id) || [];

  const hasLiked = () =>
    commentLikes().some((like) => like.profile_id === currentUserId);

  const existingLike = () =>
    commentLikes().find((like) => like.profile_id === currentUserId);

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
    setReplyContent("");
    setShowReplyForm(false);
  }, []);

  const onSave = useCallback(() => {
    onSaveEdit(comment.id, comment.post_id, editedContent);
    setIsEditing(false);
  }, [comment.id, comment.post_id, editedContent, onSaveEdit]);

  const onCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditedContent(comment.content);
  }, [comment.content]);

  const onMenu = useCallback(() => {
    setLocalOpenMenuId(isMenuOpen ? null : comment.id);
  }, [comment.id, isMenuOpen]);

  const visibleReplies = showAllReplies ? replies.slice(-10) : [];

  return (
    <div className="flex mb-4">
      <Link to={`/profile/${profile?.id}`}>
        <ProfileAvatar
          avatar_url={profile?.avatar_url}
          className="!w-8 !h-8 mr-3 flex-shrink-0"
          alt={`${profile?.username}'s avatar`}
          gender={profile?.gender}
        />
      </Link>

      <div className="flex flex-col w-full">
        <div className="bg-zinc-900 p-3 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div className="font-semibold text-zinc-700 dark:text-zinc-300">
              {profile?.username || t("card.anonymous")}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs text-zinc-500">
                {new Date(comment.updated_at || comment.created_at).toLocaleString()}
              </div>

              {isOwner && (
                <CommentMenu
                  menuRef={menuRef}
                  onDelete={() => onDelete(comment)}
                  onEdit={() => setIsEditing(true)}
                  onMenu={onMenu}
                  isMenuOpen={isMenuOpen}
                />
              )}
            </div>
          </div>

          <div className="text-zinc-600 dark:text-zinc-300 mt-1">{comment.content}</div>

          <div className="flex gap-4 mt-2 text-xs text-sky-700 dark:text-sky-500">
            <button
              className="flex items-center gap-1 hover:underline disabled:opacity-50"
              onClick={toggleLike}
              disabled={likesLoading}
            >
              <span>{hasLiked() ? t("card.liked") : t("card.like")}</span>
              <span>{commentLikes().length}</span>
            </button>

            <button
              className="hover:underline"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              {t("card.reply")}
            </button>
          </div>
        </div>

        {isEditing && (
          <EditCommentBox
            value={editedContent}
            onChange={setEditedContent}
            onSave={onSave}
            onCancel={onCancelEdit}
          />
        )}

        {showReplyForm && (
          <ReplyForm
            value={replyContent}
            onChange={setReplyContent}
            onSubmit={handleReplySubmit}
            onCancel={onCancelReply}
          />
        )}

        {replies.length > 0 && (
          <div className="mt-4 border-zinc-300 dark:border-zinc-700">
            <button
              onClick={() => setShowAllReplies(!showAllReplies)}
              className="flex items-center gap-1 text-sm font-bold text-sky-600 mb-1 hover:underline"
            >
              <>
                {showAllReplies ? <IoIosArrowUp /> : <IoIosArrowDown />}
                {replies.length === 1
                  ? t("card.replies", { count: replies.length })
                  : t("card.repliesPlural", { count: replies.length })}
              </>
            </button>

            {showAllReplies &&
              visibleReplies.map((reply) => (
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

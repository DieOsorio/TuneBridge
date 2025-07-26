import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import ProfileAvatar from "../../profiles/ProfileAvatar";
import { useComments } from "../../../context/social/CommentsContext";
import CommentCard from "./CommentCard";
import Loading from "../../../utils/Loading";
import { Link } from "react-router-dom";
import { useProfile } from "../../../context/profile/ProfileContext";
import { useTranslation } from "react-i18next";
import { Comment } from "../../../context/social/commentsActions";

type CommentsBoxProps = {
  postId: string;
};

type CommentFormInputs = {
  comment: string;
};

function CommentsBox({ postId }: CommentsBoxProps) {
  const { t } = useTranslation("comments");
  const { user } = useAuth(); // logged user
  const { fetchProfile, profilesMap } = useProfile();
  const { data: profile, isLoading } = fetchProfile(user?.id ?? null); // logged user data
  const {
    fetchComments,
    insertComment,
    updateComment,
    deleteComment,
  } = useComments(); // manage comments CRUD
  const { data: comments, isLoading: isCommentsLoading } = fetchComments(postId); // comments of post

  const [showAll, setShowAll] = useState(false); // show/hide all comments

  // collect all profile IDs from comments and replies recursively
  const profileIds = collectProfileIds(comments ?? []);
  const { data: profileMap, isLoading: profilesLoading } = profilesMap(profileIds);

  // react-hook-form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormInputs>();

  const loading = profilesLoading || isCommentsLoading || isLoading;

  if (loading) return <Loading />;

  // Submit new comment
  const onSubmit: SubmitHandler<CommentFormInputs> = async (data) => {
    if (!user?.id) return;
    const commentToInsert = {
      post_id: postId,
      profile_id: user.id,
      content: data.comment,
    };

    try {
      await insertComment(commentToInsert);
      reset();
    } catch (error) {
      console.error("Couldn't insert comment", error);
    }
  };

  // Delete comment handler
  const handleDeleteComment = async (comment: Comment) => {
    try {
      await deleteComment(comment);
    } catch (error) {
      console.error("Error trying to delete comment", error);
    }
  };

  // Save edited comment handler
  const handleSaveEditedComment = async (
    commentId: string,
    postId: string,
    editedContent: string
  ) => {
    try {
      await updateComment({
        id: commentId,
        post_id: postId,
        updatedComment: {
          content: editedContent,
          updated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error updating comment", error);
    }
  };

  // Reply submit handler
  const onReplySubmit = async (data: { content: string; parent_id?: string | null }) => {
    if (!user?.id) return;
    const commentToInsert = {
      post_id: postId,
      profile_id: user.id,
      content: data.content,
      parent_id: data.parent_id ?? null,
    };

    try {
      await insertComment(commentToInsert);
    } catch (error) {
      console.error("Could not insert reply", error);
    }
  };

  return (
    <div className="w-full mt-4 border-t pt-4 text-sm text-zinc-800 dark:text-zinc-100">
      <div className="mb-4">
        {/* Load more comments button if more than 2 */}
        {comments?.length && comments.length > 2 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="mb-4 text-sky-700 dark:text-sky-400 text-sm hover:underline"
          >
            {t("box.loadMore")}
          </button>
        )}

        {/* Render comments */}
        {(showAll ? comments : comments?.slice(-2))?.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            profile={profileMap?.[comment.profile_id]}
            onDelete={handleDeleteComment}
            onSaveEdit={handleSaveEditedComment}
            replies={comment.replies}
            profilesMap={profileMap ?? {}}
            onReplySubmit={onReplySubmit}
            currentUserId={user?.id ?? null}
          />
        ))}

        {/* No comments message */}
        {comments?.length === 0 && (
          <p className="italic text-zinc-600">{t("box.noComments")}</p>
        )}
      </div>

      {/* Comment form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-3 mt-4">
        <Link to={`/profile/${profile?.id}`}>
          <ProfileAvatar
            avatar_url={profile?.avatar_url}
            className="!w-10 !h-10"
            gender={profile?.gender}
            alt={`${profile?.username}'s avatar`}
          />
        </Link>

        <div className="flex-1">
          <textarea
            {...register("comment", { required: true })}
            placeholder={t("box.placeholder")}
            className="w-full p-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 resize-none"
            rows={2}
          />

          <button
            type="submit"
            className="mt-2 px-4 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded-md text-sm"
          >
            {t("box.send")}
          </button>

          {errors.comment && (
            <span className="text-red-500 text-xs">{t("box.error")}</span>
          )}
        </div>
      </form>
    </div>
  );
}

function collectProfileIds(comments: Comment[] = []): string[] {
  const ids = new Set<string>();

  function recurse(commentsArr: Comment[]) {
    for (const c of commentsArr) {
      if (c.profile_id) ids.add(c.profile_id);
      if (Array.isArray(c.replies) && c.replies.length > 0) {
        recurse(c.replies);
      }
    }
  }

  recurse(comments);
  return Array.from(ids);
}

export default CommentsBox;

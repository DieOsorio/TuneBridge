import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProfileAvatar from '../profiles/ProfileAvatar';
import { useComments } from '../../context/social/CommentsContext';
import { useProfileQuery, useProfilesMap } from '../../context/profile/profileActions';
import CommentCard from './CommentCard';

function CommentsBox({ postId }) {
  const { user } = useAuth();
  const { data: profile } = useProfileQuery(user?.id);
  const { useFetchComments, useInsertComment, useUpdateComment, useDeleteComment } = useComments();
  const { data: comments } = useFetchComments(postId)
  const [showAll, setShowAll] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  // helper states to edit the comment
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  
  // obtain all the data (id, avatar_url and username) for each profile that left a comment
  const profileIds = comments?.map(comment => comment.profile_id) ?? [];
  const { data: profileMap, isLoading: profilesLoading} = useProfilesMap(profileIds);
  
  // Form with react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();


  // Send new comment
  const onSubmit = async (data) => {
    const comment = {
      post_id: postId,
      profile_id: user.id,
      content: data.comment,
    };

    try {
      await useInsertComment(comment);

      reset();
    } catch (error) {
      console.error("Could't insert comment", error)
    }
  };

  // Delete comment
  const handleDeleteComment = async (comment) => {
    try {
      await useDeleteComment( comment );
    } catch (error) {
      console.error("error trying to delete comment", error);      
    } finally {
      setOpenMenuId(null);
    }
  };

  // Edit comment
  const handleEditComment = (comment) => {
    if (!comment) {
      setEditingCommentId(null);
      setEditedContent("");
      return;
    }

    setEditingCommentId(comment.id);
    setEditedContent(comment.content);
    setOpenMenuId(null);
  };

  const handleSaveEditedComment = async (commentId, postId) => {
    try {
      await useUpdateComment({ 
        id: commentId,
        post_id: postId, 
        updatedComment: {
          content: editedContent,
          updated_at: new Date().toISOString()
        } });

      setEditingCommentId(null);
      setEditedContent("");
    } catch (error) {
      console.error("Error updating comment", error);      
    }
  }

  return (
    <div className="max-w-2xl w-full mx-auto mt-4 border-t pt-4 text-sm text-zinc-800 dark:text-zinc-100">
      <div className="mb-4">

        {/* if there is more than 2 comments, make "more comments" option visible */}
        {comments?.length > 2 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="mb-4 text-sky-700 dark:text-sky-400 text-sm hover:underline"
          >
            More comments...
          </button>
        )}
  
        {/* iterate comments from this post */}
        {(showAll ? comments : comments?.slice(-2))?.map(comment => (
          <CommentCard
          key={comment.id}
          comment={comment}
          profile={profileMap?.[comment.profile_id]}
          onDelete={handleDeleteComment}
          onEdit={handleEditComment}
          isMenuOpen={openMenuId === comment.id}
          setOpenMenuId={setOpenMenuId}
          isEditing={editingCommentId === comment.id}
          editedContent={editedContent}
          setEditedContent={setEditedContent}
          onSaveEdit={handleSaveEditedComment}
          />
        ))}

        {/* if there is no comments yet */}
        {comments?.length === 0 && (
          <p className="italic text-zinc-500">Be the first one to comment on this posts.</p>
        )}
      </div>
  
      {/* Form to send comment */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-3 mt-4">
        <ProfileAvatar avatar_url={profile.avatar_url} className="!w-10 !h-10" />

        {/* write a comment */}
        <div className="flex-1">          
          <textarea
            {...register('comment', { required: true })}
            placeholder="Write a comment..."
            className="w-full p-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 resize-none"
            rows={2}
          />
          {errors.comment && (
            <span className="text-red-500 text-xs">Write something.</span>
          )}

          {/* submit comment */}
          <button
            type="submit"
            className="mt-2 px-4 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded-md text-sm"
          >
            Send
          </button>

        </div>
      </form>
    </div>
  );  
}

export default CommentsBox;

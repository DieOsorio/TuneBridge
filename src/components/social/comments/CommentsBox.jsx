import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import ProfileAvatar from '../../profiles/ProfileAvatar';
import { useComments } from '../../../context/social/CommentsContext';
import CommentCard from './CommentCard';
import Loading from "../../../utils/Loading"
import { Link } from 'react-router-dom';
import { useView } from '../../../context/ViewContext';
import { useProfile } from '../../../context/profile/ProfileContext';

function CommentsBox({ postId }) {
  const { manageView } = useView();
  const { user } = useAuth(); // logged user
  const { fetchProfile, profilesMap } = useProfile();
  const { data: profile } = fetchProfile(user?.id); // retrieve logged users data
  const { 
    fetchComments, 
    insertComment, 
    updateComment, 
    deleteComment, 
    isLoading: isCommentsLoading 
  } = useComments(); // to manage comments CRUD
  const { data: comments } = fetchComments(postId) // retrieve comments from a specific post
  const [showAll, setShowAll] = useState(false);// show/hide all comments
  // obtain all the data (id, avatar_url and username) for each profile that left a comment
  const profileIds = comments?.map(comment => comment.profile_id) ?? [];
  const { data: profileMap, isLoading: profilesLoading} = profilesMap(profileIds);  
  
  // Form with react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  if (profilesLoading || isCommentsLoading)  return <Loading />;

  // Send new comment
  const onSubmit = async (data) => {
    const comment = {
      post_id: postId,
      profile_id: user.id,
      content: data.comment,
    };

    try {
      await insertComment(comment);

      reset();
    } catch (error) {
      console.error("Could't insert comment", error)
    }
  };

  // Delete comment
  const handleDeleteComment = async (comment) => {
    try {
      await deleteComment( comment );
    } catch (error) {
      console.error("error trying to delete comment", error);      
    }
  };

  const handleSaveEditedComment = async (commentId, postId, editedContent) => {
    try {
      await updateComment({ 
        id: commentId,
        post_id: postId, 
        updatedComment: {
          content: editedContent,
          updated_at: new Date().toISOString()
        }});
    } catch (error) {
      console.error("Error updating comment", error);      
    }
  }

  // function to handle the reply
  const onReplySubmit = async (data) => {
    const comment = {
      post_id: postId,
      profile_id: user.id,
      content: data.content,
      parent_id: data.parent_id ?? null,
    }

    try {
      await insertComment(comment);
    } catch (error) {
      console.error("Could not insert reply", error);
      
    }
  }

  return (
    <div className="w-full mt-4 border-t pt-4 text-sm text-zinc-800 dark:text-zinc-100">
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
          onSaveEdit={handleSaveEditedComment}
          replies={comment.replies}
          profilesMap={profileMap}
          onReplySubmit={onReplySubmit}
          currentUserId={user.id}
          />
        ))}

        {/* if there is no comments yet */}
        {comments?.length === 0 && (
          <p className="italic text-zinc-600">Be the first one to comment on this posts.</p>
        )}
      </div>
  
      {/* Form to send comment */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-3 mt-4">
        <Link
        onClick={() => manageView("about", "profile")} 
        to={`/profile/${profile.id}`}>
          <ProfileAvatar avatar_url={profile.avatar_url} className="!w-10 !h-10" />
        </Link>

        {/* write a comment */}
        <div className="flex-1">          
          <textarea
            {...register('comment', { required: true })}
            placeholder="Write a comment..."
            className="w-full p-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 resize-none"
            rows={2}
          />

          {/* submit comment */}
          <button
            type="submit"
            className="mt-2 px-4 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded-md text-sm"
            >
            Send
          </button>
          
          {/* error on submit */}
          {errors.comment && (
            <span className="text-red-500 text-xs">Write something.</span>
          )}
        </div>
      </form>
    </div>
  );  
}

export default CommentsBox;

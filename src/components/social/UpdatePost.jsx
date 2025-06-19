import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { usePosts } from "../../context/social/PostsContext";
import Button from "../ui/Button";
import Input from "../ui/Input";
import ImageUploader from "../../utils/ImageUploader";
import { useUploadPostImages } from "../../context/social/imagesActions";
import Loading from "../../utils/Loading";
import ErrorMessage from "../../utils/ErrorMessage";
import { supabase } from "../../supabase";
import { useHashtags } from "../../context/social/HashtagsContext";
import { usePostHashtags } from "../../context/social/PostHashtagsContext";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "../ui/ConfirmDialog";
import Textarea from "../ui/Textarea";

const UpdatePost = () => {
  const { t } = useTranslation("posts")
  const { postId } = useParams();
  const [images, setImages] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { fetchPost, updatePost, deletePost } = usePosts();
  const { upsertHashtag } = useHashtags();
  const { getHashtagsByPostId, deletePostHashtags, upsertPostHashtag } = usePostHashtags();
  const { 
    data: hashtagsData, 
    isLoading: hashtagsLoading, 
    error: hashtagsError 
  } = getHashtagsByPostId(postId);
  const { 
    data: postData, 
    isLoading, 
    error 
  } = fetchPost(postId);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();
  const uploadImageMutations = useUploadPostImages();
  const navigate = useNavigate();

  // Load post data into form
  useEffect(() => {
    if (postData) {
      setValue("title", postData.title);
      setValue("content", postData.content);
      setImages(postData.images_urls || []);

      // Load hashtags for this post
      if (hashtagsData) {
        const hashtags = hashtagsData.map((hashtag) => hashtag.hashtags.name).join(" ");
        
        setValue("hashtags", hashtags);
      } 
    }
  }, [postData, setValue, getHashtagsByPostId]);

  const onFileUpdate = (files) => {
    setImages((prevImages) => {
      const newFiles = files.filter(
        (file) => !prevImages.some((img) => img.name === file.name)
      );
      return [...prevImages, ...newFiles];
    });
  };

  const handleDeleteImage = async (imageUrl) => {
    try {
      const fileName = imageUrl.split("/").pop();
      const { error: deleteError } = await supabase.storage
        .from("post-media")
        .remove([fileName]);

      if (deleteError) throw new Error(deleteError.message);

      const updatedImages = images.filter((img) => img !== imageUrl);
      await updatePost({
        id: postData.id,
        updatedPost: {
          ...postData,
          images_urls: updatedImages,
        },
      });

      setImages(updatedImages);
    } catch (err) {
      console.error("Error deleting image:", err.message);
    }
  };

  const onSubmit = async (formData) => {
    const { hashtags, ...cleanPostData } = formData;

    if (!postData?.id) {
    console.error("Post ID not available. Cannot proceed with update.");
    return;
  }

    try {
      // Upload new images and retain existing ones
      const uploadedImagesURLs = await Promise.all(
        images.map(async (file, index) => {
          if (typeof file === "string") return file;
          const filename = `${Date.now()}-${index}-${file.name}`;
          return await uploadImageMutations.mutateAsync({
            file,
            userId: postData.profile_id,
            postId: postData.id,
            filename,
          });
        })
      );

      // Update post content and images
      await updatePost({
        id: postData.id,
        updatedPost: {
          ...cleanPostData,
          images_urls: uploadedImagesURLs,
        },
      });

      // Remove old associations
      await deletePostHashtags({post_id: postData.id}); 

      const parsedHashtags = hashtags
        .split(/\s+/)
        .map((tag) => tag.trim())
        .filter(Boolean);

      const upsertedHashtags = await Promise.all(
        parsedHashtags.map((tag) => upsertHashtag({ name: tag }))
      );

      await Promise.all(
        upsertedHashtags.map((hashtag) =>
          upsertPostHashtag({ post_id: postData.id, hashtag_id: hashtag.id })
        )
      );

      navigate(`/profile/${postData.profile_id}`);
    } catch (err) {
      console.error("Error updating post:", err.message);
    }
  };

  const handleDeletePost = async () => {
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
  try {
    await deletePost(postData.id);
    navigate(`/profile/${postData.profile_id}`);
  } catch (error) {
    console.error("Error deleting post:", error.message);
  } finally {
    setIsConfirmOpen(false);
  }
};

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error.message} />;

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-100 text-center mb-4">
        {t("update.title")}
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 bg-gradient-to-r from-gray-900 p-6 rounded-lg shadow-md max-w-xl mx-auto"
      >
        <Input
          id="title"
          label={t("update.labels.title")}
          placeholder={t("update.placeholders.title")}
          register={register}
          required={t("update.errors.title")}
          error={errors.title}
          classForLabel="text-gray-400 text-center md:text-left"
        />

        <Textarea
          id="content"
          label={t("update.labels.content")}
          placeholder={t("update.placeholders.content")}
          register={register}
          validation={{
            maxLength: {
              value: 100,
              message: t("update.errors.content"),
            }
          }}
          error={errors.content}
          maxLength={100}
          watchValue={watch("content")}
          classForLabel="text-gray-400" 
        />

        <Input
          id="hashtags"
          label={t("update.labels.hashtags")}
          placeholder={t("update.placeholders.hashtags")}
          register={register}
          validation={{}}
          error={errors.hashtags?.message}
          classForLabel="text-gray-400 text-center md:text-left"
        />

        {/* Existing Images */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            {t("update.labels.existingImages")}
          </label>
          <div className="flex flex-wrap gap-4">
            {images
              .filter((img) => typeof img === "string")
              .map((imageUrl, index) => (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt={`Post image ${index}`}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(imageUrl)}
                    className="absolute top-1 right-1 bg-red-600 w-9 h-9 text-white rounded-full p-1 hover:bg-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
          </div>
        </div>

        <ImageUploader
          amount={3}
          onFilesUpdate={onFileUpdate}
          classForLabel="text-gray-400 text-center md:text-left"
        />

        <div className="flex justify-center gap-4">
          <Button
            type="button"
            onClick={() => navigate("/explore")}
            className="!bg-gray-500 hover:!bg-gray-600"
          >
            {t("update.buttons.cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("update.buttons.updating") : t("update.buttons.update")}
          </Button>
          <Button
            type="button"
            onClick={handleDeletePost}
            className="px-4 py-2 !bg-red-600 hover:!bg-red-700"
          >
            {t("update.buttons.delete")}
          </Button>
        </div>
      </form>

       <ConfirmDialog
          isOpen={isConfirmOpen}
          title={t("update.buttons.delete")}
          message={t("update.errors.confirmDelete")}
          onConfirm={confirmDelete}
          onCancel={() => setIsConfirmOpen(false)}
          confirmLabel={t("update.buttons.delete")}
          color={"error"}
          cancelLabel={t("update.buttons.cancel")}
        />
    </>
  );
};

export default UpdatePost;

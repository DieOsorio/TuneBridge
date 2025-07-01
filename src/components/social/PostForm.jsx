import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { usePosts } from "../../context/social/PostsContext";
import { useUploadPostImages } from "../../context/social/imagesActions";
import { useHashtags } from "../../context/social/HashtagsContext";
import { usePostHashtags } from "../../context/social/PostHashtagsContext";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabase";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import ImageUploader from "../../utils/ImageUploader";
import Loading from "../../utils/Loading";
import ErrorMessage from "../../utils/ErrorMessage";
import ConfirmDialog from "../ui/ConfirmDialog";
import { FiPlus } from "react-icons/fi";

const PostForm = () => {
  const { t } = useTranslation("posts");
  const { user } = useAuth();
  const { postId } = useParams();
  const navigate = useNavigate();
  const { createPost, updatePost, fetchPost, deletePost } = usePosts();
  const uploadImageMutations = useUploadPostImages();
  const { upsertHashtag } = useHashtags();
  const {
    getHashtagsByPostId,
    upsertPostHashtag,
    deletePostHashtags,
  } = usePostHashtags();

  const [images, setImages] = useState([]);
  const [hashtagItems, setHashtagItems] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const newHashtag = watch("newHashtag")?.trim();

  const {
    data: postData,
    isLoading,
    error,
  } = postId ? fetchPost(postId) : { data: null, isLoading: false, error: null };

  const {
    data: hashtagsData,
  } = postId ? getHashtagsByPostId(postId) : { data: [] };

  useEffect(() => {
    if (postId && postData) {
      setValue("title", postData.title);
      setValue("content", postData.content);
      setImages(postData.images_urls || []);

      if (hashtagsData) {
        const tags = hashtagsData.map(h => h.hashtags.name);
        setHashtagItems(tags);
      }
    }
  }, [postData, hashtagsData, postId]);

  const handleAddHashtag = () => {
    if (newHashtag && !hashtagItems.includes(newHashtag) && hashtagItems.length < 5) {
      setHashtagItems([...hashtagItems, newHashtag]);
      setValue("newHashtag", "");
    }
  };

  const handleRemoveHashtag = (tag) => {
    setHashtagItems(hashtagItems.filter((item) => item !== tag));
  };

  const onFileUpdate = (files) => {
    setImages((prev) => [...prev, ...files]);
  };

  const handleDeleteImage = async (imageUrl) => {
    const fileName = imageUrl.split("/").pop();
    await supabase.storage.from("post-media").remove([fileName]);
    const updatedImages = images.filter((img) => img !== imageUrl);
    await updatePost({
      id: postData.id,
      updatedPost: { ...postData, images_urls: updatedImages },
    });
    setImages(updatedImages);
  };

  const handleDeletePost = () => setIsConfirmOpen(true);

  const confirmDelete = async () => {
    await deletePost(postId);
    navigate(`/profile/${postData.profile_id}`);
    setIsConfirmOpen(false);
  };

  const onSubmit = async (formData) => {
    const { newHashtag, ...rest } = formData;
    const parsedHashtags = hashtagItems.map(tag => tag.trim()).filter(Boolean);

    try {
      let post;

      if (postId) {
        const uploadedImages = await Promise.all(
          images.map(async (file, index) => {
            if (typeof file === "string") return file;
            const filename = `${Date.now()}-${index}-${file.name}`;
            return await uploadImageMutations.mutateAsync({
              file,
              userId: postData.profile_id,
              postId: postId,
              filename,
            });
          })
        );

        await updatePost({
          id: postId,
          updatedPost: { ...rest, images_urls: uploadedImages },
        });

        await deletePostHashtags({ post_id: postId });
        post = postData;
      } else {
        post = await createPost({ ...rest, profile_id: user.id, images_urls: [] });

        const uploadedImages = await Promise.all(
          images.map(async (file, index) => {
            const filename = `${Date.now()}-${index}-${file.name}`;
            return await uploadImageMutations.mutateAsync({
              file,
              userId: user.id,
              postId: post.id,
              filename,
            });
          })
        );

        await updatePost({
          id: post.id,
          updatedPost: { images_urls: uploadedImages },
        });
      }

      const upsertedHashtags = await Promise.all(
        parsedHashtags.map(tag => upsertHashtag({ name: tag }))
      );

      await Promise.all(
        upsertedHashtags.map(h =>
          upsertPostHashtag({ post_id: post.id, hashtag_id: h.id })
        )
      );

      reset();
      setImages([]);
      setHashtagItems([]);

      navigate(postId ? `/profile/${post.profile_id}` : "/explore");
    } catch (err) {
      console.error("Post error:", err.message);
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error.message} />;

  return (
    <>
      <h2 className="text-2xl text-yellow-600 font-semibold text-center mb-4">
        {t(postId ? "update.title" : "create.title")}
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 bg-gradient-to-r from-gray-900 p-6 rounded-lg shadow-md max-w-xl mx-auto"
      >
        <Input
          id="title"
          label={t(`${postId ? "update" : "create"}.labels.title`)}
          placeholder={t(`${postId ? "update" : "create"}.placeholders.title`)}
          maxLength={30}
          register={register}
          validation={{ required: t(`${postId ? "update" : "create"}.errors.title`) }}
          error={errors.title}
          classForLabel="text-gray-400 text-center md:text-left"
        />

        <Textarea
          id="content"
          label={t(`${postId ? "update" : "create"}.labels.content`)}
          placeholder={t(`${postId ? "update" : "create"}.placeholders.content`)}
          register={register}
          validation={{ maxLength: { value: 150, message: t(`${postId ? "update" : "create"}.errors.content`) } }}
          error={errors.content}
          maxLength={150}
          watchValue={watch("content")}
          classForLabel="text-gray-400"
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Input
              id="newHashtag"
              label={t(`${postId ? "update" : "create"}.labels.hashtags`)}
              placeholder={t(`${postId ? "update" : "create"}.placeholders.hashtags`)}
              type="text"
              register={register}
              maxLength={12}
              classForLabel="!text-gray-400"
              className="!flex-1"
            />
            <button
              type="button"
              onClick={handleAddHashtag}
              disabled={!newHashtag || hashtagItems.length >= 5}
              className="text-emerald-500 mt-6 cursor-pointer hover:text-emerald-700 p-2 rounded-full"
            >
              <FiPlus size={22} />
            </button>
          </div>

          {hashtagItems.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {hashtagItems.map((tag, i) => (
                <span key={i} className="px-2 py-1 text-sm rounded bg-sky-800 text-white flex items-center gap-2">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveHashtag(tag)}
                    className="text-red-400 hover:text-red-600 font-bold"
                  >×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {postId && images.some(i => typeof i === "string") && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              {t("update.labels.existingImages")}
            </label>
            <div className="flex flex-wrap gap-4">
              {images.filter(i => typeof i === "string").map((url, idx) => (
                <div key={idx} className="relative">
                  <img src={url} className="w-32 h-32 object-cover rounded-lg" />
                  <button onClick={() => handleDeleteImage(url)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center">×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <ImageUploader amount={3} onFilesUpdate={onFileUpdate} classForLabel="text-gray-400 text-center md:text-left" />

        <div className="flex justify-center gap-4">
          <Button type="button" onClick={() => navigate("/explore")} className="!bg-gray-600 hover:!bg-gray-700">
            {t(`${postId ? "update" : "create"}.buttons.cancel`)}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t(`${postId ? "update" : "create"}.buttons.${postId ? "updating" : "posting"}`)
              : t(`${postId ? "update" : "create"}.buttons.${postId ? "update" : "post"}`)}
          </Button>
          {postId && (
            <Button type="button" onClick={handleDeletePost} className="!bg-red-600 hover:!bg-red-700">
              {t("update.buttons.delete")}
            </Button>
          )}
        </div>
      </form>

      {postId && (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          title={t("update.buttons.delete")}
          message={t("update.errors.confirmDelete")}
          onConfirm={confirmDelete}
          onCancel={() => setIsConfirmOpen(false)}
          confirmLabel={t("update.buttons.delete")}
          cancelLabel={t("update.buttons.cancel")}
          color="error"
        />
      )}
    </>
  );
};

export default PostForm;
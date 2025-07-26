import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { usePosts } from "../../context/social/PostsContext";
import { useUploadPostImages } from "../../context/social/imagesActions";
import { useHashtags } from "../../context/social/HashtagsContext";
import { usePostHashtags } from "../../context/social/PostHashtagsContext";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabase";

import { FiPlus } from "react-icons/fi";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import ImageUploader from "../../utils/ImageUploader";
import Loading from "../../utils/Loading";
import ErrorMessage from "../../utils/ErrorMessage";
import ConfirmDialog from "../ui/ConfirmDialog";

import type { Post } from "@/context/social/postsActions"
import type { ActualFileObject } from "filepond";

interface LocationState {
  groupId?: string | null;
}

interface FormData extends Pick<Post, "title" | "content"> {
  newHashtag?: string;
}

const PostForm: React.FC = () => {
  const { t } = useTranslation("posts");
  const location = useLocation();
  const state = location.state as LocationState | null;
  const groupId = state?.groupId ?? null;

  const { user } = useAuth();
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { createPost, updatePost, fetchPost, deletePost } = usePosts();
  const uploadImageMutations = useUploadPostImages();
  const { upsertHashtag } = useHashtags();
  const { getHashtagsByPostId, upsertPostHashtag, deletePostHashtags } = usePostHashtags();

  // Images can be string (URL) or File (upload)
  const [images, setImages] = useState<(string | ActualFileObject)[]>([]);
  const [hashtagItems, setHashtagItems] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const newHashtag = watch("newHashtag")?.trim();

  // Data and types for fetched post and hashtags
  const {
    data: postData,
    isLoading,
    error,
  } = postId ? fetchPost(postId) : { data: null, isLoading: false, error: null };

  const { data: hashtagsData } = postId ? getHashtagsByPostId(postId) : { data: [] };

  useEffect(() => {
    if (postId && postData) {
      setValue("title", postData.title);
      setValue("content", postData.content);
      setImages(postData.images_urls || []);

      if (hashtagsData) {
        // hashtagsData type assumed array with property hashtags.name as string
        const tags = hashtagsData.map((h: any) => h.hashtags.name);
        setHashtagItems(tags);
      }
    }
  }, [postData, hashtagsData, postId, setValue]);

  const handleAddHashtag = () => {
    if (newHashtag && !hashtagItems.includes(newHashtag) && hashtagItems.length < 5) {
      setHashtagItems([...hashtagItems, newHashtag]);
      setValue("newHashtag", "");
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtagItems(hashtagItems.filter((item) => item !== tag));
  };

  const onFileUpdate = (files: ActualFileObject[]) => {
  setImages((prev) => [...prev, ...files]);
};

  const handleDeleteImage = async (imageUrl: string) => {
    const fileName = imageUrl.split("/").pop();
    if (!fileName) return;
    await supabase.storage.from("post-media").remove([fileName]);
    const updatedImages = images.filter((img) => img !== imageUrl);
    if (!postData) return;
    await updatePost({
      id: postData.id,
      updatedPost: { 
        ...postData, 
        images_urls: updatedImages.filter((img): img is string => typeof img === "string")
      },
    });
    setImages(updatedImages);
  };

  const handleDeletePost = () => setIsConfirmOpen(true);

  const confirmDelete = async () => {
    if (!postId || !postData) return;
    await deletePost(postId);
    navigate(groupId ? `/group/${groupId}` : `/profile/${postData.profile_id}`);
    setIsConfirmOpen(false);
  };

  const onSubmit = async (formData: FormData) => {
    const { newHashtag: _ignored, ...rest } = formData;
    const parsedHashtags = hashtagItems.map(tag => tag.trim()).filter(Boolean);

    try {
      let post: Post;

      if (postId && postData) {
        const uploadedImagesRaw = await Promise.all(
          images.map(async (file, index) => {
            if (!(file instanceof File)) return file; // fallback
            const filename = `${Date.now()}-${index}-${file.name}`;
            return await uploadImageMutations.mutateAsync({
              file,
              userId: groupId || user?.id!,
              postId: postId,
              filename,
            });
          })
        );

        const uploadedImages = uploadedImagesRaw.filter(
          (url): url is string => url !== null && url !== undefined
        );

        await updatePost({
          id: postId,
          updatedPost: { 
            ...rest, 
            images_urls: uploadedImages 
          },
        });

        await deletePostHashtags({ post_id: postId });
        post = postData;
      } else {
        if (!user) throw new Error("User not logged in");

        post = await createPost({
          ...rest,
          images_urls: [],
          ...(groupId ? { group_id: groupId } : { profile_id: user.id }),
        });

        const uploadedImagesRaw = await Promise.all(
          images.map(async (file, index) => {
            if (!(file instanceof File)) return file; // fallback
            const filename = `${Date.now()}-${index}-${file.name}`;
            return await uploadImageMutations.mutateAsync({
              file,
              userId: groupId || user.id,
              postId: post.id,
              filename,
            });
          })
        );

        const uploadedImages = uploadedImagesRaw.filter(
          (url): url is string => url !== null && url !== undefined
        );

        await updatePost({
          id: post.id,
          updatedPost: { images_urls: uploadedImages },
        });
      }

      const upsertedHashtags = await Promise.all(
        parsedHashtags.map((tag) => upsertHashtag({ name: tag }))
      );

      await Promise.all(
        upsertedHashtags.map((h) =>
          upsertPostHashtag({ post_id: post.id, hashtag_id: h.id })
        )
      );

      reset();
      setImages([]);
      setHashtagItems([]);

      navigate(
        postId
          ? groupId
            ? `/group/${groupId}`
            : `/profile/${post.profile_id}`
          : "/explore"
      );
    } catch (err: any) {
      console.error("Post error:", err?.message || err);
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error.message} />;

  const isValidHashtag = /^#[\w-]+$/.test(newHashtag || "");

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
          validation={{
            maxLength: {
              value: 150,
              message: t(`${postId ? "update" : "create"}.errors.content`),
            },
          }}
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
              disabled={!newHashtag || hashtagItems.length >= 5 || !isValidHashtag}
              className={`mt-4 p-2 rounded-full ${
                !newHashtag || hashtagItems.length >= 5 || !isValidHashtag
                  ? "cursor-not-allowed text-emerald-900"
                  : "cursor-pointer text-emerald-500 hover:text-emerald-700"
              }`}
            >
              <FiPlus size={22} />
            </button>
          </div>

          {hashtagItems.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {hashtagItems.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-sm rounded bg-sky-800 text-white flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveHashtag(tag)}
                    className="text-red-400 hover:text-red-600 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {postId && images.some((i) => typeof i === "string") && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              {t("update.labels.existingImages")}
            </label>
            <div className="flex flex-wrap gap-4">
              {images
                .filter((i) => typeof i === "string")
                .map((url, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={url}
                      alt={`Existing post image ${idx}`}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleDeleteImage(url)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        <ImageUploader
          amount={3}
          onFilesUpdate={onFileUpdate}
          classForLabel="text-gray-400 text-center md:text-left"
        />

        <div className="flex justify-center gap-4">
          <Button
            type="button"
            onClick={() => navigate("/explore")}
            className="!bg-gray-600 hover:!bg-gray-700"
          >
            {t(`${postId ? "update" : "create"}.buttons.cancel`)}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t(`${postId ? "update" : "create"}.buttons.${postId ? "updating" : "posting"}`)
              : t(`${postId ? "update" : "create"}.buttons.${postId ? "update" : "post"}`)}
          </Button>
          {postId && (
            <Button
              type="button"
              onClick={handleDeletePost}
              className="!bg-red-600 hover:!bg-red-700"
            >
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

import { useForm } from "react-hook-form";
import { usePosts } from "../../context/social/PostsContext";
import Button from "../ui/Button";
import Input from "../ui/Input";
import ImageUploader from "../../utils/ImageUploader";
import { useState } from "react";
import { useUploadPostImages } from "../../context/social/imagesActions";
import { useView } from "../../context/ViewContext";
import { useHashtags } from "../../context/social/HashtagsContext";
import { usePostHashtags } from "../../context/social/PostHashtagsContext";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Textarea from "../ui/Textarea";

const CreatePost = () => {
  const { user } = useAuth(); // logged user
  const { t } = useTranslation("posts")
  const [images, setImages] = useState([]);
  const { createPost, updatePost } = usePosts();
  const { upsertHashtag } = useHashtags();
  const { upsertPostHashtag } = usePostHashtags();
  const { manageView } = useView();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const uploadImageMutations = useUploadPostImages();

  const onFileUpdate = (file) => {
    setImages(file);
  };

  const onSubmit = async (postData) => {
    const {hashtags, ...cleanPostData } = postData;

    try {
      // Create post without images
      const post = await createPost({
        ...cleanPostData,
        profile_id: user.id,
        images_urls: [],
      });

      // Check if hashtags exist and upsert them
      const parsedHashtags  = postData.hashtags.split(/\s+/).map((tag) => tag.trim());
      const hashtagsToUpsert = parsedHashtags .map((tag) => ({ name: tag }));
      const upsertedHashtags = await Promise.all(
        hashtagsToUpsert.map(async (hashtag) => {
          const existingHashtag = await upsertHashtag(hashtag);
          return existingHashtag;
        })
      );
      // Associate hashtags with the post
      await Promise.all(
        upsertedHashtags.map(async (hashtag) => {
          const postHashtag = {
            post_id: post.id,
            hashtag_id: hashtag.id,
          };
          await upsertPostHashtag(postHashtag);
        })
      );

      // Upload images to the bucket and obtain public URLs
      const uploadedImagesURLs = await Promise.all(
        images.map(async (file, index) => {
          const filename = `${Date.now()}-${index}-${file.name}`;
          const publicURL = await uploadImageMutations.mutateAsync({
            file,
            userId: user.id,
            postId: post.id,
            filename,
          });
          return publicURL;
        })
      );

      // Update the post with the uploaded image URLs
      await updatePost({
        id: post.id,
        updatedPost: {
          images_urls: uploadedImagesURLs,
        },
      });

      reset();
      setImages([]);
      navigate('/explore');
    } catch (err) {
      console.error("Error creating post:", err.message);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-100 text-center mb-4">
        {t("create.title")}
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 bg-gradient-to-r from-gray-900 p-6 rounded-lg shadow-md max-w-xl mx-auto"
      >
        <Input
          id="title"
          label={t("create.labels.title")}
          placeholder={t("create.placeholders.title")}
          register={register}
          validation={{ required: t("create.errors.title") }}
          error={errors.title?.message}
          classForLabel="text-gray-400 text-center md:text-left"
        />
        
        <Textarea
          id="content"
          label={t("create.labels.content")}
          placeholder={t("create.placeholders.content")}
          register={register}
          validation={{
            maxLength: {
              value: 100,
              message: t("create.errors.content"),
            }
          }}
          error={errors.content}
          maxLength={100}
          watchValue={watch("content")}
          classForLabel="text-gray-400" 
        />

        <Input
          id="hashtags"
          label={t("create.labels.hashtags")}
          placeholder={t("create.placeholders.hashtags")}
          register={register}
          validation={{}}
          error={errors.hashtags?.message}
          classForLabel="text-gray-400 text-center md:text-left"
        />

        <ImageUploader
          amount={3}
          onFilesUpdate={onFileUpdate}
          classForLabel="text-gray-400 text-center md:text-left"
        />

        <div className="flex">
          <Button
          onClick={() => {navigate("/explore")}}
          className="mx-auto block !text-gray-100 !bg-gray-600 hover:!bg-gray-700"
          >
            {t("create.buttons.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="mx-auto block !text-gray-100 bg-sky-600 hover:bg-sky-700"
          >
            {isSubmitting ? t("create.buttons.posting") : t("create.buttons.post")}
          </Button>
        </div>
      </form>
    </>
  );
};

export default CreatePost;

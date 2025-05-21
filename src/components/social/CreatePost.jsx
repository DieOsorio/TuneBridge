import { useForm } from "react-hook-form";
import { usePosts } from "../../context/social/PostsContext";
import Button from "../ui/Button";
import Input from "../ui/Input";
import ImageUploader from "../../utils/ImageUploader";
import { useState } from "react";
import { useUploadPostImages } from "../../context/social/imagesActions";
import { useView } from "../../context/ViewContext";

const CreatePost = ({ id }) => {
  const [images, setImages] = useState([]);
  const { createPost, updatePost } = usePosts();
  const { manageView } = useView();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const uploadImageMutations = useUploadPostImages();

  const onFileUpdate = (file) => {
    setImages(file);
  };

  const onSubmit = async (postData) => {
    try {
      // Create post without images
      const post = await createPost({
        ...postData,
        profile_id: id,
        images_urls: [],
      });

      // Upload images to the bucket and obtain public URLs
      const uploadedImagesURLs = await Promise.all(
        images.map(async (file, index) => {
          const filename = `${Date.now()}-${index}-${file.name}`;
          const publicURL = await uploadImageMutations.mutateAsync({
            file,
            userId: id,
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
      manageView("about", "profile");
    } catch (err) {
      console.error("Error creating post:", err.message);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-100 text-center mb-4">
        Create a New Post
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 bg-gradient-to-r from-gray-900 p-6 rounded-lg shadow-md max-w-xl mx-auto"
      >
        <Input
          id="title"
          label="Title"
          placeholder="Enter a title"
          register={register}
          validation={{ required: "Title is required." }}
          error={errors.title?.message}
        />

        <div>
          <label htmlFor="content" className="block font-medium text-gray-400 mb-1">
            Content
          </label>
          <textarea
            id="content"
            {...register("content", {
              required: "Content must not be empty.",
            })}
            className="w-full border rounded-lg p-2 h-32 resize-none focus:outline-none focus:ring focus:ring-brown-300"
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
          )}
        </div>

        <ImageUploader amount={3} onFilesUpdate={onFileUpdate} />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="ml-auto block !text-gray-100 bg-sky-600 hover:bg-sky-700"
        >
          {isSubmitting ? "Posting..." : "Post"}
        </Button>
      </form>
    </>
  );
};

export default CreatePost;

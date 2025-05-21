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

const UpdatePost = () => {
  const { postId } = useParams(); // Extract postId from the URL
  const [images, setImages] = useState([]); // Store images (existing + new)
  const { fetchPost, updatePost, deletePost } = usePosts(); // Fetch and update post logic
  const { data: postData, isLoading, error } = fetchPost(postId); // Fetch post data by ID
  const { 
    register, 
    handleSubmit, 
    setValue, 
    formState: { errors, isSubmitting } 
  } = useForm();
  const uploadImageMutations = useUploadPostImages();
  const navigate = useNavigate(); // For navigation
  
  // Fetch the post data when the component mounts
  useEffect(() => {
    if (postData) {
      setValue("title", postData.title);
      setValue("content", postData.content);
      setImages(postData.images_urls || []);
    }
  }, [postData, setValue]);

  // Handle file updates (new images)
  const onFileUpdate = (files) => {
    setImages((prevImages) => {
      // Filter out duplicate files
      const newFiles = files.filter(
        (file) => !prevImages.some((img) => img.name === file.name)
      );
      return [...prevImages, ...newFiles];
    });
  };

  // Handle image deletion
  const handleDeleteImage = async (imageUrl) => {
    try {
      // Step 1: Delete the image from the Supabase bucket
      const fileName = imageUrl.split("/").pop(); // Extract the file name from the URL
      const { error: deleteError } = await supabase.storage
        .from("post-media")
        .remove([fileName]);

      if (deleteError) {
        throw new Error(`Error deleting image from bucket: ${deleteError.message}`);
      }

      // Step 2: Update the images_urls array in the database
      const updatedImages = images.filter((img) => img !== imageUrl); // Remove the image locally
      const { error: updateError } = await updatePost({
        id: postData.id,
        updatedPost: {
          ...postData,
          images_urls: updatedImages, // Update the images_urls array
        },
      });

      if (updateError) {
        throw new Error(`Error updating post data: ${updateError.message}`);
      }

      // Step 3: Update the local state
      setImages(updatedImages);
    } catch (err) {
      console.error("Error deleting image:", err.message);
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      // Upload new images and keep existing ones
      const uploadedImagesURLs = await Promise.all(
        images.map(async (file, index) => {
          if (typeof file === "string") return file; // Keep existing image URLs
          const filename = `${Date.now()}-${index}-${file.name}`;
          const publicURL = await uploadImageMutations.mutateAsync({
            file,
            userId: postData.profile_id,
            postId: postData.id,
            filename,
          });
          return publicURL;
        })
      );

      // Update the post
      await updatePost({
        id: postData.id,
        updatedPost: {
          ...data,
          images_urls: uploadedImagesURLs,
        },
      });
      navigate(`/profile/${postData.profile_id}`); // Navigate back to the profile view
    } catch (err) {
      console.error("Error updating post:", err.message);
    }
  };

  // Handle post deletion
   const handleDeletePost = async () => {
    if (!postData) return;

    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(postData.id);
        navigate(`/profile/${postData.profile_id}`); // Navigate back to the profile view
      } catch (error) {
        console.error("Error deleteing post:", error.message);
        alert("Error deleting the post. Please try again.");
      }
    }
  };


  if (isLoading) {
    return <Loading />; // Show loading state while fetching post data
  }
  if (error) {
    return <ErrorMessage error={error.message} />; // Show loading state while fetching post data
  }

  return (
    <>
      {/* Section Title */}
      <h2 className="text-2xl font-bold text-gray-100 text-center mb-4">
        Update Post
      </h2>

      {/* Form */}
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="space-y-6 bg-gradient-to-r from-gray-900 p-6 rounded-lg shadow-md max-w-xl mx-auto"
      >
        <Input
          id="title"
          label="Title"
          placeholder="Enter a title"
          register={register}
          required="The title is required."
          error={errors.title}
        />

        <div>
          <label className="block font-medium text-gray-400 mb-1">Content</label>
          <textarea
            {...register("content", { required: "The content cannot be empty." })}
            className="w-full border rounded-lg p-2 h-32 resize-none focus:outline-none focus:ring focus:ring-brown-300"
          />
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
        </div>

        {/* Existing Images */}
        <div>
          <label className="block font-medium text-gray-400 mb-1">Existing Images</label>
          <div className="flex flex-wrap gap-4">
            {images
              .filter((img) => typeof img === "string") // Only show existing images
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

        {/* Image Uploader */}
        <ImageUploader amount={3} onFilesUpdate={onFileUpdate} />

        {/* Cancel and Update Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            type="button"
            onClick={() => navigate("/explore")} // Navigate to /explore
            className="!bg-gray-500 hover:!bg-gray-600"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update"}
          </Button>
          <Button
            type="button"
            onClick={handleDeletePost}
            className="px-4 py-2 !bg-red-600 hover:!bg-red-700"
          >
            Delete Post
          </Button>
        </div>
      </form>
    </>
  );
};

export default UpdatePost;
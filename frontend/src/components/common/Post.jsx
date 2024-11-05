import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../common/LoadingSpinner";
import useFollow from "../../hooks/useFollow";

const Post = ({ post }) => {
  const [comment, setComment] = useState("");
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const postOwner = post.user;
  console.log(post.likes);
  const isLiked = post.likes.includes(authUser._id);
  const isMyPost = post.user._id === authUser._id;
  const isFollowing = authUser.following.includes(postOwner._id); // Check if already following
  const formattedDate = "1h";
  const isCommenting = false;

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/${post._id}`, {
          method: "DELETE",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/like/${post._id}`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: (updatedLikes) => {
      // this is not the best UX, bc it will refetch all posts
      // queryClient.invalidateQueries({ queryKey: ["posts"] });

      // instead, update the cache directly for that post
      queryClient.setQueryData(["posts"], (oldData) => {
        return oldData.map((p) => {
          if (p._id === post._id) {
            return { ...p, likes: updatedLikes };
          }
          return p;
        });
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { follow, isPending: isFollowingPending } = useFollow();

  const handleDeletePost = () => {
    deletePost();
  };

  const handlePostComment = (e) => {
    e.preventDefault();
  };

  const handleLikePost = () => {
    if (isLiking) return;
    likePost();
  };

  return (
    <div className="flex gap-2 items-start p-4 border-b border-gray-700">
      <div className="avatar">
        <Link
          to={`/profile/${postOwner.userName}`}
          className="w-8 rounded-full overflow-hidden"
        >
          <img src={postOwner.profileImg || "/avatar-placeholder.png"} />
        </Link>
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex gap-2 items-center">
          <Link to={`/profile/${postOwner.userName}`} className="font-bold">
            {postOwner.fullName}
          </Link>
          <span className="text-gray-700 flex gap-1 text-sm">
            <Link to={`/profile/${postOwner.userName}`}>
              @{postOwner.userName}
            </Link>
            <span>·</span>
            <span>{formattedDate}</span>
          </span>
          <span className="flex justify-end flex-1">
            {isMyPost ? (
              !isDeleting ? (
                <FaTrash
                  className="cursor-pointer hover:text-red-500"
                  onClick={handleDeletePost}
                />
              ) : (
                <LoadingSpinner size="sm" />
              )
            ) : (
              <button
                className="btn btn-ghost btn-sm text-fuchsia-600 opacity-70 hover:opacity-100"
                onClick={(e) => {
                  e.preventDefault();
                  follow(postOwner._id);
                }}
              >
                {isFollowingPending ? (
                  <LoadingSpinner size="sm" />
                ) : isFollowing ? (
                  "Following"
                ) : (
                  "Follow"
                )}
              </button>
            )}
          </span>
        </div>
        <div className="flex flex-col gap-3 overflow-hidden">
          <span>{post.text}</span>
          {post.img && (
            <img
              src={post.img}
              className="h-80 object-contain rounded-lg border border-gray-700"
              alt=""
            />
          )}
        </div>
        <div className="flex justify-between mt-3">
          <div className="flex gap-4 items-center w-2/3 justify-between">
            <div
              className="flex gap-1 items-center cursor-pointer group"
              onClick={() =>
                document.getElementById("comments_modal" + post._id).showModal()
              }
            >
              <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-purple-400" />
              <span className="text-sm text-slate-500 group-hover:text-purple-400">
                {post.comments.length}
              </span>
            </div>
            <dialog
              id={`comments_modal${post._id}`}
              className="modal border-none outline-none"
            >
              {/* Modal content here */}
            </dialog>
            <div className="flex gap-1 items-center group cursor-pointer">
              <BiRepost className="w-6 h-6  text-slate-500 group-hover:text-green-500" />
              <span className="text-sm text-slate-500 group-hover:text-green-500">
                0
              </span>
            </div>
            <div
              className="flex gap-1 items-center group cursor-pointer"
              onClick={handleLikePost}
            >
              {isLiking && <LoadingSpinner size="sm" />}
              {!isLiked && !isLiking && (
                <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
              )}
              {isLiked && !isLiking && (
                <FaRegHeart className="w-4 h-4 cursor-pointer text-pink-500 " />
              )}

              <span
                className={`text-sm  group-hover:text-pink-500 ${
                  isLiked ? "text-pink-500" : "text-slate-500"
                }`}
              >
                {post.likes.length}
              </span>
            </div>
          </div>
          <div className="flex w-1/3 justify-end gap-2 items-center">
            <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;

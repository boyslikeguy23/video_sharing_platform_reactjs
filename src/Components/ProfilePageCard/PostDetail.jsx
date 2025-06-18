import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { BsBookmark, BsBookmarkFill, BsEmojiSmile, BsThreeDots } from "react-icons/bs";
import { FaRegComment } from "react-icons/fa";
import { RiSendPlaneLine } from "react-icons/ri";
import { timeDifference } from "../../Config/Logic";
import { createComment, getAllComments } from "../../Redux/Comment/Action";
import { findPostByIdAction } from "../../Redux/Post/Action";
import CommentCard from "../Comment/CommentCard";
import "../Comment/CommentModal.css";

const PostDetail = ({
  handleLikePost,
  handleUnLikePost,
  handleSavePost,
  handleUnSavePost,
  handleDeletePost,
  handleOpenEditPostModal,
  isOwnPost,
  isSavedProp,
  isPostLikedProp,
  numberOfLikesProp
}) => {
  const dispatch = useDispatch();
  const jwt = localStorage.getItem("token");
  const { post, comments, user } = useSelector((store) => store);
  const [commentContent, setCommentContent] = useState("");
  const { postId } = useParams();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isPostLiked, setIsPostLiked] = useState(isPostLikedProp);
  const [isSaved, setIsSaved] = useState(isSavedProp);
  const [numberOfLikes, setNumberOfLike] = useState(numberOfLikesProp || 0);

  const postData = post.posts?.find((p) => String(p.id) === String(postId)) || post.singlePost;

  useEffect(() => {
    if (!postData || String(postData.id) !== String(postId)) {
      dispatch(findPostByIdAction({ jwt, postId }));
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      dispatch(findPostByIdAction({ jwt, postId }));
      dispatch(getAllComments({ jwt, postId }));
    }
  }, [postId, comments?.createdComment, comments?.deletedComment, comments?.updatedComment]);

  const handleAddComment = () => {
    const data = {
      jwt,
      postId,
      data: { content: commentContent },
    };
    dispatch(createComment(data));
    setCommentContent("");
  };

  const handleCommnetInputChange = (e) => {
    setCommentContent(e.target.value);
  };
  const handleOnEnterPress = (e) => {
    if (e.key === "Enter") {
      handleAddComment();
    }
  };

  function handleClick() {
    setShowDropdown(!showDropdown);
  }
  function handleWindowClick(event) {
    if (!event.target.matches('.dots-comment-modal')) {
      setShowDropdown(false);
    }
  }
  useEffect(() => {
    window.addEventListener('click', handleWindowClick);
    return () => {
      window.removeEventListener('click', handleWindowClick);
    };
  }, []);

  // Khi like
  const handleLike = () => {
    setIsPostLiked(true);
    setNumberOfLike(prev => prev + 1);
    handleLikePost && handleLikePost();
  };
  // Khi unlike
  const handleUnLike = () => {
    setIsPostLiked(false);
    setNumberOfLike(prev => prev - 1);
    handleUnLikePost && handleUnLikePost();
  };

  return (
    <div className="flex h-[75vh] ">
      <div className="w-[45%] flex flex-col justify-center">
        <video className="" src={post.singlePost?.image} controls style={{ maxHeight: "400px", maxWidth: "100%" }} />
      </div>
      <div className="w-[55%] pl-10 relative">
        <div className="reqUser flex justify-between items-center py-5">
          <div className="flex items-center">
            <div className="">
              <img
                className="w-9 h-9 rounded-full"
                src={post?.singlePost?.user?.userImage || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                alt=""
              />
            </div>
            <div className="ml-3">
              <p>{post?.singlePost?.user?.name}</p>
              <p>{post?.singlePost?.user?.username}</p>
            </div>
          </div>
          {isOwnPost && (
            <div className="dropdown" style={{ position: 'relative' }}>
              <BsThreeDots onClick={handleClick} className="dots-comment-modal cursor-pointer" />
              {showDropdown && (
                <div className="p-2 w-[10rem] shadow-xl bg-white absolute right-0 z-10">
                  <p
                    onClick={() => {
                      handleOpenEditPostModal(post.singlePost?.id);
                      setShowDropdown(false);
                    }}
                    className="hover:bg-slate-300 py-2 px-4 cursor-pointer font-semibold"
                  >
                    Sửa
                  </p>
                  <hr />
                  <p
                    onClick={() => {
                      handleDeletePost(post.singlePost?.id);
                      setShowDropdown(false);
                    }}
                    className="hover:bg-slate-300 px-4 py-2 cursor-pointer font-semibold"
                  >
                    Xoá
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <hr />
        <div className="comments " style={{ maxHeight: '450px', overflowY: 'auto', paddingBottom: '16px' }}>
          {comments.comments?.length > 0 &&
            comments.comments?.map((item) => (
              <CommentCard comment={item} key={item.id} />
            ))}
        </div>
        <div className=" absolute bottom-0 w-[90%]">
          <div className="flex justify-between items-center w-full mt-5">
            <div className="flex items-center space-x-2 ">
              {isPostLiked ? (
                <AiFillHeart
                  onClick={handleUnLike}
                  className="text-2xl hover:opacity-50 cursor-pointer text-red-600"
                />
              ) : (
                <AiOutlineHeart
                  onClick={handleLike}
                  className="text-2xl hover:opacity-50 cursor-pointer "
                />
              )}
              <FaRegComment className="text-xl hover:opacity-50 cursor-pointer" />
              <RiSendPlaneLine className="text-xl hover:opacity-50 cursor-pointer" />
            </div>
            <div className="cursor-pointer">
              {isSaved ? (
                <BsBookmarkFill
                  onClick={() => { setIsSaved(false); handleUnSavePost && handleUnSavePost(post.singlePost?.id); }}
                  className="text-xl"
                />
              ) : (
                <BsBookmark
                  onClick={() => { setIsSaved(true); handleSavePost && handleSavePost(post.singlePost?.id); }}
                  className="text-xl hover:opacity-50 cursor-pointer"
                />
              )}
            </div>
          </div>
          {numberOfLikes > 0 && (
            <p className="text-sm font-semibold py-2">
              {numberOfLikes} lượt thích{" "}
            </p>
          )}
          <p className="opacity-70 pb-5">
            {timeDifference(post?.singlePost?.createdAt)}
          </p>
          <div className=" flex items-center ">
            <BsEmojiSmile className="mr-3 text-xl" />
            <input
              className="commentInput w-[70%]"
              placeholder="Thêm bình luận..."
              type="text"
              onKeyPress={handleOnEnterPress}
              onChange={handleCommnetInputChange}
              value={commentContent}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

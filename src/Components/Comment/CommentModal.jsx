import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import {
  BsBookmark,
  BsBookmarkFill,
  BsEmojiSmile,
  BsPencil,
  BsThreeDots,
} from "react-icons/bs";
import { FaRegComment } from "react-icons/fa";
import { RiSendPlaneLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { timeDifference } from "../../Config/Logic";
import { createComment, getAllComments } from "../../Redux/Comment/Action";
import { findPostByIdAction } from "../../Redux/Post/Action";
import CommentCard from "./CommentCard";
import "./CommentModal.css";

const CommentModal = ({
  isOpen,
  onClose,
  onOpen,
  postData,
  handleLikePost,
  handleUnLikePost,
  handleSavePost,
  handleUnSavePost,
  isPostLiked: isPostLikedProp,
  isSaved: isSavedProp,
  handleDeletePost,
  handleOpenEditPostModal,
  isOwnPost
}) => {
  const dispatch = useDispatch();
  const jwt = localStorage.getItem("token");
  const { post, comments, user } = useSelector((store) => store);
  const [commentContent, setCommentContent] = useState("");
  const { postId } = useParams();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  // Local state giống PostCard
  const [isPostLiked, setIsPostLiked] = useState(isPostLikedProp);
  const [isSaved, setIsSaved] = useState(isSavedProp);
  const [numberOfLikes, setNumberOfLikes] = useState(post.singlePost?.likedByUsers?.length || 0);

  // Luôn đồng bộ local state với Redux store khi post hoặc user thay đổi
  useEffect(() => {
    // Kiểm tra likedByUsers là object hay id
    let liked = false;
    if (Array.isArray(post.singlePost?.likedByUsers)) {
      if (post.singlePost.likedByUsers.length > 0 && typeof post.singlePost.likedByUsers[0] === 'object') {
        liked = post.singlePost.likedByUsers.some(u => u.id === user.reqUser?.id);
      } else {
        liked = post.singlePost.likedByUsers.includes(user.reqUser?.id);
      }
    }
    setIsPostLiked(liked);
    setIsSaved(user.reqUser?.savedPost?.some(p => p.id === post.singlePost?.id));
    setNumberOfLikes(post.singlePost?.likedByUsers?.length || 0);
  }, [post.singlePost, user.reqUser]);

  useEffect(() => {
    if (postId) {
      dispatch(
        findPostByIdAction({
          jwt,
          postId,
        })
      );
      dispatch(getAllComments({jwt,postId}))
    }
  }, [postId, comments?.createdComment, comments?.deletedComment, comments?. updatedComment]);

  const handleAddComment = () => {
    const data = {
      jwt,
      postId,
      data: {
        content: commentContent,
      },
    };
    console.log("comment content ", commentContent);
    dispatch(createComment(data));
    setCommentContent("");
  };

  const handleCommnetInputChange = (e) => {
    setCommentContent(e.target.value);
  };
  const handleOnEnterPress = (e) => {
    if (e.key === "Enter") {
      handleAddComment();
    } else return;
  };
  
  const handleClose = () => {
    onClose();
    // navigate("/");
    //navigate(-1);
    if (window.history.state && window.history.state.usr && window.history.state.usr.background) {
    navigate(window.history.state.usr.background.pathname);
  } else {
    navigate(-1);
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

  // Handler mới cập nhật local state và dispatch action
  const handleLike = () => {
    if (!isPostLiked) {
      handleLikePost();
      setIsPostLiked(true);
      setNumberOfLikes((prev) => prev + 1);
    }
  };
  const handleUnLike = () => {
    if (isPostLiked) {
      handleUnLikePost();
      setIsPostLiked(false);
      setNumberOfLikes((prev) => Math.max(prev - 1, 0));
    }
  };
  const handleSave = () => {
    if (!isSaved) {
      handleSavePost();
      setIsSaved(true);
    }
  };
  const handleUnSave = () => {
    if (isSaved) {
      handleUnSavePost();
      setIsSaved(false);
    }
  };

  return (
    <div>
      <Modal size={"4xl"} onClose={handleClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <div className="flex h-[75vh] ">
              <div className="w-[45%] flex flex-col justify-center">
                {/* <img
                  className="max-h-full max-w-full"
                  src={post.singlePost?.image}
                  alt=""
                /> */}
                <video className="" src={post.singlePost?.image} controls
        style={{ maxHeight: "400px", maxWidth: "100%" }}
      />
              </div>
              <div className="w-[55%] pl-10 relative">
                <div className="reqUser flex justify-between items-center py-5">
                  <div className="flex items-center">
                    <div className="">
                      <img
                        className="w-9 h-9 rounded-full"
                        src={
                          post?.singlePost?.user?.userImage ||
                          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                        }
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
                  {post.singlePost?.caption && (
                    <div className="flex items-start mb-4 mt-4">
                      <img
                        className="w-8 h-8 rounded-full mr-3"
                        src={
                          post?.singlePost?.user?.userImage ||
                          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                        }
                        alt=""
                      />
                      <div>
                        <span className="font-semibold mr-2">{post?.singlePost?.user?.username}</span>
                        <span>{post.singlePost.caption}</span>
                        <div className="text-xs text-gray-400 mt-1">
                          {timeDifference(post?.singlePost?.createdAt)}
                        </div>
                      </div>
                    </div>
                  )}
                  {comments.comments?.length > 0 &&
                    comments.comments?.map((item) => (
                      <CommentCard comment={item} />
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
                          onClick={handleUnSave}
                          className="text-xl"
                        />
                      ) : (
                        <BsBookmark
                          onClick={handleSave}
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
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CommentModal;

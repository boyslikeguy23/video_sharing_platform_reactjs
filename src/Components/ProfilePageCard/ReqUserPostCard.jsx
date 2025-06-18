import React, { useRef, useState, useEffect } from 'react';
import "./ReqUserPostCard.css";
import {AiFillHeart} from "react-icons/ai";
import {FaComment} from "react-icons/fa";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDisclosure } from "@chakra-ui/react";
import CommentModal from "../Comment/CommentModal";
import { useDispatch, useSelector } from "react-redux";
import { likePostAction, unLikePostAction, savePostAction, unSavePostAction, deletePostAction } from "../../Redux/Post/Action";
import EditPostModal from "../Post/Create/EditPostModal";
import {
  isPostLikedByUser,
  isReqUserPost,
  isSavedPost,
  timeDifference,
} from "../../Config/Logic";

import { createComment } from "../../Redux/Comment/Action";

const ReqUserPostCard = ({post}) => {
  const [commentContent, setCommentContent] = useState("");
  const location_page = useLocation();
  

  const [showVideo, setShowVideo] = useState(false);
  const isVideo = post?.image && /\.(mp4|webm|ogg)$/i.test(post.image);
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { postId } = useParams();
  const dispatch = useDispatch();
  const { user} = useSelector(store => store);
  const token = localStorage.getItem("token");
  
  const [isSaved, setIsSaved] = useState(false);
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [numberOfLikes, setNumberOfLike] = useState(0);

  //const [isSaved, setIsSaved] = useState(false);
  //const [isPostLiked, setIsPostLiked] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [openEditPostModal,setOpenEditPostModal] = useState(false);

  const handleCommnetInputChange = (e) => {
    setCommentContent(e.target.value);
  };

  useEffect(() => {
  setIsSaved(isSavedPost(user.reqUser, post.id));
  setIsPostLiked(isPostLikedByUser(post, user.reqUser?.id));
  setNumberOfLike(post?.likedByUsers?.length);
}, [user.reqUser, post]);

  const data = {
      jwt: token,
      postId: post.id,
    };
  // const handleAddComment = () => {
  //   const data = {
  //     jwt: token,
  //     postId: post.id,
  //     data: {
  //     content: commentContent,
  //   },
  // };
  //   console.log("comment content ", commentContent);
  //   dispatch(createComment(data));
  // };

  // const handleOnEnterPress = (e) => {
  //   if (e.key === "Enter") {
  //     handleAddComment();
  //   } else return;
  // };

  const handleLikePost = () => {
    dispatch(likePostAction(data));
    setIsPostLiked(true);
    setNumberOfLike(numberOfLikes + 1);
  };
  const handleUnLikePost = () => {
    dispatch(unLikePostAction(data));
    setIsPostLiked(false);
    setNumberOfLike(numberOfLikes - 1);
  };

  const handleSavePost = () => {
    dispatch(savePostAction(data));
    setIsSaved(true);
  };

  const handleUnSavePost = () => {
    dispatch(unSavePostAction(data));
    setIsSaved(false);
  };

  const handleDeletePost = () => {
  dispatch(deletePostAction(data));
  };

  const isOwnPost = isReqUserPost(post, user.reqUser);


  // const handleNavigate = (username) => {
  //   navigate(`/${username}`);
  // };

  // function handleClick() {
  //   setShowDropdown(!showDropdown);
  // }

  // function handleWindowClick(event) {
  //   if (!event.target.matches(".dots")) {
  //     setShowDropdown(false);
  //   }
  // }

  const handleOpenCommentModal = () => {
    navigate(`/p/${post.id}`, { state: { background: location } });
    onOpen();
  };
  // useEffect(() => {
  //   window.addEventListener("click", handleWindowClick);

  //   return () => {
  //     window.removeEventListener("click", handleWindowClick);
  //   };
  // }, []);

  const handleOpenEditPostModal = (postId) => {
    // navigate(`/p/${postId}/edit`)
    navigate(`/p/${postId}/edit`, { state: { from: location_page.pathname } });
    setOpenEditPostModal(true);
  }

  

  const handleCloseEditPostModal=()=>{
    setOpenEditPostModal(false)
  }
  // const handleOpenEditPostModal=(postId)=>{
  //   // navigate(`/p/${postId}/edit`)
  //   navigate(`/p/${postId}/edit`, { state: { from: location_page.pathname } });

  //   setOpenEditPostModal(true);
  // }

  // Render modal nếu postId trên URL trùng với post.id
  const showModal = postId && String(postId) === String(post.id);
  const ready =
  typeof setIsPostLiked === "function" &&
  typeof setNumberOfLike === "function" &&
  typeof setIsSaved === "function" &&
  typeof handleLikePost === "function" &&
  typeof handleUnLikePost === "function" &&
  typeof handleSavePost === "function" &&
  typeof handleUnSavePost === "function" &&
  typeof handleDeletePost === "function" &&
  typeof handleOpenEditPostModal === "function" &&
  isOwnPost !== undefined;
  return (
    <div className='p-2'>
        <div className='post w-60 h-60'>
            {/* <img className=' cursor-pointer' src={post?.image} alt="" /> */}
            {isVideo ? (
              <video
              src={post.image}
              style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }}
              preload="metadata"
              onClick={handleOpenCommentModal}
            />
            ) : (
            <img className='cursor-pointer' src={post?.image} alt="" onClick={handleOpenCommentModal}/>
            )}
            <div className='overlay'>
                <div className='overlay-text flex justify-between '>
                    <div className='flex items-center'><AiFillHeart className='mr-2'/> <span>{numberOfLikes}</span></div>
                    <div className='flex items-center'><FaComment className='mr-2' /> <span>{post?.comments?.length}</span></div>
                </div>
            </div>
        </div>
        {/* {showModal && ready &&  (
          <CommentModal
            isOpen={showModal}
            onClose={() => navigate(-1)}
            onOpen={onOpen}
            postData={post}
            handleLikePost={handleLikePost}
            handleUnLikePost={handleUnLikePost}
            isPostLiked={isPostLiked}
            setIsPostLiked={setIsPostLiked}
            numberOfLikes={numberOfLikes}
            setNumberOfLike={setNumberOfLike}
            handleSavePost={handleSavePost}
            handleUnSavePost={handleUnSavePost}
            isSaved={isSaved}
            handleDeletePost={handleDeletePost}
            handleOpenEditPostModal={handleOpenEditPostModal}
            isOwnPost={isOwnPost}
          />
        )}  */}
        {/* <EditPostModal onClose={handleCloseEditPostModal} isOpen={openEditPostModal} onOpen={handleOpenEditPostModal} /> */}
    </div>
  )
}

export default ReqUserPostCard
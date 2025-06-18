import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";

import StoryPage from "../../Components/Demo/Demo";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { getUserProfileAction } from "../../Redux/User/Action";
import Auth from "../Auth/Auth";
import HomePage from "../HomePage/HomePage";
import Profile from "../Profile/Profile";
import Story from "../Story/Story";
import ReelViewer from "../ReelViewer/ReelViewer";
import EditProfileForm from "../../Components/EditProfileComponent/EditProfileForm";
import Chat from "../../Components/Chat/Chat";
import CommentModal from "../../Components/Comment/CommentModal";
import EditPostModal from "../../Components/Post/Create/EditPostModal";
import { likePostAction, unLikePostAction, savePostAction, unSavePostAction, deletePostAction, findPostByIdAction } from "../../Redux/Post/Action";
import PrivateRoute from "./PrivateRoute";

const CommentModalOverlay = () => {
  const { postId } = useParams();
  const { post, user } = useSelector(store => store);
  const postData = post.posts?.find(p => String(p.id) === String(postId)) || post.singlePost;
  const reqUser = user.reqUser;
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // State cho EditPostModal
  const [openEditPostModal, setOpenEditPostModal] = useState(false);
  const [selectedEditPost, setSelectedEditPost] = useState(null);

  // Các handler cho CommentModal
  const handleLikePost = async () => {
    await dispatch(likePostAction({jwt: token, postId: postData?.id}));
    dispatch(findPostByIdAction({jwt: token, postId: postData?.id}));
    dispatch(getUserProfileAction(token));
  };

  const handleUnLikePost = async () => {
    await dispatch(unLikePostAction({jwt: token, postId: postData?.id}));
    dispatch(findPostByIdAction({jwt: token, postId: postData?.id}));
    dispatch(getUserProfileAction(token));
  };

  const handleSavePost = async () => {
    await dispatch(savePostAction({jwt: token, postId: postData?.id}));
    dispatch(findPostByIdAction({jwt: token, postId: postData?.id}));
    dispatch(getUserProfileAction(token));
  };

  const handleUnSavePost = async () => {
    await dispatch(unSavePostAction({jwt: token, postId: postData?.id}));
    dispatch(findPostByIdAction({jwt: token, postId: postData?.id}));
    dispatch(getUserProfileAction(token));
  };

  const handleDeletePost = (postId) => {
    dispatch(deletePostAction({jwt: token, postId}));
    navigate(-1);
  };

  // Mở EditPostModal từ CommentModal
  const handleOpenEditPostModal = (post) => {
    setSelectedEditPost(post);
    setOpenEditPostModal(true);
  };
  const handleCloseEditPostModal = () => {
    setOpenEditPostModal(false);
    setSelectedEditPost(null);
  };

  // Đóng CommentModal
  const handleCloseCommentModal = () => {
    if (location.state && location.state.background) {
      navigate(location.state.background.pathname, {replace: true});
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      <CommentModal
        isOpen={true}
        onClose={handleCloseCommentModal}
        postData={postData}
        reqUser={reqUser}
        handleLikePost={handleLikePost}
        handleUnLikePost={handleUnLikePost}
        handleSavePost={handleSavePost}
        handleUnSavePost={handleUnSavePost}
        handleDeletePost={handleDeletePost}
        handleOpenEditPostModal={handleOpenEditPostModal}
        isPostLiked={postData?.likedByUsers?.includes(reqUser?.id)}
        isSaved={postData?.savedByUsers?.includes(reqUser?.id)}
        isOwnPost={postData?.user?.id === reqUser?.id}
      />
      <EditPostModal
        isOpen={openEditPostModal}
        onClose={handleCloseEditPostModal}
        postData={selectedEditPost}
      />
    </>
  );
};

const Routers = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const background = location.state && location.state.background;

  // Kiểm tra token khi khởi động app
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (
      !token &&
      location.pathname !== "/login" &&
      location.pathname !== "/signup"
    ) {
      navigate("/login", { replace: true });
    }
  }, [location, navigate]);

  return (
    <div>
      {(location.pathname !== "/login" && location.pathname !=="/signup") && (
        <PrivateRoute>
          <div className="flex">
            {location.pathname!=="/reels" && <div className="sidebarBox border border-l-slate-500 w-[20%]">
              <Sidebar />
            </div>}
            <div className="w-full">
              <Routes location={background || location}>
                <Route path="/" element={<HomePage />} />
                <Route path="/p/:postId" element={<HomePage />} />
                <Route path="/p/:postId/edit" element={<HomePage />} />
                <Route path="/:username" element={<Profile />} />
                <Route path="/demo" element={<StoryPage />} />
                <Route path="/story/:userId" element={<Story />} />
                <Route path="/account/edit" element={<EditProfileForm />} />
                <Route path="/reels" element={<ReelViewer />} />
                <Route path="/:username/followers" element={<Profile />} />
                <Route path="/:username/following" element={<Profile />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:userId" element={<Chat />} />
              </Routes>

              {background && (
                <Routes>
                  <Route path="/p/:postId" element={<CommentModalOverlay />} />
                </Routes>
              )}
            </div>
          </div>
        </PrivateRoute>
      )}
      {(location.pathname === "/login" || location.pathname==="/signup") && (
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
        </Routes>
      )}
    </div>
  );
};

export default Routers;

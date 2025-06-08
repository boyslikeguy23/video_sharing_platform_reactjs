import React, { useEffect, useState } from "react";
import { TbCircleDashed } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { followUserAction, unFollowUserAction, removeFollowerAction, findByUsernameAction } from "../../Redux/User/Action";
import "./UserDetailCard.css"
import FollowerModal from "./FollowerModal";
import FollowingModal from "./FollowingModal";
import { useDisclosure } from "@chakra-ui/react";

// import { isReqUser } from '../../Config/Logic'
const UserDetailCard = ({ user, isRequser, isFollowing }) => {

  const token = localStorage.getItem("token");
  const { post } = useSelector((store) => store);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const { user } = useSelector((store) => store);
  
  const [isFollow,setIsFollow]=useState(false);
  const [isFollowerModalOpen, setFollowerModalOpen] = useState(false);
  const [isFollowingModalOpen, setFollowingModalOpen] = useState(false);
  // const { isOpen, onOpen, onClose } = useDisclosure();

  const goToAccountEdit = () => {
    navigate("/account/edit");
  };

  console.log("user --- ", user);
  

  const data = {
    jwt: token,
    userId: user?.id,
  };
  const handleOpenFollowerModal = () => {
    navigate(`/${user.username}/followers`);
    setFollowerModalOpen(true);
    // navigate(`/${user.username}/followers`);
    // onOpen();
  };
  const handleCloseFollowerModal = () => {
    setFollowerModalOpen(false);
    navigate(`/${user.username}`);

  };
  const handleOpenFollowingModal = () => {
    navigate(`/${user.username}/following`);
    setFollowingModalOpen(true);
    // navigate(`/${user.username}/following`);
    // onOpen();
  };
  const handleCloseFollowingModal = () => {
    setFollowingModalOpen(false);
    navigate(`/${user.username}`);

  };

  const handleFollowUser = () => {
    dispatch(followUserAction(data)).then(() => {
      dispatch(findByUsernameAction({ token, username: user.username }));
    });
    setIsFollow(true);
  };

  const handleUnFollowUser = () => {
    dispatch(unFollowUserAction(data)).then(() => {
      dispatch(findByUsernameAction({ token, username: user.username }));
    });
    setIsFollow(false);
  };

  useEffect(()=>{
setIsFollow(isFollowing)
  },[isFollowing])

  const handleRemoveFollower = (followerUserId) => {
    dispatch(removeFollowerAction({ 
      followerUserId,
      userId: user.id,
      jwt: token
    }));
  };

  if (!user) return null;
  return (
    <div className="py-10">
      <div className="flex items-center">
        <div className="">
           <img
          className="h-20 w-20 lg:w-32 lg:h-32 rounded-full"
          src={
            user?.image ||
            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
          }
          alt=""
        />
        </div>
       

        <div className="ml-10 space-y-5 text-xs w-[50%] md:w-[60%] lg:w-[80%]">
          <div className=" flex space-x-10 items-center">
            <p className="text-base">{user?.username}</p>
            <button className="text-xs py-1 px-5 bg-slate-100 hover:bg-slate-300 rounded-md font-semibold">
              {isRequser ? (
                <span onClick={goToAccountEdit}>Chỉnh sửa trang cá nhân</span>
              ) : isFollow ? (
                <span onClick={handleUnFollowUser}>Bỏ theo dõi </span>
              ) : (
                <span onClick={handleFollowUser}>Theo dõi</span>
              )}
            </button>
            <button className="text-xs py-1 px-5 bg-slate-100 hover:bg-slate-300 rounded-md font-semibold">
              {isRequser ? "Add tools" : "Message"}
            </button>
            <TbCircleDashed className="text-xl" />
          </div>

          <div className="flex space-x-10">
            <div>
              <span className="font-semibold mr-2">
                {post?.reqUserPost?.length || 0}
              </span>
              <span>bài đăng</span>
            </div>

            <div>
              <span className="font-semibold mr-2" >   {/* Viết hàm onClick tại đây để pop ra cái FollowerItem, đường dẫn URL thì là route đến Profile*/}
                {user?.follower?.length}
              </span>
              <span onClick={handleOpenFollowerModal} className="cursor-pointer">Người theo dõi</span>
            </div>
            <div>
              <span className="font-semibold mr-2" >  {/* Viết hàm onClick tại đây để pop ra cái FollowingItem, đường dẫn URL thì là route đến Profile*/}
                {user?.following?.length}
              </span>
              <span onClick={handleOpenFollowingModal} className="cursor-pointer">Đang theo dõi</span>
            </div>
          </div>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="font-thin text-sm">{user?.bio}</p>
          </div>
        </div>
      </div>
      <FollowerModal
      followers={user.follower}
      isOpen={isFollowerModalOpen}
      onClose={handleCloseFollowerModal}
      onRemoveFollower={isRequser ? handleRemoveFollower : undefined}
      />
      <FollowingModal
      following={user.following}
      //onUnfollow={handleFollowUser}
      isOpen={isFollowingModalOpen}
      onClose={handleCloseFollowingModal}
      />
    </div>
  );
};

export default UserDetailCard;

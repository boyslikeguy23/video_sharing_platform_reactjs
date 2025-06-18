import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import ProfilePostsPart from '../../Components/ProfilePageCard/ProfilePostsPart'
import UserDetailCard from '../../Components/ProfilePageCard/UserDetailCard'
import { isFollowing, isReqUser } from '../../Config/Logic'
import { findByUsernameAction, getUserProfileAction } from '../../Redux/User/Action'
import { usePostData } from '../../Hooks/usePostData'
import CommentModal from '../../Components/Comment/CommentModal'

const Profile = () => {
  const dispatch=useDispatch();
  const token = localStorage.getItem("token");
  const {username} = useParams();
  const {user, post }=useSelector((store)=>store);
  const { postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isRequser=isReqUser(user.reqUser?.id,user.findByUsername?.id); // hàm kiểm tra xem có phải mình hay người khác
  const isFollowed=isFollowing(user.reqUser,user.findByUsername);
  console.log(user)

  useEffect(()=>{
    const data={
      token,
      username
    }
    dispatch(getUserProfileAction(token))
    dispatch(findByUsernameAction(data))
  },[username,user.follower,user.following])
  const profileUser = isRequser ? user.reqUser : user.findByUsername;
  if (!profileUser) {
    return <div>Đang tải.......</div>;
  }
    return (
    <div className='px-20'>
        <div>
            <UserDetailCard user={profileUser} isFollowing={isFollowed} isRequser={isRequser}/>
        </div>
        <div>
            <ProfilePostsPart user={profileUser} posts={post.reqUserPost} isRequser={isRequser}
 />
        </div>
       
    </div>
  )
}

export default Profile
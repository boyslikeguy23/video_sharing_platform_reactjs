import React, { useRef, useState } from 'react';
import "./ReqUserPostCard.css";
import {AiFillHeart} from "react-icons/ai";
import {FaComment} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@chakra-ui/react";

const ReqUserPostCard = ({post}) => {
  const [showVideo, setShowVideo] = useState(false);
  const isVideo = post?.image && /\.(mp4|webm|ogg)$/i.test(post.image);
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleGoToDetail = () => {
  navigate(`/p/${post.id}`);
  onOpen();
  };
  return (
    <div className='p-2'>
        <div className='post w-60 h-60'>
            {/* <img className=' cursor-pointer' src={post?.image} alt="" /> */}
            {isVideo ? (
              <video
              src={post.image}
              style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }}
             
              preload="metadata"
        // poster={posterUrl} // Nếu có thumbnail riêng
            />
          // ) : (
          //   <video
          //     src={post.image}
          //     style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }}
          //     onClick={() => setShowVideo(true)}
          //     preload="metadata"

              // poster={posterUrl} // Nếu bạn có ảnh poster riêng, thêm dòng này
          //  />
            ) : (
            <img className='cursor-pointer' src={post?.image} alt="" />
            )}
            <div className='overlay'>
                <div className='overlay-text flex justify-between '>
                    <div className='flex items-center'><AiFillHeart className='mr-2'/> <span>{post?.likedByUsers?.length}</span></div>
                    <div className='flex items-center'><FaComment className='mr-2' /> <span>{post?.comments?.length}</span></div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ReqUserPostCard
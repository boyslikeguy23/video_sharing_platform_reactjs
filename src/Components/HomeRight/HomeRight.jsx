import React from "react";
import { BsDot } from "react-icons/bs";
import { useSelector } from "react-redux";
import SuggestionsUserCard from "./SuggestionsUserCard";
import { useNavigate } from "react-router-dom";

const HomeRight = ({suggestedUser}) => {
  const navigate = useNavigate();
  const handleNavigate = (username) => {
    navigate(`/${username}`);
  };
  const {user}=useSelector(store=>store);
  return (
    <div>
      <div>
        <div className="flex justify-between items-center">
          <div className="flex items-center ">
            <img
              className="w-12 h-12 rounded-full"
              src={ user.reqUser?.image ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
              alt=""
            />
            <div className="ml-3">
              <p className="cursor-pointer"onClick={() => handleNavigate(user.reqUser?.username)}>{user.reqUser?.username}</p>
              <p className="opacity-70">{user.reqUser?.name}</p>
            </div>
          </div>
          <p className="text-blue-600 font-semibold">Đổi tài khoản</p>
        </div>
        <div className="flex justify-between py-5 items-center">
          <p className="font-semibold opacity-70">Gợi ý cho bạn</p>
          <p className="text-xs font-semibold opacity-95">Xem tất cả</p>
        </div>

        <div className="space-y-5">
          {suggestedUser.map((item, index) => (
            <SuggestionsUserCard
              key={index}
              image={
                item.userImage || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
              }
              username={item.username}
              description={"Đang theo dõi bạn"}
            />
          ))}
        </div>
        <div className="opacity-60 text-xs flex items-center flex-wrap mt-10">
            <span>Về chúng tôi</span>
            <BsDot/>
            <span>Hỗ trợ</span>
            {/* <BsDot/>
            <span>Press</span>
            <BsDot/>
            <span>API</span> */}
            {/* <BsDot/>
            <span>Jobs</span> */}
            <BsDot/>
            <span>Chính sách</span>
            <BsDot/>
            <span>Điều khoản</span>
            <BsDot/>
            <span>Địa điểm</span>
            <BsDot/>
            <span>Ngôn ngữ</span>
            <BsDot/>
            <span>English</span>
            <BsDot/>
            <span>Meta</span>
            {/* <BsDot/>
            <span>Verified</span> */}
                
         
        </div>
      </div>
    </div>
  );
};

export default HomeRight;

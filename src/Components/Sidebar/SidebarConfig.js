import {
    AiOutlineHome,
    AiFillHome,
    AiOutlineSearch,
    AiOutlineCompass,
    AiFillCompass,
    AiFillMessage,
    AiOutlineMessage,
    AiOutlineHeart,
    AiFillHeart,
    AiOutlinePlusCircle,
    AiFillPlusCircle,
  } from "react-icons/ai";
  import { RiVideoFill, RiVideoLine } from "react-icons/ri";
  import { CgProfile } from "react-icons/cg";

export const mainu = [
    {
      title: "Trang chủ",
      icon: <AiOutlineHome className="text-2xl mr-5" />,
      activeIcon: <AiFillHome className="text-2xl mr-5" />,
    },
    {
      title: "Tìm kiếm",
      icon: <AiOutlineSearch className="text-2xl mr-5" />,
      activeIcon: <AiOutlineSearch className="text-2xl mr-5" />,
    },
    {
      title: "Khám phá",
      icon: <AiOutlineCompass className="text-2xl mr-5" />,
      activeIcon: <AiFillCompass className="text-2xl mr-5" />,
    },
    {
      title: "Reels",
      icon: <RiVideoLine className="text-2xl mr-5" />,
      activeIcon: <RiVideoFill className="text-2xl mr-5" />,
    },
    {
      title: "Tạo Reels",
      icon: <RiVideoLine className="text-2xl mr-5" />,
      activeIcon: <RiVideoFill className="text-2xl mr-5" />,
    },
    {
      title: "Tin nhắn",
      icon: <AiOutlineMessage className="text-2xl mr-5" />,
      activeIcon: <AiFillMessage className="text-2xl mr-5" />,
    },
    {
      title: "Thông báo",
      icon: <AiOutlineHeart className="text-2xl mr-5" />,
      activeIcon: <AiFillHeart className="text-2xl mr-5" />,
    },
    {
      title: "Tạo",
      icon: <AiOutlinePlusCircle className="text-2xl mr-5" />,
      activeIcon: <AiFillPlusCircle className="text-2xl mr-5" />,
    },
    { title: "Hồ sơ", icon: <CgProfile className="text-2xl mr-5" />, activeIcon: <CgProfile className="text-2xl mr-5" /> },
  ];
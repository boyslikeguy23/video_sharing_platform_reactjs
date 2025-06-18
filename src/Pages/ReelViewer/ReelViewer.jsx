import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllReels } from "../../Redux/Reel/Action";
import { IconButton } from "@chakra-ui/react";
import { GrNext, GrPrevious } from "react-icons/gr";

const ReelViewer = () => {
  const [currentReel, setCurrentReel] = useState(0);
  const dispatch = useDispatch();
  const { user, reel } = useSelector((store) => store);
  const jwt = localStorage.getItem("token");

  useEffect(() => {
    dispatch(getAllReels(jwt));
  }, [dispatch, jwt]);

  const handleNextReel = () => {
    if (currentReel === reel.reels.length - 1) {
      setCurrentReel(0);
    } else {
      setCurrentReel(currentReel + 1);
    }
  };

  const handlePrevReel = () => {
    if (currentReel === 0) {
      setCurrentReel(reel.reels.length - 1);
    } else {
      setCurrentReel(currentReel - 1);
    }
  };

  return (
    <div className="reel-viewer h-screen flex flex-col items-center justify-center bg-gray-900">
      <div className="relative reel-player w-[30vw] lg:w-[20vw] ">
        <video
          width={"100%"}
          height={"100%"}
          src={reel.reels[currentReel]?.video}
          controls
          className="reel-video"
        />
        <IconButton
          onClick={handlePrevReel}
          className="absolute -top-72 -left-20"
          colorScheme='facebook'
          aria-label="Previous reel"
          icon={<GrPrevious className="text-white"/>}
        />
        <IconButton
          onClick={handleNextReel}
          className="absolute -top-72 -right-[19rem] text-white"
          colorScheme='facebook'
          aria-label="Next reel"
          icon={<GrNext className="text-white"/>}
        />
      </div>
    </div>
  );
};

export default ReelViewer;

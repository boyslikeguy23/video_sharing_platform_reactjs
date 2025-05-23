import React from 'react'
import { useNavigate } from "react-router-dom";

const SuggestionsUserCard = ({image,username,description}) => {
const navigate = useNavigate();
  
const handleNavigate = (username) => {
navigate(`/${username}`);
};
  return (
    <div className='flex justify-between items-center'>
        <div className='flex items-center'>
            <img className='w-9 h-9 rounded-full' src={image} alt="" />
            <div className='ml-2'>
                <p className='text-sm font-semibold cursor-pointer'  onClick={() => handleNavigate(username)}
                  >{username}</p>
                <p className='text-sm font-semibold opacity-70'>{description}</p>
            </div>
        </div>
        {/* <p className='text-blue-700 text-sm font-semibold'>Follow</p> */}
    </div>
  )
}

export default SuggestionsUserCard
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { findUserPost } from '../Redux/Post/Action';

export const usePostData = (userIds, token) => {
  const dispatch = useDispatch();
  const { post } = useSelector((store) => store);

  useEffect(() => {
    if (userIds.length > 0) {
      const data = {
        userIds: [userIds].join(','),
        jwt: token
      };
      dispatch(findUserPost(data));
    }
  }, [userIds, post.createdPost, post.deletedPost, post.updatedPost]);

  return post.userPost || [];
};


import React from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Input } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { followUserAction, unFollowUserAction } from "../../Redux/User/Action"; 
const FollowingModal = ({ isOpen, onClose, following = [], onUnfollow }) => {
  const [search, setSearch] = React.useState("");
  const handleNavigate = (username) => {
    navigate(`/${username}`);
  };
  const navigate = useNavigate();
  
  const filteredFollowing = following.filter(
    (user) =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Đang theo dõi</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            placeholder="Tìm kiếm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            mb={4}
          />
          <div className="max-h-[350px] overflow-y-auto">
            {filteredFollowing.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <img
                    src={user.userImage || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-xs opacity-70">{user.name}</p>
                  </div>
                </div>
                <button
                  className="bg-slate-100 hover:bg-slate-300 px-4 py-1 rounded font-semibold text-sm"
                  onClick={() => onUnfollow && onUnfollow(user.id)}
                >
                  Bỏ theo dõi
                </button>
              </div>
            ))}
            {filteredFollowing.length === 0 && (
              <p className="text-center text-sm opacity-60 py-4">Không tìm thấy người nào</p>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default FollowingModal;
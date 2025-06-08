import React from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Input } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";

const FollowerModal = ({ isOpen, onClose, followers = [], onRemoveFollower }) => {

  const navigate = useNavigate();
  const [search, setSearch] = React.useState("");
  const handleNavigate = (username) => {
    navigate(`/${username}`);
  };
  const filteredFollowers = followers.filter(
    (user) =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Modal isOpen={isOpen}  onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Người theo dõi</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            placeholder="Tìm kiếm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            mb={4}
          />
          <div className="max-h-[350px] overflow-y-auto">
            {filteredFollowers.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-100 rounded">
                <div className="flex items-center" onClick={() => { onClose(); navigate(`/${user.username}`); }}>
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
                {onRemoveFollower && (
                  <button
                    className="bg-slate-100 hover:bg-slate-300 px-4 py-1 rounded font-semibold text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFollower(user.id);
                    }}
                  >
                    Xóa
                  </button>
                )}
              </div>
            ))}
            {filteredFollowers.length === 0 && (
              <p className="text-center text-sm opacity-60 py-4">Không tìm thấy người theo dõi nào</p>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default FollowerModal;
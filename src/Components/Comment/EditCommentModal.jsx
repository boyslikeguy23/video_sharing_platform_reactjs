import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure,
  } from "@chakra-ui/react";
  
  function EditCommentModal({ isOpen, onOpen, onClose,handleProfileImageChange }) {
  
      
  
  
    return (
      <>
        <Modal onClose={onClose} isOpen={isOpen} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader textAlign={"center"}>Modal Title</ModalHeader>
  
            <ModalBody>
              <div className="flex flex-col items-center">
                <label
                  for="profileImage"
                  className="font-bold py-3 text-blue-600 text-center cursor-pointer text-xs w-full"
                >
                 Xoá
                </label>
  
                <input onChange={handleProfileImageChange} type="file" id="profileImage" name="profileImage" />
              </div>
  
              <hr />
  
              <p className="font-bold py-3 text-red-600 text-center">
                Sửa
              </p>
              <hr />
              <p className=" py-3 text-center" onClick={onClose}>
                Huỷ
              </p>
            </ModalBody>
            {/* <ModalFooter>
                <Button onClick={onClose}>Close</Button>
              </ModalFooter> */}
          </ModalContent>
        </Modal>
      </>
    );
  }
  
  export default EditCommentModal;
  
import {
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Stack,
  Select,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  editUserDetailsAction,
  getUserProfileAction,
} from "../../Redux/User/Action";
import { useToast } from "@chakra-ui/react";
import ChangeProfilePhotoModal from "./ChangeProfilePhotoModal";
import { uploadToCloudinary } from "../../Config/UploadToCloudinary";

const EditProfileForm = () => {
  const { user } = useSelector((store) => store);
  const toast = useToast();
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [imageFile,setImageFile]=useState(null);

  const [initialValues, setInitialValues] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
    mobile: "",
    gender: "",
    website: "",
    private: false,
    
  });
  useEffect(() => {
    dispatch(getUserProfileAction(token));
  }, [token]);

  useEffect(() => {
    console.log("reqUser", user.reqUser);
    const newValue = {};

    for (let item in initialValues) {
      if (user.reqUser && user.reqUser[item]) {
        newValue[item] = user.reqUser[item];
      }
    }

    console.log("new value -: ", newValue);

    formik.setValues(newValue);
  }, [user.reqUser]);

  const formik = useFormik({
    initialValues: { ...initialValues },
    onSubmit: (values) => {
      const data = {
        jwt: token,
        data: { ...values, id: user.reqUser?.id },
      };
      dispatch(editUserDetailsAction(data));
      toast({
        title: "Câp nhật thành công...",

        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  async function handleProfileImageChange(event) {
    const selectedFile = event.target.files[0];
    const image = await uploadToCloudinary(selectedFile);
    setImageFile(image)
    const data = {
      jwt: token,
      data: { image, id: user.reqUser?.id },
    };
    dispatch(editUserDetailsAction(data))

    // dispatch(getUserProfileAction(token))

    onClose();
  }

  // console.log("initial value ---- ", initialValues);

  return (
    <div className="border rounded-md p-10">
      <div className="flex pb-7">
        <div className="w-[15%]">
          <img
            className="w-8 h-8 rounded-full"
            src={
              imageFile ||
              user.reqUser?.image ||
              "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
            }
            alt=""
          />
        </div>

        <div>
          <p>{user.reqUser?.username}</p>
          <p
            onClick={onOpen}
            className="font-bold text-blue-800 cursor-pointer"
          >
            Thay đổi ảnh đại diện
          </p>
        </div>
      </div>
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing="6">
          <FormControl className="flex " id="name">
            <FormLabel className="w-[15%]">Tên</FormLabel>
            <div className="w-full">
              <Input
                placeholder="Name"
                className="w-full"
                type="text"
                {...formik.getFieldProps("name")}
              />
              <FormHelperText className="text-xs">
                Giúp mọi người khám phá tài khoản của bạn bằng cách sử dụng tên mà bạn được biết đến
                : tên đầy đủ, biệt danh hoặc tên doanh nghiệp của bạn.
              </FormHelperText>
              <FormHelperText className="text-xs">
                Bạn chỉ có thể đổi tên hai lần trong vòng 14 ngày.
              </FormHelperText>
            </div>
          </FormControl>
          <FormControl className="flex " id="username">
            <FormLabel className="w-[15%]">Tên đại diện</FormLabel>
            <div className="w-full">
              <Input
                placeholder="Username"
                className="w-full"
                type="text"
                {...formik.getFieldProps("username")}
              />
              <FormHelperText className="text-xs">
                Trong hầu hết các trường hợp, bạn sẽ có thể đổi tên người dùng của mình trở lại
                trong 14 ngày nữa. Tìm hiểu thêm
              </FormHelperText>
            </div>
          </FormControl>
          <FormControl className="flex " id="website">
            <FormLabel className="w-[15%]">Website</FormLabel>
            <div className="w-full">
              <Input
                placeholder="Website"
                className="w-full"
                type="text"
                {...formik.getFieldProps("website")}
              />
              <FormHelperText className="text-xs">
                
              </FormHelperText>
            </div>
          </FormControl>
          <FormControl className="flex " id="bio">
            <FormLabel className="w-[15%]">Tiểu sử</FormLabel>
            <div className="w-full">
              <Textarea
                placeholder="Bio"
                className="w-full"
                type="text"
                {...formik.getFieldProps("bio")}
              />
            </div>
          </FormControl>

          <div className="py-10">
            <p className="font-bold text-sm">Thông tin cá nhân</p>
            <p className="text-xs">
              Cung cấp thông tin cá nhân của bạn, ngay cả khi tài khoản được sử dụng cho
              một doanh nghiệp, thú cưng hoặc mục đích khác. Thông tin này sẽ không nằm trong
              hồ sơ công khai của bạn.
            </p>
          </div>
{/* 
          <FormControl className="flex " id="email">
            <FormLabel className="w-[15%]">Email address</FormLabel>
            <div className="w-full">
              <Input
                placeholder="Email"
                className="w-full"
                type="email"
                {...formik.getFieldProps("email")}
              />
            </div>
          </FormControl> */}

          <FormControl className="flex " id="mobile">
            <FormLabel className="w-[15%]">Số điện thoại</FormLabel>
            <div className="w-full">
              <Input
                placeholder="Phone"
                className="w-full"
                type="tel"
                {...formik.getFieldProps("mobile")}
              />
            </div>
          </FormControl>
          {/* <FormControl className="flex " id="gender">
            <FormLabel className="w-[15%]">Gender</FormLabel>
            <div className="w-full">
              <Input
                placeholder="Gender"
                className="w-full"
                type="text"
                {...formik.getFieldProps("gender")}
              />
            </div>
          </FormControl> */}
          <FormControl className="flex " id="gender">
            <FormLabel className="w-[15%]">Giới tính</FormLabel>
            <div className="w-full">
              <Select
                placeholder="Chọn giới tính"
                className="w-full"
                {...formik.getFieldProps("gender")}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </Select>
            </div>
          </FormControl>
          {/* <FormControl className="flex " id="private">
            <Checkbox {...formik.getFieldProps("private")}>
              Pr className="w-full"ivate Account
            </Checkbox>
          </FormControl> */}

          <div>
            <Button colorScheme="blue" type="submit" className="">
              Lưu
            </Button>
          </div>
        </Stack>
      </form>

      <ChangeProfilePhotoModal
        handleProfileImageChange={handleProfileImageChange}
        isOpen={isOpen}
        onClose={onClose}
        onOpen={onOpen}
      />
    </div>
  );
};

export default EditProfileForm;

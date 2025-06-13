import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  useToast,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { signinAction } from "../../Redux/Auth/Action";
import { getUserProfileAction } from "../../Redux/User/Action";
// import { Link } from "react-router-dom"

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Email không hợp lệ").required("Yêu cầu nhập email"),
  password: Yup.string()
    .min(8, "Mật khẩu ít nhất 8 ký tự")
    .required("Yêu cầu nhập mật khẩu"),
});

const Signin = () => {
  const initialValues = { email: "", password: "" };
  const [collapsed, setCollapsed] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user,signin } = useSelector((store) => store);
  const toast = useToast();
  const logoText = collapsed ? "I" : "Vidstagram";
  const token = localStorage.getItem("token");
  console.log("token in signin page ",token)
  console.log("reqUser -: ", user);
  useEffect(() => {
    if (token) dispatch(getUserProfileAction(token || signin));
  }, [signin,token]);

  useEffect(() => {
    if (user?.reqUser?.username && token) {
      if (user?.reqUser?.id) {
        localStorage.setItem('userId', user.reqUser.id);
      }
     // navigate(`/${user.reqUser?.username}`);
      navigate(`/`);
      toast({
        title: "Đăng nhập thành công",
        status: "success",
        duration: 8000,
        isClosable: true,
      });
    }
  }, [user.reqUser]);

//   useEffect(() => {
//   if (signin?.error) {
//     toast({
//       title: "Đăng nhập không thành công",
//       description: signin.error || "Vui lòng kiểm tra lại email và mật khẩu.",
//       status: "error",
//       duration: 8000,
//       isClosable: true,
//     });
//   }
// }, [signin?.error, toast]);

  const handleSubmit = (values, actions) => {
    console.log(values);
    dispatch(signinAction(values));
    actions.setSubmitting(false);
  };

  return (
    <div className=" ">
      <div className="border border-slate-300">
        <Box p={8} display="flex" flexDirection="column" alignItems="center">
        {/* <img
          className="border border-red-800 mb-5"
          src="https://i.imgur.com/zqpwkLQ.png"
          alt=""
        /> */}
        <div className="p-4 border-b">
            <span className="text-2xl font-bold instagram-text-gradient">
              {logoText}
            </span>
        </div>
        
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
        >
          {(formikProps) => (
            <Form className="w-full">
              <Field name="email">
                {({ field, form }) => (
                  <FormControl
                    isInvalid={form.errors.email && form.touched.email}
                    mb={4}
                  >
                    <Input
                      className="w-full"
                      {...field}
                      id="email"
                      placeholder="Email"
                    />
                    <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>

              <Field name="password">
                {({ field, form }) => (
                  <FormControl
                    isInvalid={form.errors.password && form.touched.password}
                    mb={4}
                  >
                    <Input
                      {...field}
                      type="password"
                      id="password"
                      placeholder="Mật khẩu"
                    />
                    <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <p className="text-center">
                Những người sử dụng dịch vụ của chúng tôi có thể đã tải thông tin liên hệ của bạn lên Vidstagram. 
                Tìm hiểu thêm

              </p>
              <p className="mt-5 text-center">
              Bằng cách đăng ký, bạn đồng ý với Điều khoản, Chính sách quyền riêng tư và
              Chính sách cookie của chúng tôi.
              </p>
              <Button
                className="w-full"
                mt={4}
                colorScheme="blue"
                type="submit"
                isLoading={formikProps.isSubmitting}
              >
                Đăng nhập
              </Button>
            </Form>
          )}
        </Formik>
      </Box>

      </div>
      
      <div className="w-full border border-slate-300 mt-5">
<p className="text-center py-2">Nếu bạn không có tài khoản?<span onClick={()=>navigate("/signup")} className="ml-2 text-blue-700 cursor-pointer">Đăng kí</span></p>
      </div>
    </div>
  );
};

export default Signin;

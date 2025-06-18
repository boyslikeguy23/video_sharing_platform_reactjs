import { Formik, Form, Field } from "formik";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  useToast,
} from "@chakra-ui/react";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { signupAction } from "../../Redux/Auth/Action";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";



const validationSchema = Yup.object().shape({
  email: Yup.string().email("Sai địa chỉ email").required("Yêu cầu nhập thông tin"),
  username: Yup.string()
    .min(4, "Username phải ít nhất 4 kí tự")
    .required("Yêu cầu nhập thông tin"),
  password: Yup.string()
    .min(8, "Mật khẩu phải ít nhất 8 kí tự")
    .required("Yêu cầu nhập thông tin"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Mật khẩu nhập lại không khớp')
    .required('Yêu cầu nhập thông tin'),
  name: Yup.string()
    .min(2, "Tên phải ít nhất 2 kí tự")
    .required("Yêu cầu nhập thông tin"),
});
 

const Signup = () => {
  const [collapsed, setCollapsed] = useState(false);
  const logoText = collapsed ? "I" : "Vidstagram";
  const initialValues = { email: "", username: "", password: "", confirmPassword: "", name:"" };
  const dispatch=useDispatch();
  const {auth}=useSelector(store=>store);
  const navigate=useNavigate();
  const toast = useToast();
  console.log("auth :-",auth.signup?.username)

  const handleSubmit = (values,actions) => {
    dispatch(signupAction(values))
    console.log("signup",values);
    actions.setSubmitting(false);
  };

  useEffect(()=>{
    if(auth.signup?.username){
      navigate("/login")
      toast({
        title: 'Đăng ký thành công',
        status: 'success',
        duration: 8000,
        isClosable: true,
      })
    } else if(auth.signup?.error || auth.signup?.message) {
      toast({
        title: 'Đăng ký thất bại',
        description: auth.signup?.error || auth.signup?.message,
        status: 'error',
        duration: 8000,
        isClosable: true,
      })
    }
  },[auth.signup])

  return (
    
    <div>
        <div className="border border-slate-300 ">
      <Box p={8} display="flex" flexDirection="column" alignItems="center">
        {/* <img
          className="border border-red-800"
          src="https://i.imgur.com/zqpwkLQ.png"
          alt=""
        /> */}
        <div className="p-4 border-b">
            {/* <Link to="/" className="flex items-center"> */}
              <span className="text-2xl font-bold instagram-text-gradient">
                {logoText}
              </span>
            {/* </Link> */}
          </div>
        <p className="font-bold opacity-50 text-lg mb-10 text-center">
          Đăng ký để xem ảnh và video từ bạn bè của bạn.

        </p>
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
              <Field name="username">
                {({ field, form }) => (
                  <FormControl
                    isInvalid={form.errors.username && form.touched.username}
                    mb={4}
                  >
                    <Input {...field} id="username" placeholder="Tên hiển thị" />
                    <FormErrorMessage>{form.errors.username}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="name">
                {({ field, form }) => (
                  <FormControl
                    isInvalid={form.errors.name && form.touched.name}
                    mb={4}
                  >
                    <Input {...field} id="name" placeholder="Họ và tên" />
                    <FormErrorMessage>{form.errors.name}</FormErrorMessage>
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
              <Field name="confirmPassword">
                {({ field, form }) => (
                  <FormControl
                    isInvalid={form.errors.confirmPassword && form.touched.confirmPassword}
                    mb={4}
                  >
                    <Input
                      {...field}
                      type="password"
                      id="confirmPassword"
                      placeholder="Nhập lại mật khẩu"
                    />
                    <FormErrorMessage>{form.errors.confirmPassword}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <p className="text-center">
                Những người sử dụng dịch vụ của chúng tôi có thể đã tải thông tin liên hệ của bạn 
                lên Vidstagram. Tìm hiểu thêm

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
                Đăng kí
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </div>
    <div className="w-full border border-slate-300 mt-5">
       <p className="text-center py-2">Nếu bạn đã có tài khoản? <span onClick={()=>navigate("/login")} className="ml-2 text-blue-700 cursor-pointer">Đăng nhập</span></p>
    </div>
    </div>
  
  );
};

export default Signup;

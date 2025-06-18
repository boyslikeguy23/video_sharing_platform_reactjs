// ${BASE_URL}


import { BASE_URL } from "../../Config/api";
import { SIGN_IN, SIGN_UP } from "./ActionType";

export const signinAction = (data) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_URL}/signin`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(data.email + ":" + data.password),
      },
    });
    if (!res.ok) {
      let errorMsg = "Invalid username hoặc password";
      try {
        const errorData = await res.json();
        errorMsg = errorData.error || errorData.message || errorMsg;
      } catch (e) {
        // Nếu không parse được JSON thì giữ nguyên errorMsg mặc định
      }
      dispatch({ type: SIGN_IN, payload: { error: errorMsg } });
      return;
    }
    const token = res.headers.get("Authorization");
    if (!token) {
      dispatch({ type: SIGN_IN, payload: { error: "Invalid username hoặc password" } });
      return;
    }
    localStorage.setItem("token", token);
    dispatch({ type: SIGN_IN, payload: token });
  } catch (error) {
    dispatch({ type: SIGN_IN, payload: { error: "Lỗi kết nối server!" } });
  }
};

export const signupAction = (data) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const user = await res.json();
    console.log("Signup :- ",user)
    dispatch({ type: SIGN_UP, payload: user });
  } catch (error) {
    console.log("catch error ", error);
  }
};

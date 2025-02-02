import { LoginInput, SignUpInput } from "@kenil_vora/neighborly";
import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { IUserDetails } from "@kenil_vora/neighborly";

type OtpType = "signup" | "login" | "twoFactorAuth";

const initialState = {
  signUpData: null as SignUpInput | null,
  loginData: null as LoginInput | null,
  twoFactorAuthData: false,
  user: (() => {
    const userCookie = Cookies.get("user");
    return userCookie ? (JSON.parse(userCookie) as IUserDetails) : null;
  })(),
  token: Cookies.get("token") ? Cookies.get("token") : null,
  otpType: "signup" as OtpType,
  isLoading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    setSignUpData: (state, action) => {
      state.signUpData = action.payload;
    },
    setLoginData: (state, action) => {
      state.loginData = action.payload;
    },
    setTwoFactorAuthData: (state, action) => {
      state.twoFactorAuthData = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setOtpType: (state, action) => {
      state.otpType = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setSignUpData,
  setLoginData,
  setTwoFactorAuthData,
  setUser,
  setToken,
  setOtpType,
  setIsLoading,
} = userSlice.actions;

export default userSlice.reducer;

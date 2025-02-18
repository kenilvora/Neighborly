import { LoginInput, SignUpInput, IUserDetails } from "@kenil_vora/neighborly";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

type OtpType = "signup" | "login" | "twoFactorAuth";
type LoadingKeys =
  | "signUp"
  | "login"
  | "twoFactorAuth"
  | "sendOtp"
  | "updateProfile"
  | "passwordChange"
  | "resetPassword"
  | "resetPasswordToken"
  | "logout"
  | "addMoney";

const initialState = {
  signUpData: null as SignUpInput | null,
  loginData: null as LoginInput | null,
  twoFactorAuthData: {
    email: "",
    twoFactorAuth: false,
  },
  user: Cookies.get("user")
    ? (JSON.parse(Cookies.get("user") as string) as IUserDetails)
    : null,
  token: Cookies.get("token") ? Cookies.get("token") : null,
  otpType: "" as OtpType,
  isLoading: {
    signUp: false,
    login: false,
    twoFactorAuth: false,
    sendOtp: false,
    updateProfile: false,
    passwordChange: false,
    logout: false,
    addMoney: false,
    resetPasswordToken: false,
    resetPassword: false,
  },
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
    setIsLoading: (
      state,
      action: PayloadAction<{
        key: LoadingKeys;
        value?: boolean;
      }>
    ) => {
      state.isLoading[action.payload.key] = action.payload.value!;
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

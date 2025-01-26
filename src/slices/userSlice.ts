import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
  signUpData: null,
  loginData: null,
  twoFactorAuthData: false,
  user: Cookies.get("user") ? JSON.parse(Cookies.get("user") as string) : null,
  token: Cookies.get("token")
    ? JSON.parse(Cookies.get("token") as string)
    : null,
  loading: false,
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
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setSignUpData,
  setLoginData,
  setTwoFactorAuthData,
  setUser,
  setToken,
  setLoading,
} = userSlice.actions;

export default userSlice.reducer;

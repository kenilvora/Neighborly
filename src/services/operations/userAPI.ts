import toast from "react-hot-toast";
import { NavigateFunction } from "react-router-dom";
import { Dispatch } from "redux";
import { setIsLoading, setToken, setUser } from "../../slices/userSlice";
import { apiConnector } from "../apiConnector";
import { userEndpoints } from "../apis";
import Cookies from "js-cookie";
import { LoginInput, SignUpInput } from "@kenil_vora/neighborly";

export function signUp(data: SignUpInput, navigate: NavigateFunction | null) {
  return async (dispatch: Dispatch): Promise<void> => {
    const toastId = toast.loading("Signing up...");
    try {
      dispatch(setIsLoading(true));

      const res = await apiConnector("POST", userEndpoints.SIGNUP, data);

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      toast.success("Signed Up Successfully.");
      if (navigate) {
        navigate("/login");
      }
    } catch (error) {
      toast.error((error as any).response.data.message);
      navigate && navigate("/signup");
    } finally {
      dispatch(setIsLoading(false));
      toast.dismiss(toastId);
    }
  };
}

export function login(data: LoginInput, navigate: NavigateFunction | null) {
  return async (dispatch: Dispatch): Promise<void> => {
    const toastId = toast.loading("Logging in...");
    try {
      dispatch(setIsLoading(true));
      const res = await apiConnector("POST", userEndpoints.LOGIN, data);

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      dispatch(setToken(res.data.token));
      toast.success("Logged In Successfully.");
      navigate && navigate("/dashboard/profile");
    } catch (error) {
      toast.error((error as any).response.data.message);
    } finally {
      dispatch(setIsLoading(false));
      toast.dismiss(toastId);
    }
  };
}

export function sendOtp(
  email: string,
  navigate: NavigateFunction | null,
  type: string
) {
  return async (dispatch: Dispatch): Promise<void> => {
    const toastId = toast.loading("Sending OTP...");
    dispatch(setIsLoading(true));
    try {
      console.log("Sending OTP");
      const res = await apiConnector("POST", userEndpoints.SEND_OTP, {
        email,
        type,
      });

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      toast.success("OTP sent successfully.");
      if (navigate) {
        navigate("/otp-verify");
      }
    } catch (error) {
      toast.error((error as any).response.data.message);
    } finally {
      dispatch(setIsLoading(false));
      toast.dismiss(toastId);
    }
  };
}

export function getMe() {
  return async (dispatch: Dispatch): Promise<boolean> => {
    try {
      dispatch(setIsLoading(true));
      const res = await apiConnector("GET", userEndpoints.GET_ME);

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      dispatch(setUser(res.data.user));
      Cookies.set("user", JSON.stringify(res.data.user));
      return true;
    } catch (error) {
      return false;
    } finally {
      dispatch(setIsLoading(false));
    }
  };
}

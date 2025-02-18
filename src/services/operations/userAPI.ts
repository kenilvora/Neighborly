import toast from "react-hot-toast";
import { NavigateFunction } from "react-router-dom";
import { Dispatch } from "redux";
import { setIsLoading, setToken, setUser } from "../../slices/userSlice";
import { apiConnector } from "../apiConnector";
import { userEndpoints } from "../apis";
import Cookies from "js-cookie";
import {
  ChangePasswordInput,
  IStatisticalData,
  LoginInput,
  SignUpInput,
  UpdateUserDetailsInput,
} from "@kenil_vora/neighborly";

export interface DashboardData {
  borrowedItemsCount: number;
  lentItemsCount: number;
  totalProfit: number;
  pendingReturns: number;
  recentActivities: RecentActivity[];
}

export interface RecentActivity {
  _id: string;
  itemID: {
    name: string;
    description: string;
    price: number;
  };
  type: string;
  status: string;
  createdAt: Date;
}

export function signUp(data: SignUpInput, navigate: NavigateFunction | null) {
  return async (dispatch: Dispatch): Promise<void> => {
    const toastId = toast.loading("Signing up...");
    try {
      dispatch(
        setIsLoading({
          key: "signUp",
          value: true,
        })
      );

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
      dispatch(
        setIsLoading({
          key: "signUp",
          value: false,
        })
      );
      toast.dismiss(toastId);
    }
  };
}

export function login(data: LoginInput, navigate: NavigateFunction | null) {
  return async (dispatch: Dispatch): Promise<void> => {
    const toastId = toast.loading("Logging in...");
    try {
      dispatch(
        setIsLoading({
          key: "login",
          value: true,
        })
      );
      const res = await apiConnector("POST", userEndpoints.LOGIN, data);

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      dispatch(setToken(res.data.token));
      Cookies.set("token", res.data.token, {
        secure: true,
        sameSite: "lax",
        expires: 365,
      });
      toast.success("Logged In Successfully.");
      if (navigate) {
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error((error as any).response.data.message);
    } finally {
      dispatch(
        setIsLoading({
          key: "login",
          value: false,
        })
      );
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
    dispatch(
      setIsLoading({
        key: "sendOtp",
        value: true,
      })
    );
    try {
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
      dispatch(
        setIsLoading({
          key: "sendOtp",
          value: false,
        })
      );
      toast.dismiss(toastId);
    }
  };
}

export function getMe() {
  return async (dispatch: Dispatch): Promise<boolean> => {
    try {
      const res = await apiConnector("GET", userEndpoints.GET_ME);

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      dispatch(setUser(res.data.user));
      Cookies.set("user", JSON.stringify(res.data.user), {
        secure: true,
        sameSite: "lax",
        expires: 365,
      });
      return true;
    } catch (error) {
      return false;
    }
  };
}

export function logOut(navigate: NavigateFunction | null) {
  return async (dispatch: Dispatch): Promise<void> => {
    try {
      dispatch(
        setIsLoading({
          key: "logout",
          value: true,
        })
      );
      const res = await apiConnector("POST", userEndpoints.LOGOUT);

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      dispatch(setToken(null));
      dispatch(setUser(null));
      Cookies.remove("user", {
        secure: true,
        sameSite: "lax",
      });
      Cookies.remove("token", {
        secure: true,
        sameSite: "lax",
      });
      localStorage.clear();
      if (navigate) {
        toast.success("Logged Out Successfully");
        navigate("/login");
      }
    } catch (error) {
      toast.error((error as any).response.data.message);
    } finally {
      dispatch(
        setIsLoading({
          key: "logout",
          value: false,
        })
      );
    }
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  let result: DashboardData = {} as DashboardData;
  try {
    const res = await apiConnector("GET", userEndpoints.GET_DASHBOARD_DATA);

    if (!res.data.success) {
      throw new Error(res.data.message);
    }

    result = res.data.data;
  } catch (error) {
    toast.error((error as any).response.data.message);
  }
  return result;
}

export function updateProfile(data: UpdateUserDetailsInput) {
  return async (dispatch: Dispatch): Promise<void> => {
    const toastId = toast.loading("Updating Profile...");
    try {
      dispatch(
        setIsLoading({
          key: "updateProfile",
          value: true,
        })
      );
      const res = await apiConnector("PUT", userEndpoints.UPDATE_PROFILE, data);

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      dispatch(setUser(res.data.user));
      Cookies.set("user", JSON.stringify(res.data.user), {
        secure: true,
        sameSite: "lax",
        expires: 365,
      });
      toast.success("Profile Updated Successfully.");
    } catch (error) {
      toast.error((error as any).response.data.message);
    } finally {
      dispatch(
        setIsLoading({
          key: "updateProfile",
          value: false,
        })
      );
      toast.dismiss(toastId);
    }
  };
}

export function changePassword(data: ChangePasswordInput) {
  return async (dispatch: Dispatch): Promise<void> => {
    const toastId = toast.loading("Changing Password...");
    try {
      dispatch(
        setIsLoading({
          key: "passwordChange",
          value: true,
        })
      );
      const res = await apiConnector(
        "PUT",
        userEndpoints.CHANGE_PASSWORD,
        data
      );

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      toast.success("Password Changed Successfully");
    } catch (error) {
      toast.error((error as any).response.data.message);
    } finally {
      dispatch(
        setIsLoading({
          key: "passwordChange",
          value: false,
        })
      );
      toast.dismiss(toastId);
    }
  };
}

export function changeTwoFactorAuth(
  data: {
    otp: number;
    twoFactorAuth: boolean;
  },
  navigate: NavigateFunction | null
) {
  return async (dispatch: Dispatch): Promise<void> => {
    const toastId = toast.loading("Changing Two Factor Authentication...");
    try {
      dispatch(
        setIsLoading({
          key: "twoFactorAuth",
          value: true,
        })
      );
      const res = await apiConnector(
        "PUT",
        userEndpoints.CHANGE_TWO_FACTOR_AUTH,
        data
      );

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      dispatch(setUser(res.data.user));
      Cookies.set("user", JSON.stringify(res.data.user), {
        secure: true,
        sameSite: "lax",
        expires: 365,
      });
      toast.success(res.data.message);
      if (navigate) {
        navigate("/dashboard/profile");
      }
    } catch (error) {
      toast.error((error as any).response.data.message);
    } finally {
      dispatch(
        setIsLoading({
          key: "twoFactorAuth",
          value: false,
        })
      );
      toast.dismiss(toastId);
    }
  };
}

export async function getTwoFactorAuth(
  email: string,
  password: string
): Promise<boolean | null> {
  const toastId = toast.loading("Checking 2FA Status...");
  try {
    const res = await apiConnector("POST", userEndpoints.GET_TWO_FACTOR_AUTH, {
      email,
      password,
    });

    if (!res.data.success) {
      throw new Error(res.data.message);
    }

    return res.data.twoFactorAuth;
  } catch (error) {
    toast.error((error as any).response.data.message);
    return null;
  } finally {
    toast.dismiss(toastId);
  }
}

export async function getStatisticalData(): Promise<IStatisticalData[]> {
  let result: IStatisticalData[] = [] as IStatisticalData[];
  try {
    const res = await apiConnector("GET", userEndpoints.GET_STATISTICAL_DATA);

    if (!res.data.success) {
      throw new Error(res.data.message);
    }

    result = res.data.data;
  } catch (error) {
    toast.error((error as any).response.data.message);
  } finally {
    return result;
  }
}

export function resetPasswordToken(email: string) {
  return async (dispatch: Dispatch): Promise<void> => {
    const toastId = toast.loading("Sending Reset Password Token...");
    dispatch(
      setIsLoading({
        key: "resetPasswordToken",
        value: true,
      })
    );
    try {
      const res = await apiConnector(
        "POST",
        userEndpoints.RESET_PASSWORD_TOKEN,
        {
          email,
        }
      );

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      toast.success(res.data.message);
    } catch (error) {
      toast.error((error as any).response.data.message);
    } finally {
      dispatch(
        setIsLoading({
          key: "resetPasswordToken",
          value: false,
        })
      );
      toast.dismiss(toastId);
    }
  };
}

export function resetPassword(
  password: string,
  confirmPassword: string,
  token: string,
  navigate: NavigateFunction | null
) {
  return async (dispatch: Dispatch): Promise<void> => {
    const toastId = toast.loading("Resetting Password...");
    dispatch(
      setIsLoading({
        key: "resetPassword",
        value: true,
      })
    );
    try {
      const res = await apiConnector(
        "PUT",
        `${userEndpoints.RESET_PASSWORD}/${token}`,
        {
          password,
          confirmPassword,
        }
      );

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      toast.success("Password Reset Successfully.");
      if (navigate) {
        navigate("/login");
      }
    } catch (error) {
      toast.error((error as any).response.data.message);
    } finally {
      dispatch(
        setIsLoading({
          key: "resetPassword",
          value: false,
        })
      );
      toast.dismiss(toastId);
    }
  };
}

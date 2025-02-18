import { ReactNode, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getMe } from "../../services/operations/userAPI";
import Cookies from "js-cookie";
import { setToken, setUser } from "../../slices/userSlice";
import { Navigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "./Loader";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const token = Cookies.get("token");

  if (token) {
    dispatch(setToken(token));
  } else {
    dispatch(setToken(null));
  }

  const [isAuthenticated, setIsAuthenticated] = useState(
    null as boolean | null
  );

  useEffect(() => {
    const validate = async () => {
      try {
        if (token) {
          const isValid = (await dispatch(getMe() as any)) as boolean;
          setIsAuthenticated(isValid);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        toast.error("Failed to validate user. Please try again.");
      }
    };

    validate();
  }, [token, location.pathname]);

  useEffect(() => {
    if (isAuthenticated === false) {
      Cookies.remove("token", {
        secure: true,
        sameSite: "lax",
      });
      Cookies.remove("user", {
        secure: true,
        sameSite: "lax",
      });
      dispatch(setToken(null));
      dispatch(setUser(null));
    }
  }, [isAuthenticated]);

  if (isAuthenticated === null) return <Loader />;

  return isAuthenticated === true ? children : <Navigate to={"/login"} />;
};

export default PrivateRoute;

import { ReactNode, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../reducer/store";
import { getMe } from "../../services/operations/userAPI";
import Cookies from "js-cookie";
import { setIsLoading, setToken, setUser } from "../../slices/userSlice";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "./Loader";

interface OpenRouteProps {
  children: ReactNode;
}

const OpenRoute = ({ children }: OpenRouteProps) => {
  const dispatch = useDispatch();

  const { token } = useSelector((state: RootState) => state.user);

  const [isAuthenticated, setIsAuthenticated] = useState(
    null as boolean | null
  );

  useEffect(() => {
    const validate = async () => {
      try {
        dispatch(setIsLoading(true));
        if (token) {
          const isValid = (await dispatch(getMe() as any)) as boolean;
          setIsAuthenticated(isValid);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        toast.error("Failed to validate user. Please try again.");
      } finally {
        dispatch(setIsLoading(false));
      }
    };

    validate();
  }, [token, dispatch]);

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
  }, [isAuthenticated, dispatch]);

  if (isAuthenticated === null) return <Loader />;

  return isAuthenticated ? <Navigate to={"/dashboard"} /> : children;
};

export default OpenRoute;

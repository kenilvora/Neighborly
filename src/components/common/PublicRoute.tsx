import { ReactNode, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { setToken, setUser } from "../../slices/userSlice";
import { useLocation } from "react-router-dom";
import { getMe } from "../../services/operations/userAPI";
import Loader from "./Loader";

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const token = Cookies.get("token");
  const user = Cookies.get("user");

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const validate = async () => {
      try {
        if (token && user) {
          const isValid = (await dispatch(getMe() as any)) as boolean;
          setIsAuthenticated(isValid);
        } else {
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
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
        console.log(error);
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
    } else if (isAuthenticated === true) {
      dispatch(setToken(token));
      dispatch(setUser(JSON.parse(user!)));
    }
  }, [isAuthenticated]);

  if (isAuthenticated === null) {
    return <Loader />;
  }

  return children;
};

export default PublicRoute;

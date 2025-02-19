import { ReactNode, useEffect } from "react";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { setToken, setUser } from "../../slices/userSlice";
import { useLocation } from "react-router-dom";

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const token = Cookies.get("token");
  const user = Cookies.get("user");

  useEffect(() => {
    if (token && user) {
      dispatch(setToken(token));
      dispatch(setUser(JSON.parse(user)));
    } else {
      dispatch(setToken(null));
      dispatch(setUser(null));
      Cookies.remove("user", {
        secure: true,
        sameSite: "lax",
      });
    }
  }, [token, location.pathname]);

  return children;
};

export default PublicRoute;

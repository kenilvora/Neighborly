import { NavLink, useLocation, useNavigate } from "react-router-dom";
import navImage from "../../assets/navbarImage.jpeg";
import { IoIosSearch } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../reducer/store";
import { useEffect, useRef, useState } from "react";
import useOnClickOutside from "../../hooks/useOnClickOutside";
import { MdOutlineArrowDropDown, MdOutlineArrowDropUp } from "react-icons/md";
import { setSearchQuery } from "../../slices/itemSlice";
import { IoLogOutOutline, IoNotifications } from "react-icons/io5";
import { LuLayoutDashboard } from "react-icons/lu";
import { logOut } from "../../services/operations/userAPI";

const Navbar = () => {
  const { token, user } = useSelector((state: RootState) => state.user);
  const { searchQuery } = useSelector((state: RootState) => state.item);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const location = useLocation();

  const ref = useRef<HTMLDivElement>(null);

  const searchRef = useRef<HTMLDivElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);

  useOnClickOutside(ref, () => setIsMenuOpen(false));
  useOnClickOutside(searchRef, () => setIsSearchBarOpen(false));

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("disable-pointer-events");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("disable-pointer-events");
    }

    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("disable-pointer-events");
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [location, location.pathname]);

  return (
    <div className="w-full border-b-1 px-2 border-neutral-300 flex justify-center items-center fixed bg-white z-50 shadow-lg">
      <div className="w-[97%] max-w-[1480px] flex justify-between py-4 items-center">
        <div
          className={`w-[160px] max-[1000px]:w-[130px] max-[420px]:w-[115px]
              ${isSearchBarOpen ? "hidden" : "flex"}
          `}
        >
          <NavLink to={"/"}>
            <img src={navImage} alt="Logo Image" />
          </NavLink>
        </div>

        <div className="max-w-lg max-[1000px]:max-w-md max-[855px]:max-w-xs max-[720px]:max-w-3xs flex grow relative font-serif items-center max-[630px]:hidden">
          <IoIosSearch className="absolute text-3xl top-1/2 -translate-y-1/2 left-2 text-neutral-500" />
          <input
            type="search"
            id="search"
            placeholder="Search for Items..."
            className="py-2 text-neutral-800 border border-neutral-300 rounded-lg px-4 pl-10 
                    outline-blue-500 w-full font-medium"
            value={searchQuery}
            onChange={(e) => {
              if (window.location.pathname !== "/") {
                navigate("/");
              }
              dispatch(setSearchQuery(e.target.value));
            }}
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <div
            className="input-wrapper hidden max-[630px]:flex"
            onFocus={() => setIsSearchBarOpen(true)}
            onBlur={() => setIsSearchBarOpen(false)}
            ref={searchRef}
          >
            <button className="icon">
              <IoIosSearch className="text-3xl" />
            </button>
            <input
              placeholder="Search.."
              className="input"
              name="text"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                if (window.location.pathname !== "/") {
                  navigate("/");
                }
                dispatch(setSearchQuery(e.target.value));
              }}
            />
          </div>

          {(!token || !user) && (
            <div
              className={`gap-4 max-[420px]:gap-2 items-center
                ${isSearchBarOpen ? "hidden" : "flex"}
            `}
            >
              <NavLink
                to={"/signup"}
                className="text-neutral-800 font-semibold border border-neutral-300 px-5 max-[855px]:px-3 max-[855px]:text-sm py-2 max-[855px]:py-2.5 rounded-md max-[420px]:px-1.5 line-clamp-1
                hover:bg-gray-100"
              >
                Sign Up
              </NavLink>
              <NavLink
                to={"/login"}
                className="text-neutral-800 font-semibold border border-neutral-300 px-5 py-2 rounded-md max-[855px]:px-3 max-[855px]:text-sm max-[855px]:py-2.5 max-[420px]:px-1.5
                hover:bg-gray-100"
              >
                Login
              </NavLink>
            </div>
          )}

          {token && user && (
            <div
              className={`items-center relative
                ${isSearchBarOpen ? "hidden" : "flex"}
            `}
              ref={ref}
            >
              <button
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                  event.preventDefault();
                  event.stopPropagation();

                  setIsMenuOpen((prev) => !prev);
                }}
                className="hover:cursor-pointer flex items-center"
              >
                <img
                  src={user?.profileImage}
                  alt="Profile Image"
                  width={40}
                  className="rounded-full"
                />
                {isMenuOpen ? (
                  <MdOutlineArrowDropUp className="text-2xl text-neutral-700" />
                ) : (
                  <MdOutlineArrowDropDown className="text-2xl text-neutral-700" />
                )}
              </button>

              {isMenuOpen && (
                <div
                  className="absolute top-12 right-0 bg-white rounded-lg shadow-lg px-2 py-2 w-40 border-1 border-neutral-300 z-50 enable-pointer-events"
                  style={{ animation: "fadeIn 0.6s ease" }}
                >
                  <NavLink
                    to={"/dashboard"}
                    className="text-neutral-800 font-medium px-2 rounded-md py-2 hover:bg-neutral-200 flex gap-2 items-center w-full"
                  >
                    <LuLayoutDashboard className="text-xl" />
                    Dashboard
                  </NavLink>
                  <NavLink
                    to={"/notifications"}
                    className="text-neutral-800 font-medium px-2 rounded-md py-2 hover:bg-neutral-200 flex gap-2 items-center w-full"
                  >
                    <IoNotifications className="text-xl" />
                    Notifications
                  </NavLink>
                  <button
                    className="text-neutral-800 font-medium cursor-pointer px-2 rounded-md py-2 hover:bg-neutral-200 flex gap-2 items-center w-full"
                    onClick={() => {
                      dispatch(logOut(navigate) as any);
                    }}
                  >
                    <IoLogOutOutline className="text-xl" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* This is for changing the theme of the website */}
          {/* <label className="switch">
          <input type="checkbox" />
          <span className="slider"></span>
        </label> */}
        </div>
      </div>
    </div>
  );
};

export default Navbar;

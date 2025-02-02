import { NavLink } from "react-router-dom";
import navImage from "../../assets/navbarImage.jpeg";
import { IoIosSearch } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../reducer/store";
import { useEffect, useRef, useState } from "react";
import useOnClickOutside from "../../hooks/useOnClickOutside";
import { MdOutlineArrowDropDown, MdOutlineArrowDropUp } from "react-icons/md";
import { setSearchQuery } from "../../slices/itemSlice";
import { CgProfile } from "react-icons/cg";
import { IoLogOutOutline, IoNotifications } from "react-icons/io5";

const Navbar = () => {
  const { token, user } = useSelector((state: RootState) => state.user);
  const { searchQuery } = useSelector((state: RootState) => state.item);

  const dispatch = useDispatch();

  const ref = useRef<HTMLDivElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useOnClickOutside(ref, () => setIsMenuOpen(false));

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

  return (
    <div className="w-full border-b-1 px-2 border-neutral-300 flex justify-center items-center fixed bg-white z-50 shadow-lg">
      <div className="w-[98%] max-w-[1480px] flex justify-between py-4 items-center">
        <div className="flex w-[160px] max-[1000px]:w-[130px] max-[420px]:w-[115px]">
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
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          />
        </div>

        <div className="flex items-center gap-4 justify-end max-[420px]:gap-2">
          <div
            className="max-[630px]:flex hidden bg-neutral-100 p-1 rounded-full justify-center items-center border border-neutral-200 shadow-lg"
            title="Search"
          >
            <IoIosSearch className="text-3xl text-neutral-500 max-[420px]:text-xl" />
          </div>
          {(!token || !user) && (
            <div className="flex gap-4 max-[420px]:gap-2 items-center">
              <NavLink
                to={"/signup"}
                className="text-neutral-800 font-semibold border border-neutral-300 px-5 max-[855px]:px-3 max-[855px]:text-sm py-2 max-[855px]:py-2.5 rounded-md max-[420px]:px-1.5
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
            <div className="flex items-center relative" ref={ref}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
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
                    to={"/dashboard/profile"}
                    className="block text-neutral-800 font-medium px-2 rounded-md py-2 hover:bg-neutral-200 flex gap-2 items-center"
                  >
                    <CgProfile className="text-xl" />
                    Profile
                  </NavLink>
                  <NavLink
                    to={"/notifications"}
                    className="block text-neutral-800 font-medium px-2 rounded-md py-2 hover:bg-neutral-200 flex gap-2 items-center"
                  >
                    <IoNotifications className="text-xl" />
                    Notifications
                  </NavLink>
                  <NavLink
                    to={"/logout"}
                    className="block text-neutral-800 font-medium px-2 rounded-md py-2 hover:bg-neutral-200 flex gap-2 items-center"
                  >
                    <IoLogOutOutline className="text-xl" />
                    Logout
                  </NavLink>
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

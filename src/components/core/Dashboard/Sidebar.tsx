import { LuChevronLeft, LuChevronRight, LuLogOut } from "react-icons/lu";
import { SidebarLink } from "../../../data/SidebarLink";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logOut } from "../../../services/operations/userAPI";

type SidebarProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
};

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const location = useLocation();

  const currentPage = SidebarLink.find(
    (link) => link.path === location.pathname
  );

  return (
    <div
      className={`bg-white px-3 py-3 border-r border-neutral-200 flex flex-col gap-5 overflow-y-auto overflow-x-hidden
                ${
                  isSidebarOpen
                    ? "min-w-[260px]"
                    : "min-w-[60px] max-[800px]:min-w-0 max-[800px]:max-w-0 max-[800px]:px-0"
                } transition-all duration-[800ms] ease-in-out max-[800px]:absolute h-full z-[100]
        `}
    >
      <div
        className={`text-xl font-bold flex items-center pl-0.5 w-full relative transition-all duration-[800ms] ease-in-out
        ${!isSidebarOpen ? "max-[800px]:w-0" : ""}
        `}
      >
        <div
          className={` transition-all duration-[800ms] ease-in-out absolute
            ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}
          `}
          id="sidebar-title"
        >
          Menu
        </div>
        <div
          className={`text-black hover:cursor-pointer hover:bg-neutral-200 rounded-sm p-1.5 relative transition-all duration-[800ms] 
            ease-in-out ml-auto 
              ${!isSidebarOpen ? "max-[800px]:p-0" : ""}
            `}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <LuChevronLeft
              className={`w-6 h-6 transition-all duration-[800ms] ease-in-out
                ${!isSidebarOpen ? "max-[800px]:w-0" : ""}
              `}
            />
          ) : (
            <LuChevronRight
              className={`w-6 h-6 transition-all duration-[800ms] ease-in-out
              ${!isSidebarOpen ? "max-[800px]:w-0" : ""}
            `}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col justify-center gap-1">
        {SidebarLink.map((link) => (
          <NavLink
            to={link.path}
            key={link.id}
            title={link.name}
            className={`flex items-center relative gap-4 text-neutral-600 hover:text-neutral-900 hover:cursor-pointer hover:bg-neutral-200 
                      px-2 py-2 rounded-lg min-w-[40px] transition-all duration-[800ms] ease-in-out
                      ${
                        !isSidebarOpen
                          ? "max-[800px]:min-w-0 max-[800px]:max-w-0 max-[800px]:px-0"
                          : ""
                      }
                      ${currentPage?.id === link.id ? "bg-neutral-200" : ""}
                      `}
          >
            <link.icon
              className={`w-6 h-6 transition-all duration-[800ms] ease-in-out
                ${!isSidebarOpen ? "max-[800px]:w-0" : ""}
              `}
            />
            <span
              className={`absolute left-10 whitespace-nowrap overflow-hidden transition-all duration-[800ms] ease-in-out
                          ${
                            isSidebarOpen
                              ? "opacity-100 visible"
                              : "opacity-0 invisible"
                          }
                    `}
            >
              {link.name}
            </span>
          </NavLink>
        ))}
        <button
          title={"Logout"}
          className={`flex items-center relative gap-4 text-neutral-600 hover:text-neutral-900 hover:cursor-pointer hover:bg-neutral-200 
                    px-2 py-2 rounded-lg transition-all duration-[800ms] ease-in-out min-w-[40px]
                      ${!isSidebarOpen ? "max-[800px]:px-0 max-[800px]:min-w-0 max-[800px]:max-w-0" : ""}
                    `}
          onClick={() => {
            dispatch(logOut(navigate) as any);
          }}
        >
          <LuLogOut
            className={`w-6 h-6 transition-all duration-[800ms] ease-in-out
                ${!isSidebarOpen ? "max-[800px]:w-0" : ""}
              `}
          />
          <span
            className={`absolute left-10 whitespace-nowrap overflow-hidden transition-all duration-[800ms] ease-in-out
                          ${
                            isSidebarOpen
                              ? "opacity-100 visible"
                              : "opacity-0 invisible"
                          }
                    `}
          >
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

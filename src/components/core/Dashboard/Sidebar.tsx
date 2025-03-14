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
      className={`bg-white px-3 max-[600px]:px-2 py-3 border-r border-neutral-200 flex flex-col gap-5 overflow-y-auto overflow-x-hidden
                ${
                  isSidebarOpen ? "min-w-[260px]" : "min-w-[60px]"
                } transition-all duration-[800ms] ease-in-out
        `}
    >
      <div className="text-xl font-bold flex items-center pl-0.5 w-full relative">
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
            ease-in-out ml-auto`}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <LuChevronLeft size={24} />
          ) : (
            <LuChevronRight size={24} />
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
                      px-2 py-2 rounded-lg min-w-[40px]
                        ${currentPage?.id === link.id ? "bg-neutral-200" : ""}
                      `}
          >
            <link.icon size={24} />
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
          className="flex items-center relative gap-4 text-neutral-600 hover:text-neutral-900 hover:cursor-pointer hover:bg-neutral-200 
                    px-2 py-2 rounded-lg"
          onClick={() => {
            dispatch(logOut(navigate) as any);
          }}
        >
          <LuLogOut size={24} />
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

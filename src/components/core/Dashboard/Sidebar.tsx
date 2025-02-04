import { useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div
      className={`min-w-[260px] bg-white px-4 py-2 border-r border-neutral-200 flex flex-col
                ${
                  isSidebarOpen ? "translate-x-0" : "-translate-x-[80%]"
                } transition-all duration-300 ease-in-out
        `}
    >
      <div className="text-xl font-bold flex justify-between items-center">
        <span
          className={`
            ${isSidebarOpen ? "block" : "hidden"}
            `}
        >
          Menu
        </span>
        <div
          className={`text-black hover:cursor-pointer hover:bg-neutral-200 rounded-sm text-xl p-1.5 fixed
                ${
                    isSidebarOpen ? "right-4" : "right-2.5 top-2"
                }
            `}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <LuChevronLeft /> : <LuChevronRight />}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

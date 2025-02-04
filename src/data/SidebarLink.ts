import {
  LuBookOpen,
  LuChartNoAxesCombined,
  LuCirclePlus,
  LuCreditCard,
  LuLayoutDashboard,
  LuLogOut,
  LuShieldAlert,
  LuStar,
  LuUserCog,
} from "react-icons/lu";

export const SidebarLink = [
  {
    id: 1,
    name: "Dashboard",
    path: "/dashboard",
    icon: LuLayoutDashboard,
  },
  {
    id: 2,
    name: "Profile & Security",
    path: "/profile",
    icon: LuUserCog,
  },
  {
    id: 3,
    name: "Ratings & Reviews",
    path: "/ratings",
    icon: LuStar,
  },
  {
    id: 4,
    name: "Borrowed Items",
    path: "/borrowedItems",
    icon: LuBookOpen,
  },
  {
    id: 5,
    name: "Lended Items Stats",
    path: "/lendedItemsStats",
    icon: LuChartNoAxesCombined,
  },
  {
    id: 6,
    name: "Transactions",
    path: "/transactions",
    icon: LuCreditCard,
  },
  {
    id: 7,
    name: "Disputes & Resolutions",
    path: "/disputes",
    icon: LuShieldAlert,
  },
  {
    id: 8,
    name: "Add New Item",
    path: "/addItem",
    icon: LuCirclePlus,
  },
  {
    id: 9,
    name: "Logout",
    path: "/logout",
    icon: LuLogOut,
  },
];

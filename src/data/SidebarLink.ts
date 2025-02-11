import { FaBoxOpen } from "react-icons/fa6";
import {
  LuBookOpen,
  LuChartNoAxesCombined,
  LuCirclePlus,
  LuCreditCard,
  LuLayoutDashboard,
  LuShieldAlert,
  LuStar,
  LuUserCog,
  LuWallet,
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
    path: "/dashboard/profile",
    icon: LuUserCog,
  },
  {
    id: 3,
    name: "Ratings & Reviews",
    path: "/dashboard/ratings",
    icon: LuStar,
  },
  {
    id: 4,
    name: "Borrowed Items",
    path: "/dashboard/borrowedItems",
    icon: LuBookOpen,
  },
  {
    id: 5,
    name: "Lended Items Stats",
    path: "/dashboard/lendedItemsStats",
    icon: LuChartNoAxesCombined,
  },
  {
    id: 6,
    name: "Transactions",
    path: "/dashboard/transactions",
    icon: LuCreditCard,
  },
  {
    id: 7,
    name: "Disputes & Resolutions",
    path: "/dashboard/disputes",
    icon: LuShieldAlert,
  },
  {
    id: 8,
    name: "Add New Item",
    path: "/dashboard/addItem",
    icon: LuCirclePlus,
  },
  {
    id: 9,
    name: "My Items",
    path: "/dashboard/myItems",
    icon: FaBoxOpen,
  },
  {
    id: 10,
    name: "Wallet",
    path: "/dashboard/wallet",
    icon: LuWallet
  }
];

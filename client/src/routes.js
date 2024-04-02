

import React from "react";

// Admin Imports





// Auth Imports


// Icon Imports
import {
  MdHome,
  MdOutlineShoppingCart,
  MdBarChart,
  MdPerson,
  MdLock,
} from "react-icons/md";
import { IoSwapVertical } from "react-icons/io5";
import { BiCategory } from "react-icons/bi";
import Dashboard from "views/admin/default";


import Profile from "views/admin/profile";
import Login from "components/loging/Login";
import Products from "./views/admin/Products/Products";
import Categories from "views/admin/Categories";
import Transaction from "views/admin/Transactions";
import Reports from "views/admin/Reports";

const routes = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <Dashboard />,
  },
  {
    name: "Products",
    layout: "/admin",
    path: "products",
    icon: <MdOutlineShoppingCart className="h-6 w-6" />,
    component: <Products />,
    secondary: true,
  },
  {
    name: "Categories",
    layout: "/admin",
    icon: <BiCategory className="h-6 w-6" />,
    path: "Categories",
    component: <Categories />,
  },
  {
    name: "Transaction",
    layout: "/admin",
    icon: <IoSwapVertical className="h-6 w-6" />,
    path: "transaction",
    component: <Transaction />,
  },
  {
    name: "Reports",
    layout: "/admin",
    icon: <MdBarChart className="h-6 w-6" />,
    path: "reports",
    component: <Reports />,
  },
  {
    name: "Profile",
    layout: "/admin",
    icon: <MdPerson className="h-6 w-6" />,
    path: "profile",
    component: <Profile />,
  },
  {
    name: "Logout ",
    layout: "/auth",
    path: "login",
    icon: <MdLock className="h-6 w-6" />,
    component: <Login />,
  },
 
];
export default routes;


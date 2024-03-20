

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
import Dashboard from "views/admin/default";
import Expence from "views/admin/expence/Expence";
import Income from "views/admin/income";
import Profile from "views/admin/profile";
import Login from "components/loging/Login";

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
    path: "expense",
    icon: <MdOutlineShoppingCart className="h-6 w-6" />,
    component: <Expence />,
    secondary: true,
  },
  {
    name: "Categories",
    layout: "/admin",
    icon: <MdBarChart className="h-6 w-6" />,
    path: "income",
    component: <Income />,
  },
  
  {
    name: "Reports",
    layout: "/admin",
    icon: <MdBarChart className="h-6 w-6" />,
    path: "reports",
    component: <Income />,
  },
  {
    name: "Profile",
    layout: "/admin",
    icon: <MdBarChart className="h-6 w-6" />,
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


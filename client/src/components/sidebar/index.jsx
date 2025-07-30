import React from "react";
import { HiX } from "react-icons/hi";
import SidebarLinks from "./components/Links";
import logo from "../../assets/logo.png";
import avatar from "assets/user.png";
import routes from "routes.js";
import Cookies from 'js-cookie';
import {MdLock} from"react-icons/md";
const Sidebar = ({ open, onClose, user, setUser }) => {
  const handleLogout = () => {
    Cookies.remove('user');
    Cookies.remove('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <div className={`sm:none duration-175 linear fixed !z-50 flex min-h-full flex-col bg-white pb-10 shadow-2xl shadow-white/5 transition-all dark:!bg-navy-800 dark:text-white md:!z-50 lg:!z-50 xl:!z-0 ${open ? "translate-x-0" : "-translate-x-96"}`}>
      <span className="absolute top-4 right-4 block cursor-pointer xl:hidden" onClick={onClose}>
        <HiX />
      </span>

      <div className="mx-[30px] mt-[50px] flex items-center">
        <div className="h-1.5 font-bold text-navy-700 dark:text-white flex items-center justify-center gap-3">
          <img src={logo} alt="" width={30} />
          <p className="text-[#000] text-[22px]">Afgarad Shop</p>
        </div>
      </div>
      <div className="mt-[30px] mb-7 h-px bg-gray-300 dark:bg-white/30" />

      {/* <div className="flex flex-col items-center mb-5">
        <img className="h-16 w-16 rounded-full" src={user?.image || avatar} alt="User Avatar" />
        <p className="mt-3 text-lg font-semibold text-navy-700 dark:text-white">{user?.name}</p>
      </div> */}

      <ul className="mb-auto pt-1">
        <SidebarLinks routes={routes} user={user} />
        <div className="relative mb-3 flex hover:cursor-pointer" onClick={handleLogout}>
          <li className="my-[10px] flex cursor-pointer items-center px-8 justify-center gap-3">
            <span className="font-medium text-gray-600">
              <MdLock className="h-6 w-6" />
            </span>
            <p className="font-medium text-gray-600">LogOut</p>
          </li>
        </div>
      </ul>
    </div>
  );
};

export default Sidebar;

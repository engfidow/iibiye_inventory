/* eslint-disable */

import { HiX } from "react-icons/hi";
import Links from "./components/Links";
import logo from "../../assets/logo.png"
import { Link } from "react-router-dom";
import routes from "routes.js";
import { MdLock } from "react-icons/md";

const Sidebar = ({ open, onClose }) => {
  const handleLogout = () => {
    // Clear localStorage and perform any additional logout actions
    localStorage.removeItem('user.email');
    sessionStorage.removeItem('user.user');
    // Add more cleanup if needed

    // Redirect to the login page
    window.location.href = '/auth/login';
  };
  return (
    <div
      className={`sm:none duration-175 linear fixed !z-50 flex min-h-full flex-col bg-white pb-10 shadow-2xl shadow-white/5 transition-all dark:!bg-navy-800 dark:text-white md:!z-50 lg:!z-50 xl:!z-0 ${
        open ? "translate-x-0" : "-translate-x-96"
      }`}
    >
      <span
        className="absolute top-4 right-4 block cursor-pointer xl:hidden"
        onClick={onClose}
      >
        <HiX />
      </span>

      <div className={`mx-[30px] mt-[50px] flex items-center`}>
        <div className="h-1.5 font-bold  text-navy-700 dark:text-white flex items-center justify-center gap-3">
          <img src={logo} alt="" width={30}/>
          <p className="text-[#000] text-[22px]">Ratail</p> 
          <span className="font-medium text-[#000] text-[22px]">Flash</span>
        </div>
      </div>
      <div class="mt-[30px] mb-7 h-px bg-gray-300 dark:bg-white/30" />
      {/* Nav item */}

      <ul className="mb-auto pt-1">
        <Links routes={routes} />
        <Link  to="/auth/login" onClick={handleLogout}>
            <div className="relative mb-3 mt-44 flex hover:cursor-pointer">
              <li
                className="my-[10px] flex cursor-pointer items-center px-8 justify-center gap-3"
          
              >
                <span className="font-medium text-gray-600">
                  <MdLock className="h-6 w-6" />
                </span>
                <p className="font-medium text-gray-600">
                  LogOut
                </p>
              </li>
             
            </div>
          </Link>
      </ul>

      

      {/* Nav item end */}
    </div>
  );
};

export default Sidebar;

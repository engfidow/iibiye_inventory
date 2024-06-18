import React from "react";
import { Link, useLocation } from "react-router-dom";
import { IoClose } from "react-icons/io5";

export function SidebarLinks({ routes, user }) {
  let location = useLocation();

  const activeRoute = (routeName) => {
    return location.pathname.includes(routeName);
  };

  const createLinks = (routes) => {
    return routes.map((route, index) => {
      if (route.layout === (user.usertype === "admin" ? "/admin" : "/user")) {
        return (
          <Link key={index} to={route.layout + "/" + route.path}>
            <div className="relative mb-3 flex hover:cursor-pointer">
              <li className="my-[10px] flex cursor-pointer items-center px-8" key={index}>
                <span className={`${activeRoute(route.path) ? "font-bold text-[#F40000] dark:text-white" : "font-medium text-gray-600"}`}>
                  {route.icon ? route.icon : <IoClose />}
                </span>
                <p className={`leading-1 ml-4 flex ${activeRoute(route.path) ? "font-bold text-navy-700 dark:text-white" : "font-medium text-gray-600"}`}>
                  {route.name}
                </p>
              </li>
              {activeRoute(route.path) ? <div className="absolute right-0 top-px h-9 w-1 rounded-lg bg-[#F40000] dark:bg-brand-400" /> : null}
            </div>
          </Link>
        );
      }
      return null;
    });
  };

  return createLinks(routes);
}

export default SidebarLinks;

import React from "react";
import notfound from "../assets/notfound.jpg";
const NotFound = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center">
        <h1 className="h2 text-9xl">404</h1>
        <h2>Something's missing.</h2>
        <img src={notfound} alt="" className="w-[200px]" />
        <a href="/">
          <button className="btn btn-lg bg-[#3226AE] hover:bg-[#3C6EED] text-white rounded-[2.5rem]">
            Go Back Home
          </button>
        </a>
      </div>
    </div>
  );
};

export default NotFound;

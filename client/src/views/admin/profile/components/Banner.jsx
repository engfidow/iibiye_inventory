import React from "react";
import Card from "components/card";
import { FaUser, FaEnvelope, FaGenderless } from "react-icons/fa";

const Banner = ({ user, onEditProfile }) => {
  return (
    <Card extra={"items-center w-full h-full p-[16px] bg-cover rounded-xl shadow-lg"}>
      {/* Background and profile */}
      <div className="relative flex flex-col items-center w-full bg-cover rounded-t-xl" style={{ backgroundImage: `url(${user.banner || "path/to/default/banner.png"})` }}>
        <div className="absolute -bottom-10 flex h-[120px] w-[120px] items-center justify-center rounded-full border-[6px] border-white bg-pink-400 dark:!border-navy-700 shadow-md">
          <img className="h-full w-full rounded-full object-cover"  src={user.image ? `https://retailflash.up.railway.app/${user.image}` : 'https://st3.depositphotos.com/9998432/13335/v/450/depositphotos_133352156-stock-illustration-default-placeholder-profile-icon.jpg'}  alt="Profile" />
        </div>
      </div>

      {/* Name, user type and Edit Profile button */}
      <div className="mt-16 flex flex-col items-center text-center">
        <h4 className="text-2xl font-bold text-navy-700 dark:text-white">{user.name}</h4>
        <p className="text-sm font-semibold text-blue-500 capitalize">{user.usertype}</p>
        <button onClick={onEditProfile} className="bg-[#F40000] text-white px-6 py-2 rounded-full mt-4 shadow-lg hover:bg-blue-600 transition-all duration-300">
          Edit Profile
        </button>
      </div>

      {/* User Info */}
      <div className="w-full mt-8 px-6 py-4 bg-white rounded-b-xl shadow-inner">
        <div className="flex items-center gap-4 my-2">
          <FaUser className="text-navy-700" />
          <p className="text-base font-normal text-gray-600">{user.name}</p>
        </div>
        <div className="flex items-center gap-4 my-2">
          <FaEnvelope className="text-navy-700" />
          <p className="text-base font-normal text-gray-600">{user.email}</p>
        </div>
        <div className="flex items-center gap-4 my-2">
          <FaGenderless className="text-navy-700" />
          <p className="text-base font-normal text-gray-600 capitalize">{user.gender}</p>
        </div>
      </div>
    </Card>
  );
};

export default Banner;

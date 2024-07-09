import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Modal from "react-modal";

const UpdateProfile = ({ user, setUser, isOpen, onRequestClose }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
    gender: user?.gender || "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.image ? `https://iibiye.up.railway.app//${user.image}` : "path/to/default/avatar.png");

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      confirmPassword: "",
      gender: user?.gender || "",
    });
    setImagePreview(user?.image ? `https://iibiye.up.railway.app//${user.image}` : "path/to/default/avatar.png");
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    if (formData.password) {
      data.append("password", formData.password);
    }
    data.append("gender", formData.gender);
    if (image) {
      data.append("image", image);
    }

    try {
      const response = await axios.put(`https://iibiye.up.railway.app//api/users/${user._id}`, data, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });

      const updatedUser = response.data;
      setUser(updatedUser);
      Cookies.set('user', JSON.stringify(updatedUser), { expires: 1 });
      alert("Profile updated successfully");
      onRequestClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred during profile update");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="modal fixed inset-0 flex items-center justify-center z-40"
      overlayClassName="overlay fixed inset-0 bg-black bg-opacity-50"
    >
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl mb-4">Update Profile</h2>
        <div className="flex justify-center">
          <img className="h-20 w-20 rounded-full object-cover" src={imagePreview} alt="Preview" />
        </div>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Name"
          className="p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Email"
          className="p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="New Password"
          className="p-2 border rounded"
        />
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Confirm Password"
          className="p-2 border rounded"
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleInputChange}
          className="p-2 border rounded"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input
          type="file"
          name="image"
          onChange={handleImageChange}
          className="p-2 border rounded"
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
          Update Profile
        </button>
        <button type="button" onClick={onRequestClose} className="p-2 bg-gray-500 text-white rounded">
          Close
        </button>
      </form>
    </Modal>
  );
};

export default UpdateProfile;

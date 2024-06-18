import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const UpdateProfile = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    password: "",
    confirmPassword: "",
    gender: user.gender,
  });
  const [image, setImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
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
      const response = await axios.put(`http://localhost:5000/api/users/${user._id}`, data, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });

      const updatedUser = response.data;
      setUser(updatedUser);
      Cookies.set('user', JSON.stringify(updatedUser), { expires: 1 });
      alert("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred during profile update");
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
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
      <input
        type="text"
        name="gender"
        value={formData.gender}
        onChange={handleInputChange}
        placeholder="Gender"
        className="p-2 border rounded"
      />
      <input
        type="file"
        name="image"
        onChange={handleImageChange}
        className="p-2 border rounded"
      />
      <button type="submit" className="p-2 bg-blue-500 text-white rounded">
        Update Profile
      </button>
    </form>
  );
};

export default UpdateProfile;

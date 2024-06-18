import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import Cookies from 'js-cookie';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CircularProgress from '@mui/material/CircularProgress';
import Banner from './components/Banner';

// Modal accessibility setup
Modal.setAppElement('#root');

const ProfileOverview = () => {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state for shimmer effect
  const [validationMessages, setValidationMessages] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('path/to/default/avatar.png');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = Cookies.get('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUser(user);
          setFormData({
            name: user.name || '',
            email: user.email || '',
            password: '',
            confirmPassword: '',
            gender: user.gender || '',
          });
          setImagePreview(user.image ? `http://localhost:5000/${user.image}` : 'path/to/default/avatar.png');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const closeModal = () => {
    resetFormData();
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      setImagePreview(URL.createObjectURL(file));
      setImage(file);
    } else {
      setFormData(prevState => ({ ...prevState, [name]: value }));
    }
    setValidationMessages(prevMessages => ({ ...prevMessages, [name]: '' }));
  };

  const validateForm = () => {
    let messages = {};
    let isValid = true;

    if (!formData.name.trim()) {
      isValid = false;
      messages.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      isValid = false;
      messages.email = 'Email is required';
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      isValid = false;
      messages.confirmPassword = 'Passwords do not match';
    }
    if (!formData.gender) {
      isValid = false;
      messages.gender = 'Gender is required';
    }

    setValidationMessages(messages);
    return isValid;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    if (formData.password) {
      data.append('password', formData.password);
    }
    data.append('gender', formData.gender);
    if (image) {
      data.append('image', image);
    }

    try {
      setLoading(true);
      const response = await axios.put(`http://localhost:5000/api/users/${user._id}`, data, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });

      const updatedUser = response.data;
      setUser(updatedUser);
      Cookies.set('user', JSON.stringify(updatedUser), { expires: 1 });
      toast.success('Profile updated successfully');
      closeModal();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const resetFormData = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      confirmPassword: '',
      gender: user?.gender || '',
    });
    setValidationMessages({});
    setImagePreview(user?.image ? `http://localhost:5000/${user.image}` : 'path/to/default/avatar.png');
    setImage(null);
  };

  const handleEditProfile = () => {
    setIsModalOpen(true);
  };

  const customModalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '30rem',
      zIndex: 1000,
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: 999,
    },
  };

  return (
    <div className="flex w-full flex-col gap-36  ">
      <ToastContainer />
      <div className="w-full mt-3 flex h-fit flex-col ">
        {loading ? (
          <div className="flex justify-center">
            <CircularProgress />
          </div>
        ) : (
          <>
            {user && (
              <>
               <Banner user={user} onEditProfile={handleEditProfile} className="mt-[205]"/>

                <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={customModalStyles}>
                  <h2 style={{ color: '#333', marginBottom: '20px' }}>Update Profile</h2>
                  <div className="flex justify-center">
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mx-auto h-40 w-40 rounded-full object-cover mb-4" />
                  )}
                </div>
                 
                  <form onSubmit={handleFormSubmit} className="grid grid-cols-2 gap-3">
                    <input type="text" name="name" placeholder="Name" onChange={handleInputChange} value={formData.name} required className={`p-3 my-2 rounded-md border-solid ${validationMessages.name ? 'border-red-500' : 'border-blue-300'} border-[1px] w-full`} />
                    {validationMessages.name && <p className="text-red-500 text-xs mt-1">{validationMessages.name}</p>}
                    <input type="email" name="email" placeholder="Email" onChange={handleInputChange} value={formData.email} required className={`p-3 my-2 rounded-md border-solid ${validationMessages.email ? 'border-red-500' : 'border-blue-300'} border-[1px] w-full`} />
                    {validationMessages.email && <p className="text-red-500 text-xs mt-1">{validationMessages.email}</p>}
                    
                    {validationMessages.confirmPassword && <p className="text-red-500 text-xs mt-1">{validationMessages.confirmPassword}</p>}
                    <select name="gender" onChange={handleInputChange} value={formData.gender} required className={`p-3 my-2 rounded-md border-solid ${validationMessages.gender ? 'border-red-500' : 'border-blue-300'} border-[1px] w-full`}>
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    {validationMessages.gender && <p className="text-red-500 text-xs mt-1">{validationMessages.gender}</p>}
                    <input type="file" name="image" onChange={handleInputChange} className="p-3 my-2 rounded-md border-solid border-blue-300 border-[1px] w-full" />
                    <button type="submit" className="bg-green-600 p-3 border-none rounded-md cursor-pointer mt-3 text-white">Update Profile</button>
                    <button type="button" onClick={closeModal} className="bg-gray-700 p-3 border-none rounded-md cursor-pointer mt-3 text-white">Close</button>
                  </form>
                </Modal>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileOverview;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { MdPostAdd, MdDelete, MdEdit, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import MUIDataTable from 'mui-datatables';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CircularProgress from '@mui/material/CircularProgress';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

// Modal accessibility setup
Modal.setAppElement('#root');

function UserManagementTable() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false); // Loading state for form submission
  const [validationMessages, setValidationMessages] = useState({});
  const [modalFormData, setModalFormData] = useState({
    name: '',
    email: '',
    password: '',
    usertype: '',
    gender: '',
    status: '', // Initialize status
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [btnUpdate, setBtnUpdate] = useState(false);
  const [btnSave, setBtnSave] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // State for show/hide password

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://iibiye.up.railway.app//api/users/getall');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    resetFormData();
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      setImagePreview(URL.createObjectURL(file));
      setModalFormData(prevState => ({ ...prevState, image: file }));
    } else {
      setModalFormData(prevState => ({ ...prevState, [name]: value }));
    }
    setValidationMessages(prevMessages => ({ ...prevMessages, [name]: '' }));
  };

  const validateForm = () => {
    let messages = {};
    let isValid = true;

    if (!modalFormData.name.trim()) {
      isValid = false;
      messages.name = 'Name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(modalFormData.name)) {
      isValid = false;
      messages.name = 'Name can contain only letters and spaces';
    }

    if (!modalFormData.email.trim()) {
      isValid = false;
      messages.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(modalFormData.email)) {
      isValid = false;
      messages.email = 'Please enter a valid email address';
    }

    if (btnSave && !modalFormData.password.trim()) {
      isValid = false;
      messages.password = 'Password is required';
    } else if (modalFormData.password && modalFormData.password.length < 6) {
      isValid = false;
      messages.password = 'Password must be at least 6 characters long';
    }

    if (!modalFormData.usertype.trim()) {
      isValid = false;
      messages.usertype = 'User type is required';
    }

    if (!modalFormData.gender.trim()) {
      isValid = false;
      messages.gender = 'Gender is required';
    }

    if (!modalFormData.image) {
      isValid = false;
      messages.image = 'Image is required';
    }

    setValidationMessages(messages);
    return isValid;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formData = new FormData();
    formData.append('name', modalFormData.name);
    formData.append('email', modalFormData.email);
    formData.append('usertype', modalFormData.usertype);
    formData.append('gender', modalFormData.gender);
    formData.append('status', modalFormData.status);
    formData.append('image', modalFormData.image);

    if (modalFormData.password.trim()) {
      formData.append('password', modalFormData.password);
    }

    setFormLoading(true); // Set loading state for form submission

    try {
      if (btnSave) {
        await axios.post('https://iibiye.up.railway.app//api/users/signup', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('User added successfully');
      } else {
        const updateUrl = `https://iibiye.up.railway.app//api/users/${selectedUser._id}`;
        await axios.put(updateUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('User updated successfully');
      }
      fetchUsers();
      resetFormData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to submit user:', error);
      if (error.response && error.response.data && error.response.data.message === 'Email already exists') {
        toast.error('Email already exists. Please use a different email.');
      } else {
        toast.error('Failed to submit user');
      }
    } finally {
      setFormLoading(false); // Reset loading state after form submission
    }
  };

  const handleEdit = async (index) => {
    const selectedUser = users[index];
    setSelectedUser(selectedUser);

    try {
      const response = await axios.get(`https://iibiye.up.railway.app//api/users/${selectedUser._id}`);
      const userData = response.data;
      setModalFormData({
        name: userData.name,
        email: userData.email,
        password: '', // Leave password empty
        usertype: userData.usertype,
        gender: userData.gender,
        status: userData.status,
        image: userData.image,
      });
      setImagePreview(`https://iibiye.up.railway.app//${userData.image}`);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      toast.error('Failed to fetch user data');
    }

    setBtnUpdate(true);
    setBtnSave(false);
    setIsModalOpen(true);
  };

  const confirmDelete = (index) => {
    confirmAlert({
      title: 'Confirm to delete',
      message: 'Are you sure to delete this user?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => handleDelete(index)
        },
        {
          label: 'No',
        }
      ]
    });
  };

  const handleDelete = async (index) => {
    const selectedUser = users[index];
    try {
      const deleteUrl = `https://iibiye.up.railway.app//api/users/${selectedUser._id}`;
      await axios.delete(deleteUrl);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  const resetFormData = () => {
    setModalFormData({
      name: '',
      email: '',
      password: '',
      usertype: '',
      gender: '',
      status: '',
      image: null,
    });
    setValidationMessages({});
    setImagePreview(null);
    setBtnUpdate(false);
    setBtnSave(true);
    setShowPassword(false); // Reset show/hide password state
  };

  const handleAddNewUser = () => {
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

  const MuiCache = createCache({
    key: 'mui-datatables',
    prepend: true,
  });

  const columns = [
    {
      name: 'image',
      label: 'Image',
      options: {
        customBodyRender: (value) => {
          return <img src={value ? `https://iibiye.up.railway.app//${value}` : 'https://st3.depositphotos.com/9998432/13335/v/450/depositphotos_133352156-stock-illustration-default-placeholder-profile-icon.jpg'}  alt="User" style={{ height: '50px' }} />;
        },
      },
    },
    { name: 'name', label: 'Name' },
    { name: 'email', label: 'Email' },
    { name: 'usertype', label: 'User Type' },
    { name: 'gender', label: 'Gender' },
    {
      name: 'actions',
      label: 'Actions',
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          return (
            <div>
              <button 
                onClick={() => handleEdit(rowIndex)} 
                style={{ backgroundColor: 'green', color: 'white', marginRight: '5px', padding: '5px', borderRadius: '5px' }}
              >
                <MdEdit />
              </button>
              <button 
                onClick={() => confirmDelete(rowIndex)} 
                style={{ backgroundColor: 'red', color: 'white', padding: '5px', borderRadius: '5px' }}
              >
                <MdDelete />
              </button>
            </div>
          );
        }
      }
    }
  ];

  const data = users.map((user) => [
    user.image, user.name, user.email, user.usertype, user.gender
  ]);

  const options = {
    responsive: "vertical",
    tableBodyHeight: "400px",
    selectableRows: 'none',
  };

  return (
    <div>
      <ToastContainer />
      <button
        onClick={handleAddNewUser}
        className="flex gap-3 focus:outline-none text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700"
      >
        <MdPostAdd /> Add New User
      </button>
      <CacheProvider value={MuiCache}>
        <ThemeProvider theme={createTheme()}>
          {loading ? (
            <div className="flex justify-center">
              <CircularProgress />
            </div>
          ) : (
            <MUIDataTable title={'Users List'} data={data} columns={columns} options={options} />
          )}
        </ThemeProvider>
      </CacheProvider>

      <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={customModalStyles}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>{btnSave ? 'Add New User' : 'Update User'}</h2>
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="mx-auto h-40 w-40 rounded-sm object-cover mb-4"
          />
        )}
        <form onSubmit={handleFormSubmit} className=''>
          <div className="grid grid-cols-2 gap-3">
          <input type="text" name="name" placeholder="Name" onChange={handleInputChange} value={modalFormData.name} required className={`p-3 my-2 rounded-md border-solid ${validationMessages.name ? 'border-red-500' : 'border-blue-300'} border-[1px] w-full`} />
          {validationMessages.name && <p className="text-red-500 text-xs mt-1 col-span-2">{validationMessages.name}</p>}
          <input type="email" name="email" placeholder="Email" onChange={handleInputChange} value={modalFormData.email} required className={`p-3 my-2 rounded-md border-solid ${validationMessages.email ? 'border-red-500' : 'border-blue-300'} border-[1px] w-full`} />
          {validationMessages.email && <p className="text-red-500 text-xs mt-1 col-span-2">{validationMessages.email}</p>}
          <div className="relative col-span-2">
            <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" onChange={handleInputChange} value={modalFormData.password} className={`p-3 my-2 rounded-md border-solid ${validationMessages.password ? 'border-red-500' : 'border-blue-300'} border-[1px] w-full pr-10`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600">
              {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
            {validationMessages.password && <p className="text-red-500 text-xs mt-1">{validationMessages.password}</p>}
          </div>
          <select name="usertype" onChange={handleInputChange} value={modalFormData.usertype} required className={`p-3 my-2 rounded-md border-solid ${validationMessages.usertype ? 'border-red-500' : 'border-blue-300'} border-[1px] w-full`}>
            <option value="">Select User Type</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {validationMessages.usertype && <p className="text-red-500 text-xs mt-1 col-span-2">{validationMessages.usertype}</p>}
          <select name="gender" onChange={handleInputChange} value={modalFormData.gender} required className={`p-3 my-2 rounded-md border-solid ${validationMessages.gender ? 'border-red-500' : 'border-blue-300'} border-[1px] w-full`}>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {validationMessages.gender && <p className="text-red-500 text-xs mt-1 col-span-2">{validationMessages.gender}</p>}
          <select name="status" onChange={handleInputChange} value={modalFormData.status} className={`p-3 my-2 rounded-md border-solid border-blue-300 border-[1px] w-full`}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          <input type="file" name="image" onChange={handleInputChange} className={`p-3 my-2 rounded-md border-solid ${validationMessages.image ? 'border-red-500' : 'border-blue-300'} border-[1px] w-full`} />
          {validationMessages.image && <p className="text-red-500 text-xs mt-1 col-span-2">{validationMessages.image}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
          {formLoading ? (
            <div className="flex justify-center col-span-2">
              <CircularProgress />
            </div>
          ) : (
            <>
              <button type="submit" className='bg-green-600 p-3 border-none rounded-md cursor-pointer mt-3 text-white'>Submit</button>
              <button onClick={closeModal} className='bg-gray-700 p-3 border-none rounded-md cursor-pointer mt-3 text-white'>Close</button>
            </>
          )}
          </div>
          
          
          
        </form>
      </Modal>
    </div>
  );
}

export default UserManagementTable;

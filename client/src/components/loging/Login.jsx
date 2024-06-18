import React, { useState } from 'react';
import * as Components from './Components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import ClipLoader from 'react-spinners/ClipLoader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

function Login({ setUser }) {
  const navigate = useNavigate();
  const [signIn, toggle] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    image: null,
  });

  const [formLoginData, setLoginFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleInputChangeLogin = (e) => {
    const { name, value } = e.target;
    setLoginFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleTogglePasswordVisibility = () => {
    setPasswordVisible((prevVisible) => !prevVisible);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePasswordComplexity = (password) => {
    return password.length >= 6;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (
      formData.name === "" ||
      formData.email === "" ||
      formData.password === "" ||
      formData.confirmPassword === "" ||
      formData.gender === "" ||
      !formData.image
    ) {
      return;
    }

    if (!validateEmail(formData.email)) {
      MySwal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address',
        confirmButtonColor: '#F40000',
      });
      return;
    }

    if (!validatePasswordComplexity(formData.password)) {
      MySwal.fire({
        icon: 'error',
        title: 'Weak Password',
        text: 'Password must be at least 6 characters long',
        confirmButtonColor: '#F40000',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      MySwal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Passwords do not match!',
        confirmButtonColor: '#F40000',
      });
      return;
    }

    const formDataWithDefaults = new FormData();
    formDataWithDefaults.append('name', formData.name);
    formDataWithDefaults.append('email', formData.email);
    formDataWithDefaults.append('password', formData.password);
    formDataWithDefaults.append('gender', formData.gender);
    formDataWithDefaults.append('image', formData.image);
    formDataWithDefaults.append('usertype', 'user');

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/users/signup', formDataWithDefaults);

      // Auto-login after successful registration
      const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
        email: formData.email,
        password: formData.password,
      });

      const { user, token } = loginResponse.data;
      setUser(user);
      Cookies.set('user', JSON.stringify(user), { expires: 7 });
      Cookies.set('token', token, { expires: 7 });

      MySwal.fire({
        icon: 'success',
        title: 'Registration Successful',
        text: 'You have been registered and logged in successfully',
        confirmButtonColor: '#F40000',
      });

      navigate(user.usertype === 'admin' ? '/admin/default' : '/user/default');
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.message === 'Email already exists') {
        MySwal.fire({
          icon: 'error',
          title: 'Email Exists',
          text: 'Email already exists, please use a different email',
          confirmButtonColor: '#F40000',
        });
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: 'An error occurred during registration',
          confirmButtonColor: '#F40000',
        });
      }
      console.error("Error registering user:", error.response.data);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmitLogin = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (formLoginData.email === "" || formLoginData.password === "") {
      return;
    }

    if (!validateEmail(formLoginData.email)) {
      MySwal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address',
        confirmButtonColor: '#F40000',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', formLoginData);

      if (response.status === 200) {
        const { user, token } = response.data;
        setUser(user);
        Cookies.set('user', JSON.stringify(user), { expires: 7 });
        Cookies.set('token', token, { expires: 7 });

        MySwal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: 'You have been logged in successfully',
          confirmButtonColor: '#F40000',
        });

        navigate(user.usertype === 'admin' ? '/admin/default' : '/user/default');
      } else {
        console.error('Unexpected response status during login:', response.status);
      }
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'Email or password is incorrect',
        confirmButtonColor: '#F40000',
      });
      console.error('Error during login:', error.response.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className=" p-8 rounded-lg w-full max-w-md">
        {signIn ? (
          <Components.Form onSubmit={handleFormSubmitLogin}>
            <Components.Title>Sign in</Components.Title>
            <Components.Input
              type='email'
              placeholder='Email'
              name='email'
              onChange={handleInputChangeLogin}
            />
            {(formSubmitted && formLoginData.email === "") && <label className="text-red-700 text-xs">Please enter your email</label>}
            <div className="relative w-full">
              <Components.Input
                type={passwordVisible ? 'text' : 'password'}
                placeholder='Password'
                name='password'
                onChange={handleInputChangeLogin}
              />
              <span
                onClick={handleTogglePasswordVisibility}
                className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-gray-500"
              >
                <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
              </span>
            </div>
            {(formSubmitted && formLoginData.password === "") && <label className="text-red-700 text-xs">Please enter your password</label>}
            <Components.Anchor href='#'>Forgot your password?</Components.Anchor>
            <Components.Button type="submit">
              {loading ? <ClipLoader size={20} color={"#fff"} /> : 'Sign In'}
            </Components.Button>
            <Components.GhostButton onClick={() => toggle(false)}>Sign Up</Components.GhostButton>
          </Components.Form>
        ) : (
          <Components.Form onSubmit={handleFormSubmit}>
            <Components.Title>Create Account</Components.Title>
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mx-auto h-20 w-20 rounded-full object-cover mb-4" />
            )}
            <Components.Input
              type='text'
              name='name'
              placeholder='Name'
              pattern="[a-zA-Z\s]*"
              title="Please enter characters (a-z) only."
              onChange={handleInputChange}
            />
            {(formSubmitted && formData.name === "") && <label className="text-red-700 text-xs">Please enter your name</label>}
            <Components.Input
              type='email'
              name='email'
              placeholder='Email'
              onChange={handleInputChange}
            />
            {(formSubmitted && formData.email === "") && <label className="text-red-700 text-xs">Please enter your email</label>}
            <div className="relative w-full">
              <Components.Input
                type={passwordVisible ? 'text' : 'password'}
                name='password'
                placeholder='Password'
                onChange={handleInputChange}
              />
              <span
                onClick={handleTogglePasswordVisibility}
                className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-gray-500"
              >
                <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
              </span>
            </div>
            {(formSubmitted && formData.password === "") && <label className="text-red-700 text-xs">Please enter your password</label>}
            <Components.Input
              type={passwordVisible ? 'text' : 'password'}
              name='confirmPassword'
              placeholder='Confirm Password'
              onChange={handleInputChange}
            />
            {(formSubmitted && formData.confirmPassword === "") && <label className="text-red-700 text-xs">Please confirm your password</label>}
            <Components.Input
              type='file'
              name='image'
              accept="image/png, image/jpeg"
              onChange={handleInputChange}
            />
            {(formSubmitted && !formData.image) && <label className="text-red-700 text-xs">Please upload an image</label>}
            <select
              name='gender'
              onChange={handleInputChange}
              className="p-3 my-2 rounded-md border-solid border-blue-300 border-[1px] w-full"
              defaultValue=""
            >
              <option value="" disabled>Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {(formSubmitted && formData.gender === "") && <label className="text-red-700 text-xs">Please select your gender</label>}
            <Components.Button type="submit">
              {loading ? <ClipLoader size={20} color={"#fff"} /> : 'Sign Up'}
            </Components.Button>
            <Components.GhostButton onClick={() => toggle(true)}>Sign In</Components.GhostButton>
          </Components.Form>
        )}
      </div>
    </div>
  );
}

export default Login;

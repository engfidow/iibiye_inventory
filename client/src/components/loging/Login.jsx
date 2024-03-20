import React, { useState } from "react";
import * as Components from './Components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../AuthContext';
function Login({setUser}) {
    const navigate = useNavigate();
    const [signIn, toggle] = useState(true);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
  
    // State for form data
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  
    const [formLoginData, setLoginFormData] = useState({
      email: "",
      password: "",
    });
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    };
  
    const handleInputChangeLogin = (e) => {
      const { name, value } = e.target;
      setLoginFormData((prevData) => ({ ...prevData, [name]: value }));
    };
  
    const handleTogglePasswordVisibility = () => {
      setPasswordVisible((prevVisible) => !prevVisible);
    };
  
    const validateEmail = (email) => {
      // Use a regular expression for basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };
  
    const validatePasswordComplexity = (password) => {
      // Add your password complexity requirements here
      // For example, require at least 8 characters
      return password.length >= 6;
    };

  
    const handleFormSubmit = async (e) => {
      e.preventDefault();
      setFormSubmitted(true);
  
      if (
        formData.name === "" ||
        formData.email === "" ||
        formData.password === "" ||
        formData.confirmPassword === ""
      ) {
        // Handle empty fields
        return;
      }
  
      if (!validateEmail(formData.email)) {
        alert("Please enter a valid email address");
        return;
      }
  
      if (!validatePasswordComplexity(formData.password)) {
        alert("Password must be at least 6 characters long");
        return;
      }
  
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
  
      try {
        // Make a POST request to your backend endpoint for user registration
        const response = await axios.post('http://localhost:5000/api/users', {
          username: formData.name,
          email: formData.email,
          password: formData.password,
        });
  
        alert("User registered:", response.data);
        toggle(true);
        // Handle successful registration, redirect user, etc.
      } catch (error) {
        console.error("Error registering user:", error.response.data);
        // Handle registration error (e.g., display error message)
      }
    };
  
    const handleFormSubmitLogin = async (e) => {
      e.preventDefault();
      setFormSubmitted(true);
  
      if (formLoginData.email === "" || formLoginData.password === "") {
        // Handle empty fields
        return;
      }
  
      if (!validateEmail(formLoginData.email)) {
        alert("Please enter a valid email address");
        return;
      }
  
      try {
        // Make a POST request to your backend endpoint for user authentication
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          email: formLoginData.email,
          password: formLoginData.password,
        });
  
        // If the request is successful, navigate to the '/' route
        if (response.status === 200) {
          alert('Login successful');
          setUser(formLoginData.email); // Update authentication status
  
          const user = formLoginData.email;
          sessionStorage.setItem('user', user);
          navigate('/admin'); // Redirect to the admin page
        } else {
          // Handle unexpected response status
          console.error('Unexpected response status during login:', response.status);
        }
      } catch (error) {
        // Handle login error (e.g., display error message)
        console.error('Error during login:', error.response.data);
        alert('Email or password is incorrect'); // Display a user-friendly message
      }
    };
      

     return(
         <Components.Container>
             <Components.SignUpContainer signinIn={signIn}>
                 <Components.Form onSubmit={handleFormSubmit}>
                    <Components.Title>Create Account</Components.Title>
                    <Components.Input
                        type='text'
                        name='name'
                        placeholder='Name'
                        pattern="[a-zA-Z]*"
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
                    <Components.Input
                        type={passwordVisible ? 'text' : 'password'}
                        name='password'
                        placeholder='Password'
                        onChange={handleInputChange}
                    />
                     {(formSubmitted && formData.password === "") && <label className="text-red-700 text-xs">Please enter your password</label>}

                    <Components.Input
                        type={passwordVisible ? 'text' : 'password'}
                        name='confirmPassword'
                        placeholder='Confirm Password'
                        onChange={handleInputChange}
                    />
                    {(formSubmitted && formData.confirmPassword === "") && <label className="text-red-700 text-xs">Please confirm your password</label>}
                    {/* <Components.PasswordToggle onClick={handleTogglePasswordVisibility}>
                        {passwordVisible ? "Hide Password" : "Show Password"}
                    </Components.PasswordToggle> */}
                    <Components.Button type='submit'>Sign Up</Components.Button>
                </Components.Form>
             </Components.SignUpContainer>

             <Components.SignInContainer signinIn={signIn}>
                  <Components.Form onSubmit={handleFormSubmitLogin}>
                      <Components.Title>Sign in</Components.Title>
                      <Components.Input  type='email' placeholder='Email' name='email' onChange={handleInputChangeLogin}/>
                      {(formSubmitted && formLoginData.email === "") && <label className="text-red-700 text-xs">Please enter your email</label>}
                      <Components.Input type='password' placeholder='Password' name='password' onChange={handleInputChangeLogin}/>
                      {(formSubmitted && formLoginData.password === "") && <label className="text-red-700 text-xs">Please enter your password</label>}
                      <Components.Anchor href='#'>Forgot your password?</Components.Anchor>
                      <Components.Button type='submit'>Sigin In</Components.Button>
                  </Components.Form>
             </Components.SignInContainer>

             <Components.OverlayContainer signinIn={signIn}>
                 <Components.Overlay signinIn={signIn}>

                 <Components.LeftOverlayPanel signinIn={signIn}>
                     <Components.Title>Welcome Back!</Components.Title>
                     <Components.Paragraph>
                         To keep connected with us please login with your personal info
                     </Components.Paragraph>
                     <Components.GhostButton onClick={() => toggle(true)}>
                         Sign In
                     </Components.GhostButton>
                     </Components.LeftOverlayPanel>

                     <Components.RightOverlayPanel signinIn={signIn}>
                       <Components.Title>Hello, Customer!</Components.Title>
                       <Components.Paragraph>
                           Enter Your personal details and start journey with us
                       </Components.Paragraph>
                           <Components.GhostButton onClick={() => toggle(false)}>
                               Sigin Up
                           </Components.GhostButton> 
                     </Components.RightOverlayPanel>
 
                 </Components.Overlay>
             </Components.OverlayContainer>

         </Components.Container>
     )
}

export default Login;
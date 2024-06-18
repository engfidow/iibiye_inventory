import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from 'layouts/admin';
import UserLayout from 'layouts/user';
import Login from 'components/loging/Login';
import Cookies from 'js-cookie';
import axios from 'axios';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateUserSession = async () => {
      const userData = Cookies.get('user');
      const token = Cookies.get('token');
      if (userData && token) {
        try {
          const response = await axios.get('http://localhost:5000/api/users/validate-token', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.status === 200) {
            setUser(JSON.parse(userData));
          } else {
            Cookies.remove('user');
            Cookies.remove('token');
          }
        } catch (error) {
          console.error("Validation error:", error.response ? error.response.data : error.message);
          Cookies.remove('user');
          Cookies.remove('token');
        }
      }
      setLoading(false);
    };
  
    validateUserSession();
  }, []);
  

  const handleLogout = () => {
    Cookies.remove('user');
    Cookies.remove('token');
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>; // Add a loading indicator while checking the user session
  }

  return (
    <div>
      <Routes>
        <Route
          path="/admin/*"
          element={
            user && user.usertype === 'admin' ? (
              <AdminLayout user={user} setUser={setUser} handleLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/user/*"
          element={
            user && user.usertype === 'user' ? (
              <UserLayout user={user} setUser={setUser} handleLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={<Login setUser={setUser} />}
        />
        <Route
          path="/"
          element={<Navigate to={user ? (user.usertype === 'admin' ? '/admin/default' : '/user/default') : '/login'} replace />}
        />
      </Routes>
    </div>
  );
}

export default App;

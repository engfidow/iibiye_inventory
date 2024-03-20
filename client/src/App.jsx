
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from 'layouts/admin';
import AuthLayout from 'layouts/auth';

function App() {
  const [user, setUser] = useState(localStorage.getItem('user'));

  return (
    <div className="">
      
      <Routes>
        <Route
          path="/admin/*" 
          element={
           
              <AdminLayout user={user} setUser={setUser}/>
             
          
          }
        />
        {/* <Route
          path="/auth/*"
          element={
            user ? (
              <Navigate to="/admin" replace />
            ) : (
              <AuthLayout setUser={setUser} />
            )
          }
        /> */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  );
}

export default App;

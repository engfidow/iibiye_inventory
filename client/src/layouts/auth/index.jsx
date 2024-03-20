import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from '../../components/loging/Login';
import routes from '../../routes';

export default function Auth({ setUser }) {
  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === '/auth') {
        return (
         
            <Route 
           
            path={`/${prop.path}`}
            element={<Login setUser={setUser} />}  // Pass setUser prop to Login component
            key={key}
          />
          
          
        );
      } else {
        return null;
      }
    });
  };

  document.documentElement.dir = 'ltr';
  return (
    <div>
      <div className="flex items-center justify-center">
        <Routes>
          {getRoutes(routes)}
        </Routes>
      </div>
    </div>
  );
}

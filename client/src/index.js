import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

import App from "./App";


const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  
  <BrowserRouter>
      <App />
  </BrowserRouter>
  
  
);

// import "./index.css";
// import React from 'react';
// import { BrowserRouter as Router } from 'react-router-dom';
// import App from './App';
// import { AuthProvider } from './AuthContext';

// const MainApp = () => {
//   return (
//     <AuthProvider>
//       <Router>
//         <App />
//       </Router>
//     </AuthProvider>
//   );
// };

// export default MainApp;

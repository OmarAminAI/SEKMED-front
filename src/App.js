import React from 'react';
import { BrowserRouter as Router, Routes,Route } from 'react-router-dom';
import './App.css';

import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import HandleProtocol from './handle-protocol';
import VitalPage from './pages/VitalPage';

function App() {
  return (
   
    <Router>
      <div className='bg-white custom-scrollbar  '>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/handle-protocol" element={<HandleProtocol />} />
          <Route path="/dashboard" element={<VitalPage />} /> {}

  
        </Routes>
      </div>
    </Router>
    
  );
}

export default App;

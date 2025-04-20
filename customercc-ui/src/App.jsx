import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// import { useState } from 'react'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login';
import SignUp from './pages/Signup';
import EmailVerification from './pages/Email_Verification'
import UserProfile from "./pages/profile";
import CreditCards from './pages/CreditCards';
import ProtectedRoute from "./handlers/ProtectedRoute";
import Header from './components/header';
import { Copyright } from "./components/footer";
import Dashboard from './pages/dashboard';
// import { createTheme, ThemeProvider } from '@mui/material/styles';


// const defaultTheme = createTheme();

function App() {

  return (
    <div>
      <Router>
        <Header sx={{ marginTop: 8 }} />
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/home" element={<Home />} />
          <Route exact path="/dashboard" element={<Dashboard />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/signup" element={<SignUp />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/cards" element={<ProtectedRoute> <CreditCards /> </ProtectedRoute>} />
        </Routes>
      </Router>
      <Copyright sx={{ mt: 20, mb: 4 }} />
    </div>
  );
}

export default App

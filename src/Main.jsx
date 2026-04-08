import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js' // Added .js
import Auth from './Auth.jsx'                  // Added .jsx
import Dashboard from './Dashboard.jsx'        // Added .jsx

// If you have a global CSS file, import it here
// import './index.css' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

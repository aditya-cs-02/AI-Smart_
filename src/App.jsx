import React from 'react';
import { useState, useEffect } from 'react'  // 'React' default import not needed in React 17+
import { supabase } from './supabaseClient.js'
import Auth from './Auth.jsx'
import Dashboard from './Dashboard.jsx'

export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // 1. Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // 2. Listen for login/logout events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div>
      <div style={{
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',           // ✅ added: vertically centers email + button
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <span>Logged in as: <strong>{session.user.email}</strong></span>
        <button
          onClick={handleLogout}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '5px 15px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Log Out
        </button>
      </div>

      <Dashboard user={session.user} />
    </div>
  )
}

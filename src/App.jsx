import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Dashboard from './Dashboard' // Assuming you have your dashboard built here

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

  // If no session exists, show the login screen
  if (!session) {
    return <Auth />
  }

  // If logged in, show the application and pass the user data
  return (
    <div>
      <div style={{ padding: '10px 20px', display: 'flex', justifyContent: 'space-between', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <span>Logged in as: <strong>{session.user.email}</strong></span>
        <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '6px', cursor: 'pointer' }}>
          Log Out
        </button>
      </div>
      
      {/* Load your main application UI */}
      <Dashboard user={session.user} />
    </div>
  )
}

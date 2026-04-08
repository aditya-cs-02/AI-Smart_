import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function Dashboard({ user }) {
  const [currentView, setCurrentView] = useState('Dashboard')
  const [credits, setCredits] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('credits')
      .eq('email', user.email)
      .single()
    if (error) console.error('Failed to fetch user data:', error)
    if (data) setCredits(data.credits)
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    if (credits <= 0) {
      alert('You are out of credits!')
      return
    }

    setIsAnalyzing(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/analyze-cv', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error(`Server error: ${response.status}`)

      const data = await response.json()

      if (data.status === 'success') {
        setAnalysisResult(data)
        const newCredits = credits - 1
        await supabase.from('users').update({ credits: newCredits }).eq('email', user.email)
        setCredits(newCredits)
        await supabase.from('analysis_history').insert({
          user_email: user.email,
          filename: file.name,
          score: data.score,
        })
      }
    } catch (err) {
      console.error('Analysis failed', err)
      alert('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', background: 'white', borderRight: '1px solid #e2e8f0', padding: '20px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '30px' }}>AI Hire</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => setCurrentView('Dashboard')} style={navBtnStyle(currentView === 'Dashboard')}>Dashboard</button>
          <button onClick={() => setCurrentView('CV Scoring')} style={navBtnStyle(currentView === 'CV Scoring')}>CV Scoring</button>
          <button onClick={() => setCurrentView('Resume Builder')} style={navBtnStyle(currentView === 'Resume Builder')}>Resume Builder</button>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '100px' }}>
          <div style={{ padding: '15px', background: '#f1f5f9', borderRadius: '12px' }}>
            <p style={{ margin: 0, fontSize: '14px' }}>Credits: <strong>{credits} 🪙</strong></p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px' }}>
        {currentView === 'Dashboard' && (
          <div>
            <h1>Your Dashboard</h1>
            <div style={heroBoxStyle}>
              <h2 style={{ color: 'white' }}>Welcome back, {user.email.split('@')[0]} ✨</h2>
              <p style={{ color: 'rgba(255,255,255,0.9)' }}>Analyze your CV or build a new one using AI.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div style={cardStyle} onClick={() => setCurrentView('CV Scoring')}>📊 CV Scoring</div>
              <div style={cardStyle} onClick={() => setCurrentView('Resume Builder')}>🤖 AI Resume Builder</div>
              <div style={cardStyle}>🎯 Job Matching</div>
            </div>
          </div>
        )}

        {currentView === 'CV Scoring' && (
          <div>
            <h1>CV Scoring (ATS)</h1>
            {!analysisResult ? (
              <div style={uploadBoxStyle}>
                <h3>Upload Resume</h3>
                <input type="file" onChange={handleFileUpload} accept=".pdf,.docx,.txt" />
                {isAnalyzing && <p>🤖 Analyzing your resume with Python backend...</p>}
              </div>
            ) : (
              <div>
                <div style={resultRowStyle}>
                  <div style={{ flex: 1 }}>
                    <h3>Assessment Summary</h3>
                    <p style={{ color: '#10b981' }}>✅ {analysisResult.passed} Passed Checks</p>
                    <p style={{ color: '#ef4444' }}>⚠️ {analysisResult.warnings.length} Detected Issues</p>
                  </div>
                  <div style={scoreCircleWrapper(analysisResult.score)}>
                    <div style={scoreCircleStyle(analysisResult.score)}>{analysisResult.score}</div>
                    <p style={{ fontSize: '12px', marginTop: '10px', color: '#64748b' }}>ATS SCORE</p>
                  </div>
                </div>
                <button onClick={() => setAnalysisResult(null)} style={{ marginTop: '20px' }}>← Back to Upload</button>
              </div>
            )}
          </div>
        )}

        {currentView === 'Resume Builder' && (
          <div>
            <h1>Resume Builder</h1>
            <div style={uploadBoxStyle}>
              <h3>🚧 Coming Soon</h3>
              <p>AI-powered resume builder is under construction.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// --- STYLES ---
const navBtnStyle = (active) => ({
  padding: '12px',
  textAlign: 'left',
  background: active ? '#3b82f6' : 'transparent',
  color: active ? 'white' : '#64748b',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
})

const heroBoxStyle = {
  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
  padding: '30px',
  borderRadius: '16px',
  marginBottom: '30px',
}

const cardStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  textAlign: 'center',
  cursor: 'pointer',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
}

const uploadBoxStyle = {
  background: 'white',
  padding: '40px',
  borderRadius: '16px',
  border: '2px dashed #e2e8f0',
  textAlign: 'center',
}

const resultRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'white',
  padding: '30px',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
}

const scoreCircleWrapper = () => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingLeft: '40px',
  borderLeft: '1px solid #e2e8f0',
})

const scoreCircleStyle = (score) => ({
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  border: `8px solid ${score > 70 ? '#10b981' : '#f59e0b'}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '32px',
  fontWeight: '800',
  color: score > 70 ? '#10b981' : '#f59e0b',
})

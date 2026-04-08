import { useState, useEffect } from 'react'   // ✅ removed default React import
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
    if (error) console.error('Failed to fetch user data:', error)  // ✅ added error handling
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

      if (!response.ok) throw new Error(`Server error: ${response.status}`)  // ✅ added HTTP error check

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
      alert('Analysis failed. Please try again.')   // ✅ user-facing error feedback
    } finally {
      setIsAnalyzing(false)
    }
  }

  // ... rest of JSX and styles unchanged

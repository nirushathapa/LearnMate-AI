import { useState } from 'react'
import './Auth.css'

const API_URL = 'http://localhost:5000/api'

function Auth({ mode, onSwitch, onSuccess, onHome }) {
  const isSignup = mode === 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function updateField(event) { setForm({ ...form, [event.target.name]: event.target.value }) }

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (isSignup && !form.name.trim()) return setError('Please enter your name.')
    if (!form.email.includes('@')) return setError('Please enter a valid email.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    if (isSignup && form.password !== form.confirmPassword) return setError('Passwords do not match.')
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/users/${isSignup ? 'register' : 'login'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, email: form.email, password: form.password }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Something went wrong. Please try again.')
      localStorage.setItem('learnmateToken', data.token)
      onSuccess(data.user)
    } catch (requestError) {
      setError(requestError.message.includes('fetch') ? 'The backend is not running. Start it on port 5000 and try again.' : requestError.message)
    } finally { setLoading(false) }
  }

  return <main className="auth-page"><button className="auth-brand" onClick={onHome}><span>L</span> LearnMate <b>AI</b></button><section className="auth-card"><p className="auth-eyebrow">Your smarter study companion</p><h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1><p className="auth-subtitle">{isSignup ? 'Start building better study habits today.' : 'Log in to continue your learning journey.'}</p><form onSubmit={submit}>{isSignup && <label>Full name<input name="name" value={form.name} onChange={updateField} placeholder="Your name" /></label>}<label>Email address<input name="email" type="email" value={form.email} onChange={updateField} placeholder="you@example.com" /></label><label>Password<input name="password" type="password" value={form.password} onChange={updateField} placeholder="At least 6 characters" /></label>{isSignup && <label>Confirm password<input name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} placeholder="Repeat your password" /></label>}{error && <p className="auth-error">{error}</p>}<button className="auth-submit" disabled={loading}>{loading ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'} <span>↗</span></button></form><p className="auth-switch">{isSignup ? 'Already have an account?' : 'New to LearnMate?'} <button onClick={() => onSwitch(isSignup ? 'login' : 'signup')}>{isSignup ? 'Log in' : 'Create an account'}</button></p></section></main>
}

export default Auth

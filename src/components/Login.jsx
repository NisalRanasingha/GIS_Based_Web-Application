import { useState } from 'react'
import './Login.css'

function Login({ initialEmail = '', onNavigate, onLoginSuccess, onClose }) {
  const [signedIn, setSignedIn] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())

    setError('')
    setIsSubmitting(true)

    try {
      if (!payload.email || !payload.password || payload.password.length < 8) {
        throw new Error('Enter a valid email and a password of at least 8 characters.')
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to sign in.')
      }

      sessionStorage.setItem('fis_token', result.token)
      sessionStorage.setItem('fis_user', JSON.stringify(result.user))
      setSignedIn(true)
      onLoginSuccess(result.user)
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in.')
      setSignedIn(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page auth-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.() }}>
      <section className="login-card" aria-label="Sign in to your account">
        <button className="auth-modal-close" type="button" onClick={onClose} aria-label="Close sign in">×</button>
        <div className="login-form-panel">
          <div className="login-heading">
            <h1>Welcome back!</h1>
            <p>Enter your Credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <label>
              Email address
              <input type="email" name="email" placeholder="Enter your email" defaultValue={initialEmail} required />
            </label>
            <label>
              Password
              <input type="password" name="password" placeholder="Enter your password" minLength="8" required />
            </label>
            <a className="forgot-password" href="#forgot-password">forgot password</a>

            {error && <p className="form-message error-message" role="alert">{error}</p>}

            <button className="login-primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : signedIn ? 'Signed In' : 'Sign In'}
            </button>
          </form>

          <p className="signup-prompt">
            Don't have an account? <a href="#signup" onClick={(event) => { event.preventDefault(); onNavigate('signup') }}>Sign Up Here</a>
          </p>
        </div>

        <div className="login-image-panel">
          <img src="/30342.jpg" alt="Fishing boat on calm blue water" />
        </div>
      </section>
    </main>
  )
}

export default Login

import { useState } from 'react'
import './Login.css'

function Login({ onNavigate, onLoginSuccess }) {
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
      const response = await fetch('http://localhost:5000/api/login', {
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
    <main className="login-page">
      <section className="login-card" aria-label="Sign in to your account">
        <div className="login-form-panel">
          <div className="login-heading">
            <h1>Welcome back!</h1>
            <p>Enter your Credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <label>
              Email address
              <input type="email" name="email" placeholder="Enter your email" required />
            </label>
            <label>
              Password
              <input type="password" name="password" placeholder="Enter your password" required />
            </label>
            <a className="forgot-password" href="#forgot-password">forgot password</a>

            {error && <p className="form-message error-message" role="alert">{error}</p>}

            <button className="login-primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : signedIn ? 'Signed In' : 'Sign In'}
            </button>
          </form>

          <button className="login-google-button" type="button">
            <span className="login-google-mark" aria-hidden="true">G</span>
            Sign in with Google
          </button>

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

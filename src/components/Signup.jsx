import { useState } from 'react'
import './Signup.css'
import LoadingOverlay from './LoadingOverlay'
import CenterAlert from './CenterAlert'

function Signup({ onNavigate, onSignupSuccess, onClose }) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    setError('')
    setSubmitted(false)
    setIsSubmitting(true)

    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to create your account.')
      }

      setSubmitted(true)
      onSignupSuccess?.(payload.email)
    } catch (requestError) {
      setError(requestError.message || 'Unable to create your account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="signup-page auth-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.() }}>
      {isSubmitting && <LoadingOverlay message="Creating account..." />}
      <CenterAlert
        type={error ? 'error' : submitted ? 'success' : undefined}
        message={error || (submitted ? 'Account created successfully.' : '')}
        onClose={() => { setError(''); setSubmitted(false) }}
      />
      
      <section className="signup-card" aria-label="Create your account">
        <button className="auth-modal-close" type="button" onClick={onClose} aria-label="Close sign up">×</button>
        <div className="image-panel">
          <img src="/30342.jpg" alt="Fishing boat on calm blue water" />
        </div>

        <div className="form-panel">
          <div className="form-heading">
            <h1>Get Started Now</h1>
            
          </div>

          <form onSubmit={handleSubmit}>
            <div className="name-fields">
              <label>
                First Name
                <input type="text" name="firstName" placeholder="Enter your first name" required />
              </label>
              <label>
                Last Name
                <input type="text" name="lastName" placeholder="Enter your last name" required />
              </label>
            </div>
            <label>
              Email address
              <input type="email" name="email" placeholder="Enter your email" required />
            </label>
            <label>
              Contact
              <input type="tel" name="contact" placeholder="Enter your contact" pattern="[0-9]{10}" maxLength="10" title="Enter exactly 10 digits" required />
            </label>
            <label>
              Password
              <input type="password" name="password" placeholder="At least 8 chars, upper/lower/number/symbol" minLength="8" pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}" title="Use at least 8 characters with uppercase, lowercase, number, and special character" required />
            </label>
            <label>
              Confirm Password
              <input type="password" name="confirmPassword" placeholder="Re-enter the password" minLength="8" required />
            </label>

            <button className="primary-button" type="submit">
              {isSubmitting ? 'Creating Account...' : submitted ? 'Account Created' : 'Sign Up'}
            </button>
          </form>

          <p className="login-prompt">
            Already have an account? <a href="#login" onClick={(event) => { event.preventDefault(); onNavigate('login') }}>Sign In Here</a>
          </p>
        </div>
      </section>
      {/* <FISFooter onNavigate={onNavigate} /> */}
    </main>
  )
}

export default Signup

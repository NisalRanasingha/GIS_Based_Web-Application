import { useState } from 'react'
import './Signup.css'
import FISHeader from './FISHeader'

function Signup({ onNavigate }) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitted(false)
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const payload = Object.fromEntries(formData.entries())

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to create your account.')
      }

      setSubmitted(true)
      event.currentTarget.reset()
    } catch (requestError) {
      setError(requestError.message || 'Unable to create your account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="signup-page">
      
      <section className="signup-card" aria-label="Create your account">
        <div className="image-panel">
          <img src="/30342.jpg" alt="Fishing boat on calm blue water" />
        </div>

        <div className="form-panel">
          <div className="form-heading">
            <h1>Get Started Now</h1>
            <p>Create Your Account</p>
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
              <input type="password" name="password" placeholder="Enter your password" minLength="5" pattern=".*[A-Za-z].*" title="Use at least 5 characters and one letter" required />
            </label>
            <label>
              Confirm Password
              <input type="password" name="confirmPassword" placeholder="Re-enter the password" minLength="5" required />
            </label>

            {error && <p className="form-message error-message" role="alert">{error}</p>}
            {submitted && <p className="form-message success-message" role="status">Account created successfully.</p>}
            <button className="primary-button" type="submit">
              {isSubmitting ? 'Creating Account...' : submitted ? 'Account Created' : 'Sign Up'}
            </button>
          </form>

          <button className="google-button" type="button">
            <span className="google-mark" aria-hidden="true">G</span>
            Sign in with Google
          </button>

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

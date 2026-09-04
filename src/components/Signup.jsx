import { useState } from 'react'
import FISHeader from './FISHeader'
import './Signup.css'
import FISFooter from './FISFooter'

function Signup({ onNavigate }) {
  const [submitted, setSubmitted] = useState(false)

  return (
    <>
      <FISHeader page="signup" onNavigate={onNavigate} />
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

          <form
            onSubmit={(event) => {
              event.preventDefault()
              setSubmitted(true)
            }}
          >
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
              <input type="tel" name="contact" placeholder="Enter your contact" required />
            </label>
            <label>
              Password
              <input type="password" name="password" placeholder="Enter your password" required />
            </label>
            <label>
              Confirm Password
              <input type="password" name="confirmPassword" placeholder="Re-enter the password" required />
            </label>

            <button className="primary-button" type="submit">
              {submitted ? 'Account Created' : 'Sign Up'}
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
    </main>
    <FISFooter/>
  
    </>
  )
}

export default Signup

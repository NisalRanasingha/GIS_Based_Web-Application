import { useState } from 'react'
import FISHeader from './FISHeader'
import './Login.css'
import FISFooter from './FISFooter'

function Login({ onNavigate }) {
  const [signedIn, setSignedIn] = useState(false)

  return (
    <>
      <FISHeader page="login" onNavigate={onNavigate} />
      <main className="login-page">
      <section className="login-card" aria-label="Sign in to your account">
        <div className="login-form-panel">
          <div className="login-heading">
            <h1>Welcome back!</h1>
            <p>Enter your Credentials to access your account</p>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              setSignedIn(true)
            }}
          >
            <label>
              Email address
              <input type="email" name="email" placeholder="Enter your email" required />
            </label>
            <label>
              Password
              <input type="password" name="password" placeholder="Enter your password" required />
            </label>
            <a className="forgot-password" href="#forgot-password">forgot password</a>

            <button className="login-primary-button" type="submit">
              {signedIn ? 'Signed In' : 'Sign In'}
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
    <FISFooter/>
    </>
  )
}

export default Login

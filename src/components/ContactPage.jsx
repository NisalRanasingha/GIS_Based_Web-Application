import { useState } from 'react'

const inquiryOptions = [
  'General Inquiry',
  'Fish Stock & Research',
  'Oceanographic Data',
  'Aquaculture',
  'Market Information',
  'Publications & Reports',
  'Licensing & Registration',
]

export default function ContactPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    department: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (formData.fullName.trim().length < 2) {
      window.alert('Please enter your full name.')
      return
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      window.alert('Please enter a valid email address.')
      return
    }
    if (!formData.department) {
      window.alert('Please select a department or area of inquiry.')
      return
    }
    if (formData.subject.trim().length < 2) {
      window.alert('Please enter a subject.')
      return
    }
    if (formData.message.trim().length < 10) {
      window.alert('Your message must be at least 10 characters long.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to submit the inquiry.')
      }

      window.alert(result.message)
      setFormData({
        fullName: '', email: '', phone: '', organization: '', department: '', subject: '', message: '',
      })
    } catch (error) {
      window.alert(error.message || 'Unable to submit the inquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="contact-page">
      <section className="contact-hero">
        <div className="container contact-hero-inner">
          <div>
            <p className="eyebrow">Contact</p>
            <h1>We are here to help</h1>
            <p>
              Reach out to the Fisheries Information Center for research support, data requests, and stakeholder inquiries.
            </p>
          </div>
        </div>
      </section>

      <section className="container contact-layout">
        <div className="contact-panel contact-details">
          <h2>Get in touch</h2>

          <div className="info-block">
            <span className="info-label">Address</span>
            <p>NARA, Crow Island, Mattakkuliya, Colombo 15, Sri Lanka</p>
          </div>

          <div className="info-block">
            <span className="info-label">Phone / Fax</span>
            <p>+94 11 2522 189</p>
            <p>+94 11 2521 932</p>
          </div>

          <div className="info-block">
            <span className="info-label">Email</span>
            <p>fic@nara.ac.lk</p>
            <p>nara@nara.ac.lk</p>
          </div>

          <div className="info-block">
            <span className="info-label">Office Hours</span>
            <p>Monday – Friday: 8:30 AM – 4:30 PM</p>
          </div>

          <button type="button" className="primary-button wide-button" onClick={() => onNavigate('home')}>
            Back to home
          </button>
        </div>

        <div className="contact-panel contact-form-panel">
          <h2>Send an Inquiry</h2>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                <span>Full Name</span>
                <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} placeholder="Enter your name" required />
              </label>

              <label>
                <span>Email Address</span>
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
              </label>

              <label>
                <span>Phone Number</span>
                <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+94 71 234 5678" />
              </label>

              <label>
                <span>Organization / Institution</span>
                <input name="organization" type="text" value={formData.organization} onChange={handleChange} placeholder="Your organization" />
              </label>

              <label>
                <span>Department / Area of Inquiry</span>
                <select name="department" value={formData.department} onChange={handleChange} required>
                  <option value="" disabled>
                    -- Select Department --
                  </option>
                  {inquiryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Subject</span>
                <input name="subject" type="text" value={formData.subject} onChange={handleChange} placeholder="Brief subject" required />
              </label>
            </div>

            <label>
              <span>Your Message</span>
              <textarea name="message" rows="5" value={formData.message} onChange={handleChange} placeholder="How can we help you?" required />
            </label>

            <button type="submit" className="primary-button wide-button" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

import { createServer } from 'node:http'
import { randomBytes, scryptSync } from 'node:crypto'

const port = 3001
const usersByEmail = new Map()

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  })
  response.end(JSON.stringify(body))
}

function validateRegistration(data) {
  const requiredFields = ['firstName', 'lastName', 'email', 'contact', 'password', 'confirmPassword']
  if (requiredFields.some((field) => typeof data[field] !== 'string' || !data[field].trim())) {
    return 'All fields are required.'
  }

  if (!/^([^\s@]+)@([^\s@]+)\.([^\s@]+)$/.test(data.email.trim())) {
    return 'Enter a valid email address containing @.'
  }
  if (!/^\d{10}$/.test(data.contact)) {
    return 'Phone number must contain exactly 10 digits.'
  }
  if (data.password.length < 5 || !/[A-Za-z]/.test(data.password)) {
    return 'Password must be at least 5 characters and include a letter.'
  }
  if (data.password !== data.confirmPassword) {
    return 'Passwords do not match.'
  }

  return null
}

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''
    request.setEncoding('utf8')
    request.on('data', (chunk) => {
      body += chunk
      if (body.length > 1_000_000) reject(new Error('Request body is too large.'))
    })
    request.on('end', () => resolve(body))
    request.on('error', reject)
  })
}

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    response.end()
    return
  }

  if (request.method !== 'POST' || request.url !== '/api/register') {
    sendJson(response, 404, { message: 'Route not found.' })
    return
  }

  try {
    const data = JSON.parse(await readRequestBody(request))
    const validationError = validateRegistration(data)
    if (validationError) {
      sendJson(response, 400, { message: validationError })
      return
    }

    const email = data.email.trim().toLowerCase()
    if (usersByEmail.has(email)) {
      sendJson(response, 409, { message: 'An account with this email already exists.' })
      return
    }

    usersByEmail.set(email, {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email,
      contact: data.contact,
      passwordHash: hashPassword(data.password),
    })

    sendJson(response, 201, { message: 'Account created successfully.' })
  } catch (error) {
    const message = error instanceof SyntaxError ? 'Request must contain valid JSON.' : 'Unable to process registration.'
    sendJson(response, 400, { message })
  }
})

server.listen(port, () => {
  console.log(`Registration API listening on http://localhost:${port}`)
})

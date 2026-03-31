import { useEffect, useMemo, useState } from 'react'
import MaterialIcon from '../components/MaterialIcon'

const USERS_STORAGE_KEY = 'spacio_surplas_users'
const SESSION_STORAGE_KEY = 'spacio_surplas_current_user'

function getStoredUsers() {
  try {
    const rawUsers = localStorage.getItem(USERS_STORAGE_KEY)
    if (!rawUsers) {
      return []
    }

    const parsedUsers = JSON.parse(rawUsers)
    return Array.isArray(parsedUsers) ? parsedUsers : []
  } catch {
    return []
  }
}

function getStoredSession() {
  try {
    const rawSession = localStorage.getItem(SESSION_STORAGE_KEY)
    return rawSession ? JSON.parse(rawSession) : null
  } catch {
    return null
  }
}

function AuthSection({ initialMode = 'login', onBackHome }) {
  const [mode, setMode] = useState(initialMode)
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [feedback, setFeedback] = useState({ kind: '', message: '' })

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  useEffect(() => {
    setUsers(getStoredUsers())
    setCurrentUser(getStoredSession())
  }, [])

  const registeredUserCount = useMemo(() => users.length, [users.length])

  function saveUsers(nextUsers) {
    setUsers(nextUsers)
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers))
  }

  function updateSession(user) {
    const sessionUser = {
      fullName: user.fullName,
      email: user.email,
      loggedInAt: new Date().toISOString(),
    }
    setCurrentUser(sessionUser)
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser))
  }

  function clearSession() {
    setCurrentUser(null)
    localStorage.removeItem(SESSION_STORAGE_KEY)
    setFeedback({ kind: 'success', message: 'You have been logged out.' })
  }

  function showError(message) {
    setFeedback({ kind: 'error', message })
  }

  function showSuccess(message) {
    setFeedback({ kind: 'success', message })
  }

  function handleRegister(event) {
    event.preventDefault()
    setFeedback({ kind: '', message: '' })

    const fullName = registerForm.fullName.trim()
    const email = registerForm.email.trim().toLowerCase()
    const password = registerForm.password
    const confirmPassword = registerForm.confirmPassword

    if (!fullName || !email || !password || !confirmPassword) {
      showError('Please complete all registration fields.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('Please enter a valid email address.')
      return
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match. Please try again.')
      return
    }

    const hasExistingUser = users.some((user) => user.email.toLowerCase() === email)
    if (hasExistingUser) {
      showError('That email is already registered. Please log in instead.')
      setMode('login')
      return
    }

    const newUser = {
      id: Date.now(),
      fullName,
      email,
      password,
      createdAt: new Date().toISOString(),
    }

    const nextUsers = [...users, newUser]
    saveUsers(nextUsers)
    showSuccess('Registration successful. You can now log in.')
    setRegisterForm({ fullName: '', email: '', password: '', confirmPassword: '' })
    setMode('login')
  }

  function handleLogin(event) {
    event.preventDefault()
    setFeedback({ kind: '', message: '' })

    const email = loginForm.email.trim().toLowerCase()
    const password = loginForm.password

    if (!email || !password) {
      showError('Please enter your email and password.')
      return
    }

    const matchedUser = users.find(
      (user) => user.email.toLowerCase() === email && user.password === password,
    )

    if (!matchedUser) {
      showError('Incorrect email or password.')
      return
    }

    updateSession(matchedUser)
    setLoginForm({ email: '', password: '' })
    showSuccess(`Welcome back, ${matchedUser.fullName}.`)
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-background-light py-20">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#c2a680 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />
      <div className="relative mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="rounded-3xl bg-neutral-dark p-8 text-white shadow-xl shadow-neutral-dark/20 lg:p-10">
          <a className="inline-flex items-center gap-2" href="#">
            <img
              alt="Spacio Surplas Logo"
              className="h-10 w-auto rounded-md border border-primary/40 bg-white p-1"
              src="/logo.svg"
            />
            <span className="text-xl font-extrabold tracking-tight text-white">
              SPACIO <span className="text-primary">SURPLAS</span>
            </span>
          </a>
          <h1 className="mt-10 text-4xl font-black leading-tight tracking-tight">
            Your account for seamless furniture deals.
          </h1>
          <p className="mt-5 max-w-md text-white/70">
            Register to keep your profile ready, or log in using your registered details.
            Registration data is persisted in local storage for this browser.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <div className="rounded-xl border border-primary/40 bg-primary/20 px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-white/70">Registered Accounts</p>
              <p className="text-2xl font-black">{registeredUserCount}</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-white/70">Session Status</p>
              <p className="text-sm font-semibold">
                {currentUser ? `Logged in as ${currentUser.fullName}` : 'Not logged in'}
              </p>
            </div>
          </div>

          <button
            className="mt-10 inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/25"
            onClick={onBackHome}
            type="button"
          >
            <MaterialIcon className="text-base" name="arrow_back" />
            Back to Home
          </button>
        </div>

        <div className="rounded-3xl border border-primary/15 bg-white p-6 shadow-xl shadow-primary/10 sm:p-8">
          <div className="inline-flex w-full rounded-xl border border-primary/20 bg-background-light p-1">
            <button
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                mode === 'login' ? 'bg-neutral-dark text-white' : 'text-neutral-dark'
              }`}
              onClick={() => setMode('login')}
              type="button"
            >
              Login
            </button>
            <button
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                mode === 'register' ? 'bg-neutral-dark text-white' : 'text-neutral-dark'
              }`}
              onClick={() => setMode('register')}
              type="button"
            >
              Register
            </button>
          </div>

          {feedback.message && (
            <div
              className={`mt-6 rounded-lg border px-4 py-3 text-sm font-medium ${
                feedback.kind === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-green-200 bg-green-50 text-green-700'
              }`}
            >
              {feedback.message}
            </div>
          )}

          {mode === 'login' ? (
            <form className="mt-6 space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-dark" htmlFor="login-email">
                  Email
                </label>
                <input
                  autoComplete="email"
                  className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 focus:border-primary focus:outline-none"
                  id="login-email"
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="you@example.com"
                  type="email"
                  value={loginForm.email}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-dark" htmlFor="login-password">
                  Password
                </label>
                <input
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 focus:border-primary focus:outline-none"
                  id="login-password"
                  onChange={(event) =>
                    setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  placeholder="Enter password"
                  type="password"
                  value={loginForm.password}
                />
              </div>

              <button
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-bold text-neutral-dark transition-colors hover:bg-primary/90"
                type="submit"
              >
                <MaterialIcon className="text-base" name="login" />
                Login
              </button>
            </form>
          ) : (
            <form className="mt-6 space-y-5" onSubmit={handleRegister}>
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-dark" htmlFor="register-name">
                  Full Name
                </label>
                <input
                  autoComplete="name"
                  className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 focus:border-primary focus:outline-none"
                  id="register-name"
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, fullName: event.target.value }))
                  }
                  placeholder="Juan Dela Cruz"
                  type="text"
                  value={registerForm.fullName}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-dark" htmlFor="register-email">
                  Email
                </label>
                <input
                  autoComplete="email"
                  className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 focus:border-primary focus:outline-none"
                  id="register-email"
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="you@example.com"
                  type="email"
                  value={registerForm.email}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-dark" htmlFor="register-password">
                  Password
                </label>
                <input
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 focus:border-primary focus:outline-none"
                  id="register-password"
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  placeholder="At least 6 characters"
                  type="password"
                  value={registerForm.password}
                />
              </div>
              <div>
                <label
                  className="mb-1 block text-sm font-semibold text-neutral-dark"
                  htmlFor="register-confirm-password"
                >
                  Confirm Password
                </label>
                <input
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 focus:border-primary focus:outline-none"
                  id="register-confirm-password"
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                  }
                  placeholder="Re-enter password"
                  type="password"
                  value={registerForm.confirmPassword}
                />
              </div>

              <button
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-dark px-4 py-3 font-bold text-white transition-colors hover:bg-neutral-dark/90"
                type="submit"
              >
                <MaterialIcon className="text-base" name="person_add" />
                Create Account
              </button>
            </form>
          )}

          {currentUser && (
            <button
              className="mt-6 w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-semibold text-neutral-dark transition-colors hover:bg-primary/10"
              onClick={clearSession}
              type="button"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default AuthSection

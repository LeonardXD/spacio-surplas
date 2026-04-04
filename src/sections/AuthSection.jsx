import { useState } from 'react'
import MaterialIcon from '../components/MaterialIcon'
import { sellerPlans } from '../data/homePageData'

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

function formatPlanPrice(pricePerMonth) {
  return `PHP ${pricePerMonth.toLocaleString('en-PH')}/month`
}

function getRoleLabel(role) {
  return role === 'seller' ? 'Seller' : 'Buyer'
}

function AuthSection({
  initialMode = 'login',
  accountRole = 'buyer',
  onModeChange,
  onAuthSuccess,
}) {
  const [users, setUsers] = useState(() => getStoredUsers())
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
  })
  const [selectedPlanId, setSelectedPlanId] = useState(sellerPlans[0]?.id ?? 'starter')
  const [feedback, setFeedback] = useState({ kind: '', message: '' })
  const role = accountRole
  const mode = initialMode

  function saveUsers(nextUsers) {
    setUsers(nextUsers)
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers))
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
    const businessName = registerForm.businessName.trim()
    const email = registerForm.email.trim().toLowerCase()
    const password = registerForm.password
    const confirmPassword = registerForm.confirmPassword

    if (!fullName || !email || !password || !confirmPassword) {
      showError('Please complete all required registration fields.')
      return
    }

    if (role === 'seller' && !businessName) {
      showError('Seller registration requires a business/shop name.')
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

    const hasExistingRoleAccount = users.some(
      (user) =>
        user.email.toLowerCase() === email && (user.role ?? 'buyer') === role,
    )

    if (hasExistingRoleAccount) {
      showError(`This ${getRoleLabel(role).toLowerCase()} email is already registered. Please log in.`)
      onModeChange?.('login')
      return
    }

    const selectedPlan = sellerPlans.find((plan) => plan.id === selectedPlanId) ?? sellerPlans[0]

    const newUser = {
      id: Date.now(),
      fullName,
      email,
      password,
      role,
      businessName: role === 'seller' ? businessName : '',
      sellerPlanId: role === 'seller' ? selectedPlan.id : null,
      createdAt: new Date().toISOString(),
    }

    const nextUsers = [...users, newUser]
    saveUsers(nextUsers)

    if (role === 'seller') {
      showSuccess(
        `Seller account created with ${selectedPlan.name} plan (${selectedPlan.freeTrialDays}-day free trial). You can now log in.`,
      )
    } else {
      showSuccess('Buyer account created successfully. You can now log in.')
    }

    setRegisterForm({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      businessName: '',
    })
    onModeChange?.('login')
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
      (user) =>
        user.email.toLowerCase() === email &&
        user.password === password &&
        (user.role ?? 'buyer') === role,
    )

    if (!matchedUser) {
      const roleMismatchUser = users.find(
        (user) => user.email.toLowerCase() === email && user.password === password,
      )

      if (roleMismatchUser) {
        const expectedRole = getRoleLabel(roleMismatchUser.role ?? 'buyer')
        showError(`This account is registered as ${expectedRole}. Use the ${expectedRole.toLowerCase()} login page.`)
        return
      }

      showError('Incorrect credentials for this role.')
      return
    }

    const sessionUser = {
      id: matchedUser.id,
      fullName: matchedUser.fullName,
      email: matchedUser.email,
      role: matchedUser.role ?? 'buyer',
      businessName: matchedUser.businessName ?? '',
      sellerPlanId: matchedUser.sellerPlanId ?? null,
      loggedInAt: new Date().toISOString(),
    }

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser))
    setLoginForm({ email: '', password: '' })
    showSuccess(`Welcome back, ${matchedUser.fullName}.`)
    onAuthSuccess?.(sessionUser)
  }

  const activePlan = sellerPlans.find((plan) => plan.id === selectedPlanId) ?? sellerPlans[0]

  return (
    <section className="relative min-h-screen overflow-hidden bg-background-light py-20">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#c2a680 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />
      <div className="relative mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-primary/15 bg-white p-6 shadow-xl shadow-primary/10 sm:p-8">
          <div>
            <h2 className="text-2xl font-black text-neutral-dark sm:text-3xl">
              {mode === 'login'
                ? `${getRoleLabel(role)} Login`
                : `${getRoleLabel(role)} Registration`}
            </h2>
            <p className="mt-2 text-sm text-neutral-dark/65">
              {mode === 'login'
                ? `Sign in to your ${getRoleLabel(role).toLowerCase()} account.`
                : `Create your ${getRoleLabel(role).toLowerCase()} account.`}
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2">
            <p className="text-center text-sm font-bold text-neutral-dark">
              {getRoleLabel(role)} Account
            </p>
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

          {mode === 'register' && role === 'seller' && (
            <div className="mt-6 rounded-2xl border border-primary/15 bg-background-light p-4 sm:p-5">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-neutral-dark/70">
                <MaterialIcon className="text-base text-primary" name="workspace_premium" />
                Seller Plans With Free Trial
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {sellerPlans.map((plan) => (
                  <button
                    key={plan.id}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      selectedPlanId === plan.id
                        ? 'border-neutral-dark bg-neutral-dark text-white'
                        : 'border-primary/20 bg-white text-neutral-dark hover:border-primary/40'
                    }`}
                    onClick={() => setSelectedPlanId(plan.id)}
                    type="button"
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">{plan.name}</p>
                    <p className="mt-1 text-lg font-black">{formatPlanPrice(plan.pricePerMonth)}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide">
                      {plan.freeTrialDays}-day free trial
                    </p>
                  </button>
                ))}
              </div>

              {activePlan && (
                <ul className="mt-4 grid list-disc gap-1 pl-5 text-sm text-neutral-dark/80 md:grid-cols-3">
                  {activePlan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {mode === 'login' ? (
            <form className="mt-6 space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-dark" htmlFor="login-email">
                  {getRoleLabel(role)} Email
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
                Login as {getRoleLabel(role)}
              </button>

              <button
                className="w-full rounded-lg border border-primary/20 px-4 py-3 text-sm font-semibold text-neutral-dark transition-colors hover:bg-primary/5"
                onClick={() => onModeChange?.('register')}
                type="button"
              >
                Need an account? Register as {getRoleLabel(role)}
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

              {role === 'seller' && (
                <div>
                  <label className="mb-1 block text-sm font-semibold text-neutral-dark" htmlFor="register-business-name">
                    Shop / Business Name
                  </label>
                  <input
                    className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 focus:border-primary focus:outline-none"
                    id="register-business-name"
                    onChange={(event) =>
                      setRegisterForm((prev) => ({ ...prev, businessName: event.target.value }))
                    }
                    placeholder="Modern Surplus Studio"
                    type="text"
                    value={registerForm.businessName}
                  />
                </div>
              )}

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
                Create {getRoleLabel(role)} Account
              </button>

              <button
                className="w-full rounded-lg border border-primary/20 px-4 py-3 text-sm font-semibold text-neutral-dark transition-colors hover:bg-primary/5"
                onClick={() => onModeChange?.('login')}
                type="button"
              >
                Already have an account? Login as {getRoleLabel(role)}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

export default AuthSection

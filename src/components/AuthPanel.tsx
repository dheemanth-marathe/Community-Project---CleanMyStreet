import { useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { LogOut, UserRound, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

type AuthPanelProps = {
  session: Session | null
}

function AuthPanel({ session }: AuthPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setMessage('')
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (error) throw error

        setMessage('You have signed in successfully.')
        setIsOpen(false)
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })

        if (error) throw error

        if (data.session) {
          setMessage('Your account has been created and you are signed in.')
          setIsOpen(false)
        } else {
          setMessage(
            'Registration successful. Check your email to confirm your account before signing in.',
          )
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    setError('')
    setMessage('')

    const { error } = await supabase.auth.signOut()

    if (error) {
      setError(error.message)
      return
    }

    setIsOpen(false)
  }

  return (
    <>
      <button
        type="button"
        className="nav-track auth-trigger"
        onClick={() => {
          setIsOpen(true)
          setError('')
          setMessage('')
        }}
      >
        <UserRound size={17} />
        {session ? 'Account' : 'Sign in'}
      </button>

      {isOpen && (
        <div
          className="auth-modal-overlay"
          onClick={() => setIsOpen(false)}
        >
          <section
            className="auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="auth-modal-header">
              <div>
                <span className="section-kicker">CLEANMYSTREET</span>
                <h2 id="auth-title">
                  {session
                    ? 'Your account'
                    : mode === 'login'
                      ? 'Welcome back'
                      : 'Create an account'}
                </h2>
              </div>

              <button
                type="button"
                className="auth-close"
                aria-label="Close account panel"
                onClick={() => setIsOpen(false)}
              >
                <X size={21} />
              </button>
            </div>

            {session ? (
              <div className="auth-account">
                <p>You are signed in as:</p>
                <strong>{session.user.email}</strong>

                <button
                  type="button"
                  className="button button-primary auth-submit"
                  onClick={handleSignOut}
                >
                  <LogOut size={18} />
                  Sign out
                </button>
              </div>
            ) : (
              <>
                <p className="auth-description">
                  {mode === 'login'
                    ? 'Sign in to submit and track your sanitation complaints.'
                    : 'Create an account to report sanitation issues.'}
                </p>

                <form className="auth-form" onSubmit={handleSubmit}>
                  <label>
                    Email address
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </label>

                  <label>
                    Password
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="At least 6 characters"
                      autoComplete={
                        mode === 'login'
                          ? 'current-password'
                          : 'new-password'
                      }
                      minLength={6}
                      required
                    />
                  </label>

                  <button
                    type="submit"
                    className="button button-primary auth-submit"
                    disabled={loading}
                  >
                    {loading
                      ? 'Please wait...'
                      : mode === 'login'
                        ? 'Sign in'
                        : 'Create account'}
                </button>
                </form>

                <div className="auth-switch">
                  {mode === 'login'
                    ? "Don't have an account?"
                    : 'Already have an account?'}

                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'login' ? 'register' : 'login')
                      setError('')
                      setMessage('')
                    }}
                  >
                    {mode === 'login' ? 'Register' : 'Sign in'}
                  </button>
                </div>
              </>
            )}

            {message && (
              <p className="auth-message" role="status">
                {message}
              </p>
            )}

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
          </section>
        </div>
      )}
    </>
  )
}

export default AuthPanel

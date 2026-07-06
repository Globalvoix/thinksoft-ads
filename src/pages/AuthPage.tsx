import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSignIn, useSignUp } from '@clerk/clerk-react'
import { Aperture } from 'lucide-react'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn()
  const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        if (!signUpLoaded || !signUp) return
        const result = await signUp.create({ emailAddress: email, password })
        if (result.status === 'complete') {
          await setSignUpActive({ session: result.createdSessionId })
          navigate('/dashboard')
        }
      } else {
        if (!signInLoaded || !signIn) return
        const result = await signIn.create({ identifier: email, password })
        if (result.status === 'complete') {
          await setSignInActive({ session: result.createdSessionId })
          navigate('/dashboard')
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      if (isSignUp) {
        if (!signUpLoaded || !signUp) return
        await signUp.authenticateWithRedirect({ strategy: 'oauth_google', redirectUrl: '/dashboard', redirectUrlComplete: '/dashboard' })
      } else {
        if (!signInLoaded || !signIn) return
        await signIn.authenticateWithRedirect({ strategy: 'oauth_google', redirectUrl: '/dashboard', redirectUrlComplete: '/dashboard' })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (!signInLoaded || !signUpLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col font-sans text-[#202124]">
      <header className="p-4 sm:p-6">
        <div className="text-xl sm:text-[1.35rem] tracking-tight flex items-center gap-1.5 font-bold">
          <Aperture className="w-5 h-5" />
          Thinksoft <span className="font-normal text-gray-900">Ads</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-20">
        <div className="w-full max-w-[320px] flex flex-col items-center">
          <h1 className="text-2xl sm:text-3xl font-normal mb-8 text-[#202124] text-center">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>

          {error && (
            <div className="w-full mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full">
            <div className="w-full relative mb-4">
              <div
                className={`relative w-full border transition-all duration-200 ${
                  isFocused ? 'border-[#2563eb]' : 'border-gray-300'
                }`}
                style={{ borderRadius: '12px' }}
              >
                <label
                  className={`absolute left-3 transition-all duration-200 bg-white px-1 pointer-events-none ${
                    isFocused || email
                      ? '-top-2 text-xs text-[#2563eb]'
                      : 'top-2.5 text-sm text-gray-500'
                  }`}
                >
                  Email address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 outline-none bg-transparent text-sm"
                  style={{ borderRadius: '12px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="w-full relative mb-6">
              <div
                className={`relative w-full border transition-all duration-200 ${
                  isPasswordFocused ? 'border-[#2563eb]' : 'border-gray-300'
                }`}
                style={{ borderRadius: '12px' }}
              >
                <label
                  className={`absolute left-3 transition-all duration-200 bg-white px-1 pointer-events-none ${
                    isPasswordFocused || password
                      ? '-top-2 text-xs text-[#2563eb]'
                      : 'top-2.5 text-sm text-gray-500'
                  }`}
                >
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 outline-none bg-transparent text-sm"
                  style={{ borderRadius: '12px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#202124] text-white font-medium text-sm py-2.5 hover:bg-[#303134] transition-colors mb-5 disabled:opacity-50"
              style={{ borderRadius: '32px' }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'Continue'
              )}
            </button>
          </form>

          <p className="text-sm text-[#202124] mb-8">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  className="text-[#2563eb] hover:underline bg-transparent border-none p-0 cursor-pointer text-sm inline"
                  onClick={() => { setIsSignUp(false); setError('') }}
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  className="text-[#2563eb] hover:underline bg-transparent border-none p-0 cursor-pointer text-sm inline"
                  onClick={() => { setIsSignUp(true); setError('') }}
                >
                  Sign up
                </button>
              </>
            )}
          </p>

          <div className="w-full flex items-center mb-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">OR</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          <div className="w-full space-y-2.5">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center border border-gray-300 py-2.5 px-4 hover:bg-gray-50 transition-colors disabled:opacity-50"
              style={{ borderRadius: '32px' }}
            >
              <div className="w-5 flex justify-center">
                <GoogleIcon />
              </div>
              <span className="flex-1 text-center pr-5 text-sm font-medium text-[#202124]">Continue with Google</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-[13px] text-gray-500">
        <a href="#" className="hover:underline">Terms of Use</a>
        <span className="mx-3">|</span>
        <a href="#" className="hover:underline">Privacy Policy</a>
      </footer>
    </div>
  )
}

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

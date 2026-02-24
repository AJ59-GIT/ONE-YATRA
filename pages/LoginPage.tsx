
import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Map, Shield, Mail, Smartphone, Lock, User as UserIcon } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { FormErrorSummary } from '../components/FormErrorSummary';
import { loginWithEmail, registerWithEmail, checkPasswordStrength, validateEmail } from '../services/authService';
import { sendPasswordReset, sendOTP } from '../services/notificationService';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const ONBOARDING_SLIDES = [
  {
    icon: <Map className="h-12 w-12 text-brand-500" />,
    title: "All your rides in one place",
    desc: "Compare Cabs, Trains, Buses, and Flights instantly. No more app switching."
  },
  {
    icon: <Sparkles className="h-12 w-12 text-purple-500" />,
    title: "AI-Powered Pricing",
    desc: "Our Gemini engine predicts surges and finds the absolute best time to book."
  },
  {
    icon: <Shield className="h-12 w-12 text-green-500" />,
    title: "Secure & Eco-Friendly",
    desc: "Track your carbon footprint and choose the greenest route for Mother Earth."
  }
];

// Helper Icons
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" role="img" aria-label="Google Logo">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" role="img" aria-label="Apple Logo">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-.35-.16-1.07-.16-1.42 0-1.03.48-2.1.55-3.08-.4-1.95-1.89-3.23-5.35-1.34-8.08.95-1.36 2.65-2.23 4.54-2.19 1.14.03 2.17.65 2.85.65.67 0 1.93-.8 3.22-.68 1.1.05 1.93.38 2.62 1.39-2.35 1.41-1.96 4.98.5 5.96-.39 1.25-1.04 2.5-1.81 2.95zm-3.53-15.6c.39-2.05 2.13-3.61 4.14-3.68.22 2.22-1.98 4.41-4.14 3.68z"/>
  </svg>
);

type Step = 'SLIDES' | 'PHONE' | 'OTP' | 'EMAIL_LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<Step>('SLIDES');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');

  // Phone State
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);

  // Email/Register State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [passwordScore, setPasswordScore] = useState({ score: 0, message: '', color: 'bg-gray-200' });

  // Auto-advance slides
  useEffect(() => {
    if (step === 'SLIDES') {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % ONBOARDING_SLIDES.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [step]);

  // --- Handlers ---

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    if (phone.length === 10) {
      setIsLoading(true);
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      sendOTP(phone, generatedOtp);
      setTimeout(() => {
        setIsLoading(false);
        setStep('OTP');
      }, 1000);
    } else {
        setFormErrors({ phone: "Please enter a valid 10-digit number" });
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    if (otp.some(d => !d)) {
        setFormErrors({ otp: "Please enter the full verification code" });
        return;
    }
    setIsLoading(true);
    localStorage.setItem('oneyatra_current_user', JSON.stringify({ name: 'Mobile User', email: `+91 ${phone}` }));
    setTimeout(() => {
      onLoginSuccess();
    }, 1500);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    
    if (!email) { setFormErrors(prev => ({...prev, email: "Email is required"})); return; }
    if (!password) { setFormErrors(prev => ({...prev, password: "Password is required"})); return; }

    setIsLoading(true);
    const result = await loginWithEmail(email, password);
    setIsLoading(false);
    
    if (result.success) {
      onLoginSuccess();
    } else {
      setFormErrors({ general: result.message || 'Login failed' });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    let hasError = false;

    if (!fullName) { setFormErrors(prev => ({...prev, fullName: "Name is required"})); hasError = true; }
    if (!email) { setFormErrors(prev => ({...prev, email: "Email is required"})); hasError = true; }
    
    if (password !== confirmPassword) {
      setFormErrors(prev => ({...prev, confirmPassword: "Passwords do not match"}));
      hasError = true;
    }
    if (passwordScore.score < 2) {
      setFormErrors(prev => ({...prev, password: "Password is too weak"}));
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);
    const result = await registerWithEmail(email, password, fullName);
    setIsLoading(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setFormErrors({ general: result.message || 'Registration failed' });
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    setPasswordScore(checkPasswordStrength(val));
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    if (!validateEmail(email)) {
      setFormErrors({ email: "Please enter a valid email address" });
      return;
    }
    setIsLoading(true);
    await sendPasswordReset(email);
    setIsLoading(false);
    setSuccessMsg("If an account exists, a recovery link has been sent to your email.");
  };

  const renderSlides = () => (
    <div className="text-center lg:text-left space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:hidden h-64 flex items-center justify-center">
         <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700">
            <div className="flex justify-center mb-4">{ONBOARDING_SLIDES[currentSlide].icon}</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{ONBOARDING_SLIDES[currentSlide].title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{ONBOARDING_SLIDES[currentSlide].desc}</p>
         </div>
      </div>

      <div className="hidden lg:block space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Get Started</h2>
        <p className="text-gray-500 dark:text-gray-400">Join millions of travelers saving time & money.</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => alert("Google OAuth Mock")}
            className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <GoogleIcon />
            <span className="ml-2">Google</span>
          </button>
          <button 
            onClick={() => alert("Apple Auth Mock")}
            className="flex-1 flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm bg-black text-white font-medium hover:bg-gray-900 transition-colors"
          >
            <AppleIcon />
            <span className="ml-2">Apple</span>
          </button>
        </div>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-200 dark:border-slate-700"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-semibold">or continue with</span>
          <div className="flex-grow border-t border-gray-200 dark:border-slate-700"></div>
        </div>

        <Button size="lg" className="w-full text-lg group" onClick={() => setStep('PHONE')}>
          <Smartphone className="mr-2 h-5 w-5" />
          Continue with Phone
          <ArrowRight className="ml-auto h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </Button>
        
        <Button size="lg" variant="outline" className="w-full text-lg group bg-white dark:bg-transparent" onClick={() => setStep('EMAIL_LOGIN')}>
          <Mail className="mr-2 h-5 w-5" />
          Continue with Email
          <ArrowRight className="ml-auto h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </Button>
      </div>
      
      <p className="text-xs text-center lg:text-left text-gray-400 mt-4">
        By continuing, you agree to our Terms & Privacy Policy.
      </p>
    </div>
  );

  const renderPhoneFlow = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {step === 'PHONE' ? "What's your number?" : "Verify Phone"}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
        {step === 'PHONE' ? "We'll send you a verification code." : `Code sent to +91 ${phone}`}
      </p>

      {step === 'PHONE' ? (
        <form onSubmit={handlePhoneSubmit}>
          <Input
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              if(val.length <= 10) setPhone(val);
            }}
            placeholder="98765 43210"
            error={formErrors.phone}
            autoFocus
          />
          <Button type="submit" className="w-full mt-4" size="lg" disabled={phone.length < 10 || isLoading} isLoading={isLoading}>
            Send OTP
          </Button>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit}>
          <div className="flex gap-3 justify-between mb-8">
             {otp.map((digit, idx) => (
               <input
                 key={idx}
                 id={`otp-${idx}`}
                 type="text"
                 maxLength={1}
                 value={digit}
                 onChange={(e) => handleOtpChange(idx, e.target.value)}
                 className="w-14 h-14 text-center text-2xl font-bold border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all high-contrast:border-2"
                 aria-label={`Digit ${idx + 1}`}
               />
             ))}
          </div>
          {formErrors.otp && <p className="text-red-600 text-sm mb-4 font-bold">{formErrors.otp}</p>}
          <Button type="submit" className="w-full" size="lg" disabled={otp.some(d => !d) || isLoading} isLoading={isLoading}>
            Verify & Login
          </Button>
          <div className="mt-4 text-center">
            <button type="button" onClick={() => sendOTP(phone, '1234')} className="text-sm text-brand-600 font-bold hover:text-brand-700 underline">Resend Code</button>
          </div>
        </form>
      )}

      <button onClick={() => {setStep(step === 'OTP' ? 'PHONE' : 'SLIDES'); setFormErrors({});}} className="mt-6 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 w-full text-center underline">
        {step === 'OTP' ? "Change Number" : "Go Back"}
      </button>
    </div>
  );

  const renderEmailLogin = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">Enter your credentials to continue.</p>
      
      <FormErrorSummary errors={formErrors} title="Login Failed" />

      <form onSubmit={handleEmailLogin} className="space-y-1">
        <Input 
          label="Email Address"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          error={formErrors.email}
        />
        <Input
          label="Password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          error={formErrors.password}
        />
        <div className="text-right pb-4">
             <button type="button" onClick={() => {setFormErrors({}); setSuccessMsg(''); setStep('FORGOT_PASSWORD')}} className="text-xs text-brand-600 hover:text-brand-700 underline font-medium">Forgot Password?</button>
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
           Log In
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-500 dark:text-gray-400">Don't have an account? </span>
        <button onClick={() => {setFormErrors({}); setStep('REGISTER')}} className="font-bold text-brand-600 hover:text-brand-700 underline">Sign Up</button>
      </div>
      <button onClick={() => setStep('SLIDES')} className="mt-4 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 w-full text-center underline">
        Go Back
      </button>
    </div>
  );

  const renderRegister = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Join OneYatra for smart travel.</p>

      <FormErrorSummary errors={formErrors} title="Registration Failed" />

      <form onSubmit={handleRegister} className="space-y-1">
        <Input
          label="Full Name"
          type="text"
          required
          placeholder="John Doe"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          error={formErrors.fullName}
        />
        <Input 
          label="Email Address"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          error={formErrors.email}
        />
        <Input 
          label="Password"
          type="password"
          required
          placeholder="Create password"
          value={password}
          onChange={e => handlePasswordChange(e.target.value)}
          error={formErrors.password}
          helperText={password && `Strength: ${passwordScore.message}`}
        />
        {/* Password Strength Visual */}
        {password && (
            <div className="mb-4 -mt-2 flex items-center gap-2">
               <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden border border-gray-200 dark:border-slate-600">
                  <div className={`h-full transition-all duration-300 ${passwordScore.color}`} style={{ width: `${(passwordScore.score / 4) * 100}%` }}></div>
               </div>
            </div>
        )}

        <Input 
          label="Confirm Password"
          type="password"
          required
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          error={formErrors.confirmPassword}
        />

        <Button type="submit" className="w-full mt-4" size="lg" isLoading={isLoading}>
           Sign Up
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-500 dark:text-gray-400">Already have an account? </span>
        <button onClick={() => {setFormErrors({}); setStep('EMAIL_LOGIN')}} className="font-bold text-brand-600 hover:text-brand-700 underline">Log In</button>
      </div>
      <button onClick={() => setStep('SLIDES')} className="mt-4 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 w-full text-center underline">
        Go Back
      </button>
    </div>
  );

  const renderForgotPassword = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="text-center mb-6">
         <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 dark:bg-brand-900 rounded-full mb-4">
            <Lock className="h-6 w-6 text-brand-600 dark:text-brand-400" />
         </div>
         <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
         <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">We'll send you instructions to reset it.</p>
      </div>

      {successMsg ? (
        <div className="text-center">
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm border-l-4 border-green-500 flex flex-col items-center">
             <div className="font-bold mb-1">Check your email</div>
             {successMsg}
          </div>
          <Button onClick={() => setStep('EMAIL_LOGIN')} className="w-full">Return to Login</Button>
        </div>
      ) : (
        <>
          <FormErrorSummary errors={formErrors} />
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={formErrors.email}
            />
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Send Reset Link
            </Button>
          </form>
          <button onClick={() => setStep('EMAIL_LOGIN')} className="mt-6 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 w-full text-center underline">
             Back to Login
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex transition-colors duration-300">
      {/* Left Side - Visuals (Hidden on small mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white relative overflow-hidden flex-col justify-between p-12">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-8">
             <div className="bg-brand-500 p-2 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
             </div>
             <span className="text-2xl font-bold tracking-tight">OneYatra</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            The Super App for <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-orange-300">
              Indian Mobility.
            </span>
          </h1>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-600 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-600 rounded-full blur-3xl opacity-20"></div>
        
        <div className="z-10 space-y-8">
           {ONBOARDING_SLIDES.map((slide, idx) => (
             <div 
               key={idx} 
               className={`transition-all duration-700 transform ${idx === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-10 hidden'}`}
             >
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 max-w-md">
                   {slide.title}
                   <p className="text-slate-300 text-sm mt-2">{slide.desc}</p>
                </div>
             </div>
           ))}
           <div className="flex gap-2">
             {ONBOARDING_SLIDES.map((_, idx) => (
               <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-brand-500' : 'w-2 bg-slate-700'}`} />
             ))}
           </div>
        </div>
      </div>

      {/* Right Side - Interaction */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-12 lg:px-24 relative py-12 lg:py-0">
         {step === 'SLIDES' && (
           <div className="block lg:hidden absolute top-0 left-0 right-0 h-1/2 bg-slate-50 dark:bg-slate-800 -z-10"></div>
         )}

         {/* Mobile Header (Only visible on Step 1 mobile) */}
         <div className="lg:hidden mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-brand-500 p-2 rounded-lg shadow-lg shadow-brand-500/30">
                 <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">OneYatra</h2>
         </div>

         <div className="max-w-sm mx-auto w-full">
            {step === 'SLIDES' && renderSlides()}
            {(step === 'PHONE' || step === 'OTP') && renderPhoneFlow()}
            {step === 'EMAIL_LOGIN' && renderEmailLogin()}
            {step === 'REGISTER' && renderRegister()}
            {step === 'FORGOT_PASSWORD' && renderForgotPassword()}
         </div>
      </div>
    </div>
  );
};

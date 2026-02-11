import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionNamespace, supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, CheckCircle2, Eye, EyeOff, ShieldCheck, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { z } from 'zod';
import PasswordSetup from '@/components/PasswordSetup';
import { Alert, AlertDescription } from '@/components/ui/alert';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const createSignupSchema = (isVendor: boolean) => {
  const baseSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    phone: z.string().optional(),
  });

  if (isVendor) {
    return baseSchema.extend({
      businessName: z.string().min(2, 'Business name must be at least 2 characters'),
      businessDescription: z.string().optional(),
      businessAddress: z.string().optional(),
      gstin: z.string().optional(),
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    });
  }

  return baseSchema.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
};

const Auth = () => {
  const {
    user,
    userRoles,
    signIn,
    signUp,
    signInWithGoogle,
    needsPasswordSetup,
    checkEmailAvailable,
    sendSignupOtp,
    verifySignupOtp,
    updatePassword,
    signOut,
    signOutSilent,
  } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [tabValue, setTabValue] = useState<'login' | 'signup'>('login');
  const [isVisible, setIsVisible] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    businessName: '',
    businessDescription: '',
    businessAddress: '',
    gstin: '',
  });
  const [otpCode, setOtpCode] = useState('');
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [approvalPending, setApprovalPending] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordAutofilled, setIsPasswordAutofilled] = useState(false);

  const isRegularUser = sessionNamespace === 'user';
  const isVendor = sessionNamespace === 'vendor';

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!user) return;
    if (awaitingOtp) return;
    if (needsPasswordSetup) return;

    if (sessionNamespace === 'admin') {
      const isAdmin = userRoles.includes('admin');
      if (isAdmin) navigate('/admin');
      return;
    }
    if (sessionNamespace === 'vendor') {
      const isVendor = userRoles.includes('vendor');
      if (isVendor) navigate('/vendor');
      return;
    }
    navigate('/home');
  }, [user, userRoles, navigate, needsPasswordSetup, awaitingOtp]);

  useEffect(() => {
    if (awaitingOtp && user) {
      signOutSilent();
    }
  }, [awaitingOtp, user, signOutSilent]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signInWithGoogle();
    setGoogleLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse(loginData);
    if (!result.success) {
      const fieldErrors: any = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    // Removed the broken pre-check on profiles table.
    // We now rely on the post-login check below.

    const { error } = await signIn(loginData.email, loginData.password);

    if (!error && isVendor) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: vendor } = await supabase
          .from('vendors')
          .select('is_approved, is_active')
          .eq('user_id', user.id)
          .maybeSingle();

        if (vendor && !vendor.is_approved) {
          await signOut();
          setErrors({
            email: 'Your vendor account is pending approval. Please wait for admin approval before logging in.'
          });
          setLoading(false);
          return;
        }
        if (vendor && !vendor.is_active) {
          await signOut();
          setErrors({
            email: 'Your vendor account has been deactivated. Please contact support.'
          });
          setLoading(false);
          return;
        }
      }
    }

    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const signupSchema = createSignupSchema(isVendor);
    const result = signupSchema.safeParse(signupData);
    if (!result.success) {
      const fieldErrors: any = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (isRegularUser) {
      setTabValue('signup');
      setLoading(true);
      const available = await checkEmailAvailable(signupData.email);
      if (!available) {
        setErrors({ email: 'Email already in use' });
        setLoading(false);
        return;
      }
      const { error } = await sendSignupOtp(signupData.email, signupData.fullName, signupData.phone, signupData.password);
      setLoading(false);
      if (error) {
        const message = (error as any)?.message?.toLowerCase?.() || '';
        if ((error as any)?.code === 'email_exists' || message.includes('already')) {
          setErrors({ email: 'This email is already registered. Please sign in instead.' });
          return;
        }
      } else {
        setAwaitingOtp(true);
      }
    } else if (isVendor) {
      setLoading(true);
      const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
        email: signupData.email.trim().toLowerCase(),
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/vendor/auth`,
          data: {
            full_name: signupData.fullName,
            phone: signupData.phone || null
          },
        }
      });

      if (signUpError) {
        const message = (signUpError as any)?.message?.toLowerCase?.() || '';
        if (message.includes('already') && (message.includes('registered') || message.includes('exist'))) {
          setErrors({ email: 'This email is already registered. Please sign in instead.' });
        } else {
          setErrors({ email: signUpError.message });
        }
        setLoading(false);
        return;
      }

      if (signUpData.user) {
        const { error: vendorError } = await supabase
          .from('vendors')
          .insert({
            user_id: signUpData.user.id,
            business_name: signupData.businessName.trim(),
            business_description: signupData.businessDescription?.trim() || null,
            business_address: signupData.businessAddress?.trim() || null,
            gstin: signupData.gstin?.trim() || null,
            is_approved: false,
            is_active: true,
          });

        if (vendorError) {
          console.error('Error creating vendor record:', vendorError);
          setErrors({ email: 'Failed to create vendor account. Please try again.' });
          setLoading(false);
          return;
        }

        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: signUpData.user.id, role: 'vendor' });

        if (roleError && !roleError.message?.includes('duplicate')) {
          console.error('Error assigning vendor role:', roleError);
        }

        await signOut();
        setApprovalPending(true);
        setLoading(false);
      } else {
        setErrors({ email: 'Failed to create account. Please try again.' });
        setLoading(false);
      }
    } else {
      setLoading(true);
      await signUp(signupData.email, signupData.password, signupData.fullName, signupData.phone);
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!otpCode || otpCode.length < 6) {
      setErrors({ otp: 'Enter the 6-digit code sent to your email' });
      return;
    }

    setLoading(true);
    const { error } = await verifySignupOtp(signupData.email, otpCode);
    setLoading(false);
    if (!error) {
      await signOutSilent();
      setAwaitingOtp(false);
      setOtpCode('');
      setTabValue('login');
      navigate('/auth', { replace: true });
    }
  };

  if (user && needsPasswordSetup) {
    return <PasswordSetup />;
  }

  if (approvalPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-24 -left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply blur-2xl opacity-25 animate-blob"></div>
          <div className="absolute top-40 -right-10 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply blur-2xl opacity-25 animate-blob animation-delay-2000"></div>
        </div>
        <Card className="w-full max-w-md shadow-2xl border-0 relative z-10 backdrop-blur-sm bg-white/90">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="flex justify-center mb-2">
              <div className="p-4 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              Registration Successful!
            </CardTitle>
            <CardDescription className="text-base">
              Your vendor account has been created successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-emerald-200 bg-emerald-50">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-sm">
                <strong>Pending Approval:</strong> Your vendor account is pending admin approval.
                You will be able to log in once your account is approved.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => {
                setApprovalPending(false);
                setTabValue('login');
                setSignupData({
                  email: '',
                  password: '',
                  confirmPassword: '',
                  fullName: '',
                  phone: '',
                  businessName: '',
                  businessDescription: '',
                  businessAddress: '',
                  gstin: '',
                });
              }}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-24 -left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply blur-2xl opacity-25 animate-blob"></div>
        <div className="absolute top-40 -right-10 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply blur-2xl opacity-25 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply blur-2xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className={`relative z-10 w-full max-w-md transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/logo.png" alt="Kash.it" className="h-12 w-12 object-contain" />
            <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              Kash.it
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span>{isVendor ? 'Vendor Portal' : 'Welcome back'}</span>
          </div>
        </div>

        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90">
          <CardHeader className="space-y-2 text-center pb-6">
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full">
                <Store className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {isVendor ? 'Vendor Registration' : 'Sign in to continue'}
            </CardTitle>
            <CardDescription>
              {isVendor ? 'Join our marketplace' : 'Access your account'}
            </CardDescription>
            {sessionNamespace === 'vendor' && user && !userRoles.includes('vendor') && (
              <div className="mt-2 text-sm text-destructive">This account does not have the vendor role.</div>
            )}
            {sessionNamespace === 'admin' && user && !userRoles.includes('admin') && (
              <div className="mt-2 text-sm text-destructive">This account does not have the admin role.</div>
            )}
          </CardHeader>
          <CardContent>
            <Tabs value={tabValue} onValueChange={(value) => setTabValue(value as 'login' | 'signup')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
                <TabsTrigger value="login" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-500 data-[state=active]:text-white">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-500 data-[state=active]:text-white">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        className="h-11 pr-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white shadow-lg"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  {isRegularUser && (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-gray-500">Or continue with</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11 border-2 border-gray-300 hover:border-emerald-500 hover:bg-white transition-all duration-200 text-gray-700 hover:text-emerald-600"
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading}
                      >
                        {googleLoading ? 'Signing in...' : (
                          <>
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                              <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                              />
                              <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                              />
                              <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                              />
                              <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                              />
                            </svg>
                            Sign in with Google
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </form>
              </TabsContent>

              <TabsContent value="signup">
                {!awaitingOtp ? (
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        autoComplete="name"
                        placeholder="John Doe"
                        value={signupData.fullName}
                        onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                        required
                        className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                      {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        required
                        className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Phone (Optional)</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+1234567890"
                        value={signupData.phone}
                        onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                        className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                    {isVendor && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="signup-business-name">Business Name *</Label>
                          <Input
                            id="signup-business-name"
                            type="text"
                            placeholder="My Business"
                            value={signupData.businessName}
                            onChange={(e) => setSignupData({ ...signupData, businessName: e.target.value })}
                            required
                            className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                          />
                          {errors.businessName && <p className="text-sm text-destructive">{errors.businessName}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-business-description">Business Description (Optional)</Label>
                          <Input
                            id="signup-business-description"
                            type="text"
                            placeholder="Brief description"
                            value={signupData.businessDescription}
                            onChange={(e) => setSignupData({ ...signupData, businessDescription: e.target.value })}
                            className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-business-address">Business Address (Optional)</Label>
                          <Input
                            id="signup-business-address"
                            type="text"
                            placeholder="Your business address"
                            value={signupData.businessAddress}
                            onChange={(e) => setSignupData({ ...signupData, businessAddress: e.target.value })}
                            className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-gstin">GSTIN (Optional)</Label>
                          <Input
                            id="signup-gstin"
                            type="text"
                            placeholder="GSTIN number"
                            value={signupData.gstin}
                            onChange={(e) => setSignupData({ ...signupData, gstin: e.target.value })}
                            className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                          />
                        </div>
                      </>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        autoComplete="new-password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        required
                        className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        autoComplete="new-password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        required
                        className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                      {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                    </div>
                    {isVendor && (
                      <Alert className="border-emerald-200 bg-emerald-50">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <AlertDescription className="text-xs">
                          After registration, your account will be pending admin approval.
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button
                      type="submit"
                      className="w-full h-11 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white shadow-lg"
                      disabled={loading}
                    >
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                    {isRegularUser && (
                      <>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-300" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">Or continue with</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-11 border-gray-300 hover:bg-gray-50"
                          onClick={handleGoogleSignIn}
                          disabled={googleLoading}
                        >
                          {googleLoading ? 'Signing in...' : (
                            <>
                              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path
                                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                  fill="#4285F4"
                                />
                                <path
                                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                  fill="#34A853"
                                />
                                <path
                                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                  fill="#FBBC05"
                                />
                                <path
                                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                  fill="#EA4335"
                                />
                              </svg>
                              Sign up with Google
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp-code">Enter OTP sent to {signupData.email}</Label>
                      <Input
                        id="otp-code"
                        type="text"
                        inputMode="numeric"
                        placeholder="6-digit code"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        required
                        className="h-11 text-center text-2xl tracking-widest border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                      {errors.otp && <p className="text-sm text-destructive">{errors.otp}</p>}
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-11 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white shadow-lg"
                      disabled={loading}
                    >
                      {loading ? 'Verifying...' : 'Verify & Create Account'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        signOutSilent();
                        setAwaitingOtp(false);
                        setTabValue('signup');
                      }}
                    >
                      Change email
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={loading}
                      onClick={async () => {
                        setLoading(true);
                        const { error } = await sendSignupOtp(signupData.email, signupData.fullName, signupData.phone, signupData.password);
                        setLoading(false);
                        if (error) return;
                      }}
                    >
                      Resend OTP
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>By continuing, you agree to our Terms & Privacy Policy</p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        .animate-blob { animation: blob 10s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default Auth;

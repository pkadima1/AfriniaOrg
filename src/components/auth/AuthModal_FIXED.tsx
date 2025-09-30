import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2, LogIn, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

/**
 * Authentication modal component for login and registration
 */
export function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  const [resetForm, setResetForm] = useState({
    email: '',
  });

  const [showResetForm, setShowResetForm] = useState(false);

  /**
   * Handle login form submission
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signIn(loginForm.email, loginForm.password);

      if (error) {
        setError(error.message);
      } else {
        toast({
          title: 'Success',
          description: 'Successfully signed in!',
        });
        onClose();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle registration form submission
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords match
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (registerForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp(
        registerForm.email,
        registerForm.password,
        registerForm.fullName
      );

      if (error) {
        setError(error.message);
      } else {
        toast({
          title: 'Success',
          description: 'Account created! Please check your email to verify your account.',
        });
        onClose();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle password reset
   */
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await resetPassword(resetForm.email);

      if (error) {
        setError(error.message);
      } else {
        toast({
          title: 'Success',
          description: 'Password reset email sent! Check your inbox.',
        });
        setShowResetForm(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/80 backdrop-blur-sm py-8 px-4 overflow-y-auto">
      <div className="w-full max-w-md mx-auto my-auto min-h-0">
        <Card className="bg-gray-900 border-gray-700 shadow-2xl mx-auto">
          <CardHeader className="text-center pb-4 pt-6">
            <CardTitle className="text-2xl text-white mb-2">
              {showResetForm ? 'Reset Password' : activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <p className="text-sm text-gray-400">
              {showResetForm 
                ? 'Enter your email to receive a password reset link' 
                : activeTab === 'login' 
                  ? 'Sign in to your account' 
                  : 'Create a new account to get started'
              }
            </p>
          </CardHeader>
          
          <CardContent className="px-6 pb-6">
            {error && (
              <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 mb-4">
                <AlertDescription className="text-red-300">{error}</AlertDescription>
              </Alert>
            )}

            {showResetForm ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-white text-sm font-medium">Email Address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetForm.email}
                    onChange={(e) =>
                      setResetForm(prev => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="Enter your email address"
                    required
                    disabled={isLoading}
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 h-11"
                  />
                  <p className="text-xs text-gray-400">
                    We'll send you a link to reset your password
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Send Reset Email
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-gray-400 hover:text-white h-11"
                    onClick={() => setShowResetForm(false)}
                    disabled={isLoading}
                  >
                    Back to Sign In
                  </Button>
                </div>
              </form>
            ) : (
              <div className="w-full space-y-6">
                {/* Custom Tab Navigation */}
                <div className="flex w-full bg-gray-800 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'login'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'register'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </button>
                </div>

                {/* Login Form */}
                {activeTab === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-white text-sm font-medium">Email Address</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginForm.email}
                        onChange={(e) =>
                          setLoginForm(prev => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="Enter your email address"
                        required
                        disabled={isLoading}
                        className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-white text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          value={loginForm.password}
                          onChange={(e) =>
                            setLoginForm(prev => ({ ...prev, password: e.target.value }))
                          }
                          placeholder="Enter your password"
                          required
                          disabled={isLoading}
                          className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 h-11 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-gray-400 hover:text-white"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <LogIn className="w-4 h-4 mr-2" />
                        )}
                        Sign In
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full text-sm text-gray-400 hover:text-white"
                        onClick={() => setShowResetForm(true)}
                        disabled={isLoading}
                      >
                        Forgot your password?
                      </Button>
                    </div>
                  </form>
                )}

                {/* Register Form */}
                {activeTab === 'register' && (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name" className="text-white text-sm font-medium">Full Name</Label>
                      <Input
                        id="register-name"
                        type="text"
                        value={registerForm.fullName}
                        onChange={(e) =>
                          setRegisterForm(prev => ({ ...prev, fullName: e.target.value }))
                        }
                        placeholder="Enter your full name"
                        disabled={isLoading}
                        className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-white text-sm font-medium">Email Address</Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerForm.email}
                        onChange={(e) =>
                          setRegisterForm(prev => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="Enter your email address"
                        required
                        disabled={isLoading}
                        className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-white text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? 'text' : 'password'}
                          value={registerForm.password}
                          onChange={(e) =>
                            setRegisterForm(prev => ({ ...prev, password: e.target.value }))
                          }
                          placeholder="Create a strong password"
                          required
                          disabled={isLoading}
                          minLength={6}
                          className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 h-11 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-gray-400 hover:text-white"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-400">Minimum 6 characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password" className="text-white text-sm font-medium">Confirm Password</Label>
                      <Input
                        id="register-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={registerForm.confirmPassword}
                        onChange={(e) =>
                          setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))
                        }
                        placeholder="Confirm your password"
                        required
                        disabled={isLoading}
                        minLength={6}
                        className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 h-11"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 mt-6"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-2" />
                      )}
                      Create Account
                    </Button>
                  </form>
                )}
              </div>
            )}

            <div className="text-center pt-4 border-t border-gray-700 mt-6">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={isLoading}
                className="text-sm text-gray-400 hover:text-white"
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
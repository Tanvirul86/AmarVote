'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ShieldIcon from '@/components/shared/ShieldIcon';
import { User, Lock, ArrowLeft, Users, AlertTriangle, Shield } from 'lucide-react';

const BrandMark = () => (
  <div className="flex items-center justify-center gap-3 mb-6">
    <Image src="/images/logo-AmarVote.png" alt="AmarVote" width={56} height={56} className="rounded-xl shadow-sm" />
    <div className="text-left">
      <p className="text-lg font-semibold text-gray-900">AmarVote</p>
      <p className="text-xs text-gray-500">Secure Election Monitoring</p>
    </div>
  </div>
);

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 2FA states
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [expiresIn, setExpiresIn] = useState(300);
  const [attemptsLeft, setAttemptsLeft] = useState(5);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Call login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          role: role.charAt(0).toUpperCase() + role.slice(1), // Capitalize role
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Log failed login attempt
        await fetch('/api/audit-logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: username,
            action: 'LOGIN_FAILED',
            details: `Failed login attempt for username: ${username} (role: ${role})`,
            ip: 'Client',
          }),
        });

        setError(result.error || 'Invalid credentials. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Check if 2FA is required
      if (result.user.requiresVerification) {
        setUserId(result.user.userId);
        setUserName(result.user.name);
        setUserPhone(result.user.phone);
        setExpiresIn(result.expiresIn || 300);
        setShowVerification(true);
        setIsSubmitting(false);
        return;
      }

      // If no 2FA required (shouldn't happen with new flow), complete login
      completeLogin(result.user);
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/verify-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          code: verificationCode,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Invalid verification code');
        if (result.attemptsLeft !== undefined) {
          setAttemptsLeft(result.attemptsLeft);
        }
        setIsSubmitting(false);
        return;
      }

      // Verification successful - complete login
      completeLogin(result.user);
    } catch (error) {
      console.error('Verification error:', error);
      setError('An error occurred during verification. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/verify-sms', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (response.ok) {
        setVerificationCode('');
        setAttemptsLeft(5);
        setExpiresIn(result.expiresIn || 300);
        setError('');
        alert('New verification code sent to your phone');
      } else {
        setError(result.error || 'Failed to resend code');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setError('Failed to resend code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeLogin = async (user: any) => {
    const displayRole = role === 'admin' ? 'BEC Admin' : role === 'police' ? 'Law Enforcement' : 'Presiding Officer';

    // Store current userId for profile lookup
    localStorage.setItem('currentUserId', user.id);

    // Store user display info
    localStorage.setItem('user', JSON.stringify({
      name: user.name,
      role: displayRole,
      avatar: user.avatar || '',
      userId: user.id,
      phone: user.phone || '',
      email: user.email
    }));

    // Store current user for audit logging
    localStorage.setItem('currentUser', JSON.stringify({
      username: user.username || user.email,
      role: role
    }));

    const redirectMap = {
      admin: '/dashboard/admin',
      officer: '/dashboard/officer',
      police: '/dashboard/police'
    };

    router.push(redirectMap[role as keyof typeof redirectMap] || '/');
  };

  // Law Enforcement Portal Design (Red)
  if (role === 'police') {
    // Show verification screen if needed
    if (showVerification) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <BrandMark />
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-red-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <Shield className="w-12 h-12 text-white" strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-bold text-red-700 mb-2">Verify Your Identity</h1>
                <p className="text-gray-600">Enter the 6-digit code sent to</p>
                <p className="font-semibold text-gray-800 mt-1">{userPhone}</p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-5">
                <div>
                  <label htmlFor="verificationCode" className="block text-gray-700 font-medium mb-2">
                    Verification Code
                  </label>
                  <input
                    id="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {attemptsLeft} attempts remaining
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || verificationCode.length !== 6}
                  className="w-full bg-red-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-red-700 transition-colors duration-200 shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify & Login'}
                </button>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </div>
                )}

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isSubmitting}
                    className="text-red-600 hover:text-red-700 font-medium text-sm disabled:text-gray-400"
                  >
                    Resend Code
                  </button>
                  <span className="mx-2 text-gray-400">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowVerification(false);
                      setVerificationCode('');
                      setError('');
                    }}
                    className="text-gray-600 hover:text-gray-700 font-medium text-sm"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <BrandMark />
          {/* Law Enforcement Portal Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
            {/* Icon and Header */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-red-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Users className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl font-bold text-red-700 mb-2">Law Enforcement Portal</h1>
              <p className="text-gray-600">Incident Response & Alert Management</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Service ID / Username Field */}
              <div>
                <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
                  Service ID / Username
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="rahman"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="rahman123"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-red-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-red-700 transition-colors duration-200 shadow-md"
              >
                Login to Law Enforcement Portal
              </button>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}
            </form>

            {/* Not Registered Section */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 mb-4">Not registered?</p>
              <Link href="/register">
                <button className="w-full border-2 border-red-600 text-red-600 font-semibold py-3 px-4 rounded-xl hover:bg-red-50 transition-all duration-200">
                  Apply for Law Enforcement Portal Access
                </button>
              </Link>
            </div>

            {/* Emergency Response Access */}
            <div className="mt-6 text-center">
              <Link href="#" className="inline-flex items-center text-gray-600 hover:text-red-600 transition-colors duration-200">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Emergency Response Access
              </Link>
            </div>
          </div>

          {/* Back to Home Link */}
          <div className="text-center">
            <Link 
              href="/" 
              className="inline-flex items-center text-gray-700 hover:text-red-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // BEC Admin Portal Design (Green - matching Law Enforcement style)
  if (role === 'admin') {
    // Show verification screen if needed
    if (showVerification) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <BrandMark />
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-emerald-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <Shield className="w-12 h-12 text-white" strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-bold text-emerald-700 mb-2">Verify Your Identity</h1>
                <p className="text-gray-600">Enter the 6-digit code sent to</p>
                <p className="font-semibold text-gray-800 mt-1">{userPhone}</p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-5">
                <div>
                  <label htmlFor="verificationCode" className="block text-gray-700 font-medium mb-2">
                    Verification Code
                  </label>
                  <input
                    id="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {attemptsLeft} attempts remaining
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || verificationCode.length !== 6}
                  className="w-full bg-emerald-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-emerald-700 transition-colors duration-200 shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify & Login'}
                </button>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </div>
                )}

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isSubmitting}
                    className="text-emerald-600 hover:text-emerald-700 font-medium text-sm disabled:text-gray-400"
                  >
                    Resend Code
                  </button>
                  <span className="mx-2 text-gray-400">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowVerification(false);
                      setVerificationCode('');
                      setError('');
                    }}
                    className="text-gray-600 hover:text-gray-700 font-medium text-sm"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <BrandMark />
          {/* BEC Admin Portal Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
            {/* Icon and Header */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-emerald-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Shield className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl font-bold text-emerald-700 mb-2">BEC Admin Portal</h1>
              <p className="text-gray-600">System Management & Monitoring</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Admin ID / Username Field */}
              <div>
                <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
                  Admin ID / Username
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="admin123"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-emerald-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-emerald-700 transition-colors duration-200 shadow-md"
              >
                Login to BEC Admin Portal
              </button>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}
            </form>

            {/* Support Section */}
            <div className="mt-6 text-center">
              <Link href="#" className="inline-flex items-center text-gray-600 hover:text-emerald-600 transition-colors duration-200">
                <Shield className="w-4 h-4 mr-2" />
                Admin Support
              </Link>
            </div>
          </div>

          {/* Back to Home Link */}
          <div className="text-center">
            <Link 
              href="/" 
              className="inline-flex items-center text-gray-700 hover:text-emerald-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Presiding Officer Portal Design (Blue - matching Law Enforcement style)
  if (role === 'officer') {
    // Show verification screen if needed
    if (showVerification) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <BrandMark />
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <Shield className="w-12 h-12 text-white" strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-bold text-blue-700 mb-2">Verify Your Identity</h1>
                <p className="text-gray-600">Enter the 6-digit code sent to</p>
                <p className="font-semibold text-gray-800 mt-1">{userPhone}</p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-5">
                <div>
                  <label htmlFor="verificationCode" className="block text-gray-700 font-medium mb-2">
                    Verification Code
                  </label>
                  <input
                    id="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {attemptsLeft} attempts remaining
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || verificationCode.length !== 6}
                  className="w-full bg-blue-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify & Login'}
                </button>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </div>
                )}

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isSubmitting}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:text-gray-400"
                  >
                    Resend Code
                  </button>
                  <span className="mx-2 text-gray-400">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowVerification(false);
                      setVerificationCode('');
                      setError('');
                    }}
                    className="text-gray-600 hover:text-gray-700 font-medium text-sm"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <BrandMark />
          {/* Presiding Officer Portal Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
            {/* Icon and Header */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Users className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl font-bold text-blue-700 mb-2">Presiding Officer Portal</h1>
              <p className="text-gray-600">Polling Station Management</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Officer ID / Username Field */}
              <div>
                <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
                  Officer ID / Username
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="officer"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="officer123"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-md"
              >
                Login to Officer Portal
              </button>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}
            </form>

            {/* Not Registered Section */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 mb-4">Not registered?</p>
              <Link href="/register/officer">
                <button className="w-full border-2 border-blue-600 text-blue-600 font-semibold py-3 px-4 rounded-xl hover:bg-blue-50 transition-all duration-200">
                  Apply for Presiding Officer Access
                </button>
              </Link>
            </div>

            {/* Support Section */}
            <div className="mt-6 text-center">
              <Link href="#" className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Officer Support
              </Link>
            </div>
          </div>

          {/* Back to Home Link */}
          <div className="text-center">
            <Link 
              href="/" 
              className="inline-flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fallback - No role selected, redirect to home
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <BrandMark />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Your Portal</h2>
          <p className="text-gray-600 mb-8">Please choose your role to continue</p>
          
          <div className="space-y-3">
            <Link href="/login?role=admin">
              <button className="w-full bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-emerald-700 transition-colors duration-200">
                BEC Admin Portal
              </button>
            </Link>
            <Link href="/login?role=officer">
              <button className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors duration-200">
                Presiding Officer Portal
              </button>
            </Link>
            <Link href="/login?role=police">
              <button className="w-full bg-red-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-red-700 transition-colors duration-200">
                Law Enforcement Portal
              </button>
            </Link>
          </div>

          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 mt-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

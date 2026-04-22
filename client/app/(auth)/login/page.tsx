'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageSkeletonGate } from '@/components/skeletons/PageSkeletonGate';
import { LoginPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import './login.css';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [isLoading, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(identifier, password);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageSkeletonGate skeleton={<LoginPageSkeleton />} delayMs={700}>
      <div className="login-container">
        <div className="login-card">
          <div className="login-card-content">
            <div className="login-header">
              <h1 className="login-title">Welcome back</h1>
              <p className="login-subtitle">Sign in to your workspace</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="login-label" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  className="login-input"
                  placeholder="Enter your username"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  autoComplete="username"
                />
              </div>

              <div className="input-group login-input-group login-input-group-tight">
                <label className="login-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="login-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                />
              </div>

              {error ? (
                <div className="form-status form-status--error" role="alert">
                  {error}
                </div>
              ) : null}

              <div className="forgot-password">
                <a href="#" className="login-link">
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="login-button login-button-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Login'}
              </button>

              <div className="login-divider">
                <span>OR</span>
              </div>

              <button type="button" className="login-button login-button-secondary">
                <span>Login with Google</span>
                <Image
                  src="/image/google-icon.png"
                  alt="Google Icon"
                  width={20}
                  height={20}
                  className="google-icon"
                />
              </button>

              <p className="login-switch">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="login-link">
                  Register
                </Link>
              </p>
            </form>
          </div>
        </div>

        <div className="login-branding">
          <div className="brand-shell">
            <Image
              src="/image/logo-white.png"
              alt="Company Logo"
              width={60}
              height={60}
              className="brand-logo"
            />
            <div className="brand-wordmark">ARIA</div>
          </div>
        </div>
      </div>
    </PageSkeletonGate>
  );
}

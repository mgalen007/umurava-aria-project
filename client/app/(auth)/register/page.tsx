"use client";

import React, { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageSkeletonGate } from "@/components/skeletons/PageSkeletonGate";
import { LoginPageSkeleton } from "@/components/skeletons/PageSkeletons";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import "./register.css";

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, isLoading } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [isLoading, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({
        firstName,
        lastName,
        username,
        email,
        password,
      });
      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "We couldn't create your account right now. Please check your details and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageSkeletonGate skeleton={<LoginPageSkeleton />} delayMs={700}>
      <div className="register-container">
        <div className="register-card">
          <div className="register-card-content">
            <div className="register-header">
              <h1 className="register-title">Create your account</h1>
              <p className="register-subtitle">
                Set up your ARIA workspace in a few quick steps
              </p>
            </div>

            <form className="register-form" onSubmit={handleSubmit}>
              <div className="register-grid">
                <div className="input-group register-input-group">
                  <label className="register-label" htmlFor="firstName">
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className="register-input"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(event) => {
                      setFirstName(event.target.value);
                      if (error) setError(null);
                    }}
                    autoComplete="given-name"
                  />
                </div>

                <div className="input-group register-input-group">
                  <label className="register-label" htmlFor="lastName">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className="register-input"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(event) => {
                      setLastName(event.target.value);
                      if (error) setError(null);
                    }}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="input-group register-input-group">
                <label className="register-label" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  className="register-input"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    if (error) setError(null);
                  }}
                  autoComplete="username"
                />
              </div>

              <div className="input-group register-input-group">
                <label className="register-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="register-input"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError(null);
                  }}
                  autoComplete="email"
                />
              </div>

              <div className="input-group register-input-group register-input-group-tight">
                <label className="register-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="register-input"
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError(null);
                  }}
                  autoComplete="new-password"
                />
              </div>

              {error ? (
                <div className="form-status form-status--error" role="alert">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                className="register-button register-button-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>

              <div className="register-divider">
                <span>OR</span>
              </div>

              <button
                type="button"
                className="register-button register-button-secondary"
              >
                <span>Sign up with Google</span>
                <Image
                  src="/image/google-icon.png"
                  alt="Google Icon"
                  width={20}
                  height={20}
                  className="google-icon"
                />
              </button>

              <p className="register-switch">
                Already have an account?{" "}
                <Link href="/login" className="register-link">
                  Log in
                </Link>
              </p>
            </form>
          </div>
        </div>

        <div className="register-branding">
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

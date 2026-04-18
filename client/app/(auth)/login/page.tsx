import React from 'react';
import './login.css';
import Image from "next/image";


export default function LoginPage() {
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-card-content">
          <div className="login-header">
            <h1 className="login-title">Welcome back</h1>
            <p className="login-subtitle">
              Sign in to your workspace
            </p>
          </div>

          <form className="login-form">
            <div className="input-group">
              <label className="login-label" htmlFor="username">
                Username
              </label>
              <input id="username" type="text" className="login-input" placeholder="Enter your username" />
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
              />
            </div>

            <div className="forgot-password">
              <a href="#" className="login-link">
                Forgot password?
              </a>
            </div>

            <button type="button" className="login-button login-button-primary">
              Login
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
  );
}

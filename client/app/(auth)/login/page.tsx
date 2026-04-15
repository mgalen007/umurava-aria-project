import React from 'react';
import './login.css';

export default function LoginPage() {
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-card-content">
          <div className="login-header">
            <h1 className="text-h1" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>LOGIN</h1>
            <p className="text-body-sm">Login with your account to access the service</p>
          </div>

          <form className="login-form">
            <div className="input-group">
              <label className="input-label">Username</label>
              <input type="text" className="input-field" placeholder="" />
            </div>

            <div className="input-group" style={{ marginBottom: '0.5rem' }}>
              <label className="input-label">Password</label>
              <input type="password" className="input-field" placeholder="" />
            </div>
            
            <div className="forgot-password">
              <a href="#" className="text-body-sm">Forgot password?</a>
            </div>

            <button type="button" className="btn btn-ghost w-full" style={{ marginTop: '1rem', backgroundColor: '#e5e5e5' }}>
              Login
            </button>

            <div className="divider">
              <span className="text-body-sm">OR</span>
            </div>

            <button type="button" className="btn btn-ghost w-full" style={{ backgroundColor: '#e5e5e5' }}>
              Login with Google
            </button>
          </form>
        </div>
      </div>
      
      <div className="login-branding">
        <h2 className="text-h2 branding-text">Umurava Screening System</h2>
      </div>
    </div>
  );
}

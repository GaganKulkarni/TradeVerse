import React, { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signup.css";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3002";
const dashboardUrl = process.env.REACT_APP_DASHBOARD_URL || "http://localhost:3001";

export default function Signup({ login = false }) {
  const [values, setValues] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const update = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    setError("");
    if (!login && values.password !== values.confirm) {
      setError("Your passwords don't match.");
      return;
    }
    submitting.current = true;
    setPending(true);
    try {
      await axios.post(`${apiUrl}/auth/${login ? "login" : "signup"}`, {
        ...(!login && { name: values.name.trim() }),
        email: values.email.trim(), password: values.password,
      }, { withCredentials: true, timeout: 15000 });
      if (login) window.location.assign(dashboardUrl);
      else navigate("/login", { replace: true, state: { registered: true } });
    } catch (failure) {
      setError(failure.response?.data?.message || "Unable to reach TradeVerse. Please check your connection and try again.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-intro" aria-labelledby="auth-heading">
        <span className="auth-eyebrow">WELCOME TO TRADEVERSE</span>
        <h1 id="auth-heading">{login ? "Your next chapter starts here." : "A little curiosity. A world of possibilities."}</h1>
        <p>Explore the markets, follow your favourites, and build your confidence—one step at a time.</p>
        <img src="/media/images/signup.png" alt="" className="auth-illustration" />
        <p className="auth-demo-note">A learning platform. Trading screens show demo data.</p>
      </section>
      <section className="auth-card" aria-labelledby="form-heading">
        <h2 id="form-heading">{login ? "Welcome back" : "Create your account"}</h2>
        <p className="auth-subtitle">{login ? "Log in to explore your dashboard." : "Start exploring TradeVerse in a few simple steps."}</p>
        {login && location.state?.registered && <div className="auth-success" role="status">Your account is ready! Log in to continue.</div>}
        {error && <div className="auth-error" role="alert">{error}</div>}
        <form onSubmit={submit}>
          <fieldset disabled={pending}>
            {!login && <div className="auth-field">
              <label htmlFor="signup-name">Full name</label>
              <input id="signup-name" name="name" autoComplete="name" placeholder="Your full name" minLength={2} maxLength={80} required value={values.name} onChange={update} />
            </div>}
            <div className="auth-field">
              <label htmlFor="signup-email">Email address</label>
              <input id="signup-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} required value={values.email} onChange={update} />
            </div>
            <div className="auth-field">
              <label htmlFor="signup-password">Password</label>
              <div className="auth-password">
                <input id="signup-password" name="password" type={showPassword ? "text" : "password"} autoComplete={login ? "current-password" : "new-password"} minLength={login ? undefined : 8} maxLength={128} required value={values.password} onChange={update} aria-describedby={!login ? "password-help" : undefined} />
                <button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>{showPassword ? "Hide" : "Show"}</button>
              </div>
              {!login && <small id="password-help">Use 8–128 characters. A longer, unique password is best.</small>}
            </div>
            {!login && <div className="auth-field">
              <label htmlFor="signup-confirm">Confirm password</label>
              <input id="signup-confirm" name="confirm" type={showPassword ? "text" : "password"} autoComplete="new-password" required maxLength={128} value={values.confirm} onChange={update} />
            </div>}
            <button className="auth-submit" type="submit" aria-busy={pending}>{pending ? (login ? "Logging in…" : "Creating account…") : (login ? "Log in" : "Create account")}</button>
          </fieldset>
        </form>
        <p className="auth-switch">{login ? "New to TradeVerse? " : "Already have an account? "}<Link to={login ? "/signup" : "/login"}>{login ? "Create an account" : "Log in"}</Link></p>
      </section>
    </main>
  );
}

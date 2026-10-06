import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3002";
const loginUrl = `${process.env.REACT_APP_WEBSITE_URL || "http://localhost:3003"}/login`;
const AccountContext = createContext(null);
export const useAccount = () => useContext(AccountContext);

export default function AccountSession({ children }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    axios.get(`${apiUrl}/auth/me`, { withCredentials: true, timeout: 15000, signal: controller.signal })
      .then(({ data }) => setUser(data.user))
      .catch((failure) => {
        if (axios.isCancel(failure)) return;
        if (failure.response?.status === 401) window.location.replace(loginUrl);
        else setError("We couldn't connect to your account. Check that the backend is running and try again.");
      });
    return () => controller.abort();
  }, [attempt]);

  async function logout() {
    await axios.post(`${apiUrl}/auth/logout`, {}, { withCredentials: true, timeout: 15000 });
    window.location.replace(loginUrl);
  }

  if (!user) return <main style={{ maxWidth: 520, margin: "80px auto", padding: 24 }}>
    <h1>TradeVerse</h1>
    {error ? <><p role="alert">{error}</p><button onClick={() => setAttempt((value) => value + 1)}>Try again</button> <a href={loginUrl}>Back to login</a></> : <p role="status">Checking your session…</p>}
  </main>;
  return <AccountContext.Provider value={{ user, logout }}>{children}</AccountContext.Provider>;
}

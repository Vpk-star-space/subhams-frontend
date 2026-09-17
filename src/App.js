import React, { useState, useEffect, useCallback, useRef } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { GoogleLogin } from '@react-oauth/google';
import jsPDF from "jspdf";
import html2canvas from "html2canvas"; 
import { Fingerprint, Calculator, Lock, Mail, ExternalLink, Code, User, Bell, BellOff, BellRing, Check, X, Share2, Power, Info } from 'lucide-react'; 
import InstallPopup from './components/InstallPopup';
import AdminCommandCenter from './components/AdminCommandCenter';

const isMaintenanceMode = true; 
const targetRestoreTime = "18-09-2026 at 10:00 AM"; 
const API = process.env.REACT_APP_BACKEND_URL || "https://subhams-backend.onrender.com/api";
const PUBLIC_VAPID_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || "YOUR_PUBLIC_VAPID_KEY_HERE"; 

const DEVICE_ERROR_MSG = "⚠️ Device Error: Your personal mobile or network is currently stuck or blocking the request. Please check your connection, clear cache, or restart the app.";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatDateTime = (dateObj) => {
  if (!dateObj) return "";
  const d = new Date(dateObj);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; 
  return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
};

const getTeluguMonth = (monthName) => {
  const monthsMap = {
    'Jan': 'జనవరి', 'Feb': 'ఫిబ్రవరి', 'Mar': 'మార్చి', 'Apr': 'ఏప్రిల్',
    'May': 'మే', 'Jun': 'జూన్', 'Jul': 'జూలై', 'Aug': 'ఆగస్టు',
    'Sep': 'సెప్టెంబర్', 'Oct': 'అక్టోబర్', 'Nov': 'నవంబర్', 'Dec': 'డిసెంబర్'
  };
  return monthsMap[monthName] || monthName;
};

const bufferToBase64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const base64ToBuffer = (b64) => Uint8Array.from(atob(b64), c => c.charCodeAt(0));

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const MaintenanceScreen = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    const liveTimeString = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    return (
        <div style={smStyles.container}>
            <div style={smStyles.card}>
                <h1 style={smStyles.brandTitle}>SUBHAMS <span style={{color: '#f59e0b'}}>PMMS</span></h1>
                <div style={smStyles.secureBadge}>🔒 SECURE MAINTENANCE / సురక్షిత నిర్వహణ</div>
                <p style={smStyles.subtitle}>
                    <strong>Your financial dashboard is currently offline for a security upgrade.</strong><br/>
                    <span style={{color: '#94a3b8', fontSize: '15px'}}>మీ ఫైనాన్షియల్ డ్యాష్‌బోర్డ్ భద్రతా అప్‌గ్రేడ్ కోసం ప్రస్తుతం ఆఫ్‌లైన్‌లో ఉంది.</span>
                </p>
                <div style={smStyles.timePanelContainer}>
                    <div style={smStyles.liveTimeBox}>
                        <div style={smStyles.timeLabel}>PRESENT TIME / ప్రస్తుత సమయం</div>
                        <div style={smStyles.liveTimeValue}>{liveTimeString}</div>
                    </div>
                    <div style={smStyles.restorePanel}>
                        <div style={smStyles.timeLabel}>TARGET RESTORE TIME / లక్ష్యం</div>
                        <div style={smStyles.restoreTime}>{targetRestoreTime}</div>
                    </div>
                </div>
                <p style={smStyles.footerText}>
                    Thank you for your patience. <span style={{fontSize: '13px'}}>(మీ ఓపికకు ధన్యవాదాలు)</span><br/><br/>
                    <strong>- Venkata Pavan Kumar Amarthaluri</strong>
                </p>
            </div>
        </div>
    );
};

const AppLockScreen = ({ onUnlock }) => (
  <div style={smStyles.container}>
    <div style={smStyles.card}>
      <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "20px", borderRadius: "50%", marginBottom: "20px" }}>
        <Lock size={60} color="#10b981" />
      </div>
      <h1 style={{ color: "white", marginBottom: "10px", fontSize: "32px" }}>App Locked</h1>
      <p style={{ color: "#94a3b8", marginBottom: "30px", fontSize: "16px" }}>
        Your financial data is protected. Please verify your identity to access Subhams PMMS.
      </p>
      <button 
        onClick={onUnlock} 
        style={{ padding: "16px 32px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontSize: "18px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)" }}
      >
         <Fingerprint size={24} /> Unlock Dashboard
      </button>
    </div>
  </div>
);

function App() {
  const [isAppLoading, setIsAppLoading] = useState(!!localStorage.getItem("token")); 
  const [authMode, setAuthMode] = useState("login"); 
  
  const [isAppLocked, setIsAppLocked] = useState(!!localStorage.getItem("token") && localStorage.getItem("subhams_app_lock") === "true");
  
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken"));
  
  const [userProfile, setUserProfile] = useState(() => JSON.parse(localStorage.getItem('pmms_user') || '{"username":"","email":"","preferred_language":"en","silent_mode":false,"email_digest_enabled":true}'));
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isProcessingPush, setIsProcessingPush] = useState(false);

  const [email, setEmail] = useState(""); 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState(""); 
  const [otp, setOtp] = useState(""); 
  
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); 
  const [showAllHistory, setShowAllHistory] = useState(false); 
  
  const [monthlyChartData, setMonthlyChartData] = useState([]); 
  const [insights, setInsights] = useState(null); 
  const [isDownloading, setIsDownloading] = useState(false); 
  
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [category, setCategory] = useState("Other");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [filterType, setFilterType] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState(""); 
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  
  const [interestData, setInterestData] = useState({ 
    principal: "", 
    startDate: "", 
    endDate: "", 
    interestType: "Local", 
    rate: "",
    shareLang: "en"
  });
  const [interestResult, setInterestResult] = useState(null);

  const [txSuccessMsg, setTxSuccessMsg] = useState(""); 
  const [showTxInfo, setShowTxInfo] = useState(false); 

  const formRef = useRef(null); 
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          if (sub) {
            setPushEnabled(true);
          }
        });
      });
    }
  }, []);

  const [failedAttempts, setFailedAttempts] = useState(() => parseInt(localStorage.getItem('localFailedAttempts') || '0', 10));
  const [lockoutTimer, setLockoutTimer] = useState(() => {
    const lockedUntil = localStorage.getItem('lockoutUntil');
    if (lockedUntil) {
      const remaining = Math.floor((parseInt(lockedUntil, 10) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });

  useEffect(() => {
    let interval;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) { localStorage.removeItem('lockoutUntil'); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const triggerLockout = () => {
    const duration = 900; 
    setLockoutTimer(duration);
    localStorage.setItem('lockoutUntil', Date.now() + (duration * 1000));
    setFailedAttempts(0);
    localStorage.removeItem('localFailedAttempts');
  };

  const refreshAuthToken = useCallback(async () => {
    if (!refreshToken || refreshToken === "null") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("pmms_user");
      setToken(null);
      setRefreshToken(null);
      return null;
    }
    try {
      const res = await fetch(`${API}/auth/refresh-token`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: refreshToken })
      });
      const data = await res.json();
      if (res.ok && data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        setToken(data.accessToken);
        return data.accessToken;
      } else { 
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        setToken(null);
        setRefreshToken(null);
        return null; 
      }
    } catch (err) { 
      return null; 
    }
  }, [refreshToken]);

  const enableAppLock = async () => {
    if (!window.PublicKeyCredential) return alert("Your device doesn't support App Lock.");
    try {
      const challenge = new Uint8Array(32); window.crypto.getRandomValues(challenge);
      const userId = new Uint8Array(16); window.crypto.getRandomValues(userId);
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge, rp: { name: "Subhams PMMS" }, user: { id: userId, name: "User", displayName: "Subhams User" },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }], authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" }, timeout: 60000
        }
      });
      
      localStorage.setItem("subhams_app_lock_id", bufferToBase64(credential.rawId));
      localStorage.setItem("subhams_app_lock", "true");
      alert("🔒 App Lock Enabled! Your financial data is now secure.");
    } catch (err) { alert("App Lock setup cancelled."); }
  };

  const handleAppUnlock = async () => {
    try {
      const credentialIdString = localStorage.getItem("subhams_app_lock_id");
      if (!credentialIdString) {
          setIsAppLocked(false); return;
      }
      
      const credentialId = base64ToBuffer(credentialIdString);
      const challenge = new Uint8Array(32); window.crypto.getRandomValues(challenge);
      
      await navigator.credentials.get({ 
          publicKey: { 
              challenge, 
              allowCredentials: [{ type: "public-key", id: credentialId }],
              userVerification: "required", 
              timeout: 60000 
          } 
      });
      
      setIsAppLocked(false);
    } catch (err) { alert(DEVICE_ERROR_MSG); } 
  };

  const login = async () => {
    if (lockoutTimer > 0) return alert("Account locked. Please wait for the timer.");
    if (!username || !password) return alert("Please enter both Username and Password.");
    
    setIsAppLoading(true); 
    try {
      const res = await fetch(`${API}/auth/login`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ username, password }) 
      });

      const contentType = res.headers.get("content-type");
      if (res.status === 429 && (!contentType || !contentType.includes("json"))) {
         return alert(DEVICE_ERROR_MSG);
      }
      
      const data = await res.json();
      
      if (res.ok && data.accessToken) { 
        setFailedAttempts(0);
        localStorage.removeItem('localFailedAttempts');
        localStorage.setItem("token", data.accessToken); 
        localStorage.setItem("refreshToken", data.refreshToken);

        const profileData = { 
          username: data.user?.username || username, 
          email: data.user?.email || email, 
          preferred_language: data.user?.preferred_language || 'en',
          silent_mode: data.user?.silent_mode || false,
          email_digest_enabled: data.user?.email_digest_enabled !== false
        };
        localStorage.setItem("pmms_user", JSON.stringify(profileData));
        setUserProfile(profileData);

        setToken(data.accessToken); 
        setRefreshToken(data.refreshToken);
        if (localStorage.getItem("subhams_app_lock") === "true") setIsAppLocked(true);

      } else { 
        if (res.status === 429 && data.error && data.error.includes("Account locked")) {
          triggerLockout();
          return;
        }
        if (res.status === 429) {
          return alert(DEVICE_ERROR_MSG);
        }
        const newAttempts = failedAttempts + 1;
        if (newAttempts >= 5) { 
          triggerLockout(); 
        } else {
          setFailedAttempts(newAttempts);
          localStorage.setItem('localFailedAttempts', newAttempts.toString());
          alert(`${data.error || "Login failed"}. ⚠️ ${5 - newAttempts} attempt(s) left.`);
        }
      }
    } catch (err) { 
      alert(DEVICE_ERROR_MSG); 
    } finally { 
      setIsAppLoading(false); 
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsAppLoading(true);
    try {
      const res = await fetch(`${API}/auth/google-login`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: credentialResponse.credential })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.accessToken); localStorage.setItem("refreshToken", data.refreshToken);
        
        const profileData = { 
          username: data.user?.username || "Google User", 
          email: data.user?.email || "", 
          preferred_language: data.user?.preferred_language || 'en',
          silent_mode: data.user?.silent_mode || false,
          email_digest_enabled: data.user?.email_digest_enabled !== false
        };
        localStorage.setItem("pmms_user", JSON.stringify(profileData));
        setUserProfile(profileData);

        setToken(data.accessToken); setRefreshToken(data.refreshToken);
        
        if (localStorage.getItem("subhams_app_lock") === "true") setIsAppLocked(true);
      } else { alert(DEVICE_ERROR_MSG); }
    } catch (err) { alert(DEVICE_ERROR_MSG); }
    finally { setIsAppLoading(false); }
  };

  const requestRegister = async () => {
    if (!email || !username || !password) return alert("Enter email, username, and password");
    setIsAppLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, username, password }) });
      const data = await res.json();
      if (res.ok) { alert("OTP sent to your email!"); setAuthMode("otp"); } else { alert(data.error || "Registration failed"); }
    } catch (err) { alert(DEVICE_ERROR_MSG); } finally { setIsAppLoading(false); }
  };

  const verifyOtpAndRegister = async () => {
    if (!otp) return alert("Enter the OTP sent to your email");
    setIsAppLoading(true);
    try {
      const res = await fetch(`${API}/auth/verify-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, username, password, otp }) });
      const data = await res.json();
      if (res.ok) { alert("Success! You can now log in."); setAuthMode("login"); setPassword(""); setOtp(""); } else { alert(data.error || "Invalid OTP"); }
    } catch (err) { alert(DEVICE_ERROR_MSG); } finally { setIsAppLoading(false); }
  };

  const handleForgotPassword = async () => {
    if (!email) return alert("Please enter your registered email address.");
    setIsAppLoading(true);
    try {
      const res = await fetch(`${API}/auth/forgot-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (res.ok) { alert("OTP sent! Check your email."); setAuthMode("reset_otp"); } else { alert(data.error || "Failed to send OTP."); }
    } catch (err) { alert(DEVICE_ERROR_MSG); } finally { setIsAppLoading(false); }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) return alert("Please enter the OTP and your new password.");
    setIsAppLoading(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp, newPassword }) });
      const data = await res.json();
      if (res.ok) {
        alert("Password reset successful! Please log in."); 
        setAuthMode("login"); setOtp(""); setNewPassword(""); setPassword(""); 
        setLockoutTimer(0); localStorage.removeItem('lockoutUntil'); setFailedAttempts(0); localStorage.removeItem('localFailedAttempts');
      } else { alert(data.error || data.message || "Invalid OTP."); }
    } catch (err) { alert(DEVICE_ERROR_MSG); } finally { setIsAppLoading(false); }
  };

  const logout = () => { 
    if (!window.confirm("Are you sure you want to securely log out?")) return;
    
    localStorage.removeItem("token"); localStorage.removeItem("refreshToken"); localStorage.removeItem("pmms_user");
    setToken(null); setRefreshToken(null); setUserProfile({username:"", email:"", preferred_language: "en", silent_mode: false, email_digest_enabled: true});
    setTransactions([]); setAllTransactions([]); setMonthlyChartData([]); setInsights(null); 
    setPushEnabled(false);
    setAuthMode("login");
    setShowProfileModal(false);
  };

  const updateProfileName = async () => {
      if (!editName.trim()) return alert("Name cannot be empty");
      try {
          const res = await fetch(`${API}/auth/update-profile`, {
              method: "PUT",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ username: editName })
          });
          if (res.ok) {
              const updatedProfile = { ...userProfile, username: editName };
              setUserProfile(updatedProfile);
              localStorage.setItem("pmms_user", JSON.stringify(updatedProfile));
              alert("✅ Name updated successfully!"); 
              setShowProfileModal(false);
          } else {
              alert(DEVICE_ERROR_MSG);
          }
      } catch (err) {
          alert(DEVICE_ERROR_MSG);
      }
  };

  const updateLanguagePreference = async (lang) => {
      try {
          const res = await fetch(`${API}/notifications/language`, {
              method: "PUT",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ lang })
          });
          if (res.ok) {
              const updated = { ...userProfile, preferred_language: lang };
              setUserProfile(updated);
              localStorage.setItem("pmms_user", JSON.stringify(updated));
          }
      } catch (err) {
          console.error(DEVICE_ERROR_MSG);
      }
  };

  const toggleEmailDigest = async (turnOn) => {
      try {
          await fetch(`${API}/notifications/toggle-email-digest`, {
              method: "PUT",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ email_digest_enabled: turnOn })
          });
          const updated = { ...userProfile, email_digest_enabled: turnOn };
          setUserProfile(updated);
          localStorage.setItem("pmms_user", JSON.stringify(updated));
      } catch (error) {
          alert(DEVICE_ERROR_MSG);
      }
  };

  const setupPushNotifications = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          alert("Push notifications are not supported by your browser.");
          return;
      }
      setIsProcessingPush(true);
      try {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
              setIsProcessingPush(false);
              alert("You denied permission for notifications.");
              return;
          }

          const registration = await navigator.serviceWorker.register('/sw.js');
          const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
          });

          await fetch(`${API}/notifications/subscribe`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify(subscription)
          });

          setPushEnabled(true);
          const updated = { ...userProfile, silent_mode: false };
          setUserProfile(updated);
          localStorage.setItem("pmms_user", JSON.stringify(updated));
          alert(userProfile.preferred_language === 'te' ? "✅ నోటిఫికేషన్‌లు ప్రారంభించబడ్డాయి!" : "✅ Notifications Enabled! Welcome alert sent.");
      } catch (error) {
          alert(DEVICE_ERROR_MSG);
      }
      setIsProcessingPush(false);
  };

  const toggleSilentMode = async (turnSilent) => {
      setIsProcessingPush(true);
      try {
          await fetch(`${API}/notifications/toggle-silent`, {
              method: "PUT",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ silent: turnSilent })
          });
          const updated = { ...userProfile, silent_mode: turnSilent };
          setUserProfile(updated);
          localStorage.setItem("pmms_user", JSON.stringify(updated));
          alert(turnSilent ? "🔕 Silent Mode Activated. Notifications will display without sound." : "🔔 Sound Restored! Notifications are now loud.");
      } catch (error) {
          alert(DEVICE_ERROR_MSG);
      }
      setIsProcessingPush(false);
  };

  const disablePushNotifications = async () => {
      setIsProcessingPush(true);
      if ('serviceWorker' in navigator && 'PushManager' in window) {
          try {
              const registration = await navigator.serviceWorker.ready;
              const subscription = await registration.pushManager.getSubscription();
              if (subscription) {
                  await subscription.unsubscribe();
              }
              setPushEnabled(false);
              const updated = { ...userProfile, silent_mode: false };
              setUserProfile(updated);
              localStorage.setItem("pmms_user", JSON.stringify(updated));
              alert("🔕 Notifications turned off completely. Banner is restored.");
          } catch (error) {
              alert(DEVICE_ERROR_MSG);
          }
      }
      setIsProcessingPush(false);
  };

  const fetchAllData = useCallback(async () => {
    if (!token || token === "null" || isMaintenanceMode || isAppLocked) { setIsAppLoading(false); return; }
    
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [tRes, mRes, iRes, pRes] = await Promise.all([
        fetch(`${API}/transactions`, { headers }), 
        fetch(`${API}/transactions/monthly`, { headers }), 
        fetch(`${API}/transactions/insights`, { headers }),
        fetch(`${API}/auth/me`, { headers }) 
      ]);

      if (tRes.status === 401 || tRes.status === 403) { 
        const newToken = await refreshAuthToken();
        if (newToken) fetchAllData(); 
        return; 
      }

      if (pRes.ok) {
         const pData = await pRes.json();
         if (pData.user) {
             setUserProfile(prev => {
                 const merged = { ...prev, ...pData.user };
                 localStorage.setItem("pmms_user", JSON.stringify(merged));
                 return merged;
             });
         }
      }

      fetch(`${API}/notifications/check-behavior`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => console.log("Behavior check skipped"));

      const tData = await tRes.json(); 
      const mData = await mRes.json(); 
      const iData = await iRes.json();
      
      if (Array.isArray(tData)) { setTransactions(tData); setAllTransactions(tData); }
      if (Array.isArray(mData)) {
        const formattedChartData = mData.map(item => {
          let monthLabel = item.name;
          const parts = monthLabel.split(' ');
          if (parts.length === 2 && userProfile.preferred_language === 'te') {
              monthLabel = `${getTeluguMonth(parts[0])} ${parts[1]}`;
          }
          return { ...item, name: monthLabel };
        });
        setMonthlyChartData(formattedChartData);
      }
      setInsights(iData);
    } catch (err) { console.log("Background fetch silent fail"); } 
    finally { 
        setIsAppLoading(false); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, refreshAuthToken, isAppLocked, userProfile.preferred_language]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const downloadWhitePaper = async () => {
    if (transactions.length === 0) return alert("No transactions to download!");
    setIsDownloading(true); 

    if (token) {
      fetch(`${API}/notifications/track-feature`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ feature_name: "pdf_report_downloaded" })
      }).catch(() => {});
    }

    const pdfIncome = transactions.filter(t => t.type === "income").reduce((a, b) => a + Number(b.amount), 0);
    const pdfExpense = transactions.filter(t => t.type === "expense").reduce((a, b) => a + Number(b.amount), 0);
    const pdfPending = transactions.filter(t => t.type === "pending").reduce((a, b) => a + Number(b.amount), 0);
    const pdfBalance = pdfIncome - pdfExpense;

    const ITEMS_PER_FIRST_PAGE = 10;
    const ITEMS_PER_NEXT_PAGE = 14;

    const chunks = [];
    if (transactions.length <= ITEMS_PER_FIRST_PAGE) {
      chunks.push(transactions);
    } else {
      chunks.push(transactions.slice(0, ITEMS_PER_FIRST_PAGE));
      let remaining = transactions.slice(ITEMS_PER_FIRST_PAGE);
      while (remaining.length > 0) {
        chunks.push(remaining.slice(0, ITEMS_PER_NEXT_PAGE));
        remaining = remaining.slice(ITEMS_PER_NEXT_PAGE);
      }
    }

    const doc = new jsPDF("p", "mm", "a4");
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const isFirstPage = i === 0;
      const isLastPage = i === chunks.length - 1;

      const reportDiv = document.createElement("div");
      reportDiv.style.position = "absolute"; 
      reportDiv.style.left = "-9999px"; 
      reportDiv.style.width = "800px"; 
      reportDiv.style.minHeight = "1131px"; 
      reportDiv.style.padding = "40px";
      reportDiv.style.backgroundColor = "#ffffff"; 
      reportDiv.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
      reportDiv.style.color = "#0f172a";
      reportDiv.style.boxSizing = "border-box";
      reportDiv.style.display = "flex";
      reportDiv.style.flexDirection = "column";

      let headerHtml = "";
      if (isFirstPage) {
        headerHtml = `
          <div style="border-bottom: 3px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <h1 style="color: #f59e0b; font-size: 38px; margin: 0 0 5px 0; letter-spacing: -1px;">SUBHAMS <span style="color: #1e293b;">PMMS</span></h1>
              <p style="color: #64748b; font-size: 16px; margin: 0; font-weight: 600;">Official Financial White Paper</p>
            </div>
            <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
              <div style="border: 2px solid #10b981; color: #10b981; padding: 6px 14px; border-radius: 6px; font-weight: 900; font-size: 15px; letter-spacing: 2px; margin-bottom: 12px; background-color: #f0fdf4;">
                ✓ SUBHAMS VERIFIED
              </div>
              <p style="color: #94a3b8; font-size: 14px; margin: 0;">Date of Issue</p>
              <p style="color: #334155; font-size: 16px; margin: 5px 0 0 0; font-weight: bold;">${formatDateTime(new Date())}</p>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 25px; border-radius: 12px; border: 1px solid #cbd5e1; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
            <div><b style="color: #64748b; font-size: 14px;">Total Received</b><br/><span style="color: #10b981; font-size: 24px; font-weight: 900;">₹${pdfIncome}</span></div>
            <div><b style="color: #64748b; font-size: 14px;">Total Paid</b><br/><span style="color: #ef4444; font-size: 24px; font-weight: 900;">₹${pdfExpense}</span></div>
            <div><b style="color: #64748b; font-size: 14px;">Total Pending</b><br/><span style="color: #f59e0b; font-size: 24px; font-weight: 900;">₹${pdfPending}</span></div>
            <div style="border-left: 2px solid #cbd5e1; padding-left: 20px;"><b style="color: #64748b; font-size: 14px;">Net Balance</b><br/><span style="color: ${pdfBalance >= 0 ? '#3b82f6' : '#ef4444'}; font-size: 24px; font-weight: 900;">₹${pdfBalance}</span></div>
          </div>
        `;
      } else {
        headerHtml = `
          <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">
            <h2 style="color: #1e293b; font-size: 22px; margin: 0;">SUBHAMS PMMS <span style="color: #94a3b8; font-size: 16px; font-weight: normal;">(Continued - Page ${i + 1})</span></h2>
          </div>
        `;
      }

      const rowsHtml = chunk.map((t) => {
        const isInc = t.type === 'income';
        const isExp = t.type === 'expense';
        const tColor = isInc ? '#10b981' : isExp ? '#ef4444' : '#f59e0b';
        const bgTint = isInc ? '#f0fdf4' : isExp ? '#fef2f2' : '#fffbeb';
        const displayStatus = isInc ? 'RECEIVED' : isExp ? 'PAID' : 'PENDING';

        return `
          <tr style="background-color: ${bgTint};">
            <td style="padding: 15px; border-radius: 8px 0 0 8px; border-left: 4px solid ${tColor}; color: #475569; font-weight: 500;">
              ${formatDate(t.date)}
            </td>
            <td style="padding: 15px; font-weight: 800; color: #0f172a; font-size: 15px;">${t.title}</td>
            <td style="padding: 15px;">
              <span style="background: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; border: 1px solid #cbd5e1; color: #475569; font-weight: bold;">${t.category || "Other"}</span>
            </td>
            <td style="padding: 15px; font-weight: 900; color: ${tColor}; letter-spacing: 1px;">${displayStatus}</td>
            <td style="padding: 15px; font-weight: 900; text-align: right; color: ${tColor}; font-size: 15px; border-radius: 0 8px 8px 0;">₹${t.amount}</td>
          </tr>
        `;
      }).join('');

      let footerHtml = "";
      if (isLastPage) {
        footerHtml = `
          <div style="margin-top: auto; padding-top: 40px;">
            <div style="border-top: 2px dashed #cbd5e1; padding-top: 20px; text-align: center; color: #64748b;">
              <p style="margin: 0; font-weight: bold; font-size: 14px;">Subhams Personal Money Management System</p>
              <p style="margin: 5px 0 0 0; font-size: 12px;">Digitally generated and cryptographically secure. Engineered by Venkata Pavan Kumar Amarthaluri.</p>
            </div>
          </div>
        `;
      }

      reportDiv.innerHTML = `
        <div style="position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column;">
          ${headerHtml}
          <table style="width: 100%; border-collapse: separate; border-spacing: 0 8px; text-align: left; font-size: 14px;">
            <thead>
              <tr style="color: #475569; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
                <th style="padding: 0 15px 10px 15px; border-bottom: 2px solid #e2e8f0;">Date</th>
                <th style="padding: 0 15px 10px 15px; border-bottom: 2px solid #e2e8f0;">Title</th>
                <th style="padding: 0 15px 10px 15px; border-bottom: 2px solid #e2e8f0;">Category</th>
                <th style="padding: 0 15px 10px 15px; border-bottom: 2px solid #e2e8f0;">Status</th>
                <th style="padding: 0 15px 10px 15px; border-bottom: 2px solid #e2e8f0; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          ${footerHtml}
        </div>
      `;

      document.body.appendChild(reportDiv);

      try {
        const canvas = await html2canvas(reportDiv, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL("image/png");
        
        if (i > 0) doc.addPage();
        doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      } catch (error) { 
        alert(DEVICE_ERROR_MSG);
      } finally { 
        document.body.removeChild(reportDiv); 
      }
    }

    doc.save(`Subhams_Report_${formatDate(new Date())}.pdf`);
    setIsDownloading(false); 
  };

  const handleSubmit = async (type) => {
    if (!title || !amount) return alert("Enter title & amount");
    const url = editingId ? `${API}/transactions/${editingId}` : `${API}/transactions`;
    const method = editingId ? "PUT" : "POST";
    try {
      const res = await fetch(url, { 
        method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, 
        body: JSON.stringify({ title, amount: Number(amount), type, category, date }) 
      });
      if (res.ok) { 
        setTxSuccessMsg(`✅ Saved successfully: ₹${amount} as ${type}`);
        setTimeout(() => setTxSuccessMsg(""), 4000); 

        setTitle(""); setAmount(""); setEditingId(null); setCategory("Other"); setDate(new Date().toISOString().split('T')[0]); fetchAllData(); 
      } else { const errData = await res.json(); alert("Error: " + errData.message); }
    } catch (err) { alert(DEVICE_ERROR_MSG); }
  };

  const handleEdit = (t) => { 
    setTitle(t.title); setAmount(t.amount); setEditingId(t._id); 
    setCategory(t.category || "Other"); setDate(t.date ? t.date.substring(0, 10) : new Date().toISOString().split('T')[0]); 
    setTimeout(() => { formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
  };
  
  const cancelEdit = () => { setTitle(""); setAmount(""); setEditingId(null); setCategory("Other"); setDate(new Date().toISOString().split('T')[0]); };

  const deleteTransaction = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      const res = await fetch(`${API}/transactions/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) fetchAllData(); 
    } catch (err) { alert(DEVICE_ERROR_MSG); }
  };

  const applyFilters = async () => {
    try {
      const query = new URLSearchParams({ type: filterType, category: filterCategory, search: searchQuery, startDate: filterStartDate, endDate: filterEndDate }).toString();
      const res = await fetch(`${API}/transactions/filter?${query}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json(); if (Array.isArray(data)) setTransactions(data); 
    } catch (err) { alert(DEVICE_ERROR_MSG); }
  };

  const clearFilters = () => { setFilterType("All"); setFilterCategory("All"); setSearchQuery(""); setFilterStartDate(""); setFilterEndDate(""); fetchAllData(); };

  const calculateInterest = () => {
    const { principal, startDate, endDate, interestType, rate, shareLang } = interestData;
    if (!startDate || !endDate || !principal || !rate) return alert("Please fill all fields");

    if (token) {
      fetch(`${API}/notifications/track-feature`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ feature_name: "interest_calculator_used" })
      }).catch(() => {});
    }

    const p = Number(principal);
    const r = Number(rate);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) return alert("Start date cannot be after end date");

    const timeDifference = end.getTime() - start.getTime();
    const totalDays = Math.ceil(timeDifference / (1000 * 3600 * 24));
    const totalMonths = totalDays / 30;

    let calculatedInterest = 0;
    if (interestType === 'Local') {
      calculatedInterest = (p / 100) * r * totalMonths;
    } else {
      calculatedInterest = (p * r * totalDays) / (100 * 365);
    }

    const finalAmount = p + calculatedInterest;
    const daily = totalDays > 0 ? (calculatedInterest / totalDays) : 0;
    const weekly = daily * 7;

    setInterestResult({ 
      totalDays, totalMonths, calculatedInterest, finalAmount, principal: p,
      dailyInterest: daily, weeklyInterest: weekly,
      startDate: formatDate(startDate), endDate: formatDate(endDate),
      shareLang: shareLang || "en"
    });
  };

  const handleShare = async () => {
    if (!interestResult) return;
    
    const isTelugu = (interestResult.shareLang || interestData.shareLang) === 'te';
    
    const rateTextEn = interestData.interestType === 'Local' ? `${interestData.rate} Rupees per month` : `${interestData.rate}% APR`;
    const rateTextTe = interestData.interestType === 'Local' ? `నెలకు ${interestData.rate} రూపాయలు` : `${interestData.rate}% వార్షిక రేటు`;
    
    const shareText = isTelugu 
      ? `📊 *Subhams వడ్డీ లెక్కల వివరాలు*\n\n💰 అసలు మొత్తం: ₹${interestResult.principal}\n📈 వడ్డీ రేటు: ${rateTextTe}\n📅 తేదీలు: ${interestResult.startDate} నుండి ${interestResult.endDate} వరకు\n⏳ వ్యవధి: ${interestResult.totalDays} రోజులు (${interestResult.totalMonths.toFixed(1)} నెలలు)\n💵 మొత్తం వడ్డీ: ₹${Math.round(interestResult.calculatedInterest)}\n✅ చెల్లించాల్సిన మొత్తం: ₹${Math.round(interestResult.finalAmount)}\n\n🔗 మీ వడ్డీని ఇక్కడే లెక్కించండి:\nhttps://pmms.subhamsnetworks.in`
      : `📊 *Subhams Interest Statement*\n\n💰 Principal Amount: ₹${interestResult.principal}\n📈 Interest Rate: ${rateTextEn}\n📅 Dates: ${interestResult.startDate} to ${interestResult.endDate}\n⏳ Duration: ${interestResult.totalDays} Days (${interestResult.totalMonths.toFixed(1)} Months)\n💵 Accrued Interest: ₹${Math.round(interestResult.calculatedInterest)}\n✅ Total Payable: ₹${Math.round(interestResult.finalAmount)}\n\n🔗 Calculate yours here:\nhttps://pmms.subhamsnetworks.in`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Subhams PMMS Calculation',
          text: shareText,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      alert(isTelugu ? "మీ బ్రౌజర్‌లో షేరింగ్ సపోర్ట్ లేదు." : "Sharing is not supported on this browser/device.");
    }
  };

  const income = allTransactions.filter(t => t.type === "income").reduce((a, b) => a + Number(b.amount), 0);
  const expense = allTransactions.filter(t => t.type === "expense").reduce((a, b) => a + Number(b.amount), 0);
  const pending = allTransactions.filter(t => t.type === "pending").reduce((a, b) => a + Number(b.amount), 0);
  const balance = income - expense;
  const pieData = [ { name: "Income", value: income }, { name: "Expense", value: expense }, { name: "Pending", value: pending } ];

  let smartMsg = null; let smartMsgTe = null; let insightClass = "insight-blue";
  if (income > 0 || expense > 0) {
    const topDrain = insights?.topCategory || "Other";
    const topAmount = insights?.amount || 0;
    
    if (expense > income) {
      const deficit = expense - income;
      smartMsg = `⚠️ Budget Alert: Expenses exceed income by ₹${deficit}. Your highest drain is ${topDrain} (₹${topAmount}). Cut back here to restore a positive balance.`; 
      smartMsgTe = `⚠️ బడ్జెట్ హెచ్చరిక: ఖర్చులు ఆదాయం కంటే ₹${deficit} ఎక్కువగా ఉన్నాయి. ప్రధాన ఖర్చు ${topDrain} (₹${topAmount}). బడ్జెట్‌ను సరిదిద్దడానికి ఈ ఖర్చును తగ్గించండి.`; 
      insightClass = "insight-red"; 
    } else if (income > 0 && (expense / income) >= 0.7) { 
      const spendPercent = Math.round((expense / income) * 100);
      smartMsg = `⚠️ Caution: You have consumed ${spendPercent}% of income. Only ₹${balance} remains. Limit non-essential purchases.`; 
      smartMsgTe = `⚠️ జాగ్రత్త: మీ ఆదాయంలో ${spendPercent}% ఖర్చయింది. కేవలం ₹${balance} మాత్రమే మిగిలి ఉంది. అనవసర ఖర్చులను నియంత్రించండి.`; 
      insightClass = "insight-red"; 
    } else if (income > 0 && (expense / income) <= 0.4) { 
      const savePercent = 100 - Math.round((expense / income) * 100);
      smartMsg = `🌟 Wealth Builder: You saved ${savePercent}% (₹${balance}) this month. Outstanding financial discipline.`; 
      smartMsgTe = `🌟 అద్భుతమైన పొదుపు: ఈ నెలలో మీరు ${savePercent}% (₹${balance}) ఆదా చేశారు. మీ ఆర్థిక క్రమశిక్షణ అభినందనీయం.`; 
      insightClass = "insight-green"; 
    } else if (expense > 0 && income === 0) {
      smartMsg = `Logged ₹${expense} in expenses with no income recorded.`; 
      smartMsgTe = `₹${expense} ఖర్చు నమోదు చేయబడింది, కానీ ఆదాయం లేదు.`; 
      insightClass = "insight-red";
    } else { 
      const spendPercent = Math.round((expense / income) * 100); const savePercent = 100 - spendPercent;
      smartMsg = `Saved ${savePercent}% | Spent ${spendPercent}%. Top expense: ${topDrain} (₹${topAmount}).`; 
      smartMsgTe = `${savePercent}% ఆదా చేశారు | ${spendPercent}% ఖర్చు చేశారు. ప్రధాన ఖర్చు: ${topDrain} (₹${topAmount}).`; 
      insightClass = "insight-blue"; 
    }
  }

  const globalStyles = `
    * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    body { background-color: #f1f5f9; margin: 0; color: #334155; }
    .nav-bar { background: #0f172a; color: white; padding: 15px 5%; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 1000; }
    .container { max-width: 1200px; margin: 0 auto; padding: 15px; position: relative; z-index: 1; }
    .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin-bottom: 20px; position: relative; }
    .action-grid { display: grid; grid-template-columns: 35% 65%; gap: 20px; }
    @media (max-width: 900px) { .action-grid { grid-template-columns: 1fr; } }
    .metric-card { text-align: center; padding: 20px; border-radius: 12px; background: white; border: 1px solid #e2e8f0; }
    .metric-title { font-size: 0.85rem; color: #64748b; font-weight: bold; letter-spacing: 1px; }
    .metric-value { font-size: 2rem; font-weight: 800; margin: 10px 0 0 0; }
    .history-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #e2e8f0; margin-bottom: 8px; border-radius: 8px; transition: 0.2s; }
    .spinner { width: 50px; height: 50px; border: 5px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
    .marquee-container { background-color: #1e293b; color: #fbbf24; padding: 10px; overflow: hidden; white-space: nowrap; position: relative; z-index: 1; }
    .marquee-text { display: inline-block; animation: scrollLeft 30s linear infinite; font-weight: 500; letter-spacing: 0.5px; }
    @keyframes scrollLeft { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }
    .brand-logo { font-size: 2.2rem; font-weight: 900; letter-spacing: -1px; margin: 0; background: linear-gradient(45deg, #f59e0b, #facc15); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .scrollable-history::-webkit-scrollbar { width: 6px; }
    .scrollable-history::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
    .scrollable-history::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    .insight-green { background: #f0fdf4; border-left: 5px solid #10b981; color: #065f46; padding: 15px; border-radius: 8px;}
    .insight-red { background: #fef2f2; border-left: 5px solid #ef4444; color: #991b1b; padding: 15px; border-radius: 8px;}
    .insight-blue { background: #eff6ff; border-left: 5px solid #3b82f6; color: #1e40af; padding: 15px; border-radius: 8px;}
    @keyframes fade-in { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
    
    /* 🟢 3D CENTER COIN CSS (DASHBOARD) - SPEED REDUCED TO 8S */
    @keyframes flip-coin-3d {
      0% { transform: rotateY(0deg); }
      100% { transform: rotateY(360deg); }
    }
    .coin-wrapper {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 45px;
      height: 45px;
      perspective: 1000px;
      z-index: 10;
      pointer-events: none;
    }
    .coin-inner {
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      animation: flip-coin-3d 8s linear infinite;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      border-radius: 50%;
    }
    .coin-front, .coin-back {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #fde047 0%, #f59e0b 50%, #b45309 100%);
      border: 2px solid #fef08a;
      color: #fffbeb;
      text-shadow: 1px 1px 2px rgba(180, 83, 9, 0.8);
    }
    .coin-front {
      font-size: 24px;
      font-weight: 900;
    }
    .coin-back {
      transform: rotateY(180deg);
      font-size: 8px;
      font-weight: bold;
      text-align: center;
      line-height: 1.1;
      padding: 2px;
    }

    /* 🟢 3D GIANT LOADING COIN CSS (OVERLAY) - SPEED REDUCED TO 6S */
    @keyframes flip-coin-3d-giant {
      0% { transform: rotateY(0deg); }
      100% { transform: rotateY(360deg); }
    }
    .loader-coin-wrapper {
      width: 120px;
      height: 120px;
      perspective: 1000px;
      margin: 0 auto;
    }
    .loader-coin-inner {
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      animation: flip-coin-3d-giant 6s linear infinite;
      border-radius: 50%;
      box-shadow: 0 10px 30px rgba(245, 158, 11, 0.4);
    }
    .loader-coin-front, .loader-coin-back {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #fde047 0%, #f59e0b 50%, #b45309 100%);
      border: 6px solid #fef08a;
      color: #fffbeb;
      text-shadow: 1px 2px 4px rgba(180, 83, 9, 0.8);
      text-align: center;
    }
    .loader-coin-front {
      font-size: 65px;
      font-weight: 900;
    }
    .loader-coin-back {
      transform: rotateY(180deg);
      font-size: 16px;
      font-weight: 900;
      line-height: 1.2;
    }
  `;

  if (isMaintenanceMode) return <MaintenanceScreen />;
  if (isAdminView) return <AdminCommandCenter token={token} onBack={() => setIsAdminView(false)} />;

  // 🟢 FULL PAGE LOADER FOR INITIAL LOGIN
  if (isAppLoading && !token) return ( 
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", background: "#f8fafc", padding: "20px" }}>
      <style>{globalStyles}</style>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        
        <div className="loader-coin-wrapper" style={{ marginBottom: "25px" }}>
          <div className="loader-coin-inner">
            <div className="loader-coin-front">₹</div>
            <div className="loader-coin-back">SUBHAMS<br/>PMMS</div>
          </div>
        </div>

        <div style={{ background: "white", padding: "12px 24px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
            <div style={{ margin: "0", color: "#0f172a", fontSize: "16px", fontWeight: "900" }}>Please wait...</div>
            <div style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "13px", fontWeight: "700" }}>Waking Server</div>
        </div>
      </div>
    </div>
  );

  if (token && isAppLocked) return ( <><style>{globalStyles}</style><AppLockScreen onUnlock={handleAppUnlock} /></> );

  if (!token) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", backgroundColor: "#f1f5f9", padding: "20px" }}>
      <style>{globalStyles}</style>
      {lockoutTimer > 0 && ( 
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.98)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box', textAlign: 'center' }}>
          <div style={{ background: "rgba(245, 158, 11, 0.1)", padding: "20px", borderRadius: "50%", marginBottom: "20px", border: "1px solid rgba(245, 158, 11, 0.2)" }}><Lock size={48} color="#f59e0b" /></div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 6vw, 2.5rem)', color: 'white', marginBottom: '10px' }}>Security Checkpoint</h1>
          <div style={{ fontSize: '24px', color: '#fbbf24', fontWeight: 'bold', margin: '10px 0' }}>Access restored in: {Math.floor(lockoutTimer / 60)}m {lockoutTimer % 60}s</div>
          <p style={{ margin: '20px 0', textAlign: 'center', maxWidth: '320px', color: '#cbd5e1', lineHeight: '1.5' }}>We've temporarily limited access after multiple failed attempts. <br/><br/><strong>If this was you, please verify your identity to regain access immediately.</strong></p>
          <button onClick={() => { setAuthMode("forgot"); setLockoutTimer(0); localStorage.removeItem('lockoutUntil'); }} style={{ padding: '14px 28px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', width: '100%', maxWidth: '300px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>Unlock via Email</button>
        </div>
      )}
      <div style={{ width: "100%", maxWidth: "400px", backgroundColor: "white", padding: "40px 25px", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", textAlign: "center" }}>
        <h1 className="brand-logo" style={{ marginBottom: "5px", fontSize: "2.5rem" }}>SUBHAMS</h1>
        {authMode === "login" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input style={{ padding: "15px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} placeholder="Username or Email" value={username} onChange={e => setUsername(e.target.value)} disabled={lockoutTimer > 0} />
            <input style={{ padding: "15px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} disabled={lockoutTimer > 0} />
            <p style={{ margin: "0", textAlign: "right", fontSize: "13px", color: "#3b82f6", cursor: "pointer", fontWeight: "bold" }} onClick={() => setAuthMode("forgot")}>Forgot Password?</p>
            <button style={{ padding: "15px", background: lockoutTimer > 0 ? "#94a3b8" : "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }} onClick={login} disabled={lockoutTimer > 0}>Login</button>
            <p style={{ fontSize: "14px", margin: "5px 0" }}>Don't have an account? <span style={{ color: "#3b82f6", cursor: "pointer", fontWeight: "bold" }} onClick={() => setAuthMode("register")}>Create one here</span></p>
            <div style={{ margin: "10px 0", color: "#cbd5e1", fontSize: "14px" }}>────── OR ──────</div>
            <div style={{ display: "flex", justifyContent: "center" }}><GoogleLogin onSuccess={handleGoogleSuccess} onError={() => alert(DEVICE_ERROR_MSG)} /></div>
          </div>
        )}
        {authMode === "register" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <h3 style={{ color: "#10b981", margin: "0 0 10px 0" }}>Create an Account</h3>
            <input style={{ padding: "15px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} placeholder="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <input style={{ padding: "15px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} placeholder="Choose a Username" value={username} onChange={e => setUsername(e.target.value)} />
            <input style={{ padding: "15px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} type="password" placeholder="Strong Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button style={{ padding: "15px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }} onClick={requestRegister}>Send OTP</button>
            <p style={{ fontSize: "14px", margin: "10px 0", cursor: "pointer" }} onClick={() => setAuthMode("login")}>Back to Login</p>
          </div>
        )}
        {authMode === "otp" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <h3 style={{ color: "#f59e0b", margin: "0" }}>Enter OTP Code</h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 10px 0" }}>Code sent to <b>{email}</b></p>
            <input style={{ padding: "15px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "24px", letterSpacing: "5px", textAlign: "center", outline: "none" }} placeholder="6-Digit OTP" type="text" value={otp} onChange={e => setOtp(e.target.value)} />
            <button style={{ padding: "15px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }} onClick={verifyOtpAndRegister}>Verify & Register</button>
            <p style={{ fontSize: "14px", margin: "10px 0", cursor: "pointer" }} onClick={() => setAuthMode("register")}><span style={{ color: "#ef4444" }}>Cancel & Go Back</span></p>
          </div>
        )}
        {authMode === "forgot" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <h3 style={{ color: "#ef4444", margin: "0 0 10px 0" }}>Reset Password</h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 5px 0" }}>Enter your registered email address to receive a secure reset code.</p>
            <input style={{ padding: "15px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} placeholder="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <button style={{ padding: "15px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }} onClick={handleForgotPassword}>Send Reset Code</button>
            <p style={{ fontSize: "14px", margin: "10px 0", cursor: "pointer", color: "#64748b" }} onClick={() => setAuthMode("login")}>Back to Login</p>
          </div>
        )}
        {authMode === "reset_otp" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <h3 style={{ color: "#ef4444", margin: "0" }}>Set New Password</h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 10px 0" }}>Code sent to <b>{email}</b></p>
            <input style={{ padding: "15px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "24px", letterSpacing: "5px", textAlign: "center", outline: "none" }} placeholder="6-Digit OTP" type="text" value={otp} onChange={e => setOtp(e.target.value)} />
            <input style={{ padding: "15px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} type="password" placeholder="Enter New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <button style={{ padding: "15px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }} onClick={handleResetPassword}>Save & Login</button>
            <p style={{ fontSize: "14px", margin: "10px 0", cursor: "pointer" }} onClick={() => setAuthMode("forgot")}><span style={{ color: "#ef4444" }}>Cancel</span></p>
          </div>
        )}
      </div>
     <InstallPopup />
    </div>
  );

  return (
    <div>
      <style>{globalStyles}</style>

      <div className="marquee-container">
        <div className="marquee-text">🚀 Important Note: Welcome to your Subhams Personal Money Management System! Track your income, manage your expenses, and secure your financial future! Thank You visiting My website! Venkata Pavan Kumar.</div>
      </div>
      
      <nav className="nav-bar">
        <h2 className="brand-logo" style={{ fontSize: "1.8rem" }}>Subhams</h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {userProfile.email === 'pavanvenkat63@gmail.com' && (
              <button style={{ padding: "8px 14px", background: "#f59e0b", color: "#0f172a", border: "none", borderRadius: "8px", fontWeight: "900", cursor: "pointer", fontSize: "12px", boxShadow: "0 2px 5px rgba(245, 158, 11, 0.4)" }} onClick={() => setIsAdminView(true)}>⚙️ Admin</button>
          )}

          <div 
            onClick={() => { setEditName(userProfile.username); setShowProfileModal(true); }}
            style={{ 
              display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", 
              background: "rgba(255,255,255,0.1)", padding: "5px 15px 5px 5px", 
              borderRadius: "50px", border: "1px solid rgba(255,255,255,0.2)", transition: "0.2s"
            }}
          >
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b, #fbbf24)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: "#0f172a", fontSize: "16px", textTransform: "uppercase", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {userProfile.username ? userProfile.username.charAt(0) : <User size={16}/>}
            </div>
            <span style={{ fontWeight: "bold", fontSize: "14px", color: "white" }}>
                Settings
            </span>
          </div>
        </div>
      </nav>

      {showProfileModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100vh", background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
            <div style={{ background: "white", padding: "30px", borderRadius: "20px", width: "100%", maxWidth: "400px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", position: "relative" }}>
                <X size={24} color="#64748b" style={{ position: "absolute", top: "20px", right: "20px", cursor: "pointer" }} onClick={() => setShowProfileModal(false)} />
                <h2 style={{ margin: "0 0 20px 0", color: "#0f172a", fontSize: "22px", display: "flex", alignItems: "center", gap: "8px" }}><User size={24} color="#3b82f6" /> Profile Settings</h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <div>
                        <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b", marginBottom: "5px", display: "block" }}>Registered Email (Locked)</label>
                        <div style={{ padding: "12px 15px", background: "#f1f5f9", borderRadius: "8px", color: "#475569", fontSize: "14px", border: "1px dashed #cbd5e1" }}>
                            <Mail size={14} style={{ marginRight: "8px", verticalAlign: "middle" }}/> {userProfile.email || "Google Authenticated"}
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: "12px", fontWeight: "bold", color: "#3b82f6", marginBottom: "5px", display: "block" }}>Display Name</label>
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: "100%", padding: "12px 15px", borderRadius: "8px", border: "1px solid #93c5fd", fontSize: "14px", outline: "none", color: "#0f172a", fontWeight: "bold" }}/>
                    </div>
                    <button onClick={updateProfileName} style={{ padding: "12px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <Check size={18}/> Save Name
                    </button>

                    <div>
                        <label style={{ fontSize: "12px", fontWeight: "bold", color: "#3b82f6", marginBottom: "5px", display: "block" }}>Notification Language / భాష</label>
                        <select value={userProfile.preferred_language || 'en'} onChange={(e) => updateLanguagePreference(e.target.value)} style={{ width: "100%", padding: "12px 15px", borderRadius: "8px", border: "1px solid #93c5fd", fontSize: "14px", outline: "none", color: "#0f172a", fontWeight: "bold", background: "white" }}>
                            <option value="en">English</option><option value="te">తెలుగు (Telugu)</option>
                        </select>
                    </div>

                    <hr style={{ border: "0", borderTop: "1px solid #e2e8f0", margin: "10px 0" }} />

                    <div>
                        <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#0f172a" }}>Smart Alerts</h3>
                        <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 15px 0", lineHeight: "1.4" }}>Receive real-time budget and transaction reminders based on your preferred language.</p>
                        
                        {pushEnabled ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {userProfile.silent_mode ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fef3c7", padding: "10px", borderRadius: "8px", color: "#d97706", fontWeight: "bold", fontSize: "13px" }}><BellOff size={16} /> Notifications Silenced 🔕</div>
                                ) : (
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f0fdf4", padding: "10px", borderRadius: "8px", color: "#10b981", fontWeight: "bold", fontSize: "13px" }}><BellRing size={16} /> Notifications Active (Loud) 🟢</div>
                                )}
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button disabled={isProcessingPush} onClick={() => toggleSilentMode(!userProfile.silent_mode)} style={{ flex: 1, padding: "10px", background: userProfile.silent_mode ? "#10b981" : "#f59e0b", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", opacity: isProcessingPush ? 0.7 : 1 }}>
                                        {isProcessingPush ? "⏳..." : userProfile.silent_mode ? <><Bell size={14}/> Make Loud</> : <><BellOff size={14}/> Mute Sound</>}
                                    </button>
                                    <button disabled={isProcessingPush} onClick={disablePushNotifications} style={{ flex: 1, padding: "10px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", opacity: isProcessingPush ? 0.7 : 1 }}>
                                        {isProcessingPush ? "⏳..." : <><X size={14}/> Turn Off</>}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button disabled={isProcessingPush} onClick={setupPushNotifications} style={{ width: "100%", padding: "12px", background: "#f59e0b", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 10px rgba(245, 158, 11, 0.3)", opacity: isProcessingPush ? 0.7 : 1 }}>
                                {isProcessingPush ? "⏳ Connecting..." : <><Bell size={18}/> Enable Push Notifications</>}
                            </button>
                        )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "10px" }}>
                        <div>
                            <p style={{ margin: 0, fontSize: "13px", fontWeight: "bold", color: "#0f172a" }}>Offline Email Reports</p>
                            <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>Receive summary emails when inactive</p>
                        </div>
                        <button onClick={() => toggleEmailDigest(!userProfile.email_digest_enabled)} style={{ padding: "6px 12px", background: userProfile.email_digest_enabled !== false ? "#10b981" : "#cbd5e1", color: "white", border: "none", borderRadius: "20px", fontWeight: "bold", cursor: "pointer", fontSize: "12px", transition: "0.3s" }}>
                            {userProfile.email_digest_enabled !== false ? "ON" : "OFF"}
                        </button>
                    </div>

                    {localStorage.getItem("subhams_app_lock") !== "true" && (
                        <button style={{ padding: "12px", background: "#f8fafc", color: "#0f172a", border: "1px solid #e2e8f0", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "5px" }} onClick={() => { setShowProfileModal(false); enableAppLock(); }}><Lock size={16} /> Enable Biometric App Lock</button>
                    )}
                </div>
            </div>
        </div>
      )}

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* 🟢 FULL-SCREEN BLOCKING LOADER FOR OVERLAYS */}
        {isAppLoading && (
          <div style={{ position: "fixed", top: "0", left: "0", width: "100vw", height: "100vh", background: "rgba(241, 245, 249, 0.9)", backdropFilter: "blur(10px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "25px", zIndex: 9999 }}>
            
            <div className="loader-coin-wrapper">
              <div className="loader-coin-inner">
                <div className="loader-coin-front">₹</div>
                <div className="loader-coin-back">SUBHAMS<br/>PMMS</div>
              </div>
            </div>

            <div style={{ background: "white", padding: "12px 24px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", textAlign: "center" }}>
                <div style={{ margin: "0", color: "#0f172a", fontSize: "16px", fontWeight: "900" }}>Please wait...</div>
                <div style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "13px", fontWeight: "700" }}>Connecting to Server</div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: '25px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 style={{ margin: 0, fontSize: '28px', color: '#0f172a', fontWeight: '900', letterSpacing: '-0.5px' }}>Hello, <span style={{ color: '#3b82f6' }}>{userProfile.username || "User"}</span> 👋</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '15px', fontWeight: '600' }}>Here is your current financial overview.</p>
        </div>

        {!pushEnabled && (
            <div style={{ background: "linear-gradient(135deg, #2563eb, #1e3a8a)", borderRadius: "16px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", color: "white", boxShadow: "0 10px 25px rgba(37, 99, 235, 0.25)", flexWrap: "wrap", gap: "15px" }}>
                <div>
                    <h3 style={{ margin: "0 0 5px 0", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Bell size={18} color="#fcd34d" /> Enable Smart Alerts</h3>
                    <p style={{ margin: 0, fontSize: "13px", color: "#bfdbfe", maxWidth: "100%" }}>Get critical budget warnings and updates even when the app is closed.</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <select value={userProfile.preferred_language || 'en'} onChange={(e) => updateLanguagePreference(e.target.value)} style={{ padding: "8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.3)", outline: "none", fontSize: "13px", fontWeight: "bold", background: "rgba(0,0,0,0.2)", color: "white", cursor: "pointer" }}>
                        <option value="en" style={{color: "black"}}>English</option><option value="te" style={{color: "black"}}>తెలుగు (Telugu)</option>
                    </select>
                    <button disabled={isProcessingPush} onClick={setupPushNotifications} style={{ background: "white", color: "#1e3a8a", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "bold", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap", opacity: isProcessingPush ? 0.7 : 1 }}>
                        {isProcessingPush ? "⏳..." : "Enable"}
                    </button>
                </div>
            </div>
        )}

        <div className="dashboard-grid">
          <div className="metric-card"><div className="metric-title">TOTAL INCOME <br/>ఆదాయం</div><div className="metric-value" style={{ color: "#10b981" }}>₹{income}</div></div>
          <div className="metric-card"><div className="metric-title">TOTAL EXPENSE <br/>ఖర్చు</div><div className="metric-value" style={{ color: "#ef4444" }}>₹{expense}</div></div>
          <div className="metric-card"><div className="metric-title">PENDING <br/>పెండింగ్</div><div className="metric-value" style={{ color: "#f59e0b" }}>₹{pending}</div></div>
          <div className="metric-card" style={{ backgroundColor: balance >= 0 ? "#f0fdf4" : "#fef2f2" }}><div className="metric-title">BALANCE <br/>నిల్వ</div><div className="metric-value" style={{ color: balance >= 0 ? "#3b82f6" : "#ef4444" }}>₹{balance}</div></div>
          
          {/* 🟢 3D CENTER SPINNING COIN IN DASHBOARD */}
          <div className="coin-wrapper">
            <div className="coin-inner">
              <div className="coin-front">₹</div>
              <div className="coin-back">SUBHAMS<br/>PMMS</div>
            </div>
          </div>
        </div>

        {smartMsg && (
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "20px", marginBottom: "20px", border: "1px solid #e2e8f0" }}>
            <div className={insightClass}><h4 style={{ margin: "0 0 8px 0" }}>💡 Subhams Insights:</h4><div style={{ lineHeight: "1.5" }}>{smartMsg} <br /><small style={{ opacity: 0.8 }}>{smartMsgTe}</small></div></div>
          </div>
        )}

        <div className="action-grid">
          <div ref={formRef} style={{ backgroundColor: "white", borderRadius: "16px", padding: "25px", border: "1px solid #e2e8f0", alignSelf: "start" }}>
            
            <h3 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                {editingId ? "✏️ Edit Transaction" : "➕ Add Money"}
                <span onClick={() => setShowTxInfo(!showTxInfo)} style={{ cursor: "pointer", background: "#e2e8f0", color: "#3b82f6", borderRadius: "50%", width: "24px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }}>
                    <Info size={16} />
                </span>
            </h3>
            
            {showTxInfo && (
                <div style={{ background: "#eff6ff", border: "1px dashed #3b82f6", padding: "12px", borderRadius: "8px", fontSize: "13px", color: "#1e40af", marginBottom: "15px", lineHeight: "1.6" }}>
                    <b>How to save:</b><br/>
                    1. Enter title (e.g., person's name or purpose).<br/>
                    2. Enter amount.<br/>
                    3. Select a category and date.<br/>
                    4. Click the green (+ Income), red (- Expense), or yellow (⏳ Pending) button below to securely save your record.
                </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} placeholder="Title (e.g., Rent)" value={title} onChange={e => setTitle(e.target.value)} />
              <input style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} type="number" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} />
              <select style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", backgroundColor: "white", outline: "none" }} value={category} onChange={e => setCategory(e.target.value)}>
                <optgroup label="Income Sources"><option value="Salary">💰 Salary</option><option value="Investment">📈 Investment</option><option value="Business">💼 Business</option></optgroup>
                <optgroup label="Expense / Pending Needs"><option value="Food">🍔 Food</option><option value="Travel">✈️ Travel</option><option value="Shopping">🛍️ Shopping</option><option value="Recharge">📱 Recharge</option><option value="Bills">🧾 Bills</option><option value="Tax">🏛️ Tax</option><option value="Health">🏥 Health</option><option value="Education">🎓 Education</option><option value="Other">📌 Other</option></optgroup>
              </select>
              <input style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} type="date" value={date || ""} onChange={e => setDate(e.target.value)} />
            </div>
            
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button style={{ flex: 1, padding: "12px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }} onClick={() => handleSubmit("income")}>+ Income</button>
              <button style={{ flex: 1, padding: "12px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }} onClick={() => handleSubmit("expense")}>- Expense</button>
              <button style={{ flex: 1, padding: "12px", background: "#f59e0b", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }} onClick={() => handleSubmit("pending")}>⏳ Pending</button>
            </div>
            
            {txSuccessMsg && (
                <div style={{ marginTop: "15px", padding: "12px", background: "#f0fdf4", color: "#065f46", border: "1px dashed #10b981", borderRadius: "8px", fontSize: "14px", fontWeight: "bold", textAlign: "center", animation: "fade-in 0.5s" }}>
                    {txSuccessMsg}
                </div>
            )}

            {editingId && <button style={{ width: "100%", padding: "14px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }} onClick={cancelEdit}>Cancel Edit</button>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
              <h3 style={{ margin: "0 0 15px 0" }}>📜 History</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                <input style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} placeholder="Search Title or Amount..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <select style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", backgroundColor: "white", outline: "none" }} value={filterType} onChange={e => setFilterType(e.target.value)}>
                  <option value="All">All Types</option><option value="income">Income</option><option value="expense">Expense</option><option value="pending">Pending</option>
                </select>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ flex: "1 1 140px", display: "flex", flexDirection: "column" }}><label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b", marginBottom: "5px" }}>From Date:</label><input type="date" style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} value={filterStartDate || ""} onChange={e => setFilterStartDate(e.target.value)} /></div>
                  <div style={{ flex: "1 1 140px", display: "flex", flexDirection: "column" }}><label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b", marginBottom: "5px" }}>To Date:</label><input type="date" style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} value={filterEndDate || ""} onChange={e => setFilterEndDate(e.target.value)} /></div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                  <button style={{ flex: 1, padding: "14px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }} onClick={applyFilters}>Filter</button>
                  <button style={{ flex: 1, padding: "14px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }} onClick={clearFilters}>Clear</button>
                </div>
              </div>

              <div className="scrollable-history" style={{ flex: 1, overflowY: "auto", maxHeight: showAllHistory ? "400px" : "auto", paddingRight: "5px" }}>
                {transactions.length === 0 && <p style={{ color: "#94a3b8", textAlign: "center" }}>No records found.</p>}
                {(showAllHistory ? transactions : transactions.slice(0, 5)).map((t) => {
                  const isInc = t.type === "income"; const isExp = t.type === "expense"; const bgColor = isInc ? "#f0fdf4" : isExp ? "#fef2f2" : "#fffbeb"; const borderColor = isInc ? "#10b981" : isExp ? "#ef4444" : "#f59e0b"; const statusText = isInc ? "RECEIVED" : isExp ? "PAID" : "PENDING";
                  return (
                    <div key={t._id} className="history-item" style={{ backgroundColor: bgColor, borderLeft: `5px solid ${borderColor}` }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><b style={{ color: borderColor, fontSize: "1.2rem" }}>{isInc ? "+" : isExp ? "-" : "⏳"} ₹{t.amount}</b><span style={{ backgroundColor: borderColor, color: "white", padding: "2px 6px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: "bold" }}>{statusText}</span></div>
                        <div style={{ color: "#334155", fontSize: "0.95rem", marginTop: "4px", fontWeight: "600" }}>{t.title} <span style={{ background: "white", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", marginLeft: "5px", color: "#64748b", border: "1px solid #e2e8f0" }}>{t.category || "Other"}</span></div>
                        <div style={{ fontSize: "0.80rem", color: "#94a3b8", marginTop: "4px", fontWeight: "bold" }}>{formatDate(t.date)}</div>
                      </div>
                      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                        <span style={{ cursor: "pointer", color: "#3b82f6", fontWeight: "bold" }} onClick={() => handleEdit(t)}>Edit</span>
                        <span style={{ cursor: "pointer", color: "#ef4444", fontWeight: "bold" }} onClick={() => deleteTransaction(t._id)}>Del</span>
                      </div>
                    </div>
                  );
                })}
                {transactions.length > 5 && (
                  <div style={{ textAlign: "center", marginTop: "15px", marginBottom: "10px" }}><button onClick={() => setShowAllHistory(!showAllHistory)} style={{ background: "white", border: "1px solid #cbd5e1", padding: "10px 20px", borderRadius: "20px", color: "#3b82f6", fontWeight: "bold", cursor: "pointer", fontSize: "14px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", transition: "all 0.2s ease" }}>{showAllHistory ? "Show Less ↑" : `View More Transactions (${transactions.length - 5} hidden) ↓`}</button></div>
                )}
              </div>
            </div>
            {transactions.length > 0 && (
              <button onClick={downloadWhitePaper} disabled={isDownloading} style={{ width: "100%", padding: "20px", background: isDownloading ? "#cbd5e1" : "#1e293b", color: "white", border: "none", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "15px", cursor: isDownloading ? "not-allowed" : "pointer" }} >
                <span style={{ fontSize: "1.8rem" }}>{isDownloading ? "⏳" : "📄"}</span><div style={{ textAlign: "left" }}><div style={{ fontWeight: "bold", fontSize: "16px" }}>{isDownloading ? "Generating Filtered PDF..." : "Download Filtered Report"}</div></div>
              </button>
            )}
          </div>
        </div>

        <div className="action-grid" style={{ marginTop: "20px" }}>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ textAlign: "center", marginTop: 0 }}>📊 Overview</h3>
            <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={pieData} innerRadius={50} outerRadius={70} dataKey="value"><Cell fill="#10b981" /><Cell fill="#ef4444" /><Cell fill="#f59e0b" /></Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
          </div>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ textAlign: "center", marginTop: 0 }}>📈 Monthly Trends</h3>
            <ResponsiveContainer width="100%" height={220}><BarChart data={monthlyChartData}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="income" fill="#10b981" /><Bar dataKey="expense" fill="#ef4444" /></BarChart></ResponsiveContainer>
          </div>
        </div>

        <div style={{ maxWidth: '750px', margin: '20px auto 0 auto', backgroundColor: "white", borderRadius: "16px", padding: "25px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}><Calculator size={22} color="#3b82f6" /> Date & Interest Calculator</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", marginBottom: "20px", marginTop: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}><label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b", marginBottom: "5px" }}>Principal (₹)</label><input type="number" style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} placeholder="e.g., 10000" value={interestData.principal} onChange={(e) => setInterestData({...interestData, principal: e.target.value})} /></div>
            
            <div style={{ display: "flex", flexDirection: "column" }}><label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b", marginBottom: "5px" }}>Calculation Method</label>
              <select style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", backgroundColor: "white", outline: "none", fontWeight: "bold" }} value={interestData.interestType} onChange={(e) => setInterestData({...interestData, interestType: e.target.value})}>
                <option value="Local">Local Style (e.g., 2, 3 Rupees Interest)</option>
                <option value="Percentage">Bank Style (Annual % Rate)</option>
              </select>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column" }}><label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b", marginBottom: "5px" }}>Interest Rate</label><input type="number" style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} placeholder={interestData.interestType === 'Local' ? "e.g., 2 (for 2 Rupees)" : "e.g., 12 (for 12%)"} value={interestData.rate} onChange={(e) => setInterestData({...interestData, rate: e.target.value})} /></div>
            
            <div style={{ display: "flex", flexDirection: "column" }}><label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b", marginBottom: "5px" }}>Start Date</label><input type="date" style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} value={interestData.startDate} onChange={(e) => setInterestData({...interestData, startDate: e.target.value})} /></div>
            
            <div style={{ display: "flex", flexDirection: "column" }}><label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b", marginBottom: "5px" }}>End Date</label><input type="date" style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} value={interestData.endDate} onChange={(e) => setInterestData({...interestData, endDate: e.target.value})} /></div>

            <div style={{ display: "flex", flexDirection: "column" }}><label style={{ fontSize: "12px", fontWeight: "bold", color: "#3b82f6", marginBottom: "5px" }}>Share Language / భాష</label>
              <select style={{ padding: "14px", border: "1px solid #93c5fd", borderRadius: "8px", fontSize: "14px", backgroundColor: "white", outline: "none", fontWeight: "bold" }} value={interestData.shareLang} onChange={(e) => setInterestData({...interestData, shareLang: e.target.value})}>
                <option value="en">English (Share)</option>
                <option value="te">తెలుగు (Share)</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "10px" }}>
            <button style={{ flex: 1, padding: "16px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 10px rgba(59, 130, 246, 0.3)" }} onClick={calculateInterest}>Calculate Amount</button>
            <button style={{ padding: "16px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }} onClick={() => { setInterestData({ principal: "", startDate: "", endDate: "", interestType: "Local", rate: "", shareLang: "en" }); setInterestResult(null); }}>Clear</button>
          </div>
          
          {interestResult && (
            <div className="insight-green" style={{ marginTop: "20px", padding: "20px", borderRadius: "12px", borderLeft: "5px solid #10b981", textAlign: 'center', backgroundColor: "#f0fdf4" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "15px", borderBottom: "1px solid #cbd5e1", paddingBottom: "15px" }}>
                <div style={{ flex: "1 1 30%" }}><p style={{ margin: 0, fontSize: "13px", color: "#64748b", fontWeight: "bold" }}>Duration</p><h4 style={{ margin: "5px 0 0 0", color: "#0f172a", fontSize: "18px" }}>{interestResult.totalDays} Days <br/><span style={{fontSize: "13px", color: "#64748b"}}>({interestResult.totalMonths.toFixed(1)} Months)</span></h4></div>
                <div style={{ flex: "1 1 30%" }}><p style={{ margin: 0, fontSize: "13px", color: "#64748b", fontWeight: "bold" }}>Total Interest</p><h4 style={{ margin: "5px 0 0 0", color: "#065f46", fontSize: "18px" }}>₹{Math.round(interestResult.calculatedInterest)}</h4></div>
                <div style={{ flex: "1 1 30%" }}><p style={{ margin: 0, fontSize: "13px", color: "#64748b", fontWeight: "bold" }}>Maturity Amount</p><h4 style={{ margin: "5px 0 0 0", color: "#065f46", fontSize: "22px", fontWeight: "900" }}>₹{Math.round(interestResult.finalAmount)}</h4></div>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px", backgroundColor: "white", padding: "10px", borderRadius: "8px", border: "1px dashed #10b981" }}>
                <div><p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Daily Growth</p><h4 style={{ margin: 0, color: "#3b82f6", fontSize: "16px" }}>+₹{interestResult.dailyInterest.toFixed(2)}/day</h4></div>
                <div><p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Weekly Growth</p><h4 style={{ margin: 0, color: "#3b82f6", fontSize: "16px" }}>+₹{Math.round(interestResult.weeklyInterest)}/week</h4></div>
              </div>

              <button onClick={handleShare} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "14px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)" }}>
                <Share2 size={20} /> Share Result
              </button>
            </div>
          )}
        </div>
      </div>
      
      <footer style={{ padding: "50px 20px", marginTop: "60px", background: "linear-gradient(to bottom, #ffffff, #f8fafc)", borderTop: "1px solid #e2e8f0", boxShadow: "0 -10px 30px rgba(0, 0, 0, 0.02)", display: "flex", flexDirection: "column", alignItems: "center", gap: "15px", position: "relative", zIndex: 1 }}>
        <div style={{ background: "rgba(59, 130, 246, 0.1)", padding: "8px 16px", borderRadius: "20px", color: "#3b82f6", fontWeight: "800", fontSize: "13px", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "6px", textTransform: "uppercase" }}><Code size={16} /> Personal Money Management System</div>
        <div style={{ textAlign: "center", marginTop: "10px" }}><p style={{ margin: "0", fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Designed & Engineered by</p><h3 style={{ margin: "8px 0", fontSize: "26px", color: "#0f172a", fontWeight: "900", letterSpacing: "-0.5px" }}>Venkata Pavan Kumar Amarthaluri</h3></div>
        
        <div style={{ display: "flex", gap: "15px", marginTop: "15px", flexWrap: "wrap", justifyContent: "center" }}>
          <a href="https://hub.subhamsnetworks.in/" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", background: "#3b82f6", color: "white", borderRadius: "12px", textDecoration: "none", fontWeight: "700", boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)", transition: "all 0.2s ease" }}><ExternalLink size={18} /> Subhams Hub</a>
          <a href="https://agent.subhamsnetworks.in/" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", background: "#10b981", color: "white", borderRadius: "12px", textDecoration: "none", fontWeight: "700", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)", transition: "all 0.2s ease" }}><ExternalLink size={18} /> Subhams Xerox</a>
        </div>
        
        <a href="mailto:pavanvenkat63@gmail.com" style={{ marginTop: "5px", display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "white", color: "#475569", borderRadius: "12px", textDecoration: "none", fontWeight: "700", border: "1px solid #cbd5e1", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", transition: "all 0.2s ease" }}><Mail size={16} color="#f59e0b" /> pavanvenkat63@gmail.com</a>
        
        <p style={{ margin: "20px 0 0 0", fontSize: "13px", color: "#94a3b8", fontWeight: "500" }}>© {new Date().getFullYear()} Subhams PMMS. All Rights Reserved.</p>
        
        {/* 🟢 SECURE LOGOUT BUTTON DIRECTLY BELOW COPYRIGHT TEXT */}
        <div style={{ marginTop: "20px", width: "100%", textAlign: "center" }}>
            <button onClick={logout} style={{ background: "transparent", color: "#ef4444", border: "2px solid #ef4444", padding: "8px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: "bold", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", transition: "all 0.2s ease" }}>
                <Power size={14} /> Logout
            </button>
        </div>
      </footer>

      <div style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '25px', position: 'relative', zIndex: 1 }}>
        <style>{`@keyframes premium-shine { 0% { background-position: -200% center; } 100% { background-position: 200% center; } } @keyframes float-sparkle { 0%, 100% { transform: translateY(0px) scale(0.8); opacity: 0.4; } 50% { transform: translateY(-4px) scale(1.2); opacity: 1; filter: drop-shadow(0 0 6px #fbbf24); } } @keyframes line-breathe { 0%, 100% { width: 30px; opacity: 0.3; } 50% { width: 60px; opacity: 0.8; box-shadow: 0 0 10px #3b82f6; } } .subhams-brand-text { background: linear-gradient(90deg, #3b82f6, #a855f7, #ec4899, #3b82f6); background-size: 200% auto; color: transparent; -webkit-background-clip: text; background-clip: text; animation: premium-shine 3.5s linear infinite; font-weight: 900; font-size: 14px; letter-spacing: 2px; }`}</style>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><span style={{ animation: 'float-sparkle 2s ease-in-out infinite', fontSize: '13px' }}>✨</span><p style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', margin: 0, letterSpacing: '1.5px' }}>POWERED BY <span className="subhams-brand-text">SUBHAMS</span></p><span style={{ animation: 'float-sparkle 2s ease-in-out infinite 1s', fontSize: '13px' }}>✨</span></div>
        <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #3b82f6, #a855f7, transparent)', margin: '8px auto 0 auto', borderRadius: '10px', animation: 'line-breathe 3s ease-in-out infinite' }}></div>
      </div>
   <InstallPopup />
    </div>
  );
}

const smStyles = {
    container: { minHeight: '100vh', width: '100%', backgroundColor: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
    card: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', backgroundColor: '#0f172a', borderRadius: '16px', padding: '40px', maxWidth: '550px', width: '100%', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7)', border: '1px solid #1e293b' },
    brandTitle: { margin: '0 0 15px 0', fontSize: '38px', color: '#ffffff', fontWeight: '900', letterSpacing: '-1px' },
    secureBadge: { display: 'inline-block', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '6px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '25px' },
    subtitle: { color: '#cbd5e1', fontSize: '16px', lineHeight: '1.6', margin: '0 0 30px 0' },
    timePanelContainer: { display: 'flex', flexDirection: window.innerWidth < 500 ? 'column' : 'row', width: '100%', gap: '15px', marginBottom: '30px' },
    liveTimeBox: { flex: 1, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '15px', borderTop: '4px solid #f59e0b' },
    restorePanel: { flex: 1, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '15px', borderTop: '4px solid #10b981' },
    timeLabel: { color: '#94a3b8', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px' },
    liveTimeValue: { color: '#f59e0b', fontSize: '20px', fontWeight: '900', letterSpacing: '1px' },
    restoreTime: { color: '#10b981', fontSize: '20px', fontWeight: '900', letterSpacing: '0.5px' },
    footerText: { color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', margin: '0' }
};

export default App;
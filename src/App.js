import React, { useState, useEffect, useCallback, useRef } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { GoogleLogin } from '@react-oauth/google';
import jsPDF from "jspdf";
import html2canvas from "html2canvas"; 
import { Fingerprint, Calculator, Lock, Mail, ExternalLink, Code } from 'lucide-react';

// 🛠️ ==========================================
// 🛠️ MAINTENANCE MODE SETTINGS (MASTER CONTROL)
// 🛠️ ==========================================
const isMaintenanceMode = false; 
const targetRestoreTime = "02-06-2026 at 10:00 AM"; 
const API = process.env.REACT_APP_BACKEND_URL || "https://subhams-backend.onrender.com/api";

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

// 🟢 HELPER FUNCTIONS FOR APP LOCK CRYPTOGRAPHY
const bufferToBase64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const base64ToBuffer = (b64) => Uint8Array.from(atob(b64), c => c.charCodeAt(0));

// 🛡️ Premium Finance Maintenance Component
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

// 🔒 THE APP LOCK SCREEN (Hides Data until Fingerprint/PIN is entered)
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
  const [isServerWaking, setIsServerWaking] = useState(!!localStorage.getItem("token")); 
  const [authMode, setAuthMode] = useState("login"); 
  
  // 🟢 APP LOCK STATE
  const [isAppLocked, setIsAppLocked] = useState(!!localStorage.getItem("token") && localStorage.getItem("subhams_app_lock") === "true");
  
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken"));
  
  const [email, setEmail] = useState(""); 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(""); 
  
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); 
  
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
  const [showAllHistory, setShowAllHistory] = useState(false);
  
  const [interestData, setInterestData] = useState({ principal: "", rate: "", time: "" });
  const [interestResult, setInterestResult] = useState({});

  const formRef = useRef(null); 

  const refreshAuthToken = useCallback(async () => {
    if (!refreshToken || refreshToken === "null") return logout();
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
      } else { logout(); return null; }
    } catch (err) { logout(); return null; }
  }, [refreshToken]);

  // 🟢 1. ENABLE APP LOCK (Sets up FIDO2 Credential)
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
      
      // Save the credential ID locally to trigger the lock screen next time
      localStorage.setItem("subhams_app_lock_id", bufferToBase64(credential.rawId));
      localStorage.setItem("subhams_app_lock", "true");
      alert("🔒 App Lock Enabled! Your financial data is now secure.");
    } catch (err) { alert("App Lock setup cancelled."); }
  };

  // 🟢 2. UNLOCK APP (Prompts for Fingerprint/PIN to unhide data)
  const handleAppUnlock = async () => {
    try {
      const credentialIdString = localStorage.getItem("subhams_app_lock_id");
      if (!credentialIdString) {
          setIsAppLocked(false); return;
      }
      
      const credentialId = base64ToBuffer(credentialIdString);
      const challenge = new Uint8Array(32); window.crypto.getRandomValues(challenge);
      
      // Trigger the native OS Screen Lock
      await navigator.credentials.get({ 
          publicKey: { 
              challenge, 
              allowCredentials: [{ type: "public-key", id: credentialId }],
              userVerification: "required", 
              timeout: 60000 
          } 
      });
      
      // If fingerprint/PIN is correct, unhide the dashboard!
      setIsAppLocked(false);
    } catch (err) { alert("Unlock failed. Please try again."); } 
  };

  const login = async () => {
    if (!username || !password) return alert("Enter username and password");
    setIsServerWaking(true); 
    try {
      const res = await fetch(`${API}/auth/login`, { 
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) 
      });
      const data = await res.json();
      if (res.ok && data.accessToken) { 
        localStorage.setItem("token", data.accessToken); 
        localStorage.setItem("refreshToken", data.refreshToken);
        setToken(data.accessToken); 
        setRefreshToken(data.refreshToken);
        
        // If App Lock was previously enabled on this device, lock the screen upon login
        if (localStorage.getItem("subhams_app_lock") === "true") setIsAppLocked(true);
      } else { alert(data.error || "Login failed"); }
    } catch (err) { alert("Backend server is offline."); }
    finally { setIsServerWaking(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsServerWaking(true);
    try {
      const res = await fetch(`${API}/auth/google-login`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: credentialResponse.credential })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.accessToken); localStorage.setItem("refreshToken", data.refreshToken);
        setToken(data.accessToken); setRefreshToken(data.refreshToken);
        
        // If App Lock was previously enabled on this device, lock the screen upon login
        if (localStorage.getItem("subhams_app_lock") === "true") setIsAppLocked(true);
      } else { alert("Google Auth failed in backend."); }
    } catch (err) { alert("Server is offline."); }
    finally { setIsServerWaking(false); }
  };

  const requestRegister = async () => {
    if (!email || !username || !password) return alert("Enter email, username, and password");
    setIsServerWaking(true);
    try {
      const res = await fetch(`${API}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, username, password }) });
      const data = await res.json();
      if (res.ok) { alert("OTP sent to your email!"); setAuthMode("otp"); } else { alert(data.error || "Registration failed"); }
    } catch (err) { alert("Backend server is offline."); } finally { setIsServerWaking(false); }
  };

  const verifyOtpAndRegister = async () => {
    if (!otp) return alert("Enter the OTP sent to your email");
    setIsServerWaking(true);
    try {
      const res = await fetch(`${API}/auth/verify-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, username, password, otp }) });
      const data = await res.json();
      if (res.ok) { alert("Success! You can now log in."); setAuthMode("login"); setPassword(""); setOtp(""); } else { alert(data.error || "Invalid OTP"); }
    } catch (err) { alert("Backend server is offline."); } finally { setIsServerWaking(false); }
  };

  const logout = () => { 
    localStorage.removeItem("token"); localStorage.removeItem("refreshToken");
    setToken(null); setRefreshToken(null);
    setTransactions([]); setAllTransactions([]); setMonthlyChartData([]); setInsights(null); 
    setAuthMode("login");
  };

  const fetchAllData = useCallback(async () => {
    if (!token || token === "null" || isMaintenanceMode || isAppLocked) { setIsServerWaking(false); return; }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [tRes, mRes, iRes] = await Promise.all([
        fetch(`${API}/transactions`, { headers }), fetch(`${API}/transactions/monthly`, { headers }), fetch(`${API}/transactions/insights`, { headers })
      ]);

      if (tRes.status === 401 || tRes.status === 403) { 
        const newToken = await refreshAuthToken();
        if (newToken) fetchAllData(); 
        return; 
      }

      const tData = await tRes.json(); const mData = await mRes.json(); const iData = await iRes.json();
      if (Array.isArray(tData)) { setTransactions(tData); setAllTransactions(tData); }
      if (Array.isArray(mData)) setMonthlyChartData(mData);
      setInsights(iData);
    } catch (err) { console.error("Fetch Error:", err); } 
    finally { setIsServerWaking(false); }
  }, [token, refreshAuthToken, isAppLocked]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const downloadWhitePaper = async () => {
    if (transactions.length === 0) return alert("No transactions to download!");
    setIsDownloading(true); 

    const pdfIncome = transactions.filter(t => t.type === "income").reduce((a, b) => a + Number(b.amount), 0);
    const pdfExpense = transactions.filter(t => t.type === "expense").reduce((a, b) => a + Number(b.amount), 0);
    const pdfPending = transactions.filter(t => t.type === "pending").reduce((a, b) => a + Number(b.amount), 0);
    const pdfBalance = pdfIncome - pdfExpense;

    const reportDiv = document.createElement("div");
    reportDiv.style.position = "absolute"; 
    reportDiv.style.left = "-9999px"; 
    reportDiv.style.width = "800px"; 
    reportDiv.style.padding = "40px";
    reportDiv.style.backgroundColor = "#ffffff"; 
    reportDiv.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    reportDiv.style.color = "#0f172a";

    reportDiv.innerHTML = `
      <div style="position: relative; z-index: 1;">
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

        <table style="width: 100%; border-collapse: separate; border-spacing: 0 8px; text-align: left; font-size: 15px;">
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
            ${transactions.map((t) => {
                const isInc = t.type === 'income';
                const isExp = t.type === 'expense';
                
                const tColor = isInc ? '#10b981' : isExp ? '#ef4444' : '#f59e0b';
                const bgTint = isInc ? '#f0fdf4' : isExp ? '#fef2f2' : '#fffbeb';
                const displayStatus = isInc ? 'RECEIVED' : isExp ? 'PAID' : 'PENDING';

                return `
              <tr style="background-color: ${bgTint};">
                <td style="padding: 18px 15px; border-radius: 8px 0 0 8px; border-left: 4px solid ${tColor}; color: #475569; font-weight: 500;">
                  ${formatDate(t.date)}
                </td>
                <td style="padding: 18px 15px; font-weight: 800; color: #0f172a; font-size: 16px;">${t.title}</td>
                <td style="padding: 18px 15px;">
                  <span style="background: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; border: 1px solid #cbd5e1; color: #475569; font-weight: bold;">${t.category || "Other"}</span>
                </td>
                <td style="padding: 18px 15px; font-weight: 900; color: ${tColor}; letter-spacing: 1px;">${displayStatus}</td>
                <td style="padding: 18px 15px; font-weight: 900; text-align: right; color: ${tColor}; font-size: 16px; border-radius: 0 8px 8px 0;">₹${t.amount}</td>
              </tr>
            `}).join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 40px; border-top: 2px dashed #cbd5e1; padding-top: 20px; text-align: center; color: #64748b;">
          <p style="margin: 0; font-weight: bold; font-size: 14px;">Subhams Personal Money Management System</p>
          <p style="margin: 5px 0 0 0; font-size: 12px;">Digitally generated and cryptographically secure. Engineered by A. Venkata Pavan Kumar.</p>
        </div>
      </div>
    `;

    document.body.appendChild(reportDiv);

    try {
      const canvas = await html2canvas(reportDiv, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF("p", "mm", "a4");
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        doc.addPage();
        doc.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      doc.save(`Subhams_Report_${formatDate(new Date())}.pdf`);
    } catch (error) { alert("Failed to create PDF. Please try again."); } 
    finally { document.body.removeChild(reportDiv); setIsDownloading(false); }
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
        setTitle(""); setAmount(""); setEditingId(null); setCategory("Other"); setDate(new Date().toISOString().split('T')[0]); fetchAllData(); 
      } else { const errData = await res.json(); alert("Error: " + errData.message); }
    } catch (err) { alert("Server Error."); }
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
    } catch (err) { alert("Network Error."); }
  };

  const applyFilters = async () => {
    try {
      const query = new URLSearchParams({ type: filterType, category: filterCategory, search: searchQuery, startDate: filterStartDate, endDate: filterEndDate }).toString();
      const res = await fetch(`${API}/transactions/filter?${query}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json(); if (Array.isArray(data)) setTransactions(data); 
    } catch (err) { console.error("Search failed:", err); }
  };

  const clearFilters = () => { setFilterType("All"); setFilterCategory("All"); setSearchQuery(""); setFilterStartDate(""); setFilterEndDate(""); fetchAllData(); };

  const calculateInterest = async () => {
    try {
      const res = await fetch(`${API}/transactions/interest`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(interestData) });
      const data = await res.json(); setInterestResult(data);
    } catch (err) { alert("Failed to calculate interest"); }
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
    if (income > 0 && expense === 0) { 
      smartMsg = `100% of income (₹${income}) has been saved.`; smartMsgTe = `100% ఆదాయం (₹${income}) ఆదా చేయబడింది.`; insightClass = "insight-green"; 
    } else if (expense > income && income > 0) { 
      const spendPercent = Math.round((expense / income) * 100);
      smartMsg = `Total expenses equal ${spendPercent}% of income. Deficit: ₹${expense - income}. Top expense: ${topDrain} (₹${topAmount}).`; 
      smartMsgTe = `ఖర్చులు ఆదాయంలో ${spendPercent}%. లోటు: ₹${expense - income}. ప్రధాన ఖర్చు: ${topDrain} (₹${topAmount}).`; insightClass = "insight-red"; 
    } else if (expense > 0 && income === 0) { 
      smartMsg = `Logged ₹${expense} in expenses with no income recorded.`; smartMsgTe = `₹${expense} ఖర్చు నమోదు చేయబడింది, కానీ ఆదాయం లేదు.`; insightClass = "insight-red"; 
    } else { 
      const spendPercent = Math.round((expense / income) * 100); const savePercent = 100 - spendPercent;
      smartMsg = `Saved ${savePercent}% | Spent ${spendPercent}%. Top expense: ${topDrain} (₹${topAmount}).`; 
      smartMsgTe = `${savePercent}% ఆదా చేశారు | ${spendPercent}% ఖర్చు చేశారు. ప్రధాన ఖర్చు: ${topDrain} (₹${topAmount}).`; 
      if (spendPercent <= 30) insightClass = "insight-green"; else if (spendPercent >= 75) insightClass = "insight-red"; else insightClass = "insight-blue"; 
    }
  }

  const globalStyles = `
    * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    body { background-color: #f1f5f9; margin: 0; color: #334155; }
    .nav-bar { background: #0f172a; color: white; padding: 15px 5%; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 1000; }
    .container { max-width: 1200px; margin: 0 auto; padding: 15px; }
    .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin-bottom: 20px; }
    .action-grid { display: grid; grid-template-columns: 35% 65%; gap: 20px; }
    @media (max-width: 900px) { .action-grid { grid-template-columns: 1fr; } }
    .metric-card { text-align: center; padding: 20px; border-radius: 12px; background: white; border: 1px solid #e2e8f0; }
    .metric-title { font-size: 0.85rem; color: #64748b; font-weight: bold; letter-spacing: 1px; }
    .metric-value { font-size: 2rem; font-weight: 800; margin: 10px 0 0 0; }
    .history-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #e2e8f0; margin-bottom: 8px; border-radius: 8px; transition: 0.2s; }
    .spinner { width: 50px; height: 50px; border: 5px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
    .marquee-container { background-color: #1e293b; color: #fbbf24; padding: 10px; overflow: hidden; white-space: nowrap; }
    .marquee-text { display: inline-block; animation: scrollLeft 30s linear infinite; font-weight: 500; letter-spacing: 0.5px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes scrollLeft { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }
    .brand-logo { font-size: 2.2rem; font-weight: 900; letter-spacing: -1px; margin: 0; background: linear-gradient(45deg, #f59e0b, #facc15); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .scrollable-history::-webkit-scrollbar { width: 6px; }
    .scrollable-history::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
    .scrollable-history::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    .insight-green { background: #f0fdf4; border-left: 5px solid #10b981; color: #065f46; padding: 15px; border-radius: 8px;}
    .insight-red { background: #fef2f2; border-left: 5px solid #ef4444; color: #991b1b; padding: 15px; border-radius: 8px;}
    .insight-blue { background: #eff6ff; border-left: 5px solid #3b82f6; color: #1e40af; padding: 15px; border-radius: 8px;}
  `;

  if (isMaintenanceMode) return <MaintenanceScreen />;

  if (isServerWaking) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", backgroundColor: "#f1f5f9", padding: "20px" }}>
      <style>{globalStyles}</style>
      <div style={{ width: "100%", maxWidth: "400px", backgroundColor: "white", padding: "40px 20px", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", textAlign: "center" }}>
        <h1 className="brand-logo" style={{ marginBottom: "30px" }}>SUBHAMS</h1>
        <div className="spinner"></div><h2 style={{marginTop: "20px", color: "#64748b"}}>Communicating...</h2>
      </div>
    </div>
  );

  // 🟢 IF TOKEN EXISTS BUT APP IS LOCKED, SHOW THE LOCK SCREEN
  if (token && isAppLocked) return (
    <>
      <style>{globalStyles}</style>
      <AppLockScreen onUnlock={handleAppUnlock} />
    </>
  );

  if (!token) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", backgroundColor: "#f1f5f9", padding: "20px" }}>
      <style>{globalStyles}</style>
      <div style={{ width: "100%", maxWidth: "400px", backgroundColor: "white", padding: "40px 25px", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", textAlign: "center" }}>
        <h1 className="brand-logo" style={{ marginBottom: "5px", fontSize: "2.5rem" }}>SUBHAMS</h1>
        <p style={{ color: "#64748b", marginBottom: "25px", fontWeight: "bold", fontSize: "1rem" }}>PMMS</p> 
        
        {authMode === "login" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input style={{ padding: "15px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
            <input style={{ padding: "15px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button style={{ padding: "15px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }} onClick={login}>Login</button>
            <p style={{ fontSize: "14px", margin: "5px 0" }}>Don't have an account? <span style={{ color: "#3b82f6", cursor: "pointer", fontWeight: "bold" }} onClick={() => setAuthMode("register")}>Create one here</span></p>
            <div style={{ margin: "10px 0", color: "#cbd5e1", fontSize: "14px" }}>────── OR ──────</div>
            <div style={{ display: "flex", justifyContent: "center" }}><GoogleLogin onSuccess={handleGoogleSuccess} onError={() => alert("Google Error")} /></div>
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
      </div>
    </div>
  );

  return (
    <div>
      <style>{globalStyles}</style>

      <div className="marquee-container">
        <div className="marquee-text">
          🚀 Important Note: Welcome to your Subhams Personal Money Management System! Track your income, manage your expenses, and secure your financial future! Thank You visiting My website! Venkata Pavan Kumar.
        </div>
      </div>
      
      <nav className="nav-bar">
        <h2 className="brand-logo" style={{ fontSize: "1.8rem" }}>Subhams</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          {/* 🟢 ENABLE APP LOCK (Only shows if they haven't locked the device yet) */}
          {localStorage.getItem("subhams_app_lock") !== "true" && (
            <button style={{ padding: "10px 15px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }} onClick={enableAppLock}>
               <Lock size={16} /> Enable App Lock
            </button>
          )}
          <button style={{ padding: "10px 20px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }} onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="container">
        <div className="dashboard-grid">
          <div className="metric-card">
            <div className="metric-title">TOTAL INCOME <br/>ఆదాయం</div>
            <div className="metric-value" style={{ color: "#10b981" }}>₹{income}</div>
          </div>
          <div className="metric-card">
            <div className="metric-title">TOTAL EXPENSE <br/>ఖర్చు</div>
            <div className="metric-value" style={{ color: "#ef4444" }}>₹{expense}</div>
          </div>
          <div className="metric-card">
            <div className="metric-title">PENDING <br/>పెండింగ్</div>
            <div className="metric-value" style={{ color: "#f59e0b" }}>₹{pending}</div>
          </div>
          <div className="metric-card" style={{ backgroundColor: balance >= 0 ? "#f0fdf4" : "#fef2f2" }}>
            <div className="metric-title">BALANCE <br/>నిల్వ</div>
            <div className="metric-value" style={{ color: balance >= 0 ? "#3b82f6" : "#ef4444" }}>₹{balance}</div>
          </div>
        </div>

        {smartMsg && (
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "20px", marginBottom: "20px", border: "1px solid #e2e8f0" }}>
            <div className={insightClass}>
              <h4 style={{ margin: "0 0 8px 0" }}>💡 Subhams Insights:</h4>
              <div style={{ lineHeight: "1.5" }}>{smartMsg} <br /><small style={{ opacity: 0.8 }}>{smartMsgTe}</small></div>
            </div>
          </div>
        )}

        <div className="action-grid">
          <div ref={formRef} style={{ backgroundColor: "white", borderRadius: "16px", padding: "25px", border: "1px solid #e2e8f0", alignSelf: "start" }}>
            <h3 style={{ marginTop: 0 }}>{editingId ? "✏️ Edit Transaction" : "➕ Add Money"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} placeholder="Title (e.g., Rent)" value={title} onChange={e => setTitle(e.target.value)} />
              <input style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} type="number" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} />
              
              <select style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", backgroundColor: "white", outline: "none" }} value={category} onChange={e => setCategory(e.target.value)}>
                <optgroup label="Income Sources">
                  <option value="Salary">💰 Salary</option>
                  <option value="Investment">📈 Investment</option>
                  <option value="Business">💼 Business</option>
                </optgroup>
                <optgroup label="Expense / Pending Needs">
                  <option value="Food">🍔 Food</option>
                  <option value="Travel">✈️ Travel</option>
                  <option value="Shopping">🛍️ Shopping</option>
                  <option value="Recharge">📱 Recharge</option>
                  <option value="Bills">🧾 Bills</option>
                  <option value="Tax">🏛️ Tax</option>
                  <option value="Health">🏥 Health</option>
                  <option value="Education">🎓 Education</option>
                  <option value="Other">📌 Other</option>
                </optgroup>
              </select>

              <input style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} type="date" value={date || ""} onChange={e => setDate(e.target.value)} />
            </div>
            
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button style={{ flex: 1, padding: "12px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }} onClick={() => handleSubmit("income")}>+ Income</button>
              <button style={{ flex: 1, padding: "12px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }} onClick={() => handleSubmit("expense")}>- Expense</button>
              <button style={{ flex: 1, padding: "12px", background: "#f59e0b", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }} onClick={() => handleSubmit("pending")}>⏳ Pending</button>
            </div>
            
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
                  <div style={{ flex: "1 1 140px", display: "flex", flexDirection: "column" }}>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b", marginBottom: "5px" }}>From Date:</label>
                    <input type="date" style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} value={filterStartDate || ""} onChange={e => setFilterStartDate(e.target.value)} />
                  </div>
                  <div style={{ flex: "1 1 140px", display: "flex", flexDirection: "column" }}>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b", marginBottom: "5px" }}>To Date:</label>
                    <input type="date" style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} value={filterEndDate || ""} onChange={e => setFilterEndDate(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                  <button style={{ flex: 1, padding: "14px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }} onClick={applyFilters}>Filter</button>
                  <button style={{ flex: 1, padding: "14px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }} onClick={clearFilters}>Clear</button>
                </div>
              </div>

          <div className="scrollable-history" style={{ flex: 1, overflowY: "auto", maxHeight: showAllHistory ? "400px" : "auto", paddingRight: "5px" }}>
                {transactions.length === 0 && <p style={{ color: "#94a3b8", textAlign: "center" }}>No records found.</p>}
                
                {/* 🟢 LOGIC: Show all if expanded, otherwise only show the first 5 */}
                {(showAllHistory ? transactions : transactions.slice(0, 5)).map((t) => {
                  const isInc = t.type === "income";
                  const isExp = t.type === "expense";
                  const bgColor = isInc ? "#f0fdf4" : isExp ? "#fef2f2" : "#fffbeb"; 
                  const borderColor = isInc ? "#10b981" : isExp ? "#ef4444" : "#f59e0b";
                  const statusText = isInc ? "RECEIVED" : isExp ? "PAID" : "PENDING";

                  return (
                    <div key={t._id} className="history-item" style={{ backgroundColor: bgColor, borderLeft: `5px solid ${borderColor}` }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <b style={{ color: borderColor, fontSize: "1.2rem" }}>
                            {isInc ? "+" : isExp ? "-" : "⏳"} ₹{t.amount}
                          </b>
                          <span style={{ backgroundColor: borderColor, color: "white", padding: "2px 6px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: "bold" }}>
                            {statusText}
                          </span>
                        </div>
                        <div style={{ color: "#334155", fontSize: "0.95rem", marginTop: "4px", fontWeight: "600" }}>
                          {t.title} <span style={{ background: "white", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", marginLeft: "5px", color: "#64748b", border: "1px solid #e2e8f0" }}>{t.category || "Other"}</span>
                        </div>
                        <div style={{ fontSize: "0.80rem", color: "#94a3b8", marginTop: "4px", fontWeight: "bold" }}>{formatDate(t.date)}</div>
                      </div>
                      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                        <span style={{ cursor: "pointer", color: "#3b82f6", fontWeight: "bold" }} onClick={() => handleEdit(t)}>Edit</span>
                        <span style={{ cursor: "pointer", color: "#ef4444", fontWeight: "bold" }} onClick={() => deleteTransaction(t._id)}>Del</span>
                      </div>
                    </div>
                  );
                })}

                {/* 🟢 THE VIEW MORE BUTTON */}
                {transactions.length > 5 && (
                  <div style={{ textAlign: "center", marginTop: "15px", marginBottom: "10px" }}>
                    <button 
                      onClick={() => setShowAllHistory(!showAllHistory)}
                      style={{
                        background: "white",
                        border: "1px solid #cbd5e1",
                        padding: "10px 20px",
                        borderRadius: "20px",
                        color: "#3b82f6",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: "14px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {showAllHistory ? "Show Less ↑" : `View More Transactions (${transactions.length - 5} hidden) ↓`}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {transactions.length > 0 && (
              <button 
                style={{ width: "100%", padding: "20px", background: isDownloading ? "#cbd5e1" : "#1e293b", color: "white", border: "none", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "15px", cursor: isDownloading ? "not-allowed" : "pointer" }} 
                onClick={downloadWhitePaper}
                disabled={isDownloading}
              >
                <span style={{ fontSize: "1.8rem" }}>{isDownloading ? "⏳" : "📄"}</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                    {isDownloading ? "Generating Filtered PDF..." : "Download Filtered Report"}
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        <div className="action-grid" style={{ marginTop: "20px" }}>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ textAlign: "center", marginTop: 0 }}>📊 Overview</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} innerRadius={50} outerRadius={70} dataKey="value">
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ textAlign: "center", marginTop: 0 }}>📈 Monthly Trends</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" fill="#10b981" />
                <Bar dataKey="expense" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ maxWidth: '700px', margin: '20px auto 0 auto', backgroundColor: "white", borderRadius: "16px", padding: "25px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <Calculator size={22} color="#3b82f6" /> Simple Interest Calculator
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", marginBottom: "15px", marginTop: "20px" }}>
            <input style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} placeholder="Principal (+/- ₹)" onChange={(e) => setInterestData({...interestData, principal: e.target.value})} />
            <input style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} placeholder="Rate (%)" onChange={(e) => setInterestData({...interestData, rate: e.target.value})} />
            <input style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }} placeholder="Time (Months)" onChange={(e) => setInterestData({...interestData, time: e.target.value})} />
          </div>
          <button style={{ width: "100%", padding: "14px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }} onClick={calculateInterest}>Calculate Interest</button>
          
          {interestResult.interest !== undefined && (
            <div className="insight-green" style={{ marginTop: "20px", padding: "15px", borderRadius: "8px", borderLeft: "5px solid #10b981", textAlign: 'center' }}>
              <p style={{ margin: "5px 0", fontSize: "16px" }}>Earned Interest: <b style={{color: '#065f46'}}>₹{interestResult.interest}</b></p>
              <p style={{ margin: "5px 0", fontSize: "16px" }}>Total Maturity Amount: <b style={{color: '#065f46'}}>₹{interestResult.total}</b></p>
            </div>
          )}
        </div>
      </div>
      
    <footer style={{ 
        padding: "50px 20px", 
        marginTop: "60px", 
        background: "linear-gradient(to bottom, #ffffff, #f8fafc)", 
        borderTop: "1px solid #e2e8f0", 
        boxShadow: "0 -10px 30px rgba(0, 0, 0, 0.02)", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        gap: "15px" 
      }}>
        {/* App Badge */}
        <div style={{ 
          background: "rgba(59, 130, 246, 0.1)", 
          padding: "8px 16px", 
          borderRadius: "20px", 
          color: "#3b82f6", 
          fontWeight: "800", 
          fontSize: "13px", 
          letterSpacing: "1px", 
          display: "flex", 
          alignItems: "center", 
          gap: "6px",
          textTransform: "uppercase"
        }}>
          <Code size={16} /> Personal Money Management System
        </div>

        {/* Developer Credit */}
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <p style={{ margin: "0", fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Designed & Engineered by</p>
          <h3 style={{ margin: "8px 0", fontSize: "26px", color: "#0f172a", fontWeight: "900", letterSpacing: "-0.5px" }}>
            Venkata Pavan Kumar Amarthaluri
          </h3>
        </div>

        {/* Contact & Portfolio Links */}
        <div style={{ display: "flex", gap: "15px", marginTop: "15px", flexWrap: "wrap", justifyContent: "center" }}>
          {/* Email Button */}
          <a href="mailto:pavanvenkat63@gmail.com" style={{ 
            display: "flex", alignItems: "center", gap: "8px", 
            padding: "12px 24px", background: "white", color: "#475569", 
            borderRadius: "12px", textDecoration: "none", fontWeight: "700", 
            border: "1px solid #cbd5e1", boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            transition: "all 0.2s ease"
          }}>
            <Mail size={18} color="#f59e0b" /> pavanvenkat63@gmail.com
          </a>

          {/* Other Project Button */}
          <a href="https://bhavyams-vendor-hub-vpk.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ 
            display: "flex", alignItems: "center", gap: "8px", 
            padding: "12px 24px", background: "#3b82f6", color: "white", 
            borderRadius: "12px", textDecoration: "none", fontWeight: "700", 
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
            transition: "all 0.2s ease"
          }}>
            <ExternalLink size={18} /> Bhavyams VendorHub
          </a>
        </div>

        {/* Copyright */}
        <p style={{ margin: "25px 0 0 0", fontSize: "13px", color: "#94a3b8", fontWeight: "500" }}>
          © {new Date().getFullYear()} Subhams PMMS. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}

const smStyles = {
    container: { minHeight: '100vh', width: '100%', backgroundColor: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
    card: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', backgroundColor: '#0f172a', borderRadius: '16px', padding: '40px', maxWidth: '550px', width: '100%', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7)', border: '1px solid #1e293b', animation: 'popIn 0.4s ease-out' },
    brandTitle: { margin: '0 0 15px 0', fontSize: '38px', color: '#ffffff', fontWeight: '900', letterSpacing: '-1px' },
    secureBadge: { display: 'inline-block', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '6px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '25px' },
    subtitle: { color: '#cbd5e1', fontSize: '16px', lineHeight: '1.6', margin: '0 0 30px 0' },
    timePanelContainer: { display: 'flex', flexDirection: window.innerWidth < 500 ? 'column' : 'row', width: '100%', gap: '15px', marginBottom: '30px' },
    liveTimeBox: { flex: 1, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '15px', borderTop: '4px solid #f59e0b' },
    restorePanel: { flex: 1, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '15px', borderTop: '4px solid #10b981' },
    timeLabel: { color: '#94a3b8', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px' },
    liveTimeValue: { color: '#f59e0b', fontSize: '20px', fontWeight: '900', letterSpacing: '1px' },
    restoreTime: { color: '#10b981', fontSize: '20px', fontWeight: '900', letterSpacing: '0.5px' },
    progressContainer: { width: '100%', marginBottom: '30px' },
    progressLabel: { display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', fontSize: '13px', fontWeight: '700', marginBottom: '10px' },
    progressBarBg: { width: '100%', height: '6px', backgroundColor: '#334155', borderRadius: '10px', overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#10b981', animation: 'secureFlow 2s infinite linear', boxShadow: '0 0 10px #10b981' },
    footerText: { color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', margin: '0' }
};

export default App;
import React, { useState, useEffect, useCallback, useRef } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { GoogleLogin } from '@react-oauth/google';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API = process.env.REACT_APP_BACKEND_URL || "https://subhams-backend.onrender.com/api";

// 🟢 Custom Formatter for STRICT DD-MM-YYYY with Time (e.g., 20-04-2026 02:30 PM)
const formatDateTime = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert 24h to 12h
  return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
};

function App() {
  const [isMaintenanceMode] = useState(false);
  const [isServerWaking, setIsServerWaking] = useState(!!localStorage.getItem("token")); 
  const [authMode, setAuthMode] = useState("login"); 
  
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

  const login = async () => {
    if (!username || !password) return alert("Enter username and password");
    setIsServerWaking(true); 
    try {
      const res = await fetch(`${API}/auth/login`, { 
        method: "POST", headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ username, password }) 
      });
      const data = await res.json();
      if (res.ok && data.accessToken) { 
        localStorage.setItem("token", data.accessToken); 
        localStorage.setItem("refreshToken", data.refreshToken);
        setToken(data.accessToken); 
        setRefreshToken(data.refreshToken);
      } else { alert(data.error || "Login failed"); }
    } catch (err) { alert("Backend server is offline."); }
    finally { setIsServerWaking(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsServerWaking(true);
    try {
      const res = await fetch(`${API}/auth/google-login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credentialResponse.credential })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        setToken(data.accessToken);
        setRefreshToken(data.refreshToken);
      } else { alert("Google Auth failed in backend."); }
    } catch (err) { alert("Server is offline."); }
    finally { setIsServerWaking(false); }
  };

  const requestRegister = async () => {
    if (!email || !username || !password) return alert("Enter email, username, and password");
    setIsServerWaking(true);
    try {
      const res = await fetch(`${API}/auth/register`, { 
        method: "POST", headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ email, username, password }) 
      });
      const data = await res.json();
      if (res.ok) { 
        alert("OTP sent to your email!"); 
        setAuthMode("otp"); 
      } else { alert(data.error || "Registration failed"); }
    } catch (err) { alert("Backend server is offline."); }
    finally { setIsServerWaking(false); }
  };

  const verifyOtpAndRegister = async () => {
    if (!otp) return alert("Enter the OTP sent to your email");
    setIsServerWaking(true);
    try {
      const res = await fetch(`${API}/auth/verify-otp`, { 
        method: "POST", headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ email, username, password, otp }) 
      });
      const data = await res.json();
      if (res.ok) { 
        alert("Success! You can now log in."); 
        setAuthMode("login"); 
        setPassword(""); setOtp("");
      } else { alert(data.error || "Invalid OTP"); }
    } catch (err) { alert("Backend server is offline."); }
    finally { setIsServerWaking(false); }
  };

  const logout = () => { 
    localStorage.removeItem("token"); 
    localStorage.removeItem("refreshToken");
    setToken(null); 
    setRefreshToken(null);
    setTransactions([]); setAllTransactions([]); setMonthlyChartData([]); setInsights(null); 
    setAuthMode("login");
  };

  const fetchAllData = useCallback(async () => {
    if (!token || token === "null") { setIsServerWaking(false); return; }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [tRes, mRes, iRes] = await Promise.all([
        fetch(`${API}/transactions`, { headers }),
        fetch(`${API}/transactions/monthly`, { headers }),
        fetch(`${API}/transactions/insights`, { headers })
      ]);

      if (tRes.status === 401 || tRes.status === 403) { 
        const newToken = await refreshAuthToken();
        if (newToken) fetchAllData(); 
        return; 
      }

      const tData = await tRes.json(); const mData = await mRes.json(); const iData = await iRes.json();
      if (Array.isArray(tData)) {
        setTransactions(tData);
        setAllTransactions(tData); 
      }
      if (Array.isArray(mData)) setMonthlyChartData(mData);
      setInsights(iData);
    } catch (err) { console.error("Fetch Error:", err); } 
    finally { setIsServerWaking(false); }
  }, [token, refreshAuthToken]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  useEffect(() => {
    if (!token || token === "null") return;
    const interval = setInterval(() => {
      fetch(`${API}/transactions/summary`, { headers: { Authorization: `Bearer ${token}` } }).catch(err => console.log("Heartbeat paused."));
    }, 120000); 
    return () => clearInterval(interval);
  }, [token]);

  const downloadWhitePaper = () => {
    if (transactions.length === 0) return alert("No transactions to download!");
    const doc = new jsPDF();
    const now = new Date();
    doc.setFontSize(24); doc.setFont("helvetica", "bold"); doc.setTextColor(245, 158, 11); 
    doc.text("SUBHAMS PMMS", 14, 22);
    doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139); 
    doc.text("Official Financial White Paper Report", 14, 30);
    
    // 🟢 PDF explicitly formatted with Date and Time
    doc.text(`Generated on: ${formatDateTime(now)}`, 14, 36);
    
    doc.setDrawColor(226, 232, 240); doc.setFillColor(248, 250, 252); doc.rect(14, 45, 182, 25, 'FD'); 
    doc.setFontSize(12); doc.setTextColor(15, 23, 42);
    doc.text(`Global Income: Rs. ${income}`, 20, 60); doc.text(`Global Expense: Rs. ${expense}`, 80, 60);
    if (balance >= 0) doc.setTextColor(16, 185, 129); else doc.setTextColor(239, 68, 68); 
    doc.text(`Global Balance: Rs. ${balance}`, 140, 60);
    
    const tableColumn = ["Date & Time", "Title", "Category", "Type", "Amount (Rs)"];
    
    // 🟢 Table dates formatted with DD-MM-YYYY and Time
    const tableRows = transactions.map(t => [formatDateTime(t.date), t.title, t.category || "Other", t.type.toUpperCase(), t.amount]);
    
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 80, theme: 'grid' });
    doc.save(`Subhams_Report.pdf`);
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
      } else { 
        const errData = await res.json(); alert("Error: " + errData.message); 
      }
    } catch (err) { alert("Server Error."); }
  };

  const handleEdit = (t) => { 
    setTitle(t.title); setAmount(t.amount); setEditingId(t._id); 
    setCategory(t.category || "Other"); setDate(t.date ? t.date.substring(0, 10) : new Date().toISOString().split('T')[0]); 
    formRef.current?.scrollIntoView({ behavior: "smooth" });
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
      const data = await res.json(); 
      if (Array.isArray(data)) setTransactions(data); 
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
  const balance = income - expense;
  const pieData = [ { name: "Income", value: income }, { name: "Expense", value: expense } ];

  let smartMsg = null; let smartMsgTe = null; let insightClass = "insight-blue";
  if (income > 0 || expense > 0) {
    const topDrain = insights?.topCategory || "Other";
    const topAmount = insights?.amount || 0;
    if (income > 0 && expense === 0) { 
      smartMsg = `100% of income (₹${income}) has been saved.`; smartMsgTe = `100% ఆదాయం (₹${income}) ఆదా చేయబడింది.`; insightClass = "insight-green"; 
    } else if (expense > income && income > 0) { 
      const spendPercent = Math.round((expense / income) * 100);
      smartMsg = `Total expenses equal ${spendPercent}% of income. Deficit: ₹${expense - income}. Highest drain: ${topDrain} (₹${topAmount}).`; 
      smartMsgTe = `ఖర్చులు ఆదాయంలో ${spendPercent}%. లోటు: ₹${expense - income}. అత్యధిక ఖర్చు: ${topDrain} (₹${topAmount}).`; insightClass = "insight-red"; 
    } else if (expense > 0 && income === 0) { 
      smartMsg = `Logged ₹${expense} in expenses with no income recorded.`; smartMsgTe = `₹${expense} ఖర్చు నమోదు చేయబడింది, కానీ ఆదాయం లేదు.`; insightClass = "insight-red"; 
    } else { 
      const spendPercent = Math.round((expense / income) * 100); const savePercent = 100 - spendPercent;
      smartMsg = `Saved ${savePercent}% | Spent ${spendPercent}%. Highest drain: ${topDrain} (₹${topAmount}).`; 
      smartMsgTe = `${savePercent}% ఆదా చేశారు | ${spendPercent}% ఖర్చు చేశారు. అత్యధిక ఖర్చు: ${topDrain} (₹${topAmount}).`; 
      if (spendPercent <= 30) insightClass = "insight-green"; else if (spendPercent >= 75) insightClass = "insight-red"; else insightClass = "insight-blue"; 
    }
  }

  const globalStyles = `
    * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    body { background-color: #f1f5f9; margin: 0; color: #334155; }
    .nav-bar { background: #0f172a; color: white; padding: 15px 5%; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 1000; }
    .container { max-width: 1200px; margin: 0 auto; padding: 15px; }
    .card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; margin-bottom: 20px; }
    
    .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin-bottom: 20px; }
    .action-grid { display: grid; grid-template-columns: 35% 65%; gap: 20px; }
    @media (max-width: 900px) { .action-grid { grid-template-columns: 1fr; } }
    
    .metric-card { text-align: center; padding: 20px; border-radius: 12px; background: white; border: 1px solid #e2e8f0; }
    .metric-title { font-size: 0.85rem; color: #64748b; font-weight: bold; letter-spacing: 1px; }
    .metric-value { font-size: 2rem; font-weight: 800; margin: 10px 0 0 0; }
    
    .history-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #f1f5f9; }
    .insight-green { background: #f0fdf4; border-left: 5px solid #10b981; color: #065f46; padding: 15px; border-radius: 8px;}
    .insight-red { background: #fef2f2; border-left: 5px solid #ef4444; color: #991b1b; padding: 15px; border-radius: 8px;}
    .insight-blue { background: #eff6ff; border-left: 5px solid #3b82f6; color: #1e40af; padding: 15px; border-radius: 8px;}
    
    .spinner { width: 50px; height: 50px; border: 5px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
    .marquee-container { background-color: #1e293b; color: #fbbf24; padding: 10px; overflow: hidden; white-space: nowrap; }
    .marquee-text { display: inline-block; animation: scrollLeft 30s linear infinite; font-weight: 500; letter-spacing: 0.5px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes scrollLeft { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }
    .brand-logo { font-size: 2.2rem; font-weight: 900; letter-spacing: -1px; margin: 0; background: linear-gradient(45deg, #f59e0b, #facc15); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .scrollable-history::-webkit-scrollbar { width: 6px; }
    .scrollable-history::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
    .scrollable-history::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  `;

  if (isMaintenanceMode) return <div style={{textAlign: "center", padding: "100px"}}><h1>🛠️ Maintenance</h1></div>;
  
  if (isServerWaking) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", backgroundColor: "#f1f5f9", padding: "20px" }}>
      <style>{globalStyles}</style>
      <div style={{ width: "100%", maxWidth: "400px", backgroundColor: "white", padding: "40px 20px", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", textAlign: "center" }}>
        <h1 className="brand-logo" style={{ marginBottom: "30px" }}>SUBHAMS</h1>
        <div className="spinner"></div>
        <h2 style={{marginTop: "20px", color: "#64748b"}}>Communicating...</h2>
      </div>
    </div>
  );

  if (!token) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", backgroundColor: "#f1f5f9", padding: "20px" }}>
      <style>{globalStyles}</style>
      <div style={{ width: "100%", maxWidth: "400px", backgroundColor: "white", padding: "40px 25px", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", textAlign: "center" }}>
        <h1 className="brand-logo" style={{ marginBottom: "5px", fontSize: "2.5rem" }}>SUBHAMS</h1>
        <p style={{ color: "#64748b", marginBottom: "25px", fontWeight: "bold", fontSize: "1rem" }}>PMMS</p> 
        
        {authMode === "login" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input style={{ padding: "15px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", width: "100%", outline: "none" }} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
            <input style={{ padding: "15px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", width: "100%", outline: "none" }} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button style={{ padding: "15px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", width: "100%", marginTop: "5px" }} onClick={login}>Login</button>
            <p style={{ fontSize: "14px", margin: "5px 0" }}>Don't have an account? <span style={{ color: "#3b82f6", cursor: "pointer", fontWeight: "bold" }} onClick={() => setAuthMode("register")}>Create one here</span></p>
            <div style={{ margin: "15px 0", color: "#cbd5e1", fontSize: "14px" }}>────── OR ──────</div>
            <div style={{ display: "flex", justifyContent: "center" }}><GoogleLogin onSuccess={handleGoogleSuccess} onError={() => alert("Google Error")} /></div>
          </div>
        )}

        {authMode === "register" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <h3 style={{ color: "#10b981", margin: "0 0 10px 0" }}>Create an Account</h3>
            <input style={{ padding: "15px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", width: "100%", outline: "none" }} placeholder="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <input style={{ padding: "15px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", width: "100%", outline: "none" }} placeholder="Choose a Username" value={username} onChange={e => setUsername(e.target.value)} />
            <input style={{ padding: "15px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", width: "100%", outline: "none" }} type="password" placeholder="Strong Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button style={{ padding: "15px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", width: "100%", marginTop: "10px" }} onClick={requestRegister}>Send OTP</button>
            <p style={{ fontSize: "14px", margin: "10px 0", cursor: "pointer" }} onClick={() => setAuthMode("login")}>Back to Login</p>
          </div>
        )}

        {authMode === "otp" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <h3 style={{ color: "#f59e0b", margin: "0" }}>Enter OTP Code</h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 10px 0" }}>Code sent to <b>{email}</b></p>
            <input style={{ padding: "15px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "24px", letterSpacing: "5px", textAlign: "center", width: "100%", outline: "none" }} placeholder="6-Digit OTP" type="text" value={otp} onChange={e => setOtp(e.target.value)} />
            <button style={{ padding: "15px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", width: "100%", marginTop: "10px" }} onClick={verifyOtpAndRegister}>Verify & Register</button>
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
        <button style={{ padding: "10px 20px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }} onClick={logout}>Logout</button>
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
          
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "25px", border: "1px solid #e2e8f0", alignSelf: "start" }}>
            <h3 style={{ marginTop: 0 }}>{editingId ? "✏️ Edit" : "➕ Add Money"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", width: "100%", outline: "none" }} placeholder="Title (e.g., Rent)" value={title} onChange={e => setTitle(e.target.value)} />
              <input style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", width: "100%", outline: "none" }} type="number" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} />
              <select style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", width: "100%", backgroundColor: "white", outline: "none" }} value={category} onChange={e => setCategory(e.target.value)}>
                <option value="Food">🍔 Food</option><option value="Travel">✈️ Travel</option><option value="Salary">💰 Salary</option><option value="Shopping">🛍️ Shopping</option><option value="Other">📌 Other</option>
              </select>
              <input style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", width: "100%", outline: "none" }} type="date" value={date || ""} onChange={e => setDate(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button style={{ flex: 1, padding: "14px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }} onClick={() => handleSubmit("income")}>+ Income</button>
              <button style={{ flex: 1, padding: "14px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }} onClick={() => handleSubmit("expense")}>- Expense</button>
            </div>
            {editingId && <button style={{ width: "100%", padding: "14px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }} onClick={cancelEdit}>Cancel Edit</button>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            
            <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
              <h3 style={{ margin: "0 0 15px 0" }}>📜 History</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                <input style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", width: "100%", outline: "none" }} placeholder="Search Title or Amount..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <select style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", width: "100%", backgroundColor: "white", outline: "none" }} value={filterType} onChange={e => setFilterType(e.target.value)}>
                  <option value="All">All Types</option><option value="income">Income</option><option value="expense">Expense</option>
                </select>
                
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ flex: "1 1 140px", display: "flex", flexDirection: "column" }}>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b", marginBottom: "5px" }}>From Date:</label>
                    <input type="date" style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", width: "100%", minHeight: "52px", color: "black", background: "white", outline: "none" }} value={filterStartDate || ""} onChange={e => setFilterStartDate(e.target.value)} />
                  </div>
                  <div style={{ flex: "1 1 140px", display: "flex", flexDirection: "column" }}>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b", marginBottom: "5px" }}>To Date:</label>
                    <input type="date" style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", width: "100%", minHeight: "52px", color: "black", background: "white", outline: "none" }} value={filterEndDate || ""} onChange={e => setFilterEndDate(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                  <button style={{ flex: 1, padding: "14px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }} onClick={applyFilters}>Filter</button>
                  <button style={{ flex: 1, padding: "14px", background: "#e2e8f0", color: "#334155", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }} onClick={clearFilters}>Clear</button>
                </div>
              </div>

              <div className="scrollable-history" style={{ flex: 1, overflowY: "auto", maxHeight: "400px", paddingRight: "5px" }}>
                {transactions.length === 0 && <p style={{ color: "#94a3b8", textAlign: "center" }}>No records found.</p>}
                {transactions.map((t) => (
                  <div key={t._id} className="history-item">
                    <div>
                      <b style={{ color: t.type === "income" ? "#10b981" : "#ef4444", fontSize: "1.1rem" }}>
                        {t.type === "income" ? "+" : "-"} ₹{t.amount}
                      </b>
                      <div style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "4px" }}>
                        {t.title} <span style={{ background: "#f1f5f9", padding: "4px 8px", borderRadius: "10px", fontSize: "0.75rem", marginLeft: "5px", fontWeight: "bold", color: "#475569" }}>{t.category || "Other"}</span>
                      </div>
                      {/* 🟢 Strictly formatted DD-MM-YYYY and Time in History */}
                      <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "4px", fontWeight: "bold" }}>{formatDateTime(t.date)}</div>
                    </div>
                    <div style={{ display: "flex", gap: "15px" }}>
                      <span style={{ cursor: "pointer", color: "#3b82f6", fontWeight: "bold" }} onClick={() => handleEdit(t)}>Edit</span>
                      <span style={{ cursor: "pointer", color: "#ef4444", fontWeight: "bold" }} onClick={() => deleteTransaction(t._id)}>Del</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {transactions.length > 0 && (
              <button style={{ width: "100%", padding: "20px", background: "#1e293b", color: "white", border: "none", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "15px", cursor: "pointer" }} onClick={downloadWhitePaper}>
                <span style={{ fontSize: "1.8rem" }}>📄</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>Download History Report</div>
                  <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>Official PDF Report</div>
                </div>
              </button>
            )}

          </div>
        </div>

        <div className="action-grid" style={{ marginTop: "20px" }}>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ textAlign: "center", marginTop: 0 }}>📊 Overview</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart><Pie data={pieData} innerRadius={50} outerRadius={70} dataKey="value"><Cell fill="#10b981" /><Cell fill="#ef4444" /></Pie><Tooltip /><Legend /></PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ textAlign: "center", marginTop: 0 }}>📈 Monthly Trends</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyChartData}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="income" fill="#10b981" /><Bar dataKey="expense" fill="#ef4444" /></BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "25px", border: "1px solid #e2e8f0", marginTop: "20px" }}>
          <h3 style={{ marginTop: 0 }}>🧮 Simple Interest Calculator</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", marginBottom: "15px" }}>
            <input style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", width: "100%", outline: "none" }} placeholder="Principal (₹)" onChange={(e) => setInterestData({...interestData, principal: e.target.value})} />
            <input style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", width: "100%", outline: "none" }} placeholder="Rate (%)" onChange={(e) => setInterestData({...interestData, rate: e.target.value})} />
            <input style={{ padding: "14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", width: "100%", outline: "none" }} placeholder="Time (Months)" onChange={(e) => setInterestData({...interestData, time: e.target.value})} />
          </div>
          <button style={{ width: "100%", padding: "14px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }} onClick={calculateInterest}>Calculate</button>
          
          {interestResult.interest !== undefined && (
            <div className="insight-green" style={{ marginTop: "20px", padding: "15px", borderRadius: "8px" }}>
              <p style={{ margin: "5px 0", fontSize: "16px" }}>Earned Interest: <b>₹{interestResult.interest}</b></p>
              <p style={{ margin: "5px 0", fontSize: "16px" }}>Total Maturity Amount: <b>₹{interestResult.total}</b></p>
            </div>
          )}
        </div>
      </div>

      <footer style={{ textAlign: "center", padding: "40px 20px", marginTop: "40px", color: "#64748b", backgroundColor: "white", borderTop: "1px solid #e2e8f0" }}>
        <p style={{ margin: "5px 0", fontWeight: "bold" }}>Personal Money Management System</p>
        <p style={{ margin: "5px 0", fontSize: "0.9em" }}>Designed & Developed by</p>
        <h3 style={{ margin: "10px 0", color: "#0f172a" }}>Venkata Pavan Kumar</h3>
        <p style={{ marginTop: "15px", fontSize: "0.9em" }}>
          Check out our other app: <a href="https://bhavyams-vendor-hub-vpk.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: "bold" }}>Bhavyams VendorHub</a>
        </p>
      </footer>

    </div>
  );
}

export default App;
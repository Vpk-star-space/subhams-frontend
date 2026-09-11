import React, { useState, useEffect, useMemo } from 'react';
import { 
    ShieldCheck, Send, Power, ArrowLeft, UserCheck, 
    Search, AlertTriangle, Clock, Lock, Bell, CheckCircle2, User, Users, X
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL || "https://subhams-backend.onrender.com/api";

export default function AdminCommandCenter({ token, onBack }) {
    const [stats, setStats] = useState({ 
        totalUsers: 0, 
        activeSubscribers: 0, 
        languages: [], 
        logs: { total_sent: 0, reminders_sent: 0, budget_alerts_sent: 0, privacy_alerts_sent: 0 } 
    });
    const [usersList, setUsersList] = useState([]);
    
    // User search in registered list
    const [userSearch, setUserSearch] = useState('');

    // Settings state
    const [settings, setSettings] = useState({
        notifications_enabled: true,
        reminder_enabled: true,
        budget_alert_enabled: true,
        privacy_enabled: true,
        reminder_text_en: '',
        reminder_text_te: '',
        budget_text_en: '',
        budget_text_te: '',
        privacy_text_en: '',
        privacy_text_te: ''
    });

    // Manual Broadcast State
    const [targetMode, setTargetMode] = useState('all'); // 'all' or 'specific'
    const [selectedUserObj, setSelectedUserObj] = useState(null);
    const [broadcastUserSearch, setBroadcastUserSearch] = useState('');
    
    const [broadcastTitleEn, setBroadcastTitleEn] = useState('');
    const [broadcastBodyEn, setBroadcastBodyEn] = useState('');
    const [broadcastTitleTe, setBroadcastTitleTe] = useState('');
    const [broadcastBodyTe, setBroadcastBodyTe] = useState('');

    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchAdminData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAdminData = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [statsRes, settingsRes, usersRes] = await Promise.all([
                fetch(`${API}/admin/stats`, { headers }),
                fetch(`${API}/admin/settings`, { headers }),
                fetch(`${API}/admin/users-list`, { headers })
            ]);

            if (statsRes.ok) setStats(await statsRes.json());
            if (settingsRes.ok) {
                const sData = await settingsRes.json();
                if (sData.settings) setSettings(sData.settings);
            }
            if (usersRes.ok) {
                const uData = await usersRes.json();
                setUsersList(uData.users || []);
            }
        } catch (err) {
            console.error("Failed to load admin panel data", err);
        }
    };

    const handleSaveSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/admin/settings`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                setSuccessMsg("✅ All automation templates and behavior switches saved!");
                setTimeout(() => setSuccessMsg(''), 4000);
            } else {
                alert("Failed to save settings.");
            }
        } catch (err) {
            alert("Network error.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendBroadcast = async (e) => {
        e.preventDefault();
        if (!broadcastTitleEn || !broadcastBodyEn) {
            return alert("Please enter at least the English title and message body.");
        }

        if (targetMode === 'specific' && !selectedUserObj) {
            return alert("Please search and select a specific user to target.");
        }

        const targetUserId = targetMode === 'all' ? 'all' : selectedUserObj.id;

        setLoading(true);
        try {
            const res = await fetch(`${API}/admin/broadcast`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ 
                    targetUserId, 
                    title_en: broadcastTitleEn, 
                    body_en: broadcastBodyEn,
                    title_te: broadcastTitleTe,
                    body_te: broadcastBodyTe
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`🚀 Push broadcast sent! Reached ${data.reach} active device(s).`);
                setBroadcastTitleEn('');
                setBroadcastBodyEn('');
                setBroadcastTitleTe('');
                setBroadcastBodyTe('');
                fetchAdminData();
            } else {
                alert(data.error || "Failed to send broadcast.");
            }
        } catch (err) {
            alert("Network error during broadcast.");
        } finally {
            setLoading(false);
        }
    };

    // Filtered users for general list
    const filteredUsersList = useMemo(() => {
        if (!userSearch.trim()) return usersList;
        const q = userSearch.toLowerCase();
        return usersList.filter(u => 
            (u.username && u.username.toLowerCase().includes(q)) || 
            (u.email && u.email.toLowerCase().includes(q))
        );
    }, [usersList, userSearch]);

    // Filtered users for manual broadcast selection
    const filteredBroadcastUsers = useMemo(() => {
        if (!broadcastUserSearch.trim()) return usersList.slice(0, 8);
        const q = broadcastUserSearch.toLowerCase();
        return usersList.filter(u => 
            (u.username && u.username.toLowerCase().includes(q)) || 
            (u.email && u.email.toLowerCase().includes(q))
        ).slice(0, 8);
    }, [usersList, broadcastUserSearch]);

    return (
        <div style={{ maxWidth: '1050px', margin: '20px auto', padding: '15px', fontFamily: "'Segoe UI', sans-serif", color: '#1e293b' }}>
            <button 
                onClick={onBack} 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#e2e8f0', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px' }}
            >
                <ArrowLeft size={16} /> Back to PMMS Dashboard
            </button>

            {/* HEADER */}
            <div style={{ background: '#0f172a', color: 'white', padding: '25px', borderRadius: '16px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShieldCheck size={28} color="#3b82f6" /> Admin Command Center
                    </h1>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>Logged in as: pavanvenkat63@gmail.com</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>Master Switch:</span>
                    <button 
                        onClick={() => setSettings(s => ({ ...s, notifications_enabled: !s.notifications_enabled }))}
                        style={{ 
                            background: settings.notifications_enabled ? '#10b981' : '#ef4444', 
                            color: 'white', border: 'none', padding: '8px 18px', borderRadius: '20px', 
                            fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' 
                        }}
                    >
                        {settings.notifications_enabled ? '🟢 System Active' : '🔴 Kill Switch Active'}
                    </button>
                </div>
            </div>

            {successMsg && (
                <div style={{ background: '#f0fdf4', color: '#065f46', padding: '14px', borderRadius: '10px', marginBottom: '20px', fontWeight: 'bold', border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} /> {successMsg}
                </div>
            )}

            {/* STATS OVERVIEW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '15px', marginBottom: '25px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>TOTAL REGISTERED USERS</div>
                    <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', marginTop: '5px' }}>{stats.totalUsers}</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>ACTIVE PUSH DEVICES</div>
                    <div style={{ fontSize: '2rem', fontWeight: '900', color: '#10b981', marginTop: '5px' }}>{stats.activeSubscribers}</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>TOTAL LOGGED PUSHES</div>
                    <div style={{ fontSize: '2rem', fontWeight: '900', color: '#3b82f6', marginTop: '5px' }}>{stats.logs?.total_sent || 0}</div>
                </div>
            </div>

            {/* 🟢 MANUAL BROADCAST WITH SEARCHABLE TARGET AUDIENCE */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Send size={20} color="#3b82f6" /> Manual Push Broadcast (English + Telugu)
                </h2>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px 0' }}>
                    Send promotions, festival greetings, or custom alerts. English users get English; Telugu users get Telugu automatically.
                </p>

                <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {/* AUDIENCE SELECTOR TYPE */}
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>
                            Choose Target Audience
                        </label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                onClick={() => { setTargetMode('all'); setSelectedUserObj(null); }}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px',
                                    border: targetMode === 'all' ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                                    background: targetMode === 'all' ? '#eff6ff' : 'white',
                                    color: targetMode === 'all' ? '#1d4ed8' : '#64748b',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                }}
                            >
                                <Users size={16} /> Broadcast to Everyone
                            </button>
                            <button
                                type="button"
                                onClick={() => setTargetMode('specific')}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px',
                                    border: targetMode === 'specific' ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                                    background: targetMode === 'specific' ? '#eff6ff' : 'white',
                                    color: targetMode === 'specific' ? '#1d4ed8' : '#64748b',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                }}
                            >
                                <User size={16} /> Target Specific User
                            </button>
                        </div>
                    </div>

                    {/* SEARCH BOX FOR SPECIFIC USER TARGETING */}
                    {targetMode === 'specific' && (
                        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                            {selectedUserObj ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#dbeafe', padding: '10px 15px', borderRadius: '8px', border: '1px solid #93c5fd' }}>
                                    <div>
                                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e40af' }}>RECIPIENT SELECTED:</span>
                                        <div style={{ fontWeight: 'bold', color: '#1e3a8a', fontSize: '14px' }}>
                                            👤 {selectedUserObj.username} ({selectedUserObj.email})
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#3b82f6' }}>Language: {selectedUserObj.preferred_language?.toUpperCase() || 'EN'}</span>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setSelectedUserObj(null)} 
                                        style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold', color: '#ef4444' }}
                                    >
                                        <X size={14} /> Change
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>
                                        Search User by Name or Email
                                    </label>
                                    <div style={{ position: 'relative', marginBottom: '10px' }}>
                                        <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                                        <input 
                                            type="text" 
                                            placeholder="Type username (e.g., Pavan) or email..."
                                            value={broadcastUserSearch}
                                            onChange={(e) => setBroadcastUserSearch(e.target.value)}
                                            style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                                        />
                                    </div>
                                    <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {filteredBroadcastUsers.map(u => (
                                            <div 
                                                key={u.id}
                                                onClick={() => setSelectedUserObj(u)}
                                                style={{ padding: '8px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: '0.2s' }}
                                            >
                                                <div>
                                                    <b style={{ fontSize: '13px', color: '#0f172a' }}>{u.username}</b>
                                                    <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>({u.email})</span>
                                                </div>
                                                <span style={{ fontSize: '11px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px', color: '#334155', fontWeight: 'bold' }}>
                                                    {u.preferred_language?.toUpperCase() || 'EN'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* DUAL LANGUAGE MESSAGE FIELDS */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#3b82f6', display: 'block', marginBottom: '5px' }}>English Title</label>
                            <input 
                                type="text" 
                                placeholder="e.g., 🚀 Subhams Hub Feature Update" 
                                value={broadcastTitleEn} 
                                onChange={(e) => setBroadcastTitleEn(e.target.value)} 
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', marginBottom: '10px' }}
                            />
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#3b82f6', display: 'block', marginBottom: '5px' }}>English Message (use {'{{name}}'})</label>
                            <textarea 
                                placeholder="Hey {{name}}, here is your important update..." 
                                value={broadcastBodyEn} 
                                onChange={(e) => setBroadcastBodyEn(e.target.value)} 
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '80px', fontSize: '13px' }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981', display: 'block', marginBottom: '5px' }}>Telugu Title / తెలుగు శీర్షిక (Optional)</label>
                            <input 
                                type="text" 
                                placeholder="ఉదా: 🚀 సబ్హామ్స్ కొత్త అప్‌డేట్" 
                                value={broadcastTitleTe} 
                                onChange={(e) => setBroadcastTitleTe(e.target.value)} 
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', marginBottom: '10px' }}
                            />
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981', display: 'block', marginBottom: '5px' }}>Telugu Message / తెలుగు మెసేజ్</label>
                            <textarea 
                                placeholder="హే {{name}}, ఇది మీ ముఖ్యమైన సమాచారం..." 
                                value={broadcastBodyTe} 
                                onChange={(e) => setBroadcastBodyTe(e.target.value)} 
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '80px', fontSize: '13px' }}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <Bell size={18} /> {loading ? 'Sending...' : 'Send Push Broadcast Now'}
                    </button>
                </form>
            </div>

            {/* AUTOMATED BEHAVIOR CONTROLS */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Power size={20} color="#f59e0b" /> Automated Behavior Engines & Triggers
                        </h2>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Independent switches and bilingual templates for automated notifications.</p>
                    </div>
                    <button 
                        onClick={handleSaveSettings} 
                        disabled={loading} 
                        style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Save Templates & Switches
                    </button>
                </div>

                {/* 1. 24-HR INACTIVITY */}
                <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', marginBottom: '18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Clock size={18} color="#3b82f6" /> 1. Inactivity Reminder (24 Hours)
                            </h3>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Triggers if user logs no transaction for 24h. (Sent: {stats.logs?.reminders_sent || 0} times)</span>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                            <input 
                                type="checkbox" 
                                checked={settings.reminder_enabled} 
                                onChange={(e) => setSettings({ ...settings, reminder_enabled: e.target.checked })} 
                                style={{ width: '18px', height: '18px' }}
                            />
                            {settings.reminder_enabled ? 'Active 🟢' : 'Paused ⚪'}
                        </label>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                        <textarea 
                            value={settings.reminder_text_en} 
                            onChange={(e) => setSettings({ ...settings, reminder_text_en: e.target.value })} 
                            placeholder="English template" 
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '60px', fontSize: '13px' }}
                        />
                        <textarea 
                            value={settings.reminder_text_te} 
                            onChange={(e) => setSettings({ ...settings, reminder_text_te: e.target.value })} 
                            placeholder="Telugu template" 
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '60px', fontSize: '13px' }}
                        />
                    </div>
                </div>

                {/* 2. BUDGET HEALTH ALERT */}
                <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', marginBottom: '18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={18} color="#ef4444" /> 2. Budget Health Alert (Overspending & Deficit)
                            </h3>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Triggers immediately when monthly expenses reach ≥80% or user goes into deficit. (Sent: {stats.logs?.budget_alerts_sent || 0} times)</span>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                            <input 
                                type="checkbox" 
                                checked={settings.budget_alert_enabled} 
                                onChange={(e) => setSettings({ ...settings, budget_alert_enabled: e.target.checked })} 
                                style={{ width: '18px', height: '18px' }}
                            />
                            {settings.budget_alert_enabled ? 'Active 🟢' : 'Paused ⚪'}
                        </label>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                        <textarea 
                            value={settings.budget_text_en} 
                            onChange={(e) => setSettings({ ...settings, budget_text_en: e.target.value })} 
                            placeholder="English template (supports {{percent}})" 
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '60px', fontSize: '13px' }}
                        />
                        <textarea 
                            value={settings.budget_text_te} 
                            onChange={(e) => setSettings({ ...settings, budget_text_te: e.target.value })} 
                            placeholder="Telugu template" 
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '60px', fontSize: '13px' }}
                        />
                    </div>
                </div>

                {/* 3. PRIVACY SECURITY REMINDER */}
                <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Lock size={18} color="#10b981" /> 3. Privacy Security Reassurance (10m then 15 Days)
                            </h3>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Sends 5–10 mins after subscription, then every 15 days to confirm privacy. (Sent: {stats.logs?.privacy_alerts_sent || 0} times)</span>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                            <input 
                                type="checkbox" 
                                checked={settings.privacy_enabled} 
                                onChange={(e) => setSettings({ ...settings, privacy_enabled: e.target.checked })} 
                                style={{ width: '18px', height: '18px' }}
                            />
                            {settings.privacy_enabled ? 'Active 🟢' : 'Paused ⚪'}
                        </label>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                        <textarea 
                            value={settings.privacy_text_en} 
                            onChange={(e) => setSettings({ ...settings, privacy_text_en: e.target.value })} 
                            placeholder="English template" 
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '60px', fontSize: '13px' }}
                        />
                        <textarea 
                            value={settings.privacy_text_te} 
                            onChange={(e) => setSettings({ ...settings, privacy_text_te: e.target.value })} 
                            placeholder="Telugu template" 
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '60px', fontSize: '13px' }}
                        />
                    </div>
                </div>
            </div>

            {/* REGISTERED USERS DIRECTORY */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserCheck size={20} color="#10b981" /> Registered Users List
                    </h2>
                    <div style={{ position: 'relative', minWidth: '240px' }}>
                        <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                        <input 
                            type="text" 
                            placeholder="Search name or email..." 
                            value={userSearch} 
                            onChange={(e) => setUserSearch(e.target.value)} 
                            style={{ padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', width: '100%', outline: 'none' }}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto', maxHeight: '280px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '10px' }}>User</th>
                                <th style={{ padding: '10px' }}>Email</th>
                                <th style={{ padding: '10px' }}>Language</th>
                                <th style={{ padding: '10px' }}>Mode</th>
                                <th style={{ padding: '10px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsersList.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{u.username}</td>
                                    <td style={{ padding: '10px', color: '#64748b' }}>{u.email}</td>
                                    <td style={{ padding: '10px', textTransform: 'uppercase' }}>{u.preferred_language || 'en'}</td>
                                    <td style={{ padding: '10px' }}>
                                        {u.silent_mode ? <span style={{ color: '#d97706', fontWeight: 'bold' }}>Silent 🔕</span> : <span style={{ color: '#10b981' }}>Sound 🔔</span>}
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        {u.has_notifications ? <span style={{ color: '#10b981', fontWeight: 'bold' }}>ACTIVE 🟢</span> : <span style={{ color: '#94a3b8' }}>OFF ⚪</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
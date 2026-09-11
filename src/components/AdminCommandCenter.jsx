import React, { useState, useEffect } from 'react';
import { Bell, ShieldCheck, Send, Power, ArrowLeft, UserCheck } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL || "https://subhams-backend.onrender.com/api";

export default function AdminCommandCenter({ token, onBack }) {
    const [stats, setStats] = useState({ totalUsers: 0, activeSubscribers: 0, languages: [] });
    const [usersList, setUsersList] = useState([]);
    const [settings, setSettings] = useState({
        notifications_enabled: true,
        reminder_text_en: '',
        reminder_text_te: '',
        privacy_text_en: '',
        privacy_text_te: ''
    });
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastBody, setBroadcastBody] = useState('');
    const [targetUser, setTargetUser] = useState('all');
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
                const setmData = await settingsRes.json();
                setSettings(setmData.settings);
            }
            if (usersRes.ok) {
                const uData = await usersRes.json();
                setUsersList(uData.users);
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
                setSuccessMsg("✅ System settings & automated templates saved successfully!");
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
        if (!broadcastTitle || !broadcastBody) return alert("Title and message body are required.");

        setLoading(true);
        try {
            const res = await fetch(`${API}/admin/broadcast`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ targetUserId: targetUser, title: broadcastTitle, body: broadcastBody })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`🚀 Push sent successfully! Reach: ${data.reach}/${data.totalTargets} devices.`);
                setBroadcastTitle('');
                setBroadcastBody('');
            } else {
                alert(data.error || "Failed to broadcast.");
            }
        } catch (err) {
            alert("Network error during broadcast.");
        } finally {
            setLoading(false);
        }
    };

    const handleTestReminder = async () => {
        try {
            const res = await fetch(`${API}/admin/test-reminder`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            alert(data.message || data.error);
        } catch (err) {
            alert("Failed to execute test reminder.");
        }
    };

    return (
        <div style={{ maxWidth: '950px', margin: '30px auto', padding: '20px', fontFamily: "'Segoe UI', sans-serif" }}>
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#e2e8f0', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px' }}>
                <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <div style={{ background: '#0f172a', color: 'white', padding: '25px', borderRadius: '16px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShieldCheck size={28} color="#3b82f6" /> Admin Command Center
                    </h1>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>Securely managed by pavanvenkat63@gmail.com</p>
                </div>
                <div style={{ background: settings.notifications_enabled ? '#10b981' : '#ef4444', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                    {settings.notifications_enabled ? '🟢 System Active' : '🔴 Kill Switch Engaged'}
                </div>
            </div>

            {successMsg && <div style={{ background: '#f0fdf4', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', border: '1px solid #10b981' }}>{successMsg}</div>}

            {/* STATS OVERVIEW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>TOTAL REGISTERED USERS</div>
                    <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', marginTop: '5px' }}>{stats.totalUsers}</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>ACTIVE PUSH SUBSCRIBERS</div>
                    <div style={{ fontSize: '2rem', fontWeight: '900', color: '#10b981', marginTop: '5px' }}>{stats.activeSubscribers}</div>
                </div>
            </div>

            {/* REGISTERED USERS LIST & NOTIFICATION STATUS */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                <h3 style={{ marginTop: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserCheck size={20} color="#10b981" /> Registered Users & Notification Status
                </h3>
                <div style={{ overflowX: 'auto', maxHeight: '250px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '10px' }}>Username</th>
                                <th style={{ padding: '10px' }}>Email</th>
                                <th style={{ padding: '10px' }}>Language</th>
                                <th style={{ padding: '10px' }}>Notifications</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersList.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{u.username}</td>
                                    <td style={{ padding: '10px', color: '#64748b' }}>{u.email}</td>
                                    <td style={{ padding: '10px', textTransform: 'uppercase' }}>{u.preferred_language || 'en'}</td>
                                    <td style={{ padding: '10px' }}>
                                        {u.has_notifications ? <span style={{ color: '#10b981', fontWeight: 'bold' }}>ACTIVE 🟢</span> : <span style={{ color: '#94a3b8' }}>OFF ⚪</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MASTER CONTROLS & AUTOMATED TEMPLATES */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                <h3 style={{ marginTop: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Power size={20} color="#f59e0b" /> Master Kill Switch & Automated Message Templates
                </h3>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 15px 0' }}>Tip: Use <b>{'{{name}}'}</b> in any template to automatically greet the user by their database name!</p>
                
                <div style={{ margin: '15px 0', display: 'flex', alignItems: 'center', gap: '15px', background: '#f8fafc', padding: '15px', borderRadius: '10px' }}>
                    <input 
                        type="checkbox" 
                        checked={settings.notifications_enabled} 
                        onChange={(e) => setSettings({...settings, notifications_enabled: e.target.checked})}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <div>
                        <b style={{ color: '#0f172a' }}>Enable Automated Background Notifications</b>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Uncheck this to instantly block all automated background alerts across the database.</div>
                    </div>
                </div>

                {/* 1. 24hr Reminder Template */}
                <h4 style={{ color: '#1e293b', marginBottom: '8px' }}>⏰ 1. Transaction Reminder (Sent every 24hrs if no entry made)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>English</label>
                        <textarea 
                            value={settings.reminder_text_en} 
                            onChange={(e) => setSettings({...settings, reminder_text_en: e.target.value})}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '70px', fontSize: '13px' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>Telugu / తెలుగు</label>
                        <textarea 
                            value={settings.reminder_text_te} 
                            onChange={(e) => setSettings({...settings, reminder_text_te: e.target.value})}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '70px', fontSize: '13px' }}
                        />
                    </div>
                </div>

                {/* 2. Privacy Security Reminder Template */}
                <h4 style={{ color: '#1e293b', marginBottom: '8px' }}>🔒 2. Privacy Security Reminder (Trust reassurance alert)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                    <div>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>English</label>
                        <textarea 
                            value={settings.privacy_text_en} 
                            onChange={(e) => setSettings({...settings, privacy_text_en: e.target.value})}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '70px', fontSize: '13px' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>Telugu / తెలుగు</label>
                        <textarea 
                            value={settings.privacy_text_te} 
                            onChange={(e) => setSettings({...settings, privacy_text_te: e.target.value})}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '70px', fontSize: '13px' }}
                        />
                    </div>
                </div>

                <button onClick={handleSaveSettings} disabled={loading} style={{ background: '#10b981', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Save All Automated Templates
                </button>
            </div>

            {/* MANUAL BROADCAST & PARTICULAR PERSON SENDER */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                <h3 style={{ marginTop: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Send size={20} color="#3b82f6" /> Manual Broadcast (Everyone or Particular Person)
                </h3>
                
                <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '5px' }}>Target Audience</label>
                        <select value={targetUser} onChange={(e) => setTargetUser(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontSize: '14px' }}>
                            <option value="all">🌐 Everyone (Global Broadcast / Festivals / Business Hub Promos)</option>
                            {usersList.map(u => (
                                <option key={u.id} value={u.id}>👤 Send to Specific User: {u.username} ({u.email})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '5px' }}>Notification Title</label>
                        <input 
                            type="text" 
                            placeholder="e.g., 🖨️ Subhams Cloud Printing" 
                            value={broadcastTitle} 
                            onChange={(e) => setBroadcastTitle(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '5px' }}>Message Body (Tip: Use {'{{name}}'} to greet them by name)</label>
                        <textarea 
                            placeholder="Type your business promotion or festival greeting here..." 
                            value={broadcastBody} 
                            onChange={(e) => setBroadcastBody(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '100px', fontSize: '14px' }}
                        />
                    </div>

                    <button type="submit" disabled={loading} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Bell size={18} /> Send Push Broadcast Now
                    </button>
                </form>
            </div>

            {/* INSTANT TEST TRIGGER */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <h3 style={{ marginTop: 0, color: '#0f172a' }}>⚡ Instant Cron Test</h3>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '15px' }}>Clicking this button immediately simulates the automated 24-hour reminder using your customized templates and pushes it to your browser right now!</p>
                <button onClick={handleTestReminder} style={{ background: '#f59e0b', color: '#0f172a', border: 'none', padding: '14px 28px', borderRadius: '8px', fontWeight: '900', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}>
                    ⚡ Fire Instant Automated Template Test
                </button>
            </div>
        </div>
    );
}
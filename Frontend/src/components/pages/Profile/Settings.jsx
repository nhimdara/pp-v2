import React, { useState, useEffect } from "react";
import {
  User, Bell, Shield, Globe, Moon, Sun, Mail, Lock,
  Smartphone, Eye, EyeOff, Save, Check, CreditCard,
  History, LogOut, AlertTriangle, Volume2, Monitor,
  Download, Clock, DollarSign, BookOpen, Award, Settings as SettingsIcon
} from "lucide-react";

/* ─────────────────────────────────────────────────
   APPLY FUNCTIONS — these write to <html> immediately
   ───────────────────────────────────────────────── */
const applyTheme = (theme) => {
  const isDark = theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark-mode", isDark);
};

const applyFontSize = (size) => {
  const map = { small: "13px", medium: "15px", large: "17px", "x-large": "19px" };
  document.documentElement.style.setProperty("--app-font-size", map[size] || "15px");
};

const applyFontFamily = (font) => {
  document.documentElement.style.setProperty("--app-font-family", `'${font}', sans-serif`);
};

const applyFlags = (s) => {
  const r = document.documentElement;
  r.classList.toggle("reduce-animations", !!(s.reduceAnimations || s.reducedMotion));
  r.classList.toggle("high-contrast",     !!(s.highContrast || s.highContrastMode));
  r.classList.toggle("compact-view",      !!s.compactView);
};

const STORAGE_KEY = "learnflow_settings";

const save = (s) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {} };

const loadSaved = () => {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
};

/* ─────────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────────── */
const ToggleSwitch = ({ label, description, checked, onChange }) => (
  <label className="flex items-start justify-between cursor-pointer group py-1">
    <div className="flex-1 pr-6">
      <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">{label}</p>
      {description && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>}
    </div>
    <div className="relative inline-flex flex-shrink-0 items-center mt-0.5" onClick={onChange}>
      <div className={`w-11 h-6 rounded-full transition-all duration-200 ${checked ? "bg-indigo-600" : "bg-gray-200"}`} />
      <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </div>
  </label>
);

const SectionHeader = ({ title, description, onSave, isLoading }) => (
  <div className="flex items-start justify-between mb-7 pb-5" style={{ borderBottom: "1px solid #f3f4f6" }}>
    <div>
      <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h2>
      <p className="text-sm text-gray-500 mt-0.5">{description}</p>
    </div>
    <button onClick={onSave} disabled={isLoading}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 ml-4 transition-all disabled:opacity-60"
      style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
      {isLoading
        ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
        : <><Save className="h-4 w-4" />Save</>}
    </button>
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
);

/* ─────────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────────── */
const Settings = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const DEFAULTS = {
    name: user?.name || "Nhim Dara",
    email: user?.email || "daracombodia54@gmail.com",
    username: "daracombodia",
    bio: "Passionate learner and aspiring web developer currently mastering React and modern web technologies.",
    phone: "+855 12 345 678",
    location: "Phnom Penh, Cambodia",
    occupation: "Student",
    education: "Computer Science",
    emailNotifications: true,
    pushNotifications: true,
    lessonReminders: true,
    marketingEmails: false,
    achievementAlerts: true,
    deadlineReminders: true,
    newsletterSubscription: false,
    courseUpdates: true,
    discussionReplies: true,
    mentorMessages: true,
    profileVisibility: "public",
    showProgress: true,
    showAchievements: true,
    allowMessages: "friends",
    showEmail: false,
    showCourses: true,
    showCertificates: true,
    activityStatus: true,
    theme: "light",
    fontSize: "medium",
    compactView: false,
    reduceAnimations: false,
    highContrast: false,
    fontFamily: "Inter",
    language: "english",
    timezone: "Asia/Phnom_Penh",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    currency: "USD",
    twoFactorAuth: false,
    loginAlerts: true,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    paymentMethods: [
      { id: 1, type: "visa", last4: "4242", exp: "12/26", default: true },
      { id: 2, type: "mastercard", last4: "8888", exp: "08/25", default: false },
    ],
    billingAddress: "123 Main St, Phnom Penh, Cambodia",
    autoRenewal: true,
    screenReader: false,
    highContrastMode: false,
    reducedMotion: false,
    keyboardNavigation: true,
    captionPreferences: true,
    autoDownload: false,
    downloadQuality: "hd",
    offlineAccess: true,
    storageLimit: "10GB",
    usedStorage: "3.2GB",
  };

  const [settings, setSettings] = useState(() => ({ ...DEFAULTS, ...(loadSaved() || {}) }));

  /* Apply saved settings on first mount */
  useEffect(() => {
    applyTheme(settings.theme);
    applyFontSize(settings.fontSize);
    applyFontFamily(settings.fontFamily);
    applyFlags(settings);
  }, []); // eslint-disable-line

  /* ── change handler — applies immediately + saves ── */
  const handleChange = (key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      save(next);
      if (key === "theme")      applyTheme(value);
      if (key === "fontSize")   applyFontSize(value);
      if (key === "fontFamily") applyFontFamily(value);
      if (["reduceAnimations","highContrast","compactView","highContrastMode","reducedMotion"].includes(key))
        applyFlags(next);
      return next;
    });
  };

  const handleToggle = (key) => handleChange(key, !settings[key]);

  const handleSave = (section) => {
    setIsLoading(true);
    setSuccessMessage(`${section} settings saved!`);
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 900);
  };

  const tabs = [
    { id: "profile",       label: "Profile",           icon: User,       desc: "Personal information" },
    { id: "notifications", label: "Notifications",     icon: Bell,       desc: "Alerts & updates" },
    { id: "appearance",    label: "Appearance",        icon: Sun,        desc: "Look & feel" },
    { id: "privacy",       label: "Privacy",           icon: Shield,     desc: "Visibility controls" },
    { id: "language",      label: "Language & Region", icon: Globe,      desc: "Locale preferences" },
    { id: "security",      label: "Security",          icon: Lock,       desc: "Account protection" },
    { id: "payment",       label: "Payment",           icon: CreditCard, desc: "Billing & methods" },
    { id: "accessibility", label: "Accessibility",     icon: Volume2,    desc: "Usability options" },
    { id: "downloads",     label: "Downloads",         icon: Download,   desc: "Offline content" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:wght@700;800&display=swap');
        .sett-root { font-family: 'DM Sans', sans-serif; background: linear-gradient(160deg,#f8f8ff,#f0f0fe); min-height:100vh; padding-top:96px; padding-bottom:64px; }
        .sett-input { width:100%; padding:10px 14px; border-radius:12px; font-size:14px; border:1.5px solid #e5e7eb; background:#fafafa; outline:none; transition:all 0.15s; font-family:'DM Sans',sans-serif; color:#111827; }
        .sett-input:focus { border-color:#a5b4fc; background:white; box-shadow:0 0 0 3px rgba(165,180,252,0.2); }
        .sett-select { width:100%; padding:10px 14px; border-radius:12px; font-size:14px; border:1.5px solid #e5e7eb; background:#fafafa; outline:none; transition:all 0.15s; font-family:'DM Sans',sans-serif; color:#111827; cursor:pointer; }
        .sett-select:focus { border-color:#a5b4fc; background:white; box-shadow:0 0 0 3px rgba(165,180,252,0.2); }
        .sidebar-btn { width:100%; text-align:left; padding:10px 14px; border-radius:14px; border:none; background:transparent; cursor:pointer; transition:all 0.15s; font-family:'DM Sans',sans-serif; }
        .sidebar-btn:hover { background:#f5f5ff; }
        .sidebar-btn.active { background:#eef2ff; }
        .content-panel { background:white; border-radius:24px; border:1px solid #f0f0f8; box-shadow:0 2px 20px rgba(0,0,0,0.04); overflow:hidden; }
        .sett-card { background:#fafafa; border-radius:16px; border:1px solid #f0f0f8; padding:16px; }
        .section-divider { border-top:1px solid #f3f4f6; margin-top:24px; padding-top:24px; }
        .danger-zone { background:#fff5f5; border-radius:16px; border:1px solid #fecaca; padding:16px; }
        .toast { position:fixed; top:84px; right:20px; z-index:9999; background:white; border:1.5px solid #a7f3d0; border-radius:16px; padding:12px 20px; display:flex; align-items:center; gap:10px; box-shadow:0 8px 32px rgba(16,185,129,0.18); animation:toastIn 0.3s ease; }
        @keyframes toastIn { from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:translateX(0)} }

        /* dark mode for settings page itself */
        html.dark-mode .sett-root { background: #0d0d1a !important; }
        html.dark-mode .content-panel { background: #1a1a35 !important; border-color: #2a2a4a !important; }
        html.dark-mode .sett-card { background: #14142b !important; border-color: #2a2a4a !important; }
        html.dark-mode .sidebar-btn:hover { background: #252545 !important; }
        html.dark-mode .sidebar-btn.active { background: #252550 !important; }
        html.dark-mode .sett-input, html.dark-mode .sett-select { background:#1a1a35 !important; border-color:#3a3a5c !important; color:#e8e8f5 !important; }
        html.dark-mode .sett-input:focus, html.dark-mode .sett-select:focus { background:#1e1e3a !important; border-color:#6366f1 !important; }
        html.dark-mode .danger-zone { background: #2a0e0e !important; border-color: #7f1d1d !important; }
        html.dark-mode .toast { background: #1a1a35 !important; border-color: #166534 !important; }
      `}</style>

      {showSuccess && (
        <div className="toast">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#ecfdf5" }}>
            <Check className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-sm font-semibold text-green-800">{successMessage}</p>
        </div>
      )}

      <div className="sett-root">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-semibold text-indigo-500 uppercase tracking-widest mb-1">Account</p>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.25rem", fontWeight: 700, color: "inherit", lineHeight: 1.2 }}>Settings</h1>
              <p className="text-gray-500 mt-1">Manage your preferences and account configuration</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "#eef2ff" }}>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-700">Auto-save on</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="content-panel p-3 sticky top-24">
                <nav className="space-y-0.5">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`sidebar-btn ${isActive ? "active" : ""}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: isActive ? "#eef2ff" : "#f3f4f6" }}>
                            <Icon className="h-4 w-4" style={{ color: isActive ? "#4f46e5" : "#9ca3af" }} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold" style={{ color: isActive ? "#4f46e5" : "#374151" }}>{tab.label}</p>
                            <p className="text-xs text-gray-400">{tab.desc}</p>
                          </div>
                          {isActive && <div className="ml-auto w-1.5 h-5 rounded-full" style={{ background: "#6366f1" }} />}
                        </div>
                      </button>
                    );
                  })}
                </nav>
                <div className="mt-3 pt-3" style={{ borderTop: "1px solid #f3f4f6" }}>
                  <button onClick={onLogout} className="sidebar-btn hover:bg-red-50 w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#fff5f5" }}>
                        <LogOut className="h-4 w-4 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-red-600">Sign Out</p>
                        <p className="text-xs text-red-400">Log out of your account</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Main panel */}
            <div className="flex-1 min-w-0">
              <div className="content-panel p-6 sm:p-8">

                {/* PROFILE */}
                {activeTab === "profile" && (
                  <div>
                    <SectionHeader title="Profile Settings" description="Update your personal information" onSave={() => handleSave("Profile")} isLoading={isLoading} />
                    <div className="space-y-5 max-w-2xl">
                      <div className="flex items-center gap-5 p-4 rounded-2xl sett-card">
                        <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(settings.name)}&background=6366f1&color=fff&size=128`}
                          alt={settings.name} className="w-16 h-16 rounded-2xl object-cover"
                          style={{ boxShadow: "0 4px 12px rgba(99,102,241,0.2)" }} />
                        <div>
                          <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>Upload Photo</button>
                          <p className="text-xs text-gray-400 mt-1.5">JPG, PNG or GIF · Max 2MB</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Full Name"><input className="sett-input" type="text" value={settings.name} onChange={e => handleChange("name", e.target.value)} /></Field>
                        <Field label="Username">
                          <div className="flex">
                            <span className="flex items-center px-3 rounded-l-xl text-sm text-gray-500" style={{ background: "#f3f4f6", border: "1.5px solid #e5e7eb", borderRight: "none" }}>@</span>
                            <input className="sett-input" style={{ borderRadius: "0 12px 12px 0" }} type="text" value={settings.username} onChange={e => handleChange("username", e.target.value)} />
                          </div>
                        </Field>
                        <Field label="Email Address"><input className="sett-input" type="email" value={settings.email} onChange={e => handleChange("email", e.target.value)} /></Field>
                        <Field label="Phone Number"><input className="sett-input" type="tel" value={settings.phone} onChange={e => handleChange("phone", e.target.value)} /></Field>
                        <Field label="Location"><input className="sett-input" type="text" value={settings.location} onChange={e => handleChange("location", e.target.value)} /></Field>
                        <Field label="Occupation"><input className="sett-input" type="text" value={settings.occupation} onChange={e => handleChange("occupation", e.target.value)} /></Field>
                      </div>
                      <Field label="Bio">
                        <textarea className="sett-input" rows={3} style={{ resize: "none" }} value={settings.bio} onChange={e => handleChange("bio", e.target.value)} />
                        <p className="text-xs text-gray-400 mt-1">{settings.bio.length}/500 characters</p>
                      </Field>
                    </div>
                  </div>
                )}

                {/* NOTIFICATIONS */}
                {activeTab === "notifications" && (
                  <div>
                    <SectionHeader title="Notifications" description="Control how and when you receive alerts" onSave={() => handleSave("Notifications")} isLoading={isLoading} />
                    <div className="space-y-5 max-w-2xl">
                      <div className="sett-card space-y-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Email Notifications</p>
                        <ToggleSwitch label="Email Notifications" description="Receive updates and alerts via email" checked={settings.emailNotifications} onChange={() => handleToggle("emailNotifications")} />
                        <ToggleSwitch label="Course Updates" description="Notify when enrolled courses are updated" checked={settings.courseUpdates} onChange={() => handleToggle("courseUpdates")} />
                        <ToggleSwitch label="Achievement Alerts" description="Celebrate when you earn a new badge" checked={settings.achievementAlerts} onChange={() => handleToggle("achievementAlerts")} />
                        <ToggleSwitch label="Deadline Reminders" description="Get reminded before project deadlines" checked={settings.deadlineReminders} onChange={() => handleToggle("deadlineReminders")} />
                        <ToggleSwitch label="Discussion Replies" description="When someone replies to your comments" checked={settings.discussionReplies} onChange={() => handleToggle("discussionReplies")} />
                        <ToggleSwitch label="Mentor Messages" description="Receive messages from your mentors" checked={settings.mentorMessages} onChange={() => handleToggle("mentorMessages")} />
                        <ToggleSwitch label="Marketing Emails" description="Promotional offers and platform news" checked={settings.marketingEmails} onChange={() => handleToggle("marketingEmails")} />
                        <ToggleSwitch label="Weekly Newsletter" description="A digest of new content each week" checked={settings.newsletterSubscription} onChange={() => handleToggle("newsletterSubscription")} />
                      </div>
                      <div className="sett-card space-y-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Push Notifications</p>
                        <ToggleSwitch label="Browser Push Notifications" description="Real-time alerts in your browser" checked={settings.pushNotifications} onChange={() => handleToggle("pushNotifications")} />
                        <ToggleSwitch label="Lesson Reminders" description="Reminders for your scheduled lessons" checked={settings.lessonReminders} onChange={() => handleToggle("lessonReminders")} />
                      </div>
                    </div>
                  </div>
                )}

                {/* APPEARANCE */}
                {activeTab === "appearance" && (
                  <div>
                    <SectionHeader title="Appearance" description="Customize your viewing experience" onSave={() => handleSave("Appearance")} isLoading={isLoading} />
                    <div className="space-y-6 max-w-2xl">
                      <Field label="Theme">
                        <div className="grid grid-cols-3 gap-3 mt-1">
                          {[
                            { id: "light",  icon: Sun,     label: "Light",  bg: "linear-gradient(135deg,#fde68a,#f59e0b)" },
                            { id: "dark",   icon: Moon,    label: "Dark",   bg: "linear-gradient(135deg,#312e81,#6d28d9)" },
                            { id: "system", icon: Monitor, label: "System", bg: "linear-gradient(135deg,#6b7280,#374151)" },
                          ].map(({ id, icon: Icon, label, bg }) => (
                            <button key={id} onClick={() => handleChange("theme", id)}
                              className="p-4 rounded-2xl text-center transition-all"
                              style={{ border: `2px solid ${settings.theme === id ? "#6366f1" : "#e5e7eb"}`, background: settings.theme === id ? "#eef2ff" : "white" }}>
                              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: bg }}>
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                              <span className="text-sm font-semibold" style={{ color: settings.theme === id ? "#4f46e5" : "#374151" }}>{label}</span>
                            </button>
                          ))}
                        </div>
                      </Field>

                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Font Size">
                          <select className="sett-select" value={settings.fontSize} onChange={e => handleChange("fontSize", e.target.value)}>
                            <option value="small">Small (13px)</option>
                            <option value="medium">Medium (15px)</option>
                            <option value="large">Large (17px)</option>
                            <option value="x-large">Extra Large (19px)</option>
                          </select>
                        </Field>
                        <Field label="Font Family">
                          <select className="sett-select" value={settings.fontFamily} onChange={e => handleChange("fontFamily", e.target.value)}>
                            <option value="Inter">Inter</option>
                            <option value="DM Sans">DM Sans</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Poppins">Poppins</option>
                          </select>
                        </Field>
                      </div>

                      {/* Live preview */}
                      <div className="p-4 rounded-2xl sett-card text-center">
                        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Live Preview</p>
                        <p style={{ fontFamily: `'${settings.fontFamily}', sans-serif`, fontSize: { small:"13px", medium:"15px", large:"17px", "x-large":"19px" }[settings.fontSize] || "15px" }}>
                          The quick brown fox jumps over the lazy dog
                        </p>
                      </div>

                      <div className="sett-card space-y-4">
                        <ToggleSwitch label="Compact View" description="Show more content with reduced spacing" checked={settings.compactView} onChange={() => handleToggle("compactView")} />
                        <ToggleSwitch label="Reduce Animations" description="Minimize motion effects throughout the site" checked={settings.reduceAnimations} onChange={() => handleToggle("reduceAnimations")} />
                        <ToggleSwitch label="High Contrast" description="Increase contrast for better visibility" checked={settings.highContrast} onChange={() => handleToggle("highContrast")} />
                      </div>
                    </div>
                  </div>
                )}

                {/* PRIVACY */}
                {activeTab === "privacy" && (
                  <div>
                    <SectionHeader title="Privacy Settings" description="Control what others can see about you" onSave={() => handleSave("Privacy")} isLoading={isLoading} />
                    <div className="space-y-5 max-w-2xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Profile Visibility">
                          <select className="sett-select" value={settings.profileVisibility} onChange={e => handleChange("profileVisibility", e.target.value)}>
                            <option value="public">Public — Everyone</option>
                            <option value="friends">Friends only</option>
                            <option value="private">Private — Only me</option>
                          </select>
                        </Field>
                        <Field label="Who can message you?">
                          <select className="sett-select" value={settings.allowMessages} onChange={e => handleChange("allowMessages", e.target.value)}>
                            <option value="everyone">Everyone</option>
                            <option value="friends">Friends only</option>
                            <option value="none">No one</option>
                          </select>
                        </Field>
                      </div>
                      <div className="sett-card space-y-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Visibility Options</p>
                        <ToggleSwitch label="Show Progress" description="Display your learning progress publicly" checked={settings.showProgress} onChange={() => handleToggle("showProgress")} />
                        <ToggleSwitch label="Show Achievements" description="Show your badges on your profile" checked={settings.showAchievements} onChange={() => handleToggle("showAchievements")} />
                        <ToggleSwitch label="Show Courses" description="Display which courses you're enrolled in" checked={settings.showCourses} onChange={() => handleToggle("showCourses")} />
                        <ToggleSwitch label="Show Certificates" description="Display your earned certificates" checked={settings.showCertificates} onChange={() => handleToggle("showCertificates")} />
                        <ToggleSwitch label="Show Email" description="Display your email on your profile" checked={settings.showEmail} onChange={() => handleToggle("showEmail")} />
                        <ToggleSwitch label="Activity Status" description="Show when you're online" checked={settings.activityStatus} onChange={() => handleToggle("activityStatus")} />
                      </div>
                    </div>
                  </div>
                )}

                {/* LANGUAGE */}
                {activeTab === "language" && (
                  <div>
                    <SectionHeader title="Language & Region" description="Set your locale preferences" onSave={() => handleSave("Language")} isLoading={isLoading} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                      <Field label="Language">
                        <select className="sett-select" value={settings.language} onChange={e => handleChange("language", e.target.value)}>
                          <option value="english">English (US)</option>
                          <option value="khmer">ភាសាខ្មែរ (Khmer)</option>
                          <option value="spanish">Español</option>
                          <option value="french">Français</option>
                          <option value="chinese">中文</option>
                          <option value="japanese">日本語</option>
                        </select>
                      </Field>
                      <Field label="Timezone">
                        <select className="sett-select" value={settings.timezone} onChange={e => handleChange("timezone", e.target.value)}>
                          <option value="Asia/Phnom_Penh">Asia/Phnom_Penh (UTC+7)</option>
                          <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
                          <option value="America/New_York">America/New_York (UTC-5)</option>
                          <option value="Europe/London">Europe/London (UTC+0)</option>
                          <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                        </select>
                      </Field>
                      <Field label="Date Format">
                        <select className="sett-select" value={settings.dateFormat} onChange={e => handleChange("dateFormat", e.target.value)}>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </Field>
                      <Field label="Time Format">
                        <select className="sett-select" value={settings.timeFormat} onChange={e => handleChange("timeFormat", e.target.value)}>
                          <option value="12h">12-hour (AM/PM)</option>
                          <option value="24h">24-hour</option>
                        </select>
                      </Field>
                      <Field label="Currency">
                        <select className="sett-select" value={settings.currency} onChange={e => handleChange("currency", e.target.value)}>
                          <option value="USD">USD — US Dollar</option>
                          <option value="KHR">KHR — Khmer Riel</option>
                          <option value="EUR">EUR — Euro</option>
                          <option value="GBP">GBP — British Pound</option>
                        </select>
                      </Field>
                    </div>
                  </div>
                )}

                {/* SECURITY */}
                {activeTab === "security" && (
                  <div>
                    <SectionHeader title="Security" description="Protect your account" onSave={() => handleSave("Security")} isLoading={isLoading} />
                    <div className="space-y-5 max-w-2xl">
                      <div className="sett-card space-y-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Change Password</p>
                        <Field label="Current Password">
                          <div className="relative">
                            <input className="sett-input" type={showPassword ? "text" : "password"} value={settings.currentPassword} onChange={e => handleChange("currentPassword", e.target.value)} placeholder="••••••••" style={{ paddingRight: "44px" }} />
                            <button onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </Field>
                        <Field label="New Password"><input className="sett-input" type="password" value={settings.newPassword} onChange={e => handleChange("newPassword", e.target.value)} placeholder="••••••••" /></Field>
                        <Field label="Confirm New Password"><input className="sett-input" type="password" value={settings.confirmPassword} onChange={e => handleChange("confirmPassword", e.target.value)} placeholder="••••••••" /></Field>
                      </div>
                      <div className="sett-card space-y-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Security Options</p>
                        <ToggleSwitch label="Two-Factor Authentication" description="Add an extra layer of security" checked={settings.twoFactorAuth} onChange={() => handleToggle("twoFactorAuth")} />
                        <ToggleSwitch label="Login Alerts" description="Get notified of new sign-ins" checked={settings.loginAlerts} onChange={() => handleToggle("loginAlerts")} />
                      </div>
                      <div className="sett-card">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Active Sessions</p>
                        <div className="space-y-2">
                          {[
                            { device: "Current Device", detail: "Chrome · Phnom Penh, Cambodia", active: true },
                            { device: "iPhone 13",       detail: "Safari · 2 days ago",           active: false },
                          ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "white", border: "1px solid #f0f0f8" }}>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#f3f4f6" }}>
                                  <Smartphone className="h-4 w-4 text-gray-500" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">{s.device}</p>
                                  <p className="text-xs text-gray-500">{s.detail}</p>
                                </div>
                              </div>
                              {s.active
                                ? <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "#dcfce7", color: "#166534" }}>Active</span>
                                : <button className="text-xs font-semibold text-red-600 hover:text-red-700">Revoke</button>}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="danger-zone">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-red-900 text-sm">Delete Account</p>
                            <p className="text-xs text-red-700 mt-0.5 leading-relaxed">Once deleted, all your data is permanently removed.</p>
                          </div>
                          <button className="px-3 py-1.5 rounded-xl text-sm font-semibold text-white flex-shrink-0" style={{ background: "#ef4444" }}>Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PAYMENT */}
                {activeTab === "payment" && (
                  <div>
                    <SectionHeader title="Payment Settings" description="Manage billing and payment methods" onSave={() => handleSave("Payment")} isLoading={isLoading} />
                    <div className="space-y-5 max-w-2xl">
                      <div className="sett-card">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Methods</p>
                        <div className="space-y-2">
                          {settings.paymentMethods.map(m => (
                            <div key={m.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "white", border: "1px solid #f0f0f8" }}>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#eef2ff" }}>
                                  <CreditCard className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">{m.type.charAt(0).toUpperCase() + m.type.slice(1)} •••• {m.last4}</p>
                                  <p className="text-xs text-gray-500">Expires {m.exp}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {m.default && <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "#dcfce7", color: "#166534" }}>Default</span>}
                                <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Edit</button>
                              </div>
                            </div>
                          ))}
                          <button className="w-full mt-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                            style={{ border: "1.5px dashed #c7d2fe", color: "#4f46e5", background: "#fafafe" }}>
                            + Add Payment Method
                          </button>
                        </div>
                      </div>
                      <Field label="Billing Address"><input className="sett-input" type="text" value={settings.billingAddress} onChange={e => handleChange("billingAddress", e.target.value)} /></Field>
                      <div className="sett-card">
                        <ToggleSwitch label="Auto-Renewal" description="Automatically renew your subscription each period" checked={settings.autoRenewal} onChange={() => handleToggle("autoRenewal")} />
                      </div>
                      <div className="sett-card">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Billing History</p>
                        <div className="space-y-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "white", border: "1px solid #f0f0f8" }}>
                              <div className="flex items-center gap-3">
                                <History className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-800">Premium Subscription</p>
                                  <p className="text-xs text-gray-500">Feb {i}, 2026</p>
                                </div>
                              </div>
                              <span className="text-sm font-bold text-gray-800">$9.99</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ACCESSIBILITY */}
                {activeTab === "accessibility" && (
                  <div>
                    <SectionHeader title="Accessibility" description="Make the platform work better for you" onSave={() => handleSave("Accessibility")} isLoading={isLoading} />
                    <div className="sett-card space-y-4 max-w-2xl">
                      <ToggleSwitch label="Screen Reader Support" description="Optimize for screen readers and assistive technologies" checked={settings.screenReader} onChange={() => handleToggle("screenReader")} />
                      <ToggleSwitch label="High Contrast Mode" description="Increase contrast for better visibility" checked={settings.highContrastMode} onChange={() => handleToggle("highContrastMode")} />
                      <ToggleSwitch label="Reduced Motion" description="Minimize animations and motion effects" checked={settings.reducedMotion} onChange={() => handleToggle("reducedMotion")} />
                      <ToggleSwitch label="Keyboard Navigation" description="Enhanced keyboard navigation support" checked={settings.keyboardNavigation} onChange={() => handleToggle("keyboardNavigation")} />
                      <ToggleSwitch label="Always Show Captions" description="Display captions on all video content" checked={settings.captionPreferences} onChange={() => handleToggle("captionPreferences")} />
                    </div>
                  </div>
                )}

                {/* DOWNLOADS */}
                {activeTab === "downloads" && (
                  <div>
                    <SectionHeader title="Downloads & Offline" description="Manage your offline content and storage" onSave={() => handleSave("Downloads")} isLoading={isLoading} />
                    <div className="space-y-5 max-w-2xl">
                      <div className="sett-card">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Storage Used</p>
                          <span className="text-sm font-bold text-gray-700">{settings.usedStorage} / {settings.storageLimit}</span>
                        </div>
                        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#e5e7eb" }}>
                          <div className="h-full rounded-full" style={{ width: "32%", background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }} />
                        </div>
                      </div>
                      <div className="sett-card space-y-4">
                        <ToggleSwitch label="Auto-Download" description="Automatically download new lessons on Wi-Fi" checked={settings.autoDownload} onChange={() => handleToggle("autoDownload")} />
                        <ToggleSwitch label="Offline Access" description="Access downloaded content without internet" checked={settings.offlineAccess} onChange={() => handleToggle("offlineAccess")} />
                      </div>
                      <Field label="Download Quality">
                        <select className="sett-select" value={settings.downloadQuality} onChange={e => handleChange("downloadQuality", e.target.value)}>
                          <option value="hd">HD (1080p) — Best quality</option>
                          <option value="sd">SD (480p) — Balanced</option>
                          <option value="ld">LD (240p) — Smallest files</option>
                        </select>
                      </Field>
                      <div className="sett-card">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Downloaded Content</p>
                        <div className="space-y-2">
                          {[
                            { name: "Advanced React Development", size: "1.2 GB" },
                            { name: "Full Stack JavaScript",       size: "850 MB" },
                          ].map(item => (
                            <div key={item.name} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "white", border: "1px solid #f0f0f8" }}>
                              <div className="flex items-center gap-3">
                                <BookOpen className="h-4 w-4 text-indigo-400" />
                                <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                              </div>
                              <span className="text-xs font-semibold text-gray-500">{item.size}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
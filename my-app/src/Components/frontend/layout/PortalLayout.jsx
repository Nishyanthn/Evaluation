import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './stylePortal.css';

// Top-level nav icons (icon-only left sidebar)
const NAV_ITEMS = [
  { id: 'dashboard',  icon: <GridIcon />,    label: 'Dashboard' },
  { id: 'analytics',  icon: <BarIcon />,     label: 'Analytics' },
  { id: 'insights',   icon: <BulbIcon />,    label: 'Insights' },
  { id: 'broadcast',  icon: <RadioIcon />,   label: 'Broadcast' },
  { id: 'integrations',icon: <LinkIcon />,   label: 'Integrations' },
  { id: 'knowledge',  icon: <BookIcon />,    label: 'Knowledge Area', active: true },
  { id: 'contacts',   icon: <UsersIcon />,   label: 'Contacts' },
  { id: 'tasks',      icon: <TaskIcon />,    label: 'Tasks' },
];

export default function PortalLayout({ children, activeSection = 'knowledge' }) {
  const navigate = useNavigate();

  return (
    <div className="portal-root">
      {/* ── Top Navbar ── */}
      <header className="portal-navbar">
        <div className="portal-navbar-left">
          <div className="portal-brand">
            <div className="portal-brand-logo">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="14" fill="#f97316" opacity="0.15"/>
                <path d="M8 14 C8 10 12 7 14 7 C16 7 20 10 20 14" stroke="#f97316" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                <circle cx="14" cy="17" r="4" fill="#f97316"/>
              </svg>
            </div>
            <div className="portal-brand-text">
              <span className="portal-brand-name">iNextLabs</span>
              <span className="portal-brand-divider">|</span>
              <div>
                <div className="portal-brand-product">EngageAI</div>
                <div className="portal-brand-sub">ADMIN PORTAL</div>
              </div>
            </div>
          </div>
        </div>

        <div className="portal-navbar-right">
          <button className="portal-nav-btn portal-copilot-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.5 4.3 12.6l.7-4.1L2 5.6l4.2-.9L8 1z" fill="#f97316"/>
            </svg>
            inFlow Copilot
          </button>
          <button className="portal-icon-btn" title="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <button className="portal-icon-btn" title="Help">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </button>
          <button className="portal-icon-btn" title="Theme">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
          <button className="portal-icon-btn" title="Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <div className="portal-avatar">N</div>
        </div>
      </header>

      <div className="portal-body">
        {/* ── Icon Sidebar ── */}
        <aside className="portal-sidebar">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`portal-sidebar-btn ${activeSection === item.id ? 'portal-sidebar-btn-active' : ''}`}
              title={item.label}
              onClick={() => item.id === 'knowledge' && navigate('/knowledge')}
            >
              {item.icon}
            </button>
          ))}
        </aside>

        {/* ── Page Content ── */}
        <main className="portal-content">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ── Inline SVG icon components (keeps zero extra deps) ── */
function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}
function BarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}
function BulbIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="2" x2="12" y2="3"/>
      <path d="M12 6a6 6 0 0 1 6 6c0 3-2 5-2 7H8c0-2-2-4-2-7a6 6 0 0 1 6-6z"/>
      <path d="M8 19h8"/><path d="M9 22h6"/>
    </svg>
  );
}
function RadioIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <circle cx="12" cy="20" r="1" fill="currentColor"/>
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function TaskIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  );
}

import { Outlet, NavLink, Link } from 'react-router-dom'
import { useState } from 'react'

const navLinkStyle = ({ isActive }) => ({
  fontSize: 14,
  fontWeight: isActive ? 500 : 400,
  color: isActive ? 'var(--pink-dark)' : 'var(--brown-light)',
  padding: '4px 2px',
  borderBottom: isActive ? '2px solid var(--pink-dark)' : '2px solid transparent',
  transition: 'color 0.2s',
})

const mobileNavLinkStyle = ({ isActive }) => ({
  display: 'block',
  padding: '10px 12px',
  borderRadius: 10,
  fontSize: 15,
  fontWeight: isActive ? 500 : 400,
  color: isActive ? 'var(--pink-dark)' : 'var(--brown)',
  background: isActive ? 'var(--pink-light)' : 'transparent',
})

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @media (max-width: 600px) {
          #nav-links { display: none !important; }
          #menu-btn { display: block !important; }
        }
      `}</style>

      {/* Header (Navbar) */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #f0ddd6', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(180,100,120,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo in Header */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/imei-crochet.jpg" alt="Imei Crochet Logo" style={{ height: 44, width: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--pink-light)' }} />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--brown)' }}>
              imei<span style={{ color: 'var(--pink-dark)', fontStyle: 'italic' }}>_crochet</span>
            </span>
          </Link>

          <ul id="nav-links" style={{ display: 'flex', gap: 28, alignItems: 'center', listStyle: 'none' }}>
            <li><NavLink to="/" end style={navLinkStyle}>Home</NavLink></li>
            <li><NavLink to="/shop" style={navLinkStyle}>Shop</NavLink></li>
            <li><NavLink to="/categories" style={navLinkStyle}>Categories</NavLink></li>
            <li><NavLink to="/about" style={navLinkStyle}>About</NavLink></li>
          </ul>

          <button id="menu-btn" style={{ background: 'none', border: 'none', fontSize: 22, color: 'var(--brown)', display: 'none', padding: 4 }} onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>

        {mobileOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid var(--border)', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <NavLink to="/" end style={mobileNavLinkStyle} onClick={() => setMobileOpen(false)}>Home</NavLink>
            <NavLink to="/shop" style={mobileNavLinkStyle} onClick={() => setMobileOpen(false)}>Shop</NavLink>
            <NavLink to="/categories" style={mobileNavLinkStyle} onClick={() => setMobileOpen(false)}>Categories</NavLink>
            <NavLink to="/about" style={mobileNavLinkStyle} onClick={() => setMobileOpen(false)}>About</NavLink>
          </div>
        )}
      </nav>

      {/* Page content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer (Bottom section) */}
      <footer style={{ background: 'var(--brown)', color: '#f5ede2', padding: '40px 20px 24px', marginTop: 60, textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: '#c4a898', marginBottom: 20 }}>Me & Mei making magic with yarn 🧶 Tiny treasures, handmade with love</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
          <Link to="/shop" style={{ fontSize: 13, color: '#e8d5cc' }}>Shop</Link>
          <Link to="/categories" style={{ fontSize: 13, color: '#e8d5cc' }}>Categories</Link>
          <Link to="/about" style={{ fontSize: 13, color: '#e8d5cc' }}>About Us</Link>
        </div>
        
        <div style={{ fontSize: 12, color: '#9b7568', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span>© {new Date().getFullYear()} Imei Crochet · Handmade with love</span>
          <span style={{ opacity: 0.5 }}>|</span>
          
          {/* Visible, professional Admin Login link */}
          <Link 
            to="/admin/login" 
            style={{ color: '#c4a898', textDecoration: 'none', padding: '4px 8px' }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = '#c4a898'}
          >
            Admin Login
          </Link>
        </div>
      </footer>
    </div>
  )
}
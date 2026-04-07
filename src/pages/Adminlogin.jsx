import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [pw, setPw]       = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin() {
    if (!email || !pw) { setError('Please enter email and password.'); return }
    setLoading(true)
    setError('')
    
    // Secure Login via Supabase!
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: pw,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
    } else {
      // Success! Set our local guard and redirect
      sessionStorage.setItem('imei_admin', '1')
      navigate('/admin')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 60%, #fdf6f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', border: '1px solid var(--border)', boxShadow: '0 8px 40px rgba(180,100,120,0.13)', width: '100%', maxWidth: 400, textAlign: 'center' }}>
        
        <img src="/imei-crochet.jpg" alt="Logo" style={{ height: 64, width: 64, borderRadius: '50%', marginBottom: 16 }} />
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24, letterSpacing: 1, fontWeight: 600 }}>SECURE ADMIN LOGIN</div>

        <div style={{ textAlign: 'left', marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Email</label>
          <input type="email" placeholder="admin@example.com" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: 15, outline: 'none', background: '#fdf6f0' }} />
        </div>

        <div style={{ textAlign: 'left', marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Password</label>
          <input type="password" placeholder="••••••••" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: 15, outline: 'none', background: '#fdf6f0' }} />
        </div>

        {error && <div style={{ padding: '10px 14px', background: 'var(--red-light)', borderRadius: 10, color: 'var(--red)', fontSize: 13, marginBottom: 16, textAlign: 'left' }}>⚠️ {error}</div>}

        <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: 12, background: loading ? '#ddd' : 'var(--pink-dark)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 20 }}>
          {loading ? 'Authenticating…' : 'Secure Log in'}
        </button>

        <a href="/" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to public shop</a>
      </div>
    </div>
  )
}
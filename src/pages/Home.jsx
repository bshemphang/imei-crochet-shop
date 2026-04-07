import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, CATEGORIES, WHATSAPP_NUMBER } from '../lib/supabase'
import ProductCard from '../components/ProductCard'

const CAT_ICONS = { Keychains: '🔑', Bouquets: '💐', Amigurumi: '🐻', Headbands: '🌸', Bags: '👜', Flowers: '🌷', Other: '✨' }
const CAT_COLORS = ['#fce4ec', '#f3e5f5', '#e8f5ee', '#fff4e0', '#fce4ec', '#e3f2fd', '#f3e5f5']

export default function Home() {
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .gt('stock', 0)
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => setFeatured(data || []))
      .catch(() => {})
  }, [])

  const customMsg = encodeURIComponent("Hi! I'd like to place a custom crochet order.")

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 50%, #fdf6f0 100%)', padding: '64px 20px 56px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧶</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px, 6vw, 50px)', color: 'var(--brown)', lineHeight: 1.2, marginBottom: 14 }}>
            Handmade with <span style={{ color: 'var(--pink-dark)', fontStyle: 'italic' }}>love</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.7 }}>Me & Mei making magic with yarn — tiny treasures, perfect for gifting.</p>
          <p style={{ fontSize: 13, color: 'var(--lavender-dark)', marginBottom: 32 }}>✨ Customized orders accepted · 🚚 Shipping Pan India</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/shop" style={{ background: 'var(--pink-dark)', color: '#fff', padding: '12px 28px', borderRadius: 30, fontSize: 14, fontWeight: 500 }}>Shop now</Link>
            <Link to="/categories" style={{ background: '#fff', color: 'var(--brown)', padding: '12px 28px', borderRadius: 30, fontSize: 14, border: '1px solid var(--border)' }}>Browse categories</Link>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '16px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 'clamp(16px, 4vw, 48px)', flexWrap: 'wrap' }}>
          {[['🎁','Perfect for gifting'], ['🎨','Customized orders'], ['🚚','Ships Pan India'], ['💬','Order via WhatsApp']].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
              <span style={{ fontSize: 18 }}>{icon}</span>{text}
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 20px 0' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--brown)', textAlign: 'center', marginBottom: 6 }}>Shop by Category</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>Find exactly what you're looking for</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
          {CATEGORIES.map((cat, i) => (
            <Link key={cat} to={`/categories?cat=${cat}`}
              style={{ background: CAT_COLORS[i % CAT_COLORS.length], borderRadius: 14, padding: '18px 12px', textAlign: 'center', border: '1px solid var(--border)', display: 'block' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{CAT_ICONS[cat]}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--brown)' }}>{cat}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--brown)', marginBottom: 4 }}>New Arrivals</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Fresh from our crochet hooks</p>
            </div>
            <Link to="/shop" style={{ fontSize: 13, color: 'var(--pink-dark)', fontWeight: 500 }}>View all →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, var(--lavender-light), var(--pink-light))', padding: '48px 20px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--brown)', marginBottom: 10 }}>Want something custom?</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.7 }}>
          We accept customized orders! Pick your colors, size, and characters. DM us on WhatsApp to get started.
        </p>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${customMsg}`} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25d366', color: '#fff', padding: '12px 28px', borderRadius: 30, fontSize: 14, fontWeight: 500 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Chat with us on WhatsApp
        </a>
      </section>
    </div>
  )
}
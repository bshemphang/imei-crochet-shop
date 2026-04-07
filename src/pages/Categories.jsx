import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase, CATEGORIES } from '../lib/supabase'
import ProductCard from '../components/ProductCard'

const INFO = {
  Keychains: { icon: '🔑', desc: 'Cute crochet keychains for your keys and bags',  color: '#fce4ec' },
  Bouquets:  { icon: '💐', desc: 'Everlasting crochet flower bouquets',             color: '#f3e5f5' },
  Amigurumi: { icon: '🐻', desc: 'Adorable crocheted plushies and characters',      color: '#e8f5ee' },
  Headbands: { icon: '🌸', desc: 'Handmade floral headbands',                       color: '#fff4e0' },
  Bags:      { icon: '👜', desc: 'Crochet bags and pouches',                        color: '#fce4ec' },
  Flowers:   { icon: '🌷', desc: 'Individual crochet flowers',                      color: '#e3f2fd' },
  Other:     { icon: '✨', desc: 'More handmade treasures',                         color: '#f3e5f5' },
}

export default function Categories() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCat = searchParams.get('cat') || null
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(false)
  const [counts, setCounts]     = useState({})

  // Load item counts per category
  useEffect(() => {
    if (!supabase) return
    async function loadCounts() {
      const result = {}
      for (const cat of CATEGORIES) {
        try {
          const { count } = await supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('category', cat)
            .eq('is_available', true)
          result[cat] = count ?? 0
        } catch {
          result[cat] = 0
        }
      }
      setCounts(result)
    }
    loadCounts()
  }, [])

  // Load products for selected category
  useEffect(() => {
    if (!activeCat) { setProducts([]); return }
    if (!supabase) return

    async function loadProducts() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', activeCat)
          .eq('is_available', true)
          .order('created_at', { ascending: false })
        if (error) throw error
        setProducts(data || [])
      } catch (e) {
        console.error(e.message)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [activeCat])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, color: 'var(--brown)', marginBottom: 6 }}>Categories</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>Browse by type</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 40 }}>
        {CATEGORIES.map(cat => {
          const info = INFO[cat] || { icon: '✨', color: '#fce4ec' }
          const isActive = activeCat === cat
          return (
            <button key={cat} onClick={() => setSearchParams(isActive ? {} : { cat })}
              style={{ background: isActive ? 'var(--pink-light)' : info.color, border: isActive ? '2px solid var(--pink-dark)' : '1.5px solid var(--border)', borderRadius: 16, padding: '20px 14px', textAlign: 'center', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{info.icon}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--brown)', fontWeight: 600, marginBottom: 4 }}>{cat}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {counts[cat] !== undefined ? `${counts[cat]} items` : '—'}
              </div>
            </button>
          )
        })}
      </div>

      {activeCat && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <span style={{ fontSize: 28 }}>{INFO[activeCat]?.icon}</span>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--brown)' }}>{activeCat}</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{INFO[activeCat]?.desc}</p>
            </div>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🧶</div>Loading...
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, background: 'var(--lavender-light)', borderRadius: 16, color: 'var(--text-muted)' }}>
              No products in this category yet. Check back soon!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      )}

      {!activeCat && (
        <div style={{ textAlign: 'center', padding: '32px 20px', background: 'linear-gradient(135deg, var(--pink-light), var(--lavender-light))', borderRadius: 20, color: 'var(--text-muted)', fontSize: 14 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👆</div>
          Click a category above to see its products
        </div>
      )}
    </div>
  )
}
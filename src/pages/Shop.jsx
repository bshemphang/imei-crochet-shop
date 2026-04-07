import { useEffect, useState } from 'react'
import { supabase, CATEGORIES } from '../lib/supabase'
import ProductCard from '../components/ProductCard'

export default function Shop() {
  const [products, setProducts]         = useState([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [activeCategory, setActiveCat]  = useState('All')
  const [stockFilter, setStockFilter]   = useState('all')
  const [search, setSearch]             = useState('')

  // ✅ FIX: We moved the async function inside the useEffect!
  useEffect(() => {
    async function loadProducts() {
      if (!supabase) {
        setError('Supabase is not configured. Please fill in your .env file.')
        return
      }
      setLoading(true)
      setError(null)
      try {
        let q = supabase
          .from('products')
          .select('*')
          .eq('is_available', true)
          .order('created_at', { ascending: false })

        if (activeCategory !== 'All') q = q.eq('category', activeCategory)
        if (stockFilter === 'instock') q = q.gt('stock', 0)

        const { data, error: err } = await q
        if (err) throw err
        setProducts(data || [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [activeCategory, stockFilter])

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, color: 'var(--brown)', marginBottom: 6 }}>Our Shop</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>All handmade with love — DM to order, ships Pan India 🚚</p>

      <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: '11px 16px', borderRadius: 12, border: '1px solid var(--border)', fontSize: 14, background: '#fff', marginBottom: 14, outline: 'none', color: 'var(--text)' }} />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {['All', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setActiveCat(cat)} style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
            border: activeCategory === cat ? '1.5px solid var(--pink-dark)' : '1px solid var(--border)',
            background: activeCategory === cat ? 'var(--pink-light)' : '#fff',
            color: activeCategory === cat ? 'var(--pink-dark)' : 'var(--text-muted)',
            fontWeight: activeCategory === cat ? 500 : 400,
          }}>{cat}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['all','All items'],['instock','In stock only']].map(([val, label]) => (
          <button key={val} onClick={() => setStockFilter(val)} style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
            border: stockFilter === val ? '1.5px solid var(--lavender-dark)' : '1px solid var(--border)',
            background: stockFilter === val ? 'var(--lavender-light)' : '#fff',
            color: stockFilter === val ? 'var(--lavender-dark)' : 'var(--text-muted)',
          }}>{label}</button>
        ))}
      </div>

      {error && (
        <div style={{ padding: 16, background: 'var(--red-light)', borderRadius: 12, color: 'var(--red)', fontSize: 13, marginBottom: 20 }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🧶</div>Loading products...
        </div>
      ) : filtered.length === 0 && !error ? (
        <div style={{ textAlign: 'center', padding: 64, background: 'var(--lavender-light)', borderRadius: 'var(--radius)', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--brown)', marginBottom: 8 }}>Nothing found</p>
          <p style={{ fontSize: 14 }}>Try a different category or search term.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
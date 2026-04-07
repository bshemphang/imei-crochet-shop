import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, CATEGORIES } from '../lib/supabase'

// ── Guard: redirect to login if not authenticated ────────────────────────────
function useAdminGuard() {
  const navigate = useNavigate()
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        sessionStorage.removeItem('imei_admin') // Clear old ghost sessions
        navigate('/admin/login')
      }
    })
  }, [navigate])
}

// ── Small helpers ────────────────────────────────────────────────────────────
const emptyForm = {
  name: '', description: '', price: '', category: CATEGORIES[0],
  stock: '', is_available: true, image_url: '', additional_images: [],
}

function Toast({ toast }) {
  if (!toast) return null
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      background: toast.type === 'err' ? '#e57373' : '#2d8a55',
      color: '#fff', padding: '14px 28px', borderRadius: 14,
      fontSize: 14, fontWeight: 500, zIndex: 9999,
      boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
      display: 'flex', alignItems: 'center', gap: 10,
      whiteSpace: 'nowrap',
    }}>
      {toast.type === 'err' ? '⚠️' : '✅'} {toast.msg}
    </div>
  )
}

function StockPill({ stock }) {
  const color = stock === 0 ? '#e57373' : stock <= 3 ? '#f5a623' : '#2d8a55'
  const bg    = stock === 0 ? '#fdeaea' : stock <= 3 ? '#fff4e0' : '#e8f5ee'
  return (
    <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 20, background: bg, color }}>
      {stock === 0 ? 'Out of stock' : stock <= 3 ? `Only ${stock} left` : `${stock} in stock`}
    </span>
  )
}

// ── Main Admin page ──────────────────────────────────────────────────────────
export default function Admin() {
  useAdminGuard()
  const navigate = useNavigate()

  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [toast, setToast]         = useState(null)
  const [view, setView]           = useState('list')   // 'list' | 'add' | 'edit'
  const [form, setForm]           = useState(emptyForm)
  const [editId, setEditId]       = useState(null)
  
  const [imgFile, setImgFile]     = useState(null)
  const [imgPrev, setImgPrev]     = useState(null)
  const [galleryFiles, setGalleryFiles] = useState([]) 
  const [galleryPrevs, setGalleryPrevs] = useState([]) 

  const [uploadingImg, setUploadingImg] = useState(false)
  const [search, setSearch]       = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null) 
  
  const fileRef = useRef()
  const galleryRef = useRef() 

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [])

  function notify(msg, type = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function load() {
    if (!supabase) { notify('Supabase not set up yet. Fill in your .env file.', 'err'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setProducts(data || [])
    } catch (e) {
      notify('Could not load products: ' + e.message, 'err')
    } finally {
      setLoading(false)
    }
  }

  function pickImage(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { notify('Image must be under 5MB.', 'err'); return }
    setImgFile(file)
    setImgPrev(URL.createObjectURL(file))
  }

  function pickGalleryImages(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024)
    if (validFiles.length < files.length) notify('Some images skipped (must be under 5MB)', 'err')
    setGalleryFiles(prev => [...prev, ...validFiles])
    setGalleryPrevs(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))])
  }

  function removeImage() {
    setImgFile(null); setImgPrev(null); setForm(f => ({ ...f, image_url: '' }))
    if (fileRef.current) fileRef.current.value = ''
  }

  function removeGalleryImage(index) {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index))
    setGalleryPrevs(prev => prev.filter((_, i) => i !== index))
  }

  function removeSavedGalleryImage(index) {
    setForm(f => ({ ...f, additional_images: f.additional_images.filter((_, i) => i !== index) }))
  }

  async function uploadImage(file) {
    const ext  = file.name.split('.').pop().toLowerCase()
    const name = `product_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
    const { error: upErr } = await supabase.storage.from('product-images').upload(name, file, { upsert: true })
    if (upErr) throw upErr
    const { data } = supabase.storage.from('product-images').getPublicUrl(name)
    return data.publicUrl
  }

  async function handleSave() {
    if (!form.name.trim())         { notify('Please enter a product name.', 'err'); return }
    if (!form.price || +form.price <= 0) { notify('Please enter a valid price.', 'err'); return }
    if (form.stock === '' || +form.stock < 0) { notify('Please enter stock quantity (0 or more).', 'err'); return }
    if (!supabase)                 { notify('Supabase not configured.', 'err'); return }

    setSaving(true)
    setUploadingImg(true) 
    
    try {
      let image_url = form.image_url || null
      if (imgFile) image_url = await uploadImage(imgFile)

      let additional_images = form.additional_images || []
      if (galleryFiles.length > 0) {
        const newUrls = await Promise.all(galleryFiles.map(f => uploadImage(f)))
        additional_images = [...additional_images, ...newUrls]
      }

      const payload = {
        name:         form.name.trim(),
        description:  form.description.trim(),
        price:        Math.round(+form.price),
        category:     form.category,
        stock:        Math.round(+form.stock),
        is_available: form.is_available,
        image_url,
        additional_images, 
      }

      if (editId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editId)
        if (error) throw error
        notify('Product updated successfully!')
      } else {
        const { error } = await supabase.from('products').insert(payload)
        if (error) throw error
        notify('Product added to shop!')
      }

      cancelForm()
      await load()
    } catch (e) {
      notify('Something went wrong: ' + e.message, 'err')
    } finally {
      setSaving(false)
      setUploadingImg(false)
    }
  }

  function startEdit(p) {
    setForm({ ...p, price: String(p.price), stock: String(p.stock), additional_images: p.additional_images || [] })
    setEditId(p.id)
    setImgPrev(p.image_url || null)
    setImgFile(null)
    setGalleryFiles([])
    setGalleryPrevs([])
    setView('edit')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      notify('Product deleted.')
      setDeleteConfirm(null)
      await load()
    } catch (e) { notify('Delete failed: ' + e.message, 'err') }
  }

  async function changeStock(id, val) {
    if (val < 0) return
    try {
      const { error } = await supabase.from('products').update({ stock: val }).eq('id', id)
      if (error) throw error
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: val } : p))
    } catch (e) { notify('Stock update failed: ' + e.message, 'err') }
  }

  async function toggleVisible(p) {
    try {
      const { error } = await supabase.from('products').update({ is_available: !p.is_available }).eq('id', p.id)
      if (error) throw error
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, is_available: !p.is_available } : x))
      notify(p.is_available ? 'Product hidden from shop.' : 'Product visible in shop.')
    } catch (e) { notify('Could not update visibility: ' + e.message, 'err') }
  }

  function cancelForm() {
    setView('list'); setForm(emptyForm); setEditId(null); 
    setImgFile(null); setImgPrev(null);
    setGalleryFiles([]); setGalleryPrevs([]);
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  // ── Styles ────────────────────────────────────────────────────────────────
  const s = {
    page:    { minHeight: '100vh', background: '#f8f2f0', fontFamily: 'var(--font-sans)' },
    topbar:  { background: '#fff', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: 'var(--shadow)' },
    body:    { maxWidth: 900, margin: '0 auto', padding: '28px 20px' },
    card:    { background: '#fff', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '24px' },
    label:   { fontSize: 13, fontWeight: 500, color: 'var(--brown)', display: 'block', marginBottom: 7 },
    input:   { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 14, color: 'var(--text)', background: '#fdf8f6', outline: 'none', transition: 'border-color 0.2s' },
    btnPink: { padding: '11px 22px', borderRadius: 10, background: 'var(--pink-dark)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
    btnGray: { padding: '11px 22px', borderRadius: 10, background: '#fff', color: 'var(--text-muted)', border: '1px solid var(--border)', fontSize: 14, cursor: 'pointer' },
  }

  // ── Form view (Add / Edit) ────────────────────────────────────────────────
  if (view === 'add' || view === 'edit') {
    return (
      <div style={s.page}>
        <Toast toast={toast} />
        <div style={s.topbar}>
          {/* CORRECT LOGO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/imei-crochet.jpg" alt="Imei Crochet Logo" style={{ height: 40, width: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--pink-light)' }} />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--brown)' }}>imei<span style={{ color: 'var(--pink-dark)', fontStyle: 'italic' }}>_crochet</span></span>
          </div>
          {/* CLEARER BACK BUTTON */}
          <button onClick={cancelForm} style={{ ...s.btnGray, padding: '6px 14px', fontSize: 13, border: 'none', background: 'var(--lavender-light)', color: 'var(--lavender-dark)', fontWeight: 600 }}>
            ← Back to Dashboard
          </button>
        </div>

        <div style={s.body}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--brown)', marginBottom: 24 }}>
            {view === 'edit' ? '✏️ Edit Product' : '➕ Add New Product'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Image Upload Section */}
            <div style={s.card}>
              <label style={{ ...s.label, fontSize: 15 }}>📸 Product Photos</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--brown)', marginBottom: 8, display: 'block' }}>Main Cover Photo *</label>
                  {imgPrev ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={imgPrev} alt="preview" style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 14, border: '2px solid var(--pink-light)' }} />
                      <button onClick={removeImage} style={{ position: 'absolute', top: -8, right: -8, width: 28, height: 28, borderRadius: '50%', background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer' }}>✕</button>
                    </div>
                  ) : (
                    <div onClick={() => fileRef.current.click()} style={{ width: 160, height: 160, border: '2px dashed var(--pink)', borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--pink-light)' }}>
                      <div style={{ fontSize: 24 }}>📷</div>
                      <div style={{ fontSize: 12, color: 'var(--pink-dark)', marginTop: 4, fontWeight: 500 }}>Add Main Photo</div>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pickImage} />
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--brown)', marginBottom: 8, display: 'block' }}>Gallery Photos (Optional)</label>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Add extra angles or details for the product page.</p>
                  
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {form.additional_images.map((url, i) => (
                      <div key={url} style={{ position: 'relative' }}>
                        <img src={url} alt="gallery" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} />
                        <button type="button" onClick={() => removeSavedGalleryImage(i)} style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%', background: '#e57373', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 10 }}>✕</button>
                      </div>
                    ))}
                    {galleryPrevs.map((prev, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={prev} alt="gallery" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, border: '2px solid var(--pink-light)' }} />
                        <button type="button" onClick={() => removeGalleryImage(i)} style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%', background: '#e57373', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 10 }}>✕</button>
                      </div>
                    ))}
                    <div onClick={() => galleryRef.current.click()} style={{ width: 90, height: 90, border: '2px dashed var(--border)', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fdf8f6' }}>
                      <div style={{ fontSize: 20 }}>➕</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Add more</div>
                    </div>
                  </div>
                  <input ref={galleryRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={pickGalleryImages} />
                </div>
              </div>
            </div>

            {/* Product details */}
            <div style={s.card}>
              <label style={{ ...s.label, fontSize: 15 }}>📝 Product Details</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
                <div>
                  <label style={s.label}>Product Name *</label>
                  <input style={s.input} placeholder="e.g. Sunflower Keychain" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label style={s.label}>Description <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
                  <textarea style={{ ...s.input, minHeight: 90, resize: 'vertical' }} placeholder="Describe the product — material, size, colors, etc." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={s.label}>💰 Price (₹) *</label>
                    <input style={{ ...s.input, fontSize: 18, fontWeight: 600 }} type="number" min="1" placeholder="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                  </div>
                  <div>
                    <label style={s.label}>📦 Stock count *</label>
                    <input style={{ ...s.input, fontSize: 18, fontWeight: 600 }} type="number" min="0" placeholder="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label style={s.label}>🏷️ Category</label>
                  <select style={{ ...s.input, cursor: 'pointer' }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>👁️ Visibility</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[
                      { val: true,  label: '✅ Visible in shop',  desc: 'Customers can see this' },
                      { val: false, label: '🙈 Hidden',           desc: 'Only you can see this' },
                    ].map(opt => (
                      <button key={String(opt.val)} type="button" onClick={() => setForm(f => ({ ...f, is_available: opt.val }))}
                        style={{
                          flex: 1, padding: '12px 10px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                          border: form.is_available === opt.val ? '2px solid var(--pink-dark)' : '1.5px solid var(--border)',
                          background: form.is_available === opt.val ? 'var(--pink-light)' : '#fff',
                        }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--brown)', marginBottom: 2 }}>{opt.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Save buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleSave} disabled={saving || uploadingImg} style={{ ...s.btnPink, flex: 1, padding: '15px', fontSize: 16, opacity: (saving || uploadingImg) ? 0.7 : 1 }}>
                {uploadingImg ? '⏫ Uploading photos…' : saving ? '💾 Saving…' : view === 'edit' ? '💾 Save Changes' : '🎉 Add to Shop'}
              </button>
              <button onClick={cancelForm} style={{ ...s.btnGray, padding: '15px 20px' }}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <Toast toast={toast} />

      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '32px 28px', maxWidth: 360, width: '100%', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--brown)', marginBottom: 10 }}>Delete product?</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>This will permanently remove the product from your shop. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ ...s.btnPink, flex: 1, background: '#e57373' }}>Yes, delete</button>
              <button onClick={() => setDeleteConfirm(null)} style={{ ...s.btnGray, flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar with CORRECT LOGO */}
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/imei-crochet.jpg" alt="Imei Crochet Logo" style={{ height: 40, width: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--pink-light)' }} />
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--brown)' }}>imei<span style={{ color: 'var(--pink-dark)', fontStyle: 'italic' }}>_crochet</span> <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', marginLeft: 8 }}>Admin</span></span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <a href="/" target="_blank" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>View shop ↗</a>
          <button 
            onClick={async () => { 
              await supabase.auth.signOut(); // Securely log out of Supabase
              sessionStorage.removeItem('imei_admin'); 
              navigate('/admin/login'); 
            }} 
            style={{ ...s.btnGray, padding: '7px 16px', fontSize: 13 }}>
            Log out
          </button>
        </div>
      </div>

      <div style={s.body}>
        {/* BIG UPGRADE: Business Overview Dashboard */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--brown)', marginBottom: 4 }}>Dashboard</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Welcome back! Here is your shop overview.</p>
            </div>
            <button onClick={() => { setView('add'); setForm(emptyForm); setImgFile(null); setImgPrev(null); setGalleryFiles([]); setGalleryPrevs([]) }}
              style={{ ...s.btnPink, fontSize: 15, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(233, 30, 99, 0.2)' }}>
              ➕ Add New Product
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🛍️</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--brown)' }}>{products.length}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total Products Created</div>
            </div>
            
            <div style={{ background: '#e8f5ee', padding: 20, borderRadius: 16, border: '1px solid #a5d6b5' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#2d8a55' }}>{products.filter(p => p.is_available && p.stock > 0).length}</div>
              <div style={{ fontSize: 13, color: '#2d8a55' }}>Active & In-Stock</div>
            </div>

            <div style={{ background: products.filter(p => p.stock === 0).length > 0 ? '#fdeaea' : '#fff', padding: 20, borderRadius: 16, border: products.filter(p => p.stock === 0).length > 0 ? '1px solid #f5c5c5' : '1px solid var(--border)' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: products.filter(p => p.stock === 0).length > 0 ? '#e57373' : 'var(--brown)' }}>{products.filter(p => p.stock === 0).length}</div>
              <div style={{ fontSize: 13, color: products.filter(p => p.stock === 0).length > 0 ? '#e57373' : 'var(--text-muted)' }}>Items Out of Stock</div>
            </div>
          </div>
        </div>

        {/* Search & List */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--brown)' }}>My Products</h2>
          <input type="text" placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...s.input, width: '240px', padding: '10px 16px', fontSize: 14 }} />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🧶</div> Loading your products…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ ...s.card, textAlign: 'center', padding: 56 }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🛍️</div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--brown)', marginBottom: 8 }}>No products yet</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Add your first product above!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map(p => (
              <div key={p.id} style={{ ...s.card, padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', opacity: p.is_available ? 1 : 0.65 }}>

                <div style={{ width: 70, height: 70, borderRadius: 12, overflow: 'hidden', background: 'var(--lavender-light)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 28 }}>🧶</span>}
                </div>

                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--brown)', marginBottom: 3 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                    {p.category} {p.additional_images?.length > 0 && `• ${p.additional_images.length} extra photos`}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 600, color: 'var(--pink-dark)' }}>₹{p.price}</span>
                    <StockPill stock={p.stock} />
                    {!p.is_available && <span style={{ fontSize: 11, background: '#fff4e0', color: '#b07a00', padding: '2px 10px', borderRadius: 20, fontWeight: 500 }}>Hidden</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Stock</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => changeStock(p.id, p.stock - 1)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown)' }}>−</button>
                    <span style={{ minWidth: 36, textAlign: 'center', fontSize: 16, fontWeight: 700, color: p.stock === 0 ? '#e57373' : p.stock <= 3 ? '#f5a623' : '#2d8a55' }}>{p.stock}</span>
                    <button onClick={() => changeStock(p.id, p.stock + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown)' }}>+</button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 110 }}>
                  <button onClick={() => startEdit(p)} style={{ padding: '8px 0', borderRadius: 8, background: 'var(--lavender-light)', color: 'var(--lavender-dark)', border: '1px solid var(--lavender)', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>✏️ Edit</button>
                  <button onClick={() => toggleVisible(p)} style={{ padding: '8px 0', borderRadius: 8, background: p.is_available ? '#fff4e0' : '#e8f5ee', color: p.is_available ? '#b07a00' : '#2d8a55', border: `1px solid ${p.is_available ? '#f5d485' : '#a5d6b5'}`, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>{p.is_available ? '🙈 Hide' : '👁️ Show'}</button>
                  <button onClick={() => setDeleteConfirm(p.id)} style={{ padding: '8px 0', borderRadius: 8, background: '#fdeaea', color: '#e57373', border: '1px solid #f5c5c5', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
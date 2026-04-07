import { useState, useEffect } from 'react'
import { WHATSAPP_NUMBER } from '../lib/supabase'

function StockBadge({ stock }) {
  if (stock === 0) return <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--red-light)', color: 'var(--red)', fontWeight: 500 }}>Out of stock</span>
  if (stock <= 3) return <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--amber-light)', color: '#b07a00', fontWeight: 500 }}>Only {stock} left!</span>
  return <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--green-light)', color: '#2d8a55', fontWeight: 500 }}>In stock</span>
}

const WaIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
)

export default function ProductCard({ product }) {
  const { name, description, price, category, image_url, additional_images, stock } = product
  const outOfStock = stock === 0
  
  const [modalOpen, setModalOpen] = useState(false)
  
  // Combine main image and extra images into one array for the gallery
  const allImages = [image_url, ...(additional_images || [])].filter(Boolean)
  const [activeImg, setActiveImg] = useState(allImages[0])

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (modalOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'auto'
    return () => { document.body.style.overflow = 'auto' }
  }, [modalOpen])

  const waMessage = encodeURIComponent(`Hi! I'd like to order: *${name}* (₹${price})\n\nFrom the Imei Crochet website.`)
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`

  return (
    <>
      {/* ── THE CARD ── */}
      <div 
        onClick={() => setModalOpen(true)}
        style={{
          background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden',
          boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
      >
        <div style={{ width: '100%', aspectRatio: '1', background: 'var(--lavender-light)', overflow: 'hidden', position: 'relative' }}>
          {image_url ? <img src={image_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 48 }}>🧶</div>}
          {outOfStock && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, padding: '6px 14px', borderRadius: 20 }}>Sold out</span></div>}
          <span style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.9)', color: 'var(--lavender-dark)', fontSize: 10, fontWeight: 500, padding: '3px 10px', borderRadius: 20 }}>{category}</span>
          {allImages.length > 1 && <span style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, padding: '4px 8px', borderRadius: 12 }}>+{allImages.length - 1} Photos</span>}
        </div>
        <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--brown)', lineHeight: 1.3 }}>{name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 600, color: 'var(--pink-dark)' }}>₹{price}</span>
            <StockBadge stock={stock} />
          </div>
        </div>
      </div>

      {/* ── THE MODAL ── */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }} onClick={() => setModalOpen(false)}>
          <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 800, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }} onClick={e => e.stopPropagation()}>
            
            <button onClick={() => setModalOpen(false)} style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.1)', border: 'none', fontSize: 18, cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

            <div style={{ display: 'flex', flexWrap: 'wrap', height: '100%', overflowY: 'auto' }}>
              {/* Left: Image Gallery */}
              <div style={{ flex: '1 1 300px', background: '#fdf8f6', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <img src={activeImg} alt={name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 16, border: '1px solid var(--border)' }} />
                {allImages.length > 1 && (
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
                    {allImages.map((img, i) => (
                      <img key={i} src={img} onClick={() => setActiveImg(img)} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: activeImg === img ? '2px solid var(--pink-dark)' : '1px solid var(--border)', opacity: activeImg === img ? 1 : 0.6 }} alt="thumbnail" />
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Details */}
              <div style={{ flex: '1 1 300px', padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{category}</div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--brown)', marginBottom: 16 }}>{name}</h2>
                <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--pink-dark)', marginBottom: 24 }}>₹{price}</div>
                
                <h4 style={{ fontSize: 14, color: 'var(--brown)', marginBottom: 8 }}>Description</h4>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24, whiteSpace: 'pre-wrap' }}>
                  {description || "A beautiful handmade creation."}
                </p>

                <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                  <div style={{ marginBottom: 16 }}><StockBadge stock={stock} /></div>
                  <a href={outOfStock ? undefined : waLink} target="_blank" rel="noopener noreferrer" onClick={outOfStock ? e => e.preventDefault() : undefined}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px', borderRadius: 12, background: outOfStock ? '#ccc' : '#25d366', color: '#fff', fontSize: 15, fontWeight: 500, textDecoration: 'none', cursor: outOfStock ? 'not-allowed' : 'pointer' }}>
                    <WaIcon /> {outOfStock ? 'Currently unavailable' : 'Order on WhatsApp'}
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
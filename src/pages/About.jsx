import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '48px 20px' }}>

      <div style={{ background: 'linear-gradient(135deg, #fce4ec, #f3e5f5)', borderRadius: 24, padding: '40px 32px', textAlign: 'center', marginBottom: 36, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🧶</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, color: 'var(--brown)', marginBottom: 10 }}>
          About <span style={{ color: 'var(--pink-dark)', fontStyle: 'italic' }}>Imei Crochet</span>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8 }}>
          Two hands, one dream — making tiny handmade treasures for people who love things made with care.
        </p>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--brown)', marginBottom: 14 }}>Our Story</h2>
        <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.85, marginBottom: 12 }}>
          Imei Crochet is a small home-based business run by <strong>Me & Mei</strong> — two people who fell in love with the art of crochet and couldn't stop making things. What started as a hobby quickly turned into a passion for creating little handmade wonders.
        </p>
        <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.85 }}>
          Every piece in our shop is crocheted by hand — from tiny keychains and flower bouquets to amigurumi characters and headbands. No two pieces are exactly alike, and that's exactly what makes them special.
        </p>
      </div>

      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--brown)', marginBottom: 18 }}>What we believe in</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: '💖', title: 'Made with love',       desc: 'Every stitch is placed with care. We pour our hearts into each piece we make.' },
            { icon: '🎁', title: 'Perfect for gifting',  desc: 'Looking for a unique gift? Handmade always wins. We can customize for any occasion.' },
            { icon: '🌈', title: 'Customized orders',    desc: 'Want a specific color, character, or size? Just ask! We love making custom pieces.' },
            { icon: '🚚', title: 'Shipping Pan India',   desc: "We deliver across India. Order via WhatsApp and we'll sort out the rest." },
          ].map(item => (
            <div key={item.title} style={{ display: 'flex', gap: 16, padding: '16px 20px', background: '#fff', borderRadius: 14, border: '1px solid var(--border)', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 500, color: 'var(--brown)', marginBottom: 4, fontSize: 15 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--lavender-light)', borderRadius: 20, padding: '28px 24px', marginBottom: 32, border: '1px solid var(--lavender)' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--brown)', marginBottom: 16 }}>How to order</h2>
        {[
          { step: '1', text: 'Browse our shop and find something you love' },
          { step: '2', text: 'Click "Order on WhatsApp" on the product' },
          { step: '3', text: "We'll confirm the order and share payment details (UPI/QR)" },
          { step: '4', text: "Once payment is confirmed, we'll pack and ship your order!" },
        ].map(s => (
          <div key={s.step} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--pink-dark)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{s.step}</div>
            <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, paddingTop: 4 }}>{s.text}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link to="/shop" style={{ display: 'inline-block', background: 'var(--pink-dark)', color: '#fff', padding: '12px 32px', borderRadius: 30, fontSize: 14, fontWeight: 500, marginRight: 12 }}>
          Browse the shop
        </Link>
        <a href="https://www.instagram.com/imei_crochet" target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-block', background: '#fff', color: 'var(--brown)', padding: '12px 32px', borderRadius: 30, fontSize: 14, border: '1px solid var(--border)' }}>
          Follow on Instagram
        </a>
      </div>
    </div>
  )
}
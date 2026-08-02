import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ShoppingBag, Package, Trash2, Plus, X, Lock,
  ChevronLeft, ChevronRight, Send, Tag, Layers,
  Image as ImageIcon, AlertCircle, CheckCircle,
  Store, Shield, ArrowRight, Hash, Clock
} from 'lucide-react'
import Head from 'next/head'

const TELEGRAM = 'princrapli'

function formatRp(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID')
}

// ── Toast ──────────────────────────────────────────────
function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className={`toast ${type}`}>
      {type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  )
}

// ── Product Modal ──────────────────────────────────────
function ProductModal({ product, onClose }) {
  const [variant, setVariant] = useState(product.variants?.[0] || '')
  const [qty, setQty] = useState(1)

  const dec = () => setQty(q => Math.max(1, q - 1))
  const inc = () => setQty(q => q + 1)

  const handleBuy = () => {
    const lines = [
      `Halo kak, saya mau beli:`,
      ``,
      `Produk : ${product.name}`,
      variant ? `Varian  : ${variant}` : null,
      `Jumlah  : ${qty}x`,
      `Total   : ${formatRp(product.price * qty)}`,
    ].filter(l => l !== null).join('\n')

    const url = `https://t.me/${TELEGRAM}?text=${encodeURIComponent(lines)}`
    window.open(url, '_blank', 'noopener')
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <button className="modal-close" onClick={onClose}><X size={16} /></button>

        <div className="pmodal-img">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <div className="pmodal-img-placeholder">
              <Package size={48} style={{ opacity: 0.2 }} />
            </div>
          )}
        </div>

        <div className="pmodal-body">
          <div className="pmodal-name">{product.name}</div>
          <div className="pmodal-price">{formatRp(product.price)}</div>

          {product.description && (
            <div className="pmodal-desc">{product.description}</div>
          )}

          {product.variants && product.variants.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div className="pmodal-label">
                <Layers size={12} style={{ display: 'inline', marginRight: 4 }} />
                Pilih Varian
              </div>
              <div className="variant-grid">
                {product.variants.map(v => (
                  <button
                    key={v}
                    className={`variant-btn${variant === v ? ' active' : ''}`}
                    onClick={() => setVariant(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pmodal-label" style={{ marginBottom: 10 }}>
            <Hash size={12} style={{ display: 'inline', marginRight: 4 }} />
            Jumlah
          </div>
          <div className="qty-row">
            <div className="qty-control">
              <button className="qty-btn" onClick={dec}>−</button>
              <div className="qty-val">{qty}</div>
              <button className="qty-btn" onClick={inc}>+</button>
            </div>
            <div className="pmodal-total">
              Total&nbsp;<span>{formatRp(product.price * qty)}</span>
            </div>
          </div>

          <div className="buy-btn-wrap">
            <button className="btn btn-primary btn-primary-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={handleBuy}>
              <Send size={16} />
              Beli via Telegram
              <ArrowRight size={15} />
            </button>
            <div className="tg-info">
              <Send size={11} />
              Kamu akan diarahkan ke @{TELEGRAM}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Auth Modal ──────────────────────────────────────────
function AuthModal({ onAuth, onClose }) {
  const [key, setKey] = useState('')
  const [err, setErr] = useState('')

  const submit = () => {
    if (key === '220789') { onAuth(); setErr('') }
    else { setErr('Kunci salah. Coba lagi.'); setKey('') }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 380 }}>
        <button className="modal-close" onClick={onClose}><X size={16} /></button>
        <div className="auth-body">
          <div className="auth-icon"><Lock size={24} /></div>
          <h2>Admin Access</h2>
          <p>Masukkan kunci admin untuk melanjutkan</p>
          <div className="auth-input-row">
            <input
              type="password"
              placeholder="••••••"
              maxLength={10}
              value={key}
              onChange={e => setKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              autoFocus
            />
            <button className="btn btn-primary" onClick={submit}>
              <ArrowRight size={16} />
            </button>
          </div>
          {err && <div className="auth-error"><AlertCircle size={13} style={{ display: 'inline', marginRight: 4 }} />{err}</div>}
        </div>
      </div>
    </div>
  )
}

// ── Admin Modal ─────────────────────────────────────────
function AdminModal({ products, onClose, onAdd, onDelete }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState('')
  const [desc, setDesc] = useState('')
  const [variants, setVariants] = useState('')
  const [stock, setStock] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const handleAdd = async () => {
    if (!name.trim() || !price) { setErr('Nama dan harga wajib diisi.'); return }
    setLoading(true); setErr('')
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminKey: '220789',
        name, price: Number(price),
        image, description: desc,
        variants: variants ? variants.split(',').map(v => v.trim()).filter(Boolean) : [],
        stock: stock ? Number(stock) : null,
      })
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      onAdd(data.product)
      setName(''); setPrice(''); setImage(''); setDesc(''); setVariants(''); setStock('')
    } else {
      setErr(data.error || 'Gagal menambahkan produk.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus produk ini?')) return
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminKey: '220789' })
    })
    if (res.ok) onDelete(id)
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal admin-modal">
        <button className="modal-close" onClick={onClose}><X size={16} /></button>

        <div className="modal-header">
          <div className="modal-title">
            <Shield size={16} style={{ display: 'inline', marginRight: 6, color: 'var(--accent)' }} />
            Admin Panel
            <span>RAPWY</span>
          </div>
        </div>

        <div className="form-wrap">
          <div className="form-grid">
            <div className="field form-full">
              <label>Nama Produk</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Hoodie RAPWY Classic" />
            </div>
            <div className="field">
              <label>Harga (Rp)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="150000" />
            </div>
            <div className="field">
              <label>Stok <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(opsional)</span></label>
              <input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="50" />
            </div>
            <div className="field form-full">
              <label>URL Gambar</label>
              <input value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." />
            </div>
            <div className="field form-full">
              <label>Varian <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(pisah koma)</span></label>
              <input value={variants} onChange={e => setVariants(e.target.value)} placeholder="S, M, L, XL" />
              <span className="field-hint">Kosongkan jika tidak ada varian</span>
            </div>
            <div className="field form-full">
              <label>Deskripsi</label>
              <textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Deskripsi singkat produk..." />
            </div>
          </div>

          {err && <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}><AlertCircle size={13} />{err}</div>}

          <div className="form-actions">
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleAdd} disabled={loading}>
              {loading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <Plus size={16} />}
              {loading ? 'Menyimpan...' : 'Tambah Produk'}
            </button>
          </div>
        </div>

        {products.length > 0 && (
          <div className="admin-products">
            <hr className="admin-divider" />
            <div className="pmodal-label" style={{ marginBottom: 12 }}>
              <Package size={12} style={{ display: 'inline', marginRight: 4 }} />
              Produk ({products.length})
            </div>
            <div className="admin-prod-list">
              {products.map(p => (
                <div className="admin-prod-item" key={p.id}>
                  {p.image
                    ? <img className="admin-prod-thumb" src={p.image} alt={p.name} />
                    : <div className="admin-prod-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={16} style={{ color: 'var(--text-dim)' }} /></div>
                  }
                  <div className="admin-prod-info">
                    <div className="admin-prod-name">{p.name}</div>
                    <div className="admin-prod-price">{formatRp(p.price)}</div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Product Card ────────────────────────────────────────
function ProductCard({ product, onClick }) {
  return (
    <div className="product-card" onClick={onClick}>
      <div className="card-img-wrap">
        {product.image
          ? <img src={product.image} alt={product.name} loading="lazy" />
          : (
            <div className="card-img-placeholder">
              <Package size={36} />
              <span>No image</span>
            </div>
          )
        }
        {product.stock !== null && product.stock <= 5 && product.stock > 0 && (
          <div className="card-badge">Sisa {product.stock}</div>
        )}
        <div className="card-overlay">
          <button className="btn btn-primary" style={{ pointerEvents: 'none' }}>
            <ShoppingBag size={15} /> Lihat Produk
          </button>
        </div>
      </div>
      <div className="card-body">
        <div className="card-name">{product.name}</div>
        {product.description && (
          <div className="card-desc">{product.description}</div>
        )}
        <div className="card-footer">
          <div className="card-price">{formatRp(product.price)}</div>
          {product.variants && product.variants.length > 0 && (
            <div className="card-variants">
              <Tag size={11} />
              {product.variants.length} varian
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────
export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [toast, setToast] = useState(null)
  const logoClickRef = useRef(0)
  const logoTimerRef = useRef(null)

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Logo click: 5 rapid clicks → admin
  const handleLogoClick = () => {
    logoClickRef.current += 1
    clearTimeout(logoTimerRef.current)
    logoTimerRef.current = setTimeout(() => { logoClickRef.current = 0 }, 1800)
    if (logoClickRef.current >= 5) {
      logoClickRef.current = 0
      setShowAuth(true)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuth(false)
    setShowAdmin(true)
  }

  const handleAdd = (product) => {
    setProducts(prev => [product, ...prev])
    showToast(`"${product.name}" berhasil ditambahkan.`)
  }

  const handleDelete = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id))
    showToast('Produk dihapus.', 'error')
  }

  return (
    <>
      <Head>
        <title>RAPWY SHOP</title>
        <meta name="description" content="Belanja produk pilihan di RAPWY SHOP. Order via Telegram." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%237C5CFC'/></svg>" />
      </Head>

      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <div className="logo" onClick={handleLogoClick}>
              <div className="logo-dot" />
              RAPWY SHOP
            </div>
            <div className="header-actions">
              <a
                href={`https://t.me/${TELEGRAM}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                <Send size={13} />
                Hubungi Kami
              </a>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="hero">
          <div className="container">
            <div className="hero-eyebrow">
              <Store size={12} />
              Official Store
            </div>
            <h1 className="hero-title">
              Temukan<br />
              Produk <span>Terbaik</span><br />
              Kami
            </h1>
            <p className="hero-sub">
              Klik produk yang kamu mau, pilih varian dan jumlah, lalu order langsung via Telegram — cepat, mudah, terpercaya.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="#products" className="btn btn-primary">
                <ShoppingBag size={15} />
                Lihat Produk
              </a>
              <a href={`https://t.me/${TELEGRAM}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                <Send size={15} />
                @{TELEGRAM}
              </a>
            </div>

            {!loading && (
              <div className="hero-stats">
                <div>
                  <div className="stat-num">{products.length}</div>
                  <div className="stat-label">Produk</div>
                </div>
                <div>
                  <div className="stat-num">100%</div>
                  <div className="stat-label">Terpercaya</div>
                </div>
                <div>
                  <div className="stat-num">Fast</div>
                  <div className="stat-label">Response</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Product Section */}
        <section id="products">
          <div className="container">
            <div className="section-label">
              <h2>Semua Produk</h2>
              <div className="section-divider" />
              {!loading && (
                <span style={{ fontSize: 13, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                  {products.length} item
                </span>
              )}
            </div>

            {loading ? (
              <div className="page-loading">
                <div className="spinner" />
                <span>Memuat produk...</span>
              </div>
            ) : (
              <div className="product-grid">
                {products.length === 0 ? (
                  <div className="empty-state">
                    <Package size={64} />
                    <h3>Belum ada produk</h3>
                    <p>Produk akan segera hadir. Pantau terus!</p>
                  </div>
                ) : (
                  products.map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onClick={() => setSelected(p)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-copy">© {new Date().getFullYear()} RAPWY SHOP. All rights reserved.</div>
            <a href={`https://t.me/${TELEGRAM}`} target="_blank" rel="noopener noreferrer" className="footer-tg">
              <Send size={14} />
              @{TELEGRAM}
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
      {showAuth && <AuthModal onAuth={handleAuthSuccess} onClose={() => setShowAuth(false)} />}
      {showAdmin && (
        <AdminModal
          products={products}
          onClose={() => setShowAdmin(false)}
          onAdd={handleAdd}
          onDelete={handleDelete}
        />
      )}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}
    </>
  )
        }

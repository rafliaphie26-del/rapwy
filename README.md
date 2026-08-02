# RAPWY SHOP

Next.js e-commerce shop dengan panel admin, order via Telegram.

---

## Deploy ke Vercel

### 1. Install dependencies lokal (optional, untuk test)
```bash
npm install
npm run dev
```

### 2. Push ke GitHub
```bash
git init
git add .
git commit -m "init rapwy-shop"
git remote add origin https://github.com/KAMU/rapwy-shop.git
git push -u origin main
```

### 3. Import di Vercel
- Buka https://vercel.com/new
- Import repo GitHub kamu
- Klik **Deploy** — selesai!

---

## Setup Vercel KV (untuk produk persisten)

Tanpa ini, produk yang ditambah akan hilang setelah server restart.

1. Buka dashboard Vercel → project kamu
2. Tab **Storage** → **Create Database** → pilih **KV (Redis)**
3. Nama bebas, klik **Create**
4. Klik **Connect to Project** → pilih project → **Connect**
5. Vercel otomatis inject env variables `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`
6. Redeploy project kamu

---

## Fitur

| Fitur | Keterangan |
|---|---|
| Tampilan produk | Grid responsif, hover effect |
| Klik produk | Modal pilih varian + jumlah |
| Beli | Auto redirect ke Telegram @princrapli dengan pesan order |
| Admin | Klik logo **5x cepat** → masukkan key `220789` |
| Tambah produk | Nama, harga, gambar, varian, stok |
| Hapus produk | Dari panel admin |
| Storage | Vercel KV (Redis) — fallback in-memory |

---

## Admin Key
```
220789
```

---

## Telegram Order
Semua order diarahkan ke: **@princrapli**

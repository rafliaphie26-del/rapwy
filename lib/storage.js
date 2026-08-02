// Storage layer: uses Vercel KV in production, in-memory fallback for local dev
// In-memory fallback (resets on server restart - set up Vercel KV for persistence)
let memStore = [];

async function getKV() {
  try {
    const { kv } = await import('@vercel/kv');
    return kv;
  } catch {
    return null;
  }
}

export async function getProducts() {
  const kv = await getKV();
  if (kv) {
    try {
      const raw = await kv.lrange('rapwy:products', 0, -1);
      return raw.map(item => (typeof item === 'string' ? JSON.parse(item) : item));
    } catch (e) {
      console.error('KV read error:', e);
    }
  }
  return [...memStore];
}

export async function addProduct(product) {
  const kv = await getKV();
  if (kv) {
    try {
      await kv.lpush('rapwy:products', JSON.stringify(product));
      return true;
    } catch (e) {
      console.error('KV write error:', e);
    }
  }
  memStore.unshift(product);
  return true;
}

export async function deleteProduct(id) {
  const kv = await getKV();
  if (kv) {
    try {
      const products = await getProducts();
      const updated = products.filter(p => p.id !== id);
      await kv.del('rapwy:products');
      for (const p of [...updated].reverse()) {
        await kv.lpush('rapwy:products', JSON.stringify(p));
      }
      return true;
    } catch (e) {
      console.error('KV delete error:', e);
    }
  }
  memStore = memStore.filter(p => p.id !== id);
  return true;
}

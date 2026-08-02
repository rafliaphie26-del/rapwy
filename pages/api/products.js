import { getProducts, addProduct } from '../../lib/storage';
import { v4 as uuidv4 } from 'uuid';

const ADMIN_KEY = '220789';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const products = await getProducts();
    return res.status(200).json({ products });
  }

  if (req.method === 'POST') {
    const { adminKey, name, price, image, description, variants, stock } = req.body;

    if (adminKey !== ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const product = {
      id: uuidv4(),
      name: String(name).trim(),
      price: Number(price),
      image: String(image || '').trim(),
      description: String(description || '').trim(),
      variants: Array.isArray(variants) ? variants.filter(Boolean) : [],
      stock: stock ? Number(stock) : null,
      createdAt: Date.now(),
    };

    await addProduct(product);
    return res.status(201).json({ product });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}

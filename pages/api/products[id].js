import { deleteProduct } from '../../../lib/storage';

const ADMIN_KEY = '220789';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { adminKey } = req.body;
  const { id } = req.query;

  if (adminKey !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Product ID required' });
  }

  await deleteProduct(id);
  return res.status(200).json({ success: true });
}

import { Router } from 'express';
import { fraudCheck, generateNotification, getAdminDashboard } from '../controllers/admin.controller.js';
import { createAdminProduct, deleteAdminProduct, listAdminProducts } from '../controllers/admin-product.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import multer from 'multer';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => callback(null, file.mimetype.startsWith('image/')),
});

router.use(requireAuth, requireRole('admin'));
router.get('/dashboard', getAdminDashboard);
router.get('/products', listAdminProducts);
router.post('/products', upload.single('image'), createAdminProduct);
router.delete('/products/:id', deleteAdminProduct);
router.post('/fraud-check', fraudCheck);
router.post('/notifications', generateNotification);

export default router;

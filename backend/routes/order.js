import express from 'express';
import { getShopOrders, updateOrderStatus, getOrderStats } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getShopOrders);
router.put('/:id/status', updateOrderStatus);
router.get('/stats', getOrderStats);

export default router;
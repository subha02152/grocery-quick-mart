import express from 'express';
import { getShopByOwner, createOrUpdateShop, getShopStats } from '../controllers/shopController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getShopByOwner);
router.post('/', createOrUpdateShop);
router.put('/', createOrUpdateShop);
router.get('/stats', getShopStats);

export default router;
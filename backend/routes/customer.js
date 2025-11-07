import express from 'express';
import { getShops, getShopProducts } from '../controllers/customerController.js';

const router = express.Router();

// Customer routes
router.get('/shops', getShops);
router.get('/shops/:shopId/products', getShopProducts);

export default router;
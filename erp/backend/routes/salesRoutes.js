import express from 'express';
import * as salesController from '../controllers/salesController.js';

const router = express.Router();

router.get('/orders', salesController.getOrders);
router.post('/orders', salesController.createOrder);

export default router;

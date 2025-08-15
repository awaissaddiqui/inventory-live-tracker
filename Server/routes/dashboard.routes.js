import express from 'express';
import DashboardController from '../controllers/DashboardController.js';

const router = express.Router();

// Basic dashboard routes
router.get('/stats', DashboardController.getDashboardStats);
router.get('/activity', DashboardController.getRecentActivity);

export default router;

import { Router } from 'express';
import poolRoutes from '@/routes/poolRoutes';
import metricRoutes from '@/routes/metricRoutes';

const router = Router();

router.use('/pools', poolRoutes);
router.use('/metrics', metricRoutes);

export default router;

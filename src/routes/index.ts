import { Router } from 'express';
import poolRoutes from '@/routes/poolRoutes';
import metricRoutes from '@/routes/metricRoutes';
import voteRoutes from '@/routes/voteRoutes';

const router = Router();

router.use('/pools', poolRoutes);
router.use('/metrics', metricRoutes);
router.use('/vote', voteRoutes);

export default router;

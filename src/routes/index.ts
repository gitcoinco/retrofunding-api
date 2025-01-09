import { Router } from 'express';
import applicationRoutes from '@/routes/applicationRoutes';
import poolRoutes from '@/routes/poolRoutes';
import metricRoutes from '@/routes/metricRoutes';
import voteRoutes from '@/routes/voteRoutes';

const router = Router();

router.use('/application', applicationRoutes);
router.use('/pools', poolRoutes);
router.use('/metrics', metricRoutes);
router.use('/vote', voteRoutes);

export default router;

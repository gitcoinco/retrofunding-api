import { AppDataSource } from '@/data-source';
import { Vote } from '@/entity/Vote';
import { Application } from '@/entity/Application';
import { Metric } from '@/entity/Metric';
import { Pool } from '@/entity/Pool';

// Export repositories for each entity
export const poolRepository = AppDataSource.getRepository(Pool);
export const voteRepository = AppDataSource.getRepository(Vote);
export const applicationRepository = AppDataSource.getRepository(Application);
export const metricRepository = AppDataSource.getRepository(Metric);

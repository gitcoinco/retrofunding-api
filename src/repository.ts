import { AppDataSource } from '@/data-source';
import { Application } from '@/entity/Application';
import { EligibilityCriteria } from '@/entity/EligibilityCriteria';
import { Metric } from '@/entity/Metric';
import { Pool } from '@/entity/Pool';
import { Vote } from '@/entity/Vote';

// Export repositories for each entity
export const applicationRepository = AppDataSource.getRepository(Application);
export const eligibilityCriteriaRepository = AppDataSource.getRepository(EligibilityCriteria);
export const metricRepository = AppDataSource.getRepository(Metric);
export const poolRepository = AppDataSource.getRepository(Pool);
export const voteRepository = AppDataSource.getRepository(Vote);
import { type Seeder } from '@jorgebodega/typeorm-seeding';
import { type DataSource } from 'typeorm';
import { Metric, MetricOrientation } from '../entity/Metric';

export default class CreateMetricsSeed implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const metricsData = [
      {
        name: 'Txn Number',
        description: 'Number of transactions made for project',
        priority: MetricOrientation.Increase,
        active: true,
      },
      {
        name: 'Age',
        description: 'Age of the project',
        priority: MetricOrientation.Increase,
        active: true,
      },
      {
        name: 'Twitter Followers',
        description: 'Number of Twitter followers',
        orientation: MetricOrientation.Increase,
        active: false,
      },
    ];

    for (const metric of metricsData) {
      await dataSource
        .createQueryBuilder()
        .insert()
        .into(Metric)
        .values(metric)
        .execute();
    }
  }
}

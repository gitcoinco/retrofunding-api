import { type Seeder } from '@jorgebodega/typeorm-seeding';
import { type DataSource } from 'typeorm';
import { Metric, MetricOrientation } from '../entity/Metric';

export default class CreateMetricsSeed implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const metricsData = [
      {
        name: 'Impact',
        description:
          'The potential effect of the project on the community or industry.',
        priority: MetricOrientation.Increase,
        active: true,
      },
      {
        name: 'Innovation',
        description:
          'The level of originality and creativity in the project approach.',
        priority: MetricOrientation.Decrease,
        active: true,
      },
      {
        name: 'Feasibility',
        description: 'The practicality and achievability of the project goals.',
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

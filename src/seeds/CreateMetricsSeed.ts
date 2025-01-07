import { type Seeder } from '@jorgebodega/typeorm-seeding';
import { type DataSource } from 'typeorm';
import { Metric, Priority } from '../entity/Metric';

export default class CreateMetricsSeed implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const metricsData = [
      {
        name: 'Impact',
        description:
          'The potential effect of the project on the community or industry.',
        priority: Priority.Ascending,
        active: true,
      },
      {
        name: 'Innovation',
        description:
          'The level of originality and creativity in the project approach.',
        priority: Priority.Descending,
        active: true,
      },
      {
        name: 'Feasibility',
        description: 'The practicality and achievability of the project goals.',
        priority: Priority.Ascending,
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

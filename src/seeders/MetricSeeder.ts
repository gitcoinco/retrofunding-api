import { Seeder } from '@jorgebodega/typeorm-seeding';
import { type DataSource } from 'typeorm';
import { type Metric, MetricOrientation } from '../entity/Metric';
import { AppDataSource } from '../data-source';

export default class MetricSeeder extends Seeder {
  async run(dataSource: DataSource): Promise<void> {
    console.log('Initializing the database connection...');
    await AppDataSource.initialize();
    console.log('Database connection established.');
    const data: Array<Partial<Metric>> = [
      {
        title: 'Txn Number',
        description: 'Number of transactions made for project',
        orientation: MetricOrientation.Increase,
        enabled: true,
      },
      {
        title: 'Age',
        description: 'Age of the project',
        orientation: MetricOrientation.Increase,
        enabled: true,
      },
      {
        title: 'Twitter Followers',
        description: 'Number of Twitter followers',
        orientation: MetricOrientation.Increase,
        enabled: false,
      },
    ];
    await dataSource.createEntityManager().save<Partial<Metric>>(data);
  }
}

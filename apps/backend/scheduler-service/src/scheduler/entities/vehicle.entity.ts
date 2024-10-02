import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TestDrive } from './test-drive.entity';

@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column()
  location: string;

  @OneToMany(() => TestDrive, (testDrive) => testDrive.vehicle)
  testDrives: TestDrive[];
}

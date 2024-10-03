import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TestDrive } from '../../scheduler/entities/test-drive.entity';

@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column()
  location: string;

  @OneToMany(() => TestDrive, (testDrive) => testDrive.vehicle, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  testDrives: TestDrive[];
}

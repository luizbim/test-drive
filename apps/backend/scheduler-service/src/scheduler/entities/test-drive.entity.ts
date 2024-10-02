import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Vehicle } from './vehicle.entity';

@Entity()
export class TestDrive {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  startDateTime: Date;

  @Column()
  durationMins: number;

  @Column()
  customerName: string;

  @Column()
  customerPhone: string;

  @Column()
  customerEmail: string;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.testDrives)
  vehicle: Vehicle;
}

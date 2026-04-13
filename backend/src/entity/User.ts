import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 100, unique: true, nullable: true })
  citizenshipNumber!: string | null;

  @Column({ type: "varchar", length: 24, unique: true, nullable: true })
  voterId!: string | null;

  @Column({ length: 180, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  phoneNumber!: string | null;

  @Column({ type: "varchar", length: 12, unique: true, nullable: true })
  aadhaarNumber!: string | null;

  @Column({ type: "varchar", length: 250, nullable: true })
  address!: string | null;

  @Column({ type: "varchar", length: 30, nullable: true })
  govtIdType!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  govtIdPath!: string | null;

  @Column()
  password!: string;

  @Column()
  admin!: boolean;

  @Column({ default: false })
  verified!: boolean;
}

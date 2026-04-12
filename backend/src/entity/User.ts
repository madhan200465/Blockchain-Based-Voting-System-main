import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ unique: true })
  citizenshipNumber!: string;

  @Column({ type: "varchar", length: 24, unique: true, nullable: true })
  voterId!: string | null;

  @Column({ length: 180, unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  admin!: boolean;

  @Column({ default: false })
  verified!: boolean;
}

import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Candidate } from "./Candidate";

@Entity()
export class Poll extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ default: false })
  isPublished!: boolean;

  @Column({ type: "datetime", nullable: true })
  reviewedAt!: Date | null;

  @Column({ type: "datetime", nullable: true })
  publishedAt!: Date | null;

  @OneToMany(() => Candidate, (candidate) => candidate.poll)
  candidates!: Candidate[];
}

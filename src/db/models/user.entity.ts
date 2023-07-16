import { Field, ObjectType } from "@nestjs/graphql";
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { UserVote } from "./votes.entity";

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field()
  id: number;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column()
  @Field()
  username: string;

  @Column()
  password: string;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  @Field()
  created: Date;

  @Column({ nullable: true, name: "profile_pic" })
  profilePic: string;

  @Column({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  @Field()
  lastUpdate: Date;

  @OneToMany(() => UserVote, uv => uv.board, { onDelete: "CASCADE" })
  userVotes: UserVote[];
}

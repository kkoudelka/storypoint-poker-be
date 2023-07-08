import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { UserVote } from "./votes.entity";

export enum BoardStatus {
  VOTING = "voting",
  RESULTS = "results",
}

registerEnumType(BoardStatus, {
  name: "BoardStatus",
});

@Entity()
@ObjectType()
export class Board {
  @PrimaryGeneratedColumn()
  @Field()
  id: number;

  @Column({ default: "" })
  @Field()
  title: string;

  @Column({ unique: true })
  @Field()
  code: string;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  @Field()
  created: Date;

  @Column({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  @Field()
  lastUpdate: Date;

  @OneToMany(() => UserVote, uv => uv.board, { onDelete: "CASCADE" })
  userVotes: UserVote[];

  @Column({ type: "enum", enum: BoardStatus, default: BoardStatus.VOTING })
  @Field(() => BoardStatus)
  status: BoardStatus;

  @Column({ nullable: true })
  @Field({ nullable: true })
  ticket: string | null;

  @Column({ nullable: true, type: "timestamptz" })
  @Field({ nullable: true })
  ticketTimer: Date | null;
}

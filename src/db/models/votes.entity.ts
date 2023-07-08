import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
} from "typeorm";
import { User } from "./user.entity";
import { Board } from "./board.entity";

export enum UserBoardStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  IDLE = "idle",
}

registerEnumType(UserBoardStatus, {
  name: "UserBoardStatus",
});

@Entity()
@ObjectType()
@Unique(["boardId", "userId"])
export class UserVote {
  @PrimaryGeneratedColumn()
  @Field()
  id: number;

  @ManyToOne(() => User, user => user.userVotes, { onDelete: "CASCADE" })
  @Field(() => User)
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Board, board => board.userVotes, { onDelete: "CASCADE" })
  @Field(() => Board)
  board: Board;

  @Column()
  boardId: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  vote?: string;

  @Column({ default: true })
  @Field()
  online: boolean;

  @Column({
    type: "enum",
    enum: UserBoardStatus,
    default: UserBoardStatus.OFFLINE,
  })
  @Field(() => UserBoardStatus)
  status: UserBoardStatus;

  @Column({ default: false })
  @Field()
  admin: boolean;

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
}

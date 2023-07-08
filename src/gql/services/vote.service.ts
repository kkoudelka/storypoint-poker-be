import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Board } from "src/db/models/board.entity";
import { User } from "src/db/models/user.entity";
import { UserVote } from "src/db/models/votes.entity";
import { Repository } from "typeorm";

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(Board)
    private usersRepository: Repository<Board>,
    @InjectRepository(UserVote)
    private voteRepository: Repository<UserVote>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findUser(userId: number) {
    return this.userRepository.findOne({ where: { id: userId } });
  }
}

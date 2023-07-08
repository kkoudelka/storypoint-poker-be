import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { PubSub } from "graphql-subscriptions";
import { Board, BoardStatus } from "src/db/models/board.entity";
import { UserBoardStatus, UserVote } from "src/db/models/votes.entity";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);

  constructor(
    @InjectRepository(Board)
    private boardsRepository: Repository<Board>,
    @InjectRepository(UserVote)
    private voteRepository: Repository<UserVote>,
    @Inject("PUB_SUB") private readonly pubSub: PubSub,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<Board[]> {
    return await this.boardsRepository.find({
      take: 50,
      order: { lastUpdate: "DESC" },
    });
  }

  async findOne(code: string): Promise<Board> {
    return await this.boardsRepository.findOne({ where: { code } });
  }

  async findUserVotes(boardId: number) {
    return (
      (await this.voteRepository.find({
        where: { boardId },
        order: {
          admin: "DESC",
          user: { username: "ASC" },
        },
      })) ?? []
    );
  }

  async createBoard(title: string) {
    const board = new Board();

    board.title = title;

    board.code = await this.generateCode();

    this.logger.debug(`Created board with code ${board.code}`);

    return await this.boardsRepository.save(board);
  }

  async joinBoard(code: string, userId: number) {
    const board = await this.boardsRepository.findOne({ where: { code } });

    if (board === undefined) {
      return false;
    }

    const uc = await this.voteRepository.findOne({
      where: { boardId: board.id, userId },
    });

    if (uc) {
      uc.online = true;
      await this.voteRepository.save(uc);
      this.pubSub.publish("boardUpdate", { boardUpdate: board });

      return true;
    }

    const userVote = new UserVote();
    userVote.boardId = board.id;
    userVote.userId = userId;
    userVote.online = true;
    userVote.admin = false;

    try {
      await this.voteRepository.save(userVote);
      this.pubSub.publish("boardUpdate", { boardUpdate: board });
      return true;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }

  async changeStatus(code: string, userId: number, status: UserBoardStatus) {
    const board = await this.getBoard(code);

    const userVote = await this.getUserVoteOrCreate(board.id, userId);

    userVote.status = status;
    userVote.lastUpdate = new Date();
    await this.voteRepository.save(userVote);

    await this.updateBoard(board);

    return true;
  }

  async changeVote(code: string, id: number, vote: string | null) {
    const board = await this.getBoard(code);
    const userVote = await this.getUserVoteOrCreate(board.id, id);

    userVote.vote = vote ? vote.trim() : null;
    userVote.lastUpdate = new Date();
    userVote.status = UserBoardStatus.ONLINE;

    await this.voteRepository.save(userVote);
    await this.updateBoard(board);
    return true;
  }

  async updateBoardTicket(code: string, ticket: string | null) {
    const board = await this.getBoard(code);
    board.ticket = ticket ? ticket.trim() : null;
    board.ticketTimer = ticket ? new Date() : null;
    await this.updateBoard(board);
    return true;
  }

  async changeBoardStatus(
    code: string,
    status: BoardStatus,
    userId: number,
  ): Promise<boolean> {
    const board = await this.getBoard(code);
    const userVote = await this.getUserVoteOrCreate(board.id, userId);

    if (!userVote.admin) {
      throw new UnauthorizedException("You are not an admin");
    }

    board.status = status;
    await this.updateBoard(board);

    return true;
  }

  async removeUserFromBoard(code: string, moderatorId: number, userId: number) {
    const board = await this.getBoard(code);
    const moderatorVote = await this.getUserVoteOrCreate(board.id, moderatorId);

    if (!moderatorVote.admin) {
      throw new UnauthorizedException("You are not an admin");
    }

    const userVote = await this.getUserVoteOrCreate(board.id, userId);

    await this.voteRepository.remove(userVote);

    await this.updateBoard(board);

    return true;
  }

  async changeAdminStatus(
    code: string,
    selfUserId: number,
    admin: boolean,
    userIdToChange: number | null = null,
  ) {
    const board = await this.getBoard(code);
    const userVote = await this.getUserVoteOrCreate(board.id, selfUserId);

    if (userIdToChange) {
      if (!userVote.admin) {
        throw new UnauthorizedException("You are not an admin");
      }

      const changeUid = await this.getUserVoteOrCreate(
        board.id,
        userIdToChange,
      );
      changeUid.admin = admin;
      await this.voteRepository.save(changeUid);

      await this.updateBoard(board);
      return true;
    }

    userVote.admin = admin;
    userVote.lastUpdate = new Date();
    await this.voteRepository.save(userVote);

    await this.updateBoard(board);
    return true;
  }

  async resetVotes(
    code: string,
    reseterId: number,
    userToClearId: number | null = null,
  ) {
    const board = await this.getBoard(code);
    const uv = await this.getUserVoteOrCreate(board.id, reseterId);

    if (!uv.admin) {
      throw new UnauthorizedException("You are not an admin");
    }

    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .update(UserVote)
      .set({ vote: null });

    board.status = BoardStatus.VOTING;
    board.lastUpdate = new Date();
    await this.boardsRepository.save(board);

    // update vote to null where boardId = board.id and userId = userToClearId
    if (!userToClearId) {
      await queryBuilder
        .where("boardId = :boardId", { boardId: board.id })
        .execute();
      await this.updateBoard(board);
      return true;
    }

    await queryBuilder
      .where("boardId = :boardId and userId = :userId", {
        boardId: board.id,
        userId: userToClearId,
      })
      .execute();

    await this.updateBoard(board);
    return true;
  }

  private async updateBoard(board: Board) {
    await this.boardsRepository.save(board);
    this.pubSub.publish("boardUpdate", { boardUpdate: board });
  }

  private async getUserVoteOrCreate(boardId: number, userId: number) {
    const uv = await this.voteRepository.findOne({
      where: { boardId, userId },
    });

    if (uv) {
      return uv;
    }
    const userVote = new UserVote();
    userVote.boardId = boardId;
    userVote.userId = userId;

    try {
      await this.voteRepository.save(userVote);

      return userVote;
    } catch (e) {
      this.logger.error(e);
      return null;
    }
  }

  private async getBoard(code: string) {
    const board = await this.boardsRepository.findOne({ where: { code } });
    if (!board) {
      throw new NotFoundException("Board with this code was not found");
    }
    return board;
  }

  private async generateCode(length = 8) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const match = await this.boardsRepository.findOne({
      where: { code: result },
    });

    if (match !== null) {
      return this.generateCode(length);
    }

    return result;
  }
}

import { Module } from "@nestjs/common";
import { GQLModule } from "./gql/GQL.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Board } from "./db/models/board.entity";
import { ConfigModule } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { User } from "./db/models/user.entity";
import { UserVote } from "./db/models/votes.entity";
import { AuthModule } from "./auth/auth.module";
import { JwtModule } from "@nestjs/jwt";
import { SchedulerModule } from "./scheduler/scheduler.module";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "192.168.1.10",
      port: 9001,
      username: "cljit52h10001ago91218ag9h",
      password: "KcN3tbhgk576Kk2Hs3pWtYdv",
      database: "cljit52h40003ago91fo63f7b",
      entities: [Board, User, UserVote],
      synchronize: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      subscriptions: {
        "graphql-ws": true,
      },
      autoSchemaFile: join(process.cwd(), "src/gql/schema.gql"),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
      },
    }),
    GQLModule,
    AuthModule,
    ScheduleModule.forRoot(),
    SchedulerModule,
  ],
})
export class AppModule {}

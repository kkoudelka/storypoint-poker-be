import { Body, Controller, HttpCode, Logger, Post, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, SignUpDto } from "./controller.types";
import { User } from "src/db/models/user.entity";
import { ApiCreatedResponse } from "@nestjs/swagger";
import * as Sentry from "@sentry/node";

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    const transaction = Sentry.startTransaction({
      op: "login",
      name: "Login transaction",
    });

    try {
      return await this.authService.login(loginDto.email, loginDto.password);
    } catch (error) {
      Sentry.captureException(error);
      this.logger.error(error);
    } finally {
      transaction.finish();
    }
  }

  @Post("register")
  @ApiCreatedResponse({
    description: "The record has been successfully created.",
    type: User,
  })
  async register(@Body() registerDto: SignUpDto) {
    const transaction = Sentry.startTransaction({
      op: "register",
      name: "Register transaction",
    });

    try {
      return await this.authService.registerUser(
        registerDto.email,
        registerDto.password,
        registerDto.name,
      );
    } catch (error) {
      Sentry.captureException(error);
      this.logger.error(error);
    } finally {
      transaction.finish();
    }
  }
}

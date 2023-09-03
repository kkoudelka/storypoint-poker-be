import { Body, Controller, HttpCode, Logger, Post, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, SignUpDto } from "./controller.types";
import { User } from "src/db/models/user.entity";
import { ApiCreatedResponse } from "@nestjs/swagger";

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto.email, loginDto.password);
  }

  @Post("register")
  @ApiCreatedResponse({
    description: "The record has been successfully created.",
    type: User,
  })
  async register(@Body() registerDto: SignUpDto) {
    return await this.authService.registerUser(
      registerDto.email,
      registerDto.password,
      registerDto.name,
    );
  }
}

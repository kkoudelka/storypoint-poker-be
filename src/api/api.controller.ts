import { Controller, Get, HttpCode } from "@nestjs/common";

@Controller("api")
export class ApiController {
  @Get("readiness")
  @HttpCode(200)
  async readiness() {
    return "OK";
  }

  @Get("healthz")
  @HttpCode(200)
  async healthz() {
    return "OK";
  }

  @Get("env")
  @HttpCode(200)
  async env() {
    return process.env;
  }
}

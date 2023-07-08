import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}

export class SignUpDto extends LoginDto {
  @ApiProperty()
  name: string;
}

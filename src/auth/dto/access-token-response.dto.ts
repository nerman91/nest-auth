import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenResponseDto {
  @ApiProperty({
    description:
      'JWT access token. Pass in the Authorization header as Bearer token.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4LTEyMzQtNDU2Ny04OTAxLTEyMzQ1Njc4OTAxMiJ9.signature',
  })
  accessToken: string;
}

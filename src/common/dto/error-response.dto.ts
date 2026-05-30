import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message or list of validation errors',
    oneOf: [
      { type: 'string', example: 'Invalid email or password' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['Email must be a valid email'],
      },
    ],
  })
  message: string | string[];

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request',
  })
  error: string;
}

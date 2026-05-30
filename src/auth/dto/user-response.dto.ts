import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'User UUID',
    example: '12345678-1234-4567-8901-123456789012',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Display name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2025-05-30T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-05-30T12:00:00.000Z',
  })
  updatedAt: Date;
}

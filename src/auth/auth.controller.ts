import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterRequestDto } from './dto/register.dto';
import { LoginRequestDto } from './dto/login.dto';
import { AccessTokenResponseDto } from './dto/access-token-response.dto';
import { UserResponseDto } from './dto/user-response.dto';
import type { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import type { User } from '@prisma/client';
import { Authorized } from './decorators/autorized.decorator';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

type SafeUser = Omit<User, 'password'>;

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new account and returns an access token. Sets an httpOnly `refreshToken` cookie.',
  })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    type: AccessTokenResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ErrorResponseDto,
  })
  async register(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RegisterRequestDto,
  ) {
    return this.authService.register(res, dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log in',
    description:
      'Authenticates by email and password. Returns an access token and sets an httpOnly `refreshToken` cookie.',
  })
  @ApiOkResponse({
    description: 'Login successful',
    type: AccessTokenResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Invalid email or password',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ErrorResponseDto,
  })
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginRequestDto,
  ) {
    return this.authService.login(res, dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('refreshToken')
  @ApiOperation({
    summary: 'Refresh tokens',
    description:
      'Issues a new access token using the `refreshToken` httpOnly cookie. Updates the refresh cookie.',
  })
  @ApiOkResponse({
    description: 'Tokens refreshed successfully',
    type: AccessTokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token not found or invalid',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto,
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refresh(req, res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('refreshToken')
  @ApiOperation({
    summary: 'Log out',
    description: 'Clears the `refreshToken` httpOnly cookie.',
  })
  @ApiNoContentResponse({
    description: 'Logged out successfully',
  })
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get current user',
    description: 'Returns the profile of the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Current user profile',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto,
  })
  me(@Authorized() user: SafeUser) {
    return user;
  }
}

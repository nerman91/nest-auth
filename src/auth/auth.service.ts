import { PrismaService } from './../prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterRequestDto } from './dto/register.dto';
import { hash, verify } from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { LoginRequestDto } from './dto/login.dto';
import { Response, Request } from 'express';
import { isDev } from 'src/utils/is-dev.util';

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_TOKEN_TTL: StringValue;
  private readonly JWT_REFRESH_TOKEN_TTL: StringValue;

  private readonly COOKIE_DOMAIN: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_ACCESS_TOKEN_TTL = this.configService.getOrThrow<StringValue>(
      'JWT_ACCESS_TOKEN_TTL',
    );
    this.JWT_REFRESH_TOKEN_TTL = this.configService.getOrThrow<StringValue>(
      'JWT_REFRESH_TOKEN_TTL',
    );

    this.COOKIE_DOMAIN = this.configService.getOrThrow<string>('COOKIE_DOMAIN');
  }

  async login(res: Response, dto: LoginRequestDto) {
    const { email, password } = dto;

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Invalid email or password');
    }

    const isPasswordValid = await verify(user.password, password);

    if (!isPasswordValid) {
      throw new NotFoundException('Invalid email or password');
    }

    return this.auth(res, user.id);
  }

  async register(res: Response, dto: RegisterRequestDto) {
    const { name, email, password } = dto;

    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        password: await hash(password),
      },
    });

    return this.auth(res, user.id);
  }

  private generateTokens(userId: string) {
    const payload = { id: userId };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_ACCESS_TOKEN_TTL,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_REFRESH_TOKEN_TTL,
    });

    return { accessToken, refreshToken };
  }

  logout(res: Response) {
    res.clearCookie('refreshToken', this.getCookieOptions());
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = (req.cookies as { refreshToken?: string })
      .refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const payload = await this.jwtService.verifyAsync<{ id: string }>(
      refreshToken,
    );

    const user = await this.prismaService.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.auth(res, user.id);
  }

  private auth(res: Response, id: string) {
    const { accessToken, refreshToken } = this.generateTokens(id);

    this.setTokenCookie(res, refreshToken);

    return { accessToken };
  }

  private getCookieOptions() {
    const dev = isDev(this.configService);

    return {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      secure: !dev,
      sameSite: dev ? ('lax' as const) : ('strict' as const),
    };
  }

  private setTokenCookie(res: Response, value: string) {
    const expires = this.getRefreshTokenExpiry(value);

    return res.cookie('refreshToken', value, {
      ...this.getCookieOptions(),
      expires,
    });
  }

  private getRefreshTokenExpiry(token: string): Date | undefined {
    const decoded: unknown = this.jwtService.decode(token);

    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      !('exp' in decoded) ||
      typeof decoded.exp !== 'number'
    ) {
      return undefined;
    }

    return new Date(decoded.exp * 1000);
  }

  async validateUser(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}

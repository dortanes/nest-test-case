import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import * as argon2 from '@node-rs/argon2';
import { SignInDto, SignUpDto } from '../dto/auth.dto';
import { UserRepository } from '../repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signIn(dto: SignInDto) {
    // Find user by email
    const user = await this.usersRepository.findByEmail(dto.email);

    // Check if user exists
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    // Compare password
    const isPasswordValid = await argon2.verify(user.password, dto.password);

    // Check if user exists
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.getTokens(user.id, user.email);

    // Update refresh token
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // Return tokens
    return tokens;
  }

  async signUp(dto: SignUpDto) {
    // Hash password
    const hashPassword = await argon2.hash(dto.password);

    // Check if user already exists
    if (await this.usersRepository.findByEmail(dto.email)) {
      throw new BadRequestException('User already exists');
    }

    // Create new user
    const newUser = this.usersRepository.create({
      ...dto,
      password: hashPassword,
    });

    // Save user
    await this.usersRepository.save(newUser);

    // Generate tokens
    const tokens = await this.getTokens(newUser.id, newUser.email);

    // Update refresh token
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);

    // Return tokens
    return tokens;
  }

  async refreshTokens(userId: number, refreshToken: string) {
    // Find user by id
    const user = await this.usersRepository.findById(userId);

    // Check if user exists
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');

    // Compare refresh token
    const isRefreshValid = await argon2.verify(user.refreshToken, refreshToken);

    // Check if refresh token is valid
    if (!isRefreshValid) {
      throw new ForbiddenException('Invalid refresh token');
    }

    // Generate tokens
    const tokens = await this.getTokens(user.id, user.email);

    // Update refresh token
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async updateRefreshToken(id: number, refreshToken: string) {
    // Hash refresh token
    const hashedRefreshToken = await argon2.hash(refreshToken);

    // Update refresh token
    await this.usersRepository.update(id, {
      refreshToken: hashedRefreshToken,
    });

    console.log(refreshToken, hashedRefreshToken);
  }

  async getTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      // Generate access token
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('jwt.access.secret'),
          expiresIn: this.configService.get<string>('jwt.access.expiresIn'),
        },
      ),
      // Generate refresh token
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('jwt.refresh.secret'),
          expiresIn: this.configService.get<string>('jwt.refresh.expiresIn'),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}

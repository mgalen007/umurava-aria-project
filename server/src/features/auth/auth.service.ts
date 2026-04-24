import bcrypt from 'bcryptjs';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { AppError } from '../../middleware/error';
import { User } from './auth.model';
import { LoginDto, RegisterDto } from './auth.dto';
import { IUser } from './auth.types';

const DEFAULT_JWT_EXPIRES_IN = '7d';
const DEFAULT_BCRYPT_SALT_ROUNDS = 10;

export class AuthService {
  async register(data: RegisterDto) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const normalizedUsername = data.username.trim().toLowerCase();

    const [emailExists, usernameExists] = await Promise.all([
      User.exists({ email: normalizedEmail }),
      User.exists({ username: normalizedUsername }),
    ]);

    if (emailExists) throw new AppError('A user with this email already exists', 409);
    if (usernameExists) throw new AppError('This username is already taken', 409);

    const passwordHash = await bcrypt.hash(
      data.password,
      this.getSaltRounds()
    );

    const user = await User.create({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      role: 'recruiter',
    });

    return this.buildAuthResponse(user);
  }

  async login(data: LoginDto) {
    const rawIdentifier = data.identifier ?? data.username ?? data.email;
    const identifier = rawIdentifier?.trim().toLowerCase();

    if (!identifier) throw new AppError('Username or email is required', 422);

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    }).select('+passwordHash');

    if (!user) throw new AppError('Invalid credentials', 401);
    if (!user.isActive) throw new AppError('This account is inactive', 403);

    const passwordMatches = await bcrypt.compare(data.password, user.passwordHash);
    if (!passwordMatches) throw new AppError('Invalid credentials', 401);

    return this.buildAuthResponse(user);
  }

  async me(userId: string) {
    const user = await User.findById(userId);
    if (!user || !user.isActive) throw new AppError('User not found', 404);
    return this.serializeUser(user);
  }

  private buildAuthResponse(user: IUser) {
    const serializedUser = this.serializeUser(user);
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
      },
      this.getJwtSecret(),
      { expiresIn: this.getJwtExpiresIn() } as SignOptions
    );

    return {
      token,
      user: serializedUser,
    };
  }

  private serializeUser(user: IUser) {
    return {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`.trim(),
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private getJwtSecret(): Secret {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new AppError('JWT_SECRET is not configured', 500);
    return secret;
  }

  private getJwtExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN;
  }

  private getSaltRounds(): number {
    const parsed = Number(process.env.BCRYPT_SALT_ROUNDS ?? DEFAULT_BCRYPT_SALT_ROUNDS);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_BCRYPT_SALT_ROUNDS;
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/auth.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<Omit<User, 'password'>> {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      // Hash the password before storing
      const hashedPassword = await this.hashPassword(dto.password);

      // Create the user in the database
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
        },
      });

      // Return user without the password
      const { password, ...result } = user;
      return result;
    } catch (error) {
      // Log the error for debugging
      console.error('Registration error:', error);
      throw error;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async login(email: string, password: string) {
    try {
      // Find the user
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        console.log('Login failed: User not found:', email);
        throw new BadRequestException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log('Login failed: Invalid password for user:', email);
        throw new BadRequestException('Invalid credentials');
      }

      // Generate JWT token
      const payload = {
        sub: user.id,
        email: user.email,
        name: user.name,
      };

      const token = this.jwt.sign(payload);

      // Return success response
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
}

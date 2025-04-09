import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private otpService: OtpService,
  ) {}

  async register(email: string, name: string) {
    const isUserExist = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (isUserExist) {
      throw new BadRequestException('User already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        verified: false,
      },
    });

    const otp = await this.otpService.generateOtp(user.id);
    console.log(otp);

    return { message: 'User created successfully' };
  }
}

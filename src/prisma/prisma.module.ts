import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // makes it available globally (no need to import in every module)
@Module({
  providers: [PrismaService], // tells Nest to create an instance
  exports: [PrismaService], // makes it usable in other modules
})
export class PrismaModule {}

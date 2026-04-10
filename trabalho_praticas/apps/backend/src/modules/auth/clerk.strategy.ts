import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../database/prisma.service';
import { createClerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, 'clerk') {
  private clerkClient;

  constructor(private readonly prisma: PrismaService) {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY is required to initialize Clerk auth strategy');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
    });

    this.clerkClient = createClerkClient({ secretKey });
  }

  async validate(payload: any) {
    const clerkId = payload.sub;
    
    if (!clerkId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Check local database by clerkId first
    let user = await this.prisma.user.findUnique({
      where: { clerkId: clerkId } as any,
    });

    if (!user) {
      // Sincronização Just-in-Time: Fetch full user info from Clerk
      try {
        const clerkUser = await this.clerkClient.users.getUser(clerkId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        
        if (!email) {
          throw new UnauthorizedException('Clerk user has no email address');
        }

        // Create or Link by Email (Mapping key)
        user = await this.prisma.user.upsert({
          where: { email: email },
          update: { 
            clerkId: clerkId, 
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Clerk User'
          },
          create: {
            clerkId: clerkId,
            email: email,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Clerk User',
          },
        });
      } catch (error) {
        console.error('Error syncing Clerk user:', error);
        throw new InternalServerErrorException('Failed to sync user data with Clerk');
      }
    }

    return { id: user.id, email: user.email, clerkId: user.clerkId };
  }
}

import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
export const SESSION_COOKIE_NAME = 'portfolio_admin_session';

export async function isSetupNeeded(): Promise<boolean> {
  try {
    const userCount = await prisma.user.count();
    return userCount === 0;
  } catch (error) {
    console.error('Error checking if setup is needed:', error);
    return false;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = randomUUID();
  const expiresAt = BigInt(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
    },
  });

  return sessionId;
}

export async function validateSession(sessionId: string) {
  if (!sessionId) return null;

  try {
    const now = BigInt(Date.now());
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!session || session.expiresAt <= now) {
      if (session) {
        try {
          await prisma.session.delete({ where: { id: sessionId } });
        } catch {
          // ignore
        }
      }
      return null;
    }

    return {
      user: session.user,
      session: {
        id: session.id,
        expiresAt: Number(session.expiresAt),
      },
    };
  } catch (error) {
    console.error('Error validating session:', error);
    return null;
  }
}

export async function destroySession(sessionId: string): Promise<void> {
  if (!sessionId) return;
  try {
    await prisma.session.delete({ where: { id: sessionId } });
  } catch {
    // ignore
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { UserProfileModel } from '@/models/user';
import { logger } from '@/utils/logger';

/**
 * POST /api/user/profile
 * Creates or updates a user profile
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, name, avatar } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and email' },
        { status: 400 }
      );
    }

    // Check if user profile exists
    const existingProfile = await UserProfileModel.findById(userId);
    
    const userProfile = {
      userId,
      email,
      name: name || email.split('@')[0],
      avatar: avatar || existingProfile?.avatar,
      createdAt: existingProfile?.createdAt || new Date(),
      updatedAt: new Date(),
      feedbacks: existingProfile?.feedbacks || [],
    };

    await UserProfileModel.createOrUpdate(userProfile);

    logger.info('User profile created/updated', { userId });

    return NextResponse.json({
      success: true,
      profile: userProfile,
    });
  } catch (error: any) {
    logger.error('Error creating/updating user profile', { error: error.message });
    return NextResponse.json(
      { error: 'Failed to create/update user profile', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/profile?userId=xxx
 * Gets a user profile
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const profile = await UserProfileModel.findById(userId);

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    logger.error('Error fetching user profile', { error: error.message });
    return NextResponse.json(
      { error: 'Failed to fetch user profile', message: error.message },
      { status: 500 }
    );
  }
}


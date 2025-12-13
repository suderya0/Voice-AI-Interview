import { NextRequest, NextResponse } from 'next/server';
import { UserProfileModel } from '@/models/user';
import { logger } from '@/utils/logger';

/**
 * DELETE /api/user/feedback/[id]
 * Deletes a feedback from user profile
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const interviewId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Missing interviewId parameter' },
        { status: 400 }
      );
    }

    // Fetch user profile
    const userProfile = await UserProfileModel.findById(userId);

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Remove feedback from array
    const updatedFeedbacks = (userProfile.feedbacks || []).filter(
      (feedback) => feedback.interviewId !== interviewId
    );

    // Update user profile
    await UserProfileModel.createOrUpdate({
      ...userProfile,
      feedbacks: updatedFeedbacks,
      updatedAt: new Date(),
    });

    logger.info('Feedback deleted from user profile', { userId, interviewId });

    return NextResponse.json({
      success: true,
      message: 'Feedback deleted successfully',
    });
  } catch (error: any) {
    logger.error('Error deleting feedback from user profile', { error: error.message });
    return NextResponse.json(
      { error: 'Failed to delete feedback', message: error.message },
      { status: 500 }
    );
  }
}


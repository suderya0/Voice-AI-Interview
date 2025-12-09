import { NextRequest, NextResponse } from 'next/server';
import { InterviewModel } from '@/models/interview';
import { logger } from '@/utils/logger';

/**
 * GET /api/interview/[id]
 * Get a single interview by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const interviewId = params.id;

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Missing interview ID' },
        { status: 400 }
      );
    }

    const interview = await InterviewModel.findById(interviewId);

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    logger.info('Interview fetched', { interviewId });

    return NextResponse.json({
      success: true,
      interview,
    });
  } catch (error: any) {
    logger.error('Error fetching interview', { error: error.message });
    return NextResponse.json(
      { 
        error: 'Failed to fetch interview',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}


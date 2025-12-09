import { NextRequest, NextResponse } from 'next/server';
import { InterviewModel } from '@/models/interview';
import { logger } from '@/utils/logger';

/**
 * GET /api/interview/list
 * Lists all interviews for a user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Build query filters
    const filters: any = { userId };
    if (status) {
      filters.status = status;
    }

    // Fetch interviews from database
    const interviews = await InterviewModel.findMany(filters, {
      limit,
      offset,
      sortBy: { createdAt: -1 }, // Most recent first
    });

    const total = await InterviewModel.count(filters);

    logger.info('Interviews listed', { userId, count: interviews.length });

    return NextResponse.json({
      success: true,
      interviews,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    logger.error('Error listing interviews', { error });
    return NextResponse.json(
      { error: 'Failed to list interviews' },
      { status: 500 }
    );
  }
}


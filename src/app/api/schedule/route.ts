import { addSchedule } from '@/lib/utils/db';
import { getOverlappingSchedule, scheduleTask } from '@/utils/scheduleTask';
import { NextRequest, NextResponse } from 'next/server';
import { getUserStatus } from '@/utils/userFieldsFetch';

export async function POST(request: NextRequest) {
  try {
    const userStatus = await getUserStatus(request);
    if (userStatus.status !== 200) {
      return NextResponse.json(
        { error: 'User is not an active student' },
        { status: 403 }
      );
    }

    const accessToken = request.cookies.get('access_token')?.value;
    const accessTokenSecret = request.cookies.get('access_token_secret')?.value;

    if (!accessToken || !accessTokenSecret) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse the request body
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['stationId', 'startDate', 'startTime', 'duration', 'operatingSystem', 'id'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Check if the station is already scheduled for overlapping time
    const overlappingSchedule = await getOverlappingSchedule({
      stationId: data.stationId,
      startDate: data.startDate,
      startTime: data.startTime,
      duration: data.duration
    });
    if (overlappingSchedule) {
      return NextResponse.json(
        { error: 'Station is already scheduled for overlapping time' },
        { status: 400 }
      );
    }
    // Schedule the task and capture job_id
    const jobId = await scheduleTask({
      stationId: data.stationId,
      startDate: data.startDate,
      startTime: data.startTime,
      systemCode: `'${data.operatingSystem} ${data.subSystem}'`
    });

    const hours = data.duration.split(':')[0];
    const minutes = data.duration.split(':')[1];
    const durationInMinutes = parseInt(hours) * 60 + parseInt(minutes);
    // Add the schedule to the database
    await addSchedule(data.id, data.stationId, data.startDate, data.startTime, durationInMinutes, data.operatingSystem, data.subSystem, parseInt(jobId));

    // Return a success response
    return NextResponse.json({
      success: true,
      message: 'Schedule submitted successfully',
      jobId
    });
  } catch (error) {
    console.error('Error processing schedule submission:', error);

    // Return an error response
    return NextResponse.json(
      { success: false, message: 'Failed to process schedule submission' },
      { status: 500 }
    );
  }
}

import { AMTManager } from 'amt-manager-test';
import { NextResponse, NextRequest } from 'next/server';
import { config } from 'dotenv';
import { getUserStatus } from '@/utils/userFieldsFetch';

export async function POST(request: NextRequest) {
  try {
    config();
    const { stationId, action } = await request.json();

    if (!stationId || !action) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const userStatus = await getUserStatus(request);

    if (userStatus.status !== 200) {
      return NextResponse.json(
        { error: 'User is not an active student' },
        { status: 403 }
      );
    }

    // Get station configuration from environment variables or a configuration file
    const stationConfig = {
      host: `s${stationId}`,
      username: process.env.AMT_USERNAME || 'admin',
      password: process.env.AMT_PASSWORD || 'password',
      port: parseInt(process.env.AMT_PORT || '16992'),
      protocol: 'http' as const,
    };

    if (!stationConfig.host || !stationConfig.username || !stationConfig.password) {
      return NextResponse.json(
        { error: 'Missing station configuration' },
        { status: 400 }
      );
    }

    const amtManager = new AMTManager(stationConfig);
    let result;

    switch (action) {
      case 'powerOn':
        result = await amtManager.powerOn();
        break;
      case 'powerOff':
        result = await amtManager.powerOff();
        break;
      case 'reset':
        result = await amtManager.reset();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: result });
  } catch (error) {
    console.error('Error in manipulate-state:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

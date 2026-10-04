import { RETURN_BUFFER_MIN } from '../data/constants';
import { parseHHMM } from './time';

export interface ReturnGuaranteeCheck {
  fits: boolean;
  slackMin: number;
}

// A circuit fits the Return Guarantee when the trip ends no later than
// 45 minutes before the passenger's departure time.
export function fitsReturnGuarantee(
  slot: string,
  durationMin: number,
  departureTime: string,
): ReturnGuaranteeCheck {
  const tripEnd = parseHHMM(slot) + durationMin;
  const latestBack = parseHHMM(departureTime) - RETURN_BUFFER_MIN;
  const slackMin = latestBack - tripEnd;
  return { fits: tripEnd <= latestBack, slackMin };
}

import { Ratelimit } from '@upstash/ratelimit'
import { type NextRequest, NextResponse } from 'next/server'

import { redis } from '~/lib/redis'
import type { ActivityResponse, ActivityTrack } from '~/types/activity'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '5 s'),
    analytics: true,
  })
  const ratelimitKey = ['activity:ratelimit', req.ip ?? 'unknown']
    .filter(Boolean)
    .join(':')
  const { success } = await ratelimit.limit(ratelimitKey)
  if (!success) {
    return new Response('Too Many Requests', {
      status: 429,
    })
  }

  const [appRaw, trackRaw, updatedAtRaw] = await redis.mget<
    string | ActivityTrack
  >('activity:app', 'activity:track', 'activity:updatedAt')

  let track: ActivityTrack | null = null

  if (trackRaw) {
    if (typeof trackRaw === 'string') {
      try {
        const parsed = JSON.parse(trackRaw) as ActivityTrack
        track = normalizeTrack(parsed)
      } catch {
        track = null
      }
    } else if (isActivityTrack(trackRaw)) {
      track = normalizeTrack(trackRaw)
    }
  }

  const response: ActivityResponse = {
    app: typeof appRaw === 'string' ? appRaw : null,
    track,
    updatedAt: typeof updatedAtRaw === 'string' ? updatedAtRaw : null,
  }

  return NextResponse.json(response)
}

function isActivityTrack(value: unknown): value is ActivityTrack {
  if (!value || typeof value !== 'object') {
    return false
  }

  const maybeTrack = value as { title?: unknown }
  return typeof maybeTrack.title === 'string'
}

function normalizeTrack(track: ActivityTrack): ActivityTrack | null {
  if (!track || typeof track.title !== 'string' || track.title.length === 0) {
    return null
  }

  return {
    title: track.title,
    artist: track.artist ?? null,
    app: track.app ?? null,
    artwork: track.artwork ?? null,
  }
}

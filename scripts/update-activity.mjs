import 'dotenv/config'

import { Redis } from '@upstash/redis'

const {
  UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN,
  ACTIVITY_APP,
  ACTIVITY_TRACK_TITLE,
  ACTIVITY_TRACK_ARTIST,
  ACTIVITY_TRACK_APP,
  ACTIVITY_TRACK_ARTWORK,
  ACTIVITY_CLEAR_TRACK,
} = process.env

if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing Upstash Redis credentials. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.')
}

const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
})

const now = new Date().toISOString()
const app = ACTIVITY_APP ?? null

const track = ACTIVITY_TRACK_TITLE
  ? {
      title: ACTIVITY_TRACK_TITLE,
      artist: ACTIVITY_TRACK_ARTIST ?? null,
      app: ACTIVITY_TRACK_APP ?? app ?? 'now-playing',
      artwork: ACTIVITY_TRACK_ARTWORK ?? null,
    }
  : null

const pipeline = redis.pipeline()

if (app) {
  pipeline.set('activity:app', app)
}

if (track) {
  pipeline.set('activity:track', track)
} else if (ACTIVITY_CLEAR_TRACK === 'true') {
  pipeline.del('activity:track')
}

pipeline.set('activity:updatedAt', now)

await pipeline.exec()

console.log('✅ Activity updated', {
  app,
  track,
  updatedAt: now,
})

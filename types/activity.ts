export type ActivityTrack = {
  title: string
  artist?: string | null
  app?: string | null
  artwork?: string | null
}

export type ActivityResponse = {
  app: string | null
  track: ActivityTrack | null
  updatedAt: string | null
}

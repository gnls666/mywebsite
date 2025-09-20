'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import React from 'react'
import { useQuery } from 'react-query'

import { Tooltip } from '~/components/ui/Tooltip'
import type { ActivityResponse, ActivityTrack } from '~/types/activity'

type AppMetadata = {
  label: string
  icon?: string
}

const DEFAULT_ACTIVITY_HOSTS = ['cali.so', 'www.cali.so', 'localhost', '127.0.0.1']
const configuredHosts = (process.env.NEXT_PUBLIC_ACTIVITY_HOSTS ?? '')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean)
const ACTIVITY_ALLOWED_HOSTS =
  configuredHosts.length > 0 ? configuredHosts : DEFAULT_ACTIVITY_HOSTS

const appLabels: Record<string, AppMetadata> = {
  slack: { label: 'Slack' },
  arc: { label: 'Arc' },
  craft: { label: 'Craft' },
  tower: { label: 'Tower' },
  vscode: { label: 'VS Code' },
  webstorm: { label: 'WebStorm' },
  linear: { label: 'Linear' },
  figma: { label: 'Figma' },
  telegram: { label: 'Telegram' },
  wechat: { label: '微信' },
  discord: { label: 'Discord' },
  cron: { label: 'Cron' },
  mail: { label: '邮件' },
  safari: { label: 'Safari' },
  music: { label: 'Apple Music' },
  finder: { label: '访达' },
  messages: { label: '信息' },
  live: { label: 'Ableton Live' },
  screenflow: { label: 'ScreenFlow' },
  resolve: { label: 'DaVinci Resolve' },
  warp: { label: 'Warp' },
  'now-playing': { label: '正在播放', icon: 'music' },
}

export function Activity() {
  const { data } = useQuery<ActivityResponse>(
    'activity',
    async () => {
      const res = await fetch('/api/activity', {
        cache: 'no-store',
      })
      if (!res.ok) {
        throw new Error('Failed to load activity')
      }

      const payload = (await res.json()) as Partial<ActivityResponse>

      const sanitizedTrack = normalizeTrack(payload.track)

      return {
        app: payload.app ?? null,
        track: sanitizedTrack,
        updatedAt: payload.updatedAt ?? null,
      }
    },
    {
      refetchInterval: 5000,
      enabled:
        typeof window !== 'undefined' &&
        ACTIVITY_ALLOWED_HOSTS.includes(window.location.hostname),
    }
  )
  const [open, setOpen] = React.useState(false)

  if (!data || (!data.app && !data.track)) {
    return null
  }

  const { app, track, updatedAt } = data
  const iconApp = track ? track.app ?? 'now-playing' : app
  const iconName = getAppIcon(iconApp)
  const trackSubtitle = track
    ? [track.artist, getAppLabel(track.app ?? null) ?? getAppLabel(app)]
        .filter(Boolean)
        .join(' · ')
    : null
  const updatedRelative = formatRelativeTime(updatedAt)

  return (
    <Tooltip.Provider disableHoverableContent>
      <Tooltip.Root open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger asChild>
          <div className="pointer-events-auto relative flex items-center">
            <motion.div
              className="absolute left-1 top-1 h-6 w-6 select-none rounded-[6px] bg-zinc-500/10 dark:bg-zinc-200/10"
              animate={{ opacity: [0, 0.65, 0], scale: [1, 1.4, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
            <Image
              width={32}
              height={32}
              src={`/apps/${iconName}.png`}
              alt={getAppLabel(iconApp) ?? iconName ?? 'activity'}
              priority
              fetchPriority="high"
              unoptimized
              className="pointer-events-none select-none"
            />
          </div>
        </Tooltip.Trigger>
        <AnimatePresence>
          {open && (
            <Tooltip.Portal forceMount>
              <Tooltip.Content asChild>
                <motion.div
                  className="mt-1 max-w-[260px] rounded-lg border border-zinc-200/50 bg-white/90 px-3 py-2 text-sm text-zinc-900 shadow-lg backdrop-blur-md dark:border-zinc-700/60 dark:bg-zinc-900/85 dark:text-zinc-100"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  {track ? (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-zinc-100/80 dark:bg-zinc-800/80">
                        <Image
                          src={`/apps/${iconName}.png`}
                          alt={iconName ?? 'activity icon'}
                          width={40}
                          height={40}
                          className="h-10 w-10 select-none object-contain"
                          unoptimized
                        />
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-medium leading-tight">
                          {track.title}
                        </span>
                        {trackSubtitle && (
                          <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                            {trackSubtitle}
                          </span>
                        )}
                        {(updatedRelative || getAppLabel(app)) && (
                          <span className="mt-1 text-[11px] uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
                            {[getAppLabel(track.app ?? null) ?? getAppLabel(app), updatedRelative]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="font-medium leading-tight">
                        Cali 正在使用 {getAppLabel(app) ?? app}
                      </span>
                      {updatedRelative && (
                        <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          更新于 {updatedRelative}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              </Tooltip.Content>
            </Tooltip.Portal>
          )}
        </AnimatePresence>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

function getAppLabel(app: string | null | undefined) {
  if (!app) return null
  return appLabels[app]?.label ?? app
}

function getAppIcon(app: string | null | undefined) {
  if (!app) {
    return 'finder'
  }

  return appLabels[app]?.icon ?? app
}

function normalizeTrack(track: ActivityTrack | null | undefined): ActivityTrack | null {
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

function formatRelativeTime(isoTimestamp: string | null | undefined) {
  if (!isoTimestamp) {
    return null
  }

  const date = new Date(isoTimestamp)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  const diffMs = date.getTime() - Date.now()
  const formatter = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' })

  const diffSeconds = Math.round(diffMs / 1000)
  if (Math.abs(diffSeconds) < 60) {
    return formatter.format(diffSeconds, 'second')
  }

  const diffMinutes = Math.round(diffSeconds / 60)
  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, 'minute')
  }

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, 'hour')
  }

  const diffDays = Math.round(diffHours / 24)
  return formatter.format(diffDays, 'day')
}

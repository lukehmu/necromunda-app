import { BroadcastIcon, LinkSimpleIcon, SignOutIcon } from '@phosphor-icons/react'
import { type FormEvent, useId, useState } from 'react'
import { ConfirmButton } from '@/components/ConfirmButton'
import { Panel } from '@/components/Panel'
import { QrCode } from '@/components/QrCode'
import { t } from '@/i18n/en'
import { joinLink } from '@/lib/live'
import { useLiveGame } from '@/store'
import type { LiveStatus } from '@/useLive'
import { CODE_ALPHABET, CODE_LENGTH, CODE_PATTERN } from '../../shared/protocol'

const label = 'font-condensed text-xs font-semibold tracking-[0.14em] text-hive-400 uppercase'
const primary =
  'press flex min-h-12 w-full items-center justify-center gap-2 rounded-[2px] bg-hazard px-4 font-condensed text-base font-bold tracking-wider text-hazard-ink uppercase disabled:opacity-50'
const secondary =
  'press well flex min-h-11 w-full items-center justify-center gap-2 px-3 font-condensed text-sm font-bold tracking-wider text-hive-200 uppercase'

/** Connection lamp: lit when live, dim and pulsing while (re)connecting. */
export const LiveLamp = ({ status }: { status: LiveStatus }) => {
  return (
    <span
      aria-hidden
      className={`inline-block size-2 shrink-0 rounded-[1px] ${
        status === 'live' ? 'bg-hazard' : 'animate-pulse bg-hive-600'
      }`}
    />
  )
}

const StatusLine = ({ status, extra }: { status: LiveStatus; extra?: string }) => {
  return (
    <p className="flex items-center gap-2 font-condensed text-sm font-semibold tracking-wider text-hive-400 uppercase">
      <LiveLamp status={status} />
      {t.live.status[status]}
      {extra && <span className="text-hive-200">{extra}</span>}
    </p>
  )
}

const ShareLinkButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false)
  const url = joinLink(code)
  const canShare = typeof navigator.share === 'function'

  const onClick = async () => {
    if (canShare) {
      try {
        await navigator.share({ title: t.live.shareTitle, text: t.live.shareText(code), url })
      } catch {
        // Dismissing the share sheet is not an error worth showing.
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked: the QR code and code are still on screen.
    }
  }

  return (
    <button type="button" onClick={onClick} className={secondary}>
      <LinkSimpleIcon aria-hidden size={16} weight="bold" />
      {canShare ? t.live.shareLink : copied ? t.live.copied : t.live.copyLink}
    </button>
  )
}

const JoinForm = () => {
  const live = useLiveGame()
  const [code, setCode] = useState('')
  const id = useId()
  const valid = CODE_PATTERN.test(code)

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (valid) void live.join(code)
  }

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor={id} className={label}>
        {t.live.codeLabel}
      </label>
      <div className="mt-1 flex gap-2">
        <input
          id={id}
          value={code}
          // Only letters the Worker can hand out, so a typo can't be submitted.
          onChange={(e) =>
            setCode(
              e.target.value
                .toUpperCase()
                .split('')
                .filter((c) => CODE_ALPHABET.includes(c))
                .join('')
                .slice(0, CODE_LENGTH),
            )
          }
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          maxLength={CODE_LENGTH}
          className="well min-w-0 flex-1 px-3 py-2 text-center font-stencil text-3xl tracking-[0.3em] text-hive-200 uppercase outline-none focus:border-hazard focus:ring-1 focus:ring-hazard"
        />
        <button
          type="submit"
          disabled={!valid || live.busy}
          className="press shrink-0 rounded-[2px] border border-hazard px-4 font-condensed text-base font-bold tracking-wider text-hazard uppercase active:bg-hazard/15 disabled:opacity-40"
        >
          {live.busy ? t.live.joining : t.live.join}
        </button>
      </div>
    </form>
  )
}

export const LivePanel = () => {
  const live = useLiveGame()
  if (!live.enabled) return null

  const { session } = live
  const notice = live.notice && <p className="text-sm text-blood">{t.live.notices[live.notice]}</p>

  return (
    <Panel icon={BroadcastIcon} title={t.live.title}>
      {!session && (
        <div className="space-y-4">
          <p className="text-hive-400">{t.live.intro}</p>
          <button
            type="button"
            onClick={() => void live.share()}
            disabled={live.busy}
            className={primary}
          >
            <BroadcastIcon aria-hidden size={20} weight="bold" />
            {live.busy ? t.live.starting : t.live.share}
          </button>
          {notice}
          <div className="border-t border-hive-700 pt-4">
            <p className="mb-2 font-condensed text-sm font-bold tracking-[0.12em] text-hive-200 uppercase">
              {t.live.joinHeading}
            </p>
            <JoinForm />
          </div>
        </div>
      )}

      {session?.role === 'host' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <QrCode value={joinLink(session.code)} label={t.live.qrAlt(session.code)} size={132} />
            <div className="min-w-0">
              <p className={label}>{t.live.codeHeading}</p>
              <p className="font-stencil text-5xl leading-none tracking-[0.12em] text-hive-200">
                {session.code}
              </p>
              <div className="mt-2">
                <StatusLine status={live.status} extra={t.turnBar.watchers(live.viewers)} />
              </div>
            </div>
          </div>
          <ShareLinkButton code={session.code} />
          <ConfirmButton
            idleClassName="press min-h-11 w-full rounded-[2px] border border-blood/60 px-3 font-condensed text-sm font-bold tracking-wider text-blood uppercase active:bg-blood/10"
            confirmLabel={t.live.stopConfirm}
            prompt={t.live.stopPrompt}
            onConfirm={live.leave}
          >
            {t.live.stop}
          </ConfirmButton>
        </div>
      )}

      {session?.role === 'viewer' && (
        <div className="space-y-4">
          <div>
            <p className="font-condensed text-lg font-bold tracking-wider text-hive-200 uppercase">
              {t.live.watchingHeading(session.code)}
            </p>
            <div className="mt-1">
              <StatusLine status={live.status} />
            </div>
          </div>
          <p className="text-sm text-hive-400">{t.live.watchingNote}</p>
          <button type="button" onClick={live.leave} className={secondary}>
            <SignOutIcon aria-hidden size={16} weight="bold" />
            {t.live.leave}
          </button>
        </div>
      )}
    </Panel>
  )
}

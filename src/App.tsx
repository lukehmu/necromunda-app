import { ArrowUpRightIcon, GearSixIcon, GithubLogoIcon } from '@phosphor-icons/react'
import { AddFighterForm } from '@/components/AddFighterForm'
import { ConfirmButton } from '@/components/ConfirmButton'
import { FighterCard } from '@/components/FighterCard'
import { Panel } from '@/components/Panel'
import { RulesPanel } from '@/components/RulesPanel'
import { ThemeToggle, useAppliedTheme } from '@/components/ThemeToggle'
import { TurnBar } from '@/components/TurnBar'
import { t } from '@/i18n/en'
import { useStore } from '@/store'

export default function App() {
  const { state, dispatch } = useStore()

  useAppliedTheme(state.theme)

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
      <TurnBar />

      <main className="flex-1 space-y-4 px-4 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <AddFighterForm />

        {state.fighters.length === 0 ? (
          <div className="border border-dashed border-hive-700 px-6 py-10 text-center">
            <p className="font-stencil text-3xl text-hive-400 uppercase">{t.emptyState.title}</p>
            <p className="mx-auto mt-2 max-w-[32ch] text-hive-400">{t.emptyState.body}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {state.fighters.map((fighter) => (
              <FighterCard key={fighter.id} fighter={fighter} />
            ))}
          </ul>
        )}

        <RulesPanel />

        <Panel icon={GearSixIcon} title={t.settings.title}>
          <div className="space-y-5">
            <ThemeToggle />

            <div className="space-y-2 border-t border-hive-700 pt-4">
              <ConfirmButton
                idleClassName="press well min-h-11 w-full px-3 font-condensed text-sm font-bold tracking-wider text-hive-200 uppercase"
                confirmLabel={t.settings.newBattleConfirm}
                prompt={t.settings.newBattlePrompt}
                onConfirm={() => dispatch({ type: 'resetBattle' })}
              >
                {t.settings.newBattle}
              </ConfirmButton>
              <ConfirmButton
                idleClassName="press min-h-11 w-full rounded-[2px] border border-blood/60 px-3 font-condensed text-sm font-bold tracking-wider text-blood uppercase active:bg-blood/10"
                confirmLabel={t.settings.clearRosterConfirm}
                prompt={t.settings.clearRosterPrompt}
                onConfirm={() => dispatch({ type: 'clearAll' })}
              >
                {t.settings.clearRoster}
              </ConfirmButton>
            </div>

            <a
              href={__REPO_URL__}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center gap-2 font-condensed text-sm font-bold tracking-wider text-hive-400 uppercase underline-offset-4 hover:text-hazard hover:underline"
            >
              <GithubLogoIcon aria-hidden size={18} weight="bold" />
              {t.settings.source}
              <ArrowUpRightIcon aria-hidden size={14} weight="bold" />
            </a>
          </div>
        </Panel>
      </main>
    </div>
  )
}

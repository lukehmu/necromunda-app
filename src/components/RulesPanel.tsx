import { BookOpenTextIcon } from '@phosphor-icons/react'
import { Panel } from '@/components/Panel'
import { t } from '@/i18n/en'

type RuleKey = keyof typeof t.rules.items

/** Display order, and the flag colour each term borrows so it reads as linked. */
const ORDER: { key: RuleKey; className: string }[] = [
  { key: 'newTurn', className: 'text-hazard' },
  { key: 'activated', className: 'text-hazard' },
  { key: 'suppressed', className: 'text-toxin' },
  { key: 'injured', className: 'text-blood' },
  { key: 'outOfAmmo', className: 'text-hive-200' },
  { key: 'wounds', className: 'text-hive-200' },
  { key: 'newBattle', className: 'text-hive-200' },
]

/** Plain-language summary of what the reducer automates. Keep in step with store.tsx. */
export function RulesPanel() {
  return (
    <Panel icon={BookOpenTextIcon} title={t.rules.title}>
      <p className="text-hive-400">{t.rules.intro}</p>
      <dl className="mt-4 space-y-3">
        {ORDER.map(({ key, className }) => (
          <div key={key}>
            <dt
              className={`font-condensed text-sm font-bold tracking-[0.12em] uppercase ${className}`}
            >
              {t.rules.items[key].term}
            </dt>
            <dd className="mt-0.5 text-hive-200">{t.rules.items[key].body}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 border-t border-hive-700 pt-3 text-sm text-hive-400">{t.rules.source}</p>
    </Panel>
  )
}

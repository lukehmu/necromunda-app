import { UserPlusIcon } from '@phosphor-icons/react'
import { type FormEvent, useId, useState } from 'react'
import { t } from '@/i18n/en'
import { useStore } from '@/store'

export const AddFighterForm = () => {
  const { dispatch } = useStore()
  const [name, setName] = useState('')
  const [wounds, setWounds] = useState('1')
  const nameId = useId()
  const woundsId = useId()

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    dispatch({ type: 'add', name, maxWounds: Number(wounds) || 1 })
    setName('')
    setWounds('1')
  }

  const label = 'font-condensed text-xs font-semibold tracking-[0.14em] text-hive-400 uppercase'
  const field =
    'well w-full px-3 py-2.5 text-hive-200 outline-none focus:border-hazard focus:ring-1 focus:ring-hazard'

  return (
    <form onSubmit={onSubmit} className="plate flex items-end gap-2 p-3 pl-5">
      <div className="min-w-0 flex-1">
        <label htmlFor={nameId} className={label}>
          {t.addFighter.name}
        </label>
        <input
          id={nameId}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
          className={`${field} mt-1 font-condensed text-lg font-semibold uppercase`}
        />
      </div>
      <div className="w-16 shrink-0">
        <label htmlFor={woundsId} className={label}>
          {t.addFighter.wounds}
        </label>
        <input
          id={woundsId}
          type="number"
          min={1}
          max={20}
          value={wounds}
          onChange={(e) => setWounds(e.target.value)}
          className={`${field} mt-1 text-center font-condensed text-lg font-semibold tabular-nums`}
        />
      </div>
      <button
        type="submit"
        disabled={!name.trim()}
        className="press flex min-h-[46px] shrink-0 items-center gap-1.5 rounded-[2px] border border-hazard px-3 font-condensed text-base font-bold tracking-wider text-hazard uppercase active:bg-hazard/15 disabled:opacity-40"
      >
        <UserPlusIcon aria-hidden size={18} weight="bold" />
        {t.addFighter.submit}
      </button>
    </form>
  )
}

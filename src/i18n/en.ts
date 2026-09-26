/**
 * Every user-facing string in the app. Components import `t` rather than
 * inlining copy. Page metadata (title, description, social cards) lives in
 * `vite.config.ts` instead, because it is needed at build time.
 */
export const t = {
  common: {
    keep: 'Keep',
  },

  turnBar: {
    round: 'Round',
    newTurn: 'New turn',
    noFighters: 'No fighters in play',
    allActivated: 'All fighters activated',
    toActivate: (pending: number, total: number) => `${pending} of ${total} to activate`,
  },

  addFighter: {
    name: 'Fighter',
    wounds: 'Wounds',
    submit: 'Add',
    defaultName: 'Unnamed fighter',
  },

  emptyState: {
    title: 'Muster your gang',
    body: 'Add each fighter with the wounds on their card. Then track the fight turn by turn.',
  },

  fighter: {
    nameLabel: 'Fighter name',
    totalWoundsLabel: 'Total wounds',
    wounds: 'Wounds',
    loseWound: (name: string) => `Lose a wound: ${name}`,
    restoreWound: (name: string) => `Restore a wound: ${name}`,
    remove: (name: string) => `Remove ${name}`,
    confirmRemove: (name: string) => `Confirm remove ${name}`,
    removeConfirm: 'Remove',
  },

  flags: {
    activated: 'Activated',
    suppressed: 'Suppressed',
    outOfAmmo: 'No ammo',
    injured: 'Injured',
  },

  /**
   * Reminders shown while a flag is on, paraphrasing the Necromunda (2026)
   * quick reference and the September 2026 FAQ.
   */
  tips: {
    suppressed: 'Only 1 action when activated. Clears once they have, or if they are charged.',
    outOfAmmo:
      "Can't shoot that weapon until reloaded. Reload is a single action. Scarce weapons need a roll; Limited ones can't reload.",
    injured: "Can't use skills. Clears if they get a wound back.",
  },

  settings: {
    title: 'Settings',
    theme: 'Theme',
    themes: { system: 'System', light: 'Light', dark: 'Dark' },
    newBattle: 'New battle',
    newBattleConfirm: 'Reset',
    newBattlePrompt: 'Restores every wound and clears all flags and the round counter.',
    clearRoster: 'Clear roster',
    clearRosterConfirm: 'Delete all',
    clearRosterPrompt: "Deletes every fighter. This can't be undone.",
    source: 'Source on GitHub',
  },
} as const

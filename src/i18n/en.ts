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
    watching: (code: string) => `Watching ${code}`,
    watchers: (n: number) => (n === 1 ? '1 watching' : `${n} watching`),
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

  live: {
    title: 'Live game',
    intro:
      'Let the other players watch this game live on their phones. Only you can change anything.',
    share: 'Share this game',
    starting: 'Starting',
    joinHeading: 'Watch a game',
    emptyJoin: "Watching someone else's game? Enter their code.",
    codeLabel: 'Game code',
    join: 'Watch',
    joining: 'Joining',
    codeHeading: 'Game code',
    qrAlt: (code: string) => `QR code to watch game ${code}`,
    shareLink: 'Share link',
    copyLink: 'Copy link',
    copied: 'Link copied',
    shareTitle: 'Watch my Necromunda game',
    shareText: (code: string) => `Watch game ${code} live`,
    stop: 'Stop sharing',
    stopConfirm: 'Stop',
    stopPrompt: 'Everyone watching is disconnected. The game stays on this phone.',
    watchingHeading: (code: string) => `Watching game ${code}`,
    watchingNote: 'Your own gang is safe on this phone and comes back when you leave.',
    leave: 'Leave',
    status: {
      connecting: 'Connecting',
      live: 'Live',
      offline: 'Reconnecting',
    },
    notices: {
      ended: 'The host ended the game.',
      notFound: 'No game with that code. It may have finished.',
      network: "Couldn't reach the live game server. Check your connection.",
      tooMany: 'Too many new games from here. Try again in a minute.',
      badToken: 'This phone is no longer the host of that game.',
    },
    waiting: 'Waiting for the host',
  },

  rules: {
    title: 'Rules',
    intro: 'What the tracker does by itself. Everything else is a manual toggle.',
    items: {
      newTurn: {
        term: 'New turn',
        body: "Clears every fighter's activation and moves the round on. Nothing else changes.",
      },
      activated: {
        term: 'Activated',
        body: 'Mark a fighter once they have taken their actions. Activated fighters dim, and the header counts who is left.',
      },
      suppressed: {
        term: 'Suppressed',
        body: 'Only 1 action when activated. Clears the moment you mark them Activated, not at the end of the turn. Being charged clears it too: untick it by hand.',
      },
      injured: {
        term: 'Injured',
        body: "Switches on when wounds reach 0 and off when a wound comes back. Can't use skills. Knocked down and seriously injured are shown by the model on the table, so they aren't tracked.",
      },
      outOfAmmo: {
        term: 'No ammo',
        body: "Manual. That weapon can't shoot until it is reloaded with a Reload action.",
      },
      wounds: {
        term: 'Wounds',
        body: 'Use − as they are lost. + is for regaining a wound, or undoing a mistap.',
      },
      newBattle: {
        term: 'New battle',
        body: 'Restores every wound, clears all flags and resets the round to 1. The roster is kept.',
      },
    },
    source: 'Based on the Necromunda (2026) rules and the September 2026 FAQ. Unofficial fan tool.',
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

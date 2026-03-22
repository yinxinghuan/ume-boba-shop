// Lightweight i18n for Whack-A-Mole — no external library needed.
// Supports 'zh' (Chinese) and 'en' (English). Falls back to 'en'.

const translations = {
  zh: {
    subtitle: '🕳️ 打 地 鼠 🕳️',
    rule1: '👆 点击从地洞中探出的角色得分！',
    rule2: '👻 小心幽灵，打到它会扣分哦~',
    startBtn: '🎮 开始游戏',
    highRecord: '🏆 最高纪录: {n}',
    gameOver: '游戏结束!',
    finalScore: '最终得分',
    newRecord: '新纪录!',
    historyBest: '历史最高: {n}',
    replayBtn: '再来一局',
    homeBtn: '返回',
    scoreLabel: '得分',
    bestLabel: '最高',
    combo: '{n}连击!',
    'char.guitarist.name': '吉他少年 · Algram',
    'char.coder.name': '咖啡女孩 · Jenny',
    'char.hacker.name': '眼镜大叔 · JM·F',
    'char.ghost.name': '调皮幽灵 · ghostpixel',
    'whack.guitarist.0': '我的吉他！',
    'whack.guitarist.1': '走音了！',
    'whack.guitarist.2': '别碰琴弦！',
    'whack.coder.0': '咖啡洒了！',
    'whack.coder.1': '代码没保存！',
    'whack.coder.2': 'Bug警告！',
    'whack.hacker.0': '眼镜歪了！',
    'whack.hacker.1': '防火墙破了！',
    'whack.hacker.2': '系统崩溃！',
    'whack.ghost.0': '嘻嘻~扣分！',
    'whack.ghost.1': '中计啦！',
    'whack.ghost.2': '抓到我啦~',
    'lb.title': '排行榜',
    'lb.global': '🌍 全局榜',
    'lb.friends': '👥 好友榜',
    'lb.empty': '暂无记录，快来第一个上榜！',
    'lb.emptyFriends': '好友还未上榜，快来邀请他们！',
    'lb.error': '加载失败，请重试',
    'lb.me': '我',
    'lb.btn': '🏆 排行榜',
  },
  en: {
    subtitle: '🕳️ W H A C K - A - M O L E 🕳️',
    rule1: '👆 Tap characters popping from holes to score!',
    rule2: '👻 Watch out for ghosts — they cost you points!',
    startBtn: '🎮 Start Game',
    highRecord: '🏆 Best: {n}',
    gameOver: 'Game Over!',
    finalScore: 'Final Score',
    newRecord: 'New Record!',
    historyBest: 'Best: {n}',
    replayBtn: 'Play Again',
    homeBtn: 'Home',
    scoreLabel: 'Score',
    bestLabel: 'Best',
    combo: '{n}x Combo!',
    'char.guitarist.name': 'Guitar Boy · Algram',
    'char.coder.name': 'Coffee Girl · Jenny',
    'char.hacker.name': 'Hacker Dude · JM·F',
    'char.ghost.name': 'Cheeky Ghost · ghostpixel',
    'whack.guitarist.0': 'My guitar!',
    'whack.guitarist.1': 'Out of tune!',
    'whack.guitarist.2': "Don't touch the strings!",
    'whack.coder.0': 'Spilled my coffee!',
    'whack.coder.1': 'Unsaved code!',
    'whack.coder.2': 'Bug alert!',
    'whack.hacker.0': 'My glasses!',
    'whack.hacker.1': 'Firewall breached!',
    'whack.hacker.2': 'System crash!',
    'whack.ghost.0': 'Hehe~ penalty!',
    'whack.ghost.1': 'Tricked ya!',
    'whack.ghost.2': 'You got me~',
    'lb.title': 'Leaderboard',
    'lb.global': '🌍 Global',
    'lb.friends': '👥 Friends',
    'lb.empty': 'No records yet. Be the first!',
    'lb.emptyFriends': 'No friends on the board yet. Invite them!',
    'lb.error': 'Failed to load. Try again.',
    'lb.me': 'me',
    'lb.btn': '🏆 Leaderboard',
  },
} as const;

type Locale = keyof typeof translations;

function detectLocale(): Locale {
  const override =
    typeof localStorage !== 'undefined' ? localStorage.getItem('wam_locale') : null;
  if (override === 'en' || override === 'zh') return override;
  const lang = (typeof navigator !== 'undefined' ? navigator.language : 'en').toLowerCase();
  if (lang.startsWith('zh')) return 'zh';
  return 'en';
}

const locale = detectLocale();

/** Translate a key, optionally replacing {n} with a value. */
export function t(key: string, vars?: { n?: number | string }): string {
  const dict = translations[locale] as Record<string, string>;
  let str = dict[key] ?? (translations.en as Record<string, string>)[key] ?? key;
  if (vars?.n !== undefined) {
    str = str.replace('{n}', String(vars.n));
  }
  return str;
}

/** React hook — returns t() bound to the detected locale. */
export function useLocale() {
  return { t, locale };
}

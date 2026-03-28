function detectLocale(): 'zh' | 'en' {
  const override = localStorage.getItem('game_locale')
  if (override === 'en' || override === 'zh') return override
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

export const locale = detectLocale()

const strings: Record<string, Record<'zh' | 'en', string>> = {
  // ── Units ────────────────────────────────────────────────────────────────
  min:          { zh: '分',  en: 'm' },
  sec:          { zh: '秒',  en: 's' },
  per_sec:      { zh: '/秒', en: '/s' },

  // ── DrinkRow ─────────────────────────────────────────────────────────────
  collect:      { zh: '收取！',   en: 'Collect!' },
  tap_to_start: { zh: '点击开始', en: 'Tap to start' },

  // ── Buy mode toggle ───────────────────────────────────────────────────────
  max:          { zh: '最多', en: 'Max' },

  // ── Crystals / prestige ───────────────────────────────────────────────────
  crystals:           { zh: '结晶',       en: 'crystals' },
  prestige_title:     { zh: '月球转生',   en: 'Moon Prestige' },
  prestige_earn:      { zh: '获得',       en: 'Earn' },
  prestige_now:       { zh: '当前',       en: 'Now' },
  prestige_after_x:   { zh: '转生后 ×',  en: 'After ×' },
  prestige_global:    { zh: ' 全局收益',  en: ' global income' },
  prestige_cta1:      { zh: '立即',       en: 'GO' },
  prestige_cta2:      { zh: '转生',       en: 'PRESTIGE' },
  // modal
  prestige_reset_body:    { zh: '重置所有饮品和金币',   en: 'Reset all drinks and coins' },
  prestige_current_label: { zh: '当前结晶：',           en: 'Current crystals: ' },
  prestige_after_label:   { zh: '转生后结晶：',         en: 'After prestige: ' },
  global_mult_label:      { zh: '全局收益倍率：×',      en: 'Global multiplier: ×' },
  prestige_confirm:       { zh: '确认转生',             en: 'Confirm Prestige' },
  cancel:                 { zh: '取消',                 en: 'Cancel' },

  // ── Offline modal ─────────────────────────────────────────────────────────
  offline_title:   { zh: '离线收益',             en: 'Offline Earnings' },
  offline_body:    { zh: '离开期间店员帮你赚了', en: 'Your staff earned while you were away' },
  offline_collect: { zh: '收下！',               en: 'Collect!' },

  // ── Locked drink row ──────────────────────────────────────────────────────
  locked_pre:  { zh: '店铺升级后解锁 · ', en: 'Shop upgrade unlock · ' },
  locked_post: { zh: ' 总收入',           en: ' total earned' },

  // ── Shop / level max ─────────────────────────────────────────────────────
  maxed_level: { zh: '🏆 已达到最高等级！', en: '🏆 Max Level Reached!' },

  // ── StartScreen ──────────────────────────────────────────────────────────
  open_business:       { zh: '开始营业',               en: 'Start' },
  continue_business:   { zh: '继续营业',               en: 'Continue' },
  restart:             { zh: '重新开始',               en: 'Restart' },
  reset_confirm_title: { zh: '重新开始？',             en: 'Start Over?' },
  reset_confirm_body:  { zh: '当前进度将会清空，无法恢复。', en: 'All progress will be lost and cannot be recovered.' },
  confirm_reset:       { zh: '确认重置',               en: 'Reset' },

  // ── Tutorial ─────────────────────────────────────────────────────────────
  skip_tutorial:      { zh: '跳过引导',   en: 'Skip' },
  tap_here:           { zh: '点这里！',   en: 'Tap here!' },
  tap_continue:       { zh: '点击继续',   en: 'Tap to continue' },
  tap_continue_arrow: { zh: '点击继续 →', en: 'Tap to continue →' },

  // ── Game name ─────────────────────────────────────────────────────────────
  game_name: { zh: 'UMe 珍珠奶茶小铺', en: 'Boba Rush' },

  // ── Employ / Research (DrinkRow buttons) ─────────────────────────────────
  employ:   { zh: '雇用',  en: 'Employ' },
  research: { zh: '研发',  en: 'Unlock' },

  // ── HelpPanel ─────────────────────────────────────────────────────────────
  help_title:            { zh: '玩法说明',    en: 'How to Play' },
  help_multiplier_label: { zh: '收益倍率',    en: 'Income Multiplier' },
  help_auto_label:       { zh: '自动化',      en: 'Automation' },
  help_prestige_label:   { zh: '月球转生 🌙', en: 'Moon Prestige 🌙' },
  help_multiplier_title: { zh: '杯数越多，收益越高',         en: 'More cups, more income' },
  help_multiplier_l1:    { zh: '每多一杯，每轮收益线性增加',           en: 'Income scales linearly with cup count' },
  help_multiplier_l2:    { zh: '10 / 25 / 50 / 100 杯时收益大幅跳升', en: 'Big income boost at 10 / 25 / 50 / 100 cups' },
  help_multiplier_l3:    { zh: '店铺等级提升后，全局收益倍率同步上涨', en: 'Shop level-ups increase your global multiplier' },
  help_auto_title:       { zh: '雇用店员，自动收益',               en: 'Hire staff for auto income' },
  help_auto_l1:          { zh: '雇用后进度满自动收取，无需手动点击', en: 'Staff auto-collect when the bar fills — no tapping needed' },
  help_auto_l2:          { zh: '关掉游戏也能积累离线收益',         en: 'Earn offline even when the game is closed' },
  help_prestige_title:   { zh: '重置换结晶，永久提升倍率',         en: 'Reset for crystals, boost forever' },
  help_prestige_l1:      { zh: '总收入达到 $1B 后可进行转生',                  en: 'Prestige when total earnings reach $1B' },
  help_prestige_l2:      { zh: '转生获得🌙结晶，结晶越多全局倍率越高',        en: 'Earn 🌙 crystals; more crystals = higher multiplier' },
  help_prestige_l3:      { zh: '排行榜以结晶数量排名',                        en: 'Leaderboard is ranked by crystal count' },
  help_tip:              { zh: '💡 招满所有店员 → 攒到 $1B → 转生！每次都比上次快！', en: '💡 Hire all staff → reach $1B → prestige! Each run gets faster!' },
  help_ok:               { zh: '知道了！', en: 'Got it!' },
}

export function t(key: string): string {
  return strings[key]?.[locale] ?? key
}

/** Pick the correct language lines from a bilingual lines object. */
export function tLines(lines: { zh: string[]; en: string[] }): string[] {
  return lines[locale] ?? lines.zh
}

/** Return the locale-aware name from any object with nameZh / nameEn. */
export function localeName(item: { nameZh: string; nameEn: string }): string {
  return locale === 'en' ? item.nameEn : item.nameZh
}

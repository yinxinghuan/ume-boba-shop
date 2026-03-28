function detectLocale(): 'zh' | 'en' {
  const override = localStorage.getItem('game_locale')
  if (override === 'en' || override === 'zh') return override
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

const locale = detectLocale()

const strings: Record<string, Record<'zh' | 'en', string>> = {
  employ:   { zh: '雇用',  en: 'Employ' },
  research: { zh: '研发',  en: 'Unlock' },
}

export function t(key: string): string {
  return strings[key]?.[locale] ?? key
}

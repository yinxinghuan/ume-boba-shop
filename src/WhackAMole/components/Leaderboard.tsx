import { useCallback, useEffect, useState } from 'react';
import type { LeaderboardEntry } from '../hooks/useGameScore';
import { useLocale } from '../i18n';
import './Leaderboard.less';

interface Props {
  isInAigram: boolean;
  onClose: () => void;
  fetchGlobal: () => Promise<LeaderboardEntry[]>;
  fetchFriends: () => Promise<LeaderboardEntry[]>;
}

type Tab = 'global' | 'friends';
const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ isInAigram, onClose, fetchGlobal, fetchFriends }: Props) {
  const { t } = useLocale();
  const [tab, setTab] = useState<Tab>('global');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async (type: Tab) => {
    setLoading(true);
    setError(false);
    try {
      const data = type === 'global' ? await fetchGlobal() : await fetchFriends();
      setEntries(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [fetchGlobal, fetchFriends]);

  useEffect(() => { load(tab); }, [tab]);

  return (
    <div className="wam-lb__overlay" onPointerDown={onClose}>
      <div className="wam-lb" onPointerDown={e => e.stopPropagation()}>

        <div className="wam-lb__header">
          <span className="wam-lb__title">🏆 {t('lb.title')}</span>
          <button className="wam-lb__close" onPointerDown={onClose}>✕</button>
        </div>

        {isInAigram && (
          <div className="wam-lb__tabs">
            <button
              className={`wam-lb__tab ${tab === 'global' ? 'wam-lb__tab--active' : ''}`}
              onPointerDown={() => setTab('global')}
            >
              {t('lb.global')}
            </button>
            <button
              className={`wam-lb__tab ${tab === 'friends' ? 'wam-lb__tab--active' : ''}`}
              onPointerDown={() => setTab('friends')}
            >
              {t('lb.friends')}
            </button>
          </div>
        )}

        <div className="wam-lb__body">
          {loading && <div className="wam-lb__loading">⏳</div>}
          {!loading && error && <div className="wam-lb__empty">{t('lb.error')}</div>}
          {!loading && !error && entries.length === 0 && (
            <div className="wam-lb__empty">
              {tab === 'friends' ? t('lb.emptyFriends') : t('lb.empty')}
            </div>
          )}
          {!loading && !error && entries.map((entry, i) => (
            <div
              key={entry.telegram_id}
              className={`wam-lb__row ${entry.isMe ? 'wam-lb__row--me' : ''}`}
            >
              <span className="wam-lb__rank">
                {i < 3 ? MEDALS[i] : i + 1}
              </span>
              <div className="wam-lb__avatar">
                {entry.avatar_url
                  ? <img src={entry.avatar_url} alt={entry.name} draggable={false} />
                  : <span>{entry.name.charAt(0).toUpperCase()}</span>
                }
              </div>
              <span className="wam-lb__name">
                {entry.name}
                {entry.isMe && <span className="wam-lb__me-tag"> ({t('lb.me')})</span>}
              </span>
              <span className="wam-lb__score">{entry.score}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

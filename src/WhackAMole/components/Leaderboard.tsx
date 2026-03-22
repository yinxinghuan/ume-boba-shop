import { useCallback, useEffect, useState } from 'react';
import type { LeaderboardEntry } from '../hooks/useGameScore';
import { useLocale } from '../i18n';
import './Leaderboard.less';

interface Props {
  gameName: string;
  isInAigram: boolean;
  onClose: () => void;
  fetchGlobal: () => Promise<LeaderboardEntry[]>;
  fetchFriends: () => Promise<LeaderboardEntry[]>;
}

type Tab = 'global' | 'friends';

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const RANK_LABELS = ['🥇', '🥈', '🥉'];

function Avatar({ url, name, size = 40 }: { url: string; name: string; size?: number }) {
  return (
    <div className="lb-avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {url
        ? <img src={url} alt={name} draggable={false} />
        : <span>{name.charAt(0).toUpperCase()}</span>
      }
    </div>
  );
}

export default function Leaderboard({ gameName, isInAigram, onClose, fetchGlobal, fetchFriends }: Props) {
  const { t } = useLocale();
  const [tab, setTab] = useState<Tab>('global');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (type: Tab) => {
    setLoading(true);
    try {
      const data = type === 'global' ? await fetchGlobal() : await fetchFriends();
      setEntries(data);
    } finally {
      setLoading(false);
    }
  }, [fetchGlobal, fetchFriends]);

  useEffect(() => { load(tab); }, [tab]);

  return (
    <div className="lb-backdrop" onPointerDown={onClose}>
      <div className="lb-panel" onPointerDown={e => e.stopPropagation()}>

        {/* Header */}
        <div className="lb-header">
          <div className="lb-header__left">
            <span className="lb-header__icon">🏆</span>
            <div>
              <div className="lb-header__title">{t('lb.title')}</div>
              <div className="lb-header__game">{gameName}</div>
            </div>
          </div>
          <button className="lb-close" onPointerDown={onClose}>✕</button>
        </div>

        {/* Tabs */}
        {isInAigram && (
          <div className="lb-tabs">
            <button
              className={`lb-tab ${tab === 'global' ? 'lb-tab--active' : ''}`}
              onPointerDown={() => setTab('global')}
            >
              {t('lb.global')}
            </button>
            <button
              className={`lb-tab ${tab === 'friends' ? 'lb-tab--active' : ''}`}
              onPointerDown={() => setTab('friends')}
            >
              {t('lb.friends')}
            </button>
          </div>
        )}

        {/* List */}
        <div className="lb-body">
          {loading && (
            <div className="lb-state">
              <span className="lb-spinner" />
            </div>
          )}

          {!loading && entries.length === 0 && (
            <div className="lb-state">
              <span className="lb-state__icon">🎮</span>
              <span className="lb-state__text">
                {tab === 'friends' ? t('lb.emptyFriends') : t('lb.empty')}
              </span>
            </div>
          )}

          {!loading && entries.map((entry, i) => (
            <div
              key={entry.telegram_id}
              className={`lb-row ${entry.isMe ? 'lb-row--me' : ''} ${i < 3 ? 'lb-row--top' : ''}`}
              style={i < 3 ? { '--rank-color': RANK_COLORS[i] } as React.CSSProperties : undefined}
            >
              {/* Rank */}
              <div className="lb-row__rank">
                {i < 3
                  ? <span className="lb-row__medal">{RANK_LABELS[i]}</span>
                  : <span className="lb-row__num">{i + 1}</span>
                }
              </div>

              {/* Avatar */}
              <Avatar url={entry.avatar_url} name={entry.name} size={i < 3 ? 44 : 38} />

              {/* Name */}
              <div className="lb-row__info">
                <span className="lb-row__name">{entry.name}</span>
                {entry.isMe && <span className="lb-row__me">{t('lb.me')}</span>}
              </div>

              {/* Score */}
              <span className="lb-row__score">{entry.score.toLocaleString()}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

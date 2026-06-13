import { useState, useEffect, useCallback } from 'react';
import { db } from './firebase';
import { ref, onValue, push, set, remove } from 'firebase/database';

// ── Constants ────────────────────────────────────────────────
const MONTHS = [
  'Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'
];
const DAYS = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const COLORS = [
  { label: 'Синий',      value: '#3B82F6' },
  { label: 'Зелёный',    value: '#10B981' },
  { label: 'Красный',    value: '#EF4444' },
  { label: 'Фиолетовый', value: '#8B5CF6' },
  { label: 'Оранжевый',  value: '#F59E0B' },
  { label: 'Розовый',    value: '#EC4899' },
];

// ── Helpers ──────────────────────────────────────────────────
const daysInMonth  = (y, m) => new Date(y, m + 1, 0).getDate();
const firstWeekday = (y, m) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };
const dateKey      = (y, m, d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

// ── App ──────────────────────────────────────────────────────
export default function App() {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [viewDay,    setViewDay]    = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [editEvt,    setEditEvt]    = useState(null);
  const [activeDay,  setActiveDay]  = useState(null);
  const [form, setForm] = useState({ title: '', author: '', time: '', color: COLORS[0].value });
  const [saving, setSaving] = useState(false);

  // ── Firebase listener ──────────────────────────────────────
  useEffect(() => {
    const evRef = ref(db, 'events');
    const unsub = onValue(evRef, snap => {
      const data = snap.val() || {};
      const list = Object.entries(data).map(([id, v]) => ({ id, ...v }));
      setEvents(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ── Navigation ─────────────────────────────────────────────
  const prevMonth = () => { if (month === 0) { setYear(y => y-1); setMonth(11); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y+1); setMonth(0); } else setMonth(m => m+1); };

  // ── Day events ─────────────────────────────────────────────
  const dayEvents = useCallback((day) =>
    events
      .filter(e => e.date === dateKey(year, month, day))
      .sort((a, b) => (a.time || '').localeCompare(b.time || '')),
    [events, year, month]
  );

  // ── Actions ────────────────────────────────────────────────
  const openAdd = (day) => {
    setActiveDay(day);
    setEditEvt(null);
    setForm({ title: '', author: '', time: '', color: COLORS[0].value });
    setViewDay(null);
    setShowForm(true);
  };

  const openEdit = (evt) => {
    setEditEvt(evt);
    setForm({ title: evt.title, author: evt.author, time: evt.time || '', color: evt.color });
    setActiveDay(null);
    setViewDay(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.author.trim()) return;
    setSaving(true);
    try {
      if (editEvt) {
        await set(ref(db, `events/${editEvt.id}`), { ...editEvt, ...form, id: undefined });
      } else {
        await push(ref(db, 'events'), {
          date: dateKey(year, month, activeDay),
          ...form,
        });
      }
      setShowForm(false);
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await remove(ref(db, `events/${id}`));
    setViewDay(null);
  };

  // ── Calendar grid ──────────────────────────────────────────
  const totalDays = daysInMonth(year, month);
  const offset    = firstWeekday(year, month);
  const cells = [
    ...Array(offset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={styles.root}>
      <div style={styles.container}>

        {/* ── Header ── */}
        <div style={styles.header}>
          <div style={styles.headerSub}>Общий календарь</div>
          <div style={styles.headerTitle}>Планируйте вместе</div>
        </div>

        {/* ── Month nav ── */}
        <div style={styles.nav}>
          <button onClick={prevMonth} style={styles.navBtn}>‹</button>
          <span style={styles.navTitle}>{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} style={styles.navBtn}>›</button>
        </div>

        {/* ── Weekday labels ── */}
        <div style={styles.weekRow}>
          {DAYS.map(d => <div key={d} style={styles.weekLabel}>{d}</div>)}
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div style={styles.loading}>Загрузка...</div>
        ) : (
          <div style={styles.grid}>
            {cells.map((day, i) => {
              if (!day) return <div key={`_${i}`} />;
              const evts = dayEvents(day);
              const tod  = isToday(day);
              return (
                <div
                  key={day}
                  onClick={() => openAdd(day)}
                  style={{ ...styles.cell, ...(tod ? styles.cellToday : {}) }}
                >
                  <div style={{ ...styles.dayNum, ...(tod ? styles.dayNumToday : {}) }}>{day}</div>
                  {evts.slice(0, 2).map(ev => (
                    <div
                      key={ev.id}
                      onClick={e => { e.stopPropagation(); setViewDay(day); }}
                      style={{ ...styles.chip, borderLeftColor: ev.color, color: ev.color, background: ev.color + '22' }}
                    >
                      {ev.time ? ev.time + ' ' : ''}{ev.title}
                    </div>
                  ))}
                  {evts.length > 2 && (
                    <div
                      onClick={e => { e.stopPropagation(); setViewDay(day); }}
                      style={styles.more}
                    >+{evts.length - 2}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={styles.hint}>Нажми на день → добавь событие</div>
      </div>

      {/* ── View Day Modal ── */}
      {viewDay && (
        <Overlay onClose={() => setViewDay(null)}>
          <div style={styles.modalTitle}>{viewDay} {MONTHS[month]}</div>
          {dayEvents(viewDay).map(ev => (
            <div key={ev.id} style={{ ...styles.eventCard, borderLeftColor: ev.color }}>
              <div style={styles.eventTop}>
                <div>
                  {ev.time && <span style={{ ...styles.eventTime, color: ev.color }}>{ev.time}</span>}
                  <span style={styles.eventName}>{ev.title}</span>
                  <div style={styles.eventAuthor}>👤 {ev.author}</div>
                </div>
                <div style={styles.eventActions}>
                  <button onClick={() => openEdit(ev)} style={styles.iconBtn}>✏️</button>
                  <button onClick={() => handleDelete(ev.id)} style={{ ...styles.iconBtn, background: '#7F1D1D' }}>🗑</button>
                </div>
              </div>
            </div>
          ))}
          {dayEvents(viewDay).length === 0 && <div style={styles.empty}>Событий нет</div>}
          <button onClick={() => { setViewDay(null); openAdd(viewDay); }} style={{ ...styles.btn, marginTop: 12, width: '100%' }}>
            + Добавить событие
          </button>
        </Overlay>
      )}

      {/* ── Add / Edit Modal ── */}
      {showForm && (
        <Overlay onClose={() => setShowForm(false)}>
          <div style={styles.modalTitle}>
            {editEvt ? 'Редактировать' : `${activeDay} ${MONTHS[month]}`}
          </div>

          <label style={styles.label}>Название *</label>
          <input
            autoFocus
            placeholder="Что за событие?"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            style={styles.input}
          />

          <label style={styles.label}>Ваше имя *</label>
          <input
            placeholder="Кто добавляет?"
            value={form.author}
            onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
            style={styles.input}
          />

          <label style={styles.label}>Время</label>
          <input
            type="time"
            value={form.time}
            onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
            style={{ ...styles.input, width: 130 }}
          />

          <label style={styles.label}>Цвет</label>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {COLORS.map(c => (
              <div
                key={c.value}
                onClick={() => setForm(f => ({ ...f, color: c.value }))}
                style={{
                  width: 30, height: 30, borderRadius: '50%', background: c.value,
                  cursor: 'pointer',
                  border: form.color === c.value ? '3px solid #F1F5F9' : '3px solid transparent',
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleSave}
              disabled={saving || !form.title.trim() || !form.author.trim()}
              style={{ ...styles.btn, flex: 1, opacity: (!form.title.trim() || !form.author.trim()) ? 0.4 : 1 }}
            >
              {saving ? 'Сохранение...' : editEvt ? 'Сохранить' : 'Добавить'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ ...styles.btn, flex: 1, background: '#1E293B' }}>
              Отмена
            </button>
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ── Overlay ──────────────────────────────────────────────────
function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={styles.overlay}>
      <div onClick={e => e.stopPropagation()} style={styles.modal}>
        {children}
      </div>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────
const styles = {
  root: { background: '#0F172A', minHeight: '100dvh', color: '#E2E8F0', paddingBottom: 40 },
  container: { maxWidth: 480, margin: '0 auto', padding: '28px 14px 0' },

  header: { textAlign: 'center', marginBottom: 24 },
  headerSub: { fontSize: 11, letterSpacing: 3, color: '#475569', textTransform: 'uppercase', marginBottom: 4 },
  headerTitle: { fontSize: 26, fontWeight: 700, color: '#F1F5F9' },

  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  navBtn: { background: '#1E293B', border: 'none', color: '#94A3B8', fontSize: 24, width: 44, height: 44, borderRadius: 10, cursor: 'pointer' },
  navTitle: { fontSize: 20, fontWeight: 600, color: '#F1F5F9' },

  weekRow: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 3 },
  weekLabel: { textAlign: 'center', fontSize: 10, color: '#475569', fontWeight: 600, letterSpacing: 1, paddingBottom: 4 },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 },
  cell: {
    background: '#1E293B', borderRadius: 8, minHeight: 64, padding: '7px 5px 5px',
    cursor: 'pointer', border: '1.5px solid transparent', transition: 'border-color .15s',
  },
  cellToday: { background: '#1E3A5F', border: '1.5px solid #3B82F6' },
  dayNum: { fontSize: 12, fontWeight: 500, color: '#94A3B8', marginBottom: 3 },
  dayNumToday: { color: '#60A5FA', fontWeight: 700 },
  chip: {
    borderLeft: '2px solid', borderRadius: 3, padding: '1px 3px',
    fontSize: 9, marginBottom: 2, overflow: 'hidden', whiteSpace: 'nowrap',
    textOverflow: 'ellipsis', cursor: 'pointer',
  },
  more: { fontSize: 9, color: '#64748B', cursor: 'pointer' },
  hint: { textAlign: 'center', marginTop: 14, fontSize: 11, color: '#334155' },
  loading: { textAlign: 'center', padding: 60, color: '#475569' },

  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50,
  },
  modal: {
    background: '#1E293B', borderRadius: '20px 20px 0 0',
    padding: '24px 20px 36px', width: '100%', maxWidth: 480,
    maxHeight: '85dvh', overflowY: 'auto',
  },
  modalTitle: { fontSize: 17, fontWeight: 700, color: '#F1F5F9', marginBottom: 16 },

  eventCard: {
    background: '#0F172A', borderRadius: 8, padding: '10px 12px',
    marginBottom: 8, borderLeft: '3px solid',
  },
  eventTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  eventTime: { fontSize: 11, marginRight: 6 },
  eventName: { fontSize: 14, fontWeight: 600, color: '#F1F5F9' },
  eventAuthor: { fontSize: 11, color: '#64748B', marginTop: 2 },
  eventActions: { display: 'flex', gap: 6 },
  iconBtn: { background: '#1E293B', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 13 },

  empty: { color: '#64748B', fontSize: 14, marginBottom: 8 },

  label: { display: 'block', fontSize: 11, color: '#64748B', marginBottom: 6, letterSpacing: .5 },
  input: {
    width: '100%', boxSizing: 'border-box', background: '#0F172A',
    border: '1px solid #334155', borderRadius: 8, padding: '11px 12px',
    color: '#F1F5F9', fontSize: 15, marginBottom: 14, outline: 'none',
  },
  btn: {
    background: '#3B82F6', color: '#fff', border: 'none',
    borderRadius: 10, padding: '12px 16px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
  },
};

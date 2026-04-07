import { api } from '../api';
import { getCurrentUserId, setCurrentUserId } from '../session';
import { useAsync } from '../useAsync';

export function UserSwitcher() {
  const { data: users } = useAsync(() => api.users(), []);
  return (
    <label className="user-switcher">
      Signed in as{' '}
      <select
        aria-label="Signed in as"
        value={getCurrentUserId()}
        onChange={(e) => setCurrentUserId(Number(e.target.value))}
      >
        {(users ?? []).map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.role}, {u.department})
          </option>
        ))}
      </select>
    </label>
  );
}

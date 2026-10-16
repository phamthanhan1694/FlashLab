import { fetchRead } from './http';
import {
  snapshotSchema,
  stateSchema,
  type AppData,
  type Snapshot,
} from '@flashlab/shared';

interface Cache extends Snapshot {
  pending: boolean;
  base?: AppData | null;
}
// Arrays are atomic: never guess how to combine edited/deleted cards or sessions.
function reconcile(base: unknown, local: unknown, remote: unknown): unknown {
  const same = (a: unknown, b: unknown) =>
    JSON.stringify(a) === JSON.stringify(b);
  if (same(local, remote) || same(base, remote)) return local;
  if (same(base, local)) return remote;
  const object = (v: unknown): v is Record<string, unknown> =>
    v !== null && typeof v === 'object' && !Array.isArray(v);
  if (!object(base) || !object(local) || !object(remote))
    throw new Error('conflict');
  const result: Record<string, unknown> = {};
  for (const key of new Set([
    ...Object.keys(base),
    ...Object.keys(local),
    ...Object.keys(remote),
  ])) {
    const value = reconcile(base[key], local[key], remote[key]);
    if (value !== undefined) result[key] = value;
  }
  return result;
}
export class StateSync {
  onReconcile?: (data: AppData) => void;
  private revision = 0;
  private confirmed: AppData | null = null;
  private sentStates: AppData[] = [];
  private lastFailure = '';
  private same(a: AppData | null, b: AppData | null) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  private activeSave: Promise<void> | undefined;
  private pending: AppData | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private saving = false;
  private conflict = false;
  private pulling = false;
  private readonly cacheKey: string;
  private readonly endpoint: string;
  constructor(
    private status: (message: string, error?: boolean) => void,
    profileId = 'default',
  ) {
    this.cacheKey =
      profileId === 'default'
        ? 'flashlab.server.v1'
        : `flashlab.server.v1.${profileId}`;
    this.endpoint =
      profileId === 'default'
        ? '/api/state'
        : `/api/profiles/${encodeURIComponent(profileId)}/state`;
  }

  private cache(data: AppData, pending: boolean) {
    try {
      localStorage.setItem(
        this.cacheKey,
        JSON.stringify({
          revision: this.revision,
          data,
          pending,
          base: this.confirmed,
        }),
      );
    } catch {
      this.status(
        'Không lưu được bộ nhớ trình duyệt. Hãy kiểm tra dung lượng lưu trữ.',
        true,
      );
    }
  }
  async initialize(fallback: AppData): Promise<AppData> {
    let cached: Cache | undefined;
    try {
      const raw: unknown = JSON.parse(
        localStorage.getItem(this.cacheKey) ?? 'null',
      );
      const snapshot = snapshotSchema.safeParse(raw);
      if (snapshot.success && snapshot.data.data) {
        cached = {
          ...snapshot.data,
          base:
            typeof raw === 'object' && raw !== null && 'base' in raw
              ? (stateSchema.safeParse(raw.base).data ?? null)
              : null,
          pending:
            typeof raw === 'object' &&
            raw !== null &&
            'pending' in raw &&
            raw.pending === true,
        };
        this.revision = cached.revision;
      }
    } catch {
      /* Legacy data remains available. */
    }
    let local = cached?.data ?? fallback;
    this.confirmed = cached?.base ?? null;
    try {
      const response = await fetchRead(this.endpoint);
      if (!response.ok) throw new Error('Không đọc được dữ liệu máy chủ');
      const remote = snapshotSchema.parse(await response.json());
      if (
        cached?.pending &&
        cached.revision !== remote.revision &&
        !this.same(local, remote.data)
      ) {
        const merged = this.merge(cached.base ?? null, local, remote.data);
        if (merged) {
          local = merged;
        } else {
          this.conflict = true;
          this.lastFailure =
            'Bản trên trình duyệt và máy chủ khác nhau. Thay đổi chưa lưu được giữ lại. Mở Cài đặt → Xử lý đồng bộ để tiếp tục.';
          this.pending = local;
          this.status(
            'Xung đột dữ liệu · thay đổi của bạn đang được giữ trên trình duyệt.',
            true,
          );
          return local;
        }
      }
      this.confirmed = remote.data ? structuredClone(remote.data) : null;
      this.revision = remote.revision;
      if (
        (cached?.pending && !this.same(local, remote.data)) ||
        remote.data === null
      ) {
        this.schedule(local);
        return local;
      }
      this.cache(remote.data, false);
      this.status('Đã đồng bộ');
      return remote.data;
    } catch {
      this.pending = local;
      this.status('Chưa kết nối máy chủ · lưu tạm trên trình duyệt', true);
      this.cache(local, true);
      return local;
    }
  }
  private merge(
    base: AppData | null,
    local: AppData,
    remote: AppData | null,
  ): AppData | null {
    if (!base || !remote) return null;
    try {
      return stateSchema.parse(reconcile(base, local, remote));
    } catch {
      return null;
    }
  }
  schedule(data: AppData) {
    this.pending = stateSchema.parse(structuredClone(data));
    this.cache(this.pending, true);
    if (this.conflict) return;
    this.status('Đang lưu…');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      void this.flush();
    }, 250);
  }
  async flush(): Promise<void> {
    clearTimeout(this.timer);
    if (this.activeSave) {
      await this.activeSave;
      // A change can arrive just as the preceding request finishes.
      if (this.pending && !this.conflict && !this.pulling) await this.flush();
      return;
    }
    const save = this.flushCurrent();
    this.activeSave = save;
    try {
      await save;
    } finally {
      if (this.activeSave === save) this.activeSave = undefined;
    }
  }
  private async flushCurrent() {
    if (this.saving || this.pulling || this.conflict || !this.pending) return;
    this.saving = true;
    let current = this.pending;
    try {
      const write = () => {
        if (!this.sentStates.some((sent) => this.same(sent, current)))
          this.sentStates = [...this.sentStates.slice(-2), current];
        return fetch(this.endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ revision: this.revision, data: current }),
          signal: AbortSignal.timeout(10000),
        });
      };
      let response = await write();
      let next: Snapshot | undefined;
      if (response.status === 409) {
        // An earlier write may have succeeded although its response was lost.
        const check = await fetchRead(this.endpoint);
        if (!check.ok)
          throw new Error(
            'Không xác minh được trạng thái lưu. Thay đổi vẫn được giữ trên trình duyệt.',
          );
        const remote = snapshotSchema.parse(await check.json());
        if (this.same(remote.data, current)) next = remote;
        else if (
          this.same(remote.data, this.confirmed) ||
          this.sentStates.some((sent) => this.same(sent, remote.data))
        ) {
          this.revision = remote.revision;
          response = await write();
        } else {
          const merged = this.merge(
            this.confirmed,
            this.pending ?? current,
            remote.data,
          );
          if (!merged) {
            this.conflict = true;
            throw new Error(
              'Bản trên trình duyệt và máy chủ khác nhau. Thay đổi chưa lưu được giữ lại. Mở Cài đặt → Xử lý đồng bộ để tiếp tục.',
            );
          }
          this.confirmed = remote.data ? structuredClone(remote.data) : null;
          this.revision = remote.revision;
          current = merged;
          this.pending = merged;
          this.cache(merged, true);
          this.onReconcile?.(structuredClone(merged));
          response = await write();
        }
      }
      if (!next) {
        if (response.status === 409) {
          this.conflict = true;
          throw new Error(
            'Dữ liệu máy chủ vừa thay đổi tiếp. Thay đổi chưa lưu được giữ lại. Mở Cài đặt → Xử lý đồng bộ để tiếp tục.',
          );
        }
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
            issues?: { message?: string; path?: (string | number)[] }[];
          } | null;
          const issue = body?.issues?.find((issue) =>
            issue.message?.includes('bị trùng'),
          )?.message;
          throw new Error(
            issue ??
              (response.status === 400
                ? body?.issues?.some((issue) => issue.path?.includes('avatar'))
                  ? 'Máy chủ chưa hỗ trợ avatar này. Hãy khởi động lại ứng dụng sau khi cập nhật.'
                  : 'Máy chủ không chấp nhận dữ liệu. Các thay đổi vẫn được giữ trên trình duyệt.'
                : `Không lưu được dữ liệu (mã ${response.status}). Thay đổi vẫn được giữ trên trình duyệt.`),
          );
        }
        next = snapshotSchema.parse(await response.json());
      }
      this.confirmed = next.data ? structuredClone(next.data) : null;
      this.lastFailure = '';
      this.sentStates = [];
      this.revision = next.revision;
      if (this.pending === current) this.pending = null;
      this.cache(this.pending ?? current, this.pending !== null);
      this.status(this.pending ? 'Đang lưu…' : 'Đã đồng bộ');
    } catch (error) {
      this.lastFailure =
        error instanceof Error &&
        ['TimeoutError', 'AbortError'].includes(error.name)
          ? 'Máy chủ phản hồi quá lâu. Thay đổi vẫn được giữ trên trình duyệt.'
          : error instanceof Error && error.name !== 'TypeError'
            ? error.message
            : 'Không kết nối được máy chủ. Thay đổi vẫn được giữ trên trình duyệt.';
      this.status(this.lastFailure, true);
      return;
    } finally {
      this.saving = false;
    }
    if (this.pending) await this.flushCurrent();
  }
  async useServer(): Promise<AppData> {
    if (this.saving) throw new Error('Đang lưu dữ liệu. Hãy thử lại sau.');
    this.pulling = true;
    try {
      const response = await fetchRead(this.endpoint);
      if (!response.ok) throw new Error('Không đọc được máy chủ');
      const remote = snapshotSchema.parse(await response.json());
      if (!remote.data) throw new Error('Máy chủ chưa có dữ liệu');
      this.revision = remote.revision;
      this.pending = null;
      this.conflict = false;
      this.confirmed = structuredClone(remote.data);
      this.sentStates = [];
      this.lastFailure = '';
      this.cache(remote.data, false);
      this.status('Đã đồng bộ');
      return remote.data;
    } finally {
      this.pulling = false;
    }
  }
  accept(snapshot: Snapshot) {
    if (!snapshot.data) throw new Error('Bản khôi phục không có dữ liệu.');
    clearTimeout(this.timer);
    this.revision = snapshot.revision;
    this.confirmed = structuredClone(snapshot.data);
    this.sentStates = [];
    this.lastFailure = '';
    this.pending = null;
    this.conflict = false;
    this.cache(snapshot.data, false);
    this.status('Đã đồng bộ');
  }
  get hasConflict() {
    return this.conflict;
  }
  get pendingMessage() {
    return (
      this.lastFailure || 'Dữ liệu đang chờ lưu. Hãy thử lại sau giây lát.'
    );
  }
  get hasPending() {
    return this.pending !== null;
  }
}

import { askConfirmation } from '../../ui/feedback';

export function installStudyExitGuard(options: {
  active: () => { mode: string } | null;
  leave: () => void;
  navigate?: () => void;
}) {
  let currentHash = location.hash;
  let pending: Promise<boolean> | undefined;
  const confirm = (): Promise<boolean> => {
    const session = options.active();
    if (!session) return Promise.resolve(true);
    if (pending) return pending;
    pending = askConfirmation(
      session.mode === 'test'
        ? 'Bài kiểm tra chưa nộp. Nếu rời đi, các đáp án đang làm sẽ không được giữ lại. Bạn có muốn thoát?'
        : 'Phiên học chưa hoàn thành. Nếu rời đi, bạn sẽ kết thúc phiên học hiện tại. Bạn có muốn thoát?',
      {
        title:
          session.mode === 'test' ? 'Thoát bài kiểm tra?' : 'Thoát phiên học?',
        confirmLabel: 'Thoát phiên',
        cancelLabel: 'Tiếp tục học',
      },
    ).finally(() => {
      pending = undefined;
    });
    return pending;
  };
  const onHashChange = (event: HashChangeEvent) => {
    const target = location.hash;
    if (pending && target === currentHash) {
      event.stopImmediatePropagation();
      return;
    }
    if (!options.active() || target === currentHash) {
      currentHash = target;
      options.navigate?.();
      currentHash = location.hash;
      return;
    }
    // Restore the URL before any page handler runs, keeping the session intact.
    event.stopImmediatePropagation();
    history.replaceState(null, '', currentHash || '#/');
    if (pending) return;
    void confirm().then((accepted) => {
      if (!accepted) return;
      options.leave();
      location.hash = target;
    });
  };
  const onBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!options.active()) return;
    event.preventDefault();
    event.returnValue = '';
  };
  window.addEventListener('hashchange', onHashChange, { capture: true });
  window.addEventListener('beforeunload', onBeforeUnload);
  return {
    confirm,
    dispose() {
      window.removeEventListener('hashchange', onHashChange, true);
      window.removeEventListener('beforeunload', onBeforeUnload);
    },
  };
}

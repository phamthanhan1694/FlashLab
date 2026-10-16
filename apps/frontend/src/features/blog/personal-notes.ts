import {
  personalNoteSchema,
  type PersonalNote,
  type Profile,
} from '@flashlab/shared';

/** The editor shares its UI with articles; personal content only goes through profile state sync. */
export function personalNoteRequests(
  profile: Profile,
  list: () => PersonalNote[],
  commit: (notes: PersonalNote[]) => Promise<void>,
) {
  return async (url: string, options?: RequestInit): Promise<Response> => {
    const json = (value: unknown, status = 200) =>
      new Response(JSON.stringify(value), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    const notes = list();
    if (!options?.method || options.method === 'GET')
      return json(notes.map((note) => ({ ...note, ownerId: profile.id })));
    try {
      const body = JSON.parse(String(options.body));
      const id = options.method === 'POST' ? body.id : url.split('/').at(-1);
      const previous = notes.find((note) => note.id === id);
      if (options.method !== 'POST' && !previous)
        return json({ error: 'Không tìm thấy ghi chú.' }, 404);
      if (
        previous &&
        options.method !== 'POST' &&
        previous.revision !== body.revision
      )
        return json(
          { error: 'Ghi chú đã thay đổi. Hãy tải lại trước khi sửa.' },
          409,
        );
      if (options.method === 'DELETE') {
        await commit(notes.filter((note) => note.id !== id));
        return new Response(null, { status: 204 });
      }
      const parsed = personalNoteSchema.safeParse({
        id,
        ownerId: profile.id,
        author: body.author ?? previous?.author ?? profile.name,
        title: body.title,
        markdown: body.markdown,
        revision: (previous?.revision ?? 0) + 1,
        created: previous?.created ?? Date.now(),
        updated: Date.now(),
      });
      if (!parsed.success)
        return json(
          { error: 'Ghi chú cần tiêu đề và nội dung, tối đa 200.000 ký tự.' },
          400,
        );
      const next = [parsed.data, ...notes.filter((note) => note.id !== id)];
      if (
        next.length > 500 ||
        next.reduce((size, note) => size + note.markdown.length, 0) > 5000000
      )
        return json(
          { error: 'Tối đa 500 ghi chú và 5.000.000 ký tự nội dung.' },
          400,
        );
      await commit(next);
      return json(parsed.data);
    } catch (error) {
      return json(
        {
          error:
            error instanceof Error ? error.message : 'Không lưu được ghi chú.',
        },
        503,
      );
    }
  };
}

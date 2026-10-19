import { codeBlockToolbar } from './code-block';
import { translateText } from '../../core/i18n';

export type DiagramLanguage = 'mermaid' | 'plantuml';
let serial = 0;
let queue: Promise<unknown> = Promise.resolve();
const cache = new Map<string, Promise<string>>();
const scripts = new Map<string, Promise<void>>();
function loadScript(url: string) {
  if (!scripts.has(url))
    scripts.set(
      url,
      new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => {
          scripts.delete(url);
          reject(Error('Không tải được bộ vẽ sơ đồ.'));
        };
        document.head.append(script);
      }),
    );
  return scripts.get(url)!;
}
export async function renderDiagram(
  language: DiagramLanguage,
  source: string,
  dark = false,
): Promise<string> {
  if (source.length > 20000)
    throw Error('Sơ đồ quá dài (tối đa 20.000 ký tự).');
  const key = JSON.stringify([language, source, dark]);
  const cached = cache.get(key);
  if (cached) return cached;
  const result = queue.then(async () => {
    if (language === 'mermaid') {
      const { default: mermaid } = await import('mermaid');
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: dark ? 'dark' : 'default',
        themeVariables: dark
          ? {
              darkMode: true,
              background: '#101724',
              primaryColor: '#24344d',
              mainBkg: '#24344d',
              nodeBkg: '#24344d',
              labelTextColor: '#edf2fa',
              labelBackground: '#172233',
              labelBoxBkgColor: '#24344d',
              primaryBorderColor: '#91a4c2',
              primaryTextColor: '#edf2fa',
              secondaryColor: '#1b3540',
              secondaryTextColor: '#edf2fa',
              tertiaryColor: '#302b48',
              tertiaryTextColor: '#edf2fa',
              textColor: '#edf2fa',
              nodeTextColor: '#edf2fa',
              titleColor: '#edf2fa',
              lineColor: '#b0bfd4',
              edgeLabelBackground: '#172233',
              clusterBkg: '#172233',
              clusterBorder: '#91a4c2',
              noteBkgColor: '#24344d',
              noteTextColor: '#edf2fa',
              actorBkg: '#24344d',
              actorTextColor: '#edf2fa',
              signalColor: '#edf2fa',
              signalTextColor: '#edf2fa',
            }
          : undefined,
        maxTextSize: 20000,
        maxEdges: 1000,
        suppressErrorRendering: true,
        flowchart: { htmlLabels: false },
      });
      const container = document.createElement('div');
      container.setAttribute('data-user-content', '');
      Object.assign(container.style, {
        position: 'fixed',
        left: '-100000px',
        top: '0',
        visibility: 'hidden',
      });
      document.body.append(container);
      try {
        return (
          await mermaid.render(
            `flashlab-diagram-${++serial}`,
            source,
            container,
          )
        ).svg;
      } finally {
        container.remove();
      }
    }
    // Render locally. Remote includes and scripts are not needed for blog diagrams.
    if (/^\s*!include(?:url|_once|_many)?\b/im.test(source))
      throw Error(
        'Sơ đồ dùng !include chưa được hỗ trợ. Hãy viết nội dung sơ đồ trực tiếp.',
      );
    const { default: vizUrl } =
      await import('@plantuml/core/viz-global.js?url');
    await loadScript(vizUrl);
    const { default: themesUrl } = await import('@plantuml/core/themes.js?url');
    await loadScript(themesUrl);
    const { default: engineUrl } =
      await import('@plantuml/core/plantuml.js?url');
    const engine = (await import(
      /* @vite-ignore */ engineUrl
    )) as typeof import('@plantuml/core');
    const host = globalThis as typeof globalThis & {
      PLANTUML_STDLIB_LOADER?: (
        bundle: string,
        ok: () => void,
        fail: (message: string) => void,
      ) => boolean;
    };
    host.PLANTUML_STDLIB_LOADER = (_bundle, _ok, fail) => {
      fail('External includes are disabled');
      return true;
    };
    const text = /^\s*@start\w+/m.test(source)
      ? source
      : `@startuml\n${source}\n@enduml`;
    return new Promise<string>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(Error('Vẽ sơ đồ mất quá nhiều thời gian.')),
        20000,
      );
      engine.renderToString(
        text.split(/\r?\n/),
        (svg: string) => {
          clearTimeout(timer);
          resolve(svg);
        },
        (message: string) => {
          clearTimeout(timer);
          reject(Error(message));
        },
        { dark },
      );
    });
  });
  queue = result.catch(() => undefined);
  cache.set(key, result);
  if (cache.size > 20) cache.delete(cache.keys().next().value!);
  void result.catch(() => cache.delete(key));
  return result;
}

interface MountedDiagram {
  figure: HTMLElement;
  dark: boolean;
  draw: (dark: boolean) => void;
  dispose: () => void;
}
const watchers = new WeakMap<Document, Set<MountedDiagram>>();
function watchDiagramTheme(document: Document, mounted: MountedDiagram) {
  let diagrams = watchers.get(document);
  if (!diagrams) {
    diagrams = new Set();
    watchers.set(document, diagrams);
    const active = diagrams;
    const observer = new MutationObserver(() => {
      const dark = document.documentElement.dataset.theme === 'dark';
      for (const diagram of active) {
        if (!diagram.figure.isConnected) {
          diagram.dispose();
          active.delete(diagram);
        } else if (diagram.dark !== dark) {
          diagram.dark = dark;
          diagram.draw(dark);
        }
      }
      if (!active.size) {
        observer.disconnect();
        watchers.delete(document);
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
      childList: true,
      subtree: true,
    });
  }
  diagrams.add(mounted);
}

export function mountDiagram(
  pre: HTMLPreElement,
  code: HTMLElement,
  language: DiagramLanguage,
  renderer = renderDiagram,
) {
  const source = code.textContent ?? '';
  const figure = document.createElement('figure');
  figure.className = 'markdown-diagram';
  const title = document.createElement('figcaption');
  const languageName = language === 'mermaid' ? 'Mermaid' : 'PlantUML';
  title.append(codeBlockToolbar(languageName, source));
  const output = document.createElement('div');
  output.className = 'markdown-diagram-output';
  output.dataset.markdownUiSource = 'Đang vẽ sơ đồ…';
  output.textContent = translateText('Đang vẽ sơ đồ…');
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  summary.dataset.markdownUiSource = 'Mã sơ đồ';
  summary.textContent = translateText('Mã sơ đồ');
  details.append(summary);
  pre.replaceWith(figure);
  details.append(pre);
  figure.append(title, output, details);
  let generation = 0;
  let imageUrl: string | undefined;
  const releaseImage = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    imageUrl = undefined;
  };
  const draw = (dark: boolean) => {
    const current = ++generation;
    releaseImage();
    output.dataset.diagramTheme = dark ? 'dark' : 'light';
    output.classList.remove('diagram-error');
    output.dataset.markdownUiSource = 'Đang vẽ sơ đồ…';
    output.textContent = translateText('Đang vẽ sơ đồ…');
    void renderer(language, source, dark)
      .then((svg) => {
        if (!figure.isConnected || current !== generation) return;
        const image = document.createElement('img');
        const url = URL.createObjectURL(
          new Blob([svg], { type: 'image/svg+xml' }),
        );
        imageUrl = url;
        image.alt = languageName;
        image.onload = image.onerror = () => {
          URL.revokeObjectURL(url);
          if (imageUrl === url) imageUrl = undefined;
        };
        image.src = url;
        delete output.dataset.markdownUiSource;
        output.replaceChildren(image);
      })
      .catch((error) => {
        if (!figure.isConnected || current !== generation) return;
        output.classList.add('diagram-error');
        delete output.dataset.markdownUiSource;
        const message = document.createElement('span');
        message.dataset.markdownUiSource =
          'Không vẽ được sơ đồ. Kiểm tra cú pháp bên dưới.';
        message.textContent = translateText(message.dataset.markdownUiSource);
        const detail = document.createElement('span');
        detail.textContent =
          ' ' + (error instanceof Error ? error.message : '');
        output.replaceChildren(message, detail);
        details.open = true;
      });
  };
  const dark = document.documentElement.dataset.theme === 'dark';
  watchDiagramTheme(document, {
    figure,
    dark,
    draw,
    dispose: () => {
      generation++;
      releaseImage();
    },
  });
  draw(dark);
}

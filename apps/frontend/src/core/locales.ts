import { referenceLocales } from './docs-reference-copy';
/** English message → Korean, Simplified Chinese, Japanese. Keep parameter tokens unchanged. */
export const localeMessages: Record<string, readonly [string, string, string]> =
  {
    ...referenceLocales,
    'Interface language': ['화면 언어', '界面语言', '表示言語'],
    Learn: ['학습', '学习', '学習'],
    correct: ['정답', '正确', '正解'],
    Review: ['복습', '复习', '復習'],
    'View session details: {{0}}': [
      '세션 상세: {{0}}',
      '查看学习详情：{{0}}',
      'セッションの詳細：{{0}}',
    ],
    Start: ['시작', '开始', '開始'],
    'Getting started': ['시작하기', '快速入门', 'はじめに'],
    'Import and export cards': [
      '카드 가져오기 및 내보내기',
      '导入和导出卡片',
      'カードのインポートとエクスポート',
    ],
    'Backup and storage': [
      '백업 및 저장소',
      '备份与存储',
      'バックアップと保存',
    ],
    'Open documentation in Docs': [
      'Docs에서 문서 열기',
      '在 Docs 中打开文档',
      'Docs で説明を開く',
    ],
    'Open documentation in Docs →': [
      'Docs에서 문서 열기 →',
      '在 Docs 中打开文档 →',
      'Docs で説明を開く →',
    ],
    'MCP connection guide →': [
      'MCP 연결 안내 →',
      'MCP 连接指南 →',
      'MCP 接続ガイド →',
    ],
    'Documentation contents': ['문서 목차', '文档目录', 'ドキュメントの目次'],
    'Learn how to study, manage your data and connect AI with FlashLab.': [
      'FlashLab 학습 방법, 데이터 관리 및 AI 연결 방법을 알아보세요.',
      '了解如何使用 FlashLab 学习、管理数据及连接 AI。',
      'FlashLab での学習、データ管理、AI 連携の方法を紹介します。',
    ],
    'Select or create a profile. Study sets, progress and settings are stored separately for each person.':
      [
        '프로필을 선택하거나 만드세요. 학습 세트, 학습 진도 및 설정은 사용자별로 따로 저장됩니다.',
        '选择或创建个人资料。每位用户的学习集、进度和设置单独保存。',
        'プロフィールを選択または作成します。学習セット、進捗、設定はユーザーごとに保存されます。',
      ],
    'Create a study set in the Library, then add cards manually or import text, CSV or Excel.':
      [
        '라이브러리에서 학습 세트를 만든 후 카드를 직접 추가하거나 텍스트, CSV, Excel을 가져오세요.',
        '在学习库中创建学习集，然后手动添加卡片，或导入文本、CSV、Excel。',
        'ライブラリで学習セットを作成し、カードを手動で追加するか、テキスト、CSV、Excel を読み込みます。',
      ],
    'Choose a study mode. FlashLab automatically saves your changes and learning progress.':
      [
        '학습 모드를 선택하세요. FlashLab이 변경 사항과 학습 진도를 자동으로 저장합니다.',
        '选择学习模式。FlashLab 会自动保存更改和学习进度。',
        '学習モードを選択します。変更内容と学習の進捗は自動保存されます。',
      ],
    'Before moving to another computer, back up the SQLite database in Settings and restore it on the new computer.':
      [
        '다른 컴퓨터로 옮기기 전에 설정에서 SQLite 데이터베이스를 백업하고 새 컴퓨터에서 복원하세요.',
        '更换电脑前，请在设置中备份 SQLite 数据库，再在新电脑上恢复。',
        '別のパソコンへ移行する前に、設定で SQLite データベースをバックアップし、新しいパソコンで復元します。',
      ],
    'On the first desktop launch, you can choose a data folder. The current location is shown under Backup and storage below.':
      [
        '데스크톱 앱을 처음 실행할 때 데이터 폴더를 선택할 수 있습니다. 현재 위치는 아래 백업 및 저장소에 표시됩니다.',
        '首次打开桌面版时可以选择数据文件夹。当前位置显示在下方的备份与存储中。',
        'デスクトップ版の初回起動時にデータフォルダーを選択できます。現在の保存先は下のバックアップと保存に表示されます。',
      ],
    'MCP lets Claude Desktop, Codex and compatible AI apps read, search and manage FlashLab cards on the same computer.':
      [
        'MCP를 통해 같은 컴퓨터의 Claude Desktop, Codex 및 호환 AI 앱이 FlashLab 카드를 읽고 검색하고 관리할 수 있습니다.',
        'MCP 允许同一电脑上的 Claude Desktop、Codex 及兼容 AI 应用读取、搜索和管理 FlashLab 卡片。',
        'MCP を使うと、同じパソコン上の Claude Desktop、Codex などの対応 AI アプリで FlashLab のカードを閲覧、検索、管理できます。',
      ],
    'Connection steps': ['연결 순서', '连接步骤', '接続手順'],
    'Open FlashLab and select the profile you want the AI to access.': [
      'FlashLab을 열고 AI에 접근을 허용할 프로필을 선택하세요.',
      '打开 FlashLab，选择允许 AI 访问的个人资料。',
      'FlashLab を開き、AI にアクセスを許可するプロフィールを選択します。',
    ],
    'Go to Settings → Connect AI via MCP. Choose Read only or Read and edit cards and study sets.':
      [
        '설정 → MCP로 AI 연결에서 읽기 전용 또는 카드와 학습 세트 읽기 및 편집을 선택하세요.',
        '进入设置 → 通过 MCP 连接 AI，选择只读或读取和编辑卡片及学习集。',
        '設定 → MCP で AI に接続を開き、読み取り専用またはカードと学習セットの読み取りと編集を選択します。',
      ],
    'Choose Claude Desktop / JSON or Codex / TOML, then generate and copy the connection configuration.':
      [
        'Claude Desktop / JSON 또는 Codex / TOML을 선택한 다음 연결 설정을 생성하고 복사하세요.',
        '选择 Claude Desktop / JSON 或 Codex / TOML，然后生成并复制连接配置。',
        'Claude Desktop / JSON または Codex / TOML を選び、接続設定を生成してコピーします。',
      ],
    'Paste the configuration into the AI app on the same computer, keeping any existing MCP servers. Restart the MCP connection.':
      [
        '같은 컴퓨터의 AI 앱에 설정을 붙여 넣으세요. 기존 MCP 서버 설정은 유지하고 MCP 연결을 다시 시작하세요.',
        '将配置粘贴到同一电脑上的 AI 应用中，保留已有的 MCP 服务器，然后重新连接。',
        '同じパソコンの AI アプリに設定を貼り付けます。既存の MCP サーバー設定は残し、接続を再起動してください。',
      ],
    'In Claude Desktop, open Settings → Developer → Edit Config. Merge the flashlab entry from the JSON configuration into the existing mcpServers object, save the file and restart Claude Desktop.':
      [
        'Claude Desktop에서 Settings → Developer → Edit Config를 여세요. JSON 설정의 flashlab 항목을 기존 mcpServers에 추가한 후 파일을 저장하고 Claude Desktop을 다시 시작하세요.',
        '在 Claude Desktop 中打开 Settings → Developer → Edit Config。将 JSON 配置中的 flashlab 项合并到已有的 mcpServers，保存文件并重启 Claude Desktop。',
        'Claude Desktop で Settings → Developer → Edit Config を開きます。JSON 設定の flashlab 項目を既存の mcpServers に追加し、ファイルを保存して Claude Desktop を再起動します。',
      ],
    'Choose the TOML format in FlashLab. Add or update mcp_servers.flashlab in the Codex configuration file, then restart the connection.':
      [
        'FlashLab에서 TOML 형식을 선택하세요. Codex 설정 파일의 mcp_servers.flashlab을 추가하거나 수정한 후 다시 연결하세요.',
        '在 FlashLab 中选择 TOML 格式，在 Codex 配置文件中添加或更新 mcp_servers.flashlab，然后重新连接。',
        'FlashLab で TOML 形式を選択します。Codex の設定ファイルに mcp_servers.flashlab を追加または更新し、再接続してください。',
      ],
    'Permissions and scope': [
      '권한 및 접근 범위',
      '权限与访问范围',
      '権限とアクセス範囲',
    ],
    'Each connection can access only the selected profile. Read only is the default; read and edit permission allows creating, editing and deleting cards and study sets.':
      [
        '각 연결은 선택한 프로필에만 접근할 수 있습니다. 기본값은 읽기 전용이며, 편집 권한을 주면 카드와 학습 세트를 생성, 편집, 삭제할 수 있습니다.',
        '每个连接只能访问选定的个人资料。默认为只读；读写权限允许创建、编辑和删除卡片及学习集。',
        '接続ごとに選択したプロフィールだけにアクセスできます。既定は読み取り専用です。編集を許可すると、カードと学習セットの作成、編集、削除が可能になります。',
      ],
    'To change or revoke access, update or remove the FlashLab configuration in the AI app, then disconnect and reconnect. Changing the selection in FlashLab only generates a new configuration.':
      [
        '권한을 변경하거나 해제하려면 AI 앱에서 FlashLab 설정을 수정하거나 삭제한 후 연결을 끊고 다시 연결하세요. FlashLab에서 선택을 바꾸는 것은 새 설정을 생성할 뿐입니다.',
        '要更改或撤销权限，请在 AI 应用中更新或删除 FlashLab 配置，然后断开并重新连接。FlashLab 中的选项只用于生成新配置。',
        '権限を変更または取り消すには、AI アプリ内の FlashLab 設定を更新または削除し、切断して再接続します。FlashLab での選択変更は新しい設定の生成にのみ反映されます。',
      ],
    'AI edits to card content preserve learning progress. If the data has changed, the AI must read it again before editing. Refresh FlashLab after AI edits to see the changes.':
      [
        'AI가 카드 내용을 편집해도 학습 진도는 유지됩니다. 데이터가 변경되면 AI는 편집 전에 다시 읽어야 합니다. AI가 편집한 후 FlashLab을 새로 고침하세요.',
        'AI 编辑卡片内容时会保留学习进度。若数据已更改，AI 必须重新读取后再编辑。编辑后请刷新 FlashLab。',
        'AI がカードの内容を編集しても学習の進捗は保持されます。データが変更されている場合は再読込が必要です。AI の編集後に FlashLab を更新してください。',
      ],
    'MCP runs locally over stdio and does not provide a URL for cloud access. The desktop version uses its bundled Node runtime; the FlashLab window does not need to remain open for AI connections.':
      [
        'MCP는 stdio를 통해 로컬에서 실행되며 클라우드 접근용 URL을 제공하지 않습니다. 데스크톱 버전은 내장 Node를 사용하므로 AI 연결 중 FlashLab 창을 열어 둘 필요가 없습니다.',
        'MCP 通过 stdio 在本地运行，不提供云端访问 URL。桌面版使用内置 Node，AI 连接时无需保持 FlashLab 窗口打开。',
        'MCP は stdio 経由でローカル動作し、クラウド接続用の URL は提供しません。デスクトップ版は同梱の Node を使い、AI 接続のために FlashLab の画面を開いておく必要はありません。',
      ],
    'The AI app may send card content it reads to its model provider according to that app’s configuration.':
      [
        'AI 앱은 자체 설정에 따라 읽은 카드 내용을 모델 제공업체에 전송할 수 있습니다.',
        'AI 应用可能按照其设置，将读取的卡片内容发送给模型提供商。',
        'AI アプリは設定に応じて、読み取ったカードの内容をモデル提供元に送信する場合があります。',
      ],
    'Example AI requests': ['AI 요청 예시', 'AI 请求示例', 'AI への依頼例'],
    'Find FlashLab cards about banking.': [
      'FlashLab에서 은행 관련 카드를 찾아 줘.',
      '查找 FlashLab 中与银行相关的卡片。',
      'FlashLab で銀行に関するカードを探してください。',
    ],
    'Read the selected study set and quiz me one word at a time.': [
      '선택한 학습 세트를 읽고 한 단어씩 문제를 내 줘.',
      '读取所选学习集，每次考我一个单词。',
      '選択した学習セットを読み、単語を一つずつ出題してください。',
    ],
    'Add 20 travel words with pronunciation and examples.': [
      '발음과 예문이 있는 여행 단어 20개를 추가해 줘.',
      '添加 20 个旅游单词，并附上发音和例句。',
      '旅行に関する単語を発音と例文付きで20個追加してください。',
    ],
    'Fix spelling and explain meanings while preserving my learning progress.':
      [
        '학습 진도를 유지하면서 철자를 고치고 뜻을 설명해 줘.',
        '修正拼写并解释含义，同时保留我的学习进度。',
        '学習の進捗を保ったまま、スペルを修正して意味を説明してください。',
      ],
    'MCP tools': ['MCP 도구', 'MCP 工具', 'MCP ツール'],
    'Read tools': ['읽기 도구', '读取工具', '読み取りツール'],
    'Write tools': ['편집 도구', '写入工具', '書き込みツール'],
    'Connection troubleshooting': [
      '연결 문제 해결',
      '连接故障排查',
      '接続できない場合',
    ],
    'If you move the installation or data folder, generate a new configuration in FlashLab. Check that the profile still exists and that your installation supports MCP.':
      [
        '설치 위치나 데이터 폴더를 옮겼다면 FlashLab에서 설정을 다시 생성하세요. 프로필이 존재하고 설치된 버전이 MCP를 지원하는지 확인하세요.',
        '若移动了安装位置或数据文件夹，请在 FlashLab 中重新生成配置。确认个人资料仍存在，且安装版本支持 MCP。',
        'インストール先やデータフォルダーを移動した場合は設定を再生成してください。プロフィールが存在し、インストール済みのバージョンが MCP に対応しているか確認します。',
      ],
    'If only read tools appear, generate a configuration with read and edit permission and update it in the AI app. If there is a data conflict, read the data again before editing.':
      [
        '읽기 도구만 표시되면 편집 권한을 포함한 설정을 생성하여 AI 앱에 적용하세요. 데이터 충돌이 발생하면 다시 읽은 후 편집하세요.',
        '如果只显示读取工具，请生成带读写权限的配置并在 AI 应用中更新。数据冲突时请重新读取后再编辑。',
        '読み取りツールだけが表示される場合は編集権限付きの設定を生成し、AI アプリ側を更新してください。データが競合した場合は再読込してから編集します。',
      ],
    'A stdio command run manually waits for MCP client requests. Use the exact command and args generated by FlashLab; npm messages on stdout can break the connection.':
      [
        'stdio 명령을 수동 실행하면 MCP 클라이언트의 요청을 기다립니다. FlashLab이 생성한 command와 args를 그대로 사용하세요. npm의 stdout 메시지는 연결을 방해할 수 있습니다.',
        '手动运行 stdio 命令时会等待 MCP 客户端请求。请使用 FlashLab 生成的原始 command 和 args；npm 的标准输出消息可能破坏连接。',
        'stdio コマンドを手動実行すると MCP クライアントの要求を待機します。FlashLab が生成した command と args をそのまま使用してください。npm の標準出力が接続を妨げる場合があります。',
      ],
    'MCP guide for Claude Desktop': [
      'Claude Desktop용 MCP 안내',
      'Claude Desktop MCP 指南',
      'Claude Desktop の MCP ガイド',
    ],
    'Go to home': ['홈으로', '返回主页', 'ホームへ'],
    'FlashLab — Study your way': [
      'FlashLab — 나만의 방식으로 학습',
      'FlashLab — 按自己的方式学习',
      'FlashLab — 自分らしく学ぶ',
    ],
    'Your data is stored on this device': [
      '데이터는 이 기기에 저장됩니다',
      '数据保存在此设备上',
      'データはこの端末に保存されます',
    ],
    'The CSV file contains an unclosed quote.': [
      'CSV 파일의 따옴표가 닫히지 않았습니다.',
      'CSV 文件中有未闭合的引号。',
      'CSV ファイルに閉じられていない引用符があります。',
    ],
    'Import up to 10,000 cards at a time.': [
      '한 번에 최대 10,000개의 카드를 가져올 수 있습니다.',
      '每次最多导入 10,000 张卡片。',
      '一度に読み込めるカードは最大10,000枚です。',
    ],
    'The spreadsheet is too large.': [
      '스프레드시트가 너무 큽니다.',
      '电子表格过大。',
      'スプレッドシートが大きすぎます。',
    ],
    'Could not read the first worksheet.': [
      '첫 번째 시트를 읽을 수 없습니다.',
      '无法读取第一个工作表。',
      '最初のワークシートを読み込めませんでした。',
    ],
    'Color intensity increases with study answers': [
      '학습 응답 수에 따라 색상이 진해집니다',
      '颜色深度随学习答题次数增加',
      '学習の解答数に応じて色が濃くなります',
    ],
    'Could not load the diagram renderer.': [
      '다이어그램 렌더러를 불러올 수 없습니다.',
      '无法加载图表渲染器。',
      '図の描画機能を読み込めませんでした。',
    ],
    'The diagram is too long (maximum 20,000 characters).': [
      '다이어그램이 너무 깁니다(최대 20,000자).',
      '图表内容过长（最多 20,000 个字符）。',
      '図の内容が長すぎます（最大20,000文字）。',
    ],
    'Diagrams using !include are not supported. Write the diagram content directly.':
      [
        '!include를 사용하는 다이어그램은 지원하지 않습니다. 내용을 직접 작성하세요.',
        '不支持使用 !include 的图表，请直接编写图表内容。',
        '!include を使用した図には対応していません。内容を直接記述してください。',
      ],
    'Diagram rendering timed out.': [
      '다이어그램 렌더링 시간이 초과되었습니다.',
      '图表渲染超时。',
      '図の描画がタイムアウトしました。',
    ],
    'Avatar pages': ['아바타 페이지', '头像分页', 'アバターのページ'],
    'Saving avatar…': ['아바타 저장 중…', '正在保存头像…', 'アバターを保存中…'],
    'Avatar saved.': [
      '아바타가 저장되었습니다.',
      '头像已保存。',
      'アバターを保存しました。',
    ],
    'The avatar has not been saved to the server.': [
      '아바타가 서버에 저장되지 않았습니다.',
      '头像尚未保存到服务器。',
      'アバターはサーバーに保存されていません。',
    ],
    'A recovery database is saved automatically before changes are applied.': [
      '변경 사항을 적용하기 전에 복구용 데이터베이스를 자동으로 저장합니다.',
      '应用更改前会自动保存恢复数据库。',
      '変更の適用前に復元用データベースが自動保存されます。',
    ],
    'Could not save the selected profile. Allow browser storage and try again.':
      [
        '선택한 프로필을 저장할 수 없습니다. 브라우저 저장소를 허용한 후 다시 시도하세요.',
        '无法保存所选个人资料，请允许浏览器存储后重试。',
        '選択したプロフィールを保存できません。ブラウザーの保存を許可して再試行してください。',
      ],
    'Profile pages': ['프로필 페이지', '个人资料分页', 'プロフィールのページ'],
    'Could not switch profiles.': [
      '프로필을 전환할 수 없습니다.',
      '无法切换个人资料。',
      'プロフィールを切り替えられませんでした。',
    ],
    'Could not delete the profile.': [
      '프로필을 삭제할 수 없습니다.',
      '无法删除个人资料。',
      'プロフィールを削除できませんでした。',
    ],
    'Could not add the profile.': [
      '프로필을 추가할 수 없습니다.',
      '无法添加个人资料。',
      'プロフィールを追加できませんでした。',
    ],
    Unmute: ['음소거 해제', '取消静音', 'ミュート解除'],
    Mute: ['음소거', '静音', 'ミュート'],
    'Stop preview': ['미리 듣기 중지', '停止试听', '試聴を停止'],
    'Continue studying': ['학습 계속', '继续学习', '学習を続ける'],
    'Something went wrong': [
      '오류가 발생했습니다',
      '出现错误',
      'エラーが発生しました',
    ],
    'Time remaining before the next question': [
      '다음 문제까지 남은 시간',
      '距离下一题的剩余时间',
      '次の問題までの残り時間',
    ],
    'Saved data is not in the FlashLab format.': [
      '저장된 데이터가 FlashLab 형식이 아닙니다.',
      '保存的数据不符合 FlashLab 格式。',
      '保存されたデータは FlashLab 形式ではありません。',
    ],
    'Not assessed': ['미평가', '未评价', '未評価'],
    'List pages': ['목록 페이지', '列表分页', '一覧のページ'],
    'No study sets yet. Create one to get started.': [
      '학습 세트가 없습니다. 새로 만들어 시작하세요.',
      '尚无学习集，请创建一个以开始学习。',
      '学習セットがありません。作成して始めましょう。',
    ],
    'Recent study sets': ['최근 학습 세트', '最近学习集', '最近の学習セット'],
    'Import Excel / CSV': [
      'Excel / CSV 가져오기',
      '导入 Excel / CSV',
      'Excel / CSV を読み込む',
    ],
    '(days)': ['(일)', '（天）', '（日）'],
    'Study session details': [
      '학습 세션 상세',
      '学习记录详情',
      '学習セッションの詳細',
    ],
    Completed: ['완료', '已完成', '完了'],
    'Stopped early': ['중간에 중지됨', '中途停止', '途中で終了'],
    Assessment: ['평가', '评价', '評価'],
    'Your answer:': ['내 답:', '你的答案：', 'あなたの解答：'],
    'Assessment:': ['평가:', '评价：', '評価：'],
    'Answer:': ['정답:', '答案：', '正解：'],
    'Suggested answer:': ['추천 답:', '参考答案：', '解答例：'],
    content: ['내용', '内容', '内容'],
    '(not recorded)': ['(기록 없음)', '（未记录）', '（記録なし）'],
    'Older sessions contain only total scores. New sessions save questions, correct answers and your responses.':
      [
        '이전 세션에는 총점만 저장되어 있습니다. 새 세션에는 문제, 정답 및 내 응답이 저장됩니다.',
        '旧学习记录只保存总分。新记录会保存题目、正确答案和你的回答。',
        '以前のセッションには合計点のみが保存されています。新しいセッションでは問題、正解、あなたの解答が保存されます。',
      ],
    '(blank)': ['(빈칸)', '（空白）', '（未回答）'],
    'Enter a term on the front to hear its pronunciation.': [
      '발음을 들으려면 앞면에 단어를 입력하세요.',
      '请在正面输入词语以听取发音。',
      '発音を聞くには表面に単語を入力してください。',
    ],
    'This browser does not support speech synthesis.': [
      '이 브라우저는 음성 합성을 지원하지 않습니다.',
      '此浏览器不支持语音合成。',
      'このブラウザーは音声読み上げに対応していません。',
    ],
    'Could not play speech. Check that a voice for the selected language is installed on your device.':
      [
        '음성을 재생할 수 없습니다. 기기에 선택한 언어의 음성이 설치되어 있는지 확인하세요.',
        '无法播放语音，请检查设备是否安装了所选语言的语音。',
        '読み上げを再生できません。選択した言語の音声が端末にインストールされているか確認してください。',
      ],
    '(skip)': ['(건너뛰기)', '（跳过）', '（スキップ）'],
    'No valid vocabulary to import.': [
      '가져올 유효한 단어가 없습니다.',
      '没有可导入的有效词汇。',
      '読み込める有効な単語がありません。',
    ],
    'The file exceeds 5 MB.': [
      '파일이 5 MB를 초과합니다.',
      '文件超过 5 MB。',
      'ファイルが5 MBを超えています。',
    ],
    Match: ['짝 맞추기', '配对', 'マッチ'],
    'Insert code block': [
      '코드 블록 삽입',
      '插入代码块',
      'コードブロックを挿入',
    ],
    Hue: ['색상', '色相', '色相'],
    Saturation: ['채도', '饱和度', '彩度'],
    'Custom color picker: select a color or use the sliders below': [
      '사용자 지정 색상: 색상을 선택하거나 아래 슬라이더를 사용하세요',
      '自定义颜色：选择颜色或使用下方滑块',
      'カスタムカラー：色を選択するか、下のスライダーを使ってください',
    ],
    'Enter 3 or 6 HEX digits (0–9, A–F), for example #7c3aed.': [
      'HEX 숫자 3자리 또는 6자리(0–9, A–F)를 입력하세요. 예: #7c3aed.',
      '输入 3 或 6 位十六进制字符（0–9、A–F），例如 #7c3aed。',
      '3桁または6桁の16進数（0–9、A–F）を入力してください。例：#7c3aed。',
    ],
    'Connect AI via MCP': [
      'MCP로 AI 연결',
      '通过 MCP 连接 AI',
      'MCP で AI に接続',
    ],
    'Let Claude, Codex or another MCP app read and manage study sets on this computer.':
      [
        'Claude, Codex 및 다른 MCP 앱이 이 컴퓨터의 학습 세트를 읽고 관리하도록 허용합니다.',
        '允许 Claude、Codex 或其他 MCP 应用读取和管理此电脑上的学习集。',
        'Claude、Codex などの MCP アプリで、このパソコンの学習セットを閲覧・管理できます。',
      ],
    'Access permissions': ['접근 권한', '访问权限', 'アクセス権限'],
    'Read only': ['읽기 전용', '只读', '読み取り専用'],
    'Read and edit cards and study sets': [
      '카드와 학습 세트 읽기 및 편집',
      '读取和编辑卡片及学习集',
      'カードと学習セットの読み取りと編集',
    ],
    'AI application': ['AI 앱', 'AI 应用', 'AI アプリ'],
    'Generate connection configuration': [
      '연결 설정 생성',
      '生成连接配置',
      '接続設定を生成',
    ],
    'MCP configuration': ['MCP 설정', 'MCP 配置', 'MCP 設定'],
    'Copy configuration': ['설정 복사', '复制配置', '設定をコピー'],
    'Preparing MCP configuration…': [
      'MCP 설정 준비 중…',
      '正在准备 MCP 配置…',
      'MCP 設定を準備中…',
    ],
    'MCP configuration copied.': [
      'MCP 설정이 복사되었습니다.',
      'MCP 配置已复制。',
      'MCP 設定をコピーしました。',
    ],
    'Could not retrieve MCP configuration. Check your connection to FlashLab.':
      [
        'MCP 설정을 가져올 수 없습니다. FlashLab 연결을 확인하세요.',
        '无法获取 MCP 配置，请检查与 FlashLab 的连接。',
        'MCP 設定を取得できません。FlashLab への接続を確認してください。',
      ],
    'Could not generate MCP configuration.': [
      'MCP 설정을 생성할 수 없습니다.',
      '无法生成 MCP 配置。',
      'MCP 設定を生成できませんでした。',
    ],
    'Configuration selected. Press Ctrl+C to copy.': [
      '설정이 선택되었습니다. Ctrl+C로 복사하세요.',
      '配置已选中，按 Ctrl+C 复制。',
      '設定を選択しました。Ctrl+C でコピーしてください。',
    ],
    'Generate a new configuration, update it in your AI app and reconnect. Existing connections keep their permissions until their configuration is updated there.':
      [
        '새 설정을 생성하여 AI 앱에 적용한 후 다시 연결하세요. 기존 연결은 AI 앱에서 설정을 수정할 때까지 이전 권한을 유지합니다.',
        '生成新配置，在 AI 应用中更新后重新连接。已有连接会保留原权限，直到在 AI 应用中更新配置。',
        '新しい設定を生成して AI アプリ側を更新し、再接続してください。既存の接続は AI アプリ側の設定を更新するまで元の権限を保持します。',
      ],
    'Paste this configuration into an AI app on the same computer and reconnect. Refresh FlashLab after AI edits to see the changes.':
      [
        '같은 컴퓨터의 AI 앱에 설정을 붙여 넣고 다시 연결하세요. AI 편집 후 FlashLab을 새로 고침하면 변경 내용을 볼 수 있습니다.',
        '将配置粘贴到同一电脑上的 AI 应用并重新连接。AI 编辑后请刷新 FlashLab 查看更改。',
        '同じパソコンの AI アプリに設定を貼り付けて再接続します。AI の編集後に FlashLab を更新すると変更が表示されます。',
      ],
    'Back up profile (.sqlite)': [
      '프로필 백업 (.sqlite)',
      '备份个人资料 (.sqlite)',
      'プロフィールをバックアップ (.sqlite)',
    ],
    'Back up everything (.sqlite)': [
      '전체 백업 (.sqlite)',
      '备份全部数据 (.sqlite)',
      'すべてバックアップ (.sqlite)',
    ],
    'Restore from database': [
      '데이터베이스에서 복원',
      '从数据库恢复',
      'データベースから復元',
    ],
    'Restore database': [
      '데이터베이스 복원',
      '恢复数据库',
      'データベースを復元',
    ],
    'Restore database?': [
      '데이터베이스를 복원할까요?',
      '恢复数据库？',
      'データベースを復元しますか？',
    ],
    Restore: ['복원', '恢复', '復元'],
    'Choose database': [
      '데이터베이스 선택',
      '选择数据库',
      'データベースを選択',
    ],
    'Choose a SQLite backup of one profile or all data.': [
      '프로필 하나 또는 전체 데이터의 SQLite 백업을 선택하세요.',
      '选择单个个人资料或全部数据的 SQLite 备份。',
      '一つのプロフィールまたはすべてのデータの SQLite バックアップを選択してください。',
    ],
    'Preparing database…': [
      '데이터베이스 준비 중…',
      '正在准备数据库…',
      'データベースを準備中…',
    ],
    'Profile database backed up.': [
      '프로필 데이터베이스를 백업했습니다.',
      '已备份个人资料数据库。',
      'プロフィールのデータベースをバックアップしました。',
    ],
    'Full database downloaded.': [
      '전체 데이터베이스를 다운로드했습니다.',
      '已下载完整数据库。',
      'データベース全体をダウンロードしました。',
    ],
    'All profiles, posts and images backed up.': [
      '모든 프로필, 게시물, 이미지를 백업했습니다.',
      '已备份全部个人资料、文章和图片。',
      'すべてのプロフィール、記事、画像をバックアップしました。',
    ],
    'Database export failed.': [
      '데이터베이스 내보내기에 실패했습니다.',
      '数据库导出失败。',
      'データベースのエクスポートに失敗しました。',
    ],
    'Could not export the database. Check your data and try again.': [
      '데이터베이스를 내보낼 수 없습니다. 데이터를 확인하고 다시 시도하세요.',
      '无法导出数据库。请检查数据后重试。',
      'データベースをエクスポートできません。データを確認して再試行してください。',
    ],
    'Could not restore the database.': [
      '데이터베이스를 복원할 수 없습니다.',
      '无法恢复数据库。',
      'データベースを復元できません。',
    ],
    'The database file exceeds 100 MB.': [
      '데이터베이스 파일이 100 MB를 초과합니다.',
      '数据库文件超过 100 MB。',
      'データベースファイルが 100 MB を超えています。',
    ],
    'This is not a valid SQLite database.': [
      '올바른 SQLite 데이터베이스가 아닙니다.',
      '这不是有效的 SQLite 数据库。',
      '有効な SQLite データベースではありません。',
    ],
    'Could not read the backup details.': [
      '백업 정보를 읽을 수 없습니다.',
      '无法读取备份详情。',
      'バックアップの詳細を読み取れません。',
    ],
    'No account needed. Your cards stay local. Back up the database in Settings or restore a database from the user menu.':
      [
        '계정이 필요하지 않습니다. 카드는 로컬에 저장됩니다. 설정에서 데이터베이스를 백업하거나 사용자 메뉴에서 복원하세요.',
        '无需账户，卡片保存在本地。在设置中备份数据库，或通过用户菜单恢复数据库。',
        'アカウントは不要です。カードはローカルに保存されます。設定でデータベースをバックアップするか、ユーザーメニューから復元できます。',
      ],
    'Each profile has separate data. In Settings, choose Back up profile for one person, or Back up everything to keep all profiles, shared posts and images in a single .sqlite file.':
      [
        '프로필마다 데이터가 분리됩니다. 설정에서 프로필 백업을 선택하거나 전체 백업으로 모든 프로필, 공유 게시물, 이미지를 하나의 .sqlite 파일에 저장하세요.',
        '各个人资料的数据相互独立。在设置中选择备份个人资料，或备份全部，将所有个人资料、共享文章和图片保存在一个 .sqlite 文件中。',
        'プロフィールごとにデータが分かれています。設定で個別のバックアップを選ぶか、全体バックアップですべてのプロフィール、共有記事、画像を一つの .sqlite ファイルに保存します。',
      ],
    'Choose Restore from database in Settings or the user menu, then select a .sqlite file. Review the scope before confirming. A full restore replaces current data; a profile restore preserves other profiles. A recovery copy is saved automatically in restore-backups.':
      [
        '설정이나 사용자 메뉴에서 데이터베이스 복원을 선택하고 .sqlite 파일을 여세요. 범위를 확인한 후 승인하세요. 전체 복원은 현재 데이터를 교체하며 프로필 복원은 다른 프로필을 유지합니다. 복구 사본은 restore-backups에 자동 저장됩니다.',
        '在设置或用户菜单中选择从数据库恢复，然后选择 .sqlite 文件。确认前请检查恢复范围。完整恢复会替换当前数据；个人资料恢复会保留其他资料。恢复副本自动保存到 restore-backups。',
        '設定またはユーザーメニューでデータベースからの復元を選び、.sqlite ファイルを開きます。範囲を確認して実行してください。全体復元は現在のデータを置き換え、個別復元は他のプロフィールを保持します。復旧用コピーは restore-backups に自動保存されます。',
      ],
    'SQLite keeps profiles, multiple card meanings, images, classes, progress, history and individual answers, settings, notes and posts. Legacy JSON and image files are retained after migration.':
      [
        'SQLite는 프로필, 카드의 여러 뜻, 이미지, 클래스, 진도, 기록과 개별 답변, 설정, 노트, 게시물을 저장합니다. 이전 JSON 및 이미지 파일은 마이그레이션 후에도 유지됩니다.',
        'SQLite 保存个人资料、卡片的多个释义、图片、班级、进度、历史及逐题答案、设置、笔记和文章。迁移后仍保留旧 JSON 和图片文件。',
        'SQLite にプロフィール、カードの複数の意味、画像、クラス、進捗、履歴と各解答、設定、ノート、記事を保存します。移行後も旧 JSON と画像ファイルは残ります。',
      ],
    'No extraction or JSON assembly is needed. CSV folders and legacy backups can still be imported. Restoring a database preserves this device’s service ports and storage paths.':
      [
        '압축 해제나 JSON 조립이 필요하지 않습니다. CSV 폴더와 이전 백업도 가져올 수 있습니다. 데이터베이스 복원 시 이 기기의 서비스 포트와 저장 경로는 유지됩니다.',
        '无需解压或组合 JSON。仍可导入 CSV 文件夹和旧备份。恢复数据库时会保留本机服务端口和存储路径。',
        '解凍や JSON の組み立ては不要です。CSV フォルダーや旧バックアップも取り込めます。復元時もこの端末のサービスポートと保存先は保持されます。',
      ],
    'Go to Settings → Export ZIP folder. To restore, extract the ZIP, open the user menu → Import user folder and select the extracted folder. The ZIP keeps profile data and personal notes. To also back up shared articles and images, close the application and copy the entire storage directory.':
      [
        '설정 → ZIP 폴더 내보내기로 이동하세요. 복원하려면 ZIP을 풀고 사용자 메뉴 → 사용자 폴더 가져오기에서 해당 폴더를 선택하세요. ZIP에는 프로필과 개인 노트가 포함됩니다. 공유 게시물과 이미지도 백업하려면 앱을 닫고 전체 저장 폴더를 복사하세요.',
        '在设置中导出 ZIP 文件夹。恢复时解压 ZIP，通过用户菜单导入解压后的用户文件夹。ZIP 包含个人资料和私人笔记；若需备份共享文章和图片，请关闭应用并复制整个数据目录。',
        '設定から ZIP フォルダーをエクスポートします。復元時は ZIP を解凍し、ユーザーメニューから解凍したユーザーフォルダーを取り込みます。ZIP にはプロフィールと個人ノートが含まれます。共有記事や画像もバックアップする場合はアプリを閉じ、保存フォルダー全体をコピーしてください。',
      ],
    'Study data and articles are stored in flashlab.sqlite. Each profile has separate data; old JSON files are retained after migration.':
      [
        '학습 데이터와 게시물은 flashlab.sqlite에 저장됩니다. 프로필별 데이터는 분리되며 이전 JSON 파일은 마이그레이션 후에도 유지됩니다.',
        '学习数据和文章存储在 flashlab.sqlite 中。各个人资料的数据独立；迁移后保留旧 JSON 文件。',
        '学習データと記事は flashlab.sqlite に保存されます。プロフィールごとに分離され、移行後も旧 JSON ファイルは残ります。',
      ],
    'CSV and state.json are created when exporting a ZIP. To apply external CSV changes, import them again through the interface.':
      [
        'ZIP 내보내기 시 CSV와 state.json이 생성됩니다. 외부 CSV 변경 사항은 화면에서 다시 가져와 적용하세요.',
        '导出 ZIP 时生成 CSV 和 state.json。外部修改的 CSV 需通过界面重新导入才会生效。',
        'ZIP のエクスポート時に CSV と state.json を作成します。外部で変更した CSV は画面から再度取り込んでください。',
      ],
    'Text, CSV, Excel and manually added cards all use the same duplicate comparison dialog. Choose Edit before importing to edit the term, add or remove meanings, choose a word class for each meaning, and edit pronunciation, speech language, notes and image. Then choose Create a separate card, Overwrite duplicate or Merge into duplicate. A separate card needs a unique term. Overwrite replaces content and resets progress. Merge preserves existing content and progress, adds only new meaning and word-class pairs and fills empty fields. You can edit multiple cards and change pages without losing drafts; changes are saved only after Confirm import.':
      [
        '텍스트, CSV, Excel, 수동 추가 모두 같은 중복 비교 창을 사용합니다. 가져오기 전 편집에서 용어, 뜻과 품사, 발음, 음성 언어, 노트, 이미지를 수정할 수 있습니다. 별도 카드 생성은 고유한 용어가 필요합니다. 덮어쓰기는 내용과 진도를 초기화하며, 병합은 기존 내용과 진도를 유지하고 새 뜻·품사 쌍과 빈 필드만 보완합니다. 여러 카드를 편집하고 페이지를 바꿔도 초안이 유지되며 가져오기 확인 후에만 저장됩니다.',
        '文本、CSV、Excel 和手动添加共用重复卡片比较窗口。选择导入前编辑，可修改术语、增删释义、分别设置词性，以及修改发音、朗读语言、笔记和图片。随后可创建独立卡片、覆盖或合并。独立卡片的术语须唯一；覆盖会替换内容并重置进度；合并保留原有内容和进度，仅添加新的释义与词性组合并填补空字段。编辑多张卡片或翻页不会丢失草稿，确认导入后才保存。',
        'テキスト、CSV、Excel、手動追加では同じ重複比較画面を使います。取り込み前の編集で用語、意味の追加・削除、各意味の品詞、発音、読み上げ言語、ノート、画像を変更できます。別カードの作成には重複しない用語が必要です。上書きは内容を置き換えて進捗を初期化し、統合は既存の内容と進捗を保持して新しい意味と品詞の組み合わせや空欄だけを補います。複数のカードの編集やページ移動でも下書きは残り、取り込み確認後に保存されます。',
      ],
    'Edit the content, then create a separate card, overwrite or merge.': [
      '내용을 편집한 후 별도 카드 생성, 덮어쓰기 또는 병합을 선택하세요.',
      '编辑内容后选择创建独立卡片、覆盖或合并。',
      '内容を編集し、別カード作成、上書き、統合を選んでください。',
    ],
    'Save edited content': ['편집 내용 저장', '保存编辑内容', '編集内容を保存'],
    'Create a separate card': [
      '별도 카드 생성',
      '创建独立卡片',
      '別カードを作成',
    ],
    'Overwrite duplicate': [
      '중복 카드 덮어쓰기',
      '覆盖重复卡片',
      '重複カードを上書き',
    ],
    'Merge into duplicate': [
      '중복 카드에 병합',
      '合并到重复卡片',
      '重複カードに統合',
    ],
    'A separate card needs a new term. Overwriting resets progress; merging preserves existing content.':
      [
        '별도 카드는 새로운 용어가 필요합니다. 덮어쓰기는 진도를 초기화하며 병합은 기존 내용을 유지합니다.',
        '独立卡片需要新术语。覆盖会重置进度；合并会保留已有内容。',
        '別カードには新しい用語が必要です。上書きは進捗を初期化し、統合は既存の内容を保持します。',
      ],
    'Every definition must include a meaning.': [
      '모든 뜻 항목에 내용을 입력하세요.',
      '每条释义都必须填写内容。',
      'すべての意味欄に内容を入力してください。',
    ],
    'The duplicate card could not be found for this edit.': [
      '편집할 중복 카드를 찾을 수 없습니다.',
      '找不到此次编辑的重复卡片。',
      '編集対象の重複カードが見つかりません。',
    ],
    'Keep the original term when merging. Choose Create a separate card to use a different term.':
      [
        '병합 시 원래 용어를 유지하세요. 다른 용어는 별도 카드 생성으로 저장하세요.',
        '合并时请保留原术语。如需使用其他术语，请创建独立卡片。',
        '統合時は元の用語を維持してください。用語を変える場合は別カードを作成してください。',
      ],
    'Could not read the image. Please select it again.': [
      '이미지를 읽을 수 없습니다. 다시 선택하세요.',
      '无法读取图片，请重新选择。',
      '画像を読み取れません。選び直してください。',
    ],
    'Choose how to handle each card before saving.': [
      '저장 전 각 카드의 처리 방법을 선택하세요.',
      '保存前请选择各卡片的处理方式。',
      '保存前に各カードの処理方法を選んでください。',
    ],
    'Resolution options': ['처리 옵션', '处理选项', '処理方法'],
    'Keep the saved card and skip the incoming copy.': [
      '저장된 카드를 유지하고 가져올 카드를 건너뜁니다.',
      '保留已保存的卡片并跳过导入副本。',
      '保存済みカードを保持し、取り込むコピーをスキップします。',
    ],
    'Replace the saved card content and reset its study progress.': [
      '저장된 내용을 교체하고 학습 진도를 초기화합니다.',
      '替换已有卡片内容并重置学习进度。',
      '保存済みカードの内容を置き換え、学習進捗を初期化します。',
    ],
    'Add new meanings and fill empty fields; keep existing progress.': [
      '새 뜻과 빈 필드를 추가하고 기존 진도를 유지합니다.',
      '添加新释义并补全空字段，保留原有进度。',
      '新しい意味と空欄を補い、既存の進捗を保持します。',
    ],
    'Change the term to save it as a separate card.': [
      '용어를 바꾸어 별도 카드로 저장합니다.',
      '修改术语后保存为独立卡片。',
      '用語を変更して別カードとして保存します。',
    ],
    'Edited content': ['편집한 내용', '编辑后的内容', '編集済みの内容'],
    'Enable multiple-selection controls or the + button for every written question. Answer all saved meanings; a word with one meaning only needs one answer. Leave unchecked to accept any one meaning.':
      [
        '복수 선택 또는 쓰기 문항의 + 버튼을 활성화합니다. 저장된 뜻을 모두 답하세요. 뜻이 하나면 답도 하나만 필요합니다. 해제하면 아무 뜻 하나만 맞혀도 됩니다.',
        '启用多选或所有书写题的 + 按钮。需回答全部已保存释义；只有一个释义时仅需一个答案。取消勾选则任答一个释义即可。',
        '複数選択または記述問題の + ボタンを有効にします。保存済みの意味をすべて答えてください。意味が一つなら解答も一つです。無効の場合はいずれか一つの意味で正解になります。',
      ],
    'Duplicates are skipped by default. Overwrite replaces content and resets progress. Merge adds new meaning and word-class pairs, fills empty fields and preserves existing progress and content.':
      [
        '중복 카드는 기본적으로 건너뜁니다. 덮어쓰기는 내용과 진도를 초기화합니다. 병합은 새 뜻·품사 쌍과 빈 필드를 보완하며 기존 진도와 내용을 유지합니다.',
        '默认跳过重复卡片。覆盖会替换内容并重置进度；合并会添加新的释义与词性组合、填补空字段，并保留原内容和进度。',
        '重複は既定でスキップします。上書きは内容を置き換えて進捗を初期化します。統合は新しい意味と品詞の組み合わせや空欄を補い、既存の進捗と内容を保持します。',
      ],
    'Merge meanings': ['뜻 병합', '合并释义', '意味を統合'],
    'Meanings merged into the card.': [
      '카드에 뜻을 병합했습니다.',
      '已将释义合并到卡片。',
      'カードに意味を統合しました。',
    ],
    'Card overwritten.': [
      '카드를 덮어썼습니다.',
      '已覆盖卡片。',
      'カードを上書きしました。',
    ],
    'Merging would exceed 20 meanings for a card. Changes have not been saved.':
      [
        '병합하면 카드당 뜻 20개를 초과합니다. 변경 사항은 저장되지 않았습니다.',
        '合并后每张卡片将超过 20 条释义，未保存更改。',
        '統合すると一枚の意味が 20 件を超えるため、保存されていません。',
      ],
    'When importing multiple cards, duplicates are shown for comparison. Skip, overwrite, merge meanings or edit the term before importing. Merge preserves existing content and progress, adds only new meaning and word-class pairs and fills empty fields; it does not create duplicate cards. This also works when adding a card manually.':
      [
        '여러 카드를 가져올 때 중복 비교가 표시됩니다. 건너뛰기, 덮어쓰기, 뜻 병합 또는 용어 편집을 선택하세요. 병합은 기존 내용과 진도를 유지하고 새 뜻·품사 쌍과 빈 필드만 보완하며 중복 카드를 만들지 않습니다. 수동 추가도 같습니다.',
        '批量导入时会比较重复卡片，可跳过、覆盖、合并释义或编辑术语。合并保留已有内容和进度，仅添加新释义与词性组合并填补空字段，不会创建重复卡片。手动添加也支持。',
        '一括取り込み時は重複を比較できます。スキップ、上書き、意味の統合、用語の編集を選んでください。統合は既存の内容と進捗を保持し、新しい意味と品詞や空欄のみ補います。重複カードは作成しません。手動追加でも同様です。',
      ],
    'Before a Test, enable multiple-choice answers or multiple written meanings. Multiple-answer questions require every correct meaning and no incorrect choices. Multiple written answers have a + button for adding fields, with a different meaning in each field. Enabling these options keeps the selected interface, even for a single-question test or a word with one meaning. A word with one meaning still only needs one answer. Leave these options off to accept any one meaning. Written results show every valid meaning.':
      [
        '시험 전에 복수 선택 또는 여러 뜻 쓰기를 활성화하세요. 복수 선택은 정답을 모두 선택하고 오답은 선택하지 않아야 합니다. 쓰기는 +로 칸을 추가해 서로 다른 뜻을 입력합니다. 한 문항이나 뜻이 하나인 단어에도 선택한 방식이 유지되지만 답은 하나면 됩니다. 해제하면 아무 뜻 하나를 인정합니다. 쓰기 결과에는 모든 유효한 뜻이 표시됩니다.',
        '测试前可启用多选或多释义书写。多选需选中所有正确释义且不能选错；书写可用 + 添加输入框，每框填写不同释义。即使只有一道题或一个释义也保持所选界面，但单释义只需一个答案。关闭后任答一个释义即可。书写结果会显示全部有效释义。',
        'テスト前に複数選択または複数の意味の記述を有効にできます。複数選択ではすべての正しい意味を選び、誤答を選ばないでください。記述では + で欄を追加し、それぞれ異なる意味を入力します。一問だけ、または意味が一つでも選んだ形式を維持しますが、意味が一つなら解答も一つです。無効時はいずれか一つで正解になります。記述結果には有効な意味をすべて表示します。',
      ],
    'Tile size': ['타일 크기', '卡片块大小', 'タイルの大きさ'],
    Display: ['화면', '显示', '表示'],
    'Study set / class tile size': [
      '학습 세트 / 클래스 타일 크기',
      '学习集 / 班级卡片块大小',
      '学習セット・クラスのタイルサイズ',
    ],
    Small: ['작게', '小', '小'],
    Medium: ['보통', '中', '中'],
    Large: ['크게', '大', '大'],
    'Applied immediately and saved for the current user.': [
      '즉시 적용되며 현재 사용자에게 저장됩니다.',
      '立即应用并为当前用户保存。',
      'すぐに反映され、現在のユーザーに保存されます。',
    ],
    'Lift tile': ['타일 집기', '拿起卡片块', 'タイルを持ち上げる'],
    'Preview lift tile': [
      '타일 집기 미리 듣기',
      '试听拿起音效',
      '持ち上げ音を試聴',
    ],
    'Stop preview lift tile': [
      '타일 집기 미리 듣기 중지',
      '停止试听拿起音效',
      '持ち上げ音の試聴を停止',
    ],
    'Unmute lift tile': [
      '타일 집기 소리 켜기',
      '开启拿起音效',
      '持ち上げ音をオン',
    ],
    'Mute lift tile': [
      '타일 집기 소리 끄기',
      '关闭拿起音效',
      '持ち上げ音をオフ',
    ],
    'Volume lift tile': ['타일 집기 음량', '拿起音量', '持ち上げ音の音量'],
    'Drop tile': ['타일 놓기', '放下卡片块', 'タイルを置く'],
    'Preview drop tile': [
      '타일 놓기 미리 듣기',
      '试听放下音效',
      '置く音を試聴',
    ],
    'Stop preview drop tile': [
      '타일 놓기 미리 듣기 중지',
      '停止试听放下音效',
      '置く音の試聴を停止',
    ],
    'Unmute drop tile': ['타일 놓기 소리 켜기', '开启放下音效', '置く音をオン'],
    'Mute drop tile': ['타일 놓기 소리 끄기', '关闭放下音效', '置く音をオフ'],
    'Volume drop tile': ['타일 놓기 음량', '放下音量', '置く音の音量'],
    'Previous page': ['이전 페이지', '上一页', '前のページ'],
    'Next page': ['다음 페이지', '下一页', '次のページ'],
    'Drag to reorder; drop on a page number to move to another page.': [
      '드래그하여 순서를 바꾸거나 페이지 번호에 놓아 다른 페이지로 이동하세요.',
      '拖动以排序，拖到页码上可移至其他页。',
      'ドラッグで並べ替え、ページ番号にドロップすると別ページへ移動します。',
    ],
    'Use Alt+1 / Alt+2 while typing; outside the answer field use 1 / 2 or ← / →. Enter checks your answer.':
      [
        '입력 중에는 Alt+1 / Alt+2, 답변 칸 밖에서는 1 / 2 또는 ← / →를 사용하세요. Enter로 답을 확인합니다.',
        '输入时用 Alt+1 / Alt+2；答案框外用 1 / 2 或 ← / →。Enter 检查答案。',
        '入力中は Alt+1 / Alt+2、解答欄外では 1 / 2 または ← / → を使います。Enter で答えを確認します。',
      ],
    'Multiple choice and written answers': [
      '선택형 및 쓰기',
      '选择与书写',
      '選択式と記述式',
    ],
    'Multiple choice only': ['선택형만', '仅选择题', '選択式のみ'],
    'Allow multiple-answer questions': [
      '복수 정답 허용',
      '允许多选题',
      '複数解答を許可',
    ],
    'Write multiple meanings in separate fields': [
      '여러 뜻을 각각 다른 칸에 쓰기',
      '在不同输入框填写多个释义',
      '複数の意味を別々の欄に記述',
    ],
    'Applies to words with multiple meanings. Answer all meanings correctly; leave unchecked to accept a single meaning.':
      [
        '뜻이 여러 개인 단어에 적용됩니다. 모든 뜻을 맞혀야 하며 해제하면 하나만 맞혀도 됩니다.',
        '适用于多释义单词。需答对全部释义；取消勾选则只需一个。',
        '意味が複数ある単語に適用されます。すべて答えてください。無効時は一つで正解になります。',
      ],
    'SELECT MULTIPLE ANSWERS': [
      '정답 모두 선택',
      '选择所有正确答案',
      '正しい答えをすべて選択',
    ],
    'WRITE MULTIPLE ANSWERS': [
      '여러 답 쓰기',
      '填写多个答案',
      '複数の答えを記述',
    ],
    'Add answer field': ['답변 칸 추가', '添加答案框', '解答欄を追加'],
    'Remove answer field': ['답변 칸 삭제', '删除答案框', '解答欄を削除'],
    'Enter one meaning per field and include every distinct meaning.': [
      '각 칸에 다른 뜻 하나씩, 모든 뜻을 입력하세요.',
      '每框填写一个不同释义，并包含全部释义。',
      '各欄に異なる意味を一つずつ、すべての意味を入力してください。',
    ],
    'Before a Test, enable multiple-choice answers or multiple written meanings. Multiple-answer questions require all correct meanings and no incorrect choices. Multiple written answers have a + button for adding fields, with a different meaning in each field. Leave these options off to accept one meaning. Written-answer results show every valid meaning.':
      [
        '시험 전 복수 선택 또는 여러 뜻 쓰기를 활성화하세요. 복수 선택은 모든 정답을 선택하고 오답은 제외합니다. 쓰기는 +로 칸을 추가해 서로 다른 뜻을 입력합니다. 해제하면 뜻 하나만 인정합니다. 결과에는 모든 유효한 뜻이 표시됩니다.',
        '测试前启用多选或多释义书写。多选须选中全部正确释义且不能选错；书写用 + 添加输入框，每框填不同释义。关闭后任答一个释义即可。书写结果显示所有有效释义。',
        'テスト前に複数選択や複数の意味の記述を有効にします。すべての正答を選び、誤答は除きます。記述は + で欄を追加し、別々の意味を入力します。無効時は一つの意味で正解になり、記述結果には有効な意味をすべて表示します。',
      ],
    Speech: ['음성', '朗读', '読み上げ'],
    'Speech rate': ['읽기 속도', '朗读速度', '読み上げ速度'],
    'Preview speech rate': [
      '읽기 속도 미리 듣기',
      '试听朗读速度',
      '読み上げ速度を試聴',
    ],
    'Default: 0.75×. Move left for slower speech; 1× is normal speed. Saved for the current user.':
      [
        '기본값은 0.75×입니다. 왼쪽으로 움직이면 느려지며 1×는 보통 속도입니다. 현재 사용자에게 저장됩니다.',
        '默认 0.75×。向左拖动可减慢，1× 为正常速度。为当前用户单独保存。',
        '既定は 0.75× です。左へ動かすと遅くなり、1× が通常速度です。現在のユーザーに保存されます。',
      ],
    'Progress points': ['진도 점수', '进度积分', '進捗ポイント'],
    'Current-level progress / minimum requirement. Incorrect answers subtract points and credits in the current mode. Meet the points target and every required mode.':
      [
        '현재 레벨 진도 / 최소 요구치입니다. 오답은 현재 모드의 점수와 실적을 차감합니다. 목표 점수와 모든 필수 모드를 완료하세요.',
        '当前等级进度 / 最低要求。答错会扣除当前模式的积分和次数。须达到积分目标并完成所有必需模式。',
        '現在のレベルの進捗 / 最低条件です。誤答で現在のモードのポイントと実績が減ります。目標ポイントとすべての必須モードを満たしてください。',
      ],
    'Levels 1–6 require 3, 5, 8, 12, 18 and 25 progress points respectively. A correct answer adds 1 point. An incorrect answer subtracts 1 point and 1 credit in the current mode, with a minimum of 0; an incorrect Test answer also subtracts 1 Test credit. An incorrect answer when progress is already 0 lowers the card by 1 level, down to level 0. Progress resets after each level change; when progress reaches 0, mode credits are cleared too. Incorrect answers are scheduled using the retry time in Settings. Level 3 and above counts as mastered.':
      [
        '레벨 1–6은 각각 3, 5, 8, 12, 18, 25점이 필요합니다. 정답은 1점을 추가하고 오답은 현재 모드 점수와 실적을 1씩 차감하며 최소 0입니다. 시험 오답은 시험 실적도 1 차감합니다. 진도가 이미 0일 때 틀리면 한 레벨 하락하며 최소 0입니다. 레벨 변경 시 진도가 초기화되고 진도 0에서는 모드 실적도 지워집니다. 오답은 설정의 재시도 시간으로 예약됩니다. 레벨 3 이상은 숙달로 봅니다.',
        '1–6 级分别需要 3、5、8、12、18、25 个进度积分。答对加 1 分；答错扣当前模式 1 分和 1 次记录，最低为 0，测试答错还扣 1 次测试记录。进度已为 0 时答错会降 1 级，最低 0 级。升降级后重置进度，进度归零时也清空模式记录。错题按设置中的重试时间安排。3 级及以上视为掌握。',
        'レベル 1～6 にはそれぞれ 3、5、8、12、18、25 ポイントが必要です。正答で 1 加点、誤答で現在のモードのポイントと実績を各 1 減らし、最低は 0 です。テストの誤答はテスト実績も 1 減ります。進捗が既に 0 のときの誤答は 1 レベル下がり、最低は 0 です。レベル変更で進捗をリセットし、進捗 0 ではモード実績も消去します。誤答は設定の再試行時間に従い予定されます。レベル 3 以上が習得済みです。',
      ],
    'Import text, CSV and Excel with 5 fields': [
      '5개 필드로 텍스트, CSV, Excel 가져오기',
      '用 5 个字段导入文本、CSV 和 Excel',
      '5 項目でテキスト・CSV・Excel を取り込む',
    ],
    'Order: term, definition, pronunciation, notes, image. Only term and definition are required. Keep commas for empty fields. In definition, write partOfSpeech::meaning and separate pairs with | within the same field.':
      [
        '순서는 용어, 뜻, 발음, 노트, 이미지입니다. 용어와 뜻만 필수이며 빈 필드의 쉼표도 유지하세요. 뜻은 partOfSpeech::meaning으로 쓰고 같은 필드 안에서 |로 구분하세요.',
        '顺序为术语、释义、发音、笔记、图片，仅前两项必填。空字段保留逗号。释义使用 partOfSpeech::meaning，同一字段内以 | 分隔。',
        '順序は用語、意味、発音、ノート、画像です。用語と意味のみ必須です。空欄のカンマも残してください。意味は partOfSpeech::meaning と記し、同じ項目内で | で区切ります。',
      ],
    'CSV and Excel use 5 headers: front, definition, pronunciation, notes, image. The definition cell also accepts a JSON array of meaning and partOfSpeech pairs to preserve meanings containing | or ::. Images use data:image/png;base64,... (or jpeg, webp, gif), rather than local file paths. Leave this field empty to add an image in the editor.':
      [
        'CSV와 Excel의 헤더는 front, definition, pronunciation, notes, image입니다. definition은 meaning·partOfSpeech JSON 배열도 지원해 |나 ::가 포함된 뜻을 보존합니다. 이미지는 로컬 경로 대신 data:image/png;base64,... 또는 jpeg, webp, gif를 사용하세요. 편집기에서 이미지를 추가하려면 비워 두세요.',
        'CSV 和 Excel 使用 front、definition、pronunciation、notes、image 五个表头。definition 也接受 meaning 与 partOfSpeech 的 JSON 数组，以保留含 | 或 :: 的释义。图片使用 data:image/png;base64,...（或 jpeg、webp、gif），不使用本地路径。可留空后在编辑器中添加。',
        'CSV と Excel の見出しは front、definition、pronunciation、notes、image です。definition は meaning と partOfSpeech の JSON 配列も受け付け、| や :: を含む意味を保持します。画像にはローカルパスではなく data:image/png;base64,...（jpeg、webp、gif も可）を使います。空欄にして編集画面で追加もできます。',
      ],
    'Pronunciation normally contains phonetic text. To preserve the speech language too, use JSON in the pronunciation cell, for example {"text":"/bʊk/","language":"en-GB"}. Exports save this information automatically.':
      [
        '발음에는 보통 발음 기호를 입력합니다. 음성 언어도 보존하려면 pronunciation 셀에 {"text":"/bʊk/","language":"en-GB"} 같은 JSON을 사용하세요. 내보내기 시 자동 저장됩니다.',
        '发音通常填写音标。若需保留朗读语言，在 pronunciation 单元格使用 JSON，例如 {"text":"/bʊk/","language":"en-GB"}。导出时自动保存此信息。',
        '発音欄は通常、発音記号を入力します。読み上げ言語も保持するには pronunciation に {"text":"/bʊk/","language":"en-GB"} のような JSON を使います。エクスポート時は自動保存されます。',
      ],
    'In a study set, choose Export cards → CSV, Text or Excel. All three export the same 5 fields, with all meaning and word-class pairs in definition. Keep the header row when editing and importing again. Speech language examples: en-US, vi-VN, zh-CN, ja-JP or ko-KR.':
      [
        '학습 세트에서 카드 내보내기 → CSV, 텍스트, Excel을 선택하세요. 모두 같은 5개 필드와 definition의 전체 뜻·품사 쌍을 내보냅니다. 수정 후 다시 가져올 때 헤더를 유지하세요. 음성 언어 예: en-US, vi-VN, zh-CN, ja-JP, ko-KR.',
        '在学习集中选择导出卡片 → CSV、文本或 Excel。三者均导出相同 5 个字段，definition 包含全部释义与词性。编辑后重新导入时保留表头。朗读语言示例：en-US、vi-VN、zh-CN、ja-JP、ko-KR。',
        '学習セットでカードのエクスポートから CSV、テキスト、Excel を選びます。いずれも同じ 5 項目で、definition に全意味と品詞を含みます。編集後の再取り込みでも見出しを残してください。読み上げ言語例：en-US、vi-VN、zh-CN、ja-JP、ko-KR。',
      ],
    'Card files exchange content. To preserve progress and remembered marks too, export a SQLite backup in Settings.':
      [
        '카드 파일은 내용을 교환합니다. 진도와 암기 표시도 보존하려면 설정에서 SQLite 백업을 내보내세요.',
        '卡片文件用于交换内容。若需保留进度和已记住标记，请在设置中导出 SQLite 备份。',
        'カードファイルは内容を交換します。進捗や覚えた印も保持するには設定で SQLite バックアップを出力してください。',
      ],
    'Each row has 5 fields: term, definition, pronunciation, notes, image. Only the first two are required. In definition, use partOfSpeech::meaning and | to add meanings.':
      [
        '각 행은 용어, 뜻, 발음, 노트, 이미지 5개 필드이며 처음 두 개만 필수입니다. 뜻은 partOfSpeech::meaning으로 쓰고 |로 추가하세요.',
        '每行 5 个字段：术语、释义、发音、笔记、图片。仅前两项必填。释义用 partOfSpeech::meaning，以 | 添加多个释义。',
        '各行は用語、意味、発音、ノート、画像の 5 項目です。最初の二つのみ必須です。意味は partOfSpeech::meaning とし、| で追加します。',
      ],
    Term: ['용어', '术语', '用語'],
    Definition: ['뜻', '释义', '意味'],
    'Look up English parts of speech ↗': [
      '영어 품사 찾아보기 ↗',
      '查阅英语词性 ↗',
      '英語の品詞を調べる ↗',
    ],
    'Open guide in a new tab': [
      '새 탭에서 안내 열기',
      '在新标签页打开指南',
      '新しいタブでガイドを開く',
    ],
    'Export cards': ['카드 내보내기', '导出卡片', 'カードをエクスポート'],
    'Study set exported to Excel.': [
      '학습 세트를 Excel로 내보냈습니다.',
      '已将学习集导出为 Excel。',
      '学習セットを Excel に出力しました。',
    ],
    'Study set exported to text.': [
      '학습 세트를 텍스트로 내보냈습니다.',
      '已将学习集导出为文本。',
      '学習セットをテキストに出力しました。',
    ],
    'Every word-class pair must include a meaning.': [
      '모든 품사 쌍에 뜻이 필요합니다.',
      '每组词性必须包含释义。',
      '各品詞の組み合わせに意味が必要です。',
    ],
    'Additional definitions must be a list of meanings.': [
      '추가 뜻은 뜻 목록이어야 합니다.',
      '补充释义必须是释义列表。',
      '追加の意味は意味のリストにしてください。',
    ],
    'Each card supports up to 20 meanings.': [
      '카드당 최대 20개의 뜻을 지원합니다.',
      '每张卡片最多支持 20 条释义。',
      '一枚のカードに最大 20 個の意味を保存できます。',
    ],
    'A card has one term and multiple meaning–word class pairs. Each meaning retains its own word class; only the term and first meaning are required.':
      [
        '카드는 용어 하나와 여러 뜻·품사 쌍으로 구성됩니다. 각 뜻의 품사를 따로 유지하며 용어와 첫 뜻만 필수입니다.',
        '一张卡片包含一个术语和多组释义与词性。每条释义保留自己的词性，仅术语和首条释义必填。',
        'カードは一つの用語と複数の意味・品詞で構成されます。各意味の品詞を個別に保持し、用語と最初の意味のみ必須です。',
      ],
    'Quick text import: 6 fields, with an optional speech language': [
      '빠른 텍스트 가져오기: 6개 필드, 음성 언어 선택',
      '快速文本导入：6 个字段，可选朗读语言',
      'テキストの簡単取り込み：6 項目と任意の読み上げ言語',
    ],
    'Without headers, the order is term, first meaning, first word class, pronunciation, notes, other meanings, speech language. Follow the six-field example below; field 7 is optional. Keep commas for empty fields.':
      [
        '헤더가 없으면 용어, 첫 뜻, 첫 품사, 발음, 노트, 다른 뜻, 음성 언어 순입니다. 아래 6개 필드 예시를 따르세요. 7번째는 선택이며 빈 필드의 쉼표도 유지하세요.',
        '无表头时顺序为术语、首条释义、首个词性、发音、笔记、其他释义、朗读语言。参考下方六字段示例，第 7 项可选。空字段保留逗号。',
        '見出しがない場合は用語、最初の意味、最初の品詞、発音、ノート、その他の意味、読み上げ言語の順です。下の 6 項目の例に従い、7 番目は任意です。空欄のカンマも残してください。',
      ],
    'For other meanings, write word class::meaning and separate pairs with |. For example v.::reserve|n.::records. If a meaning contains | or ::, use separate meaning columns or a JSON array.':
      [
        '다른 뜻은 품사::뜻으로 쓰고 |로 구분하세요. 예: v.::reserve|n.::records. 뜻에 |나 ::가 있으면 별도 열이나 JSON 배열을 사용하세요.',
        '其他释义使用 词性::释义，以 | 分隔，例如 v.::reserve|n.::records。释义含 | 或 :: 时请使用独立释义列或 JSON 数组。',
        'その他の意味は 品詞::意味 とし、| で区切ります。例：v.::reserve|n.::records。意味に | や :: が含まれる場合は個別の意味列や JSON 配列を使ってください。',
      ],
    'CSV, TXT and Excel with headers': [
      '헤더가 있는 CSV, TXT, Excel',
      '带表头的 CSV、TXT 和 Excel',
      '見出し付きの CSV・TXT・Excel',
    ],
    'Use headers to avoid confusing column order. Each row is one card: back pairs with partOfSpeech, back2 with partOfSpeech2, through back20 and partOfSpeech20. Keep a term’s meanings on the same row.':
      [
        '열 순서 혼동을 피하려면 헤더를 사용하세요. 행마다 카드 하나이며 back과 partOfSpeech부터 back20과 partOfSpeech20까지 짝을 이룹니다. 같은 용어의 뜻은 한 행에 두세요.',
        '使用表头避免列顺序混淆。每行一张卡片：back 对应 partOfSpeech，back2 对应 partOfSpeech2，直到 back20 与 partOfSpeech20。同一术语的释义放在同一行。',
        '列順の混乱を避けるため見出しを使います。一行が一枚で、back と partOfSpeech、back2 と partOfSpeech2 の組み合わせが back20 と partOfSpeech20 まで続きます。同じ用語の意味は同じ行に置いてください。',
      ],
    'In Excel, the first row contains headers and later rows contain cards. Enter one value per cell without adding quotes. FlashLab reads the first worksheet of .xlsx files. Save .xls files as .xlsx first.':
      [
        'Excel 첫 행은 헤더, 이후 행은 카드입니다. 셀마다 따옴표 없이 값을 하나씩 입력하세요. .xlsx의 첫 시트만 읽습니다. .xls는 먼저 .xlsx로 저장하세요.',
        'Excel 首行为表头，后续每行为卡片。每格一个值，无需加引号。FlashLab 只读取 .xlsx 的首个工作表；.xls 请先另存为 .xlsx。',
        'Excel の一行目は見出し、以降はカードです。セルごとに値を一つ、引用符を付けずに入力します。.xlsx の最初のシートのみ読み取ります。.xls は先に .xlsx で保存してください。',
      ],
    'CSV and TXT use commas and UTF-8. Wrap values containing commas, quotes or newlines in double quotes; double any quote inside the value. TSV uses tabs and the .tsv extension.':
      [
        'CSV와 TXT는 쉼표와 UTF-8을 사용합니다. 쉼표, 따옴표, 줄바꿈이 있는 값은 큰따옴표로 감싸고 내부 따옴표는 두 번 쓰세요. TSV는 탭과 .tsv 확장자를 사용합니다.',
        'CSV 和 TXT 使用逗号及 UTF-8。含逗号、引号或换行的值用双引号包围，内部双引号写两次。TSV 使用制表符和 .tsv 扩展名。',
        'CSV と TXT はカンマ区切りの UTF-8 です。カンマ、引用符、改行を含む値は二重引用符で囲み、内部の引用符は重ねて記します。TSV はタブ区切りで拡張子は .tsv です。',
      ],
    'Exporting and reimporting': [
      '내보내기 및 다시 가져오기',
      '导出与重新导入',
      'エクスポートと再取り込み',
    ],
    'In a study set, choose Export cards → CSV, Text or Excel. All three formats export separate meaning–word class columns and the speech language. Keep the header row when editing and reimporting. Example speech languages: en-US, vi-VN, zh-CN, ja-JP and ko-KR.':
      [
        '학습 세트에서 카드 내보내기 → CSV, 텍스트, Excel을 선택하세요. 모두 뜻·품사 개별 열과 음성 언어를 내보냅니다. 수정 후 다시 가져올 때 헤더를 유지하세요. 언어 예: en-US, vi-VN, zh-CN, ja-JP, ko-KR.',
        '在学习集中选择导出卡片 → CSV、文本或 Excel。三者都导出独立的释义与词性列及朗读语言。编辑重导时保留表头。语言示例：en-US、vi-VN、zh-CN、ja-JP、ko-KR。',
        '学習セットでカードのエクスポートから CSV、テキスト、Excel を選びます。すべての形式で意味・品詞の個別列と読み上げ言語を出力します。再取り込みでも見出しを残してください。言語例：en-US、vi-VN、zh-CN、ja-JP、ko-KR。',
      ],
    'Card files exchange vocabulary content. To keep images, progress and remembered marks, export a SQLite backup in Settings.':
      [
        '카드 파일은 어휘 내용을 교환합니다. 이미지, 진도, 암기 표시를 보존하려면 설정에서 SQLite 백업을 내보내세요.',
        '卡片文件用于交换词汇内容。若需保留图片、进度和记忆标记，请在设置中导出 SQLite 备份。',
        'カードファイルは単語の内容を交換します。画像、進捗、覚えた印も保持するには設定で SQLite バックアップを出力してください。',
      ],
    'Handling duplicate cards': [
      '중복 카드 처리',
      '处理重复卡片',
      '重複カードの処理',
    ],
    'Parts of speech and English abbreviations': [
      '품사와 영어 약어',
      '词性与英语缩写',
      '品詞と英語の略語',
    ],
    'FlashLab uses the following abbreviations consistently for each word meaning.':
      [
        'FlashLab은 각 뜻에 아래 품사 약어를 일관되게 사용합니다.',
        'FlashLab 为各条释义统一使用以下缩写。',
        'FlashLab では各意味に次の略語を統一して使います。',
      ],
    'Based on the remembered mark on flashcards.': [
      '카드의 암기 표시를 기준으로 합니다.',
      '根据卡片的已记住标记。',
      'カードの覚えた印に基づきます。',
    ],
    'Choose words to study': [
      '학습할 단어 선택',
      '选择学习词汇',
      '学習する単語を選択',
    ],
    'All words': ['모든 단어', '所有词汇', 'すべての単語'],
    'Remembered words': ['암기한 단어', '已记住的词汇', '覚えた単語'],
    'Unremembered words': [
      '아직 못 외운 단어',
      '未记住的词汇',
      'まだ覚えていない単語',
    ],
    'No words match this selection.': [
      '이 선택에 맞는 단어가 없습니다.',
      '没有符合此选择的词汇。',
      '条件に合う単語がありません。',
    ],
    'Import folder': ['폴더 가져오기', '导入文件夹', 'フォルダーを取り込む'],
    'Mastery details': ['숙달 상세', '掌握详情', '習得の詳細'],
    'Search sets or vocabulary...': [
      '학습 세트 또는 단어 검색...',
      '搜索学习集或词汇...',
      '学習セットや単語を検索...',
    ],
    'Vocabulary search results': [
      '단어 검색 결과',
      '词汇搜索结果',
      '単語の検索結果',
    ],
    'matching cards': ['일치하는 카드', '张匹配卡片', '枚の一致カード'],
    'No matching vocabulary.': [
      '일치하는 단어가 없습니다.',
      '没有匹配的词汇。',
      '一致する単語がありません。',
    ],
    'Back to reviews': ['복습으로 돌아가기', '返回复习', '復習に戻る'],
    'Compare duplicates': ['중복 비교', '比较重复项', '重複を比較'],
    'Duplicates are skipped by default. Overwriting replaces the content and resets the card’s progress.':
      [
        '중복은 기본적으로 건너뜁니다. 덮어쓰기는 내용을 교체하고 진도를 초기화합니다.',
        '默认跳过重复项。覆盖会替换内容并重置卡片进度。',
        '重複は既定でスキップします。上書きすると内容が置き換わり、進捗がリセットされます。',
      ],
    'imported cards are duplicates': [
      '가져온 카드가 중복입니다',
      '张导入卡片重复',
      '枚の取り込みカードが重複',
    ],
    Existing: ['기존', '已有', '既存'],
    Incoming: ['가져올 항목', '导入项', '取り込み対象'],
    Action: ['작업', '操作', '操作'],
    Skip: ['건너뛰기', '跳过', 'スキップ'],
    'Edit before importing': [
      '가져오기 전 편집',
      '导入前编辑',
      '取り込み前に編集',
    ],
    'Confirm import': ['가져오기 확인', '确认导入', '取り込みを確定'],
    'Term and meaning cannot be empty.': [
      '용어와 뜻은 비워 둘 수 없습니다.',
      '术语和释义不能为空。',
      '用語と意味は必須です。',
    ],
    'The edited term is still a duplicate. Edit it again or choose Skip.': [
      '수정한 용어도 중복입니다. 다시 수정하거나 건너뛰세요.',
      '修改后的术语仍重复，请再次编辑或跳过。',
      '編集後の用語も重複しています。再編集するかスキップしてください。',
    ],
    'CSV exports one card per row. The primary meaning is next to its part of speech; definitions stores meaning and partOfSpeech pairs for other meanings. Reimporting preserves these pairs.':
      [
        'CSV는 행마다 카드 하나를 내보냅니다. 첫 뜻은 품사 옆에 있으며 definitions에 다른 뜻의 meaning·partOfSpeech 쌍을 저장합니다. 다시 가져와도 유지됩니다.',
        'CSV 每行导出一张卡片。主要释义旁为其词性；definitions 保存其他 meaning 与 partOfSpeech 组合，重新导入会保留这些组合。',
        'CSV は一行一枚です。主な意味の隣に品詞を置き、definitions に他の meaning と partOfSpeech の組み合わせを保存します。再取り込みでも保持されます。',
      ],
    'Bulk imports show duplicates for comparison. Skip, overwrite, or edit the term and meaning before importing.':
      [
        '일괄 가져오기는 중복 비교를 표시합니다. 건너뛰기, 덮어쓰기 또는 용어와 뜻 편집을 선택하세요.',
        '批量导入会显示重复比较，可跳过、覆盖或在导入前编辑术语和释义。',
        '一括取り込みでは重複を比較できます。スキップ、上書き、用語と意味の編集を選んでください。',
      ],
    'To import a separate part of speech for each meaning, field 6 accepts a JSON array with meaning and partOfSpeech. The | format is still supported; edit each meaning’s part of speech after importing.':
      [
        '각 뜻의 품사를 가져오려면 6번째 필드에 meaning과 partOfSpeech의 JSON 배열을 사용하세요. | 형식도 지원하며 가져온 후 품사를 개별 수정할 수 있습니다.',
        '第 6 字段接受包含 meaning 和 partOfSpeech 的 JSON 数组，支持为每条释义导入独立词性。仍支持 | 格式，导入后可编辑各释义词性。',
        '各意味の品詞を取り込むには 6 番目の項目に meaning と partOfSpeech の JSON 配列を使います。| 形式も使え、取り込み後に各品詞を編集できます。',
      ],
    'Each meaning has its own part of speech. Any saved meaning is accepted as a correct answer.':
      [
        '각 뜻은 개별 품사가 있으며 저장된 뜻 중 하나면 정답으로 인정됩니다.',
        '每条释义有独立词性，任一已保存释义均可作为正确答案。',
        '各意味には個別の品詞があり、保存済みのどの意味でも正解になります。',
      ],
    Meaning: ['뜻', '释义', '意味'],
    Optional: ['선택 사항', '可选', '任意'],
    'Progress toward level': ['레벨 진행도', '升级进度', 'レベルの進捗'],
    'Total correct answers': ['총 정답 수', '总答对数', '正答の合計'],
    'Correct answers for this card at the current level / minimum required. Both the total and every required mode must be completed.':
      [
        '현재 레벨에서 이 카드의 정답 수 / 최소 요구치입니다. 총합과 모든 필수 모드를 완료해야 합니다.',
        '此卡当前等级答对数 / 最低要求。总数及各必需模式均须完成。',
        '現在のレベルでの正答数 / 最低条件です。合計と各必須モードの両方を満たす必要があります。',
      ],
    'Reviews are scheduled according to the card’s earned memory level.': [
      '획득한 암기 레벨에 따라 복습을 예약합니다.',
      '按卡片已达到的记忆等级安排复习。',
      'カードの記憶レベルに基づいて復習を予定します。',
    ],
    'Levels and mastery': ['레벨과 숙달', '等级与掌握', 'レベルと習得'],
    'Customize color': ['색상 사용자 지정', '自定义颜色', '色をカスタマイズ'],
    'Find users': ['사용자 찾기', '查找用户', 'ユーザーを検索'],
    'Search by name or ID…': [
      '이름 또는 ID 검색…',
      '按名称或 ID 搜索…',
      '名前や ID で検索…',
    ],
    'No matching users found.': [
      '일치하는 사용자가 없습니다.',
      '没有匹配的用户。',
      '一致するユーザーが見つかりません。',
    ],
    'User name': ['사용자 이름', '用户名', 'ユーザー名'],
    Rename: ['이름 변경', '重命名', '名前を変更'],
    'User renamed.': [
      '이름을 변경했습니다.',
      '已重命名用户。',
      'ユーザー名を変更しました。',
    ],
    'Could not rename user.': [
      '이름을 변경할 수 없습니다.',
      '无法重命名用户。',
      'ユーザー名を変更できません。',
    ],
    'Change avatar': ['아바타 변경', '更换头像', 'アバターを変更'],
    'Choose an avatar': ['아바타 선택', '选择头像', 'アバターを選択'],
    'Levels 1–6 require 3, 5, 8, 12, 18 and 25 correct answers at each level. Progress resets after promotion. A wrong answer resets the card to level 0. Level 3 and above count as mastered.':
      [
        '레벨 1–6은 각각 정답 3, 5, 8, 12, 18, 25회가 필요합니다. 승급 후 진도가 초기화됩니다. 오답은 레벨 0으로 초기화하며 레벨 3 이상은 숙달입니다.',
        '1–6 级分别需要答对 3、5、8、12、18、25 次，升级后重置进度。答错重置为 0 级；3 级及以上为掌握。',
        'レベル 1～6 は各 3、5、8、12、18、25 回の正答が必要です。昇格後は進捗をリセットし、誤答でレベル 0 になります。3 以上が習得済みです。',
      ],
    'Level 3 requires Learn, Write and Test. Levels 4–6 require Flashcards (or Review), Learn, Write, Match and Test at the current level. Levels 3–6 require at least 1, 1, 2 and 3 correct Test answers respectively. Repeating just one mode cannot earn higher levels.':
      [
        '레벨 3은 학습, 쓰기, 시험이 필요합니다. 레벨 4–6은 현재 레벨에서 카드(또는 복습), 학습, 쓰기, 짝 맞추기, 시험을 해야 합니다. 레벨 3–6의 시험 정답 최소치는 각각 1, 1, 2, 3회입니다. 한 모드만 반복해서는 승급할 수 없습니다.',
        '3 级需完成学习、书写和测试；4–6 级需在当前等级完成卡片（或复习）、学习、书写、配对和测试。3–6 级分别至少答对 1、1、2、3 道测试题。只重复单一模式无法升级。',
        'レベル 3 は学習・記述・テストが必要です。4～6 は現在のレベルでカード（または復習）、学習、記述、マッチ、テストが必要です。3～6 のテスト正答は最低各 1、1、2、3 回です。一つのモードだけでは昇格できません。',
      ],
    'Mastered: reach level 3 through repeated correct answers, multiple modes and tests.':
      [
        '숙달: 여러 모드와 시험에서 반복 정답으로 레벨 3에 도달합니다.',
        '掌握：通过多模式与测试反复答对，达到 3 级。',
        '習得済み：複数のモードとテストで正答を重ね、レベル 3 に到達。',
      ],
    'The six intervals must increase. Promotion requires enough correct answers and practice modes; wrong answers reset the card to level 0.':
      [
        '6개 간격은 증가해야 합니다. 승급에는 충분한 정답과 연습 모드가 필요하며 오답은 레벨 0으로 초기화합니다.',
        '六个间隔须递增。升级需要足够的答对数和练习模式；答错重置为 0 级。',
        '六つの間隔は昇順です。昇格には十分な正答と練習モードが必要で、誤答はレベル 0 に戻ります。',
      ],
    'means level 3 or above, earned through repeated correct answers in Learn, Write and Test. Higher levels require all practice modes. Wrong answers reset the card to level 0.':
      [
        '학습, 쓰기, 시험의 반복 정답으로 레벨 3 이상에 도달한 상태입니다. 상위 레벨은 모든 연습 모드가 필요하며 오답은 레벨 0으로 초기화합니다.',
        '表示通过学习、书写和测试反复答对达到 3 级以上。更高等级需要所有练习模式；答错重置为 0 级。',
        '学習・記述・テストで正答を重ねたレベル 3 以上です。上位レベルには全練習モードが必要で、誤答はレベル 0 に戻ります。',
      ],
    'Maximum level reached': [
      '최고 레벨 도달',
      '已达最高等级',
      '最高レベルに到達',
    ],
    'In Add or Edit card, choose Add definition to save other meanings. Written answers accept any saved meaning; multiple-choice questions show only one correct meaning. All meanings belong to one card and share its memory level.':
      [
        '카드 추가 또는 편집에서 뜻 추가를 선택하세요. 쓰기는 저장된 뜻 중 하나를 인정하며 선택형은 정답 뜻 하나를 표시합니다. 모든 뜻은 한 카드와 암기 레벨을 공유합니다.',
        '添加或编辑卡片时选择添加释义。书写接受任一保存释义，选择题只显示一个正确释义。所有释义属于同一卡片并共享记忆等级。',
        'カードの追加・編集で意味を追加します。記述はいずれの保存済みの意味でも正解で、選択式は一つの正しい意味を表示します。すべての意味が一枚のカードと記憶レベルを共有します。',
      ],
    'Each field holds a separate meaning. Any saved meaning is accepted as a correct answer.':
      [
        '각 칸은 별도 뜻입니다. 저장된 뜻 중 하나면 정답입니다.',
        '每个输入框为独立释义，任一保存释义均算正确。',
        '各欄に別の意味を入れます。保存済みのどの意味でも正解です。',
      ],
    'Remove definition': ['뜻 삭제', '删除释义', '意味を削除'],
    'Add definition': ['뜻 추가', '添加释义', '意味を追加'],
    'Other definitions': ['다른 뜻', '其他释义', 'その他の意味'],
    'The plus button creates a set, class, card, post or note. Hover over it to see its action.':
      [
        '+ 버튼으로 세트, 클래스, 카드, 게시물, 노트를 만듭니다. 마우스를 올리면 동작을 볼 수 있습니다.',
        '+ 按钮用于创建学习集、班级、卡片、文章或笔记。悬停查看具体操作。',
        '+ ボタンでセット、クラス、カード、記事、ノートを作成します。カーソルを重ねると操作が分かります。',
      ],
    'Use the formatting toolbar or write Markdown. Choose the language when inserting code: cpp or c++ for C++, markdown or md for Markdown, and text for plain text. Import or download .md files.':
      [
        '서식 도구나 Markdown을 사용하세요. 코드 삽입 시 언어는 C++에 cpp/c++, Markdown에 markdown/md, 일반 텍스트에 text입니다. .md를 가져오거나 다운로드할 수 있습니다.',
        '使用格式工具栏或 Markdown。插入代码时选择语言：C++ 用 cpp/c++，Markdown 用 markdown/md，纯文本用 text。支持导入和下载 .md。',
        'ツールバーまたは Markdown を使います。コード言語は C++ が cpp/c++、Markdown が markdown/md、プレーンテキストが text です。.md を取り込み・ダウンロードできます。',
      ],
    'In Test, enter or select an answer, then choose Confirm. Editing an answer clears its confirmation. Confirm all answers before submitting.':
      [
        '시험에서 답을 입력·선택한 후 확인하세요. 수정하면 확인이 해제됩니다. 제출 전 모든 답을 확인하세요.',
        '测试中输入或选择答案后确认。编辑会清除确认状态，提交前须确认全部答案。',
        'テストでは解答を入力・選択して確定します。編集すると確定が解除されます。提出前にすべて確定してください。',
      ],
    'state.json stores sets, progress, preferences and notes. CSV files in materials are generated from this data; import external CSV changes through the app to apply them.':
      [
        'state.json은 세트, 진도, 설정, 노트를 저장합니다. materials의 CSV는 이 데이터로 생성되며 외부 수정은 앱에서 가져와 적용하세요.',
        'state.json 保存学习集、进度、偏好与笔记。materials 中的 CSV 由此生成；外部修改须通过应用导入才生效。',
        'state.json にセット、進捗、設定、ノートを保存します。materials の CSV はここから生成され、外部の変更はアプリから取り込んで適用します。',
      ],
    'Open Settings → Export user ZIP. To restore, extract the ZIP, open the user menu → Import user folder, and select the extracted folder. Personal notes are included in profile backups; shared posts require a separate backup of the blog folder.':
      [
        '설정에서 사용자 ZIP을 내보내세요. 복원 시 ZIP을 풀고 사용자 메뉴의 사용자 폴더 가져오기에서 선택하세요. 개인 노트는 프로필 백업에 포함되며 공유 게시물은 blog 폴더를 따로 백업하세요.',
        '在设置中导出用户 ZIP。恢复时解压，通过用户菜单导入解压的用户文件夹。个人笔记包含在资料备份中，共享文章需另行备份 blog 文件夹。',
        '設定からユーザー ZIP を出力します。復元時は解凍し、ユーザーメニューでフォルダーを取り込みます。個人ノートはプロフィールのバックアップに含まれ、共有記事は blog フォルダーを別途バックアップします。',
      ],
    'Posts and notes': ['게시물과 노트', '文章与笔记', '記事とノート'],
    'Study and review': ['학습과 복습', '学习与复习', '学習と復習'],
    'Data storage': ['데이터 저장', '数据存储', 'データの保存'],
    'Backup and restore': ['백업과 복원', '备份与恢复', 'バックアップと復元'],
    'View help on Overview →': [
      '개요에서 도움말 보기 →',
      '在概览查看帮助 →',
      '概要でヘルプを見る →',
    ],
    'Reference when needed': [
      '필요할 때 참고하세요',
      '需要时查阅',
      '必要なときに参照',
    ],
    Help: ['도움말', '帮助', 'ヘルプ'],
    'Bulk import vocabulary': [
      '단어 일괄 가져오기',
      '批量导入词汇',
      '単語を一括取り込み',
    ],
    'Note not found': [
      '노트를 찾을 수 없습니다',
      '找不到笔记',
      'ノートが見つかりません',
    ],
    'Saving note…': ['노트 저장 중…', '正在保存笔记…', 'ノートを保存中…'],
    'Start writing your note…': [
      '노트를 작성하세요…',
      '开始写笔记…',
      'ノートを書き始める…',
    ],
    'Give your note a title…': [
      '노트 제목을 입력하세요…',
      '输入笔记标题…',
      'ノートのタイトルを入力…',
    ],
    'Notes pagination': ['노트 페이지', '笔记分页', 'ノートのページ切り替え'],
    'Choose a Markdown file ending in .md or .markdown.': [
      '.md 또는 .markdown 파일을 선택하세요.',
      '请选择 .md 或 .markdown 文件。',
      '.md または .markdown ファイルを選んでください。',
    ],
    'Import vocabulary only from .txt, .csv, .tsv or .xlsx files.': [
      '단어는 .txt, .csv, .tsv, .xlsx 파일만 가져올 수 있습니다.',
      '词汇仅支持导入 .txt、.csv、.tsv 或 .xlsx。',
      '単語は .txt、.csv、.tsv、.xlsx から取り込めます。',
    ],
    'PNG, JPEG, WebP or GIF · up to 100 KB': [
      'PNG, JPEG, WebP, GIF · 최대 100 KB',
      'PNG、JPEG、WebP 或 GIF · 最大 100 KB',
      'PNG・JPEG・WebP・GIF · 最大 100 KB',
    ],
    'Loading content…': [
      '내용 불러오는 중…',
      '正在加载内容…',
      '内容を読み込み中…',
    ],
    'Add a speechLanguage column if you need a reading language, such as en-US, vi-VN, zh-CN, ja-JP or ko-KR. Save .xls files as .xlsx first.':
      [
        '읽기 언어가 필요하면 speechLanguage 열에 en-US, vi-VN, zh-CN, ja-JP, ko-KR 등을 추가하세요. .xls는 먼저 .xlsx로 저장하세요.',
        '需要朗读语言时添加 speechLanguage 列，如 en-US、vi-VN、zh-CN、ja-JP 或 ko-KR。.xls 请先另存为 .xlsx。',
        '読み上げ言語が必要なら speechLanguage 列に en-US、vi-VN、zh-CN、ja-JP、ko-KR などを追加します。.xls は先に .xlsx で保存してください。',
      ],
    'Column headers are optional. CSV and Excel support the names below; columns may be reordered when headers are present. TSV files use tabs and the .tsv extension.':
      [
        '열 헤더는 선택입니다. CSV와 Excel은 아래 이름을 지원하며 헤더가 있으면 순서를 바꿔도 됩니다. TSV는 탭과 .tsv 확장자를 사용합니다.',
        '表头可选，CSV 和 Excel 支持下列名称，有表头时可调换列顺序。TSV 用制表符和 .tsv 扩展名。',
        '見出しは任意です。CSV と Excel は下記の名前に対応し、見出しがあれば列順を変更できます。TSV はタブ区切りで .tsv を使います。',
      ],
    'Column headers and TSV': ['열 헤더와 TSV', '表头与 TSV', '列見出しと TSV'],
    'Use columns A–F in the order above, one card per row. Only the first worksheet is read. Excel cells do not need added double quotes. Save as .xlsx and choose Import Excel / CSV.':
      [
        'A–F 열을 위 순서로 사용하고 행마다 카드 하나를 입력하세요. 첫 시트만 읽으며 큰따옴표는 필요 없습니다. .xlsx로 저장한 뒤 Excel / CSV 가져오기를 선택하세요.',
        '按上述顺序使用 A–F 列，每行一张卡片。仅读取首个工作表，单元格无需额外双引号。保存为 .xlsx 后选择导入 Excel / CSV。',
        'A～F 列を上記の順に使い、一行一枚で入力します。最初のシートのみ読み取り、二重引用符は不要です。.xlsx で保存して Excel / CSV の取り込みを選びます。',
      ],
    'Enclose fields containing commas or line breaks in double quotes. Use two consecutive double quotes for a literal double quote inside a field.':
      [
        '쉼표나 줄바꿈이 있는 필드는 큰따옴표로 감싸세요. 필드 안의 큰따옴표는 연속 두 개로 쓰세요.',
        '含逗号或换行的字段用双引号包围，字段内的双引号连续写两次。',
        'カンマや改行を含む項目は二重引用符で囲み、内部の二重引用符は二つ続けて記します。',
      ],
    'Each line is a card. Separate fields with commas, keeping commas for empty fields. Save files as UTF-8 to preserve accents.':
      [
        '한 줄이 카드 하나입니다. 쉼표로 구분하며 빈 필드도 쉼표를 유지하세요. 문자가 깨지지 않도록 UTF-8로 저장하세요.',
        '每行一张卡片，以逗号分隔，空字段也保留逗号。用 UTF-8 保存以保留字符。',
        '一行が一枚です。カンマで区切り、空欄のカンマも残してください。文字を保つため UTF-8 で保存します。',
      ],
    'Text (.txt) / CSV (.csv)': [
      '텍스트 (.txt) / CSV (.csv)',
      '文本 (.txt) / CSV (.csv)',
      'テキスト (.txt) / CSV (.csv)',
    ],
    'Order: term, definition, part of speech, pronunciation, notes, other definitions. The first two fields are required; the last four may be blank. Separate other meanings in the sixth field with |.':
      [
        '순서는 용어, 뜻, 품사, 발음, 노트, 다른 뜻입니다. 처음 두 필드만 필수이며 나머지는 비워도 됩니다. 6번째 필드의 다른 뜻은 |로 구분하세요.',
        '顺序：术语、释义、词性、发音、笔记、其他释义。前两项必填，后四项可空。第六项的其他释义用 | 分隔。',
        '用語、意味、品詞、発音、ノート、その他の意味の順です。最初の二つは必須で後四つは空欄可です。6 番目の意味は | で区切ります。',
      ],
    'Text, Excel and CSV import guide': [
      '텍스트, Excel, CSV 가져오기 안내',
      '文本、Excel 和 CSV 导入指南',
      'テキスト・Excel・CSV の取り込みガイド',
    ],
    'Each line has up to six comma-separated fields: term, definition, part of speech, pronunciation, notes, other definitions. Only the first two are required. Separate other meanings with |.':
      [
        '각 줄은 쉼표로 구분한 최대 6개 필드: 용어, 뜻, 품사, 발음, 노트, 다른 뜻입니다. 처음 두 개만 필수이며 다른 뜻은 |로 구분하세요.',
        '每行最多六个逗号分隔字段：术语、释义、词性、发音、笔记、其他释义。仅前两项必填，其他释义用 | 分隔。',
        '各行は用語、意味、品詞、発音、ノート、その他の意味の最大 6 項目をカンマで区切ります。最初の二つのみ必須で、その他の意味は | で区切ります。',
      ],
    'Text, Excel and CSV use the same five-field order.': [
      '텍스트, Excel, CSV는 같은 5개 필드 순서를 사용합니다.',
      '文本、Excel 和 CSV 使用相同的五字段顺序。',
      'テキスト・Excel・CSV は同じ 5 項目の順序を使います。',
    ],
    'Vocabulary import guide': [
      '단어 가져오기 안내',
      '词汇导入指南',
      '単語の取り込みガイド',
    ],
    'Import guide': ['가져오기 안내', '导入指南', '取り込みガイド'],
    'Import text': ['텍스트 가져오기', '导入文本', 'テキストを取り込む'],
    'Images in notes must be 100 KB or smaller.': [
      '노트 이미지는 100 KB 이하여야 합니다.',
      '笔记图片须不超过 100 KB。',
      'ノートの画像は 100 KB 以下にしてください。',
    ],
    'Delete this personal note?': [
      '이 개인 노트를 삭제할까요?',
      '删除此个人笔记？',
      'この個人ノートを削除しますか？',
    ],
    'Delete note?': [
      '노트를 삭제할까요?',
      '删除笔记？',
      'ノートを削除しますか？',
    ],
    'Delete note': ['노트 삭제', '删除笔记', 'ノートを削除'],
    'Up to 500 notes and 5,000,000 content characters.': [
      '최대 노트 500개, 본문 5,000,000자입니다.',
      '最多 500 篇笔记，正文总计 5,000,000 字符。',
      '最大 500 件のノート、本文合計 5,000,000 文字です。',
    ],
    'Notes require a title and content, up to 200,000 characters.': [
      '노트는 제목과 본문이 필요하며 최대 200,000자입니다.',
      '笔记需有标题和内容，最多 200,000 字符。',
      'ノートにはタイトルと本文が必要で、最大 200,000 文字です。',
    ],
    'This note has changed. Reload it before editing.': [
      '노트가 변경되었습니다. 다시 불러온 뒤 편집하세요.',
      '此笔记已更改，编辑前请重新加载。',
      'ノートが変更されています。読み込み直してから編集してください。',
    ],
    'Unable to save the note.': [
      '노트를 저장할 수 없습니다.',
      '无法保存笔记。',
      'ノートを保存できません。',
    ],
    'Note not found.': [
      '노트를 찾을 수 없습니다.',
      '找不到笔记。',
      'ノートが見つかりません。',
    ],
    'Loading notes…': [
      '노트 불러오는 중…',
      '正在加载笔记…',
      'ノートを読み込み中…',
    ],
    'Write a new note or try another search.': [
      '새 노트를 작성하거나 다른 검색어를 사용하세요.',
      '撰写新笔记或尝试其他搜索。',
      '新しいノートを書くか、別の条件で検索してください。',
    ],
    'No matching notes': [
      '일치하는 노트 없음',
      '没有匹配的笔记',
      '一致するノートがありません',
    ],
    '← All notes': ['← 모든 노트', '← 所有笔记', '← すべてのノート'],
    'Read note': ['노트 읽기', '阅读笔记', 'ノートを読む'],
    'Find notes': ['노트 찾기', '查找笔记', 'ノートを検索'],
    'Save note': ['노트 저장', '保存笔记', 'ノートを保存'],
    'Edit note': ['노트 편집', '编辑笔记', 'ノートを編集'],
    'Write note': ['노트 작성', '写笔记', 'ノートを書く'],
    'Notes are saved separately for each user and included in profile backups.':
      [
        '노트는 사용자별로 저장되며 프로필 백업에 포함됩니다.',
        '笔记按用户分别保存，并包含在个人资料备份中。',
        'ノートはユーザー別に保存され、プロフィールのバックアップに含まれます。',
      ],
    'Personal notes': ['개인 노트', '个人笔记', '個人ノート'],
    PERSONAL: ['개인', '个人', '個人'],
    NOTES: ['노트', '笔记', 'ノート'],
    'Unable to load posts.': [
      '게시물을 불러올 수 없습니다.',
      '无法加载文章。',
      '記事を読み込めません。',
    ],
    'Loading posts…': [
      '게시물 불러오는 중…',
      '正在加载文章…',
      '記事を読み込み中…',
    ],
    'Learning blog': ['학습 블로그', '学习博客', '学習ブログ'],
    BLOG: ['블로그', '博客', 'ブログ'],
    Blog: ['블로그', '博客', 'ブログ'],
    'Level updates when the session ends': [
      '세션 종료 시 레벨 갱신',
      '学习结束时更新等级',
      'セッション終了時にレベル更新',
    ],
    'Saved memory level: correct answers advance 1 level (up to 6); incorrect answers reset to 0. Level 3 or higher counts as mastered.':
      [
        '암기 레벨: 정답은 1단계 상승(최대 6), 오답은 0으로 초기화합니다. 3 이상은 숙달입니다.',
        '记忆等级：答对升 1 级（最高 6），答错归零。3 级及以上为掌握。',
        '記憶レベル：正答で 1 上昇（最大 6）、誤答で 0 に戻ります。3 以上が習得済みです。',
      ],
    'Needs relearning': ['재학습 필요', '需要重学', '再学習が必要'],
    Learning: ['학습 중', '学习中', '学習中'],
    Mastered: ['숙달', '已掌握', '習得済み'],
    'BACK UP BEFORE DELETING': [
      '삭제 전 백업',
      '删除前备份',
      '削除前にバックアップ',
    ],
    'Would you like to download a SQLite backup before deleting?': [
      '삭제 전에 SQLite 백업을 다운로드할까요?',
      '删除前是否下载 SQLite 备份？',
      '削除前に SQLite バックアップをダウンロードしますか？',
    ],
    'Back up database, then delete': [
      '데이터베이스 백업 후 삭제',
      '备份数据库后删除',
      'データベースをバックアップして削除',
    ],
    'Delete without backup': [
      '백업 없이 삭제',
      '不备份直接删除',
      'バックアップせず削除',
    ],
    'The SQLite download has been sent to your browser. Check that the file is saved before deleting the user.':
      [
        'SQLite 다운로드를 브라우저로 보냈습니다. 사용자 삭제 전 파일 저장을 확인하세요.',
        '已向浏览器发送 SQLite 下载，删除用户前请确认文件已保存。',
        'SQLite のダウンロードをブラウザーに送信しました。ユーザー削除前に保存を確認してください。',
      ],
    'Have you saved the backup?': [
      '백업을 저장했나요?',
      '备份已保存吗？',
      'バックアップを保存しましたか？',
    ],
    'Saved, delete user': [
      '저장 완료, 사용자 삭제',
      '已保存，删除用户',
      '保存済み、ユーザーを削除',
    ],
    'Keep user': ['사용자 유지', '保留用户', 'ユーザーを残す'],
    'The SQLite backup is invalid. The user has not been deleted.': [
      'SQLite 백업이 올바르지 않습니다. 사용자는 삭제되지 않았습니다.',
      'SQLite 备份无效，未删除用户。',
      'SQLite バックアップが無効です。ユーザーは削除していません。',
    ],
    'Only the owner can edit or delete this post.': [
      '작성자만 이 게시물을 수정·삭제할 수 있습니다.',
      '只有作者可以编辑或删除此文章。',
      'この記事は所有者のみ編集・削除できます。',
    ],
    'Delete post': ['게시물 삭제', '删除文章', '記事を削除'],
    'Delete post?': [
      '게시물을 삭제할까요?',
      '删除文章？',
      '記事を削除しますか？',
    ],
    'Delete this post? Its content will be removed from the shared blog.': [
      '이 게시물을 삭제할까요? 공유 블로그에서 내용이 삭제됩니다.',
      '删除此文章？内容将从共享博客中移除。',
      'この記事を削除しますか？共有ブログから内容が削除されます。',
    ],
    'Unable to delete the post.': [
      '게시물을 삭제할 수 없습니다.',
      '无法删除文章。',
      '記事を削除できません。',
    ],
    'This older post has no verified owner and is read-only.': [
      '이전 게시물의 소유자가 확인되지 않아 읽기 전용입니다.',
      '旧文章无已验证所有者，仅可阅读。',
      'この古い記事は所有者が未確認のため読み取り専用です。',
    ],
    'Insert Mermaid diagram': [
      'Mermaid 다이어그램 삽입',
      '插入 Mermaid 图',
      'Mermaid 図を挿入',
    ],
    'Insert PlantUML diagram': [
      'PlantUML 다이어그램 삽입',
      '插入 PlantUML 图',
      'PlantUML 図を挿入',
    ],
    'Rendering diagram…': [
      '다이어그램 렌더링 중…',
      '正在绘制图表…',
      '図を描画中…',
    ],
    'Diagram source': ['다이어그램 소스', '图表源码', '図のソース'],
    Diagram: ['다이어그램', '图表', '図'],
    'Unable to render this diagram. Check the source below.': [
      '다이어그램을 렌더링할 수 없습니다. 아래 소스를 확인하세요.',
      '无法绘制此图，请检查下方源码。',
      '図を描画できません。下のソースを確認してください。',
    ],
    'Delete session': ['세션 삭제', '删除学习记录', 'セッションを削除'],
    'Delete session?': [
      '세션을 삭제할까요?',
      '删除此学习记录？',
      'セッションを削除しますか？',
    ],
    'Delete this session record? Card progress, review dates and study statistics will be kept.':
      [
        '세션 기록을 삭제할까요? 카드 진도, 복습 날짜, 학습 통계는 유지됩니다.',
        '删除此学习记录？卡片进度、复习日期和学习统计将保留。',
        'セッション記録を削除しますか？カードの進捗、復習日、学習統計は保持されます。',
      ],
    'Session deleted.': [
      '세션을 삭제했습니다.',
      '已删除学习记录。',
      'セッションを削除しました。',
    ],
    'Posts are shared with everyone on this server.': [
      '게시물은 이 서버의 모든 사용자와 공유됩니다.',
      '文章与此服务器的所有用户共享。',
      '記事はこのサーバーの全員と共有されます。',
    ],
    'Write a post': ['게시물 작성', '撰写文章', '記事を書く'],
    'No matching posts': [
      '일치하는 게시물 없음',
      '没有匹配的文章',
      '一致する記事がありません',
    ],
    'Write a new post or try a different search.': [
      '새 게시물을 작성하거나 다른 검색어를 사용하세요.',
      '撰写新文章或尝试其他搜索。',
      '新しい記事を書くか、別の条件で検索してください。',
    ],
    'Read post': ['게시물 읽기', '阅读文章', '記事を読む'],
    'Search posts': ['게시물 검색', '搜索文章', '記事を検索'],
    'Search by title, author or content…': [
      '제목, 작성자, 내용 검색…',
      '搜索标题、作者或内容…',
      'タイトル・著者・内容で検索…',
    ],
    'Post pagination': ['게시물 페이지', '文章分页', '記事のページ切り替え'],
    '← All posts': ['← 모든 게시물', '← 所有文章', '← すべての記事'],
    'All posts': ['모든 게시물', '所有文章', 'すべての記事'],
    'Edit post': ['게시물 편집', '编辑文章', '記事を編集'],
    'Download .md': ['.md 다운로드', '下载 .md', '.md をダウンロード'],
    '← Back': ['← 뒤로', '← 返回', '← 戻る'],
    'Write a new post': ['새 게시물 작성', '撰写新文章', '新しい記事を書く'],
    'Write Markdown directly or use the toolbar to insert formatting.': [
      'Markdown을 직접 쓰거나 도구 모음으로 서식을 넣으세요.',
      '直接书写 Markdown 或使用工具栏插入格式。',
      'Markdown を直接書くかツールバーで書式を挿入します。',
    ],
    Title: ['제목', '标题', 'タイトル'],
    Author: ['작성자', '作者', '著者'],
    'Give your post a title…': [
      '게시물 제목을 입력하세요…',
      '输入文章标题…',
      '記事のタイトルを入力…',
    ],
    'Formatting tools': ['서식 도구', '格式工具', '書式ツール'],
    'Import .md': ['.md 가져오기', '导入 .md', '.md を取り込む'],
    'Editor view': ['편집기 보기', '编辑器视图', 'エディター表示'],
    Write: ['쓰기', '书写', '記述'],
    'Split view': ['분할 보기', '分栏视图', '分割表示'],
    Preview: ['미리 보기', '预览', 'プレビュー'],
    'Markdown formatting': ['Markdown 서식', 'Markdown 格式', 'Markdown 書式'],
    'Markdown content': ['Markdown 내용', 'Markdown 内容', 'Markdown 本文'],
    'Start writing…': ['작성을 시작하세요…', '开始书写…', '書き始める…'],
    'Live preview': ['실시간 미리 보기', '实时预览', 'ライブプレビュー'],
    'Tip: select text, then choose a tool. Ctrl/Cmd+B for bold, Ctrl/Cmd+I for italic. Supports tables, lists, task lists, links, images and code blocks.':
      [
        '텍스트를 선택하고 도구를 고르세요. Ctrl/Cmd+B는 굵게, Ctrl/Cmd+I는 기울임입니다. 표, 목록, 할 일, 링크, 이미지, 코드 블록을 지원합니다.',
        '选择文本后使用工具。Ctrl/Cmd+B 加粗，Ctrl/Cmd+I 斜体。支持表格、列表、任务、链接、图片和代码块。',
        '文字を選んでツールを使います。Ctrl/Cmd+B で太字、Ctrl/Cmd+I で斜体。表、リスト、タスク、リンク、画像、コードブロックに対応します。',
      ],
    'Save changes': ['변경 사항 저장', '保存更改', '変更を保存'],
    'Publish post': ['게시물 게시', '发布文章', '記事を公開'],
    Undo: ['실행 취소', '撤销', '元に戻す'],
    Redo: ['다시 실행', '重做', 'やり直す'],
    Bold: ['굵게', '加粗', '太字'],
    Italic: ['기울임', '斜体', '斜体'],
    Strikethrough: ['취소선', '删除线', '取り消し線'],
    'Heading 1': ['제목 1', '一级标题', '見出し 1'],
    'Heading 2': ['제목 2', '二级标题', '見出し 2'],
    'Heading 3': ['제목 3', '三级标题', '見出し 3'],
    'Bulleted list': ['글머리 기호 목록', '无序列表', '箇条書き'],
    'Numbered list': ['번호 목록', '有序列表', '番号付きリスト'],
    'Task list': ['할 일 목록', '任务列表', 'タスクリスト'],
    Quote: ['인용', '引用', '引用'],
    'Inline code': ['인라인 코드', '行内代码', 'インラインコード'],
    'Or choose an image from your device': [
      '또는 기기에서 이미지 선택',
      '或从设备选择图片',
      'または端末から画像を選択',
    ],
    'PNG, JPEG, WebP or GIF · up to 2 MB': [
      'PNG, JPEG, WebP, GIF · 최대 2 MB',
      'PNG、JPEG、WebP 或 GIF · 最大 2 MB',
      'PNG・JPEG・WebP・GIF · 最大 2 MB',
    ],
    'Choose a PNG, JPEG, WebP or GIF image up to 2 MB.': [
      '2 MB 이하의 PNG, JPEG, WebP, GIF를 선택하세요.',
      '请选择不超过 2 MB 的 PNG、JPEG、WebP 或 GIF。',
      '2 MB 以下の PNG・JPEG・WebP・GIF を選んでください。',
    ],
    'Uploading image…': [
      '이미지 업로드 중…',
      '正在上传图片…',
      '画像をアップロード中…',
    ],
    'Could not read the image.': [
      '이미지를 읽을 수 없습니다.',
      '无法读取图片。',
      '画像を読み取れません。',
    ],
    'Could not upload the image.': [
      '이미지를 업로드할 수 없습니다.',
      '无法上传图片。',
      '画像をアップロードできません。',
    ],
    'Image ready. Click Insert to add it to the post.': [
      '이미지가 준비되었습니다. 삽입을 눌러 게시물에 추가하세요.',
      '图片已就绪，点击插入以添加到文章。',
      '画像の準備ができました。挿入を押して記事に追加してください。',
    ],
    'Code block': ['코드 블록', '代码块', 'コードブロック'],
    Copy: ['복사', '复制', 'コピー'],
    Copied: ['복사됨', '已复制', 'コピー済み'],
    'Copy failed': ['복사 실패', '复制失败', 'コピーに失敗'],
    'Code language': ['코드 언어', '代码语言', 'コードの言語'],
    'Auto detect': ['자동 감지', '自动检测', '自動検出'],
    'Plain text': ['일반 텍스트', '纯文本', 'プレーンテキスト'],
    'Insert link': ['링크 삽입', '插入链接', 'リンクを挿入'],
    'Insert image': ['이미지 삽입', '插入图片', '画像を挿入'],
    'Insert table': ['표 삽입', '插入表格', '表を挿入'],
    'Horizontal rule': ['가로 구분선', '水平线', '水平線'],
    'Content table': ['내용 표', '内容表格', '内容の表'],
    Content: ['내용', '内容', '内容'],
    Column: ['열', '列', '列'],
    Code: ['코드', '代码', 'コード'],
    'Body rows': ['본문 행', '正文行数', '本文の行数'],
    Columns: ['열 수', '列数', '列数'],
    'Image description': ['이미지 설명', '图片描述', '画像の説明'],
    'Link text': ['링크 텍스트', '链接文字', 'リンクの文字'],
    'Image URL': ['이미지 URL', '图片 URL', '画像 URL'],
    'Link URL': ['링크 URL', '链接 URL', 'リンク URL'],
    Insert: ['삽입', '插入', '挿入'],
    'Choose 1–20 rows and 2–10 columns.': [
      '1–20행, 2–10열을 선택하세요.',
      '请选择 1–20 行、2–10 列。',
      '1～20 行、2～10 列を選んでください。',
    ],
    'Enter a URL starting with https:// or http://.': [
      'https:// 또는 http://로 시작하는 URL을 입력하세요.',
      '请输入以 https:// 或 http:// 开头的 URL。',
      'https:// または http:// で始まる URL を入力してください。',
    ],
    'File exceeds 200 KB.': [
      '파일이 200 KB를 초과합니다.',
      '文件超过 200 KB。',
      'ファイルが 200 KB を超えています。',
    ],
    'Unable to read the Markdown file.': [
      'Markdown 파일을 읽을 수 없습니다.',
      '无法读取 Markdown 文件。',
      'Markdown ファイルを読み取れません。',
    ],
    'Content exceeds 200,000 characters.': [
      '내용이 200,000자를 초과합니다.',
      '内容超过 200,000 字符。',
      '内容が 200,000 文字を超えています。',
    ],
    'Enter the title, author and content.': [
      '제목, 작성자, 내용을 입력하세요.',
      '请输入标题、作者和内容。',
      'タイトル、著者、内容を入力してください。',
    ],
    'Saving post…': ['게시물 저장 중…', '正在保存文章…', '記事を保存中…'],
    'Unable to save the post.': [
      '게시물을 저장할 수 없습니다.',
      '无法保存文章。',
      '記事を保存できません。',
    ],
    'Loading blog…': [
      '블로그 불러오는 중…',
      '正在加载博客…',
      'ブログを読み込み中…',
    ],
    'Unable to load the blog.': [
      '블로그를 불러올 수 없습니다.',
      '无法加载博客。',
      'ブログを読み込めません。',
    ],
    'Post not found': [
      '게시물을 찾을 수 없습니다',
      '找不到文章',
      '記事が見つかりません',
    ],
    'Try again': ['다시 시도', '重试', '再試行'],
    'Your test has not been submitted. Leaving will discard your current answers. Do you want to leave?':
      [
        '시험을 제출하지 않았습니다. 나가면 현재 답이 사라집니다. 나갈까요?',
        '测试尚未提交，离开会丢弃当前答案。是否离开？',
        'テストが未提出です。離れると現在の解答は失われます。離れますか？',
      ],
    'Your study session is not finished. Leaving will end the current session. Do you want to leave?':
      [
        '학습이 끝나지 않았습니다. 나가면 현재 세션이 종료됩니다. 나갈까요?',
        '学习尚未结束，离开将结束当前学习。是否离开？',
        '学習が終わっていません。離れるとセッションが終了します。離れますか？',
      ],
    'Leave the test?': [
      '시험에서 나갈까요?',
      '离开测试？',
      'テストを終了しますか？',
    ],
    'Leave the study session?': [
      '학습에서 나갈까요?',
      '离开学习？',
      '学習を終了しますか？',
    ],
    'Leave session': ['세션 나가기', '离开', '終了する'],
    Today: ['오늘', '今天', '今日'],
    cards: ['카드', '张卡片', '枚'],
    'Pause reviews': ['복습 일시 중지', '暂停复习', '復習を一時停止'],
    'New cards and cards whose review time has arrived.': [
      '새 카드와 복습 시간이 된 카드입니다.',
      '新卡片及已到复习时间的卡片。',
      '新しいカードと復習時刻になったカードです。',
    ],
    minutes: ['분', '分钟', '分'],
    'Incorrect answers reset to level 0. Retry after': [
      '오답은 레벨 0으로 초기화합니다. 재시도까지',
      '答错重置为 0 级，重试等待',
      '誤答はレベル 0 に戻ります。再試行まで',
    ],
    'Correct answers advance one level and use its interval in days.': [
      '정답은 한 레벨 상승하며 해당 일수 간격을 적용합니다.',
      '答对升一级，采用该等级的天数间隔。',
      '正答で一レベル上がり、その日数間隔を使います。',
    ],
    '🧠 Current review schedule': [
      '🧠 현재 복습 일정',
      '🧠 当前复习计划',
      '🧠 現在の復習予定',
    ],
    'Review intervals must be increasing whole numbers from 1 to 3650 days; retry time must be 1 to 10080 minutes.':
      [
        '복습 간격은 1–3650일의 증가하는 정수, 재시도는 1–10080분이어야 합니다.',
        '复习间隔须为 1–3650 天的递增整数；重试时间为 1–10080 分钟。',
        '復習間隔は 1～3650 日の昇順の整数、再試行は 1～10080 分です。',
      ],
    'Card schedule updated.': [
      '카드 일정을 갱신했습니다.',
      '已更新卡片计划。',
      'カードの予定を更新しました。',
    ],
    'Review settings saved.': [
      '복습 설정을 저장했습니다.',
      '已保存复习设置。',
      '復習設定を保存しました。',
    ],
    'Choose a valid date and time.': [
      '올바른 날짜와 시간을 선택하세요.',
      '请选择有效日期和时间。',
      '有効な日時を選んでください。',
    ],
    'Set review to now': [
      '지금 복습으로 설정',
      '设为立即复习',
      '復習を今に設定',
    ],
    'Editing the schedule keeps correct and incorrect answer counts.': [
      '일정을 수정해도 정답·오답 수는 유지됩니다.',
      '编辑计划会保留答对与答错次数。',
      '予定を編集しても正答・誤答数は保持します。',
    ],
    'Next review': ['다음 복습', '下次复习', '次の復習'],
    'Memory level': ['암기 레벨', '记忆等级', '記憶レベル'],
    'Edit card schedule': [
      '카드 일정 편집',
      '编辑卡片计划',
      'カードの予定を編集',
    ],
    'Fill default settings': ['기본값 채우기', '填入默认设置', '既定値を入力'],
    'Unchecked: keep existing dates and apply settings to future reviews. Checked: replace dates, including manual changes. New and paused cards keep their dates.':
      [
        '해제하면 기존 날짜를 유지하고 향후 복습에 적용합니다. 선택하면 수동 변경을 포함한 날짜를 교체합니다. 새 카드와 일시 중지 카드는 날짜를 유지합니다.',
        '未勾选：保留现有日期，设置用于后续复习。勾选：替换日期，包括手动调整。新卡片和暂停卡片保留日期。',
        '無効：既存の日付を維持し、今後の復習に適用。有効：手動変更を含む日付を置き換えます。新規・一時停止カードは日付を維持します。',
      ],
    'Recalculate learned cards from their last review': [
      '마지막 복습 기준으로 학습한 카드 재계산',
      '按上次复习重新计算已学卡片',
      '最終復習から学習済みカードを再計算',
    ],
    'The six intervals must increase. Correct answers advance one level; incorrect answers reset to level 0.':
      [
        '6개 간격은 증가해야 합니다. 정답은 한 레벨 상승, 오답은 0으로 초기화합니다.',
        '六个间隔须递增。答对升一级，答错归零。',
        '六つの間隔は昇順です。正答で一レベル上昇、誤答で 0 に戻ります。',
      ],
    'Retry after an incorrect answer (minutes)': [
      '오답 후 재시도 (분)',
      '答错后重试（分钟）',
      '誤答後の再試行（分）',
    ],
    'Settings for the current user.': [
      '현재 사용자 설정입니다.',
      '当前用户的设置。',
      '現在のユーザーの設定です。',
    ],
    'Spaced repetition settings': [
      '간격 반복 설정',
      '间隔重复设置',
      '間隔反復の設定',
    ],
    'No cards in this time range.': [
      '이 시간 범위에 카드가 없습니다.',
      '此时间范围内没有卡片。',
      'この期間のカードはありません。',
    ],
    'Resume reviews': ['복습 재개', '继续复习', '復習を再開'],
    'Edit schedule': ['일정 편집', '编辑计划', '予定を編集'],
    Level: ['레벨', '等级', 'レベル'],
    Upcoming: ['예정', '即将到期', '今後'],
    'Cards due now': ['지금 복습할 카드', '当前到期卡片', '今復習するカード'],
    'Paused cards': ['일시 중지한 카드', '已暂停卡片', '一時停止中のカード'],
    Tomorrow: ['내일', '明天', '明日'],
    'Upcoming reviews': ['예정된 복습', '即将复习', '今後の復習'],
    Paused: ['일시 중지', '已暂停', '一時停止'],
    'All cards': ['모든 카드', '所有卡片', 'すべてのカード'],
    'Due now': ['복습 시간', '已到期', '復習時刻'],
    'Schedule range': ['일정 범위', '计划范围', '予定の範囲'],
    'Review settings': ['복습 설정', '复习设置', '復習設定'],
    'Based on the current schedule. Future study results may change it.': [
      '현재 일정 기준입니다. 이후 학습 결과에 따라 바뀔 수 있습니다.',
      '根据当前计划，后续学习结果可能改变安排。',
      '現在の予定に基づきます。今後の学習結果で変わることがあります。',
    ],
    'Review schedule & card management': [
      '복습 일정 및 카드 관리',
      '复习计划与卡片管理',
      '復習予定とカード管理',
    ],
    'Answer the question before confirming.': [
      '확인 전 답을 입력하세요.',
      '确认前请先作答。',
      '確定前に解答してください。',
    ],
    'Confirm each answer before submitting. Editing an answer removes its confirmation.':
      [
        '제출 전 각 답을 확인하세요. 답을 수정하면 확인이 해제됩니다.',
        '提交前确认每题答案，编辑答案会取消确认。',
        '提出前に各解答を確定してください。編集すると確定が解除されます。',
      ],
    'Not confirmed': ['미확인', '未确认', '未確定'],
    Confirmed: ['확인됨', '已确认', '確定済み'],
    'Noun (n.)': ['명사 (n.)', '名词 (n.)', '名詞 (n.)'],
    'Pronoun (pron.)': ['대명사 (pron.)', '代词 (pron.)', '代名詞 (pron.)'],
    'Verb (v.)': ['동사 (v.)', '动词 (v.)', '動詞 (v.)'],
    'Adjective (adj.)': ['형용사 (adj.)', '形容词 (adj.)', '形容詞 (adj.)'],
    'Adverb (adv.)': ['부사 (adv.)', '副词 (adv.)', '副詞 (adv.)'],
    'Preposition (prep.)': ['전치사 (prep.)', '介词 (prep.)', '前置詞 (prep.)'],
    'Conjunction (conj.)': ['접속사 (conj.)', '连词 (conj.)', '接続詞 (conj.)'],
    'Interjection (interj.)': [
      '감탄사 (interj.)',
      '感叹词 (interj.)',
      '間投詞 (interj.)',
    ],
    'Determiner (det.)': ['한정사 (det.)', '限定词 (det.)', '限定詞 (det.)'],
    'Article (art.)': ['관사 (art.)', '冠词 (art.)', '冠詞 (art.)'],
    'Auxiliary Verb (aux.)': [
      '조동사 (aux.)',
      '助动词 (aux.)',
      '助動詞 (aux.)',
    ],
    'Modal Verb (mod.)': [
      '법조동사 (mod.)',
      '情态动词 (mod.)',
      '法助動詞 (mod.)',
    ],
    'Numeral (num.)': ['수사 (num.)', '数词 (num.)', '数詞 (num.)'],
    'Particle (part.)': [
      '불변화사 (part.)',
      '小品词 (part.)',
      '不変化詞 (part.)',
    ],
    'Predeterminer (predet.)': [
      '전한정사 (predet.)',
      '前位限定词 (predet.)',
      '前位限定詞 (predet.)',
    ],
    'Quantifier (quant.)': [
      '수량사 (quant.)',
      '量词 (quant.)',
      '数量詞 (quant.)',
    ],
    'Interrogative Word (interrog.)': [
      '의문사 (interrog.)',
      '疑问词 (interrog.)',
      '疑問詞 (interrog.)',
    ],
    'Relative Word (rel.)': ['관계사 (rel.)', '关系词 (rel.)', '関係詞 (rel.)'],
    'Exclamation Word (exclam.)': [
      '감탄어 (exclam.)',
      '感叹词 (exclam.)',
      '感嘆語 (exclam.)',
    ],
    'Discourse Marker (disc.)': [
      '담화 표지 (disc.)',
      '话语标记 (disc.)',
      '談話標識 (disc.)',
    ],
    'Infinitive Marker (inf.)': [
      '부정사 표지 (inf.)',
      '不定式标记 (inf.)',
      '不定詞標識 (inf.)',
    ],
    'Negative Marker (neg.)': [
      '부정 표지 (neg.)',
      '否定标记 (neg.)',
      '否定標識 (neg.)',
    ],
    'Existential There (exist.)': [
      '존재 구문 there (exist.)',
      '存在句 there (exist.)',
      '存在構文 there (exist.)',
    ],
    '01 · FRONT': ['01 · 앞면', '01 · 正面', '01 · 表面'],
    '02 · BACK': ['02 · 뒷면', '02 · 背面', '02 · 裏面'],
    'Vocabulary / question': ['단어 / 질문', '词汇 / 问题', '単語 / 問題'],
    'Meaning / answer': ['뜻 / 답', '释义 / 答案', '意味 / 解答'],
    'Word or question': ['단어 또는 질문', '词汇或问题', '単語または問題'],
    'Meaning or answer': ['뜻 또는 답', '释义或答案', '意味または解答'],
    'Part of speech': ['품사', '词性', '品詞'],
    'Not selected': ['미선택', '未选择', '未選択'],
    '8 traditional parts of speech': [
      '전통적인 8품사',
      '传统八大词性',
      '基本の八品詞',
    ],
    'Additional categories and functional groups': [
      '추가 분류 및 기능 그룹',
      '其他类别和功能组',
      '追加の分類と機能グループ',
    ],
    Pronunciation: ['발음', '发音', '発音'],
    'Speech language': ['읽기 언어', '朗读语言', '読み上げ言語'],
    'Phonetic transcription': ['발음 기호', '音标', '発音記号'],
    Listen: ['듣기', '收听', '聞く'],
    Notes: ['노트', '笔记', 'ノート'],
    'Examples, usage or memory tips…': [
      '예문, 용법, 암기 팁…',
      '示例、用法或记忆技巧…',
      '例文・用法・覚え方…',
    ],
    'Listen to the front in the selected language. The transcription shows how to pronounce it.':
      [
        '선택한 언어로 앞면을 읽습니다. 발음 기호로 읽는 법을 확인하세요.',
        '用所选语言朗读正面，音标提示发音方式。',
        '選んだ言語で表面を読み上げます。発音記号で読み方を確認できます。',
      ],
    Illustration: ['삽화', '插图', 'イラスト'],
    'Choose an image': ['이미지 선택', '选择图片', '画像を選択'],
    'PNG, JPEG, WebP or GIF': [
      'PNG, JPEG, WebP, GIF',
      'PNG、JPEG、WebP 或 GIF',
      'PNG・JPEG・WebP・GIF',
    ],
    'Remove image': ['이미지 삭제', '移除图片', '画像を削除'],
    'Choose a valid PNG, JPEG, WebP or GIF image.': [
      '올바른 PNG, JPEG, WebP, GIF 이미지를 선택하세요.',
      '请选择有效的 PNG、JPEG、WebP 或 GIF 图片。',
      '有効な PNG・JPEG・WebP・GIF 画像を選んでください。',
    ],
    'English (US)': ['영어 (미국)', '英语（美国）', '英語（米国）'],
    'English (UK)': ['영어 (영국)', '英语（英国）', '英語（英国）'],
    'Chinese (Mandarin)': [
      '중국어 (표준어)',
      '中文（普通话）',
      '中国語（標準語）',
    ],
    'Chinese (Taiwan)': ['중국어 (대만)', '中文（台湾）', '中国語（台湾）'],
    Japanese: ['일본어', '日语', '日本語'],
    Korean: ['한국어', '韩语', '韓国語'],
    French: ['프랑스어', '法语', 'フランス語'],
    German: ['독일어', '德语', 'ドイツ語'],
    Spanish: ['스페인어', '西班牙语', 'スペイン語'],
    'Enter pronunciation if needed': [
      '필요하면 발음을 입력하세요',
      '需要时输入发音',
      '必要に応じて発音を入力',
    ],
    'Pinyin · tone marks': ['병음 · 성조', '拼音 · 声调', 'ピンイン・声調'],
    'Enter Latin letters and use the buttons to insert vowels with tone marks.':
      [
        '라틴 문자를 입력하고 버튼으로 성조 모음을 넣으세요.',
        '输入拉丁字母，用按钮插入带声调的元音。',
        'ラテン文字を入力し、ボタンで声調付き母音を挿入します。',
      ],
    'Syllable separator': ['음절 구분', '音节分隔符', '音節区切り'],
    'Zhuyin · phonetic symbols': [
      '주음 · 발음 기호',
      '注音 · 音符',
      '注音・発音記号',
    ],
    'Insert Zhuyin symbols and tone marks, or type Pinyin.': [
      '주음·성조 기호를 넣거나 병음을 입력하세요.',
      '插入注音和声调符号，或输入拼音。',
      '注音・声調記号を挿入するか、ピンインを入力します。',
    ],
    Consonants: ['자음', '辅音', '子音'],
    Vowels: ['모음', '元音', '母音'],
    'Tone marks': ['성조 기호', '声调符号', '声調記号'],
    'Kana · Hiragana': ['가나 · 히라가나', '假名 · 平假名', 'かな・ひらがな'],
    'Insert Hiragana for pronunciation, or type Katakana or Romaji.': [
      '발음에 히라가나를 넣거나 가타카나·로마자를 입력하세요.',
      '插入平假名发音，或输入片假名、罗马字。',
      '発音にひらがなを挿入するか、カタカナ・ローマ字を入力します。',
    ],
    'Basic sounds': ['기본음', '基本音', '基本の音'],
    'Voiced / semi-voiced sounds': [
      '탁음 / 반탁음',
      '浊音 / 半浊音',
      '濁音・半濁音',
    ],
    'Small kana / long vowels': [
      '작은 가나 / 장음',
      '小假名 / 长音',
      '小書きかな・長音',
    ],
    'Korean · Latin transcription': [
      '한국어 · 로마자 표기',
      '韩语 · 拉丁转写',
      '韓国語・ローマ字表記',
    ],
    'Type Latin transcription or enter Hangul using a Korean keyboard.': [
      '로마자 표기를 쓰거나 한국어 키보드로 한글을 입력하세요.',
      '输入拉丁转写，或用韩语键盘输入韩文。',
      'ローマ字表記、または韓国語キーボードでハングルを入力します。',
    ],
    'IPA · English': ['IPA · 영어', 'IPA · 英语', 'IPA・英語'],
    'IPA · common symbols': [
      'IPA · 일반 기호',
      'IPA · 常用符号',
      'IPA・よく使う記号',
    ],
    'Click a symbol to insert it at the cursor. You can also type directly.': [
      '기호를 클릭해 커서에 넣거나 직접 입력하세요.',
      '点击符号插入光标位置，也可直接输入。',
      '記号を押すとカーソル位置に挿入します。直接入力もできます。',
    ],
    'Vowels & consonants': ['모음과 자음', '元音与辅音', '母音と子音'],
    'How answers are graded': ['답안 채점 방법', '答案评分方式', '採点方法'],
    'Enter Confirm / Unconfirm · ← → Change question': [
      'Enter 확인 / 해제 · ← → 문제 이동',
      'Enter 确认 / 取消确认 · ← → 切换题目',
      'Enter 確定 / 解除 · ← → 問題を切り替え',
    ],
    Confirm: ['확인', '确认', '確定'],
    Unconfirm: ['확인 해제', '取消确认', '確定を解除'],
    'Previous question': ['이전 문제', '上一题', '前の問題'],
    'Next question': ['다음 문제', '下一题', '次の問題'],
    'Only confirmed answers count when you submit the test.': [
      '시험 제출 시 확인한 답만 채점됩니다.',
      '提交测试时仅计入已确认答案。',
      '提出時は確定済みの解答のみ採点されます。',
    ],
    'This user no longer exists.': [
      '이 사용자는 더 이상 존재하지 않습니다.',
      '此用户已不存在。',
      'このユーザーは存在しません。',
    ],
    'Up to 50 users.': [
      '최대 사용자 50명입니다.',
      '最多 50 位用户。',
      'ユーザーは最大 50 人です。',
    ],
    'A folder with this ID already exists.': [
      '이 ID의 폴더가 이미 있습니다.',
      '此 ID 的文件夹已存在。',
      'この ID のフォルダーは既に存在します。',
    ],
    'At least one user must remain.': [
      '최소 한 명의 사용자가 필요합니다.',
      '至少保留一位用户。',
      '少なくとも一人のユーザーが必要です。',
    ],
    'The user was just created. Reload the list before importing.': [
      '사용자가 방금 생성되었습니다. 목록을 새로 고친 후 가져오세요.',
      '用户刚被创建，导入前请刷新列表。',
      'ユーザーが作成されました。一覧を更新してから取り込んでください。',
    ],
    'The user was just deleted. Check again before restoring.': [
      '사용자가 방금 삭제되었습니다. 복원 전 다시 확인하세요.',
      '用户刚被删除，恢复前请重新检查。',
      'ユーザーが削除されました。復元前に再確認してください。',
    ],
    'The backup needs a user name to restore a new profile.': [
      '새 프로필 복원에는 사용자 이름이 필요합니다.',
      '恢复为新资料需要用户名。',
      '新しいプロフィールの復元にはユーザー名が必要です。',
    ],
    'Internal server error': [
      '서버 내부 오류',
      '服务器内部错误',
      'サーバー内部エラー',
    ],
    'Request failed': ['요청 실패', '请求失败', 'リクエストに失敗'],
    'Cross-origin writes are forbidden': [
      '다른 출처의 쓰기는 금지됩니다',
      '禁止跨来源写入',
      '別オリジンからの書き込みは禁止です',
    ],
    'Failed to fetch': ['연결 실패', '获取失败', '取得に失敗'],
    'Data changed in another window. Your unsaved changes are kept in this browser.':
      [
        '다른 창에서 데이터가 바뀌었습니다. 저장하지 않은 변경은 이 브라우저에 유지됩니다.',
        '数据在其他窗口已更改，未保存更改保留在此浏览器。',
        '別のウィンドウでデータが変更されました。未保存の変更はこのブラウザーに保持されます。',
      ],
    'Data is being updated in another window. Your unsaved changes are kept in this browser.':
      [
        '다른 창에서 갱신 중입니다. 미저장 변경은 이 브라우저에 유지됩니다.',
        '其他窗口正在更新数据，未保存更改保留在此浏览器。',
        '別のウィンドウで更新中です。未保存の変更はこのブラウザーに保持されます。',
      ],
    'The browser and server versions differ. Your unsaved changes are kept. Open Settings → Resolve sync to continue.':
      [
        '브라우저와 서버 버전이 다릅니다. 미저장 변경은 유지됩니다. 설정 → 동기화 해결로 이동하세요.',
        '浏览器与服务器版本不同，未保存更改已保留。请在设置 → 解决同步中继续。',
        'ブラウザーとサーバーの内容が異なります。未保存の変更は保持されています。設定の同期解決を開いてください。',
      ],
    'Server data changed again. Your unsaved changes are kept. Open Settings → Resolve sync to continue.':
      [
        '서버 데이터가 다시 바뀌었습니다. 변경은 유지됩니다. 설정 → 동기화 해결로 이동하세요.',
        '服务器数据再次更改，未保存更改已保留。请在设置 → 解决同步中继续。',
        'サーバーデータが再度変更されました。未保存の変更は保持されています。設定の同期解決を開いてください。',
      ],
    'Unable to verify the save status. Your changes are kept in this browser.':
      [
        '저장 상태를 확인할 수 없습니다. 변경은 이 브라우저에 유지됩니다.',
        '无法确认保存状态，更改保留在此浏览器。',
        '保存状態を確認できません。変更はこのブラウザーに保持されます。',
      ],
    'The server does not support this avatar yet. Restart the app after updating.':
      [
        '서버가 이 아바타를 지원하지 않습니다. 업데이트 후 앱을 다시 시작하세요.',
        '服务器尚不支持此头像，请更新后重启应用。',
        'サーバーはこのアバターに未対応です。更新後にアプリを再起動してください。',
      ],
    'The server rejected the data. Your changes are kept in this browser.': [
      '서버가 데이터를 거부했습니다. 변경은 이 브라우저에 유지됩니다.',
      '服务器拒绝数据，更改保留在此浏览器。',
      'サーバーがデータを拒否しました。変更はこのブラウザーに保持されます。',
    ],
    'The server took too long to respond. Your changes are kept in this browser.':
      [
        '서버 응답이 지연됩니다. 변경은 이 브라우저에 유지됩니다.',
        '服务器响应超时，更改保留在此浏览器。',
        'サーバーの応答が遅すぎます。変更はこのブラウザーに保持されます。',
      ],
    'Unable to connect to the server. Your changes are kept in this browser.': [
      '서버에 연결할 수 없습니다. 변경은 이 브라우저에 유지됩니다.',
      '无法连接服务器，更改保留在此浏览器。',
      'サーバーに接続できません。変更はこのブラウザーに保持されます。',
    ],
    'Your changes are waiting to be saved. Try again shortly.': [
      '변경 사항이 저장 대기 중입니다. 잠시 후 다시 시도하세요.',
      '更改等待保存，请稍后重试。',
      '変更は保存待ちです。少ししてから再試行してください。',
    ],
    'Saving data. Please try again shortly.': [
      '저장 중입니다. 잠시 후 다시 시도하세요.',
      '正在保存数据，请稍后重试。',
      'データを保存中です。少ししてから再試行してください。',
    ],
    'Unable to read server data': [
      '서버 데이터를 읽을 수 없습니다',
      '无法读取服务器数据',
      'サーバーデータを読み取れません',
    ],
    'Unable to read from the server': [
      '서버에서 읽을 수 없습니다',
      '无法从服务器读取',
      'サーバーから読み取れません',
    ],
    'The server has no data yet': [
      '서버에 데이터가 없습니다',
      '服务器暂无数据',
      'サーバーにデータがありません',
    ],
    'The backup contains no data.': [
      '백업에 데이터가 없습니다.',
      '备份中没有数据。',
      'バックアップにデータがありません。',
    ],
    'Resolve sync': ['동기화 해결', '解决同步', '同期を解決'],
    'Resolve different data versions': [
      '서로 다른 데이터 버전 해결',
      '解决数据版本差异',
      '異なるデータを解決',
    ],
    'Back up and use server data': [
      '백업 후 서버 데이터 사용',
      '备份并使用服务器数据',
      'バックアップしてサーバーデータを使用',
    ],
    'Unable to back up your data.': [
      '데이터를 백업할 수 없습니다.',
      '无法备份数据。',
      'データをバックアップできません。',
    ],
    'The app will keep a separate copy in this browser and download a JSON backup for comparison. It will then use server data and reload the page. Continue?':
      [
        '이 브라우저에 별도 사본을 보존하고 비교용 JSON 백업을 다운로드합니다. 이후 서버 데이터로 페이지를 다시 엽니다. 계속할까요?',
        '应用将在此浏览器保留独立副本并下载 JSON 备份供比较，然后采用服务器数据并刷新。是否继续？',
        'このブラウザーに別のコピーを残し、比較用 JSON バックアップをダウンロード後、サーバーデータで再読み込みします。続けますか？',
      ],
    'The backup or confirmation is invalid.': [
      '백업 또는 확인이 올바르지 않습니다.',
      '备份或确认无效。',
      'バックアップまたは確認が無効です。',
    ],
    'The backup ID does not match the selected user.': [
      '백업 ID가 선택한 사용자와 다릅니다.',
      '备份 ID 与所选用户不匹配。',
      'バックアップ ID が選択ユーザーと一致しません。',
    ],
    'Study rhythm': ['학습 리듬', '学习节奏', '学習のリズム'],
    'Current study streak': [
      '현재 연속 학습',
      '当前连续学习',
      '現在の連続学習',
    ],
    'consecutive days': ['연속 일', '天连续', '日連続'],
    'Studied today · keep it going!': [
      '오늘 학습 완료 · 계속하세요!',
      '今天已学习 · 继续保持！',
      '今日は学習済み・この調子で！',
    ],
    'Study today to keep your streak.': [
      '오늘 학습해서 연속 기록을 유지하세요.',
      '今天学习以保持连续记录。',
      '今日も学習して連続記録を保ちましょう。',
    ],
    'Study today to start a new streak.': [
      '오늘 학습해서 새 연속 기록을 시작하세요.',
      '今天学习以开始新的连续记录。',
      '今日の学習から新しい連続記録を始めましょう。',
    ],
    'Longest streak': ['최장 연속 기록', '最长连续记录', '最長の連続記録'],
    days: ['일', '天', '日'],
    'Last 7 days': ['최근 7일', '最近 7 天', '過去 7 日'],
    'active days': ['학습한 날', '个活跃日', '日の学習'],
    'cards at level ≥ 3': [
      '레벨 ≥ 3 카드',
      '张等级 ≥ 3 的卡片',
      '枚がレベル ≥ 3',
    ],
    'A card is mastered at level ≥ 3: graded correct 3 times in a row. An incorrect answer resets it to level 0. Checking “remembered” once is not enough.':
      [
        '레벨 ≥ 3은 연속 정답 3회로 숙달입니다. 오답은 0으로 초기화합니다. 암기 표시 한 번만으로는 부족합니다.',
        '等级 ≥ 3 即连续答对 3 次才算掌握，答错归零。只标记一次已记住不够。',
        'レベル ≥ 3 は連続 3 回の正答で習得済みです。誤答で 0 に戻ります。一度覚えた印を付けるだけでは不十分です。',
      ],
    'Set name *': ['세트 이름 *', '学习集名称 *', 'セット名 *'],
    'Create study set': ['학습 세트 만들기', '创建学习集', '学習セットを作成'],
    'Edit study set': ['학습 세트 편집', '编辑学习集', '学習セットを編集'],
    'Organize your knowledge into study sets.': [
      '학습 세트로 지식을 정리하세요.',
      '用学习集整理知识。',
      '学習セットに知識をまとめましょう。',
    ],
    'For example: English for IT': [
      '예: IT 영어',
      '例如：IT 英语',
      '例：IT 英語',
    ],
    'What is this set about?': [
      '이 세트는 어떤 내용인가요?',
      '这个学习集的内容是什么？',
      'このセットはどんな内容ですか？',
    ],
    'Set color': ['세트 색상', '学习集颜色', 'セットの色'],
    Purple: ['보라', '紫色', '紫'],
    Blue: ['파랑', '蓝色', '青'],
    Peach: ['복숭아', '桃色', 'ピーチ'],
    Mint: ['민트', '薄荷色', 'ミント'],
    Pink: ['분홍', '粉色', 'ピンク'],
    Brightness: ['밝기', '亮度', '明るさ'],
    'HEX color': ['HEX 색상', 'HEX 颜色', 'HEX カラー'],
    'Choose a color, adjust the sliders, or enter a code such as #7c3aed or #f80.':
      [
        '색상을 고르거나 슬라이더를 조절하고 #7c3aed, #f80 같은 코드를 입력하세요.',
        '选择颜色、调整滑块，或输入 #7c3aed、#f80 等代码。',
        '色を選ぶかスライダーを動かし、#7c3aed や #f80 などのコードも入力できます。',
      ],
    'Term / Question *': ['용어 / 질문 *', '术语 / 问题 *', '用語 / 問題 *'],
    'Definition / Answer *': ['뜻 / 답 *', '释义 / 答案 *', '意味 / 解答 *'],
    'For example: Dependency Injection': [
      '예: 의존성 주입',
      '例如：依赖注入',
      '例：依存性注入',
    ],
    'For example: Providing dependencies externally': [
      '예: 외부에서 의존성 제공',
      '例如：从外部提供依赖',
      '例：外部から依存関係を提供',
    ],
    'Edit flashcard': ['카드 편집', '编辑卡片', 'カードを編集'],
    'Add flashcard': ['카드 추가', '添加卡片', 'カードを追加'],
    'Close dialog': ['대화 상자 닫기', '关闭对话框', 'ダイアログを閉じる'],
    'Please enter a value.': [
      '값을 입력하세요.',
      '请输入一个值。',
      '値を入力してください。',
    ],
    'Please fill out this field.': [
      '이 필드를 입력하세요.',
      '请填写此字段。',
      'この項目を入力してください。',
    ],
    'Delete study set?': [
      '학습 세트를 삭제할까요?',
      '删除学习集？',
      '学習セットを削除しますか？',
    ],
    'Delete study set': ['학습 세트 삭제', '删除学习集', '学習セットを削除'],
    'Delete flashcard?': [
      '카드를 삭제할까요?',
      '删除卡片？',
      'カードを削除しますか？',
    ],
    'Delete flashcard': ['카드 삭제', '删除卡片', 'カードを削除'],
    'Delete user?': [
      '사용자를 삭제할까요?',
      '删除用户？',
      'ユーザーを削除しますか？',
    ],
    'Delete user': ['사용자 삭제', '删除用户', 'ユーザーを削除'],
    'Import cards from CSV?': [
      'CSV에서 카드를 가져올까요?',
      '从 CSV 导入卡片？',
      'CSV からカードを取り込みますか？',
    ],
    'Import cards': ['카드 가져오기', '导入卡片', 'カードを取り込む'],
    'Overwrite user?': [
      '사용자를 덮어쓸까요?',
      '覆盖用户？',
      'ユーザーを上書きしますか？',
    ],
    Overwrite: ['덮어쓰기', '覆盖', '上書き'],
    'Study set created.': [
      '학습 세트를 만들었습니다.',
      '已创建学习集。',
      '学習セットを作成しました。',
    ],
    'Study set updated.': [
      '학습 세트를 갱신했습니다.',
      '已更新学习集。',
      '学習セットを更新しました。',
    ],
    'Card added.': [
      '카드를 추가했습니다.',
      '已添加卡片。',
      'カードを追加しました。',
    ],
    'Card updated.': [
      '카드를 갱신했습니다.',
      '已更新卡片。',
      'カードを更新しました。',
    ],
    'Card deleted.': [
      '카드를 삭제했습니다.',
      '已删除卡片。',
      'カードを削除しました。',
    ],
    'Study set deleted.': [
      '학습 세트를 삭제했습니다.',
      '已删除学习集。',
      '学習セットを削除しました。',
    ],
    'Study set exported as CSV.': [
      '학습 세트를 CSV로 내보냈습니다.',
      '已将学习集导出为 CSV。',
      '学習セットを CSV に出力しました。',
    ],
    'User folder imported.': [
      '사용자 폴더를 가져왔습니다.',
      '已导入用户文件夹。',
      'ユーザーフォルダーを取り込みました。',
    ],
    'User deleted.': [
      '사용자를 삭제했습니다.',
      '已删除用户。',
      'ユーザーを削除しました。',
    ],
    'User added. Choose “Switch user” to open their profile.': [
      '사용자를 추가했습니다. 사용자 전환으로 해당 프로필을 여세요.',
      '已添加用户，选择切换用户以打开其资料。',
      'ユーザーを追加しました。ユーザー切り替えで開いてください。',
    ],
    'Each user has a unique ID and separate data. Export a ZIP in Settings before deleting a user if you want a copy. Import a CSV folder to create a user named after the folder, or an extracted ZIP folder to restore progress.':
      [
        '사용자마다 고유 ID와 별도 데이터가 있습니다. 삭제 전 복사본이 필요하면 설정에서 ZIP을 내보내세요. CSV 폴더를 가져오면 폴더 이름으로 생성되며 ZIP을 푼 폴더로 진도를 복원합니다.',
        '每位用户有唯一 ID 和独立数据。需保留副本时请在删除前从设置导出 ZIP。导入 CSV 文件夹会按文件夹名创建用户；导入解压后的 ZIP 文件夹可恢复进度。',
        'ユーザーごとに固有 ID と個別データがあります。コピーが必要なら削除前に設定で ZIP を出力してください。CSV フォルダーはその名前でユーザーを作成し、解凍した ZIP フォルダーは進捗を復元します。',
      ],
    'Storage folder:': ['저장 폴더:', '数据文件夹：', '保存フォルダー：'],
    'Each user’s CSV files are in their ID → materials folder; index.json maps files to study sets.':
      [
        '사용자 CSV는 ID → materials 폴더에 있으며 index.json이 학습 세트와 파일을 연결합니다.',
        '各用户的 CSV 位于 ID → materials 文件夹，index.json 将文件映射到学习集。',
        '各ユーザーの CSV は ID → materials にあり、index.json がファイルとセットを対応させます。',
      ],
    '🧠 Review algorithm': [
      '🧠 복습 알고리즘',
      '🧠 复习算法',
      '🧠 復習アルゴリズム',
    ],
    'Correct answers schedule cards after': [
      '정답 카드의 복습 간격:',
      '答对后安排复习间隔',
      '正答後の復習間隔',
    ],
    '1, 3, 7, 14, 30, then 60 days': [
      '1, 3, 7, 14, 30, 60일',
      '1、3、7、14、30、60 天',
      '1、3、7、14、30、60 日',
    ],
    '. Incorrect answers return after about': [
      '. 오답은 약',
      '。答错后约',
      '。誤答は約',
    ],
    '5 minutes': ['5분', '5 分钟', '5 分'],
    '. This simple spaced repetition algorithm is not a copy of Quizlet or Anki.':
      [
        '. 이 간단한 간격 반복 알고리즘은 Quizlet이나 Anki의 복제가 아닙니다.',
        '。此简易间隔重复算法并非 Quizlet 或 Anki 的复制。',
        '。この簡単な間隔反復方式は Quizlet や Anki の複製ではありません。',
      ],
    Matched: ['맞춘', '已配对', '一致'],
    'pairs · Correct': ['쌍 · 정답', '对 · 正确', '組・正解'],
    'Create questions and start reviewing today.': [
      '질문을 만들고 오늘부터 복습하세요.',
      '创建题目，今天就开始复习。',
      '問題を作り、今日から復習しましょう。',
    ],
    'No study sets yet.': [
      '학습 세트가 없습니다.',
      '暂无学习集。',
      '学習セットはまだありません。',
    ],
    'You have finished the cards due today. Keep studying to build your habit!':
      [
        '오늘 복습을 완료했습니다. 꾸준히 학습해 습관을 만드세요!',
        '今天到期卡片已完成，继续学习养成习惯！',
        '今日の復習が終わりました。学習を続けて習慣にしましょう！',
      ],
    'Unable to play this sound. Please try again.': [
      '소리를 재생할 수 없습니다. 다시 시도하세요.',
      '无法播放此音效，请重试。',
      '音を再生できません。再試行してください。',
    ],
    'Unable to play music. Reload the page and try again.': [
      '음악을 재생할 수 없습니다. 새로 고침 후 다시 시도하세요.',
      '无法播放音乐，请刷新后重试。',
      '音楽を再生できません。再読み込みして再試行してください。',
    ],
    'Click a preview button in Settings to allow audio playback.': [
      '설정의 미리 듣기 버튼으로 소리 재생을 허용하세요.',
      '点击设置中的试听按钮以允许播放声音。',
      '設定の試聴ボタンを押して音声再生を許可してください。',
    ],
    'Unable to export the user folder. Please try again.': [
      '사용자 폴더를 내보낼 수 없습니다. 다시 시도하세요.',
      '无法导出用户文件夹，请重试。',
      'ユーザーフォルダーを出力できません。再試行してください。',
    ],
    'Your changes have not synced yet. Check the connection before exporting a database.':
      [
        '변경이 아직 동기화되지 않았습니다. 데이터베이스 내보내기 전 연결을 확인하세요.',
        '更改尚未同步，导出数据库前请检查连接。',
        '変更が未同期です。データベースの出力前に接続を確認してください。',
      ],
    'Data conflict · your changes are kept in this browser.': [
      '데이터 충돌 · 변경은 이 브라우저에 유지됩니다.',
      '数据冲突 · 更改保留在此浏览器。',
      'データの競合・変更はこのブラウザーに保持されます。',
    ],
    'Unable to save in the browser. Check available storage.': [
      '브라우저에 저장할 수 없습니다. 여유 공간을 확인하세요.',
      '无法在浏览器保存，请检查可用空间。',
      'ブラウザーに保存できません。空き容量を確認してください。',
    ],
    'Server save failed · your changes are kept in this browser': [
      '서버 저장 실패 · 변경은 이 브라우저에 유지됩니다',
      '服务器保存失败 · 更改保留在此浏览器',
      'サーバー保存に失敗・変更はこのブラウザーに保持',
    ],
    'Server connection lost': [
      '서버 연결 끊김',
      '服务器连接断开',
      'サーバー接続が切れました',
    ],
    'Close confirmation': ['확인 창 닫기', '关闭确认框', '確認を閉じる'],
    'REVIEW BEFORE CONTINUING': [
      '계속하기 전 확인',
      '继续前请检查',
      '続行前に確認',
    ],
    'CONFIRM ACTION': ['작업 확인', '确认操作', '操作を確認'],
    Cancel: ['취소', '取消', 'キャンセル'],
    Done: ['완료', '完成', '完了'],
    'Unable to complete': ['완료할 수 없음', '无法完成', '完了できません'],
    'Dismiss notification': ['알림 닫기', '关闭通知', '通知を閉じる'],
    'Study set created!': [
      '학습 세트를 만들었습니다!',
      '学习集已创建！',
      '学習セットを作成しました！',
    ],
    'Enter a study set name.': [
      '학습 세트 이름을 입력하세요.',
      '请输入学习集名称。',
      '学習セット名を入力してください。',
    ],
    'Fill in both sides of the card.': [
      '카드의 양면을 입력하세요.',
      '请填写卡片两面。',
      'カードの両面を入力してください。',
    ],
    'Add cards before starting a session.': [
      '시작 전 카드를 추가하세요.',
      '开始学习前请添加卡片。',
      '開始前にカードを追加してください。',
    ],
    'This term already exists in the set. Please use another term.': [
      '이미 있는 용어입니다. 다른 용어를 사용하세요.',
      '此术语已存在，请使用其他术语。',
      'この用語は既にあります。別の用語を使ってください。',
    ],
    'You can create up to 500 study sets.': [
      '학습 세트는 최대 500개입니다.',
      '最多创建 500 个学习集。',
      '学習セットは最大 500 件です。',
    ],
    'Up to 10,000 cards per set and 100,000 cards in total.': [
      '세트당 최대 10,000장, 전체 100,000장입니다.',
      '每集最多 10,000 张，总计 100,000 张卡片。',
      'セットごとに最大 10,000 枚、合計 100,000 枚です。',
    ],
    'The CSV file is larger than 5 MB.': [
      'CSV 파일이 5 MB를 초과합니다.',
      'CSV 文件大于 5 MB。',
      'CSV ファイルが 5 MB を超えています。',
    ],
    'No valid term and definition pairs were found.': [
      '유효한 용어와 뜻 쌍이 없습니다.',
      '未找到有效术语与释义组合。',
      '有効な用語と意味の組み合わせがありません。',
    ],
    'Open a study set before importing CSV.': [
      'CSV 가져오기 전 학습 세트를 여세요.',
      '导入 CSV 前请打开学习集。',
      'CSV 取り込み前に学習セットを開いてください。',
    ],
    'CSV import failed.': [
      'CSV 가져오기 실패.',
      'CSV 导入失败。',
      'CSV の取り込みに失敗しました。',
    ],
    'The server is offline. User management is currently unavailable.': [
      '서버가 오프라인입니다. 사용자 관리를 사용할 수 없습니다.',
      '服务器离线，暂时无法管理用户。',
      'サーバーがオフラインのためユーザー管理は利用できません。',
    ],
    'Unable to connect to the server. Please try again.': [
      '서버에 연결할 수 없습니다. 다시 시도하세요.',
      '无法连接服务器，请重试。',
      'サーバーに接続できません。再試行してください。',
    ],
    'This user name already exists.': [
      '이미 있는 사용자 이름입니다.',
      '此用户名已存在。',
      'このユーザー名は既に存在します。',
    ],
    'Another user already has this name.': [
      '다른 사용자가 이미 이 이름을 사용합니다.',
      '其他用户已使用此名称。',
      '別のユーザーがこの名前を使っています。',
    ],
    'User names must contain 1 to 60 characters.': [
      '사용자 이름은 1–60자여야 합니다.',
      '用户名须为 1–60 字符。',
      'ユーザー名は 1～60 文字です。',
    ],
    'At least one user must remain': [
      '최소 사용자 한 명이 필요합니다',
      '至少保留一位用户',
      '少なくとも一人のユーザーが必要です',
    ],
    'Open menu': ['메뉴 열기', '打开菜单', 'メニューを開く'],
    'Main navigation': ['주 메뉴', '主导航', 'メインナビゲーション'],
    'Add study set': ['학습 세트 추가', '添加学习集', '学習セットを追加'],
    'Browser storage is blocked. Export your user folder regularly.': [
      '브라우저 저장소가 차단되었습니다. 사용자 폴더를 정기적으로 내보내세요.',
      '浏览器存储被阻止，请定期导出用户文件夹。',
      'ブラウザーストレージがブロックされています。ユーザーフォルダーを定期的に出力してください。',
    ],
    'Unable to save automatically. Export your user folder as a backup.': [
      '자동 저장할 수 없습니다. 사용자 폴더를 백업으로 내보내세요.',
      '无法自动保存，请导出用户文件夹备份。',
      '自動保存できません。ユーザーフォルダーをバックアップとして出力してください。',
    ],
    'Your changes have not saved yet. Check the server connection and try again.':
      [
        '변경이 아직 저장되지 않았습니다. 서버 연결을 확인하고 다시 시도하세요.',
        '更改尚未保存，请检查服务器连接后重试。',
        '変更は未保存です。サーバー接続を確認して再試行してください。',
      ],
    'The folder exceeds the data size limit.': [
      '폴더가 데이터 크기 제한을 초과합니다.',
      '文件夹超过数据大小限制。',
      'フォルダーがデータサイズ上限を超えています。',
    ],
    'A user folder must contain both user.json and state.json.': [
      '사용자 폴더에 user.json과 state.json이 모두 필요합니다.',
      '用户文件夹须包含 user.json 和 state.json。',
      'ユーザーフォルダーには user.json と state.json が必要です。',
    ],
    'Choose a folder containing CSV files or exported FlashLab user data.': [
      'CSV 또는 내보낸 FlashLab 사용자 데이터 폴더를 선택하세요.',
      '请选择含 CSV 或已导出 FlashLab 用户数据的文件夹。',
      'CSV または出力した FlashLab ユーザーデータのフォルダーを選んでください。',
    ],
    'The CSV files exceed the 15 MB limit.': [
      'CSV 파일이 15 MB 제한을 초과합니다.',
      'CSV 文件超过 15 MB 限制。',
      'CSV ファイルが 15 MB の上限を超えています。',
    ],
    'Folder import failed.': [
      '폴더 가져오기 실패.',
      '文件夹导入失败。',
      'フォルダーの取り込みに失敗しました。',
    ],
    'Flip card ·': ['카드 뒤집기 ·', '翻面 ·', 'カードを裏返す・'],
    'Change card ·': ['카드 이동 ·', '切换卡片 ·', 'カードを切り替え・'],
    'Not remembered ·': ['아직 못 외움 ·', '未记住 ·', 'まだ覚えていない・'],
    'Your personal study set': [
      '나의 학습 세트',
      '你的个人学习集',
      '自分の学習セット',
    ],
    TEST: ['시험', '测试', 'テスト'],
    Year: ['연도', '年份', '年'],
    'Activity year': ['활동 연도', '活动年份', '活動の年'],
    'How would you like to study?': [
      '어떻게 학습할까요?',
      '想如何学习？',
      'どのように学習しますか？',
    ],
    'Choose your options before starting.': [
      '시작 전 옵션을 선택하세요.',
      '开始前请选择选项。',
      '開始前にオプションを選んでください。',
    ],
    Order: ['순서', '顺序', '順序'],
    'Number of questions': ['문제 수', '题目数量', '問題数'],
    'Test question type': ['시험 문제 유형', '测试题型', 'テストの問題形式'],
    'Expand sidebar': ['사이드바 펼치기', '展开侧栏', 'サイドバーを展開'],
    'Collapse sidebar': ['사이드바 접기', '收起侧栏', 'サイドバーを折りたたむ'],
    'Sidebar width': ['사이드바 너비', '侧栏宽度', 'サイドバーの幅'],
    Classes: ['클래스', '班级', 'クラス'],
    'All classes': ['모든 클래스', '所有班级', 'すべてのクラス'],
    'Group study sets by class or topic.': [
      '클래스나 주제로 학습 세트를 묶으세요.',
      '按班级或主题组织学习集。',
      'クラスやテーマごとにセットをまとめましょう。',
    ],
    'Create class': ['클래스 만들기', '创建班级', 'クラスを作成'],
    'No classes yet': [
      '클래스가 없습니다',
      '暂无班级',
      'クラスはまだありません',
    ],
    'Create a class and select the sets you want to group.': [
      '클래스를 만들고 묶을 세트를 선택하세요.',
      '创建班级并选择要分组的学习集。',
      'クラスを作成し、まとめるセットを選んでください。',
    ],
    'Manage study sets': ['학습 세트 관리', '管理学习集', '学習セットを管理'],
    'Study sets in this class': [
      '이 클래스의 학습 세트',
      '此班级的学习集',
      'このクラスの学習セット',
    ],
    'This class has no study sets': [
      '이 클래스에 학습 세트가 없습니다',
      '此班级暂无学习集',
      'このクラスに学習セットはありません',
    ],
    'Add sets to class': [
      '클래스에 세트 추가',
      '添加学习集到班级',
      'クラスにセットを追加',
    ],
    'Manage class': ['클래스 관리', '管理班级', 'クラスを管理'],
    'Select study sets': ['학습 세트 선택', '选择学习集', '学習セットを選択'],
    'Class name *': ['클래스 이름 *', '班级名称 *', 'クラス名 *'],
    'Select study sets to group in this class. A set can belong to multiple classes.':
      [
        '클래스에 묶을 세트를 선택하세요. 세트는 여러 클래스에 속할 수 있습니다.',
        '选择归入此班级的学习集，同一学习集可属于多个班级。',
        'このクラスに含めるセットを選びます。セットは複数のクラスに所属できます。',
      ],
    'No study sets available.': [
      '사용 가능한 학습 세트가 없습니다.',
      '没有可用学习集。',
      '利用できる学習セットがありません。',
    ],
    'This class name already exists.': [
      '이미 있는 클래스 이름입니다.',
      '此班级名称已存在。',
      'このクラス名は既に存在します。',
    ],
    'Class saved.': [
      '클래스를 저장했습니다.',
      '已保存班级。',
      'クラスを保存しました。',
    ],
    'Class deleted.': [
      '클래스를 삭제했습니다.',
      '已删除班级。',
      'クラスを削除しました。',
    ],
    'Delete class': ['클래스 삭제', '删除班级', 'クラスを削除'],
    'Delete class?': [
      '클래스를 삭제할까요?',
      '删除班级？',
      'クラスを削除しますか？',
    ],
    'Up to 100 classes.': [
      '최대 클래스 100개입니다.',
      '最多 100 个班级。',
      'クラスは最大 100 件です。',
    ],
    'Cards due for review': ['복습할 카드', '到期复习卡片', '復習時刻のカード'],
    'Not studied yet': ['아직 학습 안 함', '尚未学习', '未学習'],
    Due: ['복습 시간', '到期', '期限'],
    'Find study sets': ['학습 세트 찾기', '查找学习集', '学習セットを検索'],
    'Search set names or descriptions': [
      '세트 이름 또는 설명 검색',
      '搜索学习集名称或描述',
      'セット名や説明で検索',
    ],
    'No matching study sets.': [
      '일치하는 학습 세트가 없습니다.',
      '没有匹配的学习集。',
      '一致する学習セットがありません。',
    ],
    'Play background music': ['배경 음악 재생', '播放背景音乐', 'BGM を再生'],
    'Pause background music': [
      '배경 음악 일시 중지',
      '暂停背景音乐',
      'BGM を一時停止',
    ],
    'Background music is paused.': [
      '배경 음악이 일시 중지되었습니다.',
      '背景音乐已暂停。',
      'BGM は一時停止中です。',
    ],
    'Previewing sound.': [
      '소리 미리 듣는 중.',
      '正在试听音效。',
      '音を試聴中です。',
    ],
    'From date': ['시작일', '开始日期', '開始日'],
    'To date': ['종료일', '结束日期', '終了日'],
    Filter: ['필터', '筛选', '絞り込み'],
    'Clear filters': ['필터 지우기', '清除筛选', '絞り込みを解除'],
    'No sessions in the selected date range.': [
      '선택한 기간에 세션이 없습니다.',
      '所选日期范围内无学习记录。',
      '選択期間にセッションがありません。',
    ],
    'The end date must be on or after the start date.': [
      '종료일은 시작일 이후여야 합니다.',
      '结束日期不能早于开始日期。',
      '終了日は開始日以降にしてください。',
    ],
    'Mastered: at least 3 consecutive graded correct answers. An incorrect answer resets the level to 0.':
      [
        '숙달: 연속 채점 정답 3회 이상. 오답은 레벨 0으로 초기화합니다.',
        '掌握：至少连续答对 3 次，答错重置为 0 级。',
        '習得済み：連続 3 回以上の正答。誤答でレベル 0 に戻ります。',
      ],
    'Unable to load this session.': [
      '세션을 불러올 수 없습니다.',
      '无法加载此学习记录。',
      'このセッションを読み込めません。',
    ],
    'LEARNING SPACE': ['학습 공간', '学习空间', '学習スペース'],
    'FLASHLAB · YOUR LEARNING SPACE': [
      'FLASHLAB · 나의 학습 공간',
      'FLASHLAB · 你的学习空间',
      'FLASHLAB・あなたの学習スペース',
    ],
    Overview: ['개요', '概览', '概要'],
    'Study sets': ['학습 세트', '学习集', '学習セット'],
    'Due today': ['오늘 복습', '今日到期', '今日の復習'],
    Statistics: ['통계', '统计', '統計'],
    'RECENT SETS': ['최근 세트', '最近学习集', '最近のセット'],
    'A little every day!': ['매일 조금씩!', '每天一点点！', '毎日少しずつ！'],
    'Ten minutes of review today can make a big difference.': [
      '오늘 10분 복습으로 큰 변화를 만드세요.',
      '今天复习十分钟，也能带来很大改变。',
      '今日の 10 分の復習が大きな力になります。',
    ],
    'FlashLab · Personal space': [
      'FlashLab · 개인 공간',
      'FlashLab · 个人空间',
      'FlashLab・個人スペース',
    ],
    'FlashLab · Data saved on the server and in your browser.': [
      'FlashLab · 서버와 브라우저에 데이터 저장.',
      'FlashLab · 数据保存在服务器和浏览器中。',
      'FlashLab・データはサーバーとブラウザーに保存。',
    ],
    Settings: ['설정', '设置', '設定'],
    'Close settings': ['설정 닫기', '关闭设置', '設定を閉じる'],
    Language: ['언어', '语言', '言語'],
    Vietnamese: ['베트남어', '越南语', 'ベトナム語'],
    Appearance: ['테마', '外观', '外観'],
    'Appearance mode': ['테마 모드', '外观模式', '外観モード'],
    Light: ['밝게', '浅色', 'ライト'],
    Dark: ['어둡게', '深色', 'ダーク'],
    System: ['시스템', '系统', 'システム'],
    'Light appearance': ['밝은 테마', '浅色外观', 'ライト表示'],
    'Dark appearance': ['어두운 테마', '深色外观', 'ダーク表示'],
    'Use system appearance': [
      '시스템 테마 사용',
      '使用系统外观',
      'システム設定を使用',
    ],
    Sound: ['소리', '声音', 'サウンド'],
    'Master volume': ['전체 음량', '主音量', '全体の音量'],
    'Volume mixer': ['음량 믹서', '音量混合器', '音量ミキサー'],
    'Background music': ['배경 음악', '背景音乐', 'BGM'],
    'Test music': ['시험 음악', '测试音乐', 'テストの音楽'],
    'Correct answer': ['정답', '回答正确', '正答'],
    'Incorrect answer': ['오답', '回答错误', '誤答'],
    'Keep trying': ['다시 도전', '继续努力', 'もう一度挑戦'],
    'Flip card': ['카드 뒤집기', '翻转卡片', 'カードを裏返す'],
    'Next card': ['다음 카드', '下一张卡片', '次のカード'],
    'Mute all sounds': ['모든 소리 끄기', '关闭所有声音', 'すべての音をオフ'],
    'Unmute all sounds': ['모든 소리 켜기', '开启所有声音', 'すべての音をオン'],
    'Background music plays throughout the app. Tests have their own music.': [
      '앱 전체에서 배경 음악을 재생하며 시험에는 별도 음악이 있습니다.',
      '背景音乐在整个应用播放，测试有独立音乐。',
      'アプリ全体で BGM を流し、テストでは専用の音楽を使います。',
    ],
    'Loading music…': [
      '음악 불러오는 중…',
      '正在加载音乐…',
      '音楽を読み込み中…',
    ],
    'Playing background music': [
      '배경 음악 재생 중',
      '正在播放背景音乐',
      'BGM を再生中',
    ],
    'Background music is muted.': [
      '배경 음악이 음소거되었습니다.',
      '背景音乐已静音。',
      'BGM はミュート中です。',
    ],
    'Music pauses while this tab is hidden.': [
      '탭이 숨겨지면 음악이 일시 중지됩니다.',
      '此标签页隐藏时音乐暂停。',
      'このタブが非表示の間は音楽を停止します。',
    ],
    'Click in the app to start music.': [
      '앱을 클릭해 음악을 시작하세요.',
      '点击应用以开始播放音乐。',
      'アプリ内を押すと音楽が始まります。',
    ],
    'User data': ['사용자 데이터', '用户数据', 'ユーザーデータ'],
    'Export ZIP folder': [
      'ZIP 폴더 내보내기',
      '导出 ZIP 文件夹',
      'ZIP フォルダーを出力',
    ],
    'Preparing ZIP folder…': [
      'ZIP 폴더 준비 중…',
      '正在准备 ZIP 文件夹…',
      'ZIP フォルダーを準備中…',
    ],
    'ZIP folder downloaded.': [
      'ZIP 폴더를 다운로드했습니다.',
      '已下载 ZIP 文件夹。',
      'ZIP フォルダーをダウンロードしました。',
    ],
    'User folder exported as ZIP.': [
      '사용자 폴더를 ZIP으로 내보냈습니다.',
      '已将用户文件夹导出为 ZIP。',
      'ユーザーフォルダーを ZIP に出力しました。',
    ],
    'Connecting…': ['연결 중…', '正在连接…', '接続中…'],
    'Saving…': ['저장 중…', '正在保存…', '保存中…'],
    Saved: ['저장됨', '已保存', '保存済み'],
    'Offline · saved temporarily in this browser': [
      '오프라인 · 브라우저에 임시 저장',
      '离线 · 暂存于此浏览器',
      'オフライン・ブラウザーに一時保存',
    ],
    'Learn better every day': [
      '매일 더 나은 학습',
      '每天学得更好',
      '毎日よりよく学ぶ',
    ],
    'Ready to discover something new? Start with one small card.': [
      '새로운 것을 배울 준비가 됐나요? 카드 한 장부터 시작하세요.',
      '准备发现新知识了吗？从一张小卡片开始。',
      '新しい発見の準備はできましたか？一枚のカードから始めましょう。',
    ],
    'Create set': ['세트 만들기', '创建学习集', 'セットを作成'],
    'Total sets': ['전체 세트', '学习集总数', 'セットの合計'],
    'sets created': ['생성한 세트', '个已创建学习集', '個の作成済みセット'],
    Flashcards: ['단어 카드', '记忆卡片', 'フラッシュカード'],
    'total flashcards': ['전체 카드', '张卡片总数', '枚のカード合計'],
    'Due for review': ['복습할 항목', '待复习', '復習待ち'],
    'to review today': ['오늘 복습할 항목', '张今日待复习', '枚が今日の復習'],
    'Studied today': ['오늘 학습', '今日已学', '今日の学習'],
    answers: ['답변', '次作答', '回の解答'],
    'Your study sets': ['나의 학습 세트', '你的学习集', '自分の学習セット'],
    'View all': ['모두 보기', '查看全部', 'すべて表示'],
    'SMART REVIEW': ['스마트 복습', '智能复习', 'スマート復習'],
    'Time to strengthen your memory! ✨': [
      '기억력을 키울 시간! ✨',
      '巩固记忆的时间到了！✨',
      '記憶を強くする時間です！✨',
    ],
    'Review now': ['지금 복습', '立即复习', '今すぐ復習'],
    'Due reviews': ['복습할 항목', '到期复习', '復習期限'],
    'Review schedule': ['복습 일정', '复习计划', '復習予定'],
    '💡 Study tip': ['💡 학습 팁', '💡 学习技巧', '💡 学習のヒント'],
    'Instead of reading over and over,': [
      '반복해서 읽기보다',
      '比起反复阅读，',
      '繰り返し読むよりも、',
    ],
    'recall the answer before flipping the card': [
      '카드를 뒤집기 전에 답을 떠올리세요',
      '翻卡前先回想答案',
      '裏返す前に答えを思い出しましょう',
    ],
    '. Quiz and Write help you practice active recall.': [
      '. 퀴즈와 쓰기로 능동적 회상을 연습하세요.',
      '。选择题和书写帮助练习主动回忆。',
      '。クイズと記述で能動的に思い出す練習ができます。',
    ],
    'Explore study modes': [
      '학습 모드 살펴보기',
      '探索学习模式',
      '学習モードを見る',
    ],
    'MY COLLECTION': ['나의 컬렉션', '我的收藏', 'マイコレクション'],
    'Organize knowledge by topic and study at your own pace.': [
      '주제별로 정리하고 내 속도로 학습하세요.',
      '按主题整理知识，按自己的节奏学习。',
      'テーマ別に整理し、自分のペースで学びましょう。',
    ],
    'Find a study set…': [
      '학습 세트 찾기…',
      '查找学习集…',
      '学習セットを検索…',
    ],
    '🔐 Your data belongs to you': [
      '🔐 데이터는 나의 것',
      '🔐 数据属于你',
      '🔐 データはあなたのもの',
    ],
    'No account needed. Your cards stay local. Export a ZIP folder in Settings or import a folder from the user menu.':
      [
        '계정 없이 카드를 로컬에 보관합니다. 설정에서 ZIP을 내보내거나 사용자 메뉴에서 폴더를 가져오세요.',
        '无需账户，卡片保留在本地。在设置导出 ZIP，或通过用户菜单导入文件夹。',
        'アカウント不要でカードはローカルに残ります。設定で ZIP を出力するか、ユーザーメニューでフォルダーを取り込みます。',
      ],
    'No study sets found': [
      '학습 세트를 찾을 수 없습니다',
      '未找到学习集',
      '学習セットが見つかりません',
    ],
    'Try another name or create your first set.': [
      '다른 이름으로 검색하거나 첫 세트를 만드세요.',
      '尝试其他名称或创建首个学习集。',
      '別の名前で探すか、最初のセットを作成してください。',
    ],
    'No study sets yet': [
      '학습 세트가 없습니다',
      '暂无学习集',
      '学習セットはまだありません',
    ],
    'Study set': ['학습 세트', '学习集', '学習セット'],
    'Study mode': ['학습 모드', '学习模式', '学習モード'],
    'Back to library': ['라이브러리로', '返回词库', 'ライブラリに戻る'],
    'Import CSV': ['CSV 가져오기', '导入 CSV', 'CSV を取り込む'],
    'Export CSV': ['CSV 내보내기', '导出 CSV', 'CSV を出力'],
    Edit: ['편집', '编辑', '編集'],
    Delete: ['삭제', '删除', '削除'],
    'YOUR STUDY SET': ['나의 학습 세트', '你的学习集', '自分の学習セット'],
    'Start studying': ['학습 시작', '开始学习', '学習を開始'],
    'Add card': ['카드 추가', '添加卡片', 'カードを追加'],
    'Choose a study mode': [
      '학습 모드 선택',
      '选择学习模式',
      '学習モードを選択',
    ],
    '6 study modes': ['6가지 학습 모드', '6 种学习模式', '6 種の学習モード'],
    Quiz: ['퀴즈', '选择练习', 'クイズ'],
    Test: ['시험', '测试', 'テスト'],
    'Flip cards and assess your recall': [
      '카드를 뒤집고 암기를 확인',
      '翻卡检查记忆',
      'カードを裏返して記憶を確認',
    ],
    'Practice with single choice': [
      '단일 선택으로 연습',
      '单选练习',
      '単一選択で練習',
    ],
    'Type answers to practice recall': [
      '답을 입력하여 회상 연습',
      '输入答案练习回忆',
      '入力で思い出す練習',
    ],
    'Take a graded test': ['채점 시험 보기', '进行计分测试', '採点付きテスト'],
    'Match pairs against the clock': [
      '시간 내 짝 맞추기',
      '计时配对',
      '時間を競ってマッチ',
    ],
    'Review cards when they are due': [
      '정해진 시간에 카드 복습',
      '按到期时间复习卡片',
      '期限のカードを復習',
    ],
    'Study settings': ['학습 설정', '学习设置', '学習設定'],
    'In order': ['순서대로', '按顺序', '順番'],
    Random: ['무작위', '随机', 'ランダム'],
    'Single choice and written': [
      '단일 선택 및 쓰기',
      '单选与书写',
      '単一選択と記述',
    ],
    'Single choice only': ['단일 선택만', '仅单选', '単一選択のみ'],
    'Written only': ['쓰기만', '仅书写', '記述のみ'],
    'Number of test questions': [
      '시험 문제 수',
      '测试题目数',
      'テストの問題数',
    ],
    'Number of matching pairs': ['짝 수', '配对数量', 'ペア数'],
    'Applies to the next session; the count is limited to available cards.': [
      '다음 세션에 적용되며 사용 가능한 카드 수로 제한됩니다.',
      '用于下次学习，数量不超过可用卡片数。',
      '次のセッションに適用され、利用可能なカード数が上限です。',
    ],
    Cards: ['카드', '卡片', 'カード'],
    'Search terms or definitions…': [
      '용어 또는 뜻 검색…',
      '搜索术语或释义…',
      '用語や意味を検索…',
    ],
    'TERM / FRONT': ['용어 / 앞면', '术语 / 正面', '用語 / 表面'],
    'DEFINITION / BACK': ['뜻 / 뒷면', '释义 / 背面', '意味 / 裏面'],
    'No matching cards': [
      '일치하는 카드 없음',
      '没有匹配卡片',
      '一致するカードがありません',
    ],
    'Add a card or try another search.': [
      '카드를 추가하거나 다른 검색어를 사용하세요.',
      '添加卡片或尝试其他搜索。',
      'カードを追加するか別の条件で検索してください。',
    ],
    'Star card': ['카드 즐겨찾기', '收藏卡片', 'カードにスターを付ける'],
    'Unstar card': ['즐겨찾기 해제', '取消收藏', 'スターを外す'],
    'Edit card': ['카드 편집', '编辑卡片', 'カードを編集'],
    'Delete card': ['카드 삭제', '删除卡片', 'カードを削除'],
    'Back to study set': ['학습 세트로', '返回学习集', '学習セットに戻る'],
    'All study sets': ['모든 학습 세트', '所有学习集', 'すべての学習セット'],
    'Write · Recall': ['쓰기 · 회상', '书写 · 回忆', '記述・想起'],
    'Spaced repetition': ['간격 반복', '间隔重复', '間隔反復'],
    'FRONT · TERM': ['앞면 · 용어', '正面 · 术语', '表面・用語'],
    'BACK · DEFINITION': ['뒷면 · 뜻', '背面 · 释义', '裏面・意味'],
    'Click the card or press Space to flip': [
      '클릭하거나 Space로 뒤집으세요',
      '点击卡片或按空格翻面',
      'クリックまたは Space で裏返す',
    ],
    'Do you remember this?': ['기억하나요?', '记住了吗？', '覚えていますか？'],
    'not remembered': ['못 외움', '未记住', '未記憶'],
    remembered: ['외움', '已记住', '記憶済み'],
    'Not remembered': ['아직 못 외움', '未记住', 'まだ覚えていない'],
    Remembered: ['외움', '已记住', '覚えた'],
    'Remembered ·': ['외움 ·', '已记住 ·', '覚えた・'],
    'Find avatar': ['아바타 찾기', '查找头像', 'アバターを検索'],
    'Your avatar': ['나의 아바타', '你的头像', '自分のアバター'],
    'Vietnamese or English name…': [
      '베트남어 또는 영어 이름…',
      '越南语或英语名称…',
      'ベトナム語または英語の名前…',
    ],
    'Backup and storage guide': [
      '백업 및 저장 안내',
      '备份与存储指南',
      'バックアップと保存のガイド',
    ],
    'Restore a backup or create a user from a CSV folder.': [
      '백업을 복원하거나 CSV 폴더로 사용자를 만드세요.',
      '恢复备份或从 CSV 文件夹创建用户。',
      'バックアップを復元するか CSV フォルダーからユーザーを作成します。',
    ],
    'Listen to pronunciation (3)': [
      '발음 듣기 (3)',
      '听发音 (3)',
      '発音を聞く (3)',
    ],
    Previous: ['이전', '上一个', '前へ'],
    Next: ['다음', '下一个', '次へ'],
    Continue: ['계속', '继续', '続ける'],
    QUIZ: ['퀴즈', '选择练习', 'クイズ'],
    WRITE: ['쓰기', '书写', '記述'],
    'Choose the correct definition': [
      '맞는 뜻을 선택하세요',
      '选择正确释义',
      '正しい意味を選んでください',
    ],
    'Choose an answer to check your knowledge.': [
      '답을 선택해 실력을 확인하세요.',
      '选择答案以检查知识。',
      '答えを選んで知識を確認しましょう。',
    ],
    'Press Enter to continue.': [
      'Enter로 계속하세요.',
      '按 Enter 继续。',
      'Enter で続けます。',
    ],
    '✓ Correct!': ['✓ 정답!', '✓ 正确！', '✓ 正解！'],
    '✕ Not quite. Try to recall it again.': [
      '✕ 아쉬워요. 다시 떠올려 보세요.',
      '✕ 还不对，再回想一下。',
      '✕ 惜しいです。もう一度思い出しましょう。',
    ],
    '✕ Your answer does not match the saved answer.': [
      '✕ 저장된 답과 다릅니다.',
      '✕ 你的答案与保存的答案不一致。',
      '✕ 保存された答えと一致しません。',
    ],
    'Type the definition or meaning': [
      '뜻을 입력하세요',
      '输入释义',
      '意味を入力してください',
    ],
    'Type your answer…': ['답을 입력하세요…', '输入答案…', '答えを入力…'],
    'Reveal answer': ['정답 보기', '显示答案', '答えを表示'],
    'Check answer': ['답 확인', '检查答案', '答えを確認'],
    'Answers must match, ignoring case and extra spaces. Alternative wording may be marked incorrect.':
      [
        '대소문자와 여분 공백을 제외하고 일치해야 합니다. 다른 표현은 오답이 될 수 있습니다.',
        '忽略大小写和多余空格后须与答案一致，其他措辞可能判错。',
        '大文字小文字と余分な空白を除いて一致する必要があります。別の表現は誤答になる場合があります。',
      ],
    Questions: ['문제', '题目', '問題'],
    'Navigate freely between questions. Your answers are graded when you submit.':
      [
        '문제를 자유롭게 이동하세요. 제출 시 채점됩니다.',
        '可自由切换题目，提交时统一评分。',
        '問題は自由に移動でき、提出時に採点されます。',
      ],
    'Submit test': ['시험 제출', '提交测试', 'テストを提出'],
    'Submit and view results': [
      '제출 후 결과 보기',
      '提交并查看结果',
      '提出して結果を見る',
    ],
    'Type your answer': ['답 입력', '输入答案', '答えを入力'],
    'Choose a term and its matching definition. Match all pairs as quickly as you can!':
      [
        '용어와 맞는 뜻을 선택하세요. 최대한 빨리 모든 짝을 맞추세요!',
        '选择术语及对应释义，尽快完成所有配对！',
        '用語と対応する意味を選び、できるだけ速くすべて合わせましょう！',
      ],
    Time: ['시간', '时间', '時間'],
    'SESSION COMPLETE': ['세션 완료', '学习完成', 'セッション完了'],
    'You finished!': ['완료했습니다!', '完成了！', '完了しました！'],
    'Study again': ['다시 학습', '再次学习', 'もう一度学習'],
    '✓ Correct': ['✓ 정답', '✓ 正确', '✓ 正解'],
    '✕ Incorrect': ['✕ 오답', '✕ 错误', '✕ 不正解'],
    'SPACED REPETITION': ['간격 반복', '间隔重复', '間隔反復'],
    'Reviewed cards return at increasing intervals to help you remember longer.':
      [
        '복습 카드는 점점 긴 간격으로 돌아와 오래 기억하도록 돕습니다.',
        '已复习卡片按逐渐增长的间隔再次出现，帮助长期记忆。',
        '復習したカードは間隔を広げて再登場し、長く覚えるのを助けます。',
      ],
    'New cards and cards due today': [
      '새 카드와 오늘 복습 카드',
      '新卡片和今日到期卡片',
      '新しいカードと今日の復習',
    ],
    'Sets to review': ['복습할 세트', '待复习学习集', '復習するセット'],
    'All caught up!': ['모두 완료!', '全部完成！', 'すべて完了！'],
    'No cards due': ['복습할 카드 없음', '无到期卡片', '復習待ちカードなし'],
    'This set has no cards': [
      '이 세트에 카드가 없습니다',
      '此学习集没有卡片',
      'このセットにカードはありません',
    ],
    'Add a few cards to get started.': [
      '카드를 추가해서 시작하세요.',
      '添加几张卡片开始吧。',
      'カードを追加して始めましょう。',
    ],
    'These cards are scheduled for a later review.': [
      '이 카드의 복습은 나중에 예정되어 있습니다.',
      '这些卡片安排在以后复习。',
      'これらのカードは今後の復習予定です。',
    ],
    'You have finished your current reviews. Come back tomorrow or learn some new cards.':
      [
        '현재 복습을 마쳤습니다. 내일 돌아오거나 새 카드를 학습하세요.',
        '当前复习已完成，明天再来或学习新卡片。',
        '現在の復習は完了です。明日また来るか、新しいカードを学びましょう。',
      ],
    'Go to library': ['라이브러리로 이동', '前往词库', 'ライブラリへ'],
    'PROGRESS & INSIGHTS': ['진도와 분석', '进度与分析', '進捗と分析'],
    'Study statistics': ['학습 통계', '学习统计', '学習統計'],
    'Track your progress and recall across study sets.': [
      '학습 세트별 진도와 기억을 확인하세요.',
      '追踪各学习集的进度与记忆。',
      '各セットの進捗と記憶を確認しましょう。',
    ],
    'Progress by set': ['세트별 진도', '各学习集进度', 'セット別の進捗'],
    'Study activity': ['학습 활동', '学习活动', '学習活動'],
    'Study activity calendar': [
      '학습 활동 달력',
      '学习活动日历',
      '学習活動カレンダー',
    ],
    'Daily study activity': [
      '일별 학습 활동',
      '每日学习活动',
      '日々の学習活動',
    ],
    Less: ['적음', '少', '少'],
    More: ['많음', '多', '多'],
    Mon: ['월', '一', '月'],
    Wed: ['수', '三', '水'],
    Fri: ['금', '五', '金'],
    'Recent sessions': ['최근 세션', '最近学习记录', '最近のセッション'],
    'No sessions yet. Try studying a set!': [
      '세션이 없습니다. 세트 학습을 시작하세요!',
      '暂无记录，试着学习一个学习集吧！',
      'セッションはまだありません。セットを学習してみましょう！',
    ],
    'Show more': ['더 보기', '显示更多', 'もっと表示'],
    'Show less': ['접기', '收起', '表示を減らす'],
    'Deleted set': ['삭제된 세트', '已删除学习集', '削除されたセット'],
    Users: ['사용자', '用户', 'ユーザー'],
    'Choose a profile. No password required.': [
      '프로필을 선택하세요. 비밀번호는 필요 없습니다.',
      '选择个人资料，无需密码。',
      'プロフィールを選んでください。パスワードは不要です。',
    ],
    'Current user': ['현재 사용자', '当前用户', '現在のユーザー'],
    'Separate sets, progress and settings': [
      '개별 세트, 진도, 설정',
      '独立学习集、进度和设置',
      '個別のセット・進捗・設定',
    ],
    Current: ['현재', '当前', '現在'],
    'Switch user': ['사용자 전환', '切换用户', 'ユーザーを切り替え'],
    'New user name': ['새 사용자 이름', '新用户名', '新しいユーザー名'],
    'For example: Alex, Sam…': [
      '예: Alex, Sam…',
      '例如：Alex、Sam…',
      '例：Alex、Sam…',
    ],
    'Add user': ['사용자 추가', '添加用户', 'ユーザーを追加'],
    'Import user folder': [
      '사용자 폴더 가져오기',
      '导入用户文件夹',
      'ユーザーフォルダーを取り込む',
    ],
    Close: ['닫기', '关闭', '閉じる'],
    Save: ['저장', '保存', '保存'],
    'Set name': ['세트 이름', '学习集名称', 'セット名'],
    Description: ['설명', '描述', '説明'],
    Color: ['색상', '颜色', '色'],
    'Term / Front': ['용어 / 앞면', '术语 / 正面', '用語 / 表面'],
    'Definition / Back': ['뜻 / 뒷면', '释义 / 背面', '意味 / 裏面'],
    'Add a new card': ['새 카드 추가', '添加新卡片', '新しいカードを追加'],
    'Page {{0}} / {{1}} · {{2}} items': [
      '{{0}} / {{1}} 페이지 · {{2}}개',
      '第 {{0}} / {{1}} 页 · {{2}} 项',
      '{{0}} / {{1}} ページ・{{2}} 件',
    ],
    '{{0}}/{{1}} remembered': [
      '{{0}}/{{1}} 암기',
      '{{0}}/{{1}} 已记住',
      '{{0}}/{{1}} 記憶済み',
    ],
    'Time: {{0}}': ['시간: {{0}}', '时间：{{0}}', '時間：{{0}}'],
    'Assessment: {{0}}': ['평가: {{0}}', '评价：{{0}}', '評価：{{0}}'],
    'Connect AI to profile {{0}} on the computer running FlashLab.': [
      'FlashLab이 실행 중인 컴퓨터에서 AI를 {{0}} 프로필에 연결합니다.',
      '在运行 FlashLab 的电脑上将 AI 连接到资料 {{0}}。',
      'FlashLab が動作するパソコンで AI をプロフィール {{0}} に接続します。',
    ],
    'Replace all current data with {{0}} profiles, {{1}} cards, {{2}} posts and {{3}} images from this database? A recovery database will be saved before making changes.':
      [
        '현재 전체 데이터를 이 데이터베이스의 프로필 {{0}}개, 카드 {{1}}장, 게시물 {{2}}개, 이미지 {{3}}개로 교체할까요? 변경 전 복구 데이터베이스를 저장합니다.',
        '用此数据库中的 {{0}} 个资料、{{1}} 张卡片、{{2}} 篇文章和 {{3}} 张图片替换当前全部数据？更改前会保存恢复数据库。',
        '現在の全データをこのデータベースのプロフィール {{0}} 件、カード {{1}} 枚、記事 {{2}} 件、画像 {{3}} 枚に置き換えますか？変更前に復旧用データベースを保存します。',
      ],
    'Restore profile “{{0}}” with {{1}} cards, progress, history, settings, notes and posts? The profile with this ID will be replaced; other profiles will be preserved. A recovery database will be saved before making changes.':
      [
        '프로필 “{{0}}”의 카드 {{1}}장, 진도, 기록, 설정, 노트, 게시물을 복원할까요? 같은 ID의 프로필을 교체하고 다른 프로필은 유지합니다. 변경 전 복구 데이터베이스를 저장합니다.',
        '恢复资料“{{0}}”的 {{1}} 张卡片、进度、历史、设置、笔记和文章？同 ID 资料将被替换，其他资料保留。更改前保存恢复数据库。',
        'プロフィール「{{0}}」のカード {{1}} 枚、進捗、履歴、設定、ノート、記事を復元しますか？同じ ID のプロフィールを置き換え、他は保持します。変更前に復旧用データベースを保存します。',
      ],
    'Row {{0}}: a word class is present but its meaning is missing.': [
      '{{0}}행: 품사는 있지만 뜻이 없습니다.',
      '第 {{0}} 行：有词性但缺少释义。',
      '{{0}} 行目：品詞がありますが意味がありません。',
    ],
    'Completed {{0}} pairs · {{1}}/{{2}} correct matches · {{3}} incorrect': [
      '{{0}}쌍 완료 · {{1}}/{{2}} 정답 · {{3}} 오답',
      '完成 {{0}} 对 · {{1}}/{{2}} 次正确 · {{3}} 次错误',
      '{{0}} 組完了・{{1}}/{{2}} 正解・{{3}} 誤答',
    ],
    'Imported {{0}} cards. Overwritten: {{1}}. Merged: {{2}}. Skipped: {{3}}.':
      [
        '{{0}}장 가져옴. 덮어쓰기 {{1}}, 병합 {{2}}, 건너뜀 {{3}}.',
        '已导入 {{0}} 张。覆盖 {{1}}，合并 {{2}}，跳过 {{3}}。',
        '{{0}} 枚を取り込みました。上書き {{1}}、統合 {{2}}、スキップ {{3}}。',
      ],
    'Imported {{0}} cards. Overwritten {{1}}. Skipped {{2}}.': [
      '{{0}}장 가져옴. 덮어쓰기 {{1}}, 건너뜀 {{2}}.',
      '已导入 {{0}} 张。覆盖 {{1}}，跳过 {{2}}。',
      '{{0}} 枚を取り込みました。上書き {{1}}、スキップ {{2}}。',
    ],
    'Change avatar: {{0}}': [
      '아바타 변경: {{0}}',
      '更换头像：{{0}}',
      'アバターを変更：{{0}}',
    ],
    'Delete session {{0}}': [
      '세션 {{0}} 삭제',
      '删除学习记录 {{0}}',
      'セッション {{0}} を削除',
    ],
    'Cannot submit yet. Answer and confirm questions: {{0}}.': [
      '아직 제출할 수 없습니다. 답변·확인이 필요한 문제: {{0}}.',
      '暂不能提交，请作答并确认题目：{{0}}。',
      'まだ提出できません。解答・確定が必要な問題：{{0}}。',
    ],
    'Level {{0}} (days)': [
      '레벨 {{0}} (일)',
      '{{0}} 级（天）',
      'レベル {{0}}（日）',
    ],
    '{{0}} days': ['{{0}}일', '{{0}} 天', '{{0}} 日'],
    '{{0}} / {{1}} confirmed': [
      '{{0}} / {{1}} 확인',
      '{{0}} / {{1}} 已确认',
      '{{0}} / {{1}} 確定済み',
    ],
    'The term “{{0}}” is duplicated in the study set “{{1}}”.': [
      '학습 세트 “{{1}}”에 용어 “{{0}}”가 중복됩니다.',
      '术语“{{0}}”在学习集“{{1}}”中重复。',
      '用語「{{0}}」がセット「{{1}}」で重複しています。',
    ],
    'Unable to save data (code {{0}}). Your changes are kept in this browser.':
      [
        '데이터 저장 실패 (코드 {{0}}). 변경은 이 브라우저에 유지됩니다.',
        '无法保存数据（代码 {{0}}），更改保留在此浏览器。',
        'データを保存できません（コード {{0}}）。変更はこのブラウザーに保持されます。',
      ],
    'File {{0}} contains no valid cards.': [
      '파일 {{0}}에 유효한 카드가 없습니다.',
      '文件 {{0}} 不含有效卡片。',
      'ファイル {{0}} に有効なカードがありません。',
    ],
    'Stop preview: {{0}}': [
      '미리 듣기 중지: {{0}}',
      '停止试听：{{0}}',
      '試聴を停止：{{0}}',
    ],
    '{{0}} / {{1}} sets': [
      '{{0}} / {{1}} 세트',
      '{{0}} / {{1}} 个学习集',
      '{{0}} / {{1}} セット',
    ],
    'Due · {{0}}': ['복습 시간 · {{0}}', '到期 · {{0}}', '期限・{{0}}'],
    'Up to {{0}} available cards': [
      '사용 가능한 카드 최대 {{0}}장',
      '最多 {{0}} 张可用卡片',
      '利用できるカードは最大 {{0}} 枚',
    ],
    'Choose a number from 1 to {{0}}.': [
      '1–{{0}} 사이 숫자를 선택하세요.',
      '请选择 1 到 {{0}} 之间的数字。',
      '1～{{0}} の数を選んでください。',
    ],
    'Delete class “{{0}}”? Study sets and progress will be kept.': [
      '클래스 “{{0}}”를 삭제할까요? 세트와 진도는 유지됩니다.',
      '删除班级“{{0}}”？学习集和进度将保留。',
      'クラス「{{0}}」を削除しますか？セットと進捗は保持されます。',
    ],
    'User: {{0}}. Switch or manage users': [
      '사용자: {{0}}. 전환 또는 관리',
      '用户：{{0}}。切换或管理用户',
      'ユーザー：{{0}}。切り替え・管理',
    ],
    'Please enter {{0}}.': [
      '{{0}}을(를) 입력하세요.',
      '请输入{{0}}。',
      '{{0}}を入力してください。',
    ],
    'Maximum {{0}} characters.': [
      '최대 {{0}}자입니다.',
      '最多 {{0}} 字符。',
      '最大 {{0}} 文字です。',
    ],
    'Imported {{0}} cards.': [
      '카드 {{0}}장을 가져왔습니다.',
      '已导入 {{0}} 张卡片。',
      '{{0}} 枚のカードを取り込みました。',
    ],
    'Delete the card “{{0}}” from this set? This cannot be undone.': [
      '이 세트의 “{{0}}” 카드를 삭제할까요? 되돌릴 수 없습니다.',
      '删除此学习集的卡片“{{0}}”？无法撤销。',
      'このセットのカード「{{0}}」を削除しますか？元に戻せません。',
    ],
    'Delete the set “{{0}}” and its {{1}} cards? This cannot be undone.': [
      '“{{0}}” 세트와 카드 {{1}}장을 삭제할까요? 되돌릴 수 없습니다.',
      '删除学习集“{{0}}”及 {{1}} 张卡片？无法撤销。',
      'セット「{{0}}」と {{1}} 枚のカードを削除しますか？元に戻せません。',
    ],
    'Delete user “{{0}}” and all their sets, progress and settings? This cannot be undone.':
      [
        '사용자 “{{0}}”와 모든 세트, 진도, 설정을 삭제할까요? 되돌릴 수 없습니다.',
        '删除用户“{{0}}”及全部学习集、进度和设置？无法撤销。',
        'ユーザー「{{0}}」とすべてのセット、進捗、設定を削除しますか？元に戻せません。',
      ],
    'Add {{0}} cards from CSV to “{{1}}”. Existing cards will be kept.': [
      'CSV 카드 {{0}}장을 “{{1}}”에 추가합니다. 기존 카드는 유지됩니다.',
      '从 CSV 添加 {{0}} 张卡片到“{{1}}”，已有卡片保留。',
      'CSV から {{0}} 枚を「{{1}}」に追加します。既存のカードは保持します。',
    ],
    'CSV not imported: the term “{{0}}” is duplicated in this set or file.': [
      'CSV를 가져오지 않았습니다. “{{0}}” 용어가 세트나 파일에서 중복됩니다.',
      '未导入 CSV：术语“{{0}}”在此学习集或文件中重复。',
      'CSV 未取り込み：用語「{{0}}」がセットまたはファイルで重複しています。',
    ],
    'Overwrite sets and progress for “{{0}}” with the selected folder? Back up the database in Settings first to keep a copy.':
      [
        '선택한 폴더로 “{{0}}”의 세트와 진도를 덮어쓸까요? 복사본이 필요하면 먼저 설정에서 데이터베이스를 백업하세요.',
        '用所选文件夹覆盖“{{0}}”的学习集和进度？如需副本，请先在设置备份数据库。',
        '選んだフォルダーで「{{0}}」のセットと進捗を上書きしますか？コピーを残すには先に設定でバックアップしてください。',
      ],
    'The file {{0}} contains no valid cards.': [
      '파일 {{0}}에 유효한 카드가 없습니다.',
      '文件 {{0}} 不含有效卡片。',
      'ファイル {{0}} に有効なカードがありません。',
    ],
    '{{0}} answers · {{1}} correct · {{2}} incorrect · Time {{3}}': [
      '{{0}} 답변 · {{1}} 정답 · {{2}} 오답 · 시간 {{3}}',
      '{{0}} 次作答 · {{1}} 正确 · {{2}} 错误 · 时间 {{3}}',
      '{{0}} 解答・{{1}} 正解・{{2}} 誤答・時間 {{3}}',
    ],
    'Study set: {{0}}': [
      '학습 세트: {{0}}',
      '学习集：{{0}}',
      '学習セット：{{0}}',
    ],
    '{{0}} · {{1}}': ['{{0}} · {{1}}', '{{0}} · {{1}}', '{{0}}・{{1}}'],
    '{{0}} cards are due. Spend a few minutes reviewing to remember them longer.':
      [
        '카드 {{0}}장을 복습할 시간입니다. 잠깐 복습해서 더 오래 기억하세요.',
        '{{0}} 张卡片已到期，花几分钟复习以长久记住。',
        '{{0}} 枚が復習時刻です。数分の復習で長く覚えましょう。',
      ],
    'Review all ({{0}})': [
      '모두 복습 ({{0}})',
      '全部复习（{{0}}）',
      'すべて復習（{{0}}）',
    ],
    '{{0}} answers · {{1}} correct · {{2}} incorrect': [
      '{{0}} 답변 · {{1}} 정답 · {{2}} 오답',
      '{{0}} 次作答 · {{1}} 正确 · {{2}} 错误',
      '{{0}} 解答・{{1}} 正解・{{2}} 誤答',
    ],
    'Matched {{0}} pairs in {{1}} · {{2}}/{{3}} correct attempts · {{4}} incorrect':
      [
        '{{1}}에 {{0}}쌍 완료 · {{2}}/{{3}} 정답 · {{4}} 오답',
        '{{1}} 内配对 {{0}} 对 · {{2}}/{{3}} 次正确 · {{4}} 次错误',
        '{{1}} で {{0}} 組・{{2}}/{{3}} 正解・{{4}} 誤答',
      ],
    '{{0}} remembered · {{1}} not remembered · {{2}}%': [
      '{{0}} 암기 · {{1}} 미암기 · {{2}}%',
      '{{0}} 已记住 · {{1}} 未记住 · {{2}}%',
      '{{0}} 記憶済み・{{1}} 未記憶・{{2}}%',
    ],
    '{{0}}/{{1}} correct': [
      '{{0}}/{{1}} 정답',
      '{{0}}/{{1}} 正确',
      '{{0}}/{{1}} 正解',
    ],
    '{{0}}/{{1}} cards': [
      '{{0}}/{{1}} 카드',
      '{{0}}/{{1}} 张卡片',
      '{{0}}/{{1}} 枚',
    ],
    'Showing {{0}} / {{1}} sessions': [
      '{{0}} / {{1}} 세션 표시',
      '显示 {{0}} / {{1}} 条记录',
      '{{0}} / {{1}} セッションを表示',
    ],
    'Show more ({{0}})': [
      '더 보기 ({{0}})',
      '显示更多（{{0}}）',
      'もっと表示（{{0}}）',
    ],
    '{{0}} sets': ['{{0}} 세트', '{{0}} 个学习集', '{{0}} セット'],
    '{{0}} cards': ['{{0}} 카드', '{{0}} 张卡片', '{{0}} 枚'],
    '{{0}} mastered': ['{{0}} 숙달', '{{0}} 已掌握', '{{0}} 習得済み'],
    '{{0}} due': ['{{0}} 복습', '{{0}} 到期', '{{0}} 復習待ち'],
    '{{0}} answers': ['{{0}} 답변', '{{0}} 次作答', '{{0}} 回の解答'],
    '{{0}} study answers': [
      '{{0}} 학습 답변',
      '{{0}} 次学习作答',
      '{{0}} 回の学習解答',
    ],
    '{{0}} saved sessions': [
      '{{0}} 저장된 세션',
      '{{0}} 条已保存学习记录',
      '{{0}} 件の保存済みセッション',
    ],
    '{{0}} study answers · {{1}} active days': [
      '{{0}} 학습 답변 · {{1}}일 활동',
      '{{0}} 次学习作答 · {{1}} 个活跃日',
      '{{0}} 回の解答・{{1}} 日の活動',
    ],
    '{{0}}: {{1}} study answers': [
      '{{0}}: {{1}} 학습 답변',
      '{{0}}：{{1}} 次学习作答',
      '{{0}}：{{1}} 回の学習解答',
    ],
    '{{0}} / {{1}} answered': [
      '{{0}} / {{1}} 답변',
      '{{0}} / {{1}} 已答',
      '{{0}} / {{1}} 解答済み',
    ],
    '{{0}} / {{1}} cards': [
      '{{0}} / {{1}} 카드',
      '{{0}} / {{1}} 张卡片',
      '{{0}} / {{1}} 枚',
    ],
    'QUESTION {{0}} · SINGLE CHOICE': [
      '문제 {{0}} · 단일 선택',
      '第 {{0}} 题 · 单选',
      '問題 {{0}}・単一選択',
    ],
    'QUESTION {{0}} · WRITTEN': [
      '문제 {{0}} · 쓰기',
      '第 {{0}} 题 · 书写',
      '問題 {{0}}・記述',
    ],
    'QUESTION {{0}} · SELECT MULTIPLE ANSWERS': [
      '문제 {{0}} · 정답 모두 선택',
      '第 {{0}} 题 · 多选',
      '問題 {{0}}・複数選択',
    ],
    'QUESTION {{0}} · WRITE MULTIPLE ANSWERS': [
      '문제 {{0}} · 여러 답 쓰기',
      '第 {{0}} 题 · 多答案书写',
      '問題 {{0}}・複数の解答を記述',
    ],
    'Question {{0}}': ['문제 {{0}}', '第 {{0}} 题', '問題 {{0}}'],
    '{{0}} cards · Page {{1}} / {{2}}': [
      '{{0}} 카드 · {{1}} / {{2}} 페이지',
      '{{0}} 张卡片 · 第 {{1}} / {{2}} 页',
      '{{0}} 枚・{{1}} / {{2}} ページ',
    ],
    '{{0}} remembered · {{1}} not remembered · {{2}}% remembered': [
      '{{0}} 암기 · {{1}} 미암기 · {{2}}% 암기',
      '{{0}} 已记住 · {{1}} 未记住 · {{2}}% 已记住',
      '{{0}} 記憶済み・{{1}} 未記憶・{{2}}% 記憶済み',
    ],
    'Answer: {{0}}': ['정답: {{0}}', '答案：{{0}}', '答え：{{0}}'],
    'Suggested answer: {{0}}': [
      '추천 답: {{0}}',
      '参考答案：{{0}}',
      '解答例：{{0}}',
    ],
    'Your answer: {{0}}': [
      '내 답: {{0}}',
      '你的答案：{{0}}',
      'あなたの解答：{{0}}',
    ],
    '{{0}} order': ['{{0}} 순서', '{{0}}顺序', '{{0}}の順序'],
    'Volume: {{1}}': ['음량: {{1}}', '音量：{{1}}', '音量：{{1}}'],
    'Mute {{1}}': ['{{1}} 소리 끄기', '关闭{{1}}声音', '{{1}}をミュート'],
    'Unmute {{1}}': [
      '{{1}} 소리 켜기',
      '开启{{1}}声音',
      '{{1}}のミュートを解除',
    ],
    'Preview {{1}}': ['{{1}} 미리 듣기', '试听{{1}}', '{{1}}を試聴'],
    'Review answers ({{0}} questions)': [
      '답안 검토 ({{0}}문제)',
      '查看答案（{{0}} 题）',
      '解答の確認（{{0}} 問）',
    ],
    'Study sets, progress and settings for {{0}}.': [
      '{{0}}의 학습 세트, 진도, 설정.',
      '{{0}} 的学习集、进度和设置。',
      '{{0}} の学習セット・進捗・設定。',
    ],
    'Insert {{0}}': ['{{0}} 삽입', '插入 {{0}}', '{{0}} を挿入'],
    'Example: {{0}}': ['예: {{0}}', '示例：{{0}}', '例：{{0}}'],
    '{{0}} · open symbol keyboard': [
      '{{0}} · 기호 키보드 열기',
      '{{0}} · 打开符号键盘',
      '{{0}}・記号キーボードを開く',
    ],
    'Correct answers:': ['정답 수:', '答对次数：', '正答数：'],
    'Test:': ['시험:', '测试：', 'テスト：'],
    Jan: ['1월', '1月', '1月'],
    Feb: ['2월', '2月', '2月'],
    Mar: ['3월', '3月', '3月'],
    Apr: ['4월', '4月', '4月'],
    May: ['5월', '5月', '5月'],
    Jun: ['6월', '6月', '6月'],
    Jul: ['7월', '7月', '7月'],
    Aug: ['8월', '8月', '8月'],
    Sep: ['9월', '9月', '9月'],
    Oct: ['10월', '10月', '10月'],
    Nov: ['11월', '11月', '11月'],
    Dec: ['12월', '12月', '12月'],
    'Profile database downloaded.': [
      '프로필 데이터베이스를 다운로드했습니다.',
      '已下载个人资料数据库。',
      'プロフィールのデータベースをダウンロードしました。',
    ],
  };

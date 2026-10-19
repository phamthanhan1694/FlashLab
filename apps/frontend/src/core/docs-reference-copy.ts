/** English reference key → Vietnamese, Korean, Simplified Chinese, Japanese. */
export const referenceCopy: Record<
  string,
  readonly [string, string, string, string]
> = {
  'Time limit': ['Giới hạn thời gian', '시간 제한', '时间限制', '時間制限'],
  'Enable time limit': [
    'Bật giới hạn thời gian',
    '시간 제한 사용',
    '启用时间限制',
    '時間制限を有効にする',
  ],
  Hours: ['Giờ', '시간', '小时', '時間'],
  Minutes: ['Phút', '분', '分钟', '分'],
  Seconds: ['Giây', '초', '秒', '秒'],
  Remaining: ['Còn lại', '남은 시간', '剩余', '残り'],
  'Time expired': ['Hết thời gian', '시간 종료', '时间已到', '時間切れ'],
  'Unlimited by default. Timing starts after Start and continues in Settings or other apps. At one third remaining, a persistent red warning appears.':
    [
      'Mặc định không giới hạn. Thời gian bắt đầu khi bấm Bắt đầu và vẫn chạy khi mở Cài đặt hoặc chuyển ứng dụng. Còn 1/3 thời gian sẽ hiện cảnh báo đỏ liên tục.',
      '기본은 무제한입니다. 시작 후 설정이나 다른 앱에서도 시간이 흐릅니다. 남은 시간이 1/3이면 빨간 고정 경고가 표시됩니다.',
      '默认不限时。点击开始后计时，打开设置或切换应用仍继续。剩余 1/3 时持续显示红色警告。',
      '既定は無制限です。開始後は設定や他アプリでも計時し、残り 1/3 で赤い固定警告を表示します。',
    ],
  'Automatic submission at timeout: only confirmed answers are graded; unconfirmed or blank questions count as incorrect.':
    [
      'Hết giờ tự nộp: chỉ câu đã xác nhận được chấm; câu chưa xác nhận hoặc bỏ trống tính sai.',
      '시간 종료 시 자동 제출하며 확인된 답만 채점합니다. 미확인·빈 답은 오답입니다.',
      '超时自动提交，仅评分已确认答案；未确认或空白题算错。',
      '時間切れで自動提出し、確定済みのみ採点します。未確定・空欄は誤答です。',
    ],
  'At timeout, end the session and save recorded attempts; untouched cards are not marked wrong.':
    [
      'Hết giờ kết thúc phiên và lưu phần đã học; thẻ chưa làm không bị tính sai.',
      '시간 종료 시 학습한 부분을 저장하고 끝냅니다. 미시도 카드는 오답으로 처리하지 않습니다.',
      '超时结束学习并保存已完成部分，未做卡片不算错。',
      '時間切れで実施済みを保存して終了し、未実施カードは誤答にしません。',
    ],
  'Enter a positive duration: hours 0–99, minutes and seconds 0–59.': [
    'Nhập thời gian lớn hơn 0; giờ 0–99, phút và giây 0–59.',
    '0보다 큰 시간을 입력하세요. 시간 0–99, 분·초 0–59입니다.',
    '请输入大于 0 的时长：小时 0–99，分和秒 0–59。',
    '0 より大きい時間を入力してください。時間は 0～99、分・秒は 0～59 です。',
  ],
  'Time is running out — at most one third remains.': [
    'Sắp hết thời gian — còn tối đa 1/3 thời lượng.',
    '시간이 얼마 남지 않았습니다 — 최대 1/3이 남았습니다.',
    '时间即将用尽，最多剩余 1/3。',
    '時間が少なくなりました。残りは最大 1/3 です。',
  ],
  'Time expired. The test was submitted; unconfirmed or blank questions count as incorrect.':
    [
      'Hết thời gian. Bài đã tự nộp; câu chưa xác nhận hoặc bỏ trống tính sai.',
      '시간이 종료되어 시험을 제출했습니다. 미확인·빈 답은 오답입니다.',
      '时间已到，测试已提交；未确认或空白题算错。',
      '時間切れで提出しました。未確定・空欄は誤答です。',
    ],
  'Time expired. Recorded attempts were saved; untouched cards were not marked wrong.':
    [
      'Hết thời gian. Đã lưu phần đã học; thẻ chưa làm không bị tính sai.',
      '시간이 종료되어 학습한 부분을 저장했습니다. 미시도 카드는 오답으로 처리하지 않았습니다.',
      '时间已到，已保存完成部分，未做卡片未判错。',
      '時間切れで実施済みを保存しました。未実施カードは誤答にしていません。',
    ],
  'Incorrect answers subtract progress; they lower one level only if progress was already zero.':
    [
      'Trả lời sai trừ tiến độ; chỉ hạ một cấp nếu tiến độ đã bằng 0 từ trước.',
      '오답은 진도를 차감하며 이미 0이었을 때만 한 레벨 내려갑니다.',
      '答错会扣进度，仅在进度已为 0 时降一级。',
      '誤答は進捗を減らし、既に 0 の場合のみ一レベル下がります。',
    ],
  'Incorrect answers: retry after': [
    'Trả lời sai: học lại sau',
    '오답: 재시도까지',
    '答错后重试等待',
    '誤答の再試行まで',
  ],
  'The six intervals must increase. Incorrect answers subtract progress; only an incorrect answer at zero progress lowers one level.':
    [
      'Khoảng cách của 6 cấp phải tăng dần. Trả lời sai trừ tiến độ; chỉ sai khi đã 0 điểm mới hạ một cấp.',
      '6개 간격은 증가해야 합니다. 오답은 진도를 차감하고 이미 0일 때만 한 레벨 내려갑니다.',
      '六个间隔须递增。答错扣进度，仅在已为 0 分时降一级。',
      '六つの間隔は昇順です。誤答は進捗を減らし、既に 0 の場合のみ一レベル下がります。',
    ],
  'MCP function reference': [
    'Tra cứu từng hàm MCP',
    'MCP 함수 참조',
    'MCP 函数参考',
    'MCP 関数リファレンス',
  ],
  'What is a tool?': [
    'Tool (hàm công cụ) là gì?',
    '도구 함수란?',
    '什么是工具函数？',
    'ツール関数とは？',
  ],
  'A tool is a named operation that the AI client calls with JSON arguments. You can ask in natural language; the client discovers tools and sends tools/call. The examples below are tools/call payloads, not HTTP endpoints or shell commands.':
    [
      'Tool là một thao tác có tên mà ứng dụng AI gọi bằng tham số JSON. Bạn có thể yêu cầu bằng ngôn ngữ tự nhiên; ứng dụng AI tự khám phá công cụ rồi gửi tools/call. Ví dụ dưới đây là phần tham số của tools/call, không phải địa chỉ HTTP hay lệnh terminal.',
      '도구는 AI 클라이언트가 JSON 인수로 호출하는 작업입니다. 자연어로 요청하면 클라이언트가 도구를 찾아 tools/call을 보냅니다. 아래 예시는 tools/call 페이로드이며 HTTP 주소나 터미널 명령이 아닙니다.',
      '工具是 AI 客户端通过 JSON 参数调用的命名操作。你可用自然语言提出请求，客户端发现工具并发送 tools/call。以下示例是 tools/call 载荷，并非 HTTP 地址或终端命令。',
      'ツールは AI クライアントが JSON 引数で呼ぶ操作です。自然言語で依頼するとクライアントがツールを検出し tools/call を送ります。以下はそのペイロードであり、HTTP エンドポイントやシェルコマンドではありません。',
    ],
  Parameters: ['Tham số', '매개변수', '参数', '引数'],
  'Call example': ['Ví dụ gọi', '호출 예시', '调用示例', '呼び出し例'],
  'Returned fields': [
    'Các trường trả về',
    '반환 필드',
    '返回字段',
    '返されるフィールド',
  ],
  'Write permission required': [
    'Cần bật quyền sửa',
    '쓰기 권한 필요',
    '需要写入权限',
    '書き込み権限が必要',
  ],
  'IDs in examples are placeholders. Obtain deckId/cardId from read results and revision from the latest result. A successful write returns the new revision; use it for the next write.':
    [
      'ID trong ví dụ là chỗ giữ chỗ. Lấy deckId/cardId từ kết quả đọc và revision từ kết quả mới nhất. Mỗi lần ghi thành công trả revision mới; dùng số đó cho lần ghi tiếp theo.',
      '예시 ID는 자리 표시자입니다. 읽기 결과에서 deckId/cardId를, 최신 결과에서 revision을 얻으세요. 쓰기 성공 후 반환된 새 revision을 다음 쓰기에 사용하세요.',
      '示例 ID 为占位符。deckId/cardId 取自读取结果，revision 取最新结果。写入成功返回新 revision，下一次写入使用该值。',
      '例の ID は仮の値です。deckId/cardId は読み取り結果、revision は最新結果から取得します。書き込み後の新しい revision を次の書き込みに使ってください。',
    ],
  'Pagination defaults to offset 0 and limit 30; limit accepts 1–100. Continue with nextOffset until it is null. Images are omitted from lists; hasImage indicates availability.':
    [
      'Phân trang mặc định offset 0, limit 30; limit nhận 1–100. Tiếp tục với nextOffset đến khi bằng null. Danh sách không chứa ảnh gốc; hasImage cho biết có ảnh hay không.',
      '페이지 기본값은 offset 0, limit 30이며 limit은 1–100입니다. nextOffset이 null이 될 때까지 이어서 읽으세요. 목록은 원본 이미지를 제외하고 hasImage로 여부를 표시합니다.',
      '分页默认 offset 0、limit 30；limit 为 1–100。使用 nextOffset 继续，直到为 null。列表不含原图，hasImage 表示是否有图。',
      'ページは既定で offset 0、limit 30、limit の範囲は 1～100 です。nextOffset が null になるまで読みます。リストに原画像は含まず hasImage で有無を示します。',
    ],
  'Read the connected profile, its revision, write permission, deck/card counts and classes. It cannot select or enumerate other profiles.':
    [
      'Đọc hồ sơ đang kết nối, revision, quyền ghi, tổng học phần/thẻ và các lớp. Không chọn hoặc liệt kê được hồ sơ khác.',
      '연결된 프로필의 revision, 쓰기 권한, 세트·카드 수와 클래스를 읽습니다. 다른 프로필은 선택하거나 나열할 수 없습니다.',
      '读取当前资料、revision、写入权限、学习集与卡片总数及班级，不能选择或列出其他资料。',
      '接続中のプロフィール、revision、書き込み権限、セット・カード数、クラスを読みます。他のプロフィールは選択・列挙できません。',
    ],
  'Find study sets by title or description. Returns metadata and cardCount, without card bodies. An empty query lists all sets.':
    [
      'Tìm học phần theo tên hoặc mô tả. Trả thông tin học phần và cardCount, không chứa nội dung thẻ. query rỗng để liệt kê mọi học phần.',
      '이름·설명으로 세트를 찾습니다. 카드 본문 없이 메타데이터와 cardCount를 반환합니다. 빈 query는 전체 목록입니다.',
      '按标题或描述查找学习集，返回元数据和 cardCount，不含卡片正文。query 为空时列出全部。',
      'タイトル・説明から検索し、カード本文を含まないメタデータと cardCount を返します。空の query は全件です。',
    ],
  'Read one study set and cardCount. To read its cards, follow with list_cards.':
    [
      'Đọc thông tin một học phần và cardCount. Dùng tiếp list_cards để đọc các thẻ bên trong.',
      '세트 하나의 정보와 cardCount를 읽습니다. 내부 카드는 list_cards로 읽으세요.',
      '读取单个学习集信息和 cardCount，再用 list_cards 读取其卡片。',
      '一つのセットと cardCount を読みます。中のカードは list_cards で読みます。',
    ],
  'Read a set’s cards with all meanings, word classes, pronunciation, notes and learning progress. Does not return original image data.':
    [
      'Đọc thẻ trong học phần, gồm mọi nghĩa, từ loại, phát âm, ghi chú và tiến độ. Không trả dữ liệu ảnh gốc.',
      '세트의 모든 뜻, 품사, 발음, 노트, 학습 진도를 읽습니다. 원본 이미지 데이터는 제외합니다.',
      '读取学习集卡片的全部释义、词性、发音、笔记和学习进度，不返回原图数据。',
      'セット内の全意味、品詞、発音、ノート、学習進捗を読みます。原画像データは除きます。',
    ],
  'Search terms, all meanings, pronunciation and notes. deckId is optional; omitting it searches all sets in the connected profile. Each hit includes deckId, deckTitle and card.':
    [
      'Tìm trong thuật ngữ, mọi nghĩa, phát âm và ghi chú. deckId tùy chọn; bỏ qua để tìm toàn bộ hồ sơ đang kết nối. Mỗi kết quả có deckId, deckTitle và card.',
      '용어, 모든 뜻, 발음, 노트를 검색합니다. deckId를 생략하면 연결된 프로필 전체를 검색합니다. 결과마다 deckId, deckTitle, card가 있습니다.',
      '搜索术语、全部释义、发音和笔记。deckId 可选，省略则搜索当前资料全部学习集。每项含 deckId、deckTitle 和 card。',
      '用語、全意味、発音、ノートを検索します。deckId を省くと接続中の全セットを検索し、各結果に deckId、deckTitle、card を含みます。',
    ],
  'Read one complete card. includeImage defaults to false; true also returns the original image data URL. Learning fields are included in either case.':
    [
      'Đọc đầy đủ một thẻ. includeImage mặc định false; true trả thêm data URL ảnh gốc. Các trường tiến độ luôn được giữ.',
      '카드 하나를 읽습니다. includeImage 기본값은 false이며 true면 원본 이미지 data URL도 반환합니다. 진도 필드는 항상 포함됩니다.',
      '读取完整单卡。includeImage 默认 false，true 时附带原图 data URL。无论是否取图都保留学习字段。',
      '一枚のカードを読みます。includeImage の既定は false、true で原画像の data URL も返します。進捗は常に含みます。',
    ],
  'Create an empty set; add cards with add_cards. title is required (1–120 characters), description defaults to empty (maximum 500), color defaults to purple.':
    [
      'Tạo học phần rỗng, thêm thẻ bằng add_cards. title bắt buộc (1–120 ký tự), description mặc định rỗng (tối đa 500), color mặc định purple.',
      '빈 세트를 만들고 add_cards로 카드를 추가합니다. title 필수(1–120자), description 기본 빈 값(최대 500자), color 기본 purple입니다.',
      '创建空学习集，再用 add_cards 添加卡片。title 必填（1–120 字符），description 默认空（最多 500），color 默认 purple。',
      '空のセットを作成し、add_cards でカードを追加します。title は必須（1～120 文字）、description は既定で空（最大 500）、color は purple です。',
    ],
  'Patch title, description or color. Supply at least one changed field. Cards, progress and class membership are preserved.':
    [
      'Sửa title, description hoặc color; changes phải có ít nhất một trường. Giữ nguyên thẻ, tiến độ và liên kết lớp học.',
      'title, description, color 중 하나 이상을 수정합니다. 카드, 진도, 클래스 소속은 유지됩니다.',
      '修改 title、description 或 color，changes 至少一个字段。保留卡片、进度及班级关联。',
      'title、description、color を一つ以上変更します。カード、進捗、クラス所属は保持します。',
    ],
  'Permanently delete a set and all its cards, and remove class references. Historical sessions remain. Requires confirmed: true after the user agrees.':
    [
      'Xóa vĩnh viễn học phần, mọi thẻ bên trong và liên kết trong lớp; giữ phiên học lịch sử. Cần confirmed: true sau khi người dùng đồng ý.',
      '세트와 모든 카드, 클래스 연결을 영구 삭제합니다. 이전 세션은 유지됩니다. 사용자 동의 후 confirmed: true가 필요합니다.',
      '永久删除学习集、全部卡片和班级引用，保留历史学习记录。用户同意后需 confirmed: true。',
      'セット、全カード、クラス参照を完全に削除し、過去のセッションは残します。ユーザーの同意後 confirmed: true が必要です。',
    ],
  'Append 1–100 cards atomically. Every card needs front and back. Normalized duplicate terms reject the entire batch. Successful results return addedCardIds; existing progress is unchanged.':
    [
      'Thêm 1–100 thẻ trong một giao dịch. Mỗi thẻ cần front và back. Thuật ngữ trùng sau chuẩn hóa làm cả lô bị từ chối. Thành công trả addedCardIds; tiến độ cũ giữ nguyên.',
      '1–100장을 한 트랜잭션으로 추가합니다. front와 back은 필수이며 정규화된 중복 용어가 있으면 전체 배치를 거부합니다. addedCardIds를 반환하고 기존 진도를 유지합니다.',
      '以单次事务追加 1–100 张卡片，每张需 front 和 back。标准化后术语重复会拒绝整批。成功返回 addedCardIds，原进度不变。',
      '1～100 枚を一つの処理で追加します。front と back は必須で、正規化後に用語が重複すると全件拒否します。addedCardIds を返し、既存の進捗は保持します。',
    ],
  'Patch card content; omitted fields stay unchanged. null clears optional definitions, word class, pronunciation, speech language, notes or image. ID, level, schedule and learning progress cannot be overwritten.':
    [
      'Sửa nội dung thẻ; trường không gửi giữ nguyên. null xóa definitions, từ loại, phát âm, ngôn ngữ đọc, ghi chú hoặc ảnh tùy chọn. Không ghi đè được ID, cấp, lịch ôn và tiến độ.',
      '카드 내용만 수정하며 생략한 필드는 유지됩니다. 선택적인 definitions, 품사, 발음, 음성 언어, 노트, 이미지는 null로 지웁니다. ID·레벨·일정·진도는 덮어쓸 수 없습니다.',
      '修改卡片内容，省略字段不变。null 可清除可选 definitions、词性、发音、朗读语言、笔记或图片，不能覆盖 ID、等级、计划和进度。',
      'カードの内容を変更し、省いた項目は保持します。任意の definitions、品詞、発音、読み上げ言語、ノート、画像は null で消せます。ID・レベル・予定・進捗は上書きできません。',
    ],
  'Permanently delete 1–100 specified cards in one set. Missing or repeated IDs reject the entire operation. Requires confirmed: true; other cards keep their content and progress.':
    [
      'Xóa vĩnh viễn 1–100 thẻ chỉ định trong một học phần. ID thiếu hoặc lặp khiến toàn bộ thao tác bị từ chối. Cần confirmed: true; thẻ khác giữ nguyên nội dung và tiến độ.',
      '한 세트에서 지정한 1–100장을 영구 삭제합니다. 누락·중복 ID가 있으면 전체 작업을 거부합니다. confirmed: true가 필요하며 다른 카드는 유지됩니다.',
      '永久删除一个学习集中指定的 1–100 张卡片。ID 缺失或重复会拒绝整次操作。需 confirmed: true，其他卡片内容和进度不变。',
      '一つのセットの指定カード 1～100 枚を完全に削除します。欠落・重複 ID があると全体を拒否します。confirmed: true が必要で、他のカードは保持します。',
    ],
  'Card content and limits': [
    'Nội dung thẻ và giới hạn',
    '카드 내용과 제한',
    '卡片内容与限制',
    'カード内容と制限',
  ],
  'back is the first meaning; definitions contains up to 19 additional meanings, as strings or meaning/partOfSpeech objects. Each meaning may have its own word class. Omit definitions to keep a single meaning.':
    [
      'back là nghĩa đầu; definitions chứa tối đa 19 nghĩa thêm, dạng chuỗi hoặc đối tượng meaning/partOfSpeech. Mỗi nghĩa có thể có từ loại riêng. Bỏ definitions nếu thẻ chỉ có một nghĩa.',
      'back은 첫 뜻이고 definitions는 문자열 또는 meaning/partOfSpeech 객체로 최대 19개 뜻을 추가합니다. 각 뜻에 별도 품사를 지정할 수 있으며 뜻이 하나면 생략하세요.',
      'back 为首条释义，definitions 最多 19 条附加释义，可为字符串或 meaning/partOfSpeech 对象。每条可有独立词性，单释义时省略 definitions。',
      'back は最初の意味、definitions は文字列または meaning/partOfSpeech 形式で最大 19 個の追加意味です。各意味に個別の品詞を設定でき、一つなら definitions を省きます。',
    ],
  'front/back/notes: up to 4000 characters; pronunciation: 500; partOfSpeech: 120. image accepts PNG/JPEG/WebP/GIF base64 data URLs up to 1,000,000 characters. add_cards checks a serialized batch limit of 2,000,000 characters.':
    [
      'front/back/notes tối đa 4000 ký tự; pronunciation 500; partOfSpeech 120. image nhận data URL base64 PNG/JPEG/WebP/GIF tối đa 1.000.000 ký tự. add_cards kiểm tra lô JSON tối đa 2.000.000 ký tự.',
      'front/back/notes 최대 4000자, pronunciation 500자, partOfSpeech 120자입니다. image는 PNG/JPEG/WebP/GIF base64 data URL 최대 1,000,000자, add_cards의 JSON 배치는 최대 2,000,000자입니다.',
      'front/back/notes 最多 4000 字符，pronunciation 500，partOfSpeech 120。image 接受最多 1,000,000 字符的 PNG/JPEG/WebP/GIF base64 data URL；add_cards 检查 JSON 批次最多 2,000,000 字符。',
      'front/back/notes は最大 4000 文字、pronunciation は 500、partOfSpeech は 120 です。image は PNG/JPEG/WebP/GIF の base64 data URL 最大 1,000,000 文字、add_cards の JSON は最大 2,000,000 文字です。',
    ],
  'Colors accept purple, blue, peach, mint, pink or a six-digit #RRGGBB value. starred and suspended are booleans; suspended cards leave the automatic review queue.':
    [
      'Màu nhận purple, blue, peach, mint, pink hoặc mã #RRGGBB sáu chữ số. starred và suspended là boolean; thẻ suspended không vào hàng đợi ôn tự động.',
      '색상은 purple, blue, peach, mint, pink 또는 6자리 #RRGGBB입니다. starred·suspended는 불리언이며 suspended 카드는 자동 복습에서 제외됩니다.',
      '颜色支持 purple、blue、peach、mint、pink 或六位 #RRGGBB。starred 与 suspended 为布尔值，暂停卡片不进入自动复习队列。',
      '色は purple、blue、peach、mint、pink または 6 桁の #RRGGBB です。starred と suspended は真偽値で、一時停止カードは自動復習から除きます。',
    ],
  'Safe read–edit workflow': [
    'Quy trình đọc rồi sửa an toàn',
    '안전한 읽기·편집 순서',
    '安全的读取与编辑流程',
    '安全な読み取り・編集手順',
  ],
  'Read the target and its revision, review the proposed change, write with that revision, then keep the returned revision. On CONFLICT, read again and compare before retrying. After a lost response, read to check whether the write succeeded before attempting another create/add/delete.':
    [
      'Đọc đối tượng và revision, xem thay đổi dự định, ghi bằng revision đó rồi giữ revision mới trả về. Gặp CONFLICT phải đọc lại và so sánh trước khi thử tiếp. Nếu mất phản hồi, đọc để xác minh đã ghi hay chưa trước khi tạo/thêm/xóa lần nữa.',
      '대상과 revision을 읽고 변경을 검토한 뒤 해당 revision으로 씁니다. 반환된 새 revision을 보관하세요. CONFLICT면 다시 읽고 비교합니다. 응답이 유실되면 생성·추가·삭제를 반복하기 전에 성공 여부를 읽어 확인하세요.',
      '读取目标及 revision，检查拟修改内容，使用该 revision 写入并保留新值。遇到 CONFLICT 先重读比较。响应丢失时先读取确认是否成功，再考虑重复创建、添加或删除。',
      '対象と revision を読み、変更を確認してその revision で書き込み、新しい値を保持します。CONFLICT は再読して比較してください。応答を失った場合も作成・追加・削除を繰り返す前に成功したか読み取って確認します。',
    ],
  'Error codes': ['Mã lỗi', '오류 코드', '错误代码', 'エラーコード'],
  'CONFLICT means stale revision; NOT_FOUND means a missing profile, set or card; INVALID_DATA means invalid content or limits; STORAGE_ERROR means storage access failed. A failed atomic batch makes no partial edits. A read-only connection does not expose write tools.':
    [
      'CONFLICT: revision cũ; NOT_FOUND: hồ sơ/học phần/thẻ không tồn tại; INVALID_DATA: nội dung hoặc giới hạn không hợp lệ; STORAGE_ERROR: lỗi truy cập kho dữ liệu. Lô bị từ chối không lưu dở dang. Kết nối chỉ đọc không công bố hàm ghi.',
      'CONFLICT는 이전 revision, NOT_FOUND는 없는 프로필·세트·카드, INVALID_DATA는 잘못된 내용·제한, STORAGE_ERROR는 저장소 오류입니다. 실패한 배치는 일부만 저장하지 않습니다. 읽기 전용 연결에는 쓰기 도구가 없습니다.',
      'CONFLICT 表示旧 revision；NOT_FOUND 表示资料、学习集或卡片不存在；INVALID_DATA 表示内容或限制无效；STORAGE_ERROR 表示存储访问失败。失败批次不会部分保存。只读连接不公开写入工具。',
      'CONFLICT は古い revision、NOT_FOUND は対象なし、INVALID_DATA は内容・上限の違反、STORAGE_ERROR は保存先へのアクセス失敗です。失敗した一括操作は一部だけ保存しません。読み取り専用接続に書き込みツールはありません。',
    ],
  'Resources and prompts': [
    'Resource và prompt',
    '리소스와 프롬프트',
    '资源与提示词',
    'リソースとプロンプト',
  ],
  'flashlab://guide is a read-only guide resource. The study_set prompt takes deckId and asks the AI to tutor one word at a time without changing recorded progress. AI chat answers do not automatically earn FlashLab points. No tools edit study history, posts, profiles or restore databases.':
    [
      'flashlab://guide là resource hướng dẫn chỉ đọc. Prompt study_set nhận deckId để AI hỏi từng từ, không sửa tiến độ đã lưu. Trả lời trong chat AI không tự cộng điểm FlashLab. Chưa có hàm sửa lịch sử, bài viết, hồ sơ hoặc khôi phục database.',
      'flashlab://guide는 읽기 전용 안내 리소스입니다. study_set 프롬프트는 deckId로 한 단어씩 지도하며 저장된 진도를 바꾸지 않습니다. AI 채팅 답변은 FlashLab 점수를 자동 추가하지 않습니다. 기록·게시물·프로필 편집이나 DB 복원 도구는 없습니다.',
      'flashlab://guide 是只读指南资源。study_set 提示接收 deckId，让 AI 逐词辅导而不修改保存进度。在 AI 聊天作答不会自动获得 FlashLab 积分。暂无修改历史、文章、资料或恢复数据库的工具。',
      'flashlab://guide は読み取り専用ガイドです。study_set は deckId を受け、保存済み進捗を変えず一語ずつ指導します。AI チャットで答えても FlashLab の点数は自動加算されません。履歴・記事・プロフィールの編集や DB 復元ツールはありません。',
    ],
  'Test scoring and multiple answers': [
    'Chấm điểm Kiểm tra và câu nhiều đáp án',
    '시험 점수와 복수 답안',
    '测试评分与多答案题',
    'テスト採点と複数解答',
  ],
  'Each question is worth 1 point: fully correct = 1, otherwise = 0. There is no partial credit per meaning and no negative test score. The displayed percentage is the correct question count divided by total questions, rounded to a whole percent.':
    [
      'Mỗi câu trị giá 1 điểm: đúng hoàn toàn = 1, còn lại = 0. Không chia điểm theo từng nghĩa và không có điểm âm trong bài. Tỷ lệ hiển thị là số câu đúng chia tổng số câu, làm tròn phần trăm nguyên.',
      '문제당 완전 정답 1점, 그 외 0점입니다. 뜻별 부분 점수나 시험 음수 점수는 없습니다. 정답 수를 전체 문제 수로 나눈 백분율을 정수로 반올림합니다.',
      '每题完全正确得 1 分，否则 0 分。各释义不计部分分，测试无负分。显示比例为答对题数除以总题数，四舍五入为整数百分比。',
      '一問につき完全正答は 1 点、それ以外は 0 点です。意味ごとの部分点や負のテスト点はありません。正答数を全問題数で割った割合を整数の百分率に丸めます。',
    ],
  'Example: 7 fully correct questions out of 10 give 70%. A question with 3 required meanings and only 2 correct meanings gives 0 points for that question. Test points and per-card mastery progress are separate measures.':
    [
      'Ví dụ: đúng trọn vẹn 7/10 câu được 70%. Câu cần 3 nghĩa nhưng chỉ đúng 2 nghĩa được 0 điểm cho câu đó. Điểm bài kiểm tra và điểm tiến độ của từng thẻ là hai chỉ số riêng.',
      '예: 10문제 중 7문제 완전 정답이면 70%입니다. 필요한 3개 뜻 중 2개만 맞히면 그 문제는 0점입니다. 시험 점수와 카드별 숙달 진도는 별개입니다.',
      '例如 10 题完整答对 7 题为 70%。某题要求 3 个释义，只答对 2 个则该题 0 分。测试成绩与每张卡片的掌握进度是不同指标。',
      '例：10 問中 7 問の完全正答は 70% です。必要な意味が 3 個で 2 個しか正しくなければその問題は 0 点です。テスト得点とカードごとの習得進捗は別です。',
    ],
  'Multiple choice: select every distinct saved meaning and no incorrect options. Missing one correct option or selecting one extra incorrect option makes the whole question incorrect. Option order does not matter.':
    [
      'Trắc nghiệm nhiều đáp án: chọn mọi nghĩa đã lưu khác nhau, không chọn phương án sai. Thiếu một phương án đúng hoặc chọn thừa một phương án sai làm cả câu sai. Không xét thứ tự lựa chọn.',
      '복수 선택은 서로 다른 저장된 뜻을 모두 고르고 오답은 고르지 않아야 합니다. 정답 하나 누락 또는 오답 하나 추가 시 전체가 오답이며 순서는 상관없습니다.',
      '多选需选中所有不同的已保存释义，且不能选错。少选一个正确项或多选一个错误项，整题判错，选项顺序无关。',
      '複数選択では異なる保存済みの意味をすべて選び、誤答を選ばないでください。一つでも不足・余分な誤答があればその問題は不正解で、順序は問いません。',
    ],
  'Multiple written answers: use one meaning per field, including every distinct meaning exactly once. Extra, duplicate, blank or incorrect fields make the whole question incorrect. Do not combine meanings into a single field with commas or semicolons.':
    [
      'Tự luận nhiều đáp án: mỗi ô một nghĩa, đủ mọi nghĩa khác nhau đúng một lần. Ô thừa, trùng, trống hoặc sai làm cả câu sai. Không gộp các nghĩa vào một ô bằng dấu phẩy hay chấm phẩy.',
      '복수 쓰기는 칸마다 뜻 하나를 정확히 한 번씩 모두 입력합니다. 추가·중복·빈칸·오답이 있으면 전체 오답입니다. 쉼표나 세미콜론으로 한 칸에 합치지 마세요.',
      '多答案书写每框一个释义，每个不同释义恰好一次。多填、重复、空白或错误均使整题判错。不要用逗号或分号把多个释义写在一框。',
      '複数記述は各欄に一つの意味を入れ、異なる意味を一回ずつすべて答えます。余分・重複・空欄・誤答があるとその問題は不正解です。カンマやセミコロンで一欄にまとめないでください。',
    ],
  'Matching ignores letter case, leading/trailing spaces, repeated whitespace and Unicode composition differences. Accents, spelling and wording must still match. The same meaning saved with different word classes counts once for answer grading.':
    [
      'So sánh bỏ qua hoa/thường, khoảng trắng đầu/cuối, khoảng trắng lặp và khác biệt tổ hợp Unicode. Vẫn phân biệt dấu, chính tả và cách diễn đạt. Một nghĩa giống nhau lưu với các từ loại khác nhau chỉ tính một lần khi chấm.',
      '대소문자, 앞뒤·중복 공백, 유니코드 조합 차이는 무시합니다. 악센트·철자·표현은 일치해야 합니다. 같은 뜻이 다른 품사로 저장되어도 채점에서는 한 번만 셉니다.',
      '忽略大小写、首尾及重复空白、Unicode 组合差异，但仍区分声调符号、拼写和措辞。同一释义即使词性不同，评分时也只算一次。',
      '大文字小文字、前後・連続空白、Unicode の合成差は無視しますが、アクセント・綴り・表現は一致が必要です。同じ意味を別品詞で保存しても採点では一つと数えます。',
    ],
  'With multiple answers disabled, any one saved meaning is enough. A word with only one distinct meaning needs one answer even when multiple answers are enabled. Confirm each answer; editing it removes confirmation. Normal submission requires all questions answered and confirmed.':
    [
      'Tắt nhiều đáp án thì một nghĩa đã lưu bất kỳ là đủ. Từ chỉ có một nghĩa khác nhau vẫn chỉ cần một đáp án dù bật nhiều đáp án. Xác nhận từng câu; sửa câu làm mất xác nhận. Nộp bình thường cần trả lời và xác nhận mọi câu.',
      '복수 답안을 끄면 저장된 뜻 하나면 됩니다. 뜻이 하나면 복수 모드에서도 답 하나만 필요합니다. 문제마다 확인하고 수정하면 확인이 해제됩니다. 일반 제출은 전체 답변·확인이 필요합니다.',
      '关闭多答案时任一保存释义即可。只有一个不同释义时，即使开启多答案也只需一个答案。逐题确认，修改后取消确认；普通提交需全部作答并确认。',
      '複数解答を無効にすると保存済みの意味一つで正解です。意味が一つなら有効時も答えは一つです。各問題を確定し、編集すると解除されます。通常提出には全問の解答と確定が必要です。',
    ],
  'Unfinished progress and the next review': [
    'Chưa đủ tiến độ và lịch học lại',
    '미완료 진도와 다음 복습',
    '未达进度与下次复习',
    '未達成の進捗と次の復習',
  ],
  'Progress is retained across days and sessions; it does not reset at midnight. Not studying does not automatically lower a level or deduct points. Overdue active cards remain in Due now until studied; suspended cards are excluded.':
    [
      'Tiến độ giữ qua ngày và qua phiên, không đặt lại lúc nửa đêm. Không học không tự hạ cấp hay trừ điểm. Thẻ đang hoạt động mà quá hạn vẫn nằm ở Cần ôn ngay cho tới khi học; thẻ tạm dừng được loại khỏi lịch.',
      '진도는 날짜·세션을 넘어 유지되며 자정에 초기화되지 않습니다. 공부하지 않았다고 레벨·점수가 자동 차감되지는 않습니다. 기한 지난 활성 카드는 복습할 때까지 남고 일시 중지 카드는 제외됩니다.',
      '进度跨日期和学习保留，不在午夜重置。不学习不会自动降级或扣分。逾期有效卡片仍在立即复习列表，暂停卡片除外。',
      '進捗は日付・セッションを越えて保持され、深夜にリセットしません。学習しなくても自動降格や減点はありません。期限切れカードは復習するまで残り、一時停止カードは除きます。',
    ],
  'A correct answer schedules from that answer’s time using the resulting current level, even if the next-level target is not met. Default levels 1–6 use 1, 3, 7, 14, 30 and 60 days; level 0 uses the retry interval (default 5 minutes). An incorrect answer always uses the retry interval.':
    [
      'Trả lời đúng tính lịch từ thời điểm vừa trả lời theo cấp hiện có sau lượt đó, kể cả chưa đủ lên cấp tiếp. Mặc định cấp 1–6 hẹn sau 1, 3, 7, 14, 30, 60 ngày; cấp 0 dùng thời gian thử lại, mặc định 5 phút. Trả lời sai luôn dùng thời gian thử lại.',
      '정답 후 다음 레벨 조건을 못 채워도 해당 답변 시점의 결과 레벨로 예약합니다. 기본 레벨 1–6은 1·3·7·14·30·60일, 레벨 0은 재시도 간격(기본 5분)입니다. 오답은 항상 재시도 간격을 사용합니다.',
      '答对后即使未达到升级目标，也从此次作答时间按结果等级安排。默认 1–6 级为 1、3、7、14、30、60 天；0 级采用重试间隔（默认 5 分钟）。答错始终用重试间隔。',
      '正答後は次の昇格条件に未達でも、その回答時点から結果の現在レベルで予定します。既定の 1～6 は 1・3・7・14・30・60 日、0 は再試行間隔（既定 5 分）です。誤答は常に再試行間隔を使います。',
    ],
  'Example: a level-3 card answered correctly without reaching level 4 is due 7 days later by default, not necessarily tomorrow. Review settings can change intervals; a manual schedule stays until recalculated or the card is answered again.':
    [
      'Ví dụ: thẻ cấp 3 trả lời đúng nhưng chưa lên cấp 4 được hẹn sau 7 ngày theo mặc định, không nhất thiết ngày mai. Cài đặt ôn tập cho đổi khoảng cách; lịch chỉnh tay giữ tới khi tính lại hoặc trả lời thẻ lần nữa.',
      '예: 레벨 3에서 맞혔지만 4로 못 오르면 기본 7일 후이며 반드시 내일은 아닙니다. 간격은 설정에서 바꾸고 수동 일정은 재계산 또는 다음 답변까지 유지됩니다.',
      '例如 3 级卡片答对但未升 4 级，默认 7 天后复习，并非必然明天。设置可更改间隔；手动计划保留到重新计算或再次作答。',
      '例：レベル 3 で正答しても 4 に届かなければ既定で 7 日後で、必ず翌日ではありません。設定で間隔を変えられ、手動予定は再計算か次の解答まで保持します。',
    ],
  'An incorrect answer deducts one progress point and one credit in that mode, down to zero; a wrong Test answer also deducts one Test credit. Reaching zero clears mode credits. A further wrong answer while already at zero lowers one level, with a floor of zero.':
    [
      'Sai trừ một điểm tiến độ và một lượt của dạng bài vừa làm, tối thiểu 0; sai Kiểm tra còn trừ một lượt Kiểm tra. Về 0 điểm thì xóa các lượt theo dạng bài. Nếu đã 0 điểm mà tiếp tục sai mới hạ một cấp, không thấp hơn cấp 0.',
      '오답은 진도 1점과 해당 모드 실적 1회를 최소 0까지 차감하며 시험 오답은 시험 실적도 1회 차감합니다. 진도 0에서 모드 실적을 지우고 이미 0일 때 추가 오답이면 한 레벨 하락합니다.',
      '答错扣 1 个进度积分和当前模式 1 次记录，最低 0；测试答错还扣 1 次测试记录。积分归零时清空模式记录，已为 0 再答错才降一级，最低 0 级。',
      '誤答で進捗 1 点とそのモードの実績 1 回を最低 0 まで減らし、テスト誤答はテスト実績も 1 回減ります。進捗 0 でモード実績を消去し、既に 0 のときに再度誤答すると一レベル下がります。',
    ],
  'Time limits and automatic submission': [
    'Giới hạn thời gian và tự nộp bài',
    '시간 제한과 자동 제출',
    '时间限制与自动提交',
    '時間制限と自動提出',
  ],
  'Each of the six modes has its own saved time limit per profile. The default is unlimited. Before starting, enable the limit and enter 0–99 hours, 0–59 minutes and 0–59 seconds; the total must be positive.':
    [
      'Sáu chế độ có giới hạn thời gian riêng lưu theo hồ sơ, mặc định không giới hạn. Trước khi bắt đầu, bật giới hạn rồi nhập giờ 0–99, phút 0–59, giây 0–59; tổng thời gian phải lớn hơn 0.',
      '6개 모드는 프로필마다 시간 제한을 따로 저장하며 기본은 무제한입니다. 시작 전에 켜고 0–99시간, 0–59분, 0–59초를 입력하세요. 합계는 0보다 커야 합니다.',
      '六种模式各自按资料保存时间限制，默认不限。开始前启用并输入 0–99 小时、0–59 分钟、0–59 秒，总时长须大于 0。',
      '六つのモードにプロフィール別の時間制限があり、既定は無制限です。開始前に有効にし 0～99 時間、0～59 分、0～59 秒を入力し、合計は 0 より大きくします。',
    ],
  'The countdown starts only after Start. Settings, hidden tabs and other apps do not pause it. At one third remaining, a persistent red warning and countdown appear; the Test toolbar also turns red.':
    [
      'Đồng hồ chỉ bắt đầu sau khi bấm Bắt đầu. Mở Cài đặt, ẩn tab hay chuyển ứng dụng không tạm dừng. Khi còn 1/3, cảnh báo đỏ và đồng hồ hiện liên tục; thanh Kiểm tra cũng chuyển đỏ.',
      '시작을 누른 뒤 카운트다운하며 설정·숨겨진 탭·다른 앱에서도 멈추지 않습니다. 남은 시간이 1/3이면 빨간 고정 경고와 카운트다운을 표시하고 시험 도구 모음도 빨갛게 바뀝니다.',
      '点击开始后才计时，设置、隐藏标签页或切换应用不会暂停。剩余 1/3 时持续显示红色警告和倒计时，测试工具栏也变红。',
      '開始を押してから計時し、設定・非表示タブ・他アプリでも止まりません。残り 1/3 で赤い固定警告とカウントダウンを表示し、テストバーも赤くなります。',
    ],
  'At timeout, Test submits automatically: only confirmed answers are graded; unconfirmed or blank questions are incorrect even if text has been entered. Other modes stop and save recorded attempts; untouched cards are not marked wrong. Finishing early stops the countdown.':
    [
      'Hết giờ, Kiểm tra tự nộp: chỉ câu đã xác nhận được chấm; chưa xác nhận hoặc bỏ trống tính sai dù đã nhập nội dung. Chế độ khác kết thúc và lưu các lượt đã làm; thẻ chưa làm không bị tính sai. Hoàn thành sớm thì đồng hồ dừng.',
      '시간 종료 시 시험을 자동 제출하며 확인한 답만 채점합니다. 입력했어도 미확인·빈 답은 오답입니다. 다른 모드는 기록한 시도만 저장하고 미시도 카드를 오답 처리하지 않습니다. 일찍 끝내면 시계가 멈춥니다.',
      '超时自动提交测试，仅评分已确认答案；即使已输入，未确认或空白仍判错。其他模式停止并保存已完成尝试，未做卡片不判错。提前完成则计时停止。',
      '時間切れでテストを自動提出し、確定済みだけ採点します。入力済みでも未確定・空欄は誤答です。他モードは記録済みの試行を保存し、未実施カードを誤答にしません。早く完了すれば計時も止まります。',
    ],
};

export const referencePhrases = Object.fromEntries(
  Object.entries(referenceCopy).map(([english, values]) => [
    values[0],
    english,
  ]),
);
export const referenceLocales = Object.fromEntries(
  Object.entries(referenceCopy).map(([english, [, ko, zh, ja]]) => [
    english,
    [ko, zh, ja] as const,
  ]),
);
export const docCopy = (key: string) => referenceCopy[key][0];

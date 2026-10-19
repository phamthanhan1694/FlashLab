# Kết nối AI với FlashLab qua MCP

FlashLab cung cấp **MCP server cục bộ qua stdio**, dùng SDK TypeScript chính thức. Claude Desktop, Codex và các MCP client hỗ trợ stdio có thể đọc, tìm kiếm và quản lý học phần/thẻ trong database SQLite đang dùng. Không cần xuất CSV/JSON để AI làm việc với thẻ.

## Kết nối từ giao diện

Mở **Docs → Kết nối AI qua MCP** trong ứng dụng để đọc hướng dẫn cục bộ, gồm thiết lập Claude Desktop/Codex, quyền truy cập, ví dụ yêu cầu và xử lý lỗi. Trang Docs hỗ trợ Tiếng Việt, English, 한국어, 中文（简体） và 日本語.

1. Mở FlashLab, chọn đúng hồ sơ người dùng.
2. Vào **Cài đặt → Kết nối AI qua MCP**.
3. Chọn **Chỉ đọc** hoặc **Đọc và sửa thẻ, học phần**. Mặc định chỉ đọc.
4. Chọn **Claude Desktop / JSON** hoặc **Codex / TOML**, nhấn **Tạo cấu hình kết nối**, rồi **Sao chép cấu hình**.
5. Dán vào cấu hình MCP của ứng dụng AI trên **cùng máy chạy FlashLab**, rồi khởi động lại kết nối MCP.

Cấu hình được tạo từ đường dẫn thực tế của máy và hồ sơ đang chọn. Repo không chứa tên tài khoản Windows hay đường dẫn cá nhân cố định. Nếu chuyển vị trí cài đặt hoặc đổi thư mục dữ liệu, tạo lại cấu hình kết nối.

Với Codex, thêm đoạn TOML vào `~/.codex/config.toml` (Windows thường là `%USERPROFILE%\.codex\config.toml`), gộp vào bảng `mcp_servers.flashlab` nếu đã có, rồi khởi động lại kết nối. Xem [tài liệu OpenAI về MCP](https://developers.openai.com/codex/mcp).

Với Claude Desktop, mở phần cấu hình MCP dành cho developer và gộp mục `flashlab` trong JSON vào `mcpServers` hiện có. Giữ lại cấu hình của các server khác. Xem [hướng dẫn kết nối MCP server cục bộ](https://modelcontextprotocol.io/docs/develop/connect-local-servers).

MCP client tự khởi động tiến trình stdio và đóng nó khi ngắt kết nối. Không cần giữ cửa sổ FlashLab mở. Bản desktop dùng Node đi kèm bộ cài, nên máy nhận không cần cài thêm Node/npm/Rust. Cần cài **bản FlashLab mới có tính năng MCP**; bộ cài cũ chưa có tính năng này.

## Quyền và dữ liệu

- Mỗi kết nối chỉ truy cập **một hồ sơ** được ghi trong cấu hình. Không đọc được hồ sơ khác qua tham số tool.
- Chế độ chỉ đọc không công bố các tool ghi. `--allow-writes` mới bật tạo/sửa/xóa thẻ và học phần.
- Lựa chọn quyền trong FlashLab chỉ tạo cấu hình mới. Để đổi hoặc thu hồi quyền của kết nối đang dùng, cập nhật/xóa cấu hình trong ứng dụng AI rồi ngắt và kết nối lại. Tiến trình đã chạy giữ quyền khởi động của nó.
- Mọi thao tác ghi cần `revision` mới nhất. Nếu ứng dụng hoặc AI khác vừa sửa dữ liệu, server trả `CONFLICT`; AI phải đọc lại trước khi sửa tiếp.
- Sửa nội dung thẻ giữ nguyên ID, lịch ôn, mức thuộc, số câu đúng/sai, thông tin tiến độ, các trường không được sửa và dữ liệu khác của hồ sơ. Gửi `null` để xóa một trường nội dung tùy chọn.
- Thẻ mới hỗ trợ nhiều nghĩa, loại từ, phát âm, ngôn ngữ đọc, ghi chú, ảnh, đánh dấu sao và tạm ngưng. Không ghi đè cả database hay thay đổi cấu hình nơi lưu dữ liệu qua MCP.
- Danh sách có phân trang, tối đa 100 mục/lần. Ảnh không nằm trong danh sách; `get_card` với `includeImage: true` đọc ảnh gốc. Khi thêm thẻ, tối đa 100 thẻ và 2.000.000 ký tự JSON/lần.
- Xóa cần `confirmed: true`. AI được hướng dẫn hỏi người dùng trước khi xóa. Nên sao lưu `.sqlite` trong Cài đặt trước khi giao AI chỉnh sửa nhiều dữ liệu.
- Sau khi AI sửa, tải lại FlashLab để thấy dữ liệu mới. Nếu đang có thay đổi chưa lưu trong ứng dụng, cơ chế xử lý xung đột hiện tại sẽ giữ chúng để bạn xử lý.

Server này không mở cổng MCP trên mạng. Đây là kết nối stdio với chương trình AI trên máy chạy FlashLab; không phải URL để ứng dụng AI chạy hoàn toàn trên đám mây truy cập trực tiếp. Ứng dụng AI có thể gửi nội dung các thẻ đã đọc cho nhà cung cấp mô hình theo cấu hình của ứng dụng đó. FlashLab MCP không tự gọi API mô hình hoặc thực hiện thanh toán.

## Các công cụ

Tool đọc: `get_profile`, `list_decks`, `get_deck`, `list_cards`, `search_cards`, `get_card`.

Tool ghi: `create_deck`, `update_deck`, `delete_deck`, `add_cards`, `update_card`, `delete_cards`.

Ngoài ra có resource hướng dẫn `flashlab://guide` và prompt `study_set` để AI hỗ trợ ôn một học phần. MCP hiện tập trung vào thẻ và học phần; không có tool sửa lịch sử học, bài viết, hồ sơ hay khôi phục database.

Ví dụ yêu cầu trong ứng dụng AI sau khi kết nối:

- “Tìm các thẻ có nghĩa ngân hàng trong FlashLab.”
- “Đọc học phần English và hỏi tôi từng từ một.”
- “Thêm 20 từ về du lịch vào học phần này, có phiên âm và ví dụ.”
- “Kiểm tra nghĩa và sửa chính tả, giữ nguyên tiến độ học của tôi.”

## Chạy từ mã nguồn

Sau `npm ci` và `npm run build`, có thể dùng `node apps/backend/dist/mcp/cli.js --profile <ID>` từ thư mục repo. ID lấy trong hồ sơ hoặc cấu hình được tạo từ giao diện. Đường dẫn lưu mặc định được đọc từ `flashlab.config.json`, theo quy tắc đường dẫn của bản web.

Cấu hình sao chép từ giao diện luôn chỉ định đường dẫn tuyệt đối `--storage-dir` và `--legacy-file` để dùng đúng database của backend đang chạy, kể cả khi được khởi động từ thư mục khác hoặc có biến môi trường khác. Khi chạy web bằng chế độ dev, cấu hình dùng `tsx` trong dependencies hiện có; bản build dùng JavaScript đã biên dịch.

Không dùng `npm run mcp` làm lệnh trực tiếp của MCP client vì thông báo của npm có thể đi vào stdout. Hãy dùng `command` và `args` được tạo trong giao diện. Chạy lệnh stdio bằng tay trong terminal sẽ chờ dữ liệu JSON-RPC từ client; đây là hành vi bình thường.

## Kiểm thử

`npm test` chạy MCP client chính thức qua pipe stdio thật, kiểm tra discovery, tool/resource/prompt, phân trang, tìm kiếm tiếng Việt, quyền, dữ liệu nhiều nghĩa/ảnh, thao tác sửa giữ nguyên tiến độ và xung đột với backend HTTP cùng database. `npm run test:desktop` kiểm tra thêm entry point đã đóng gói.

Tham khảo [SDK MCP chính thức](https://github.com/modelcontextprotocol/typescript-sdk) và [quy tắc stdio](https://ts.sdk.modelcontextprotocol.io/v2/serving/stdio).

<!-- mcp-tool-reference -->

## Các kiểu dữ liệu dùng trong tham số và kết quả

`revision` là phiên bản của toàn bộ dữ liệu hồ sơ đang kết nối, không phải phiên bản riêng của một thẻ. ID là chuỗi dài 1–128 ký tự lấy từ kết quả đọc; không tự suy đoán từ tên học phần.

`DeckMetadata` gồm `id`, `title`, `description`, `color`, `created`, `lastOpened` tùy chọn và `cardCount`. `Card` gồm nội dung dưới đây cùng `id`, `level`, `correct`, `wrong`, `last`, `due`, `remembered`, `masteryProgress` và `hasImage`. Ảnh gốc chỉ được trả khi gọi `get_card` với `includeImage: true`.

```ts
type CardContent = {
  front: string;
  back: string;
  definitions?: (string | { meaning: string; partOfSpeech?: string })[];
  partOfSpeech?: string;
  pronunciation?: string;
  speechLanguage?:
    | 'en-US'
    | 'en-GB'
    | 'vi-VN'
    | 'zh-CN'
    | 'zh-TW'
    | 'ja-JP'
    | 'ko-KR'
    | 'fr-FR'
    | 'de-DE'
    | 'es-ES';
  notes?: string;
  image?: string;
  starred?: boolean;
  suspended?: boolean;
};
```

`back` là nghĩa đầu, `definitions` có tối đa 19 nghĩa thêm. `front`, `back`, `notes` tối đa 4000 ký tự; `pronunciation` 500; `partOfSpeech` 120. Ảnh dùng data URL base64 PNG/JPEG/WebP/GIF tối đa 1.000.000 ký tự. Lô `add_cards` tối đa 100 thẻ và 2.000.000 ký tự JSON. Màu là `purple`, `blue`, `peach`, `mint`, `pink` hoặc `#RRGGBB` sáu chữ số.

`update_card` giữ trường bị bỏ qua; gửi `null` để xóa `definitions`, `partOfSpeech`, `pronunciation`, `speechLanguage`, `notes` hoặc `image`. Không gửi `null` cho `front`, `back`, `starred` hoặc `suspended`. Không có tham số ghi đè cấp, điểm tiến độ, số lượt đúng/sai hay lịch ôn.

Resource được đọc bằng `resources/read` với `{"uri":"flashlab://guide"}`. Prompt được lấy bằng `prompts/get` với `{"name":"study_set","arguments":{"deckId":"deck-id"}}`. Prompt chỉ hướng dẫn AI hỏi từng từ; trả lời trong chat không tự cộng điểm tiến độ. Xem [cách chấm điểm và lịch ôn](study.md).

## Tra cứu từng hàm MCP

Tool (hàm công cụ) là gì?

Tool là một thao tác có tên mà ứng dụng AI gọi bằng tham số JSON. Bạn có thể yêu cầu bằng ngôn ngữ tự nhiên; ứng dụng AI tự khám phá công cụ rồi gửi tools/call. Ví dụ dưới đây là phần tham số của tools/call, không phải địa chỉ HTTP hay lệnh terminal.

ID trong ví dụ là chỗ giữ chỗ. Lấy deckId/cardId từ kết quả đọc và revision từ kết quả mới nhất. Mỗi lần ghi thành công trả revision mới; dùng số đó cho lần ghi tiếp theo.

Phân trang mặc định offset 0, limit 30; limit nhận 1–100. Tiếp tục với nextOffset đến khi bằng null. Danh sách không chứa ảnh gốc; hasImage cho biết có ảnh hay không.

### get_profile

Đọc hồ sơ đang kết nối, revision, quyền ghi, tổng học phần/thẻ và các lớp. Không chọn hoặc liệt kê được hồ sơ khác.

**Tham số**

```
{}
```

**Ví dụ gọi**

```json
{
  "name": "get_profile",
  "arguments": {}
}
```

**Các trường trả về**

```
{ revision, profile, allowWrites, deckCount, cardCount, classes }
```

### list_decks

Tìm học phần theo tên hoặc mô tả. Trả thông tin học phần và cardCount, không chứa nội dung thẻ. query rỗng để liệt kê mọi học phần.

**Tham số**

```
{ query?: string = "", offset?: integer = 0, limit?: integer = 30 }
```

**Ví dụ gọi**

```json
{
  "name": "list_decks",
  "arguments": {
    "query": "English",
    "offset": 0,
    "limit": 30
  }
}
```

**Các trường trả về**

```
{ revision, items: [DeckMetadata], total, nextOffset }
```

### get_deck

Đọc thông tin một học phần và cardCount. Dùng tiếp list_cards để đọc các thẻ bên trong.

**Tham số**

```
{ deckId: string }
```

**Ví dụ gọi**

```json
{
  "name": "get_deck",
  "arguments": {
    "deckId": "deck-id"
  }
}
```

**Các trường trả về**

```
{ revision, deck: DeckMetadata }
```

### list_cards

Đọc thẻ trong học phần, gồm mọi nghĩa, từ loại, phát âm, ghi chú và tiến độ. Không trả dữ liệu ảnh gốc.

**Tham số**

```
{ deckId: string, offset?: integer = 0, limit?: integer = 30 }
```

**Ví dụ gọi**

```json
{
  "name": "list_cards",
  "arguments": {
    "deckId": "deck-id",
    "offset": 0,
    "limit": 30
  }
}
```

**Các trường trả về**

```
{ revision, items: [Card], total, nextOffset }
```

### search_cards

Tìm trong thuật ngữ, mọi nghĩa, phát âm và ghi chú. deckId tùy chọn; bỏ qua để tìm toàn bộ hồ sơ đang kết nối. Mỗi kết quả có deckId, deckTitle và card.

**Tham số**

```
{ query: string (1–200), deckId?: string, offset?: integer = 0, limit?: integer = 30 }
```

**Ví dụ gọi**

```json
{
  "name": "search_cards",
  "arguments": {
    "query": "bank",
    "deckId": "deck-id",
    "limit": 30
  }
}
```

**Các trường trả về**

```
{ revision, items: [{ deckId, deckTitle, card }], total, nextOffset }
```

### get_card

Đọc đầy đủ một thẻ. includeImage mặc định false; true trả thêm data URL ảnh gốc. Các trường tiến độ luôn được giữ.

**Tham số**

```
{ deckId: string, cardId: string, includeImage?: boolean = false }
```

**Ví dụ gọi**

```json
{
  "name": "get_card",
  "arguments": {
    "deckId": "deck-id",
    "cardId": "card-id",
    "includeImage": true
  }
}
```

**Các trường trả về**

```
{ revision, card: Card }
```

### create_deck

Tạo học phần rỗng, thêm thẻ bằng add_cards. title bắt buộc (1–120 ký tự), description mặc định rỗng (tối đa 500), color mặc định purple.

**Tham số**

```
{ revision: integer >= 0, title: string, description?: string = "", color?: string = "purple" }
```

**Ví dụ gọi**

```json
{
  "name": "create_deck",
  "arguments": {
    "revision": 7,
    "title": "Travel",
    "description": "Travel vocabulary",
    "color": "blue"
  }
}
```

**Các trường trả về**

```
{ revision, deck: DeckMetadata }
```

### update_deck

Sửa title, description hoặc color; changes phải có ít nhất một trường. Giữ nguyên thẻ, tiến độ và liên kết lớp học.

**Tham số**

```
{ revision: integer >= 0, deckId: string, changes: { title?: string, description?: string, color?: string } }
```

**Ví dụ gọi**

```json
{
  "name": "update_deck",
  "arguments": {
    "revision": 8,
    "deckId": "deck-id",
    "changes": {
      "title": "Travel essentials"
    }
  }
}
```

**Các trường trả về**

```
{ revision, deck: DeckMetadata }
```

### delete_deck

Xóa vĩnh viễn học phần, mọi thẻ bên trong và liên kết trong lớp; giữ phiên học lịch sử. Cần confirmed: true sau khi người dùng đồng ý.

**Tham số**

```
{ revision: integer >= 0, deckId: string, confirmed: true }
```

**Ví dụ gọi**

```json
{
  "name": "delete_deck",
  "arguments": {
    "revision": 9,
    "deckId": "deck-id",
    "confirmed": true
  }
}
```

**Các trường trả về**

```
{ revision, deletedDeckId, deletedCardCount }
```

### add_cards

Thêm 1–100 thẻ trong một giao dịch. Mỗi thẻ cần front và back. Thuật ngữ trùng sau chuẩn hóa làm cả lô bị từ chối. Thành công trả addedCardIds; tiến độ cũ giữ nguyên.

**Tham số**

```
{ revision: integer >= 0, deckId: string, cards: CardContent[1–100] }
```

**Ví dụ gọi**

```json
{
  "name": "add_cards",
  "arguments": {
    "revision": 8,
    "deckId": "deck-id",
    "cards": [
      {
        "front": "book",
        "back": "sách",
        "partOfSpeech": "Noun",
        "definitions": [
          {
            "meaning": "đặt chỗ",
            "partOfSpeech": "Verb"
          }
        ],
        "pronunciation": "/bʊk/",
        "speechLanguage": "en-GB",
        "notes": "Book a room."
      }
    ]
  }
}
```

**Các trường trả về**

```
{ revision, addedCardIds: string[] }
```

### update_card

Sửa nội dung thẻ; trường không gửi giữ nguyên. null xóa definitions, từ loại, phát âm, ngôn ngữ đọc, ghi chú hoặc ảnh tùy chọn. Không ghi đè được ID, cấp, lịch ôn và tiến độ.

**Tham số**

```
{ revision: integer >= 0, deckId: string, cardId: string, changes: Partial<CardContent> }
```

**Ví dụ gọi**

```json
{
  "name": "update_card",
  "arguments": {
    "revision": 9,
    "deckId": "deck-id",
    "cardId": "card-id",
    "changes": {
      "pronunciation": "/bʊk/",
      "notes": null
    }
  }
}
```

**Các trường trả về**

```
{ revision, card: Card }
```

### delete_cards

Xóa vĩnh viễn 1–100 thẻ chỉ định trong một học phần. ID thiếu hoặc lặp khiến toàn bộ thao tác bị từ chối. Cần confirmed: true; thẻ khác giữ nguyên nội dung và tiến độ.

**Tham số**

```
{ revision: integer >= 0, deckId: string, cardIds: string[1–100], confirmed: true }
```

**Ví dụ gọi**

```json
{
  "name": "delete_cards",
  "arguments": {
    "revision": 10,
    "deckId": "deck-id",
    "cardIds": ["card-id"],
    "confirmed": true
  }
}
```

**Các trường trả về**

```
{ revision, deletedCardIds: string[] }
```

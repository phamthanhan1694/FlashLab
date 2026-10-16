import { partOptions, formatPartOfSpeech } from './parts-of-speech';
export type Language = 'vi' | 'en';
let language: Language = 'vi';
const phrases: Record<string, string> = {
  'Nhập text, CSV, Excel và thêm từng thẻ thủ công đều dùng chung bảng so sánh thẻ trùng. Chọn Sửa trước khi nhập để sửa thuật ngữ, thêm hoặc xóa nghĩa, chọn từ loại riêng cho từng nghĩa, sửa cách đọc, ngôn ngữ đọc, ghi chú và ảnh. Sau đó chọn Tạo thẻ riêng, Ghi đè thẻ trùng hoặc Bổ sung vào thẻ trùng. Tạo thẻ riêng cần thuật ngữ không trùng. Ghi đè thay nội dung và đặt lại tiến độ. Bổ sung giữ nội dung và tiến độ cũ, chỉ thêm cặp nghĩa–từ loại chưa có và điền trường còn trống. Có thể sửa nhiều thẻ và chuyển trang mà không mất bản nháp; chỉ lưu sau khi bấm Xác nhận nhập.':
    'Text, CSV, Excel and manually added cards all use the same duplicate comparison dialog. Choose Edit before importing to edit the term, add or remove meanings, choose a word class for each meaning, and edit pronunciation, speech language, notes and image. Then choose Create a separate card, Overwrite duplicate or Merge into duplicate. A separate card needs a unique term. Overwrite replaces content and resets progress. Merge preserves existing content and progress, adds only new meaning and word-class pairs and fills empty fields. You can edit multiple cards and change pages without losing drafts; changes are saved only after Confirm import.',

  'Sửa nội dung rồi chọn tạo thẻ riêng, ghi đè hoặc bổ sung.':
    'Edit the content, then create a separate card, overwrite or merge.',
  'Lưu bản sửa': 'Save edited content',
  'Tạo thẻ riêng': 'Create a separate card',
  'Ghi đè thẻ trùng': 'Overwrite duplicate',
  'Bổ sung vào thẻ trùng': 'Merge into duplicate',
  'Thẻ riêng cần thuật ngữ mới. Ghi đè đặt lại tiến độ; bổ sung giữ nội dung đã có.':
    'A separate card needs a new term. Overwriting resets progress; merging preserves existing content.',
  'Mỗi định nghĩa phải có nghĩa đi kèm.':
    'Every definition must include a meaning.',
  'Không tìm thấy thẻ trùng để áp dụng bản sửa.':
    'The duplicate card could not be found for this edit.',
  'Bổ sung vào thẻ trùng cần giữ nguyên thuật ngữ. Chọn Tạo thẻ riêng nếu muốn đổi tên.':
    'Keep the original term when merging. Choose Create a separate card to use a different term.',
  'Không đọc được ảnh. Hãy chọn lại.':
    'Could not read the image. Please select it again.',

  'Chọn cách xử lý cho từng thẻ trước khi lưu.':
    'Choose how to handle each card before saving.',
  'Các cách xử lý': 'Resolution options',
  'Giữ thẻ hiện có, bỏ qua bản đang nhập.':
    'Keep the saved card and skip the incoming copy.',
  'Thay nội dung thẻ hiện có và đặt lại tiến độ học.':
    'Replace the saved card content and reset its study progress.',
  'Chỉ bổ sung nghĩa mới và trường còn trống; giữ tiến độ cũ.':
    'Add new meanings and fill empty fields; keep existing progress.',
  'Đổi thuật ngữ để lưu thành một thẻ riêng.':
    'Change the term to save it as a separate card.',
  'Nội dung sau khi sửa': 'Edited content',

  'Bật để dùng ô chọn nhiều hoặc nút + ở mọi câu điền. Cần trả lời đủ các nghĩa đã lưu; từ chỉ có một nghĩa chỉ cần một đáp án. Bỏ chọn để chấp nhận một nghĩa bất kỳ.':
    'Enable multiple-selection controls or the + button for every written question. Answer all saved meanings; a word with one meaning only needs one answer. Leave unchecked to accept any one meaning.',
  'Từ trùng được bỏ qua mặc định. Ghi đè thay nội dung và đặt lại tiến độ. Bổ sung thêm nghĩa–từ loại mới, điền trường còn trống và giữ tiến độ cùng nội dung đã có.':
    'Duplicates are skipped by default. Overwrite replaces content and resets progress. Merge adds new meaning and word-class pairs, fills empty fields and preserves existing progress and content.',
  'Bổ sung nghĩa': 'Merge meanings',
  'Đã bổ sung nghĩa vào thẻ.': 'Meanings merged into the card.',
  'Đã ghi đè thẻ.': 'Card overwritten.',
  'Bổ sung vượt quá 20 nghĩa của một thẻ. Chưa lưu thay đổi.':
    'Merging would exceed 20 meanings for a card. Changes have not been saved.',
  'Khi nhập nhiều thẻ, từ trùng được đưa ra để so sánh. Có thể bỏ qua, ghi đè, bổ sung nghĩa hoặc sửa thuật ngữ trước khi nhập. Bổ sung giữ nội dung và tiến độ cũ, chỉ thêm cặp nghĩa–từ loại chưa có và điền trường còn trống; không tạo thêm thẻ trùng. Tính năng này cũng có khi thêm thẻ trực tiếp.':
    'When importing multiple cards, duplicates are shown for comparison. Skip, overwrite, merge meanings or edit the term before importing. Merge preserves existing content and progress, adds only new meaning and word-class pairs and fills empty fields; it does not create duplicate cards. This also works when adding a card manually.',
  'Khi bắt đầu Kiểm tra, có thể bật chọn nhiều đáp án và điền nhiều nghĩa. Câu nhiều lựa chọn cần chọn đủ các nghĩa đúng và không chọn nghĩa sai. Câu điền nhiều có nút + thêm ô, mỗi ô một nghĩa khác nhau. Bật tùy chọn thì giao diện giữ đúng chế độ đã chọn, kể cả bài một câu hoặc từ chỉ có một nghĩa. Từ chỉ có một nghĩa vẫn chỉ cần một đáp án. Bỏ các tùy chọn này để chỉ cần trả lời một nghĩa. Kết quả câu điền hiển thị mọi nghĩa hợp lệ.':
    'Before a Test, enable multiple-choice answers or multiple written meanings. Multiple-answer questions require every correct meaning and no incorrect choices. Multiple written answers have a + button for adding fields, with a different meaning in each field. Enabling these options keeps the selected interface, even for a single-question test or a word with one meaning. A word with one meaning still only needs one answer. Leave these options off to accept any one meaning. Written results show every valid meaning.',

  'Kích thước ô': 'Tile size',
  'Hiển thị': 'Display',
  'Kích thước ô học phần / lớp học': 'Study set / class tile size',
  Bé: 'Small',
  'Trung bình': 'Medium',
  Lớn: 'Large',
  'Áp dụng ngay và lưu riêng cho người dùng hiện tại.':
    'Applied immediately and saved for the current user.',
  'Nhấc ô lên': 'Lift tile',
  'Nghe thử Nhấc ô lên': 'Preview lift tile',
  'Dừng nghe thử Nhấc ô lên': 'Stop preview lift tile',
  'Bật Nhấc ô lên': 'Unmute lift tile',
  'Tắt Nhấc ô lên': 'Mute lift tile',
  'Âm lượng Nhấc ô lên': 'Volume lift tile',
  'Đặt ô xuống': 'Drop tile',
  'Nghe thử Đặt ô xuống': 'Preview drop tile',
  'Dừng nghe thử Đặt ô xuống': 'Stop preview drop tile',
  'Bật Đặt ô xuống': 'Unmute drop tile',
  'Tắt Đặt ô xuống': 'Mute drop tile',
  'Âm lượng Đặt ô xuống': 'Volume drop tile',

  'Trang trước': 'Previous page',
  'Trang sau': 'Next page',
  'Giữ chuột để kéo sắp xếp; thả vào số trang để chuyển sang trang khác.':
    'Drag to reorder; drop on a page number to move to another page.',
  'Alt+1 / Alt+2 chuyển câu khi đang gõ; ngoài ô nhập có thể dùng 1 / 2 hoặc ← / →. Enter kiểm tra đáp án.':
    'Use Alt+1 / Alt+2 while typing; outside the answer field use 1 / 2 or ← / →. Enter checks your answer.',

  'Trắc nghiệm và tự luận': 'Multiple choice and written answers',
  'Chỉ trắc nghiệm': 'Multiple choice only',
  'Cho phép câu chọn nhiều đáp án': 'Allow multiple-answer questions',
  'Điền nhiều nghĩa bằng các ô riêng':
    'Write multiple meanings in separate fields',
  'Áp dụng với từ có nhiều nghĩa. Cần trả lời đủ các nghĩa đúng; bỏ chọn để chỉ cần một nghĩa.':
    'Applies to words with multiple meanings. Answer all meanings correctly; leave unchecked to accept a single meaning.',
  'CÂU NHIỀU LỰA CHỌN': 'SELECT MULTIPLE ANSWERS',
  'ĐIỀN NHIỀU ĐÁP ÁN': 'WRITE MULTIPLE ANSWERS',
  'Thêm ô đáp án': 'Add answer field',
  'Xóa ô đáp án': 'Remove answer field',
  'Mỗi ô một nghĩa, điền đủ các nghĩa khác nhau.':
    'Enter one meaning per field and include every distinct meaning.',
  'Khi bắt đầu Kiểm tra, có thể bật chọn nhiều đáp án và điền nhiều nghĩa. Câu nhiều lựa chọn cần chọn đủ các nghĩa đúng và không chọn nghĩa sai. Câu điền nhiều có nút + thêm ô, mỗi ô một nghĩa khác nhau. Bỏ các tùy chọn này để chỉ cần trả lời một nghĩa. Kết quả câu điền hiển thị mọi nghĩa hợp lệ.':
    'Before a Test, enable multiple-choice answers or multiple written meanings. Multiple-answer questions require all correct meanings and no incorrect choices. Multiple written answers have a + button for adding fields, with a different meaning in each field. Leave these options off to accept one meaning. Written-answer results show every valid meaning.',

  'Giọng đọc': 'Speech',
  'Tốc độ đọc': 'Speech rate',
  'Nghe thử tốc độ': 'Preview speech rate',
  'Mặc định 0.75×. Kéo sang trái để đọc chậm hơn; 1× là tốc độ bình thường. Lưu riêng cho người dùng hiện tại.':
    'Default: 0.75×. Move left for slower speech; 1× is normal speed. Saved for the current user.',

  'Điểm tiến độ': 'Progress points',
  'Tiến độ tại cấp hiện tại / yêu cầu tối thiểu. Câu sai trừ điểm và lượt của dạng bài vừa làm. Cần đủ điểm và từng dạng bắt buộc.':
    'Current-level progress / minimum requirement. Incorrect answers subtract points and credits in the current mode. Meet the points target and every required mode.',
  'Để lên cấp 1–6, cần lần lượt 3, 5, 8, 12, 18, 25 điểm tiến độ tại mỗi cấp. Trả lời đúng cộng 1 điểm. Trả lời sai trừ 1 điểm và trừ 1 lượt ở dạng bài vừa làm, tối thiểu 0; sai trong Kiểm tra cũng trừ 1 lượt Kiểm tra. Khi tiến độ đã bằng 0 mà tiếp tục sai, thẻ giảm 1 cấp, tối thiểu cấp 0. Tiến độ bắt đầu lại sau mỗi lần đổi cấp; khi còn 0 điểm, các lượt theo dạng bài cũng được xóa. Câu sai được hẹn ôn lại theo thời gian thử lại trong Cài đặt. Từ cấp 3 được tính là thành thạo.':
    'Levels 1\u20136 require 3, 5, 8, 12, 18 and 25 progress points respectively. A correct answer adds 1 point. An incorrect answer subtracts 1 point and 1 credit in the current mode, with a minimum of 0; an incorrect Test answer also subtracts 1 Test credit. An incorrect answer when progress is already 0 lowers the card by 1 level, down to level 0. Progress resets after each level change; when progress reaches 0, mode credits are cleared too. Incorrect answers are scheduled using the retry time in Settings. Level 3 and above counts as mastered.',
  'Nhập text, CSV, Excel theo 5 trường':
    'Import text, CSV and Excel with 5 fields',
  'Thứ tự: thuật ngữ, định nghĩa, cách đọc, ghi chú, ảnh minh họa. Chỉ thuật ngữ và định nghĩa bắt buộc. Giữ dấu phẩy cho trường để trống. Trong định nghĩa, mỗi cặp viết từ loại::nghĩa; dùng | để thêm nghĩa ngay trong cùng trường.':
    'Order: term, definition, pronunciation, notes, image. Only term and definition are required. Keep commas for empty fields. In definition, write partOfSpeech::meaning and separate pairs with | within the same field.',
  'CSV và Excel dùng 5 tiêu đề: front, definition, pronunciation, notes, image. Trong ô definition có thể dùng mảng JSON gồm các cặp meaning và partOfSpeech để giữ nghĩa chứa | hoặc ::. Ảnh là dữ liệu data:image/png;base64,... (hoặc jpeg, webp, gif), không phải đường dẫn file trên máy; có thể để trống và thêm ảnh trong biểu mẫu.':
    'CSV and Excel use 5 headers: front, definition, pronunciation, notes, image. The definition cell also accepts a JSON array of meaning and partOfSpeech pairs to preserve meanings containing | or ::. Images use data:image/png;base64,... (or jpeg, webp, gif), rather than local file paths. Leave this field empty to add an image in the editor.',
  'Cách đọc thường là phiên âm dạng chữ. Để giữ cả ngôn ngữ đọc, dùng JSON trong ô pronunciation, ví dụ {"text":"/bʊk/","language":"en-GB"}. File xuất tự lưu thông tin này.':
    'Pronunciation normally contains phonetic text. To preserve the speech language too, use JSON in the pronunciation cell, for example {"text":"/bʊk/","language":"en-GB"}. Exports save this information automatically.',
  'Trong học phần, chọn Xuất thẻ → CSV, Text hoặc Excel. Cả ba định dạng xuất cùng 5 trường; toàn bộ nghĩa–từ loại nằm chung trong definition; giữ hàng tiêu đề khi sửa rồi nhập lại. Ngôn ngữ đọc ví dụ en-US, vi-VN, zh-CN, ja-JP hoặc ko-KR.':
    'In a study set, choose Export cards → CSV, Text or Excel. All three export the same 5 fields, with all meaning and word-class pairs in definition. Keep the header row when editing and importing again. Speech language examples: en-US, vi-VN, zh-CN, ja-JP or ko-KR.',
  'Tệp thẻ dùng để trao đổi nội dung. Muốn giữ cả tiến độ và dấu đã nhớ, hãy xuất bản sao lưu ZIP trong Cài đặt.':
    'Card files exchange content. To preserve progress and remembered marks too, export a ZIP backup in Settings.',
  'Mỗi dòng gồm 5 trường: thuật ngữ, định nghĩa, cách đọc, ghi chú, ảnh minh họa. Chỉ hai trường đầu bắt buộc. Trong định nghĩa, dùng từ loại::nghĩa và dấu | để thêm nghĩa.':
    'Each row has 5 fields: term, definition, pronunciation, notes, image. Only the first two are required. In definition, use partOfSpeech::meaning and | to add meanings.',

  'Thuật ngữ': 'Term',
  'Định nghĩa': 'Definition',
  'Tra cứu từ loại tiếng Anh ↗': 'Look up English parts of speech ↗',
  'Mở hướng dẫn trong tab mới': 'Open guide in a new tab',
  'Xuất thẻ': 'Export cards',
  'Đã xuất Excel học phần.': 'Study set exported to Excel.',
  'Đã xuất text học phần.': 'Study set exported to text.',
  'Mỗi cặp từ loại phải có nghĩa đi kèm.':
    'Every word-class pair must include a meaning.',
  'Định nghĩa khác phải là danh sách nghĩa.':
    'Additional definitions must be a list of meanings.',
  'Mỗi thẻ có tối đa 20 nghĩa.': 'Each card supports up to 20 meanings.',
  'Một thẻ có một thuật ngữ và nhiều cặp nghĩa–từ loại. Mỗi nghĩa giữ từ loại riêng; chỉ thuật ngữ và nghĩa đầu tiên bắt buộc.':
    'A card has one term and multiple meaning–word class pairs. Each meaning retains its own word class; only the term and first meaning are required.',
  'Nhập nhanh text: 6 trường, có thể thêm ngôn ngữ đọc':
    'Quick text import: 6 fields, with an optional speech language',
  'Thứ tự khi không có tiêu đề cột: thuật ngữ, nghĩa đầu tiên, từ loại đầu tiên, phiên âm, ghi chú, các nghĩa khác, ngôn ngữ đọc. Sáu trường đầu theo mẫu dưới đây; trường thứ 7 là tùy chọn. Giữ dấu phẩy cho trường để trống.':
    'Without headers, the order is term, first meaning, first word class, pronunciation, notes, other meanings, speech language. Follow the six-field example below; field 7 is optional. Keep commas for empty fields.',
  'Trong trường các nghĩa khác, viết từ loại::nghĩa và dùng | giữa các cặp. Ví dụ v.::đặt chỗ|n.::sổ sách. Với nghĩa chứa | hoặc ::, dùng các cột nghĩa riêng hoặc mảng JSON.':
    'For other meanings, write word class::meaning and separate pairs with |. For example v.::reserve|n.::records. If a meaning contains | or ::, use separate meaning columns or a JSON array.',
  'CSV, TXT và Excel có tiêu đề cột': 'CSV, TXT and Excel with headers',
  'Khuyến nghị dùng tiêu đề cột để tránh nhầm thứ tự. Mỗi dòng là một thẻ; back đi với partOfSpeech, back2 đi với partOfSpeech2, tiếp tục đến back20 và partOfSpeech20. Không lặp lại thuật ngữ thành nhiều dòng để ghi các nghĩa khác nhau.':
    'Use headers to avoid confusing column order. Each row is one card: back pairs with partOfSpeech, back2 with partOfSpeech2, through back20 and partOfSpeech20. Keep a term’s meanings on the same row.',
  'Trong Excel, hàng đầu là tiêu đề cột; các hàng sau là thẻ. Mỗi ô chứa một giá trị, không cần tự bọc dấu nháy kép. FlashLab đọc trang tính đầu tiên của file .xlsx. File .xls cần lưu lại thành .xlsx.':
    'In Excel, the first row contains headers and later rows contain cards. Enter one value per cell without adding quotes. FlashLab reads the first worksheet of .xlsx files. Save .xls files as .xlsx first.',
  'CSV và TXT dùng dấu phẩy, lưu UTF-8. Nội dung có dấu phẩy, dấu nháy kép hoặc xuống dòng phải bọc trong dấu nháy kép; một dấu nháy kép bên trong viết thành hai dấu nháy kép. TSV dùng Tab và phần mở rộng .tsv.':
    'CSV and TXT use commas and UTF-8. Wrap values containing commas, quotes or newlines in double quotes; double any quote inside the value. TSV uses tabs and the .tsv extension.',
  'Xuất và nhập lại': 'Exporting and reimporting',
  'Trong học phần, chọn Xuất thẻ → CSV, Text hoặc Excel. Cả ba định dạng xuất cùng các cột nghĩa–từ loại riêng và ngôn ngữ đọc; giữ hàng tiêu đề khi sửa rồi nhập lại. Ngôn ngữ đọc ví dụ en-US, vi-VN, zh-CN, ja-JP hoặc ko-KR.':
    'In a study set, choose Export cards → CSV, Text or Excel. All three formats export separate meaning–word class columns and the speech language. Keep the header row when editing and reimporting. Example speech languages: en-US, vi-VN, zh-CN, ja-JP and ko-KR.',
  'Tệp thẻ dùng để trao đổi nội dung. Muốn giữ cả ảnh, tiến độ và dấu đã nhớ, hãy xuất bản sao lưu ZIP trong Cài đặt.':
    'Card files exchange vocabulary content. To keep images, progress and remembered marks, export a ZIP backup in Settings.',
  'Tương thích file cũ và từ trùng': 'Older files and duplicates',
  'File cũ có 2–6 trường hoặc cột definitions vẫn nhập được. JSON trong definitions giữ từng cặp meaning và partOfSpeech; nghĩa dạng chữ không có từ loại riêng sẽ dùng từ loại của nghĩa đầu tiên.':
    'Older files with 2–6 fields or a definitions column are still supported. JSON in definitions preserves meaning and partOfSpeech pairs. Plain-text additional meanings inherit the first meaning’s word class.',

  'Từ loại và viết tắt tiếng Anh': 'Parts of speech and English abbreviations',
  'FlashLab dùng thống nhất các viết tắt dưới đây cho từng nghĩa của từ.':
    'FlashLab uses the following abbreviations consistently for each word meaning.',
  'Dựa trên dấu đã nhớ của thẻ ghi nhớ.':
    'Based on the remembered mark on flashcards.',
  'Chọn từ để học': 'Choose words to study',
  'Tất cả từ': 'All words',
  'Từ đã nhớ': 'Remembered words',
  'Từ chưa nhớ': 'Unremembered words',
  'Không có từ phù hợp với lựa chọn này.': 'No words match this selection.',
  'Nhập thư mục': 'Import folder',
  'Chi tiết thành thạo': 'Mastery details',
  'Tìm học phần hoặc từ vựng...': 'Search sets or vocabulary...',
  'Kết quả tìm từ vựng': 'Vocabulary search results',
  'thẻ phù hợp': 'matching cards',
  'Không tìm thấy từ vựng.': 'No matching vocabulary.',
  'Quay về ôn tập': 'Back to reviews',
  'So sánh từ trùng': 'Compare duplicates',
  'Từ trùng được bỏ qua mặc định. Ghi đè thay nội dung và đặt lại tiến độ của thẻ.':
    'Duplicates are skipped by default. Overwriting replaces the content and resets the card’s progress.',
  'thẻ nhập bị trùng': 'imported cards are duplicates',
  'Đã có': 'Existing',
  'Đang nhập': 'Incoming',
  'Cách xử lý': 'Action',
  'Bỏ qua': 'Skip',
  'Sửa trước khi nhập': 'Edit before importing',
  'Xác nhận nhập': 'Confirm import',
  'Thuật ngữ và nghĩa không được để trống.':
    'Term and meaning cannot be empty.',
  'Thuật ngữ sau khi sửa vẫn bị trùng. Hãy sửa lại hoặc chọn bỏ qua.':
    'The edited term is still a duplicate. Edit it again or choose Skip.',
  'CSV xuất mỗi thẻ trên một dòng. Nghĩa chính nằm cạnh từ loại; cột definitions chứa các cặp meaning và partOfSpeech cho những nghĩa khác. Nhập lại CSV sẽ giữ các cặp này.':
    'CSV exports one card per row. The primary meaning is next to its part of speech; definitions stores meaning and partOfSpeech pairs for other meanings. Reimporting preserves these pairs.',
  'Khi nhập nhiều thẻ, từ trùng được đưa ra để so sánh. Có thể bỏ qua, ghi đè hoặc sửa thuật ngữ và nghĩa trước khi nhập.':
    'Bulk imports show duplicates for comparison. Skip, overwrite, or edit the term and meaning before importing.',

  'Để nhập từ loại riêng cho từng nghĩa, trường thứ 6 có thể chứa mảng JSON với meaning và partOfSpeech. Dạng dấu | vẫn được hỗ trợ; có thể sửa từ loại từng nghĩa sau khi nhập.':
    'To import a separate part of speech for each meaning, field 6 accepts a JSON array with meaning and partOfSpeech. The | format is still supported; edit each meaning’s part of speech after importing.',

  'Mỗi nghĩa đi kèm một từ loại riêng. Khi học, chỉ cần trả lời đúng một nghĩa bất kỳ.':
    'Each meaning has its own part of speech. Any saved meaning is accepted as a correct answer.',
  Nghĩa: 'Meaning',
  'Không bắt buộc': 'Optional',
  'Tiến độ lên cấp': 'Progress toward level',
  'Tổng lượt đúng': 'Total correct answers',
  'Lượt đúng của thẻ tại cấp hiện tại / yêu cầu tối thiểu. Cần đủ tổng lượt đúng và từng dạng bắt buộc.':
    'Correct answers for this card at the current level / minimum required. Both the total and every required mode must be completed.',

  'Thẻ được hẹn ôn theo cấp ghi nhớ đã đạt.':
    'Reviews are scheduled according to the card’s earned memory level.',
  'Cấp độ và mức thành thạo': 'Levels and mastery',
  'Tùy chỉnh màu': 'Customize color',
  'Tìm người dùng': 'Find users',
  'Tìm theo tên hoặc ID…': 'Search by name or ID…',
  'Không tìm thấy người dùng phù hợp.': 'No matching users found.',
  'Tên người dùng': 'User name',
  'Đổi tên': 'Rename',
  'Đã đổi tên người dùng.': 'User renamed.',
  'Không đổi được tên người dùng.': 'Could not rename user.',
  'Đổi ảnh đại diện': 'Change avatar',
  'Chọn ảnh đại diện': 'Choose an avatar',

  'Để lên cấp 1–6, cần lần lượt 3, 5, 8, 12, 18, 25 lượt đúng tại mỗi cấp. Tiến độ bắt đầu lại sau mỗi lần lên cấp. Trả lời sai đưa thẻ về cấp 0. Từ cấp 3 được tính là thành thạo.':
    'Levels 1–6 require 3, 5, 8, 12, 18 and 25 correct answers at each level. Progress resets after promotion. A wrong answer resets the card to level 0. Level 3 and above count as mastered.',
  'Lên cấp 3 cần Trắc nghiệm, Viết và Kiểm tra. Lên cấp 4–6 cần đủ Thẻ ghi nhớ (hoặc Ôn tập), Trắc nghiệm, Viết, Ghép thẻ và Kiểm tra tại cấp hiện tại. Cấp 3–6 cần lần lượt ít nhất 1, 1, 2, 3 lượt đúng trong Kiểm tra. Chỉ lặp lại một dạng sẽ không đủ lên cấp cao.':
    'Level 3 requires Learn, Write and Test. Levels 4–6 require Flashcards (or Review), Learn, Write, Match and Test at the current level. Levels 3–6 require at least 1, 1, 2 and 3 correct Test answers respectively. Repeating just one mode cannot earn higher levels.',
  'Thành thạo: đạt cấp 3 qua nhiều lượt đúng, luyện nhiều dạng và kiểm tra.':
    'Mastered: reach level 3 through repeated correct answers, multiple modes and tests.',
  'Khoảng cách của 6 cấp phải tăng dần. Lên cấp cần đủ lượt đúng và các dạng luyện tập; trả lời sai về cấp 0.':
    'The six intervals must increase. Promotion requires enough correct answers and practice modes; wrong answers reset the card to level 0.',
  'được tính khi thẻ đạt cấp ≥ 3, sau nhiều lượt đúng qua Trắc nghiệm, Viết và Kiểm tra. Cấp cao cần đủ các dạng luyện tập. Trả lời sai sẽ về cấp 0.':
    'means level 3 or above, earned through repeated correct answers in Learn, Write and Test. Higher levels require all practice modes. Wrong answers reset the card to level 0.',
  'Đã đạt cấp tối đa': 'Maximum level reached',

  'Trong Thêm hoặc Sửa thẻ, dùng Thêm định nghĩa để lưu các nghĩa khác. Phần Viết chấp nhận một nghĩa bất kỳ; trắc nghiệm chỉ đưa một nghĩa đúng vào lựa chọn. Các nghĩa vẫn thuộc cùng một thẻ và cùng cấp ghi nhớ.':
    'In Add or Edit card, choose Add definition to save other meanings. Written answers accept any saved meaning; multiple-choice questions show only one correct meaning. All meanings belong to one card and share its memory level.',
  'Mỗi ô là một nghĩa riêng. Khi học, chỉ cần trả lời đúng một nghĩa bất kỳ.':
    'Each field holds a separate meaning. Any saved meaning is accepted as a correct answer.',
  'Xóa định nghĩa': 'Remove definition',
  'Thêm định nghĩa': 'Add definition',
  'Định nghĩa khác': 'Other definitions',
  'Nút dấu cộng tạo học phần, lớp học, thẻ, bài viết hoặc ghi chú mới. Rê chuột lên nút để xem tên chức năng.':
    'The plus button creates a set, class, card, post or note. Hover over it to see its action.',
  'Dùng thanh định dạng hoặc nhập Markdown. Chọn ngôn ngữ khi chèn khối mã: cpp hoặc c++ cho C++, markdown hoặc md cho Markdown; text là văn bản thuần. Có thể nhập hoặc tải file .md.':
    'Use the formatting toolbar or write Markdown. Choose the language when inserting code: cpp or c++ for C++, markdown or md for Markdown, and text for plain text. Import or download .md files.',
  'Trong Kiểm tra, nhập hoặc chọn đáp án rồi bấm Xác nhận. Sửa đáp án sẽ bỏ xác nhận. Chỉ nộp bài sau khi đã xác nhận các câu.':
    'In Test, enter or select an answer, then choose Confirm. Editing an answer clears its confirmation. Confirm all answers before submitting.',
  'state.json giữ học phần, tiến độ, cấu hình và ghi chú. CSV trong materials được sinh từ dữ liệu này; muốn áp dụng thay đổi CSV bên ngoài, cần nhập lại qua giao diện.':
    'state.json stores sets, progress, preferences and notes. CSV files in materials are generated from this data; import external CSV changes through the app to apply them.',
  'Vào Cài đặt → Xuất thư mục ZIP. Để khôi phục, giải nén ZIP, mở menu người dùng → Nhập thư mục người dùng rồi chọn thư mục vừa giải nén. Ghi chú cá nhân nằm trong bản sao lưu hồ sơ; bài viết dùng chung cần sao lưu riêng thư mục blog.':
    'Open Settings → Export user ZIP. To restore, extract the ZIP, open the user menu → Import user folder, and select the extracted folder. Personal notes are included in profile backups; shared posts require a separate backup of the blog folder.',
  'Bài viết và ghi chú': 'Posts and notes',
  'Học và ôn tập': 'Study and review',
  'Lưu trữ dữ liệu': 'Data storage',
  'Sao lưu và khôi phục': 'Backup and restore',
  'Xem hướng dẫn tại Tổng quan →': 'View help on Overview →',
  'Tra cứu khi cần': 'Reference when needed',
  'Hướng dẫn': 'Help',
  'Nhập từ vựng hàng loạt': 'Bulk import vocabulary',
  'Không tìm thấy ghi chú': 'Note not found',
  'Đang lưu ghi chú…': 'Saving note…',
  'Bắt đầu ghi chú…': 'Start writing your note…',
  'Đặt tên cho ghi chú…': 'Give your note a title…',
  'Phân trang ghi chú': 'Notes pagination',
  'Chọn file Markdown có đuôi .md hoặc .markdown.':
    'Choose a Markdown file ending in .md or .markdown.',
  'Chỉ nhập từ vựng từ file .txt, .csv, .tsv hoặc .xlsx.':
    'Import vocabulary only from .txt, .csv, .tsv or .xlsx files.',
  'PNG, JPEG, WebP hoặc GIF · tối đa 100 KB':
    'PNG, JPEG, WebP or GIF · up to 100 KB',
  'Đang tải nội dung…': 'Loading content…',
  'Có thể thêm cột speechLanguage nếu cần ngôn ngữ đọc, ví dụ en-US, vi-VN, zh-CN, ja-JP, ko-KR. File .xls cần lưu lại thành .xlsx.':
    'Add a speechLanguage column if you need a reading language, such as en-US, vi-VN, zh-CN, ja-JP or ko-KR. Save .xls files as .xlsx first.',
  'Tiêu đề cột là tùy chọn. Với CSV hoặc Excel, có thể dùng các tên dưới đây; khi có tiêu đề, có thể đổi thứ tự cột. File TSV dùng Tab và phần mở rộng .tsv.':
    'Column headers are optional. CSV and Excel support the names below; columns may be reordered when headers are present. TSV files use tabs and the .tsv extension.',
  'Tiêu đề cột và TSV': 'Column headers and TSV',
  'Dùng 6 cột A–F theo thứ tự trên, mỗi hàng là một thẻ. Đọc trang tính đầu tiên. Trong ô Excel không cần tự thêm dấu nháy kép. Lưu dạng .xlsx rồi chọn Nhập Excel / CSV.':
    'Use columns A–F in the order above, one card per row. Only the first worksheet is read. Excel cells do not need added double quotes. Save as .xlsx and choose Import Excel / CSV.',
  'Nội dung có dấu phẩy hoặc xuống dòng phải đặt trong dấu nháy kép. Bên trong trường, viết hai dấu nháy kép liên tiếp để biểu diễn một dấu nháy kép.':
    'Enclose fields containing commas or line breaks in double quotes. Use two consecutive double quotes for a literal double quote inside a field.',
  'Mỗi dòng là một thẻ. Dùng dấu phẩy để phân tách; giữ dấu phẩy cho trường trống. Lưu file bằng UTF-8 để giữ dấu tiếng Việt.':
    'Each line is a card. Separate fields with commas, keeping commas for empty fields. Save files as UTF-8 to preserve accents.',
  'Text (.txt) / CSV (.csv)': 'Text (.txt) / CSV (.csv)',
  'Thứ tự: thuật ngữ, định nghĩa, từ loại, phiên âm, ghi chú, định nghĩa khác. Hai trường đầu bắt buộc; bốn trường sau có thể để trống. Trong trường thứ 6, dùng dấu | để tách các nghĩa khác.':
    'Order: term, definition, part of speech, pronunciation, notes, other definitions. The first two fields are required; the last four may be blank. Separate other meanings in the sixth field with |.',
  'Hướng dẫn nhập text, Excel, CSV': 'Text, Excel and CSV import guide',
  'Mỗi dòng gồm tối đa 6 trường phân cách bằng dấu phẩy: thuật ngữ, định nghĩa, từ loại, phiên âm, ghi chú, định nghĩa khác. Chỉ hai trường đầu bắt buộc. Các nghĩa khác phân cách bằng dấu |.':
    'Each line has up to six comma-separated fields: term, definition, part of speech, pronunciation, notes, other definitions. Only the first two are required. Separate other meanings with |.',
  'Text, Excel và CSV dùng cùng thứ tự 5 trường.':
    'Text, Excel and CSV use the same five-field order.',
  'Hướng dẫn nhập từ vựng': 'Vocabulary import guide',
  'Hướng dẫn nhập': 'Import guide',
  'Nhập text': 'Import text',
  'Ảnh trong ghi chú tối đa 100 KB.':
    'Images in notes must be 100 KB or smaller.',
  'Xóa ghi chú cá nhân này?': 'Delete this personal note?',
  'Xóa ghi chú?': 'Delete note?',
  'Xóa ghi chú': 'Delete note',
  'Tối đa 500 ghi chú và 5.000.000 ký tự nội dung.':
    'Up to 500 notes and 5,000,000 content characters.',
  'Ghi chú cần tiêu đề và nội dung, tối đa 200.000 ký tự.':
    'Notes require a title and content, up to 200,000 characters.',
  'Ghi chú đã thay đổi. Hãy tải lại trước khi sửa.':
    'This note has changed. Reload it before editing.',
  'Không lưu được ghi chú.': 'Unable to save the note.',
  'Không tìm thấy ghi chú.': 'Note not found.',
  'Đang tải ghi chú…': 'Loading notes…',
  'Viết ghi chú mới hoặc thử từ khóa khác.':
    'Write a new note or try another search.',
  'Chưa có ghi chú phù hợp': 'No matching notes',
  '← Tất cả ghi chú': '← All notes',
  'Đọc ghi chú': 'Read note',
  'Tìm ghi chú': 'Find notes',
  'Lưu ghi chú': 'Save note',
  'Sửa ghi chú': 'Edit note',
  'Viết ghi chú': 'Write note',
  'Ghi chú lưu riêng theo người dùng, đi kèm bản sao lưu hồ sơ.':
    'Notes are saved separately for each user and included in profile backups.',
  'Ghi chú cá nhân': 'Personal notes',
  'CÁ NHÂN': 'PERSONAL',
  'GHI CHÚ': 'NOTES',
  'Không tải được bài viết.': 'Unable to load posts.',
  'Đang tải bài viết…': 'Loading posts…',
  'Bài viết học tập': 'Learning blog',
  'BÀI VIẾT': 'BLOG',
  'Bài viết': 'Blog',
  'Cấp cập nhật khi kết thúc phiên': 'Level updates when the session ends',
  'Cấp ghi nhớ đã lưu: đúng tăng 1 cấp (tối đa 6), sai về cấp 0. Từ cấp 3 được tính là thành thạo.':
    'Saved memory level: correct answers advance 1 level (up to 6); incorrect answers reset to 0. Level 3 or higher counts as mastered.',
  'Cần học lại': 'Needs relearning',
  'Đang học': 'Learning',
  'Thành thạo': 'Mastered',
  'SAO LƯU TRƯỚC KHI XÓA': 'BACK UP BEFORE DELETING',
  'Bạn có muốn tải bản sao lưu ZIP trước khi xóa không?':
    'Would you like to download a ZIP backup before deleting?',
  'Sao lưu ZIP rồi xóa': 'Back up ZIP, then delete',
  'Xóa không sao lưu': 'Delete without backup',
  'Bản ZIP đã được gửi tới trình duyệt. Hãy kiểm tra file đã lưu xong trước khi tiếp tục xóa người dùng.':
    'The ZIP download has been sent to your browser. Check that the file is saved before deleting the user.',
  'Bạn đã lưu bản sao lưu?': 'Have you saved the backup?',
  'Đã lưu, xóa người dùng': 'Saved, delete user',
  'Giữ người dùng': 'Keep user',
  'Bản sao lưu ZIP không hợp lệ. Người dùng chưa bị xóa.':
    'The ZIP backup is invalid. The user has not been deleted.',
  'Chỉ chủ bài viết được sửa hoặc xóa bài.':
    'Only the owner can edit or delete this post.',
  'Xóa bài': 'Delete post',
  'Xóa bài viết?': 'Delete post?',
  'Xóa bài viết này? Nội dung sẽ bị xóa khỏi blog dùng chung.':
    'Delete this post? Its content will be removed from the shared blog.',
  'Không xóa được bài viết.': 'Unable to delete the post.',
  'Bài cũ chưa xác định được chủ sở hữu nên đang ở chế độ chỉ đọc.':
    'This older post has no verified owner and is read-only.',
  'Chèn sơ đồ Mermaid': 'Insert Mermaid diagram',
  'Chèn sơ đồ PlantUML': 'Insert PlantUML diagram',
  'Đang vẽ sơ đồ…': 'Rendering diagram…',
  'Mã sơ đồ': 'Diagram source',
  'Sơ đồ': 'Diagram',
  'Không vẽ được sơ đồ. Kiểm tra cú pháp bên dưới.':
    'Unable to render this diagram. Check the source below.',
  'Xóa phiên học': 'Delete session',
  'Xóa phiên học?': 'Delete session?',
  'Xóa bản ghi phiên học này? Tiến độ thẻ, lịch ôn và thống kê học tập vẫn được giữ lại.':
    'Delete this session record? Card progress, review dates and study statistics will be kept.',
  'Đã xóa phiên học.': 'Session deleted.',

  'Blog học tập': 'Learning blog',
  'Bài viết dùng chung cho mọi người trên máy chủ này.':
    'Posts are shared with everyone on this server.',
  'Viết bài': 'Write a post',
  'Chưa có bài viết phù hợp': 'No matching posts',
  'Viết bài mới hoặc thử từ khóa khác.':
    'Write a new post or try a different search.',
  'Đọc bài viết': 'Read post',
  'Tìm bài viết': 'Search posts',
  'Tìm theo tiêu đề, tác giả hoặc nội dung…':
    'Search by title, author or content…',
  'Phân trang bài viết': 'Post pagination',
  '← Tất cả bài viết': '← All posts',
  'Tất cả bài viết': 'All posts',
  'Sửa bài': 'Edit post',
  'Tải .md': 'Download .md',
  '← Quay lại': '← Back',
  'Sửa bài viết': 'Edit post',
  'Viết bài mới': 'Write a new post',
  'Viết Markdown trực tiếp hoặc dùng thanh công cụ để chèn định dạng.':
    'Write Markdown directly or use the toolbar to insert formatting.',
  'Tiêu đề': 'Title',
  'Người viết': 'Author',
  'Đặt tên cho bài viết…': 'Give your post a title…',
  'Công cụ định dạng': 'Formatting tools',
  'Nhập file .md': 'Import .md',
  'Chế độ soạn thảo': 'Editor view',
  'Soạn thảo': 'Write',
  'Chia đôi': 'Split view',
  'Xem trước': 'Preview',
  'Định dạng Markdown': 'Markdown formatting',
  'Nội dung Markdown': 'Markdown content',
  'Bắt đầu viết bài…': 'Start writing…',
  'Bản xem trước': 'Live preview',
  'Mẹo: chọn văn bản rồi bấm công cụ. Ctrl/Cmd+B để in đậm, Ctrl/Cmd+I để in nghiêng. Hỗ trợ bảng, danh sách, checklist, liên kết, ảnh và khối mã.':
    'Tip: select text, then choose a tool. Ctrl/Cmd+B for bold, Ctrl/Cmd+I for italic. Supports tables, lists, task lists, links, images and code blocks.',
  'Lưu thay đổi': 'Save changes',
  'Đăng bài': 'Publish post',
  'Hoàn tác': 'Undo',
  'Làm lại': 'Redo',
  'In đậm': 'Bold',
  'In nghiêng': 'Italic',
  'Gạch ngang': 'Strikethrough',
  'Tiêu đề cấp 1': 'Heading 1',
  'Tiêu đề cấp 2': 'Heading 2',
  'Tiêu đề cấp 3': 'Heading 3',
  'Danh sách dấu chấm': 'Bulleted list',
  'Danh sách đánh số': 'Numbered list',
  'Danh sách công việc': 'Task list',
  'Trích dẫn': 'Quote',
  'Mã nội dòng': 'Inline code',
  'Hoặc chọn ảnh từ máy': 'Or choose an image from your device',
  'PNG, JPEG, WebP hoặc GIF · tối đa 2 MB':
    'PNG, JPEG, WebP or GIF · up to 2 MB',
  'Chọn ảnh PNG, JPEG, WebP hoặc GIF tối đa 2 MB.':
    'Choose a PNG, JPEG, WebP or GIF image up to 2 MB.',
  'Đang tải ảnh…': 'Uploading image…',
  'Không đọc được ảnh.': 'Could not read the image.',
  'Không tải được ảnh.': 'Could not upload the image.',
  'Ảnh đã sẵn sàng. Bấm Chèn để thêm vào bài.':
    'Image ready. Click Insert to add it to the post.',
  'Khối mã': 'Code block',
  'Sao chép': 'Copy',
  'Đã sao chép': 'Copied',
  'Không sao chép được': 'Copy failed',
  'Ngôn ngữ khối mã': 'Code language',
  'Tự nhận diện': 'Auto detect',
  'Văn bản thuần': 'Plain text',
  'Chèn liên kết': 'Insert link',
  'Chèn ảnh': 'Insert image',
  'Chèn bảng': 'Insert table',
  'Đường phân cách': 'Horizontal rule',
  'Bảng nội dung': 'Content table',
  'Nội dung': 'Content',
  Cột: 'Column',
  'Mã nguồn': 'Code',
  'Số dòng nội dung': 'Body rows',
  'Số cột': 'Columns',
  'Mô tả ảnh': 'Image description',
  'Văn bản liên kết': 'Link text',
  'Địa chỉ ảnh': 'Image URL',
  'Địa chỉ liên kết': 'Link URL',
  Chèn: 'Insert',
  'Chọn 1–20 dòng và 2–10 cột.': 'Choose 1–20 rows and 2–10 columns.',
  'Nhập địa chỉ bắt đầu bằng https:// hoặc http://.':
    'Enter a URL starting with https:// or http://.',
  'File lớn hơn 200 KB.': 'File exceeds 200 KB.',
  'Không đọc được file Markdown.': 'Unable to read the Markdown file.',
  'Nội dung vượt quá 200.000 ký tự.': 'Content exceeds 200,000 characters.',
  'Điền tiêu đề, người viết và nội dung.':
    'Enter the title, author and content.',
  'Đang lưu bài viết…': 'Saving post…',
  'Không lưu được bài viết.': 'Unable to save the post.',
  'Đang tải blog…': 'Loading blog…',
  'Không tải được blog.': 'Unable to load the blog.',
  'Không tìm thấy bài viết': 'Post not found',
  'Thử lại': 'Try again',
  'Bài kiểm tra chưa nộp. Nếu rời đi, các đáp án đang làm sẽ không được giữ lại. Bạn có muốn thoát?':
    'Your test has not been submitted. Leaving will discard your current answers. Do you want to leave?',
  'Phiên học chưa hoàn thành. Nếu rời đi, bạn sẽ kết thúc phiên học hiện tại. Bạn có muốn thoát?':
    'Your study session is not finished. Leaving will end the current session. Do you want to leave?',
  'Thoát bài kiểm tra?': 'Leave the test?',
  'Thoát phiên học?': 'Leave the study session?',
  'Thoát phiên': 'Leave session',

  'Hôm nay': 'Today',
  thẻ: 'cards',
  'Tạm dừng ôn': 'Pause reviews',
  'Các thẻ chưa học hoặc đã đến hạn ôn.':
    'New cards and cards whose review time has arrived.',

  phút: 'minutes',
  'Trả lời sai: về cấp 0 và học lại sau':
    'Incorrect answers reset to level 0. Retry after',
  'Trả lời đúng: tăng một cấp, ôn sau số ngày tương ứng.':
    'Correct answers advance one level and use its interval in days.',
  '🧠 Lịch ôn đang áp dụng': '🧠 Current review schedule',
  'Khoảng cách ôn phải là số nguyên tăng dần từ 1 đến 3650 ngày; thời gian học lại từ 1 đến 10080 phút.':
    'Review intervals must be increasing whole numbers from 1 to 3650 days; retry time must be 1 to 10080 minutes.',
  'Đã cập nhật lịch ôn thẻ.': 'Card schedule updated.',
  'Đã lưu cấu hình ôn tập.': 'Review settings saved.',
  'Chọn ngày giờ hợp lệ.': 'Choose a valid date and time.',
  'Đưa về ôn ngay': 'Set review to now',
  'Chỉnh lịch không thay đổi số lần trả lời đúng/sai.':
    'Editing the schedule keeps correct and incorrect answer counts.',
  'Lần ôn tiếp theo': 'Next review',
  'Cấp ghi nhớ': 'Memory level',
  'Chỉnh lịch ôn thẻ': 'Edit card schedule',
  'Điền cấu hình mặc định': 'Fill default settings',
  'Không chọn: giữ lịch hiện có, áp dụng cấu hình từ lượt học tiếp theo. Chọn: thay cả ngày ôn đã chỉnh thủ công; thẻ chưa học và thẻ tạm dừng giữ nguyên.':
    'Unchecked: keep existing dates and apply settings to future reviews. Checked: replace dates, including manual changes. New and paused cards keep their dates.',
  'Tính lại lịch các thẻ đã học từ lần học gần nhất':
    'Recalculate learned cards from their last review',
  'Khoảng cách của 6 cấp phải tăng dần. Trả lời đúng tăng một cấp, trả lời sai về cấp 0.':
    'The six intervals must increase. Correct answers advance one level; incorrect answers reset to level 0.',
  'Học lại sau khi trả lời sai (phút)':
    'Retry after an incorrect answer (minutes)',
  'Cấu hình riêng cho người dùng hiện tại.': 'Settings for the current user.',
  'Cấu hình ôn tập cách quãng': 'Spaced repetition settings',
  'Không có thẻ trong khoảng thời gian này.': 'No cards in this time range.',
  'Tiếp tục ôn': 'Resume reviews',
  'Sửa lịch': 'Edit schedule',
  Cấp: 'Level',
  'Sắp tới': 'Upcoming',
  'Thẻ cần ôn ngay': 'Cards due now',
  'Thẻ tạm dừng': 'Paused cards',
  'Ngày mai': 'Tomorrow',
  'Lịch ôn sắp tới': 'Upcoming reviews',
  'Tạm dừng': 'Paused',
  'Tất cả thẻ': 'All cards',
  'Cần ôn ngay': 'Due now',
  'Xem lịch trong': 'Schedule range',
  'Cấu hình ôn tập': 'Review settings',
  'Dự kiến theo lịch hiện tại. Kết quả học tiếp theo có thể thay đổi lịch này.':
    'Based on the current schedule. Future study results may change it.',
  'Lịch ôn & quản lý thẻ': 'Review schedule & card management',
  'Hãy trả lời câu hỏi trước khi xác nhận.':
    'Answer the question before confirming.',
  'Xác nhận từng câu trước khi nộp bài. Sửa đáp án sẽ bỏ xác nhận của câu đó.':
    'Confirm each answer before submitting. Editing an answer removes its confirmation.',
  'Chưa xác nhận': 'Not confirmed',
  'Đã xác nhận': 'Confirmed',
  ...Object.fromEntries(
    partOptions.map(([english, vietnamese]) => [
      vietnamese,
      english +
        (vietnamese.match(/ \(([^)]+)\)$/)?.[1] !== '—'
          ? (vietnamese.match(/ \([^)]+\)$/)?.[0] ?? '')
          : ''),
    ]),
  ),
  '01 · MẶT TRƯỚC': '01 · FRONT',
  '02 · MẶT SAU': '02 · BACK',
  'Từ vựng / câu hỏi': 'Vocabulary / question',
  'Nghĩa / đáp án': 'Meaning / answer',
  'Từ hoặc câu hỏi': 'Word or question',
  'Nghĩa hoặc đáp án': 'Meaning or answer',
  'Từ loại': 'Part of speech',
  'Chưa chọn': 'Not selected',
  '8 từ loại truyền thống': '8 traditional parts of speech',
  'Nhóm thường tách riêng và nhóm chức năng':
    'Additional categories and functional groups',
  'Tùy chọn': 'Optional',
  'Cách đọc': 'Pronunciation',
  'Ngôn ngữ đọc': 'Speech language',
  'Phiên âm': 'Phonetic transcription',
  'Nghe thử': 'Listen',
  'Ghi chú': 'Notes',
  'Ví dụ, cách dùng hoặc mẹo ghi nhớ…': 'Examples, usage or memory tips…',
  'Nút nghe đọc mặt trước theo ngôn ngữ đã chọn. Phiên âm dùng để nhìn cách đọc.':
    'Listen to the front in the selected language. The transcription shows how to pronounce it.',
  'Ảnh minh họa': 'Illustration',
  'Chọn ảnh minh họa': 'Choose an image',
  'PNG, JPEG, WebP hoặc GIF': 'PNG, JPEG, WebP or GIF',
  'Xóa ảnh': 'Remove image',
  'Chọn ảnh PNG, JPEG, WebP hoặc GIF hợp lệ.':
    'Choose a valid PNG, JPEG, WebP or GIF image.',
  'Tiếng Anh (Mỹ)': 'English (US)',
  'Tiếng Anh (Anh)': 'English (UK)',
  'Tiếng Trung (Quan thoại)': 'Chinese (Mandarin)',
  'Tiếng Trung (Đài Loan)': 'Chinese (Taiwan)',
  'Tiếng Nhật': 'Japanese',
  'Tiếng Hàn': 'Korean',
  'Tiếng Pháp': 'French',
  'Tiếng Đức': 'German',
  'Tiếng Tây Ban Nha': 'Spanish',
  'Nhập cách đọc nếu cần': 'Enter pronunciation if needed',
  'Pinyin · dấu thanh': 'Pinyin · tone marks',
  'Nhập âm bằng chữ Latin, dùng các nút để chèn nguyên âm có dấu thanh.':
    'Enter Latin letters and use the buttons to insert vowels with tone marks.',
  'Tách âm': 'Syllable separator',
  'Zhuyin · Chú âm': 'Zhuyin · phonetic symbols',
  'Chèn ký hiệu Chú âm và dấu thanh; bạn cũng có thể nhập Pinyin.':
    'Insert Zhuyin symbols and tone marks, or type Pinyin.',
  'Phụ âm': 'Consonants',
  'Nguyên âm': 'Vowels',
  'Dấu thanh': 'Tone marks',
  'Kana · Hiragana': 'Kana · Hiragana',
  'Chèn Hiragana để ghi cách đọc; cũng có thể gõ Katakana hoặc Romaji trực tiếp.':
    'Insert Hiragana for pronunciation, or type Katakana or Romaji.',
  'Âm cơ bản': 'Basic sounds',
  'Âm đục / bán đục': 'Voiced / semi-voiced sounds',
  'Âm nhỏ / trường âm': 'Small kana / long vowels',
  'Tiếng Hàn · phiên âm Latin': 'Korean · Latin transcription',
  'Gõ cách đọc bằng chữ Latin hoặc nhập Hangul trực tiếp bằng bàn phím tiếng Hàn.':
    'Type Latin transcription or enter Hangul using a Korean keyboard.',
  'IPA · tiếng Anh': 'IPA · English',
  'IPA · ký tự thường dùng': 'IPA · common symbols',
  'Bấm ký tự để chèn vào vị trí con trỏ. Bạn có thể gõ thêm ký tự trực tiếp.':
    'Click a symbol to insert it at the cursor. You can also type directly.',
  'Nguyên âm & phụ âm': 'Vowels & consonants',
  'Cách chấm đáp án': 'How answers are graded',
  'Enter Xác nhận / Bỏ xác nhận · ← → Chuyển câu':
    'Enter Confirm / Unconfirm · ← → Change question',
  'Xác nhận': 'Confirm',
  'Bỏ xác nhận': 'Unconfirm',
  'Câu trước': 'Previous question',
  'Câu sau': 'Next question',
  'Chỉ câu đã xác nhận mới được tính khi nộp bài.':
    'Only confirmed answers count when you submit the test.',

  'Người dùng không còn tồn tại.': 'This user no longer exists.',
  'Tối đa 50 người dùng.': 'Up to 50 users.',
  'Thư mục ID này đã tồn tại.': 'A folder with this ID already exists.',
  'Cần giữ lại ít nhất một người dùng.': 'At least one user must remain.',
  'Người dùng vừa được tạo. Hãy tải lại danh sách trước khi nhập.':
    'The user was just created. Reload the list before importing.',
  'Người dùng vừa bị xóa. Hãy kiểm tra lại trước khi khôi phục.':
    'The user was just deleted. Check again before restoring.',
  'Bản sao lưu cần có tên người dùng để khôi phục hồ sơ mới.':
    'The backup needs a user name to restore a new profile.',
  'Lỗi máy chủ. Hãy thử lại.': 'Internal server error',
  'Yêu cầu thất bại.': 'Request failed',
  'Không cho phép ghi dữ liệu từ nguồn khác.':
    'Cross-origin writes are forbidden',
  'Không kết nối được máy chủ.': 'Failed to fetch',

  'Dữ liệu đã thay đổi ở cửa sổ khác. Thay đổi chưa lưu vẫn được giữ trên trình duyệt.':
    'Data changed in another window. Your unsaved changes are kept in this browser.',
  'Dữ liệu đang được cập nhật ở cửa sổ khác. Thay đổi chưa lưu vẫn được giữ trên trình duyệt.':
    'Data is being updated in another window. Your unsaved changes are kept in this browser.',
  'Bản trên trình duyệt và máy chủ khác nhau. Thay đổi chưa lưu được giữ lại. Mở Cài đặt → Xử lý đồng bộ để tiếp tục.':
    'The browser and server versions differ. Your unsaved changes are kept. Open Settings → Resolve sync to continue.',
  'Dữ liệu máy chủ vừa thay đổi tiếp. Thay đổi chưa lưu được giữ lại. Mở Cài đặt → Xử lý đồng bộ để tiếp tục.':
    'Server data changed again. Your unsaved changes are kept. Open Settings → Resolve sync to continue.',
  'Không xác minh được trạng thái lưu. Thay đổi vẫn được giữ trên trình duyệt.':
    'Unable to verify the save status. Your changes are kept in this browser.',
  'Máy chủ chưa hỗ trợ avatar này. Hãy khởi động lại ứng dụng sau khi cập nhật.':
    'The server does not support this avatar yet. Restart the app after updating.',
  'Máy chủ không chấp nhận dữ liệu. Các thay đổi vẫn được giữ trên trình duyệt.':
    'The server rejected the data. Your changes are kept in this browser.',
  'Máy chủ phản hồi quá lâu. Thay đổi vẫn được giữ trên trình duyệt.':
    'The server took too long to respond. Your changes are kept in this browser.',
  'Không kết nối được máy chủ. Thay đổi vẫn được giữ trên trình duyệt.':
    'Unable to connect to the server. Your changes are kept in this browser.',
  'Dữ liệu đang chờ lưu. Hãy thử lại sau giây lát.':
    'Your changes are waiting to be saved. Try again shortly.',
  'Đang lưu dữ liệu. Hãy thử lại sau.':
    'Saving data. Please try again shortly.',
  'Không đọc được dữ liệu máy chủ': 'Unable to read server data',
  'Không đọc được máy chủ': 'Unable to read from the server',
  'Máy chủ chưa có dữ liệu': 'The server has no data yet',
  'Bản khôi phục không có dữ liệu.': 'The backup contains no data.',
  'Xử lý đồng bộ': 'Resolve sync',
  'Xử lý hai phiên bản dữ liệu': 'Resolve different data versions',
  'Sao lưu và dùng bản máy chủ': 'Back up and use server data',
  'Chưa sao lưu được dữ liệu.': 'Unable to back up your data.',
  'Ứng dụng sẽ lưu riêng bản hiện tại trên trình duyệt và tải một bản JSON để bạn đối chiếu. Sau đó dùng dữ liệu máy chủ và tải lại trang. Tiếp tục?':
    'The app will keep a separate copy in this browser and download a JSON backup for comparison. It will then use server data and reload the page. Continue?',
  'Bản sao lưu hoặc xác nhận không hợp lệ.':
    'The backup or confirmation is invalid.',
  'ID trong bản sao lưu không khớp người dùng đích.':
    'The backup ID does not match the selected user.',

  'Nhịp học tập': 'Study rhythm',
  'Chuỗi học hiện tại': 'Current study streak',
  'ngày liên tiếp': 'consecutive days',
  'Đã học hôm nay · tiếp tục giữ nhịp nhé!': 'Studied today · keep it going!',
  'Học hôm nay để giữ chuỗi.': 'Study today to keep your streak.',
  'Học hôm nay để bắt đầu chuỗi mới.': 'Study today to start a new streak.',
  'Chuỗi dài nhất': 'Longest streak',
  ngày: 'days',
  '7 ngày gần đây': 'Last 7 days',
  'ngày có học': 'active days',
  'thẻ đạt cấp ≥ 3': 'cards at level ≥ 3',
  'Thành thạo (Mastered)': 'Mastered',
  'được tính khi thẻ đạt cấp ≥ 3: được chấm đúng 3 lượt liên tiếp. Trả lời sai sẽ về cấp 0. Tích “đã nhớ” một lần chưa đủ.':
    'A card is mastered at level ≥ 3: graded correct 3 times in a row. An incorrect answer resets it to level 0. Checking “remembered” once is not enough.',
  'Tên học phần *': 'Set name *',
  'Tạo học phần mới': 'Create study set',
  'Chỉnh sửa học phần': 'Edit study set',
  'Sắp xếp kiến thức của bạn thành từng bộ thẻ.':
    'Organize your knowledge into study sets.',
  'Ví dụ: English for IT': 'For example: English for IT',
  'Học phần này chứa nội dung gì?': 'What is this set about?',
  'Màu nhận diện': 'Set color',
  Tím: 'Purple',
  'Xanh dương': 'Blue',
  'Cam đào': 'Peach',
  'Xanh bạc hà': 'Mint',
  Hồng: 'Pink',
  'Sắc độ': 'Hue',
  'Độ bão hòa': 'Saturation',
  'Độ sáng': 'Brightness',
  'Mã màu HEX': 'HEX color',
  'Chọn trên bảng màu, kéo các thanh hoặc nhập mã như #7c3aed, #f80.':
    'Choose a color, adjust the sliders, or enter a code such as #7c3aed or #f80.',
  'Thuật ngữ / Câu hỏi *': 'Term / Question *',
  'Định nghĩa / Đáp án *': 'Definition / Answer *',
  'Ví dụ: Dependency Injection': 'For example: Dependency Injection',
  'Ví dụ: Cung cấp phụ thuộc từ bên ngoài':
    'For example: Providing dependencies externally',
  'Sửa thẻ ghi nhớ': 'Edit flashcard',
  'Thêm thẻ ghi nhớ': 'Add flashcard',
  'Đóng hộp thoại': 'Close dialog',
  'Vui lòng nhập nội dung.': 'Please enter a value.',
  'Vui lòng điền trường này.': 'Please fill out this field.',
  'Xóa học phần?': 'Delete study set?',
  'Xóa học phần': 'Delete study set',
  'Xóa thẻ ghi nhớ?': 'Delete flashcard?',
  'Xóa thẻ ghi nhớ': 'Delete flashcard',
  'Xóa người dùng?': 'Delete user?',
  'Xóa người dùng': 'Delete user',
  'Nhập thẻ từ CSV?': 'Import cards from CSV?',
  'Nhập thẻ': 'Import cards',
  'Ghi đè người dùng?': 'Overwrite user?',
  'Ghi đè': 'Overwrite',
  'Đã thêm học phần mới.': 'Study set created.',
  'Đã sửa học phần.': 'Study set updated.',
  'Đã thêm thẻ mới.': 'Card added.',
  'Đã sửa thẻ.': 'Card updated.',
  'Đã xóa thẻ.': 'Card deleted.',
  'Đã xóa học phần.': 'Study set deleted.',
  'Đã xuất CSV học phần.': 'Study set exported as CSV.',
  'Đã nhập thư mục người dùng.': 'User folder imported.',
  'Đã xóa người dùng.': 'User deleted.',
  'Đã thêm người dùng. Bấm “Vào dùng” để mở hồ sơ.':
    'User added. Choose “Switch user” to open their profile.',
  'ID được tạo tự động và không trùng. Mỗi người dùng có dữ liệu riêng. Xuất ZIP trong Cài đặt trước khi xóa nếu muốn giữ bản sao. Chọn thư mục CSV để tạo người dùng theo tên thư mục (mỗi CSV là một học phần), hoặc thư mục đã giải nén từ ZIP để khôi phục cả tiến độ.':
    'Each user has a unique ID and separate data. Export a ZIP in Settings before deleting a user if you want a copy. Import a CSV folder to create a user named after the folder, or an extracted ZIP folder to restore progress.',
  'Thư mục lưu trữ:': 'Storage folder:',
  'CSV của mỗi người nằm trong thư mục ID → materials; index.json liệt kê tên học phần tương ứng.':
    'Each user’s CSV files are in their ID → materials folder; index.json maps files to study sets.',
  '🧠 Thuật toán ôn tập': '🧠 Review algorithm',
  'Trả lời đúng: thẻ được lên lịch sau': 'Correct answers schedule cards after',
  '1, 3, 7, 14, 30, rồi 60 ngày': '1, 3, 7, 14, 30, then 60 days',
  '. Trả lời sai: học lại sau khoảng': '. Incorrect answers return after about',
  '5 phút': '5 minutes',
  '. Đây là thuật toán đơn giản lấy cảm hứng từ spaced repetition, không phải bản sao thuật toán của Quizlet hay Anki.':
    '. This simple spaced repetition algorithm is not a copy of Quizlet or Anki.',
  'Đã ghép': 'Matched',
  'cặp · Đúng': 'pairs · Correct',
  'Tạo câu hỏi và bắt đầu ôn tập ngay hôm nay.':
    'Create questions and start reviewing today.',
  'Chưa có học phần.': 'No study sets yet.',
  'Bạn đã hoàn thành những thẻ đến hạn. Tiếp tục học để xây dựng thói quen nhé!':
    'You have finished the cards due today. Keep studying to build your habit!',
  'Không phát được âm thanh. Hãy thử lại.':
    'Unable to play this sound. Please try again.',
  'Không phát được nhạc nền. Hãy tải lại trang và thử lại.':
    'Unable to play music. Reload the page and try again.',
  'Bấm nút nghe thử trong Cài đặt để cho phép phát âm thanh.':
    'Click a preview button in Settings to allow audio playback.',
  'Không xuất được thư mục người dùng. Hãy thử lại.':
    'Unable to export the user folder. Please try again.',
  'Dữ liệu chưa đồng bộ. Hãy kiểm tra kết nối trước khi xuất ZIP.':
    'Your changes have not synced yet. Check the connection before exporting a ZIP.',
  'Xung đột dữ liệu · thay đổi của bạn đang được giữ trên trình duyệt.':
    'Data conflict · your changes are kept in this browser.',
  'Không lưu được bộ nhớ trình duyệt. Hãy kiểm tra dung lượng lưu trữ.':
    'Unable to save in the browser. Check available storage.',
  'Lưu máy chủ thất bại · dữ liệu còn trên trình duyệt':
    'Server save failed · your changes are kept in this browser',
  'Mất kết nối máy chủ': 'Server connection lost',
  'Đóng hộp xác nhận': 'Close confirmation',
  'KIỂM TRA TRƯỚC KHI TIẾP TỤC': 'REVIEW BEFORE CONTINUING',
  'XÁC NHẬN THAO TÁC': 'CONFIRM ACTION',
  'Hủy bỏ': 'Cancel',
  'Hoàn tất': 'Done',
  'Chưa thực hiện được': 'Unable to complete',
  'Đóng thông báo': 'Dismiss notification',
  'Đã tạo học phần mới!': 'Study set created!',
  'Đã cập nhật học phần.': 'Study set updated.',
  'Cần nhập tên học phần.': 'Enter a study set name.',
  'Cần nhập đủ hai mặt của thẻ.': 'Fill in both sides of the card.',
  'Hãy thêm thẻ trước khi bắt đầu học.': 'Add cards before starting a session.',
  'Thuật ngữ này đã có trong học phần. Hãy nhập thuật ngữ khác.':
    'This term already exists in the set. Please use another term.',
  'Tối đa 500 học phần.': 'You can create up to 500 study sets.',
  'Tối đa 10.000 thẻ mỗi học phần và 100.000 thẻ tổng cộng.':
    'Up to 10,000 cards per set and 100,000 cards in total.',
  'CSV lớn hơn 5 MB.': 'The CSV file is larger than 5 MB.',
  'Không đọc được cặp thuật ngữ – định nghĩa nào.':
    'No valid term and definition pairs were found.',
  'Hãy mở học phần để nhập CSV.': 'Open a study set before importing CSV.',
  'Nhập CSV thất bại.': 'CSV import failed.',
  'Chưa kết nối máy chủ. Không thể quản lý người dùng lúc này.':
    'The server is offline. User management is currently unavailable.',
  'Không kết nối được máy chủ. Hãy thử lại.':
    'Unable to connect to the server. Please try again.',
  'Tên người dùng đã tồn tại.': 'This user name already exists.',
  'Tên người dùng đã tồn tại với ID khác.':
    'Another user already has this name.',
  'Tên người dùng cần từ 1 đến 60 ký tự.':
    'User names must contain 1 to 60 characters.',
  'Cần giữ ít nhất một người dùng': 'At least one user must remain',
  'Mở menu': 'Open menu',
  'Điều hướng chính': 'Main navigation',
  'Thêm học phần': 'Add study set',
  'Trình duyệt đang chặn lưu dữ liệu. Hãy xuất thư mục người dùng thường xuyên.':
    'Browser storage is blocked. Export your user folder regularly.',
  'Không thể lưu tự động. Hãy xuất thư mục người dùng để sao lưu.':
    'Unable to save automatically. Export your user folder as a backup.',
  'Dữ liệu chưa lưu xong. Hãy kiểm tra kết nối máy chủ và thử lại.':
    'Your changes have not saved yet. Check the server connection and try again.',
  'Thư mục vượt giới hạn kích thước dữ liệu.':
    'The folder exceeds the data size limit.',
  'Thư mục người dùng cần có cả user.json và state.json.':
    'A user folder must contain both user.json and state.json.',
  'Thư mục cần chứa file CSV hoặc dữ liệu người dùng đã xuất từ FlashLab.':
    'Choose a folder containing CSV files or exported FlashLab user data.',
  'Tổng dung lượng CSV vượt quá 15 MB.':
    'The CSV files exceed the 15 MB limit.',
  'Nhập thư mục thất bại.': 'Folder import failed.',
  'Lật thẻ ·': 'Flip card ·',
  'Chuyển thẻ ·': 'Change card ·',
  'Chưa nhớ ·': 'Not remembered ·',
  'Bộ thẻ cá nhân của bạn': 'Your personal study set',
  'KIỂM TRA': 'TEST',
  Năm: 'Year',
  'Năm hoạt động': 'Activity year',
  'Bạn muốn học như thế nào?': 'How would you like to study?',
  'Chọn trước khi bắt đầu.': 'Choose your options before starting.',
  'Thứ tự': 'Order',
  'Số câu': 'Number of questions',
  'Bắt đầu': 'Start',
  'Loại câu hỏi kiểm tra': 'Test question type',
  'Mở thanh bên': 'Expand sidebar',
  'Thu gọn thanh bên': 'Collapse sidebar',
  'Độ rộng thanh bên': 'Sidebar width',
  'Lớp học': 'Classes',
  'Tất cả lớp học': 'All classes',
  'Gom các học phần theo lớp hoặc chủ đề.':
    'Group study sets by class or topic.',
  'Tạo lớp học': 'Create class',
  'Chưa có lớp học': 'No classes yet',
  'Tạo lớp học rồi chọn các học phần muốn gom.':
    'Create a class and select the sets you want to group.',
  'Quản lý học phần': 'Manage study sets',
  'Học phần trong lớp': 'Study sets in this class',
  'Lớp học chưa có học phần': 'This class has no study sets',
  'Thêm học phần vào lớp': 'Add sets to class',
  'Quản lý lớp học': 'Manage class',
  'Chọn học phần': 'Select study sets',
  'Tên lớp học *': 'Class name *',
  'Chọn học phần để gom vào lớp. Học phần có thể thuộc nhiều lớp.':
    'Select study sets to group in this class. A set can belong to multiple classes.',
  'Chưa có học phần để thêm.': 'No study sets available.',
  'Tên lớp học đã tồn tại.': 'This class name already exists.',
  'Đã lưu lớp học.': 'Class saved.',
  'Đã xóa lớp học.': 'Class deleted.',
  'Xóa lớp học': 'Delete class',
  'Xóa lớp học?': 'Delete class?',
  'Tối đa 100 lớp học.': 'Up to 100 classes.',
  'Thẻ cần ôn': 'Cards due for review',
  'Chưa học': 'Not studied yet',
  'Đến hạn': 'Due',
  'Tìm học phần': 'Find study sets',
  'Tìm theo tên hoặc mô tả học phần': 'Search set names or descriptions',
  'Không tìm thấy học phần phù hợp.': 'No matching study sets.',
  'Phát nhạc nền': 'Play background music',
  'Dừng nhạc nền': 'Pause background music',
  'Nhạc nền đã dừng.': 'Background music is paused.',
  'Đang nghe thử âm thanh.': 'Previewing sound.',
  'Từ ngày': 'From date',
  'Đến ngày': 'To date',
  Lọc: 'Filter',
  'Xóa bộ lọc': 'Clear filters',
  'Không có phiên học trong khoảng ngày đã chọn.':
    'No sessions in the selected date range.',
  'Ngày kết thúc phải từ ngày bắt đầu trở đi.':
    'The end date must be on or after the start date.',
  'Thành thạo: được chấm đúng ít nhất 3 lượt liên tiếp; trả lời sai sẽ về cấp 0.':
    'Mastered: at least 3 consecutive graded correct answers. An incorrect answer resets the level to 0.',
  'Không thể tải phiên học.': 'Unable to load this session.',
  'KHÔNG GIAN HỌC TẬP': 'LEARNING SPACE',
  'FLASHLAB · KHÔNG GIAN HỌC TẬP': 'FLASHLAB · YOUR LEARNING SPACE',
  'Tổng quan': 'Overview',
  'Thư viện học phần': 'Study sets',
  'Cần ôn hôm nay': 'Due today',
  'Thống kê': 'Statistics',
  'HỌC PHẦN GẦN ĐÂY': 'RECENT SETS',
  'Mỗi ngày một chút!': 'A little every day!',
  '10 phút ôn tập hôm nay có thể tạo nên khác biệt lớn.':
    'Ten minutes of review today can make a big difference.',
  'FlashLab · Không gian cá nhân': 'FlashLab · Personal space',
  'FlashLab · Dữ liệu lưu trên máy chủ và bộ nhớ trình duyệt.':
    'FlashLab · Data saved on the server and in your browser.',
  'Cài đặt': 'Settings',
  'Đóng cài đặt': 'Close settings',
  'Ngôn ngữ': 'Language',
  'Tiếng Việt': 'Vietnamese',
  'Giao diện': 'Appearance',
  'Chế độ giao diện': 'Appearance mode',
  Sáng: 'Light',
  Tối: 'Dark',
  'Hệ thống': 'System',
  'Giao diện sáng': 'Light appearance',
  'Giao diện tối': 'Dark appearance',
  'Giao diện theo hệ thống': 'Use system appearance',
  'Âm thanh': 'Sound',
  'Âm lượng chung': 'Master volume',
  'Âm lượng từng loại': 'Volume mixer',
  'Nhạc nền': 'Background music',
  'Nhạc kiểm tra': 'Test music',
  'Trả lời đúng': 'Correct answer',
  'Trả lời sai': 'Incorrect answer',
  'Hoàn thành': 'Completed',
  'Cần cố gắng': 'Keep trying',
  'Lật thẻ': 'Flip card',
  'Chuyển thẻ': 'Next card',
  'Tắt âm thanh chung': 'Mute all sounds',
  'Bật âm thanh chung': 'Unmute all sounds',
  'Nhạc nền phát trên mọi trang, chế độ kiểm tra có nhạc riêng.':
    'Background music plays throughout the app. Tests have their own music.',
  'Đang tải nhạc nền…': 'Loading music…',
  'Đang phát nhạc nền': 'Playing background music',
  'Nhạc nền đang tắt.': 'Background music is muted.',
  'Nhạc tạm dừng khi ẩn tab.': 'Music pauses while this tab is hidden.',
  'Bấm vào ứng dụng để bắt đầu phát nhạc.': 'Click in the app to start music.',
  'Dữ liệu người dùng': 'User data',
  'Xuất thư mục ZIP': 'Export ZIP folder',
  'Đang chuẩn bị thư mục ZIP…': 'Preparing ZIP folder…',
  'Đã tải thư mục ZIP.': 'ZIP folder downloaded.',
  'Đã xuất thư mục người dùng thành ZIP.': 'User folder exported as ZIP.',
  'Đang kết nối…': 'Connecting…',
  'Đang lưu…': 'Saving…',
  'Đã đồng bộ': 'Saved',
  'Chưa kết nối máy chủ · lưu tạm trên trình duyệt':
    'Offline · saved temporarily in this browser',
  'Học tốt hơn mỗi ngày': 'Learn better every day',
  'Sẵn sàng khám phá kiến thức mới? Bắt đầu từ một thẻ nhỏ nhé.':
    'Ready to discover something new? Start with one small card.',
  'Tạo học phần': 'Create set',
  'Tổng học phần': 'Total sets',
  'bộ thẻ đã tạo': 'sets created',
  'Thẻ ghi nhớ': 'Flashcards',
  'tổng số thẻ ghi nhớ': 'total flashcards',
  'Đến hạn ôn': 'Due for review',
  'nên ôn trong hôm nay': 'to review today',
  'Đã học hôm nay': 'Studied today',
  'lượt trả lời': 'answers',
  'Học phần của bạn': 'Your study sets',
  'Xem tất cả': 'View all',
  'ÔN TẬP THÔNG MINH': 'SMART REVIEW',
  'Đến lúc củng cố trí nhớ! ✨': 'Time to strengthen your memory! ✨',
  'Ôn tập ngay': 'Review now',
  'Ôn tập đến hạn': 'Due reviews',
  'Xem lịch ôn tập': 'Review schedule',
  '💡 Mẹo học hiệu quả': '💡 Study tip',
  'Thay vì đọc đi đọc lại, hãy': 'Instead of reading over and over,',
  'tự trả lời trước khi lật thẻ': 'recall the answer before flipping the card',
  '. Chế độ Trắc nghiệm và Viết giúp luyện khả năng nhớ chủ động.':
    '. Quiz and Write help you practice active recall.',
  'Khám phá các chế độ học': 'Explore study modes',
  'BỘ SƯU TẬP': 'MY COLLECTION',
  'Tổ chức kiến thức theo chủ đề, học theo tốc độ của bạn.':
    'Organize knowledge by topic and study at your own pace.',
  'Tìm học phần...': 'Find a study set…',
  '🔐 Dữ liệu thuộc về bạn': '🔐 Your data belongs to you',
  'Không có tài khoản, không gửi thẻ lên Internet. Xuất thư mục ZIP trong Cài đặt hoặc nhập thư mục qua menu người dùng.':
    'No account needed. Your cards stay local. Export a ZIP folder in Settings or import a folder from the user menu.',
  'Chưa tìm thấy học phần': 'No study sets found',
  'Thử tên khác hoặc tạo học phần đầu tiên của bạn.':
    'Try another name or create your first set.',
  'Chưa có học phần': 'No study sets yet',
  'Học phần': 'Study set',
  'Chế độ học': 'Study mode',
  'Quay về thư viện': 'Back to library',
  'Nhập CSV': 'Import CSV',
  'Xuất CSV': 'Export CSV',
  'Chỉnh sửa': 'Edit',
  Xóa: 'Delete',
  'BỘ THẺ CỦA BẠN': 'YOUR STUDY SET',
  'Bắt đầu học': 'Start studying',
  'Thêm thẻ': 'Add card',
  'Chọn chế độ học': 'Choose a study mode',
  '6 chế độ luyện tập': '6 study modes',
  'Trắc nghiệm': 'Quiz',
  Viết: 'Write',
  Kiểm: 'Test',
  'Ghép cặp': 'Match',
  'Lật thẻ, tự đánh giá trí nhớ': 'Flip cards and assess your recall',
  'Luyện trắc nghiệm chủ động': 'Practice with single choice',
  'Tự gõ đáp án để ghi nhớ': 'Type answers to practice recall',
  'Bài kiểm tra & chấm điểm': 'Take a graded test',
  'Ghép cặp, thử thách tốc độ': 'Match pairs against the clock',
  'Học thẻ đến hạn theo lịch': 'Review cards when they are due',
  'Cài đặt phiên học': 'Study settings',
  'Theo thứ tự': 'In order',
  'Ngẫu nhiên': 'Random',
  'Loại câu hỏi kiểm': 'Test question type',
  'Chọn một đáp án và tự luận': 'Single choice and written',
  'Chỉ chọn một đáp án': 'Single choice only',
  'Chỉ tự luận': 'Written only',
  'Số câu kiểm': 'Number of test questions',
  'Số cặp ghép': 'Number of matching pairs',
  'Áp dụng cho phiên học tiếp theo; số câu tối đa bằng số thẻ có sẵn.':
    'Applies to the next session; the count is limited to available cards.',
  'Danh sách thẻ': 'Cards',
  'Tìm thuật ngữ hoặc định nghĩa...': 'Search terms or definitions…',
  'THUẬT NGỮ / MẶT TRƯỚC': 'TERM / FRONT',
  'ĐỊNH NGHĨA / MẶT SAU': 'DEFINITION / BACK',
  'Chưa có thẻ phù hợp': 'No matching cards',
  'Thêm thẻ mới hoặc thử từ khóa khác.': 'Add a card or try another search.',
  'Đánh dấu sao': 'Star card',
  'Bỏ dấu sao': 'Unstar card',
  'Sửa thẻ': 'Edit card',
  'Xóa thẻ': 'Delete card',
  'Quay lại học phần': 'Back to study set',
  'Quay về học phần': 'Back to study set',
  'Về học phần': 'Back to study set',
  'Tất cả học phần': 'All study sets',
  'Viết · Tự trả lời': 'Write · Recall',
  'Ôn tập cách quãng': 'Spaced repetition',
  'MẶT TRƯỚC · THUẬT NGỮ': 'FRONT · TERM',
  'MẶT SAU · ĐỊNH NGHĨA': 'BACK · DEFINITION',
  'Nhấn vào thẻ hoặc phím Space để lật':
    'Click the card or press Space to flip',
  'Bạn đã nhớ nội dung này chưa?': 'Do you remember this?',
  'chưa nhớ': 'not remembered',
  'đã nhớ': 'remembered',
  'Chưa nhớ': 'Not remembered',
  'Đã nhớ': 'Remembered',
  'Đã nhớ ·': 'Remembered ·',
  'Tìm avatar': 'Find avatar',
  'Ảnh đại diện của bạn': 'Your avatar',
  'Tên tiếng Việt hoặc tiếng Anh…': 'Vietnamese or English name…',
  'Hướng dẫn sao lưu và lưu trữ': 'Backup and storage guide',
  'Khôi phục bản sao lưu hoặc tạo người dùng từ thư mục CSV.':
    'Restore a backup or create a user from a CSV folder.',
  Nghe: 'Listen',
  'Nghe phát âm (3)': 'Listen to pronunciation (3)',
  Trước: 'Previous',
  Tiếp: 'Next',
  'Tiếp tục': 'Continue',
  'TRẮC NGHIỆM': 'QUIZ',
  VIẾT: 'WRITE',
  'Chọn định nghĩa đúng cho thuật ngữ': 'Choose the correct definition',
  'Chọn một đáp án để kiểm tra kiến thức.':
    'Choose an answer to check your knowledge.',
  'Nhấn Enter để tiếp tục.': 'Press Enter to continue.',
  '✓ Chính xác!': '✓ Correct!',
  '✕ Chưa đúng, hãy thử nhớ lại.': '✕ Not quite. Try to recall it again.',
  '✕ Chưa khớp với đáp án đã lưu.':
    '✕ Your answer does not match the saved answer.',
  'Nhập định nghĩa hoặc ý nghĩa của thuật ngữ':
    'Type the definition or meaning',
  'Nhập câu trả lời của bạn...': 'Type your answer…',
  'Hiện đáp án': 'Reveal answer',
  'Kiểm tra': 'Test',
  'Kiểm tra đáp án': 'Check answer',
  'Chấm đúng khi nội dung trùng khớp (không phân biệt chữ hoa/thường và khoảng trắng). Cách diễn đạt khác có thể bị đánh sai.':
    'Answers must match, ignoring case and extra spaces. Alternative wording may be marked incorrect.',
  'Danh sách câu hỏi': 'Questions',
  'Tự chọn câu hỏi. Kết quả được chấm khi nộp bài.':
    'Navigate freely between questions. Your answers are graded when you submit.',
  'Nộp bài': 'Submit test',
  'Nộp bài và xem kết quả': 'Submit and view results',
  'Câu tiếp theo': 'Next question',
  'Nhập đáp án': 'Type your answer',
  'Nhấn một thuật ngữ và định nghĩa tương ứng. Cố gắng ghép tất cả trong thời gian ngắn nhất!':
    'Choose a term and its matching definition. Match all pairs as quickly as you can!',
  'Thời gian': 'Time',
  'PHIÊN HỌC HOÀN THÀNH': 'SESSION COMPLETE',
  'Bạn đã hoàn thành!': 'You finished!',
  'Học lại': 'Study again',
  '✓ Đúng': '✓ Correct',
  '✕ Sai': '✕ Incorrect',
  'ÔN TẬP CÁCH QUÃNG': 'SPACED REPETITION',
  'Thẻ vừa học sẽ xuất hiện lại theo khoảng cách tăng dần để ghi nhớ lâu hơn.':
    'Reviewed cards return at increasing intervals to help you remember longer.',
  'Tổng số thẻ đang chờ': 'Cards due for review',
  'Các thẻ chưa học hoặc đến hạn trong hôm nay':
    'New cards and cards due today',
  'Học phần cần ôn': 'Sets to review',
  'Không còn thẻ đến hạn!': 'All caught up!',
  'Không có thẻ đến hạn': 'No cards due',
  'Học phần chưa có thẻ': 'This set has no cards',
  'Hãy thêm một vài thẻ để bắt đầu.': 'Add a few cards to get started.',
  'Các thẻ trong học phần đã được lên lịch ôn vào lúc khác.':
    'These cards are scheduled for a later review.',
  'Bạn đã hoàn thành lịch ôn tập hiện tại. Hãy quay lại ngày mai hoặc học các thẻ mới.':
    'You have finished your current reviews. Come back tomorrow or learn some new cards.',
  'Đến thư viện': 'Go to library',
  'TIẾN ĐỘ HỌC TẬP': 'PROGRESS & INSIGHTS',
  'Thống kê học tập': 'Study statistics',
  'Theo dõi số thẻ đã học và tiến độ ghi nhớ theo từng chủ đề.':
    'Track your progress and recall across study sets.',
  'Tiến độ theo học phần': 'Progress by set',
  'Hoạt động học tập': 'Study activity',
  'Lịch hoạt động học tập': 'Study activity calendar',
  'Mức độ học tập theo ngày': 'Daily study activity',
  Ít: 'Less',
  Nhiều: 'More',
  T2: 'Mon',
  T4: 'Wed',
  T6: 'Fri',
  'Phiên học gần đây': 'Recent sessions',
  'Chưa có phiên học. Học thử một bộ thẻ nhé!':
    'No sessions yet. Try studying a set!',
  'Xem thêm': 'Show more',
  'Thu gọn': 'Show less',
  'Học phần đã xóa': 'Deleted set',
  'Người dùng': 'Users',
  'Chọn hồ sơ để vào dùng, không cần mật khẩu.':
    'Choose a profile. No password required.',
  'Đang sử dụng': 'Current user',
  'Học phần, tiến độ và cấu hình riêng': 'Separate sets, progress and settings',
  'Hiện tại': 'Current',
  'Vào dùng': 'Switch user',
  'Tên người dùng mới': 'New user name',
  'Ví dụ: An, Bình…': 'For example: Alex, Sam…',
  'Thêm người dùng': 'Add user',
  'Nhập thư mục người dùng': 'Import user folder',
  Đóng: 'Close',
  Hủy: 'Cancel',
  'Lưu lại': 'Save',
  Lưu: 'Save',
  'Tên học phần': 'Set name',
  'Mô tả': 'Description',
  'Màu sắc': 'Color',
  'Thuật ngữ / Mặt trước': 'Term / Front',
  'Định nghĩa / Mặt sau': 'Definition / Back',
  'Thêm thẻ mới': 'Add a new card',
};
// Captured content is left untouched, including names, terms and answers.
const patterns: [RegExp, (...parts: string[]) => string][] = [
  [
    /^Dòng (\d+): từ loại có nhưng thiếu nghĩa đi kèm\.$/,
    (line) =>
      `Row ${line}: a word class is present but its meaning is missing.`,
  ],
  [
    /^Hoàn thành (\d+) cặp · (\d+)\/(\d+) lượt ghép đúng · (\d+) lượt sai$/,
    (pairs, correct, total, wrong) =>
      `Completed ${pairs} pairs · ${correct}/${total} correct matches · ${wrong} incorrect`,
  ],
  [
    /^Đã nhập (\d+) thẻ\. Ghi đè (\d+)\. Bổ sung (\d+)\. Bỏ qua (\d+)\.$/,
    (added, overwritten, merged, skipped) =>
      `Imported ${added} cards. Overwritten: ${overwritten}. Merged: ${merged}. Skipped: ${skipped}.`,
  ],
  [
    /^Đã nhập (\d+) thẻ\. Ghi đè (\d+)\. Bỏ qua (\d+)\.$/,
    (added, replaced, skipped) =>
      `Imported ${added} cards. Overwritten ${replaced}. Skipped ${skipped}.`,
  ],
  [/^Đổi ảnh đại diện: (.*)$/s, (name) => `Change avatar: ${name}`],
  [/^Xóa phiên học (.+)$/, (name) => `Delete session ${name}`],
  [
    /^Chưa thể nộp bài\. Cần trả lời và xác nhận các câu: (.+)\.$/,
    (numbers) => `Cannot submit yet. Answer and confirm questions: ${numbers}.`,
  ],
  [/^Cấp (\d+) \(ngày\)$/, (level) => `Level ${level} (days)`],
  [/^(14|30|90) ngày$/, (days) => `${days} days`],
  [
    /^(\d+) \/ (\d+) câu đã xác nhận$/,
    (n, total) => `${n} / ${total} confirmed`,
  ],
  [
    /^Thuật ngữ “(.*)” bị trùng trong học phần “(.*)”\.$/s,
    (term, deck) =>
      `The term “${term}” is duplicated in the study set “${deck}”.`,
  ],
  [
    /^Không lưu được dữ liệu \(mã (\d+)\). Thay đổi vẫn được giữ trên trình duyệt\.$/,
    (code) =>
      `Unable to save data (code ${code}). Your changes are kept in this browser.`,
  ],
  [
    /^File (.*) không có thẻ hợp lệ\.$/s,
    (name) => `File ${name} contains no valid cards.`,
  ],
  [/^Dừng nghe thử (.*)$/, (name) => `Stop preview: ${phrases[name] ?? name}`],
  [/^(\d+) \/ (\d+) học phần$/, (count, total) => `${count} / ${total} sets`],
  [/^Đến hạn · (.*)$/, (date) => `Due · ${date}`],
  [/^Tối đa (\d+) thẻ có sẵn$/, (n) => `Up to ${n} available cards`],
  [/^Chọn từ 1 đến (\d+)\.$/, (n) => `Choose a number from 1 to ${n}.`],
  [
    /^Xóa lớp “(.*)”\? Các học phần và tiến độ được giữ lại\.$/s,
    (name) => `Delete class “${name}”? Study sets and progress will be kept.`,
  ],

  [
    /^Người dùng: (.*)\. Đổi hoặc quản lý người dùng$/s,
    (name) => `User: ${name}. Switch or manage users`,
  ],
  [
    /^Vui lòng nhập (.*)\.$/s,
    (label) => `Please enter ${phrases[label] ?? label}.`,
  ],
  [/^Tối đa (.*) ký tự\.$/, (n) => `Maximum ${n} characters.`],
  [/^Đã nhập (\d+) thẻ\.$/, (n) => `Imported ${n} cards.`],
  [
    /^Thẻ “(.*)” sẽ bị xóa khỏi học phần\. Thao tác này không thể hoàn tác\.$/s,
    (term) => `Delete the card “${term}” from this set? This cannot be undone.`,
  ],
  [
    /^Học phần “(.*)” và (\d+) thẻ sẽ bị xóa\. Thao tác này không thể hoàn tác\.$/s,
    (title, count) =>
      `Delete the set “${title}” and its ${count} cards? This cannot be undone.`,
  ],
  [
    /^Xóa người dùng “(.*)” cùng toàn bộ học phần, tiến độ và cấu hình\? Thao tác này không thể hoàn tác\.$/s,
    (name) =>
      `Delete user “${name}” and all their sets, progress and settings? This cannot be undone.`,
  ],
  [
    /^Thêm (\d+) thẻ từ file CSV vào học phần “(.*)”\. Các thẻ hiện có được giữ lại\.$/s,
    (count, title) =>
      `Add ${count} cards from CSV to “${title}”. Existing cards will be kept.`,
  ],
  [
    /^Không nhập CSV: thuật ngữ “(.*)” bị trùng trong học phần hoặc trong file\.$/s,
    (term) =>
      `CSV not imported: the term “${term}” is duplicated in this set or file.`,
  ],
  [
    /^Ghi đè học phần và tiến độ của “(.*)” bằng thư mục đã chọn\? Xuất ZIP trong Cài đặt trước nếu muốn giữ bản hiện có\.$/s,
    (name) =>
      `Overwrite sets and progress for “${name}” with the selected folder? Export a ZIP in Settings first to keep a copy.`,
  ],
  [
    /^File (.*) không có thẻ hợp lệ\.$/s,
    (name) => `The file ${name} contains no valid cards.`,
  ],
  [
    /^Đã trả lời (\d+) lượt · (\d+) đúng · (\d+) chưa đúng · Thời gian (.*)$/,
    (total, correct, wrong, time) =>
      `${total} answers · ${correct} correct · ${wrong} incorrect · Time ${time}`,
  ],

  [
    /^Tháng (\d+)$/,
    (n) =>
      [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ][Number(n) - 1],
  ],
  [/^Học phần: (.*)$/s, (title) => `Study set: ${title}`],
  [
    /^(.*) · (Thẻ ghi nhớ|Trắc nghiệm|Viết|Kiểm tra|Ghép cặp|Ôn tập cách quãng)$/s,
    (title, mode) => `${title} · ${phrases[mode] ?? mode}`,
  ],
  [
    /^Có (\d+) thẻ đến hạn\. Dành vài phút để nhớ lâu hơn với ôn tập ngắt quãng\.$/,
    (n) =>
      `${n} cards are due. Spend a few minutes reviewing to remember them longer.`,
  ],
  [/^Ôn tất cả \((\d+)\)$/, (n) => `Review all (${n})`],
  [
    /^Đã trả lời (\d+) lượt · (\d+) đúng · (\d+) chưa đúng$/,
    (total, correct, wrong) =>
      `${total} answers · ${correct} correct · ${wrong} incorrect`,
  ],
  [
    /^Hoàn thành (\d+) cặp trong (.*) · (\d+)\/(\d+) lượt ghép đúng · (\d+) lượt sai$/,
    (pairs, time, correct, total, wrong) =>
      `Matched ${pairs} pairs in ${time} · ${correct}/${total} correct attempts · ${wrong} incorrect`,
  ],
  [
    /^(\d+) đã nhớ · (\d+) chưa nhớ · (\d+)%$/,
    (correct, wrong, percent) =>
      `${correct} remembered · ${wrong} not remembered · ${percent}%`,
  ],
  [/^(\d+)\/(\d+) đúng$/, (correct, total) => `${correct}/${total} correct`],
  [/^(\d+)\/(\d+) thẻ$/, (correct, total) => `${correct}/${total} cards`],
  [
    /^Đang hiện (\d+) \/ (\d+) phiên$/,
    (n, total) => `Showing ${n} / ${total} sessions`,
  ],
  [/^Xem thêm \((\d+)\)$/, (n) => `Show more (${n})`],
  [/^(\d+) học phần$/, (n) => `${n} sets`],
  [/^(\d+) thẻ$/, (n) => `${n} cards`],
  [/^(\d+) thành thạo$/, (n) => `${n} mastered`],
  [/^(\d+) đến hạn$/, (n) => `${n} due`],
  [/^(\d+) lượt$/, (n) => `${n} answers`],
  [/^(\d+) lượt học$/, (n) => `${n} study answers`],
  [/^(\d+) phiên đã lưu$/, (n) => `${n} saved sessions`],
  [
    /^(\d+) lượt học · (\d+) ngày hoạt động$/,
    (n, d) => `${n} study answers · ${d} active days`,
  ],
  [
    /^(\d{4}-\d{2}-\d{2}): (\d+) lượt học$/,
    (date, count) => `${date}: ${count} study answers`,
  ],
  [/^(\d+) \/ (\d+) câu đã trả lời$/, (n, total) => `${n} / ${total} answered`],
  [/^(\d+) \/ (\d+) thẻ$/, (n, total) => `${n} / ${total} cards`],
  [
    /^CÂU (\d+) · (CHỌN MỘT ĐÁP ÁN|TỰ LUẬN|CÂU NHIỀU LỰA CHỌN|ĐIỀN NHIỀU ĐÁP ÁN)$/,
    (n, type) =>
      `QUESTION ${n} · ${type === 'TỰ LUẬN' ? 'WRITTEN' : type === 'CÂU NHIỀU LỰA CHỌN' ? 'SELECT MULTIPLE ANSWERS' : type === 'ĐIỀN NHIỀU ĐÁP ÁN' ? 'WRITE MULTIPLE ANSWERS' : 'SINGLE CHOICE'}`,
  ],
  [/^Câu (\d+)$/, (n) => `Question ${n}`],
  [
    /^(\d+) thẻ · Trang (\d+) \/ (\d+)$/,
    (n, page, pages) => `${n} cards · Page ${page} / ${pages}`,
  ],
  [
    /^(\d+) từ đã nhớ · (\d+) từ chưa nhớ · (\d+)% đã nhớ$/,
    (yes, no, percent) =>
      `${yes} remembered · ${no} not remembered · ${percent}% remembered`,
  ],
  [/^Đáp án: (.*)$/s, (answer) => `Answer: ${answer}`],
  [/^Đáp án gợi ý: (.*)$/s, (answer) => `Suggested answer: ${answer}`],
  [/^Bạn trả lời: (.*)$/s, (answer) => `Your answer: ${answer}`],
  [/^Thứ tự (.*)$/, (mode) => `${phrases[mode] ?? mode} order`],
  [
    /^(Âm lượng|Tắt|Bật|Nghe thử) (.*)$/,
    (action, name) =>
      `${({ 'Âm lượng': 'Volume:', Tắt: 'Mute', Bật: 'Unmute', 'Nghe thử': 'Preview' } as Record<string, string>)[action]} ${phrases[name] ?? name}`,
  ],
  [/^Chi tiết đáp án \((\d+) câu\)$/, (n) => `Review answers (${n} questions)`],
  [
    /^Học phần, tiến độ và cấu hình của (.*)\.$/s,
    (name) => `Study sets, progress and settings for ${name}.`,
  ],
];
export function translateText(
  value: string,
  target: Language = language,
): string {
  const trimmed = value.trim();
  if (target === 'vi') {
    const source = Object.entries(phrases).find(
      ([, english]) => english === trimmed,
    )?.[0];
    return source ? value.replace(trimmed, source) : value;
  }
  if (trimmed.startsWith('Lượt đúng: ')) {
    return value
      .replace('Lượt đúng:', 'Correct answers:')
      .replace('Kiểm tra:', 'Test:')
      .replace('Thẻ ghi nhớ', 'Flashcards')
      .replace('Trắc nghiệm', 'Learn')
      .replace('Viết', 'Write')
      .replace('Ghép thẻ', 'Match')
      .replace('Kiểm tra', 'Test');
  }
  if (trimmed.endsWith(' · mở bảng ký tự'))
    return value.replace(
      trimmed,
      `${translateText(trimmed.slice(0, -' · mở bảng ký tự'.length), 'en')} · open symbol keyboard`,
    );
  if (trimmed.startsWith('Chèn '))
    return value.replace(trimmed, `Insert ${trimmed.slice(5)}`);
  if (!phrases[trimmed] && trimmed.startsWith('Ví dụ: '))
    return value.replace(trimmed, `Example: ${trimmed.slice(7)}`);
  let translated = phrases[trimmed];
  if (!translated)
    for (const [pattern, format] of patterns) {
      const match = trimmed.match(pattern);
      if (match) {
        translated = format(...match.slice(1));
        break;
      }
    }
  return translated ? value.replace(trimmed, translated) : value;
}
const protectedContent =
  '[data-user-content],script,style,textarea,.flip-answer,.question-text,.test-question-title,.test-option span,.choice > span:not(.choice-index),.card-term,.card-definition,.deck-card h3,.deck-hero h1,.side-deck,.profile-name strong,.profile-avatar,.profile-id,.storage-path,.review-row strong,.stat-line strong';
const originals = new WeakMap<Node, { source: string; translated: string }>();
const originalAttributes = new WeakMap<
  Element,
  Map<string, { source: string; translated: string }>
>();
let observer: MutationObserver | undefined;
let translating = false;
const watch = () =>
  observer?.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['title', 'aria-label', 'placeholder', 'label'],
  });
export function translatePage() {
  if (translating) return;
  translating = true;
  observer?.disconnect();
  // Part-of-speech metadata is localizable even inside protected vocabulary.
  document
    .querySelectorAll<HTMLElement>('[data-part-of-speech]')
    .forEach((element) => {
      element.textContent = formatPartOfSpeech(
        element.dataset.partOfSpeech ?? '',
        language,
      );
    });
  document
    .querySelectorAll<HTMLElement>('[data-markdown-ui-source]')
    .forEach((element) => {
      element.textContent = translateText(
        element.dataset.markdownUiSource ?? '',
      );
    });
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.parentElement?.closest(protectedContent)) continue;
    const current = node.textContent ?? '';
    const prior = originals.get(node);
    const source =
      prior && current === prior.translated ? prior.source : current;
    const translated = translateText(source);
    originals.set(node, { source, translated });
    if (current !== translated) node.textContent = translated;
  }
  for (const element of document.querySelectorAll<HTMLElement>(
    '[title],[aria-label],[placeholder],optgroup[label]',
  )) {
    if (element.closest('[data-user-content],script,style')) continue;
    let attributes = originalAttributes.get(element);
    if (!attributes) {
      attributes = new Map();
      originalAttributes.set(element, attributes);
    }
    for (const key of [
      'title',
      'aria-label',
      'placeholder',
      ...(element.tagName === 'OPTGROUP' ? ['label'] : []),
    ]) {
      const current = element.getAttribute(key);
      if (current === null) continue;
      const previous = attributes.get(key);
      const source =
        previous && previous.translated === current ? previous.source : current;
      const translated = translateText(source);
      attributes.set(key, { source, translated });
      if (translated !== current) element.setAttribute(key, translated);
    }
  }
  watch();
  translating = false;
}
export function initializeLanguage(
  initial: Language,
  onChange: (value: Language) => void,
) {
  language = initial;
  const apply = () => {
    document.documentElement.lang = language;
    document
      .querySelectorAll<HTMLButtonElement>('[data-language]')
      .forEach((button) =>
        button.setAttribute(
          'aria-pressed',
          String(button.dataset.language === language),
        ),
      );
    translatePage();
  };
  document
    .querySelectorAll<HTMLButtonElement>('[data-language]')
    .forEach((button) =>
      button.addEventListener('click', () => {
        language = button.dataset.language === 'en' ? 'en' : 'vi';
        apply();
        onChange(language);
      }),
    );
  observer = new MutationObserver(() => translatePage());
  apply();
}

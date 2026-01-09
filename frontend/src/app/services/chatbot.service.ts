import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { CHATBOT_DATA } from '../components/chatbot/chatbot-data'; // Đảm bảo đường dẫn import đúng
import { RoomService } from './room.service';

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  private API_KEY = 'AIzaSyCucqrVGvRnZPiKJEtuGH7J4v2NPQ-GAvg';
  private URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${this.API_KEY}`;

  private cachedRooms: any[] | null = null;
  private cacheTime: number = 0;
  private CACHE_DURATION = 10 * 60 * 1000; // Cache 10 phút

  private geminiClient: HttpClient;

  constructor(
    private http: HttpClient,
    private roomService: RoomService,
    handler: HttpBackend
  ) {
    // Dùng handler riêng để không bị Interceptor chặn/thêm header Auth của TechRoom
    this.geminiClient = new HttpClient(handler);
  }

  // Hàm tải trước dữ liệu
  preloadCache(): void {
    // SỬA: Dùng getRooms() thay vì getAllRoomsPaged
    this.roomService.getRooms().subscribe({
      next: (response: any) => {
        // Xử lý linh hoạt mọi cấu trúc trả về
        const rooms = response.content || response.data || response || [];
        this.cachedRooms = Array.isArray(rooms) ? rooms : [];
        this.cacheTime = Date.now();
      },
      error: (err) => console.error('Chatbot preload failed:', err),
    });
  }

  sendMessage(
    userPrompt: string,
    userName: string,
    userPhone: string
  ): Observable<any> {
    const now = Date.now();

    // 1. Kiểm tra Cache
    if (this.cachedRooms && now - this.cacheTime < this.CACHE_DURATION) {
      return this.buildPromptAndSend(
        this.cachedRooms,
        userPrompt,
        userName,
        userPhone
      );
    }

    // 2. Nếu không có cache, gọi API lấy tất cả phòng
    // SỬA: Dùng getRooms() thay vì getAllRoomsPaged
    return this.roomService.getRooms().pipe(
      switchMap((response: any) => {
        const rooms = response.content || response.data || response || [];
        this.cachedRooms = Array.isArray(rooms) ? rooms : [];
        this.cacheTime = now;
        return this.buildPromptAndSend(
          this.cachedRooms,
          userPrompt,
          userName,
          userPhone
        );
      }),
      catchError((error) => {
        console.error('Chatbot API Error:', error);
        // Fallback khi lỗi server
        return of({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: 'Xin lỗi Anh/Chị, em đang gặp chút trục trặc kỹ thuật khi lấy dữ liệu phòng. Vui lòng liên hệ hotline 0779 421 219 nhé! 🙏',
                  },
                ],
              },
            },
          ],
        });
      })
    );
  }

  private buildPromptAndSend(
    rooms: any[],
    userPrompt: string,
    userName: string,
    userPhone: string
  ): Observable<any> {
    // Gọi hàm lọc thông minh (đã có từ code cũ của bạn)
    const filteredRooms = this.filterRelevantRooms(rooms, userPrompt);

    let roomsData = '\n\n=== DANH SÁCH PHÒNG PHÙ HỢP ===\n';

    if (filteredRooms.length > 0) {
      filteredRooms.forEach((room: any, index: number) => {
        const buildingName = room.buildingName || 'Chưa xác định';
        const address = room.buildingAddress || room.address || 'Chưa cập nhật';
        const price = room.price || 0;
        const area = room.area || room.acreage || 0;

        roomsData += `\n[${index + 1}] ${room.name} (ID: ${room.id})`;
        roomsData += `\n    Giá: ${price.toLocaleString('vi-VN')} VNĐ/tháng`;
        roomsData += `\n    Diện tích: ${area} m2`;
        roomsData += `\n    Trạng thái: ${room.status}`;
        roomsData += `\n    Dãy trọ: ${buildingName}`;
        roomsData += `\n    Địa chỉ: ${address}\n`;
      });
    } else {
      roomsData +=
        '\n(Không tìm thấy phòng phù hợp với yêu cầu trong hệ thống)\n';
    }

    const fullPrompt = `
Em là trợ lý tư vấn phòng trọ của TechRoom.

${CHATBOT_DATA}

${roomsData}

Thông tin khách hàng:
- Họ tên: ${userName}
- Số điện thoại: ${userPhone}

Khách vừa nói: "${userPrompt}"

Lưu ý quan trọng:
- Trả lời ngắn gọn, thân thiện.
- KHÔNG chào lại nếu khách không chào, chỉ dùng "Dạ" để bắt đầu.
- Dựa vào danh sách phòng trên để trả lời.
- Format HTML cho danh sách phòng (nếu có):
  
  Dạ anh/chị, em tìm thấy phòng phù hợp:<br><br>
  🏠 <a href="/rooms/{ID}" target="_blank" style="color:#667eea;text-decoration:none;font-weight:bold;">{Tên Phòng}</a><br>
  - Địa chỉ: {Địa chỉ}<br>
  - Giá thuê: {Giá hiển thị gọn} triệu/tháng<br> - Diện tích: {Diện tích}m²<br><br>
  
- Link phải chính xác: <a href="/rooms/{ID}">...</a>
`;

    const body = {
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.4,
      },
    };

    return this.geminiClient.post(this.URL, body);
  }

  // --- LOGIC LỌC PHÒNG (GIỮ NGUYÊN) ---
  private filterRelevantRooms(rooms: any[], userPrompt: string): any[] {
    if (!rooms || rooms.length === 0) return [];

    const prompt = userPrompt.toLowerCase();
    // Chỉ lấy phòng còn trống
    let filtered = rooms.filter((r: any) => r.status === 'AVAILABLE');

    // 1. Lọc theo GIÁ
    const priceMatch = prompt.match(/(\d+)\s*(triệu|tr|trieu)/);
    if (priceMatch) {
      const priceValue = parseInt(priceMatch[1]) * 1000000;

      if (prompt.match(/(dưới|duoi|<|thấp hơn)/)) {
        filtered = filtered.filter((r: any) => (r.price || 0) <= priceValue);
      } else if (prompt.match(/(trên|tren|>|cao hơn)/)) {
        filtered = filtered.filter((r: any) => (r.price || 0) >= priceValue);
      } else if (prompt.match(/(khoảng|tầm|khoang|quanh)/)) {
        const min = priceValue * 0.8;
        const max = priceValue * 1.2;
        filtered = filtered.filter(
          (r: any) => r.price >= min && r.price <= max
        );
      } else {
        const min = priceValue - 500000;
        const max = priceValue + 500000;
        filtered = filtered.filter(
          (r: any) => r.price >= min && r.price <= max
        );
      }
    }

    // 2. Lọc theo DIỆN TÍCH
    const areaMatch = prompt.match(/(\d+)\s*(m2|m²|met|vuông)/);
    if (areaMatch) {
      const areaValue = parseInt(areaMatch[1]);
      if (prompt.match(/(dưới|duoi|<|nhỏ hơn)/)) {
        filtered = filtered.filter(
          (r: any) => (r.area || r.acreage || 0) <= areaValue
        );
      } else if (prompt.match(/(trên|tren|>|lớn hơn|rộng hơn)/)) {
        filtered = filtered.filter(
          (r: any) => (r.area || r.acreage || 0) >= areaValue
        );
      }
    }

    // 3. Lọc theo VỊ TRÍ
    const cityMap: { [key: string]: string[] } = {
      'hồ chí minh': [
        'hồ chí minh',
        'ho chi minh',
        'tp hcm',
        'tphcm',
        'hcm',
        'sài gòn',
      ],
      'hà nội': ['hà nội', 'ha noi', 'hanoi'],
      'đà nẵng': ['đà nẵng', 'da nang', 'danang'],
      'quy nhơn': ['quy nhơn', 'quy nhon', 'quynhon', 'bình định', 'binh dinh'],
      'cần thơ': ['cần thơ', 'can tho', 'cantho'],
      'nha trang': ['nha trang', 'khánh hòa', 'khanh hoa'],
    };

    let locationMatched = false;
    for (const [city, variants] of Object.entries(cityMap)) {
      if (variants.some((v) => prompt.includes(v))) {
        filtered = filtered.filter((r: any) => {
          const address = (r.buildingAddress || r.address || '').toLowerCase();
          return variants.some((v) => address.includes(v));
        });
        locationMatched = true;
        break;
      }
    }

    if (!locationMatched) {
      const locationKeywords = [
        'đường',
        'duong',
        'phường',
        'phuong',
        'quận',
        'quan',
        'tại',
        'tai',
      ];
      if (locationKeywords.some((k) => prompt.includes(k))) {
        const words = prompt
          .split(' ')
          .filter((w: string) => w.length > 2 && !locationKeywords.includes(w));
        if (words.length > 0) {
          filtered = filtered.filter((r: any) => {
            const address = (
              r.buildingAddress ||
              r.address ||
              ''
            ).toLowerCase();
            return words.some((word) => address.includes(word));
          });
        }
      }
    }

    // Sắp xếp theo giá tăng dần
    filtered.sort((a: any, b: any) => (a.price || 0) - (b.price || 0));

    // Lấy top 5 phòng phù hợp nhất
    return filtered.slice(0, 5);
  }
}

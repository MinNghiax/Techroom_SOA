import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../services/chatbot.service';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
})
export class ChatbotComponent implements OnInit {
  @ViewChild('chatBody') private chatBodyContainer!: ElementRef;

  showChat = false;
  showForm = false;
  inputText = '';
  userName = '';
  userPhone = '';
  isBrowser: boolean;
  isLoading = false;

  messages: { from: 'user' | 'bot'; text: string }[] = [];
  showSuggestions = false;
  suggestionChips = [
    'Phòng dưới 3 triệu',
    'Gợi ý phòng có máy lạnh',
    'Tìm phòng rộng trên 20m2',
    'Làm sao để đăng ký chủ trọ?',
    'Cách thanh toán hóa đơn?',
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private chatbotService: ChatbotService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // Tải trước dữ liệu khi component khởi tạo
    this.chatbotService.preloadCache();
  }

  toggleChat() {
    this.showChat = !this.showChat;
    
    // Kiểm tra lịch sử
    this.loadChatHistory();

    // Logic hiển thị form nếu chưa có info
    if (this.showChat) {
       if (!this.userName || !this.userPhone) {
           this.showForm = true;
       } else {
           this.showForm = false;
           this.scrollToBottom();
           if (this.messages.length === 0) this.addWelcomeMessages();
       }
    }
  }

  submitUserInfo() {
    if (!this.userName.trim() || !this.userPhone.trim()) return;

    // Lưu info vào local storage để lần sau không hỏi lại
    if (this.isBrowser) {
        localStorage.setItem('chat_user_info', JSON.stringify({
            name: this.userName, 
            phone: this.userPhone
        }));
    }

    this.showForm = false;
    this.addWelcomeMessages();
  }

  addWelcomeMessages() {
    this.messages.push({
      from: 'bot',
      text: `Xin chào ${this.userName}! 👋 Em là trợ lý AI của TechRoom.`,
    });

    setTimeout(() => {
      this.messages.push({
        from: 'bot',
        text: 'Em có thể giúp bạn tìm phòng trọ phù hợp hoặc giải đáp thắc mắc về hệ thống 🏠',
      });
      this.showSuggestions = true;
      this.saveChatHistory();
    }, 800);
  }

  sendMessage() {
    const msg = this.inputText.trim();
    if (!msg || this.isLoading) return;

    this.messages.push({ from: 'user', text: msg });
    this.inputText = '';
    this.showSuggestions = false;
    this.isLoading = true;
    this.scrollToBottom();

    this.chatbotService
      .sendMessage(msg, this.userName, this.userPhone)
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          // Lấy text an toàn
          const reply = res.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, em chưa hiểu ý của anh/chị.';
          
          // Format link để click được
          const formattedReply = reply.replace(
            /(https?:\/\/[^\s]+| \/rooms\/\d+)/g,
            (match: string) => `<a href="${match.trim()}" target="_blank" style="color:#667eea;text-decoration:none;font-weight:600;">${match}</a>`
          );

          this.messages.push({
            from: 'bot',
            text: formattedReply,
          });
          this.showSuggestions = true;
          this.saveChatHistory();
          this.scrollToBottom();
        },
        error: (err) => {
          this.isLoading = false;
          this.messages.push({
            from: 'bot',
            text: 'Rất tiếc, đã có lỗi kết nối. Vui lòng thử lại sau.',
          });
          this.showSuggestions = true;
          this.scrollToBottom();
        },
      });
  }

  selectSuggestion(chip: string) {
    this.inputText = chip;
    this.sendMessage();
  }

  saveChatHistory() {
    if (this.isBrowser && this.userPhone) {
      localStorage.setItem(`chat_history_${this.userPhone}`, JSON.stringify(this.messages));
    }
  }

  loadChatHistory() {
    if (this.isBrowser) {
        // Lấy info user trước
        const savedUser = localStorage.getItem('chat_user_info');
        if (savedUser) {
            const { name, phone } = JSON.parse(savedUser);
            this.userName = name;
            this.userPhone = phone;
            
            // Lấy lịch sử chat
            const savedHistory = localStorage.getItem(`chat_history_${phone}`);
            if (savedHistory) {
                this.messages = JSON.parse(savedHistory);
            }
        }
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      try {
        if (this.chatBodyContainer) {
            this.chatBodyContainer.nativeElement.scrollTop = this.chatBodyContainer.nativeElement.scrollHeight;
        }
      } catch {}
    }, 100);
  }
}
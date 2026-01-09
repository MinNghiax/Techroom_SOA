import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component'; // <--- Import Footer

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent], // <--- Thêm vào imports
  template: `
    <div class="layout-wrapper">
      <app-header></app-header>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <app-footer></app-footer> </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh; /* Đảm bảo trang luôn cao ít nhất bằng màn hình */
    }
    .main-content {
      flex: 1; /* Đẩy footer xuống đáy nếu nội dung ngắn */
      background-color: #f8f9fa;
    }
  `]
})
export class MainLayoutComponent {}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ChatbotComponent } from '../../components/chatbot/chatbot.component'; // Import Chatbot

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    HeaderComponent, 
    FooterComponent, 
    ChatbotComponent 
  ],
  template: `
    <div class="layout-wrapper">
      <app-header></app-header>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <app-footer></app-footer>
      
      <app-chatbot></app-chatbot> 
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .main-content {
      flex: 1;
      background-color: #f8f9fa;
      min-height: calc(100vh - 64px);
    }
  `]
})
export class MainLayoutComponent {}
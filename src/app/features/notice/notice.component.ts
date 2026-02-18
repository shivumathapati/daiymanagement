import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { NoticeService, Notice } from '../../services/notice.service';
import { AuthService } from '../../core/auth/auth.service';

import { Component, inject, Input } from '@angular/core';

@Component({
  selector: 'app-notice',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './notice.component.html',
  styleUrls: ['./notice.component.css']
})
export class NoticeComponent {
  @Input() readonly: boolean = false;
  @Input() showHeader: boolean = true;

  noticeService = inject(NoticeService);
  authService = inject(AuthService);

  notices$ = this.noticeService.getNotices();

  newMessage: string = '';
  newDate: Date = new Date();

  // Helper getters for template
  isAdmin = this.authService.isAdmin;
  isOperator = this.authService.isoperator;
  
  // Both Admin and Operator can add
  canAddNotice = () => this.isAdmin() || this.isOperator();
  
  // Only Admin can delete (based on prompt "admin delete notise")
  canDelete = this.isAdmin;

  addNotice() {
    if (!this.newMessage.trim()) return;
    
    this.noticeService.addNotice(this.newMessage, this.newDate)
      .then(() => {
        this.newMessage = ''; // Reset form
        this.newDate = new Date(); // Reset date
      })
      .catch(err => console.error('Error adding notice:', err));
  }

  deleteNotice(id: string) {
    if (confirm('Are you sure you want to delete this notice?')) {
      this.noticeService.deleteNotice(id)
        .catch(err => console.error('Error deleting notice:', err));
    }
  }
}

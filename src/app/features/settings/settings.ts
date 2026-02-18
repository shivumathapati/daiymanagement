import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { SettingsService } from '../../services/settings.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule, CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private snackBar = inject(MatSnackBar);
  private firestore = inject(Firestore);

  // Milk Rate Forms
  cowForm: FormGroup = this.createForm('cow');
  buffaloForm: FormGroup = this.createForm('buffalo');

  // User Master Properties
  displayedColumns: string[] = ['email', 'role', 'actions'];
  dataSource!: MatTableDataSource<User>;
  users$!: Observable<User[]>;
  availableRoles = ['admin', 'operator', 'farmer'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  createForm(type: 'cow' | 'buffalo'): FormGroup {
    return this.fb.group({
      type: [type],
      minFat: [0, [Validators.required, Validators.min(0)]],
      maxFat: [0, [Validators.required, Validators.min(0)]],
      minPrice: [0, [Validators.required, Validators.min(0)]],
      maxPrice: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadSettings();
    this.loadUsers();
  }

  // --- Settings Logic ---

  loadSettings() {
    this.settingsService.getRateConfig('cow').subscribe(config => {
      if (config) this.cowForm.patchValue(config);
    });

    this.settingsService.getRateConfig('buffalo').subscribe(config => {
      if (config) this.buffaloForm.patchValue(config);
    });
  }

  saveSettings(form: FormGroup, typeName: string) {
    if (form.valid) {
      this.settingsService.saveRateConfig(form.value).then(() => {
        this.snackBar.open(`${typeName} settings saved!`, 'Close', { duration: 3000 });
      }).catch(err => {
        console.error('Error saving settings:', err);
        this.snackBar.open('Error saving settings.', 'Close', { duration: 3000 });
      });
    }
  }

  // --- User Master Logic ---

  loadUsers() {
    const usersCollection = collection(this.firestore, 'users');
    collectionData(usersCollection, { idField: 'uid' }).subscribe((users: any[]) => {
      this.dataSource = new MatTableDataSource(users);
      // We need to set paginator/sort after view init or when data arrives
      // However, since they are inside a tab, they might not be available immediately if tab is hidden
      // We'll rely on the user switching tabs or use a setter if needed, but simple assignment works often if alive.
      // Better approach for tabs: set them when available or use setters. 
      // For now, assigning here. If issues arise with tabs, we'll fix.
      setTimeout(() => {
          if (this.paginator) this.dataSource.paginator = this.paginator;
          if (this.sort) this.dataSource.sort = this.sort;
      });
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (this.dataSource) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }
  }

  async updateRole(user: User, newRole: string) {
    if (!user.uid) return;
    try {
        const userRef = doc(this.firestore, `users/${user.uid}`);
        await updateDoc(userRef, { role: newRole });
        this.snackBar.open(`Role updated to ${newRole} for ${user.email}`, 'Close', { duration: 3000 });
    } catch (error) {
        console.error('Error updating role:', error);
        this.snackBar.open('Failed to update role', 'Close', { duration: 3000 });
    }
  }
}

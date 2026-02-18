import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { FarmerService } from '../../services/farmer.service';
import { Farmer } from '../../models/farmer.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-farmers',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule, CommonModule, FormsModule],
  templateUrl: './farmers.html',
  styleUrl: './farmers.css',
})
export class Farmers implements OnInit {
  private fb = inject(FormBuilder);
  private farmerService = inject(FarmerService);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['farmerCode', 'firstName', 'lastName', 'mobileNumber', 'gender', 'village', 'aadharNumber', 'joinedDate', 'actions'];
  dataSource = new MatTableDataSource<Farmer>([]);

  farmerForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    gender: ['', Validators.required],
    village: [''],
    aadharNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{12}$/)]],
    bankAccountNumber: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    secondaryBankAccountNumber: ['', [Validators.pattern(/^[0-9]+$/)]],
    isActive: [true],
    joinedDate: [new Date(), Validators.required]
  });

  showAddForm = false;
  isEditMode = false;
  selectedFarmerId: string | null = null;

  allFarmers: Farmer[] = [];
  filterStatus = 'active';

  ngOnInit() {
    this.farmerService.getFarmers().subscribe(farmers => {
      this.allFarmers = farmers;
      this.applyFilter();
    });
  }

  applyFilter() {
    if (this.filterStatus === 'all') {
      this.dataSource.data = this.allFarmers;
    } else {
      const isActive = this.filterStatus === 'active';
      this.dataSource.data = this.allFarmers.filter(f => f.isActive === isActive);
    }
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  editFarmer(farmer: Farmer) {
    this.isEditMode = true;
    this.selectedFarmerId = farmer.id!;
    this.showAddForm = true;

    // Handle Firestore Timestamp
    let date = new Date();
    if (farmer.joinedDate && (farmer.joinedDate as any).seconds) {
      date = new Date((farmer.joinedDate as any).seconds * 1000);
    }

    this.farmerForm.patchValue({
      ...farmer,
      joinedDate: date
    });
  }

  private resetForm() {
    this.isEditMode = false;
    this.selectedFarmerId = null;
    this.farmerForm.reset({
      isActive: true,
      mobileNumber: '',
      gender: '',
      aadharNumber: '',
      bankAccountNumber: '',
      joinedDate: new Date()
    });
  }

  onSubmit() {
    if (this.farmerForm.valid) {
      const farmerData: Farmer = this.farmerForm.value;

      if (this.isEditMode && this.selectedFarmerId) {
        this.farmerService.updateFarmer(this.selectedFarmerId, farmerData).then(() => {
          this.snackBar.open('Farmer updated successfully!', 'Close', { duration: 3000 });
          this.showAddForm = false;
          this.resetForm();
        }).catch(err => {
          console.error('Error updating farmer:', err);
          this.snackBar.open('Error updating farmer', 'Close', { duration: 3000 });
        });
      } else {
        // Generate a sequential serial number starting from 1
        const numericIds = this.dataSource.data
          .map(f => parseInt(f.farmerCode || '0', 10))
          .filter(id => !isNaN(id));

        const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
        farmerData.farmerCode = (maxId + 1).toString();

        this.farmerService.addFarmer(farmerData).then(() => {
          this.snackBar.open('Farmer added successfully!', 'Close', { duration: 3000 });
          this.showAddForm = false; // Go back to list
          this.resetForm();
        }).catch(err => {
          console.error('Error adding farmer:', err);
          this.snackBar.open('Error adding farmer. Please try again.', 'Close', { duration: 3000 });
        });
      }
    }
  }
}

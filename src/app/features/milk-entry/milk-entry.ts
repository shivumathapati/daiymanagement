import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { CollectionService } from '../../services/collection.service';
import { FarmerService } from '../../services/farmer.service';
import { Farmer } from '../../models/farmer.model';
import { MilkRecord } from '../../models/milk-record.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-milk-entry',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule, CommonModule],
  templateUrl: './milk-entry.html',
  styleUrl: './milk-entry.css',
})
export class MilkEntry implements OnInit {
  private fb = inject(FormBuilder);
  private collectionService = inject(CollectionService);
  farmerService = inject(FarmerService);
  private snackBar = inject(MatSnackBar);
  private settingsService = inject(SettingsService);
  @ViewChild('milkTypeSelect') milkTypeSelect!: any;
  farmers: Farmer[] = [];
  currentHour = new Date().getHours();

  // If time is before 1:00 PM (13:00), set to AM, otherwise PM
  shiftValue = (this.currentHour < 14) ? 'AM' : 'PM';
  entryForm: FormGroup = this.fb.group({
    farmerId: ['', Validators.required],
    shift: [this.shiftValue, Validators.required],
    milkType: ['cow', Validators.required],
    fat: [0, [Validators.required, Validators.min(0)]],

    quantity: [0, [Validators.required, Validators.min(0)]],
    rate: [{ value: 0 }, [Validators.required, Validators.min(0)]],
    totalAmount: [{ value: 0, disabled: true }],
    date: [new Date(), Validators.required]
  });

  selectedFarmer: Farmer | null = null;
  farmerCodeControl = this.fb.control('', Validators.required);

  private currentConfig: any = null; // Store current config
  private configSubscription: any; // Track subscription
  ngAfterViewInit() {
    this.milkTypeSelect.focus();
  }
  ngOnInit() {
    this.farmerService.getFarmers().subscribe(farmers => {
      this.farmers = farmers;
    });

    this.entryForm.valueChanges.subscribe(values => {
      this.calculateTotal();
    });

    // Subscribe to milkType to switch the active config listener
    this.entryForm.get('milkType')?.valueChanges.subscribe(type => {
      this.switchConfigSubscription(type);
    });

    // Initial subscription
    const initialType = this.entryForm.get('milkType')?.value;
    if (initialType) {
      this.switchConfigSubscription(initialType);
    }

    // Recalculate when fat changes (uses cached currentConfig)
    this.entryForm.get('fat')?.valueChanges.subscribe(() => this.calculateRate());

    this.farmerCodeControl.valueChanges.subscribe(code => {
      this.onFarmerCodeChange(code);
    });
  }

  switchConfigSubscription(type: 'cow' | 'buffalo') {
    if (this.configSubscription) {
      this.configSubscription.unsubscribe();
    }

    if (!type) return;

    this.configSubscription = this.settingsService.getRateConfig(type).subscribe(config => {
      this.currentConfig = config;
      this.calculateRate(); // Recalculate immediately when config updates (Real-time!)
    });
  }

  calculateRate() {
    const fat = this.entryForm.get('fat')?.value;
    const config = this.currentConfig;

    if (fat == null || !config) return;

    let rate = 0;
    if (fat <= config.minFat) {
      rate = config.minPrice;
    } else if (fat >= config.maxFat) {
      rate = config.maxPrice;
    } else {
      // Linear Interpolation
      const fatRange = config.maxFat - config.minFat;
      const priceRange = config.maxPrice - config.minPrice;
      const fatFraction = (fat - config.minFat) / fatRange;
      rate = config.minPrice + (fatFraction * priceRange);
    }

    // Round to 2 decimal places
    rate = Math.round(rate * 100) / 100;
    this.entryForm.get('rate')?.setValue(rate);
  }

  onFarmerCodeChange(code: string | null) {
    if (!code) {
      this.selectedFarmer = null;
      this.entryForm.patchValue({ farmerId: '' });
      return;
    }

    const farmer = this.farmers.find(f => f.farmerCode === code);
    if (farmer) {
      this.selectedFarmer = farmer;
      this.entryForm.patchValue({ farmerId: farmer.id });
    } else {
      this.selectedFarmer = null;
      this.entryForm.patchValue({ farmerId: '' });
    }
  }

  onMilkTypeEnter(select: any, nextField: any) {
    if (!select.panelOpen) {
      nextField.focus();
    }
  }

  onFarmerCodeEnter(nextField: any) {
    if (this.selectedFarmer) {
      nextField.focus();
    } else {
      this.snackBar.open('Invalid Farmer Code. Please enter a valid code.', 'Close', { duration: 2000 });
    }
  }

  calculateTotal() {
    const qty = this.entryForm.get('quantity')?.value || 0;
    const rate = this.entryForm.get('rate')?.value || 0;
    const total = qty * rate;
    this.entryForm.get('totalAmount')?.setValue(total, { emitEvent: false });
  }

  onSubmit() {
    if (this.entryForm.valid) {
      const selectedFarmer = this.farmers.find(f => f.id === this.entryForm.value.farmerId);

      const record: MilkRecord = {
        ...this.entryForm.getRawValue(), // getRawValue to include disabled fields
        farmerName: selectedFarmer ? `${selectedFarmer.firstName} ${selectedFarmer.lastName}` : 'Unknown'
      };

      this.collectionService.addRecord(record).then(() => {
        this.snackBar.open('Milk entry saved successfully!', 'Close', { duration: 3000 });
        this.resetForm();
      }).catch(err => {
        console.error('Error saving milk entry:', err);
        this.snackBar.open('Error saving entry.', 'Close', { duration: 3000 });
      });
    }
  }

  resetForm() {
    this.entryForm.reset({
      shift: (new Date().getHours() < 14) ? 'AM' : 'PM',
      milkType: 'cow',
      fat: 0,
      quantity: 0,
      rate: 0,
      totalAmount: 0,
      date: new Date()
    });
    this.farmerCodeControl.reset();
    this.selectedFarmer = null;
    this.milkTypeSelect.focus();
  }
}

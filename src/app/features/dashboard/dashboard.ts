import { Component, OnInit, inject } from '@angular/core';
import { MaterialModule } from '../../shared/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FarmerService } from '../../services/farmer.service';
import { CollectionService } from '../../services/collection.service';
import { Farmer } from '../../models/farmer.model';
import { MilkRecord } from '../../models/milk-record.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private farmerService = inject(FarmerService);
  private collectionService = inject(CollectionService);
  selectedDate: Date = new Date();

  activeFarmersCount = 0;
  todayMilkTotal = 0;

  // New specific stats
  cowMilkQuantity = 0;
  cowFarmerCount = 0;
  buffaloMilkQuantity = 0;
  buffaloFarmerCount = 0;

  todayRecords: MilkRecord[] = [];
  filteredRecords: MilkRecord[] = [];
  farmersMap = new Map<string, Farmer>();
  selectedMilkType: string = 'All';
  selectedShift: string = 'All';

  displayedColumns: string[] = ['code', 'name', 'fat', 'quantity', 'amount'];

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.farmerService.getFarmers().subscribe(farmers => {
      this.farmersMap.clear();
      farmers.forEach(f => this.farmersMap.set(f.id!, f));
      this.fetchRecords();
    });
  }

  onDateChange(event: any) {
    this.selectedDate = event.value;
    this.fetchRecords();
  }

  private fetchRecords() {
    this.collectionService.getRecordsByDate(this.selectedDate).subscribe(records => {
      this.todayRecords = records;
      this.applyFilter();
      this.calculateTotals();
    });
  }

  private calculateTotals() {
      // Calculate Total Milk
      this.todayMilkTotal = this.todayRecords.reduce((sum, r) => sum + r.quantity, 0);

      const uniqueFarmers = new Set(this.todayRecords.map(r => r.farmerId));
      this.activeFarmersCount = uniqueFarmers.size;

      // Cow Stats
      const cowRecords = this.todayRecords.filter(r => r.milkType === 'cow');
      this.cowMilkQuantity = cowRecords.reduce((sum, r) => sum + r.quantity, 0);
      this.cowFarmerCount = new Set(cowRecords.map(r => r.farmerId)).size;

      // Buffalo Stats
      const buffaloRecords = this.todayRecords.filter(r => r.milkType === 'buffalo');
      this.buffaloMilkQuantity = buffaloRecords.reduce((sum, r) => sum + r.quantity, 0);
      this.buffaloFarmerCount = new Set(buffaloRecords.map(r => r.farmerId)).size;
  }

  applyFilter() {
    this.filteredRecords = this.todayRecords.filter(r => {
      const matchMilk = this.selectedMilkType === 'All' || r.milkType?.toLowerCase() === this.selectedMilkType.toLowerCase();
      const matchShift = this.selectedShift === 'All' || r.shift === this.selectedShift;
      return matchMilk && matchShift;
    });
  }

  // Helper to get Farmer Code from ID
  getFarmerCode(farmerId: string): string {
    return this.farmersMap.get(farmerId)?.farmerCode || 'N/A';
  }
}

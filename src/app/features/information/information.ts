import { Component, OnInit, inject } from '@angular/core';
import { combineLatest } from 'rxjs';
import { MaterialModule } from '../../shared/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';

import { NoticeComponent } from '../notice/notice.component';

@Component({
  selector: 'app-information',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule, NoticeComponent],
  templateUrl: './information.html',
  styleUrl: './information.css',
})
export class Information implements OnInit {
  rateChartData: any[] = [];
  displayedRateColumns: string[] = ['fat', 'cowPrice'];
  selectedRateType: string = 'Cow';

  cowRateConfig: any;
  buffaloRateConfig: any;

  private settingsService = inject(SettingsService);

  ngOnInit() {
    this.loadRateChart();
  }

  isRateListVisible: boolean = false;

  toggleRateList() {
    this.isRateListVisible = !this.isRateListVisible;
  }


  updateRateColumns() {
    this.generateRateChart(); // Regenerate data based on selection

    if (this.selectedRateType === 'Cow') {
      this.displayedRateColumns = ['fat', 'cowPrice'];
    } else if (this.selectedRateType === 'Buffalo') {
      this.displayedRateColumns = ['fat', 'buffaloPrice'];
    }
  }

  private loadRateChart() {
    const cowConfig$ = this.settingsService.getRateConfig('cow');
    const buffaloConfig$ = this.settingsService.getRateConfig('buffalo');

    combineLatest([cowConfig$, buffaloConfig$]).subscribe(([cow, buffalo]) => {
      // Use DB value or Default
      this.cowRateConfig = cow || { minFat: 3.0, maxFat: 5.0, minPrice: 30, maxPrice: 40, type: 'cow' };
      this.buffaloRateConfig = buffalo || { minFat: 5.0, maxFat: 10.0, minPrice: 40, maxPrice: 60, type: 'buffalo' };
      this.generateRateChart();
    });
  }

  private generateRateChart() {
    this.rateChartData = [];

    // Choose config based on selection
    let config = this.selectedRateType === 'Cow' ? this.cowRateConfig : this.buffaloRateConfig;

    if (!config) return;

    let minFat = config.minFat;
    let maxFat = config.maxFat;

    // Safety defaults if config is weird
    if (minFat === undefined || minFat === null) minFat = 3.0;
    if (maxFat === undefined || maxFat === null) maxFat = 10.0;

    // Iterate with 0.1 step within the SPECIFIC range of the selected type
    for (let f = minFat; f <= maxFat + 0.01; f += 0.1) {
      const currentFat = Math.round(f * 10) / 10;

      let price = this.calculatePrice(currentFat, config);

      // Build row object based on type
      let row: any = { fat: currentFat.toFixed(1) };
      if (this.selectedRateType === 'Cow') {
        row.cowPrice = price.toFixed(2);
      } else {
        row.buffaloPrice = price.toFixed(2);
      }

      this.rateChartData.push(row);
    }
  }

  private calculatePrice(fat: number, config: any): number {
    if (config.maxFat === config.minFat) return config.minPrice;
    const ratePerUnitFat = (config.maxPrice - config.minPrice) / (config.maxFat - config.minFat);
    return config.minPrice + ((fat - config.minFat) * ratePerUnitFat);
  }
}

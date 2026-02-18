import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, setDoc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { RateConfig } from '../models/rate-config.model';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private firestore: Firestore = inject(Firestore);

    getRateConfig(type: 'cow' | 'buffalo'): Observable<RateConfig | undefined> {
        const docRef = doc(this.firestore, 'rateConfigs', type);
        return docData(docRef) as Observable<RateConfig | undefined>;
    }

    saveRateConfig(config: RateConfig): Promise<void> {
        const docRef = doc(this.firestore, 'rateConfigs', config.type);
        return setDoc(docRef, config);
    }
}

import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, where, Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { MilkRecord } from '../models/milk-record.model';

@Injectable({
    providedIn: 'root'
})
export class CollectionService {
    private firestore: Firestore = inject(Firestore);
    private recordsCollection = collection(this.firestore, 'milk_records');

    addRecord(record: MilkRecord) {
        return addDoc(this.recordsCollection, record);
    }

    getRecordsByDate(date: Date): Observable<MilkRecord[]> {
        // Basic query example, requires indexing usually
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        const q = query(
            this.recordsCollection,
            where('date', '>=', Timestamp.fromDate(start)),
            where('date', '<=', Timestamp.fromDate(end))
        );
        return collectionData(q, { idField: 'id' }) as Observable<MilkRecord[]>;
    }
}

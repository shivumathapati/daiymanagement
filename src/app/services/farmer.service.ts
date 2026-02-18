import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Farmer } from '../models/farmer.model';

@Injectable({
    providedIn: 'root'
})
export class FarmerService {
    private firestore: Firestore = inject(Firestore);
    private farmersCollection = collection(this.firestore, 'farmers');

    getFarmers(): Observable<Farmer[]> {
        return collectionData(this.farmersCollection, { idField: 'id' }) as Observable<Farmer[]>;
    }

    addFarmer(farmer: Farmer) {
        return addDoc(this.farmersCollection, farmer);
    }

    updateFarmer(id: string, data: Partial<Farmer>) {
        const docRef = doc(this.firestore, 'farmers', id);
        return updateDoc(docRef, data);
    }

    deleteFarmer(id: string) {
        const docRef = doc(this.firestore, 'farmers', id);
        return deleteDoc(docRef);
    }
}

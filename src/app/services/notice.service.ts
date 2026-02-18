import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, orderBy, deleteDoc, doc, Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Notice {
  id?: string;
  message: string;
  date: any; // Can be Timestamp or Date
  createdAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NoticeService {
  private firestore: Firestore = inject(Firestore);
  private noticeCollection = collection(this.firestore, 'notices');

  getNotices(): Observable<Notice[]> {
    const q = query(this.noticeCollection, orderBy('date', 'desc'));
    return collectionData(q, { idField: 'id' }).pipe(
      map(actions => actions.map(a => {
        const data = a as any;
        // Convert Timestamp to Date if needed
        return {
          ...data,
          date: data.date?.toDate ? data.date.toDate() : data.date
        };
      }))
    );
  }

  addNotice(message: string, date: Date) {
    const notice: Notice = {
      message,
      date: Timestamp.fromDate(date),
      createdAt: Timestamp.now()
    };
    return addDoc(this.noticeCollection, notice);
  }

  deleteNotice(id: string) {
    const docRef = doc(this.firestore, 'notices', id);
    return deleteDoc(docRef);
  }
}

import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, updateDoc, collection, collectionData, query, where } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore: Firestore = inject(Firestore);
  private usersCollection = collection(this.firestore, 'users');

  /**
   * Get a user's profile from Firestore
   */
  getUserProfile(uid: string): Observable<User | null> {
    const userDocRef = doc(this.firestore, 'users', uid);
    return from(getDoc(userDocRef)).pipe(
      map(snapshot => snapshot.exists() ? snapshot.data() as User : null)
    );
  }

  /**
   * Create or overwrite a user profile in Firestore
   */
  async saveUserProfile(user: User): Promise<void> {
    const userDocRef = doc(this.firestore, 'users', user.uid);
    return setDoc(userDocRef, { 
      ...user, 
      isActive: user.isActive ?? true,
      lastUpdate: new Date()
    });
  }

  /**
   * Update specific user fields
   */
  async updateUser(uid: string, data: Partial<User>): Promise<void> {
    const userDocRef = doc(this.firestore, 'users', uid);
    return updateDoc(userDocRef, data);
  }

  /**
   * List all users (restricted to Admin in real scenarios)
   */
  getAllUsers(): Observable<User[]> {
    return collectionData(this.usersCollection, { idField: 'uid' }) as Observable<User[]>;
  }

  /**
   * Check if a user exists in Firestore
   */
  async userExists(uid: string): Promise<boolean> {
    const userDocRef = doc(this.firestore, 'users', uid);
    const docSnap = await getDoc(userDocRef);
    return docSnap.exists();
  }
}

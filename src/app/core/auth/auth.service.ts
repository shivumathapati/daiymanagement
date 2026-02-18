import { Injectable, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, docData } from '@angular/fire/firestore';
import { Observable, of, switchMap, map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth: Auth = inject(Auth);
    private firestore: Firestore = inject(Firestore);
    user$: Observable<User | null> = user(this.auth);
    userProfile$: Observable<any> = this.user$.pipe(
        switchMap(user => {
            if (user) {
                return docData(doc(this.firestore, 'users', user.uid));
            }
            return of(null);
        })
    );

    // Global variable accessible easily
    userProfile = toSignal(this.userProfile$);
    isAdmin = computed(() => this.userProfile()?.role === 'admin');
    isoperator = computed(() => this.userProfile()?.role === 'operator');
    isfarmer = computed(() => this.userProfile()?.role === 'farmer');


    constructor() { }

    login(email: string, pass: string) {
        return signInWithEmailAndPassword(this.auth, email, pass);
    }

    async signup(email: string, pass: string, role: string) {
        const userCredential = await createUserWithEmailAndPassword(this.auth, email, pass);
        const user = userCredential.user;
        await setDoc(doc(this.firestore, 'users', user.uid), {
            uid: user.uid,
            email: email,
            role: role,
            createdAt: new Date()
        });
        return userCredential;
    }

    logout() {
        return signOut(this.auth);
    }
}

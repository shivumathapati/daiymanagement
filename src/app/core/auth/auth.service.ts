import { Injectable, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, User } from '@angular/fire/auth';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';
import { Observable, of, switchMap, map, shareReplay } from 'rxjs';
import { User as UserProfile } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth: Auth = inject(Auth);
    private userService: UserService = inject(UserService);
    user$: Observable<User | null> = user(this.auth);

    // Profile sync with Firestore
    userProfile$: Observable<UserProfile | null> = this.user$.pipe(
        switchMap(user => {
            if (user) {
                return this.userService.getUserProfile(user.uid);
            }
            return of(null);
        }),
        shareReplay(1) // Avoid multiple requests
    );

    // Global signals for easier reactive updates
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

        // Initialize User Model properly
        const newUser: UserProfile = {
            uid: user.uid,
            email: email,
            role: role as any,
            isActive: true,
            createdAt: new Date(),
            displayName: user.displayName || email.split('@')[0],
        };

        // This ensures the "table" (document) is created immediately
        await this.userService.saveUserProfile(newUser);
        return userCredential;
    }

    logout() {
        return signOut(this.auth);
    }
}

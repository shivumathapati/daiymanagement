export interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    role: 'admin' | 'operator' | 'farmer';
    phoneNumber?: string;
    isActive: boolean;
    createdAt: any; // Firebase Timestamp or Date
    lastLogin?: any;
}

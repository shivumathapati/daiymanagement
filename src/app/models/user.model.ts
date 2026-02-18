export interface User {
    uid: string;
    email: string;
    displayName?: string;
    role: 'admin' | 'operator' | 'farmer';
}

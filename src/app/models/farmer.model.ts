export interface Farmer {
    id?: string;
    farmerCode?: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    gender: 'Male' | 'Female' | 'Other';
    village?: string;
    aadharNumber: string;
    bankAccountNumber: string;
    secondaryBankAccountNumber?: string;
    isActive: boolean;
    joinedDate: Date;
}

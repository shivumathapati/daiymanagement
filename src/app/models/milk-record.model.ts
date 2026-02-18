export interface MilkRecord {
    id?: string;
    farmerId: string;
    farmerName: string;
    milkType?: 'cow' | 'buffalo';
    date: Date;
    shift: 'AM' | 'PM';
    fat: number;
    snf?: number;
    quantity: number;
    rate: number;
    totalAmount: number;
}

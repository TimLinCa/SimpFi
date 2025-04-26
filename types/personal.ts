import { Category } from "./interface";

type TransactionType = 'income' | 'expense';

export interface Transaction {
    id: string;
    title: string
    type: TransactionType;
    category: Category;
    amount: number;
    date: Date;
    description: string;
    created_at?: string;
}


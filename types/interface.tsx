// Type definitions
import { Member } from "@/types/group"
export interface Category {
    id: string;
    name: string;
    icon_name: string;
}

export interface Profile {
    id: string;
    userName: string;
    avatarURL: string;
}

export interface PersonalExpense {
    id: string;
    userId: string;
    title: string;
    description?: string;
    date: Date;
    total_amount?: number;
    category: Category;
    created_at?: string;
    items?: ExpenseItem[];
}

export interface ExpenseItem {
    id: string
    name: string;
    amount: number;
    category: Category;
    MemberForExpenses?: MemberForExpense[];
}

export interface PersonalIncome {
    id: string;
    userId: string;
    title: string;
    description?: string;
    date: Date;
    amount: number;
    category: Category;
    created_at?: string;
}

export interface MemberForExpense extends Member {
    selected: boolean | null;
    percentage: number;
    amount?: number;
}


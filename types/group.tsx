import { ExpenseItem } from '@/types/interface'
export interface Member {
    id: string;
    name: string;
    email: string;
    avatar: string;
}

export interface GroupExpense {
    id: string;
    group: Group;
    title: string;
    amount: number;
    date: Date;
    paidBy: Member;
    note?: string,
    participantsNumber: number;
}

export interface GroupDetailExpense extends GroupExpense {
    participants: Member[];
    userSplit: GroupExpenseItemUserSplit[];
}

export interface GroupExpenseItemUserSplit extends ExpenseItem {
    userPayment: number;
    percentage: number;
}

export interface Group {
    id: string;
    name: string;
    iconName: string;
    iconColor: string;
}

export interface GroupMembers extends Group {
    members: Member[];
}

export interface TransactionData {
    id: string;
    group: Group;
    amount: number;
    paidBy: Member;
    paidTo: Member;
    date: Date;
    note: string;
}

export interface GroupDetail {
    group: Group;
    membersWithBalance: MemberWithBalance[];
    Expenses: GroupExpense[];
    transactions: TransactionData[];
}

export interface MemberWithBalance extends Member {
    balance: number;
}
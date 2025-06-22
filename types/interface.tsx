// Type definitions
import { Member } from "@/types/group";
export interface Category {
  id: string;
  name: string;
  icon_name: string;
  icon_color: string | null;
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
  id: string;
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

export interface ScanReceiptResult {
  total: number;
  store_name: string;
  time: string;
  items: ReceiptItem[];
}

export interface ReceiptItem {
  item_value: number;
  item_name: string;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  personal_expense: number;
  group_expense_share: number;
  total_expense: number;
  net_cashflow: number;
}

export interface CategoryBreakdown {
  month: Date;
  category: Category;
  amount: number;
  percentage: number;
  is_group: boolean;
  group_id?: string;
}

export interface AnalyticsSummary {
  avg_monthly_income: number;
  avg_monthly_expense: number;
  avg_monthly_net: number;
  current_month_income: number;
  current_month_expense: number;
  savings_rate: number;
  total_others_owe: number;
  total_you_owe: number;
}

export interface MonthlyGraphData {
  month: string;
  index: number;
  income: number;
  expense: number;
  net: number;
}

export interface ChartData {
  value: number;
  label: string;
}

export interface CategorySuggestion {
  category_id: string;
  category_name: string;
  confidence_score: number;
  matched_keyword: string;
}
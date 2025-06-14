import { supabase } from "@/utils/supabase";
import { MonthlyTrend, CategoryBreakdown, Category } from "@/types/interface";
import { Transaction } from "@/types/personal";

export const getMonthlyTrend = async (
  userId: string,
  monthPeriod: number
): Promise<MonthlyTrend[]> => {
  const response = await supabase.rpc("get_monthly_trends", {
    p_user_id: userId,
    p_months: monthPeriod,
  });
  return response.data as MonthlyTrend[];
};

export const getMonthlyCategoryBreakDown = async (
  userId: string,
  period: number,
  type: string
): Promise<CategoryBreakdown[]> => {

  const response = await supabase.rpc("get_category_breakdown", {
    p_user_id: userId,
    p_period: period,
    p_type: type,
  });

  if (response.error) {
    console.error("Error fetching monthly category breakdown:", response.error);
    throw new Error(response.error.message);
  }

  // Ensure the response data is in the expected format
  if (!response.data || !Array.isArray(response.data)) {
    console.error("Unexpected response format for monthly category breakdown");
    throw new Error("Unexpected response format");
  }

  const categoryBreakDown = response.data.map((item: any) => {
    // Ensure each item has the expected structure
    return {
      month: item.month ? new Date(item.month) : null,
      category: {
        id: 'Id' + Math.random() * 1000,
        name: item.category,
        icon_name: item.category_icon,
        icon_color: item.category_icon_color || "#000000",
      },
      amount: item.category_amount,
      percentage: item.percentage,
      is_group: item.is_group,
      group_id: item.group_id
    }
  }) as CategoryBreakdown[];
  return categoryBreakDown;
};

export const getCategoryTransactionsByName = async (
  userId: string,
  categoryName: string,
  year: number,
  month: number,
  transactionType: string
): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase.rpc('get_category_transactions_by_name_formatted', {
      p_user_id: userId,
      p_category_name: categoryName,
      p_year: year,
      p_month: month,
      p_transaction_type: transactionType
    });

    if (error) {
      console.error('Error fetching category transactions:', error);
      throw error;
    }

    // Transform the data to match your Transaction interface
    const transactions: Transaction[] = (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      type: item.type as 'income' | 'expense',
      category: {
        id: item.category_id,
        name: item.category_name,
        icon_name: item.category_icon_name,
        icon_color: item.category_icon_color
      } as Category,
      amount: parseFloat(item.amount),
      date: new Date(item.date),
      description: item.description || '',
      created_at: item.created_at
    }));

    return transactions;
  } catch (error) {
    console.error('Error in getCategoryTransactionsByName:', error);
    throw error;
  }
};

export const getGroupCategoryBreakdown = async (
  userId: string,
  groupId: string,
  year: number,
  month: number
): Promise<CategoryBreakdown[]> => {
  try {
    const { data, error } = await supabase.rpc('get_group_category_breakdown', {
      p_user_id: userId,
      p_group_id: groupId,
      p_year: year,
      p_month: month
    });

    if (error) {
      console.error('Error fetching group category breakdown:', error);
      throw error;
    }

    // Transform the JSONB result to CategoryBreakdown array
    const breakdown: CategoryBreakdown[] = (data || []).map((item: any) => ({
      month: new Date(item.month + '-01'), // Convert YYYY-MM to Date
      category: {
        id: item.category_id,
        name: item.category,
        icon_name: item.category_icon,
        icon_color: item.category_icon_color
      },
      amount: parseFloat(item.category_amount),
      percentage: parseFloat(item.percentage),
      is_group: item.is_group,
      group_id: item.group_id
    }));

    return breakdown;
  } catch (error) {
    console.error('Error in getGroupCategoryBreakdown:', error);
    throw error;
  }
};

export const getGroupCategoryTransactions = async (
  userId: string,
  groupId: string,
  categoryName: string,
  year: number,
  month: number
): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase.rpc('get_group_category_transactions', {
      p_user_id: userId,
      p_group_id: groupId,
      p_category_name: categoryName,
      p_year: year,
      p_month: month
    });

    if (error) {
      console.error('Error fetching group category transactions:', error);
      throw error;
    }

    // Transform the data to match your Transaction interface
    const transactions: Transaction[] = (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      type: item.type as 'expense',
      category: {
        id: item.category_id,
        name: item.category_name,
        icon_name: item.category_icon_name,
        icon_color: item.category_icon_color
      },
      amount: parseFloat(item.amount),
      date: new Date(item.date),
      description: item.description || '',
      created_at: item.created_at
    }));

    return transactions;
  } catch (error) {
    console.error('Error in getGroupCategoryTransactions:', error);
    throw error;
  }
};


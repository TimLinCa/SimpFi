import { supabase } from "@/utils/supabase";
import { MonthlyTrend, CategoryBreakdown, Category } from "@/types/interface";

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
    }
  }) as CategoryBreakdown[];
  return categoryBreakDown;
};
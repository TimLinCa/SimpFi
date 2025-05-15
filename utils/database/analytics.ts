import { supabase } from "@/utils/supabase";
import { MonthlyTrend } from "@/types/interface";

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

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/app/context/auth";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Dimensions } from "react-native";
import { supabase } from "@/utils/supabase";
import MenuButton from "@/components/ui/home/MenuButton";
import { Circle, DashPathEffect, useFont } from "@shopify/react-native-skia";
import { Inter_500Medium } from "@expo-google-fonts/inter";
import { useAnimatedProps, useDerivedValue, useSharedValue } from "react-native-reanimated";
import { getMonthlyTrend } from "@/utils/database";
import { MonthlyGraphData } from "@/types/interface";
import { TrendBarChart } from "@/components/ui/graph";

const screenWidth = Dimensions.get("window").width;

interface MonthlyTrend {
  month: string;
  income: number;
  personal_expense: number;
  group_expense_share: number;
  total_expense: number;
  net_cashflow: number;
}

interface CategoryBreakdown {
  category: string;
  icon: string;
  amount: number;
  percentage: number;
}

interface AnalyticsSummary {
  avg_monthly_income: number;
  avg_monthly_expense: number;
  avg_monthly_net: number;
  current_month_income: number;
  current_month_expense: number;
  savings_rate: number;
  total_others_owe: number;
  total_you_owe: number;
}

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<number>(6); // months
  const [activeTab, setActiveTab] = useState<"overview" | "income" | "expense">(
    "overview"
  );
  const font = useFont(Inter_500Medium, 12);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Query for monthly trends
  const {
    data: monthlyGraphData,
    isLoading: loadingTrends,
    refetch: refetchTrends,
  } = useQuery({
    queryKey: ["monthlyTrends", user?.id, selectedPeriod],
    queryFn: getMonthlyData,
    enabled: !!user?.id,
  });

  // Query for analytics summary
  const {
    data: summary,
    isLoading: loadingSummary,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["analyticsSummary", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const response = await supabase.rpc("get_analytics_summary", {
        p_user_id: user.id,
        p_months: 3,
      });
      return response.data as AnalyticsSummary;
    },
    enabled: !!user?.id,
  });

  // Query for category breakdown
  const {
    data: categoryBreakdown,
    isLoading: loadingCategories,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["categoryBreakdown", user?.id, activeTab],
    queryFn: async () => {
      if (!user || activeTab === "overview") return [];
      const response = await supabase.rpc("get_category_breakdown", {
        p_user_id: user.id,
        p_type: activeTab === "income" ? "income" : "expense",
      });
      return response.data as CategoryBreakdown[];
    },
    enabled: !!user?.id && activeTab !== "overview",
  });

  // Query for spending patterns
  const { data: spendingPatterns, isLoading: loadingPatterns } = useQuery({
    queryKey: ["spendingPatterns", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const response = await supabase.rpc("get_spending_patterns", {
        p_user_id: user.id,
        p_days: 30,
      });
      return response.data;
    },
    enabled: !!user?.id && activeTab === "expense",
  });

  // Query for group analytics
  const { data: groupAnalytics, isLoading: loadingGroups } = useQuery({
    queryKey: ["groupAnalytics", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const response = await supabase.rpc("get_group_analytics", {
        p_user_id: user.id,
        p_days: 30,
      });
      return response.data;
    },
    enabled: !!user?.id && activeTab === "overview",
  });

  async function getMonthlyData() {
    if (!user?.id) return;
    const monthlyTrend = await getMonthlyTrend(user.id, 6);
    return monthlyTrend.map((trend, index) => ({
      month: trend.month.substring(0, 3),
      index,
      income: trend.income,
      expense: trend.total_expense,
      net: trend.net_cashflow,
    }));
  }

  const isLoading =
    loadingTrends ||
    loadingSummary ||
    loadingCategories ||
    loadingPatterns ||
    loadingGroups;

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const renderSummaryCard = (
    title: string,
    amount: number,
    icon: string,
    color: string
  ) => (
    <View className="bg-white rounded-xl p-4 flex-1 mx-1 mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <MaterialCommunityIcons name={icon} size={24} color={color} />
        <Text className="text-sm text-gray-500">{title}</Text>
      </View>
      <Text className={`text-xl font-bold`} style={{ color }}>
        {formatCurrency(amount)}
      </Text>
    </View>
  );

  const [selectedChart, setSelectedChart] = useState<
    "income" | "expense" | "net" | null
  >(null);

  const renderCharts = () => {
    if (!monthlyGraphData || monthlyGraphData.length === 0) return null;

    // Prepare data for the charts
    const incomeData = monthlyGraphData.map((trend) => ({
      label: trend.month,
      value: trend.income,
    }));

    const expenseData = monthlyGraphData.map((trend) => ({
      month: trend.month,
      value: trend.expense,
    }));

    const netData = monthlyGraphData.map((trend) => ({
      month: trend.month,
      value: trend.net,
    }));
    // Calculate change from previous month
    const getChange = (current: number, previous: number | undefined) => {
      if (previous === undefined) return "N/A";
      const change = current - previous;
      return change >= 0
        ? `+$${change.toFixed(2)}`
        : `-$${Math.abs(change).toFixed(2)}`;
    };

    return (
      <View className="bg-white rounded-xl p-4 mb-4">
        <Text className="text-lg font-semibold mb-3">Monthly Trends</Text>

        {/* Income Chart */}
        <View className="mb-6">
          <TrendBarChart chartData={incomeData} chartProps={{
            unSelectedBarColor: "#43BFF499",
            selectedBarColor: "#43BFF4"
          }}
            setSelectedMonth={setSelectedMonth} />
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <StatusBar style="auto" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-gray-600 mt-4">Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header with back button, title and buttons */}
      <View className="bg-[#43BFF4] pt-2 pb-2 flex-row items-center px-4 shadow-sm">
        <View className="w-1/3 justify-start">
          <MenuButton />
        </View>

        <View className="w-1/3 items-center justify-center">
          <Text className="text-lg font-bold text-white">Analytics</Text>
        </View>

        <View className="flex-row items-center w-1/3 justify-end">
          <TouchableOpacity className="w-10 h-10 justify-center items-center">
            <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 justify-center items-center">
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex-row bg-white px-4 py-2 border-b border-gray-200">
        {["overview", "income", "expense"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab as typeof activeTab)}
            className={`flex-1 py-2 ${activeTab === tab ? "border-b-2 border-blue-500" : ""
              }`}
          >
            <Text
              className={`text-center capitalize ${activeTab === tab
                ? "text-blue-500 font-semibold"
                : "text-gray-500"
                }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              refetchTrends();
              refetchSummary();
              refetchCategories();
            }}
          />
        }
      >
        <View className="p-4">
          {/* Summary Cards */}
          {activeTab === "overview" && summary && (
            <>
              <View className="flex-row flex-wrap mb-4">
                {renderSummaryCard(
                  "Avg Monthly Income",
                  summary.avg_monthly_income,
                  "trending-up",
                  "#22c55e"
                )}
                {renderSummaryCard(
                  "Avg Monthly Expense",
                  summary.avg_monthly_expense,
                  "trending-down",
                  "#ef4444"
                )}
              </View>
              <View className="flex-row flex-wrap mb-4">
                {renderSummaryCard(
                  "This Month Income",
                  summary.current_month_income,
                  "cash",
                  "#22c55e"
                )}
                {renderSummaryCard(
                  "This Month Expense",
                  summary.current_month_expense,
                  "cart",
                  "#ef4444"
                )}
              </View>
              <View className="flex-row flex-wrap mb-4">
                {renderSummaryCard(
                  "Savings Rate",
                  summary.savings_rate,
                  "percent",
                  "#3b82f6"
                )}
                {renderSummaryCard(
                  "Net Position",
                  summary.total_others_owe - summary.total_you_owe,
                  "wallet",
                  summary.total_others_owe - summary.total_you_owe >= 0
                    ? "#22c55e"
                    : "#ef4444"
                )}
              </View>
            </>
          )}

          {/* Charts */}
          {activeTab === "overview" && renderCharts()}
        </View>
      </ScrollView>
    </View>
  );
};

export default AnalyticsPage;

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
import { CartesianChart, Bar, Line, useChartPressState } from "victory-native";
import { Circle, DashPathEffect, useFont } from "@shopify/react-native-skia";
import { Inter_500Medium } from "@expo-google-fonts/inter";
import { useDerivedValue } from "react-native-reanimated";
import { getMonthlyTrend } from "@/utils/database";
import { MonthlyGraphData } from "@/types/interface";

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
  const [monthlyGraphData, setMonthlyGraphData] = useState<MonthlyGraphData[]>([]);
  // Query for monthly trends
  const {
    data: monthlyTrends,
    isLoading: loadingTrends,
    refetch: refetchTrends,
  } = useQuery({
    queryKey: ["monthlyTrends", user?.id, selectedPeriod],
    queryFn: async () => {
      if (!user) return [];
      // Call your SQL function
      const response = await supabase.rpc("get_monthly_trends", {
        p_user_id: user.id,
        p_months: selectedPeriod,
      });
      return response.data as MonthlyTrend[];
    },
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

  const { state, isActive } = useChartPressState({
    x: "",
    y: { income: 0 },
  });

  const selectedIncomeValue = useDerivedValue(() => {
    console.log("Selected Income Value:", state);
  }, [state]);

  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedChart, setSelectedChart] = useState<
    "income" | "expense" | "net" | null
  >(null);

  const handleChartPress = (event: any) => {
    console.log("Chart pressed:", event);
  };

  const renderCharts = () => {
    if (!monthlyTrends || monthlyTrends.length === 0) return null;

    // Prepare data for the charts
    const data = monthlyTrends.map((trend, index) => ({
      month: trend.month.substring(0, 3),
      monthFull: trend.month,
      index,
      income: trend.income,
      expense: trend.total_expense,
      net: trend.net_cashflow,
    }));

    console.log("Data for charts:", data);

    // Get the selected month data and previous month data for comparison
    const selectedData = selectedMonth !== null ? data[selectedMonth] : null;
    const previousMonthData =
      selectedMonth !== null && selectedMonth > 0
        ? data[selectedMonth - 1]
        : null;

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
          <Text className="text-sm font-medium text-gray-600 mb-1">Income</Text>
          <View style={{ height: 150 }}>
            <CartesianChart
              chartPressState={state}
              data={data}
              xKey="month"
              yKeys={["income"]}
              xAxis={{
                font,
                labelColor: "#000",
                lineWidth: 0,
                linePathEffect: <DashPathEffect intervals={[4, 4]} />,
              }}
              yAxis={[
                {
                  yKeys: ["income"],
                  font,
                  linePathEffect: <DashPathEffect intervals={[4, 4]} />,
                },
              ]}
            >
              {({ points, chartBounds }) => {
                // Add safety check
                if (!points || !points.income) {
                  return null;
                }

                return (
                  <>
                    {/* Clickable Income Bars */}
                    {points.income.map((point, index) => (
                      <>
                        <Bar
                          key={index}
                          points={[point]}
                          chartBounds={chartBounds}
                          color={
                            selectedMonth === index &&
                            selectedChart === "income"
                              ? "#15803d"
                              : "#22c55e"
                          }
                          barWidth={20}
                          roundedCorners={{ topLeft: 4, topRight: 4 }}
                        />
                        {isActive && handleChartPress(point)}
                      </>
                    ))}
                  </>
                );
              }}
            </CartesianChart>
          </View>
        </View>

        {/* Net Position Chart */}
        {/* <View className="mb-6">
          <Text className="text-sm font-medium text-gray-600 mb-1">
            Net Position
          </Text>
          <View style={{ height: 150 }}>
            <CartesianChart
              data={data}
              xKey="month"
              yKeys={["net"]}
              domainPadding={{ left: 20, right: 20, top: 20 }}
              axisOptions={{
                formatYLabel: (value) => `$${value.toFixed(0)}`,
              }}
            >
              {({ points, chartBounds }: any) => (
                <Line
                  points={points.net}
                  color="#3b82f6"
                  strokeWidth={3}
                  curveType="linear"
                />
              )}
            </CartesianChart>
          </View>
        </View> */}

        {/* Selected Data Details */}
        {selectedData && selectedChart && (
          <View className="bg-gray-100 p-4 rounded-lg mt-2">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-bold">
                {selectedData.monthFull} Total
              </Text>
              <Text className="text-2xl font-bold">
                $
                {selectedChart === "income"
                  ? selectedData.income.toFixed(2)
                  : selectedChart === "expense"
                  ? selectedData.expense.toFixed(2)
                  : selectedData.net.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">vs Previous Month</Text>
              <Text
                className={`text-lg font-medium ${
                  selectedChart === "income"
                    ? previousMonthData &&
                      selectedData.income > previousMonthData.income
                      ? "text-green-600"
                      : "text-red-600"
                    : selectedChart === "expense"
                    ? previousMonthData &&
                      selectedData.expense < previousMonthData.expense
                      ? "text-green-600"
                      : "text-red-600"
                    : previousMonthData &&
                      selectedData.net > previousMonthData.net
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {selectedChart === "income"
                  ? getChange(selectedData.income, previousMonthData?.income)
                  : selectedChart === "expense"
                  ? getChange(selectedData.expense, previousMonthData?.expense)
                  : getChange(selectedData.net, previousMonthData?.net)}
              </Text>
            </View>
          </View>
        )}
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
            className={`flex-1 py-2 ${
              activeTab === tab ? "border-b-2 border-blue-500" : ""
            }`}
          >
            <Text
              className={`text-center capitalize ${
                activeTab === tab
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

          {/* Period Selector */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm text-gray-600">Period</Text>
            <View className="flex-row">
              {[3, 6, 12].map((months) => (
                <TouchableOpacity
                  key={months}
                  onPress={() => setSelectedPeriod(months)}
                  className={`px-4 py-2 rounded-lg ml-2 ${
                    selectedPeriod === months ? "bg-blue-500" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`${
                      selectedPeriod === months ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {months}M
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Charts */}
          {activeTab === "overview" && renderCharts()}
        </View>
      </ScrollView>
    </View>
  );
};

const getMonthlyData = async (userId: string, monthPeriod: number) => {
  const monthlyTrend = await getMonthlyTrend(userId, monthPeriod);
  setMonthlyGraphData(
    monthlyTrend.map((trend, index) => ({
      month: trend.month.substring(0, 3),
      index,
      income: trend.income,
      expense: trend.total_expense,
      net: trend.net_cashflow,
    }))
  );
};

export default AnalyticsPage;

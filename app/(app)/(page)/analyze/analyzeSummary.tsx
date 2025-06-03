import { View, Text, SafeAreaView, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import SummaryCard from '@/components/ui/summary/summaryCard'
import { supabase } from '@/utils/supabase';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsSummary, ChartData } from '@/types/interface';
import { useAuth } from '@/app/context/auth';
import { StatusBar } from 'expo-status-bar';
import { getMonthlyTrend } from '@/utils/database';
import { TabSelector } from '@/components/ui/inputs';
import { TrendBarChart, TrendLineChart } from '@/components/ui/graph';
import { formatCurrency, formatMonthYear } from '@/utils/ui';

const AnalyzeSummaryPage = () => {
  const { user } = useAuth();
  const [incomeData, setIncomeData] = useState<ChartData[]>([]);
  const [expenseData, setExpenseData] = useState<ChartData[]>([]);
  const [netData, setNetData] = useState<ChartData[]>([]);
  const overViewTabs = ["Income", "Expense", "Balance"];
  const [selectedOverviewTab, setSelectedOverviewTab] = useState<string>("Income");
  const [selectedYearMonth, setSelectedYearMonth] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [diffPreviousValue, setDiffPreviousValue] = useState<string | null>(null);

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
        p_months: 6,
      });
      return response.data as AnalyticsSummary;
    },
    enabled: !!user?.id,
  });

  // Query for monthly trends
  const {
    data: monthlyGraphData,
    isLoading: loadingTrends,
    refetch: refetchTrends,
  } = useQuery({
    queryKey: ["monthlyTrends", user?.id],
    queryFn: getMonthlyData,
    enabled: !!user?.id,
  });

  const onSelectedOverviewTabChanged = (tab: string) => {
    setSelectedYearMonth(null);
    setSelectedValue(null);
    setDiffPreviousValue(null);
  }

  const onSelectedIndexChanged = (index: number | null) => {
    if (index === null || index < 0 || !monthlyGraphData) return;
    if (selectedOverviewTab === "Income") {
      const { month, income } = monthlyGraphData[index];
      console.log(month, income);
      setSelectedYearMonth(formatMonthYear(month));
      setSelectedValue(formatCurrency(income));
      if (index > 0) {
        const previousMonth = monthlyGraphData[index - 1];
        const diff = income - previousMonth.income;
        let compare = "";
        if (diff !== 0) {
          compare = diff > 0 ? "Inc" : "Dec";
        }
        setDiffPreviousValue(compare + " " + formatCurrency(Math.abs(diff)));
      }
    } else if (selectedOverviewTab === "Expense") {
      const { month, expense } = monthlyGraphData[index];
      console.log(month, expense);
      setSelectedYearMonth(formatMonthYear(month));
      setSelectedValue(formatCurrency(expense));
      if (index > 0) {
        const previousMonth = monthlyGraphData[index - 1];
        const diff = expense - previousMonth.expense;
        let compare = "";
        if (diff !== 0) {
          compare = diff > 0 ? "Inc" : "Dec";
        }
        setDiffPreviousValue(compare + " " + formatCurrency(Math.abs(diff)));
      }
    }
    else if (selectedOverviewTab === "Balance") {
      const { month, net } = monthlyGraphData[index];
      console.log(month, net);
      setSelectedYearMonth(formatMonthYear(month));
      setSelectedValue(formatCurrency(net));
      if (index > 0) {
        const previousMonth = monthlyGraphData[index - 1];
        const diff = net - previousMonth.net;
        let compare = "";
        if (diff !== 0) {
          compare = diff > 0 ? "Inc" : "Dec";
        }
        setDiffPreviousValue(compare + " " + formatCurrency(Math.abs(diff)));
      }
    }
  }

  const renderCharts = () => {
    if (!monthlyGraphData || monthlyGraphData.length === 0) return null;

    return (
      <View className="bg-white rounded-xl p-4 mb-4">
        <TabSelector tabs={overViewTabs} setActiveTab={setSelectedOverviewTab} activeTab={selectedOverviewTab} onActiveTabChange={onSelectedOverviewTabChanged} />
        <View className="flex-row justify-between mb-4 border-b mt-4 border-gray-100 pb-6">
          <View>
            <Text className="text-gray-500 mb-1">{selectedYearMonth} Total</Text>
            <Text className="text-3xl font-bold">{selectedValue}</Text>
          </View>
          <View className="border-l border-gray-200 pl-4">
            <Text className="text-gray-500 mb-1">vs. Previous Month</Text>
            <Text className="text-xl font-semibold">{diffPreviousValue}</Text>
          </View>
        </View>

        {/* Income Chart */}
        {
          selectedOverviewTab === "Income" && (
            <View className="mb-6">
              <TrendBarChart chartData={incomeData} chartProps={{
                unSelectedBarColor: "#43BFF499",
                selectedBarColor: "#43BFF4"
              }}
                onSelectedIndexChanged={onSelectedIndexChanged} />
            </View>
          )
        }

        {/* Expense Chart */}
        {
          selectedOverviewTab === "Expense" && (
            <View className="mb-6">
              <TrendBarChart chartData={expenseData} chartProps={{
                unSelectedBarColor: "#FF434399",
                selectedBarColor: "#FF4343"
              }}
                onSelectedIndexChanged={onSelectedIndexChanged} />
            </View>
          )
        }

        {
          selectedOverviewTab === "Balance" && (
            <View className="mb-6">
              <TrendLineChart
                chartData={netData}
                chartProps={{
                  LineColor: "#F5C45E",
                  DotColor: "#F5C45E",
                }}
                onSelectedIndexChanged={onSelectedIndexChanged} />
            </View>
          )
        }
      </View>
    );
  };

  if (loadingSummary) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-gray-600 mt-4">Loading Summary...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      {summary && (
        <View className="p-4">
          <View className="flex-row flex-wrap mb-4">
            <SummaryCard
              title="Avg Monthly Income"
              amount={summary.avg_monthly_income}
              icon="trending-up"
              color="#22c55e"
            />
            <SummaryCard
              title="Avg Monthly Expense"
              amount={summary.avg_monthly_expense}
              icon="trending-down"
              color="#ef4444"
            />
          </View>
          <View className="flex-row flex-wrap mb-4">
            <SummaryCard
              title="This Month Income"
              amount={summary.current_month_income}
              icon="cash"
              color="#22c55e"
            />
            <SummaryCard
              title="This Month Expense"
              amount={summary.current_month_expense}
              icon="cart"
              color="#ef4444"
            />
          </View>
          <View className="flex-row flex-wrap mb-4">
            <SummaryCard
              title="Savings Rate"
              amount={summary.savings_rate}
              icon="percent"
              color="#3b82f6"
            />
            <SummaryCard
              title="Net Position"
              amount={summary.total_others_owe - summary.total_you_owe}
              icon="wallet"
              color={
                summary.total_others_owe - summary.total_you_owe >= 0
                  ? "#22c55e"
                  : "#ef4444"
              }
            />
          </View>
          {renderCharts()}
        </View>
      )}
    </>
  )

  async function getMonthlyData() {
    if (!user?.id) return;
    const monthlyTrend = await getMonthlyTrend(user.id, 6);
    if (!monthlyTrend) return [];

    const incomeData = monthlyTrend.map((trend) => ({
      label: trend.month.substring(0, 3),
      value: trend.income,
    }));
    const expenseData = monthlyTrend.map((trend) => ({
      label: trend.month.substring(0, 3),
      value: trend.total_expense,
    }));
    const netData = monthlyTrend.map((trend) => ({
      label: trend.month.substring(0, 3),
      value: trend.net_cashflow,
    }));
    setIncomeData(incomeData);
    setExpenseData(expenseData);
    setNetData(netData);

    return monthlyTrend.map((trend, index) => ({
      month: trend.month,
      index,
      income: trend.income,
      expense: trend.total_expense,
      net: trend.net_cashflow,
    }));
  }
}

export default AnalyzeSummaryPage;
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/app/context/auth";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { supabase } from "@/utils/supabase";
import MenuButton from "@/components/ui/home/MenuButton";
import AnalyzeSummaryPage from "@/app/(app)/(page)/analyze/analyzeSummary";
import CategoryBreakDownPage from "@/app/(app)/(page)/analyze/categoryBreakDown";

const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "income" | "expense">(
    "overview"
  );

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const monthNames: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentMonth: string = monthNames[currentDate.getMonth()];
  const currentYear: number = currentDate.getFullYear();

  // Navigation functions
  const handlePreviousMonth = (): void => {
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentDate(prevMonth);
  };

  const handleNextMonth = (): void => {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentDate(nextMonth);
  };

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

      {/* Month Selector */}
      {(activeTab === "income" || activeTab === "expense") && (
        <View className="bg-white px-4 py-3 flex-row justify-between items-center border-b border-gray-200">
          <TouchableOpacity onPress={handlePreviousMonth}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color="#333"
            />
          </TouchableOpacity>

          <Text className="text-base font-medium text-gray-800">
            {currentMonth} {currentYear}
          </Text>

          <TouchableOpacity onPress={handleNextMonth}>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#333"
            />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        <View>
          {/* Summary Cards */}
          {activeTab === "overview" && (
            <AnalyzeSummaryPage></AnalyzeSummaryPage>
          )}

          {/* Income Charts */}
          {activeTab === "income" && (
            <CategoryBreakDownPage
              currentDate={currentDate}
              categoryType="income"
            />
          )}
          {activeTab === "expense" && (
            <CategoryBreakDownPage
              currentDate={currentDate}
              categoryType="expense"
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default AnalyticsPage;

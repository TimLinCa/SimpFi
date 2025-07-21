import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native";
import { ScrollView } from "react-native";
import { FinancialCard } from "@/components/ui/home/FinancialCard";
import { GroupListItem } from "@/components/ui/home/GroupListItem";
import { StatusBar } from "expo-status-bar";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@/app/context/auth";
import Header from "@/components/ui/home/Header";
import { GroupDetail } from "@/types/group";
import { useQuery } from "@tanstack/react-query";
import { getPersonalExpensesByMonth } from "@/utils/database/expense";
import { getPersonalIncomesByMonth } from "@/utils/database/income";
import { getAllGroupDetails } from "@/utils/database/group";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { registerForPushNotificationsAsync, sendPushNotification } from "@/utils/database/notification";
import { updateUserProfile } from "@/utils/database/account";

// Main App Component using the custom components

interface SummaryData {
  income: number;
  expense: number;
  ownMoney: number;
  othersOwe: number;
}

const MobileSummaryPage = () => {
  const router = useRouter();
  const auth = useAuth();
  const { user } = auth;
  const queryClient = useQueryClient();
  const [gorupDetailForShow, setGroupDetailForShow] = useState<GroupDetail[]>(
    []
  );

  const handleOwnPress = () => {
    if (groupDetails) {
      setGroupDetailForShow(
        groupDetails.filter(
          (gd) =>
            gd.membersWithBalance.reduce(
              (acc, member) => acc + member.balance,
              0
            ) < 0
        )
      );
    }
  };
  const handleOthersOwnPress = () => {
    if (groupDetails) {
      setGroupDetailForShow(
        groupDetails.filter(
          (gd) =>
            gd.membersWithBalance.reduce(
              (acc, member) => acc + member.balance,
              0
            ) > 0
        )
      );
    }
  };

  const handleAllPress = () => {
    if (groupDetails) {
      setGroupDetailForShow(groupDetails);
    }
  };

  const sendNotification = () => {
    if (!pushToken) {
      console.error("Push token is not available");
      return;
    }
    sendPushNotification(pushToken);
  };
  // Define the queries
  const {
    data: groupDetails,
    refetch: refetchGroupDetails,
    isLoading: loadingGroupDetails,
    isFetching: isFetchingGroupDetails,
  } = useQuery({
    queryKey: ["groupsDetails", user?.id],
    queryFn: fetchGroupDetails,
    enabled: !!user?.id,
  });

  const {
    data: summaryData,
    refetch: refetchSummaryData,
    isLoading: loadingSummaryData,
    isFetching: isFetchingSummaryData,
  } = useQuery({
    queryKey: ["summaryData", user?.id, groupDetails],
    queryFn: fetchSummaryData,
    enabled: !!user?.id && !!groupDetails,
  });

  const isFetching = isFetchingGroupDetails || isFetchingSummaryData;
  const [pushToken, setPushToken] = useState<string | null>(null);
  useEffect(() => {
    const registerForPushNotifications = async () => {
      console.log("Registering for push notifications...");
      const token = await registerForPushNotificationsAsync();
      if (token && user?.id) {
        setPushToken(token);
        // Update the user's profile with the push token
        await updateUserProfile(user.id, undefined, undefined, token);
      }
    };
    registerForPushNotifications();
  }, [user?.id]);

  // Use useFocusEffect to refresh data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // This function will run when the screen comes into focus
      const refreshData = async () => {
        if (user?.id) {
          try {
            // Force clear any cached data
            queryClient.invalidateQueries({ queryKey: ["groupsDetails"] });
            queryClient.invalidateQueries({ queryKey: ["summaryData"] });

            // Refetch both queries when screen is focused
            await refetchGroupDetails();
            await refetchSummaryData();
          } catch (error) {
            console.error("Error refreshing data:", error);
          } finally {
          }
        }
      };

      refreshData();
      // Return a cleanup function (optional)
      return () => {
        // Any cleanup code if needed
      };
    }, [user?.id, refetchGroupDetails, refetchSummaryData, queryClient])
  );

  // Loading state
  if (loadingGroupDetails || loadingSummaryData || isFetching) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <StatusBar style="auto" hidden={false} translucent={false} />
        <Header />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-gray-600 mt-4 text-lg font-medium">
            Loading your summary...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar style="auto" hidden={false} translucent={false} />
      <Header />
      {/* Main Content */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={loadingGroupDetails || loadingSummaryData}
            onRefresh={() => {
              refetchGroupDetails();
              refetchSummaryData();
            }}
          />
        }
      >
        {/* Summary Cards */}
        <View className="flex-row flex-wrap p-4">
          <FinancialCard
            title="Income"
            amount={summaryData?.income || 0}
            iconName="arrow-down"
            iconColor="#22c55e"
            iconBgColor="#e6f7ee"
            onPress={() => router.push("/(app)/personal")}
          />

          <FinancialCard
            title="Expense"
            amount={summaryData?.expense || 0}
            iconName="arrow-up"
            iconColor="#ef4444"
            iconBgColor="#fee2e2"
            onPress={() => router.push("/(app)/personal")}
          />

          <FinancialCard
            title="Own Money"
            amount={summaryData?.ownMoney || 0}
            iconName="wallet-outline"
            iconColor="#3b82f6"
            iconBgColor="#e0f2fe"
            onPress={handleOwnPress}
          />

          <FinancialCard
            title="Others Owe"
            amount={summaryData?.othersOwe || 0}
            iconName="credit-card-outline"
            iconColor="#9333ea"
            iconBgColor="#f3e8ff"
            onPress={handleOthersOwnPress}
          />
        </View>

        {/* Groups List */}
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              Your Groups
            </Text>
            {/* <TouchableOpacity onPress={sendNotification} className="px-3 py-1">
              <Text className="text-blue-500 font-medium">NotificationTest</Text>
            </TouchableOpacity> */}
            <TouchableOpacity onPress={handleAllPress} className="px-3 py-1">
              <Text className="text-blue-500 font-medium">See All</Text>
            </TouchableOpacity>
          </View>

          {/* Group List Items */}
          {gorupDetailForShow ? (
            gorupDetailForShow.map((groupDetail) => (
              <GroupListItem
                key={groupDetail.group.id}
                groupDetail={groupDetail}
              />
            ))
          ) : (
            <View />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  async function fetchSummaryData(): Promise<SummaryData> {
    if (user && groupDetails) {
      // Get fresh data directly from the database
      const personalExpenses = await getPersonalExpensesByMonth(
        user.id,
        new Date().getMonth() + 1,
        new Date().getFullYear()
      );
      const personalIncomes = await getPersonalIncomesByMonth(
        user.id,
        new Date().getMonth() + 1,
        new Date().getFullYear()
      );

      // Clear any calculated values for proper recalculation
      const refreshedGroupDetails = await getAllGroupDetails(user.id);

      // Calculate the summary values
      return {
        income: personalIncomes.reduce((acc, income) => acc + income.amount, 0),
        expense: personalExpenses.reduce(
          (acc, expense) =>
            acc + (expense.total_amount ? expense.total_amount : 0),
          0
        ),
        ownMoney: refreshedGroupDetails.reduce(
          (acc, group) =>
            acc +
            group.membersWithBalance.reduce(
              (memberAcc, member) =>
                memberAcc + (member.balance < 0 ? member.balance : 0),
              0
            ),
          0
        ),
        othersOwe: refreshedGroupDetails.reduce(
          (acc, group) =>
            acc +
            group.membersWithBalance.reduce(
              (memberAcc, member) =>
                memberAcc + (member.balance > 0 ? member.balance : 0),
              0
            ),
          0
        ),
      };
    } else {
      return {
        income: 0,
        expense: 0,
        ownMoney: 0,
        othersOwe: 0,
      };
    }
  }

  async function fetchGroupDetails(): Promise<GroupDetail[]> {
    if (user) {
      const groupDetails = await getAllGroupDetails(user.id);
      if (groupDetails) {
        setGroupDetailForShow(groupDetails);
      }
      return groupDetails;
    }
    console.error("User not found, returning empty group details");
    return [];
  }
};

export default MobileSummaryPage;
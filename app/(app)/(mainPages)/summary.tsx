import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native';
import { ScrollView } from 'react-native';
import { FinancialCard } from '@/components/ui/home/FinancialCard';
import { GroupListItem } from '@/components/ui/home/GroupListItem';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from "@/app/context/auth";
import Header from "@/components/ui/home/Header";
import { GroupDetail } from "@/types/group"
import { useQuery } from '@tanstack/react-query';
import { getPersonalExpensesByMonth } from '@/utils/database/expense';
import { getPersonalIncomesByMonth } from '@/utils/database/income';
import { getAllGroupDetails } from '@/utils/database/group';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Define the queries
    const {
        data: groupDetails,
        refetch: refetchGroupDetails,
        isLoading: loadingGroupDetails,
        isFetching: isFetchingGroupDetails
    } = useQuery({
        queryKey: ['groupsDetails', user?.id],
        queryFn: fetchGroupDetails,
        enabled: !!user?.id,
        staleTime: 0,
        refetchOnWindowFocus: true,
    });

    const {
        data: summaryData,
        refetch: refetchSummaryData,
        isLoading: loadingSummaryData,
        isFetching: isFetchingSummaryData
    } = useQuery({
        queryKey: ['summaryData', user?.id, groupDetails],
        queryFn: fetchSummaryData,
        enabled: !!user?.id && !!groupDetails,
        staleTime: 0,
        refetchOnWindowFocus: true,
    });

    const isFetching = isFetchingGroupDetails || isFetchingSummaryData;

    // Use useFocusEffect to refresh data when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            // This function will run when the screen comes into focus
            const refreshData = async () => {
                console.log('MobileSummaryPage focused - refreshing data');
                if (user?.id) {
                    try {
                        setIsRefreshing(true);

                        // Force clear any cached data
                        queryClient.invalidateQueries({ queryKey: ['groupsDetails'] });
                        queryClient.invalidateQueries({ queryKey: ['summaryData'] });

                        // Refetch both queries when screen is focused
                        await refetchGroupDetails();
                        await refetchSummaryData();
                    } catch (error) {
                        console.error('Error refreshing data:', error);
                    } finally {
                        setIsRefreshing(false);
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
    if (loadingGroupDetails || loadingSummaryData || isRefreshing || isFetching) {
        return (
            <SafeAreaView className="flex-1 bg-gray-100">
                <StatusBar style="auto" hidden={false} translucent={false} />
                <Header />
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text className="text-gray-600 mt-4 text-lg font-medium">Loading your summary...</Text>
                    <View className="mt-2 px-8">
                        <Text className="text-gray-500 text-center">
                            We're gathering your financial data and group information
                        </Text>
                    </View>

                    {/* Loading animation icons */}
                    <View className="flex-row mt-8 space-x-4">
                        <View className="items-center">
                            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                                <MaterialCommunityIcons name="wallet-outline" size={24} color="#3b82f6" />
                            </View>
                            <Text className="text-xs text-gray-500">Expenses</Text>
                        </View>

                        <View className="items-center">
                            <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-2">
                                <MaterialCommunityIcons name="cash" size={24} color="#22c55e" />
                            </View>
                            <Text className="text-xs text-gray-500">Income</Text>
                        </View>

                        <View className="items-center">
                            <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mb-2">
                                <MaterialCommunityIcons name="account-group" size={24} color="#9333ea" />
                            </View>
                            <Text className="text-xs text-gray-500">Groups</Text>
                        </View>
                    </View>
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
                        onPress={() => router.push('/(app)/personal')}
                    />

                    <FinancialCard
                        title="Expense"
                        amount={summaryData?.expense || 0}
                        iconName="arrow-up"
                        iconColor="#ef4444"
                        iconBgColor="#fee2e2"
                        onPress={() => router.push('/(app)/personal')}
                    />

                    <FinancialCard
                        title="Own Money"
                        amount={summaryData?.ownMoney || 0}
                        iconName="wallet-outline"
                        iconColor="#3b82f6"
                        iconBgColor="#e0f2fe"
                        onPress={() => router.push('/(app)/(page)/(own)/own')}
                    />

                    <FinancialCard
                        title="Others Owe"
                        amount={summaryData?.othersOwe || 0}
                        iconName="credit-card-outline"
                        iconColor="#9333ea"
                        iconBgColor="#f3e8ff"
                        onPress={() => router.push('/(app)/(page)/(own)/otherOwn')}
                    />
                </View>

                {/* Groups List */}
                <View className="p-4">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-semibold text-gray-900">Your Groups</Text>
                    </View>

                    {/* Group List Items */}
                    {groupDetails ? groupDetails.map(groupDetail => (
                        <GroupListItem
                            key={groupDetail.group.id}
                            groupDetail={groupDetail}
                        />
                    )) : <View />}
                </View>
            </ScrollView>
        </SafeAreaView>
    );

    async function fetchSummaryData(): Promise<SummaryData> {
        if (user && groupDetails) {
            // Get fresh data directly from the database
            const personalExpenses = await getPersonalExpensesByMonth(user.id, new Date().getMonth() + 1, new Date().getFullYear());
            const personalIncomes = await getPersonalIncomesByMonth(user.id, new Date().getMonth() + 1, new Date().getFullYear());

            // Clear any calculated values for proper recalculation
            const refreshedGroupDetails = await getAllGroupDetails(user.id);

            // Calculate the summary values
            return {
                income: personalIncomes.reduce((acc, income) => acc + income.amount, 0),
                expense: personalExpenses.reduce((acc, expense) => acc + (expense.total_amount ? expense.total_amount : 0), 0),
                ownMoney: refreshedGroupDetails.reduce((acc, group) =>
                    acc + group.membersWithBalance.reduce((memberAcc, member) =>
                        memberAcc + (member.balance < 0 ? member.balance : 0), 0), 0),
                othersOwe: refreshedGroupDetails.reduce((acc, group) =>
                    acc + group.membersWithBalance.reduce((memberAcc, member) =>
                        memberAcc + (member.balance > 0 ? member.balance : 0), 0), 0)
            };
        }
        else {
            return {
                income: 0,
                expense: 0,
                ownMoney: 0,
                othersOwe: 0
            };
        }
    }

    async function fetchGroupDetails(): Promise<GroupDetail[]> {
        if (user) {
            const groupDetails = await getAllGroupDetails(user.id);
            return groupDetails;
        }
        console.error('User not found, returning empty group details');
        return [];
    }
};

export default MobileSummaryPage;
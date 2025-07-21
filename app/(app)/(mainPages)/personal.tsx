import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useFocusEffect, useRouter } from 'expo-router';
import { getPersonalExpensesByMonth } from '@/utils/database/expense';
import { getPersonalIncomesByMonth } from '@/utils/database/income';
import { useAuth } from '@/app/context/auth';
import { Category, PersonalExpense, PersonalIncome } from '@/types/interface';
import TransactionCard from '@/components/ui/cards/TransactionCard'
import { Transaction } from '@/types/personal';
import MenuButton from '@/components/ui/home/MenuButton';
import { StatusBar } from 'expo-status-bar';

interface MonthlySummary {
    income: number;
    expense: number;
    balance: number;
}

const PersonalPage: React.FC = () => {
    // Current date for month display
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const monthNames: string[] = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const currentMonth: string = monthNames[currentDate.getMonth()];
    const currentYear: number = currentDate.getFullYear();
    const router = useRouter();
    // Monthly summary data
    const [monthlySummary, setMonthlySummary] = useState<MonthlySummary>({
        income: 0,
        expense: 0,
        balance: 0
    });

    // Transaction history
    const [transactionsDBData, setTransactionsDBData] = useState<Transaction[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Navigation functions
    const handlePreviousMonth = (): void => {
        const prevMonth = new Date(currentDate);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        setCurrentDate(prevMonth);
        // Here you would fetch data for the new month
    };

    const handleNextMonth = (): void => {
        const nextMonth = new Date(currentDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        setCurrentDate(nextMonth);
        // Here you would fetch data for the new month
    };

    const handleIncomePress = (): void => {
        const incomeTransactions = transactionsDBData.filter(transaction => transaction.type === 'income');
        setTransactions(incomeTransactions);
    }

    const handleExpensePress = (): void => {
        const expenseTransactions = transactionsDBData.filter(transaction => transaction.type === 'expense');
        setTransactions(expenseTransactions);
    }

    const handleSeeAllPress = (): void => {
        setTransactions(transactionsDBData);
    };


    // Function to fetch transaction data for the selected month
    const fetchMonthlyData = async (year: number, month: number): Promise<void> => {
        try {
            if (user) {
                setIsLoading(true);
                const expenses: PersonalExpense[] = await getPersonalExpensesByMonth(user?.id, month + 1, year);
                const incomes: PersonalIncome[] = await getPersonalIncomesByMonth(user?.id, month + 1, year);

                let totalIncome = 0;
                let totalExpense = 0;
                const transactionsData: Transaction[] = [];

                expenses.forEach(expense => {
                    transactionsData.push({
                        id: expense.id,
                        title: expense.title,
                        type: 'expense',
                        amount: expense.total_amount || 0,
                        date: expense.date,
                        category: expense.category,
                        description: expense.description || '',
                        created_at: expense.created_at || undefined
                    });
                    totalExpense += expense.total_amount || 0;
                });

                incomes.forEach(income => {
                    transactionsData.push({
                        id: income.id,
                        title: income.title,
                        type: 'income',
                        amount: income.amount || 0,
                        date: income.date || new Date().toISOString(),
                        category: income.category,
                        description: income.description || '',
                        created_at: income.created_at || undefined
                    });
                    totalIncome += income.amount || 0;
                });

                // Sort transactions by date, then sort by created_at
                transactionsData.sort((a, b) => {
                    // First compare by date (newest first)
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);

                    if (dateB.getTime() !== dateA.getTime()) {
                        return dateB.getTime() - dateA.getTime();
                    }

                    // If dates are the same, compare by created_at (newest first)
                    // Handle cases where created_at might be undefined
                    if (!a.created_at) return 1;
                    if (!b.created_at) return -1;

                    const createdAtA = new Date(a.created_at);
                    const createdAtB = new Date(b.created_at);

                    return createdAtB.getTime() - createdAtA.getTime();
                });

                // Set the transactions and monthly summary
                setTransactionsDBData(transactionsData);
                setTransactions(transactionsData);
                setMonthlySummary({
                    income: totalIncome,
                    expense: totalExpense,
                    balance: totalIncome - totalExpense
                });
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error fetching transaction data:', error);
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            // This function will run when the screen comes into focus
            const refreshData = async () => {
                if (user?.id) {
                    try {
                        // Refetch both queries when screen is focused
                        await fetchMonthlyData(currentYear, currentDate.getMonth());
                    } catch (error) {
                        console.error("Error refreshing data:", error);
                    } finally {
                    }
                }
            };

            refreshData();

            return () => {
                // Any cleanup code if needed
            };
        }, [user?.id])
    );

    // Effect to fetch data when month changes
    useEffect(() => {
        fetchMonthlyData(currentYear, currentDate.getMonth());
    }, [currentDate, user]);


    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            {/* Top Navigation Bar */}
            <View className="bg-[#43BFF4] pt-2 pb-2 flex-row items-center px-4 shadow-sm">
                <View className='w-10 h-10 justify-center items-center'>
                    <MenuButton />
                </View>

                <View className="flex-1 items-center">
                    <Text className="text-lg font-bold text-white">Personal</Text>
                </View>

                {/* Empty view to balance the back button */}
                <View className="w-10 h-10" />
            </View>

            <View className="bg-white px-4 py-3 flex-row justify-between items-center border-b border-gray-200">
                <TouchableOpacity onPress={handlePreviousMonth}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color="#333" />
                </TouchableOpacity>

                <Text className="text-base font-medium text-gray-800">{currentMonth} {currentYear}</Text>

                <TouchableOpacity onPress={handleNextMonth}>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#333" />
                </TouchableOpacity>
            </View>


            {/* Month Selector */}

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text className="text-gray-600 mt-4 text-lg font-medium">
                        Loading your personal summary...
                    </Text>
                </View>
            ) : (
                <View className="flex-1">
                    {/* Monthly Balance */}
                    <View className="px-4 py-3">
                        <View className="bg-blue-50 rounded-xl p-4 shadow">
                            <Text className="text-sm text-gray-500 mb-1">Monthly Balance</Text>
                            <Text className="text-xl font-bold text-blue-600">${monthlySummary.balance.toFixed(2)}</Text>
                        </View>
                    </View>

                    <View className="px-4 py-3 flex-row">
                        {/* Income Card */}
                        <TouchableOpacity onPress={handleIncomePress} className="bg-white rounded-xl p-3 flex-1 mr-2 shadow">
                            <View className="flex-row items-center justify-between">
                                <Text className="text-sm text-gray-500">Income</Text>
                                <View className="w-8 h-8 rounded-full bg-green-100 justify-center items-center">
                                    <MaterialCommunityIcons name="arrow-down" size={16} color="#22c55e" />
                                </View>
                            </View>
                            <Text className="text-lg font-bold text-gray-900 mt-1">${monthlySummary.income.toFixed(2)}</Text>
                        </TouchableOpacity>

                        {/* Expense Card */}
                        <TouchableOpacity onPress={handleExpensePress} className="bg-white rounded-xl p-3 flex-1 ml-2 shadow">
                            <View className="flex-row items-center justify-between">
                                <Text className="text-sm text-gray-500">Expense</Text>
                                <View className="w-8 h-8 rounded-full bg-red-100 justify-center items-center">
                                    <MaterialCommunityIcons name="arrow-up" size={16} color="#ef4444" />
                                </View>
                            </View>
                            <Text className="text-lg font-bold text-gray-900 mt-1">${monthlySummary.expense.toFixed(2)}</Text>
                        </TouchableOpacity>
                    </View>


                    {/* Transaction History */}
                    <View className="px-4 pt-2 pb-1 flex-row justify-between items-center">
                        <Text className="text-base font-semibold text-gray-900">Recent Transactions</Text>
                        <TouchableOpacity onPress={handleSeeAllPress}>
                            <Text className="text-sm text-blue-600">See All</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView className="flex-1 px-4">
                        {transactions.map(transaction => (
                            <TransactionCard key={transaction.id} transaction={transaction} />
                        ))}
                    </ScrollView>
                </View>
            )}
        </SafeAreaView>
    );
};

export default PersonalPage;
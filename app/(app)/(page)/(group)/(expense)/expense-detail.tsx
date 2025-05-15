import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { get_group_expense_by_id_for_user } from '@/utils/database/expense';
import { GroupDetailExpense, GroupExpenseItemUserSplit } from '@/types/group';
import { useAuth } from '@/app/context/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ExpenseItemBreakDown, ExpenseParticipants } from '@/components/ui/expense';
import { formatCurrency, formatDate } from '@/utils/ui';
import {useRefreshOnFocus} from '@/hooks';

interface ExpenseDetailProps {
    expenseId: string;
}

const ExpenseDetailPage: React.FC<ExpenseDetailProps> = ({ expenseId }) => {
    const router = useRouter();
    const { user } = useAuth();
    const id = expenseId;

    // Menu state
    const [menuVisible, setMenuVisible] = useState<boolean>(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);

    const { data: expenseData, isLoading } = useQuery({
        queryKey: ['expenseDetail', id],
        queryFn: getGroupExpenseById,
        enabled: !!id && !!user?.id,
    });

    useRefreshOnFocus('expenseDetail', getGroupExpenseById, [id]);

    // Handle menu options
    const handleEditExpense = () => {
        setMenuVisible(false);
        // Navigate to edit expense screen
        router.push({
            pathname: '/(app)/(page)/(addExpense)/[id]',
            params: { id: id, expenseType: 'group' }
        });
    };

    const handleDeleteExpense = () => {
        setMenuVisible(false);
        setDeleteModalVisible(true);
    };

    const confirmDeleteExpense = () => {
        console.log('Deleting expense');
        setDeleteModalVisible(false);
        // API call to delete the expense
        router.back(); // Navigate back after deleting
    };

    if (isLoading || !expenseData) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-100">
                <Text>Loading expense details...</Text>
            </View>
        );
    }

    // Check if current user is the payer
    const isUserPayer = expenseData.paidBy.id === user?.id;

    return (
        <View className="flex-1 bg-gray-100">
            {/* Header with back button and title */}
            <View className="bg-[#43BFF4] pt-2 pb-2 flex-row items-center px-4 shadow-sm">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 justify-center items-center"
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <View className="flex-1 items-center">
                    <Text className="text-lg font-bold text-white">Expense Details</Text>
                </View>

                <TouchableOpacity
                    onPress={() => setMenuVisible(!menuVisible)}
                    className="w-10 h-10 justify-center items-center"
                >
                    <MaterialCommunityIcons name="dots-vertical" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Menu Dropdown */}
            {menuVisible && (
                <View className="absolute right-2 top-12 z-10 bg-white rounded-lg shadow-lg overflow-hidden">
                    <TouchableOpacity
                        className="flex-row items-center px-4 py-3 border-b border-gray-200"
                        onPress={handleEditExpense}
                    >
                        <MaterialCommunityIcons name="pencil" size={20} color="#3b82f6" className="mr-2" />
                        <Text className="text-gray-800">Edit Expense</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center px-4 py-3"
                        onPress={handleDeleteExpense}
                    >
                        <MaterialCommunityIcons name="delete" size={20} color="#ef4444" className="mr-2" />
                        <Text className="text-red-500">Delete Expense</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Expense Summary */}
            <View className="bg-white px-4 py-4 border-b border-gray-200">
                <Text className="text-xl font-bold text-gray-800">{expenseData.title}</Text>
                <Text className="text-2xl font-bold text-gray-800 my-1">{formatCurrency(expenseData.amount)}</Text>
                <Text className="text-gray-500">{formatDate(expenseData.date)}</Text>

                <View className="flex-row items-center mt-3">
                    <Image
                        source={{ uri: expenseData.paidBy.avatar }}
                        className="w-6 h-6 rounded-full mr-2"
                    />
                    <Text className="text-gray-600">
                        Paid by <Text className="font-medium">{expenseData.paidBy.name}</Text>
                        {isUserPayer ? ' (You)' : expenseData.paidBy.name}
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1">
                <View className="p-4">
                    {/* Participants */}
                    <ExpenseParticipants expenseData={expenseData}></ExpenseParticipants>

                    {/* Expense Items */}
                    <ExpenseItemBreakDown expenseData={expenseData} />

                    {/* Description (if available) */}
                    {expenseData.note && (
                        <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
                            <Text className="text-gray-600 mb-2">Note</Text>
                            <Text className="text-gray-800">{expenseData.note}</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Delete Confirmation Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={deleteModalVisible}
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                    <View className="bg-white rounded-lg p-5 w-4/5 shadow-lg">
                        <Text className="text-lg font-bold text-center mb-4">Delete Expense?</Text>
                        <Text className="text-gray-700 mb-4 text-center">
                            Are you sure you want to delete "{expenseData.title}"? This action cannot be undone.
                        </Text>
                        <View className="flex-row justify-between mt-2">
                            <TouchableOpacity
                                className="flex-1 bg-gray-200 py-2 rounded-lg mr-2"
                                onPress={() => setDeleteModalVisible(false)}
                            >
                                <Text className="text-center font-medium">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-red-500 py-2 rounded-lg ml-2"
                                onPress={confirmDeleteExpense}
                            >
                                <Text className="text-center font-medium text-white">Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Click anywhere else to close the menu */}
            {menuVisible && (
                <TouchableOpacity
                    className="absolute inset-0 h-full w-full z-0"
                    onPress={() => setMenuVisible(false)}
                />
            )}
        </View>
    );

    async function getGroupExpenseById(): Promise<GroupDetailExpense> {
        try {
            if (user) {
                const expense = await get_group_expense_by_id_for_user(id, user.id);
                return expense;
            }
            else {
                throw new Error('User not found');
            }
        } catch (error) {
            console.error('Unexpected error fetching group expense:', error);
            throw error;
        }
    }
};

export default ExpenseDetailPage;
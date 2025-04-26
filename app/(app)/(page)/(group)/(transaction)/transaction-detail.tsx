import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '@/utils/ui';
import { getTransactionById } from '@/utils/database/transaction';
import { TransactionData } from '@/types/group';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatCurrency } from '@/utils/ui';
import { useAuth } from '@/app/context/auth';
interface TransactionDetailProps {
    transactionId: string;
}

const TransactionDetailPage: React.FC<TransactionDetailProps> = ({ transactionId }) => {
    const router = useRouter();
    const { user } = useAuth();
    // Menu state
    const [menuVisible, setMenuVisible] = useState<boolean>(false);

    // Delete confirmation modal state
    const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);

    const { data: transactionData, isLoading } = useQuery({
        queryKey: ['transaction', transactionId],
        queryFn: () => getTransactionById(transactionId),
        enabled: !!transactionId,
    });

    // Handle menu options
    const handleShareReceipt = () => {
        console.log('Share transaction receipt');
        setMenuVisible(false);
        // Share transaction receipt
    };

    const handleDeleteTransaction = () => {
        setMenuVisible(false);
        setDeleteModalVisible(true);
    };

    const confirmDeleteTransaction = () => {
        console.log('Deleting transaction');
        setDeleteModalVisible(false);
        // API call to delete the transaction
        router.back(); // Navigate back after deleting
    };

    // Loading state
    if (isLoading || !transactionData) {
        return (
            <View className="flex-1 bg-gray-100 justify-center items-center">
                <Text className="text-gray-600">Loading transaction details...</Text>
            </View>
        );
    }

    // Determine if the current user is the payer
    const isCurrentUserPayer = transactionData.paidBy.id === user?.id;

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
                    <Text className="text-lg font-bold text-white">Transaction Details</Text>
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
                        onPress={handleShareReceipt}
                    >
                        <MaterialCommunityIcons name="share-variant" size={20} color="#3b82f6" className="mr-2" />
                        <Text className="text-gray-800">Share Receipt</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center px-4 py-3"
                        onPress={handleDeleteTransaction}
                    >
                        <MaterialCommunityIcons name="delete" size={20} color="#ef4444" className="mr-2" />
                        <Text className="text-red-500">Delete Transaction</Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView className="flex-1">

                {/* Transaction Details */}
                <View className="bg-white rounded-lg mx-4 mt-4 shadow-sm overflow-hidden">
                    {/* Group */}
                    <View className="flex-row items-center p-4 border-b border-gray-200">
                        <MaterialCommunityIcons name={transactionData.group.iconName} size={20} color="#4b5563" className="mr-3" />
                        <Text className="text-gray-600">Group</Text>
                        <View className="flex-row items-center ml-auto">
                            <Text className="font-medium text-gray-800">{transactionData.group.name}</Text>
                        </View>
                    </View>

                    {/* With Person */}
                    <View className="flex-row items-center p-4 border-b border-gray-200">
                        <MaterialCommunityIcons name="account" size={20} color="#4b5563" className="mr-3" />
                        <Text className="text-gray-600">
                            {isCurrentUserPayer ? 'Paid to' : 'Received from'}
                        </Text>
                        <View className="flex-row items-center ml-auto">
                            <Image
                                source={{ uri: isCurrentUserPayer ? transactionData.paidTo.avatar : transactionData.paidBy.avatar }}
                                className="w-6 h-6 rounded-full mr-2"
                            />
                            <Text className="font-medium text-gray-800">
                                {isCurrentUserPayer ? transactionData.paidTo.name : transactionData.paidBy.name}
                            </Text>
                        </View>
                    </View>

                    {/* Amount */}
                    <View className="flex-row items-center p-4 border-b border-gray-200">
                        <MaterialCommunityIcons name="currency-usd" size={20} color="#4b5563" className="mr-3" />
                        <Text className="text-gray-600">Amount</Text>
                        <Text className={`ml-auto font-medium ${isCurrentUserPayer ? 'text-red-600' : 'text-green-600'}`}>
                            {isCurrentUserPayer ? '-' : '+'}{formatCurrency(transactionData.amount)}
                        </Text>
                    </View>

                    {/* Date */}
                    <View className="flex-row items-center p-4 border-b border-gray-200">
                        <MaterialCommunityIcons name="calendar" size={20} color="#4b5563" className="mr-3" />
                        <Text className="text-gray-600">Date</Text>
                        <Text className="ml-auto font-medium text-gray-800">{formatDate(transactionData.date)}</Text>
                    </View>

                    {/* Notes (if available) */}
                    {transactionData.note && (
                        <View className="p-4 border-b border-gray-200">
                            <Text className="text-gray-600 mb-1">Notes</Text>
                            <Text className="text-gray-800">{transactionData.note}</Text>
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
                        <Text className="text-lg font-bold text-center mb-4">Delete Transaction?</Text>
                        <Text className="text-gray-700 mb-4 text-center">
                            Are you sure you want to delete this transaction record? This action cannot be undone.
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
                                onPress={confirmDeleteTransaction}
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
};

export default TransactionDetailPage;
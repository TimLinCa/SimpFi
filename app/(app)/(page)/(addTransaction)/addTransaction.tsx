import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/app/context/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TransactionData, Member, GroupMembers } from '@/types/group';
// Import the group transaction functions
import { addOrUpdateTransaction, getTransactionById } from '@/utils/database/transaction';
import GroupsDropDown from '@/components/ui/group/GroupDropDown';
import TransactionGroupMembers from '@/components/ui/group/TransactionGroupMembers';
import { AmountInput, DateSelector, CustomInput } from '@/components/ui/inputs';

interface AddTransactionPageProps {
    transactionId?: string;
}

const AddTransactionPage: React.FC<AddTransactionPageProps> = ({ transactionId }) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // State variables
    const [selectedGroupData, setSelectedGroupData] = useState<GroupMembers | null>(null);
    const [amount, setAmount] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [date, setDate] = useState<Date>(new Date());
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [paidTo, setPaidTo] = useState<Member | null>(null);

    // Fetch existing transaction if editing
    const { data: existingTransaction } = useQuery({
        queryKey: ['transaction', transactionId],
        queryFn: fetchTransaction,
        enabled: !!transactionId,
    });

    // Save transaction
    const handleSave = async (): Promise<void> => {
        if (!user) return;

        // Basic validation
        if (!selectedGroupData) {
            Alert.alert('Missing Information', 'Please select a group for this transaction');
            return;
        }

        if (!paidTo) {
            Alert.alert('Missing Information', 'Please select who received the payment');
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid positive amount');
            return;
        }

        try {
            setIsLoading(true);

            const result = await addOrUpdateTransaction(
                selectedGroupData.id,
                user.id,
                paidTo.id,
                parseFloat(amount),
                transactionId,
                date.toISOString().split('T')[0],
                notes
            );

            if (result) {
                // Invalidate relevant queries
                queryClient.invalidateQueries({
                    queryKey: ['groupTransactions', selectedGroupData.id]
                });

                if (transactionId) {
                    queryClient.invalidateQueries({
                        queryKey: ['transaction', transactionId]
                    });
                }

                Alert.alert(
                    'Success',
                    'Transaction has been saved successfully',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            } else {
                Alert.alert('Error', 'Failed to save transaction. Please try again.');
            }
        } catch (error: any) {
            console.error('Error saving transaction:', error);
            Alert.alert('Error', error.message || 'An unexpected error occurred while saving your transaction.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
        >
            {/* Header with back button and title */}
            <View className="bg-[#43BFF4] pt-2 pb-2 flex-row items-center px-4 shadow-sm">
                <View className="w-1/3">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 justify-center items-center"
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View className="flex-1 items-center w-1/3">
                    <Text className="text-lg font-bold text-white">
                        {transactionId ? 'Edit Transaction' : 'Add Transaction'}
                    </Text>
                </View>

                <View className="flex-row items-center w-1/3 justify-end">
                    <TouchableOpacity
                        onPress={handleSave}
                        className="w-10 h-10 justify-center items-center"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <MaterialCommunityIcons name="check" size={24} color="#FFFFFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 bg-gray-100">
                {/* Group Selector */}
                <View className="bg-white p-4 border-b border-gray-200">
                    <Text className="text-black font-bold text-lg mb-2">Select Group</Text>
                    <GroupsDropDown selectedGroupData={selectedGroupData} setSelectedGroupData={setSelectedGroupData}></GroupsDropDown>
                </View>

                {/* Member Selection - only shown if group is selected */}
                {selectedGroupData && (
                    <View className="bg-white p-4 border-b border-gray-200">
                        <Text className="text-black font-bold text-lg mb-4">Paid To</Text>
                        <TransactionGroupMembers selectedGroupData={selectedGroupData} selectedMember={paidTo} setSelectedMember={setPaidTo} ></TransactionGroupMembers>
                    </View>
                )}

                <AmountInput amount={amount} setAmount={setAmount}></AmountInput>
                <DateSelector date={date} setDate={setDate}></DateSelector>
                <CustomInput label='Note' value={notes} setValue={setNotes} />
            </ScrollView>
        </KeyboardAvoidingView>
    );

    async function fetchTransaction(): Promise<TransactionData | null> {
        if (transactionId) {
            const transaction = await getTransactionById(transactionId);
            if (transaction) {
                setPaidTo(transaction.paidTo);
                setAmount(transaction.amount.toString());
                setDate(new Date(transaction.date));
                setNotes(transaction.note || '');
            }
            return transaction;
        }
        else {
            return null;
        }
    }
};

export default AddTransactionPage;
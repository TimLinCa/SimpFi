import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Transaction } from '@/types/personal';
import { formatDate } from '@/utils/ui';
import { useRouter } from 'expo-router';

interface TransactionCardProps {
    transaction: Transaction;
    isClicked?: boolean;
}

const TransactionCard = ({ transaction, isClicked }: TransactionCardProps) => {
    const router = useRouter();
    const handleTransactionPress = (transaction: Transaction) => {
        if (isClicked == false) return;
        if (transaction.type === 'income') {
            router.push({
                pathname: '/(app)/(page)/(addIncome)/[id]',
                params: { id: transaction.id }
            });
        }
        else {
            router.push({
                pathname: '/(app)/(page)/(addExpense)/[id]',
                params: { id: transaction.id, expenseType: 'personal' }
            });
        }
    }

    const hasDescription = transaction.description && transaction.description.trim() !== '';

    return (
        <View>
            <TouchableOpacity
                key={transaction.id}
                className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow"
                onPress={() => handleTransactionPress(transaction)}
            >
                <View
                    className={`w-10 h-10 rounded-full justify-center items-center mr-3`}
                >
                    <MaterialCommunityIcons
                        name={
                            transaction.type === 'income'
                                ? transaction.category.icon_name || 'arrow-down'
                                : transaction.category.icon_name || 'arrow-up'
                        }
                        size={20}
                        color={transaction.category.icon_color ? transaction.category.icon_color : (transaction.type === 'income' ? '#22c55e' : '#ef4444')}
                    />
                </View>

                <View className="flex-1 flex-row justify-between items-center">
                    {/* Left column: Title and Description */}
                    <View className="flex-1 justify-center">
                        <Text className="text-base font-medium text-gray-900">{transaction.title}</Text>
                        {hasDescription && (
                            <Text className="text-xs text-gray-500 mt-1">{transaction.description}</Text>
                        )}
                    </View>

                    {/* Right column: Amount and Date */}
                    <View className="items-end justify-center ml-3">
                        <Text
                            className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                }`}
                        >
                            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </Text>
                        <Text className="text-xs text-gray-500 mt-1">{formatDate(transaction.date)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default TransactionCard
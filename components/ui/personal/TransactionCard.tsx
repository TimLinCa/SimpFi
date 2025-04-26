import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Transaction } from '@/types/personal';
import { CategoryIconMap } from '@/types/ui';
import { formatDate } from '@/utils/ui';
import { useRouter } from 'expo-router';
interface TransactionCardProps {
    transaction: Transaction;
}

const TransactionCard = ({ transaction }: TransactionCardProps) => {
    const router = useRouter();
    const handleTransactionPress = (transaction: Transaction) => {
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
        // Handle transaction press, e.g., navigate to transaction details  
        // router.push({
        //     pathname: '/(page)/()/[id]',
        //     params: { id: transactionId}
        // });
    }

    return (
        <View>
            <TouchableOpacity
                key={transaction.id}
                className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow"
                onPress={() => handleTransactionPress(transaction)}
            >
                <View
                    className={`w-10 h-10 rounded-full justify-center items-center mr-3 ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}
                >
                    <MaterialCommunityIcons
                        name={
                            transaction.type === 'income'
                                ? transaction.category.icon_name || 'arrow-down'
                                : transaction.category.icon_name || 'arrow-up'
                        }
                        size={20}
                        color={transaction.type === 'income' ? '#22c55e' : '#ef4444'}
                    />
                </View>

                <View className="flex-1">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-base font-medium text-gray-900">{transaction.title}</Text>
                        <Text
                            className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                }`}
                        >
                            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </Text>
                    </View>

                    <View className="flex-row justify-between items-center mt-1">
                        <Text className="text-xs text-gray-500">{transaction.description}</Text>
                        <Text className="text-xs text-gray-500">{formatDate(transaction.date)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default TransactionCard
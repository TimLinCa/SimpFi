import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { TransactionData } from "@/types/group"
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/app/context/auth';
import { formatDate, formatCurrency } from '@/utils/ui'
interface TransactionItemProps {
    item: TransactionData;
}

const TransactionItem = ({ item }: TransactionItemProps) => {
    const { user } = useAuth()
    const isPaid = item.paidBy.id == user?.id


    const router = useRouter()

    const ItemOnPressed = (itemId: string) => {
        router.push({
            pathname: '/(app)/(page)/(group)/(transaction)/[id]',
            params: { id: itemId }
        });
    }

    return (
        <TouchableOpacity
            className="flex-row items-center p-4 bg-white rounded-lg shadow-sm mb-3"
            onPress={() => ItemOnPressed(item.id)}
        >
            <View className={`mr-3 rounded-full p-2 ${isPaid ? 'bg-red-100' : 'bg-green-100'}`}>
                <MaterialCommunityIcons
                    name={isPaid ? "arrow-right" : "arrow-left"}
                    size={24}
                    color={isPaid ? "#dc2626" : "#16a34a"}
                />
            </View>

            <View className="flex-1">
                <View className="flex-row items-center mt-1">
                    <Image
                        source={{ uri: isPaid ? item.paidTo.avatar : item.paidBy.avatar }}
                        className="w-10 h-10 rounded-full mr-2"
                    />
                    <Text className="text-sm text-gray-500">
                        {isPaid ? `You paid ${item.paidTo.name}` : `${item.paidBy.name} paid you`} • {formatDate(item.date)}
                    </Text>
                </View>
            </View>

            <Text className={`font-bold ${isPaid ? 'text-red-600' : 'text-green-600'}`}>
                {isPaid ? '-' : '+'}{formatCurrency(item.amount)}
            </Text>
        </TouchableOpacity>
    );
};


export default TransactionItem
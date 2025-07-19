import { View, Text } from 'react-native'
import React from 'react'
import { TouchableOpacity, Image } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { GroupExpense } from '@/types/group'
import { useRouter } from 'expo-router'
import { formatCurrency, formatDate } from '@/utils/ui'
interface ExpenseItemProps {
    item: GroupExpense;
}

const ExpenseItem = ({ item }: ExpenseItemProps) => {

    const router = useRouter()

    const ItemOnPressed = (itemId: string) => {
        router.push({
            pathname: '/(app)/(page)/(group)/(expense)/[id]',
            params: { id: itemId.toString() }
        });
    }

    return (
        <TouchableOpacity
            className="flex-row items-center p-4 bg-white rounded-lg shadow-sm mb-3"
            onPress={() => ItemOnPressed(item.id)}
        >
            <View className="mr-3 rounded-full p-2">
                <MaterialCommunityIcons name={item.category.icon_name} size={24} color={item.category.icon_color ? item.category.icon_color : "#000000"} />
            </View>

            <View className="flex-1">
                <Text className="font-bold text-gray-800">{item.title}</Text>
                <View className="flex-row items-center mt-1">
                    <Image
                        source={{ uri: item.paidBy.avatar }}
                        className="w-5 h-5 rounded-full mr-2"
                    />
                    <Text className="text-sm text-gray-500">
                        {item.paidBy.name} paid • {formatDate(item.date)} • {item.participantsNumber} people
                    </Text>
                </View>
            </View>

            <Text className="font-bold text-gray-800">{formatCurrency(item.amount)}</Text>
        </TouchableOpacity>
    )
}

export default ExpenseItem
import { View, Text } from 'react-native'
import React from 'react'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatCurrency } from '@/utils/ui';

interface SummaryCardProps {
    title: string;
    amount: number;
    icon: string;
    color: string;
}

const SummaryCard = ({ title, amount, icon, color }: SummaryCardProps) => {
    return (
        <View className="bg-white shadow-xl rounded-xl p-4 flex-1 mx-1 mb-3">
            <View className="flex-row items-center justify-between mb-2">
                <MaterialCommunityIcons name={icon} size={24} color={color} />
                <Text className="text-sm text-gray-500">{title}</Text>
            </View>
            <Text className={`text-xl font-bold`} style={{ color }}>
                {formatCurrency(amount)}
            </Text>
        </View>
    )
}
SummaryCard.displayName = 'SummaryCard'
export default SummaryCard;
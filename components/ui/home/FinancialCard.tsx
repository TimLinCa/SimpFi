import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export const FinancialCard = ({
    title,
    amount,
    iconName,
    iconColor,
    iconBgColor,
    onPress
}: {
    title: string,
    amount: number | string,
    iconName: any,
    iconColor: string,
    iconBgColor: string,
    onPress?: () => void
}) => {
    return (
        <TouchableOpacity
            className="bg-white rounded-xl p-4 mb-4 w-[48%] mx-[1%] shadow"
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View className="flex-row items-center mb-2">
                <View
                    className="w-9 h-9 rounded-full justify-center items-center mr-2"
                    style={{ backgroundColor: iconBgColor }}
                >
                    <MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
                </View>
                <Text className="text-sm text-gray-500">{title}</Text>
            </View>
            <Text className="text-lg font-bold text-gray-900">
                ${typeof amount === 'number' ? amount.toFixed(2) : amount}
            </Text>
        </TouchableOpacity>
    );
};
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Group, GroupDetail } from '@/types/group';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export const GroupListItem = ({
    groupDetail
}:
    {
        groupDetail: GroupDetail,
    }) => {
    const router = useRouter();
    const pendingAmount = groupDetail.membersWithBalance.reduce((acc, member) => acc + member.balance, 0);
    const isPositive = pendingAmount >= 0;

    const onPress = () => {
        router.push({
            pathname: '/(app)/(page)/(group)/[id]',
            params: { id: groupDetail.group.id }
        });
        // Handle group press, e.g., navigate to group details
    }

    return (
        <TouchableOpacity
            className="bg-white rounded-xl p-4 mb-3 flex-row justify-between items-center shadow"
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full justify-center items-center mr-3" style={{ backgroundColor: groupDetail.group.iconColor }}>
                    <MaterialCommunityIcons name={groupDetail.group.iconName} size={20} color="#FFFFFF" />
                </View>
                <View>
                    <Text className="text-base font-medium text-gray-900">{groupDetail.group.name}</Text>
                    <Text className="text-xs text-gray-500">{groupDetail.membersWithBalance.length + 1} members</Text>
                </View>
            </View>
            <Text
                className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}
            >
                {isPositive ? '+' : '-'}${typeof pendingAmount === 'number' ? pendingAmount.toFixed(2) : pendingAmount}
            </Text>
        </TouchableOpacity>
    );
};
import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { MemberWithBalance } from '@/types/group'
interface MemberWithBalanceItemProps {
    member: MemberWithBalance
}

const MemberWithBalanceItem = ({ member }: MemberWithBalanceItemProps) => {
    const isPositive = member.balance >= 0

    // Format currency
    const formatCurrency = (amount: number): string => {
        return `$${Math.abs(amount).toFixed(2)}`;
    };
    return (
        <TouchableOpacity
            className="flex-row items-center p-4 bg-white rounded-lg shadow-sm mb-3"
            onPress={() => console.log(`Balance pressed: ${member.id}`)}
        >
            <Image
                source={{ uri: member.avatar }}
                className="w-10 h-10 rounded-full mr-3"
            />

            {
                member.balance === 0 ? (
                    <Text className="font-bold text-gray-800">{member.name}</Text>
                ) : (
                    <View className="flex-1">
                        <Text className="font-bold text-gray-800">{member.name}</Text>
                        {
                            isPositive ? (
                                <Text className="text-sm text-green-600">owes you {formatCurrency(member.balance)}</Text>
                            ) : (
                                <Text className="text-sm text-red-600">you owe {formatCurrency(member.balance)}</Text>
                            )
                        }
                    </View>
                )
            }
            {
                member.balance === 0 ? null : (
                    <MaterialCommunityIcons
                        name={isPositive ? "arrow-left" : "arrow-right"}
                        size={20}
                        color={isPositive ? "#16a34a" : "#dc2626"}
                    />
                )
            }

        </TouchableOpacity>
    )
}

export default MemberWithBalanceItem
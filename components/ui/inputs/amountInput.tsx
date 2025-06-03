import { View, Text, TextInput } from 'react-native'
import React, { } from 'react'


interface AmountInputProps {
    amount: string;
    setAmount: (amount: string) => void;
}

export const AmountInput: React.FC<AmountInputProps> = (
    {
        amount,
        setAmount,
    }
) => {
    return (
        <View className="bg-white p-4 border-b border-gray-200">
            <Text className="text-black font-bold text-lg mb-2">Amount</Text>
            <View className="flex-row bg-gray-100 px-3 rounded-lg items-center h-12">
                <Text className="text-gray-800 mr-2">$</Text>
                <TextInput
                    className="flex-1 text-gray-800"
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    placeholderTextColor="#9ca3af"
                />
            </View>
        </View>
    )
}

export default AmountInput;
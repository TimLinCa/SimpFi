import { View, Text, TextInput } from 'react-native'
import React, { } from 'react'

interface CustomInputProps {
    label: string;
    value: string;
    setValue: (note: string) => void;
}

export const CustomInput: React.FC<CustomInputProps> = (
    {
        label,
        value,
        setValue,
    }
) => {

    return (
        <View className="bg-white p-4 border-b border-gray-200">
            <Text className="text-black font-bold text-lg mb-2">{label}</Text>
            <TextInput
                className="bg-gray-100 p-3 rounded-lg text-gray-800"
                value={value}
                onChangeText={setValue}
                placeholder={`Enter ${label}`}
                placeholderTextColor="#9ca3af"
            />
        </View>
    )
}

export default CustomInput;
import { View, Text, TextInput } from 'react-native'
import React, { } from 'react'

interface CustomWideInputProps {
    label: string;
    value: string;
    setValue: (note: string) => void;
}


export const CustomWideInput: React.FC<CustomWideInputProps> = (
    {
        label,
        value,
        setValue,
    }
) => {

    return (
        <View className="bg-white p-4">
            <Text className="text-black font-bold text-lg mb-2">{label}</Text>
            <TextInput
                className="bg-gray-100 p-3 rounded-lg text-gray-800"
                value={value}
                onChangeText={setValue}
                placeholder="Add any additional details"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                style={{ height: 80 }}
                textAlignVertical="top"
            />
        </View>
    )
}

export default CustomWideInput;
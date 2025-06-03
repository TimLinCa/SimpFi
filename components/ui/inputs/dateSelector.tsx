import { View, Text, TouchableOpacity, Platform } from 'react-native'
import React, { useState } from 'react'
import { formatDate } from '@/utils/ui'
import DateTimePicker from '@react-native-community/datetimepicker';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface DateSelectorProps {
    date: Date;
    setDate: (date: Date) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
    date,
    setDate
}) => {
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    // Handle date change
    const onDateChange = (event: any, selectedDate?: Date): void => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    };
    return (

        <View>
            <TouchableOpacity
                className="bg-white p-4 border-b border-gray-200 flex-row justify-between items-center"
                onPress={() => setShowDatePicker(true)}
            >
                <View>
                    <Text className="text-black font-bold text-lg">Date</Text>
                    <Text className="text-gray-800">{formatDate(date)}</Text>
                </View>
                <MaterialCommunityIcons name="calendar" size={20} color="#9ca3af" />
            </TouchableOpacity>

            {/* DatePicker (conditionally rendered) */}
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}
        </View>
    )
}

export default DateSelector;
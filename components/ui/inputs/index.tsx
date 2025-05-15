import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { formatDate } from '@/utils/ui'
import DateTimePicker from '@react-native-community/datetimepicker';

import { Category } from '@/types/interface';
import { Dropdown } from 'react-native-element-dropdown';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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

interface CategorySelectorProps {
    selectedCategory: Category | undefined;
    setSelectedCategory: (data: any) => void;
    categoryList: Category[];
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
    selectedCategory,
    setSelectedCategory,
    categoryList,
}) => {
    const [cateGoryValue, setCategoryValue] = useState<string | null>(null);
    const categoryData = categoryList.map(category => ({
        label: category.name,
        value: category.id,
        icon: category.icon_name,
        item: category
    }));

    useEffect(() => {
        if (selectedCategory) {
            const selectedCat = categoryData.find(cat => cat.label === selectedCategory.name);
            if (selectedCat) {
                setCategoryValue(selectedCat.value);
            }
        }
    }, [setSelectedCategory]);

    return (
        <View>
            <Dropdown
                style={{
                    height: 40,
                    backgroundColor: '#f3f4f6',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                }}
                placeholderStyle={{ color: '#9ca3af', fontSize: 16 }}
                selectedTextStyle={{ color: '#000000', fontSize: 16 }}
                inputSearchStyle={{
                    height: 40,
                    borderRadius: 4,
                    fontSize: 16,
                }}
                iconStyle={{ width: 20, height: 20 }}
                data={categoryData}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select a category"
                searchPlaceholder="Search for a category..."
                value={cateGoryValue}
                onChange={item => {
                    setCategoryValue(item.value);
                    const newCat = categoryData.find(cat => cat.label === item.label)?.item;
                    if (!newCat) return;
                    setSelectedCategory(newCat);
                }}
                renderLeftIcon={() => (
                    <MaterialCommunityIcons
                        name={selectedCategory ? selectedCategory.icon_name : "tag-outline"}
                        size={20}
                        color="#3b82f6"
                        style={{ marginRight: 8 }}
                    />
                )
                }
                renderItem={(item) => (
                    <View className="px-4 py-3 flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons
                                name={item.icon}
                                size={20}
                                color="#3b82f6"
                            />
                            <Text className="ml-3 text-gray-800 text-base">
                                {item.label}
                            </Text>
                        </View>
                        {item.label === selectedCategory?.name && (
                            <MaterialCommunityIcons
                                name="check"
                                size={20}
                                color="#3b82f6"
                            />
                        )}
                    </View>
                )}
            />
        </View>
    )
}

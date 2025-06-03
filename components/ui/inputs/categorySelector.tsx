import { View, Text } from 'react-native'
import React, { useState, useEffect } from 'react'

import { Category } from '@/types/interface';
import { Dropdown } from 'react-native-element-dropdown';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


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

export default CategorySelector;
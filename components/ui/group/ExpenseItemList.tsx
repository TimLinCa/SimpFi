import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Category, ExpenseItem, MemberForExpense } from '@/types/interface';
import StackedAvatars from './StackedAvatars';
import { ExpenseItemOverlay } from '../expense';
import { Portal } from '@/hooks/portalContext';

interface ExpenseItemListProps {
    items: ExpenseItem[];
    setItems: (items: ExpenseItem[]) => void;
    expenseType: string; // Adjust based on your logic
    expenseCategories: Category[]; // Adjust based on your logic
    expenseMembers: MemberForExpense[];
}

const ExpenseItemList = ({
    items,
    setItems,
    expenseType,
    expenseCategories,
    expenseMembers,
}: ExpenseItemListProps) => {
    const [currentItem, setCurrentItem] = useState<ExpenseItem | null>(null);
    const [showItemOverlay, setShowItemOverlay] = useState<boolean>(false);
    // Add or edit expense item
    const openItemOverlay = (item?: ExpenseItem): void => {
        if (item) {
            setCurrentItem(item);
        } else {
            setCurrentItem(null);
        }
        setShowItemOverlay(true);
    }

    const handleSaveItem = (newItem: ExpenseItem): void => {
        if (currentItem) {
            // Edit existing item
            setItems(items.map(item =>
                item.id === currentItem.id ? newItem : item
            ));
        } else {
            // Add new item
            setItems([...items, newItem]);
        }

        // Close overlay and reset current item
        setShowItemOverlay(false);
        setCurrentItem(null);
    };

    // Delete item
    const deleteItem = (id: string): void => {
        setItems(items.filter(item => item.id !== id));
    };
    return (
        <View className="bg-white p-4 border-b border-gray-200">
            <View className="flex-row justify-between items-center mb-3">
                <Text className="text-black font-bold text-lg">Items</Text>
                <TouchableOpacity
                    className="bg-blue-100 p-2 rounded-full"
                    onPress={() => openItemOverlay()}
                >
                    <MaterialCommunityIcons name="plus" size={18} color="#3b82f6" />
                </TouchableOpacity>
            </View>

            {items.length > 0 ? (
                <View className="bg-gray-50 rounded-lg overflow-hidden">
                    {items.map((item, index) => (
                        <View key={index} className="flex-row justify-between items-center p-3 border-b border-gray-200">
                            <View className="flex-row items-center flex-1">
                                {/* Category icon for all expense types */}
                                {item.category && (
                                    <View className="bg-blue-100 w-8 h-8 rounded-full items-center justify-center mr-3">
                                        <MaterialCommunityIcons name={expenseCategories.find(cat => cat.name == item.category.name)?.icon_name || 'dots-horizontal-circle'} size={16} color="#3b82f6" />
                                    </View>
                                )}

                                <View className="flex-1">
                                    <Text className="text-gray-800">{item.name}</Text>
                                    {item.category && (
                                        <Text className="text-gray-500 text-xs">{expenseCategories.find(cat => cat.name == item.category.name)?.name}</Text>
                                    )}
                                </View>
                            </View>

                            {/* Stacked avatars for group expense */}
                            {expenseType === 'group' && item.MemberForExpenses && item.MemberForExpenses.length > 0 && (
                                <View className="mr-3">
                                    <StackedAvatars members={item.MemberForExpenses} />
                                </View>
                            )}

                            <Text className="text-gray-800 mr-3">${item.amount.toFixed(2)}</Text>
                            <View className="flex-row">
                                <TouchableOpacity
                                    className="p-2"
                                    onPress={() => openItemOverlay(item)}
                                >
                                    <MaterialCommunityIcons name="pencil" size={16} color="#3b82f6" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="p-2"
                                    onPress={() => deleteItem(item.id)}
                                >
                                    <MaterialCommunityIcons name="delete" size={16} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                    <View className="flex-row justify-between items-center p-3 bg-gray-100">
                        <Text className="font-bold text-gray-800">Total</Text>
                        <Text className="font-bold text-gray-800">
                            ${items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                        </Text>
                    </View>
                </View>
            ) : (
                <TouchableOpacity
                    className="bg-gray-100 rounded-lg p-3 items-center justify-center"
                    onPress={() => openItemOverlay()}
                >
                    <Text className="text-gray-500 text-sm">Add items to break down your expense</Text>
                </TouchableOpacity>
            )}

            {/* Expense item Overlay*/}
            {
                showItemOverlay &&
                (
                    <Portal name="expense-item-overlay">
                        <ExpenseItemOverlay
                            visible={true}
                            onClose={() => setShowItemOverlay(false)}
                            onSave={handleSaveItem}
                            currentItem={currentItem}
                            expenseType={expenseType}
                            expenseCategories={expenseCategories}
                            initialExpenseMembers={expenseMembers}
                        />
                    </Portal>
                )
            }
        </View>
    )
}

export default ExpenseItemList
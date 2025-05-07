import { View, Text, ScrollView, FlatList, Image, Alert, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { GroupDetailExpense, GroupExpenseItemUserSplit, Member } from '@/types/group'
import { formatCurrency } from '@/utils/ui'
import { useAuth } from '@/app/context/auth'
import { Category, ExpenseItem, MemberForExpense } from '@/types/interface'
import SelectDropdown from 'react-native-select-dropdown'
import { classifyExpense } from '@/utils/categorizeExpense';

interface ExpenseParticipantsProps {
    expenseData: GroupDetailExpense
}

export const ExpenseParticipants: React.FC<ExpenseParticipantsProps> = ({ expenseData }) => {
    const { user } = useAuth();
    return (
        <View>
            {/* Participants */}
            <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <Text className="text-gray-600 mb-3 font-medium">Participants</Text>
                <View className="flex-row flex-wrap">
                    {expenseData.participants.map(participant => (
                        <View key={participant.id} className="items-center mr-4 mb-2">
                            <View className="relative">
                                <Image
                                    source={{ uri: participant.avatar }}
                                    className="w-12 h-12 rounded-full"
                                />
                                {participant.id === expenseData.paidBy.id && (
                                    <View className="absolute -right-1 -bottom-1 bg-green-500 rounded-full w-5 h-5 items-center justify-center border-2 border-white">
                                        <MaterialCommunityIcons name="cash" size={10} color="#fff" />
                                    </View>
                                )}
                            </View>
                            <Text className="text-xs text-gray-800 mt-1">
                                {participant.name}
                                {participant.id === user?.id ? ' (You)' : ''}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    )
}

interface ExpenseItemBreakDownProps {
    expenseData: GroupDetailExpense
}

export const ExpenseItemBreakDown: React.FC<ExpenseItemBreakDownProps> = ({ expenseData }) => {
    const totalUserPayment = expenseData.userSplit.reduce((sum, item) => sum + item.userPayment, 0);
    const renderExpenseItem = ({ item }: { item: GroupExpenseItemUserSplit }) => {
        return (
            <View className="py-3 border-b border-gray-200">
                <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                        <Text className="font-medium text-gray-800">{item.name}</Text>
                        {item.category && (
                            <View className="flex-row items-center mt-1">
                                <MaterialCommunityIcons
                                    name={item.category.icon_name || "tag"}
                                    size={14}
                                    color="#6B7280"
                                />
                                <Text className="text-xs text-gray-500 ml-1">{item.category.name}</Text>
                            </View>
                        )}
                    </View>
                    <Text className="font-medium text-gray-800">
                        {formatCurrency(item.amount)}
                    </Text>
                </View>

                {/* User's share for this item */}
                <View className="flex-row justify-between items-center mt-1">
                    <Text className="text-xs text-gray-500">
                        Your share: {item.percentage}%
                    </Text>
                    <Text className={`text-xs ${item.userPayment > 0 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                        You pay: {formatCurrency(item.userPayment)}
                    </Text>
                </View>
            </View>
        );
    };


    return (
        <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <Text className="text-gray-600 mb-3 font-medium">Your Item Breakdown</Text>
            <FlatList
                data={expenseData.userSplit}
                renderItem={renderExpenseItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
            />
            <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-200">
                <Text className="font-bold text-gray-800">Your Total</Text>
                <Text className="font-bold text-blue-600">{formatCurrency(totalUserPayment)}</Text>
            </View>
        </View>
    )
}

interface ExpenseItemOverlayProps {
    visible: boolean;
    onClose: () => void;
    onSave: (item: ExpenseItem) => void;
    currentItem: ExpenseItem | null;
    expenseType: string;
    expenseCategories: Category[];
    // We'll still receive the initial members as props
    initialExpenseMembers: MemberForExpense[];
}

export const ExpenseItemOverlay: React.FC<ExpenseItemOverlayProps> = ({
    visible,
    onClose,
    onSave,
    currentItem,
    expenseType,
    expenseCategories,
    initialExpenseMembers
}) => {
    // State
    const [itemName, setItemName] = useState<string>('');
    const [itemAmount, setItemAmount] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
    // Internal state to manage expense members
    const [expenseMembers, setExpenseMembers] = useState<MemberForExpense[]>([]);

    const onItemNameChange = (text: string) => {
        setItemName(text);
        const newCategory = classifyExpense(text);
        if (newCategory) {
            setSelectedCategory(expenseCategories.find(cat => cat.name === newCategory));
        }
    }

    const updateTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    // Function to toggle member selection
    const toggleMemberSelection = (memberId: string) => {
        // First, toggle the selected state for the target member
        const updatedMembers = [...expenseMembers];

        // Find the member and toggle their selection status
        const memberIndex = updatedMembers.findIndex(m => m.id === memberId);
        if (memberIndex !== -1) {
            const member = updatedMembers[memberIndex];
            const newSelected = !member.selected;

            // Update the member directly
            updatedMembers[memberIndex] = {
                ...member,
                selected: newSelected,
                percentage: newSelected ? member.percentage || 0 : 0
            };
        }

        // Count how many members are now selected
        const selectedMembers = updatedMembers.filter(m => m.selected);

        // If we have selected members, redistribute percentages evenly
        if (selectedMembers.length > 0) {
            const equalPercentage = Math.floor(100 / selectedMembers.length);

            // Apply the equal percentage to all selected members
            selectedMembers.forEach(member => {
                const index = updatedMembers.findIndex(m => m.id === member.id);
                if (index !== -1) {
                    updatedMembers[index] = {
                        ...updatedMembers[index],
                        percentage: equalPercentage
                    };
                }
            });

            // Distribute remainder to make total exactly 100%
            const remainder = 100 - (equalPercentage * selectedMembers.length);
            for (let i = 0; i < remainder; i++) {
                const index = updatedMembers.findIndex(m => m.id === selectedMembers[i].id);
                if (index !== -1) {
                    updatedMembers[index] = {
                        ...updatedMembers[index],
                        percentage: updatedMembers[index].percentage + 1
                    };
                }
            }
        }

        // Update state immediately
        setExpenseMembers(updatedMembers);
    };

    // Function to update member percentage immediately without debouncing
    const updateMemberPercentage = (memberId: string, newPercentage: string) => {
        // Remove any non-numeric characters first
        const numericString = newPercentage.replace(/[^0-9]/g, '');
        let percentageValue = parseInt(numericString, 10);

        // If not a valid integer, default to 0
        if (isNaN(percentageValue)) percentageValue = 0;

        // Optionally cap at 100 to prevent unreasonable values
        if (percentageValue > 100) percentageValue = 100;

        // Update the member's percentage immediately in the state
        const updatedMembers = expenseMembers.map(member =>
            member.id === memberId ? { ...member, percentage: percentageValue } : member
        );

        // Update internal expense members state immediately
        setExpenseMembers(updatedMembers);
    };

    // Calculate the total percentage of all selected members
    const getTotalPercentage = (): number => {
        return expenseMembers
            .filter(m => m.selected)
            .reduce((sum, m) => sum + m.percentage, 0);
    };

    // Helper function to validate if percentages sum to 100
    const isValidTotalPercentage = (): boolean => {
        const total = getTotalPercentage();
        return Math.abs(total - 100) < 0.1; // Allow a small rounding error
    };

    // Initialize component state when visible or currentItem changes
    useEffect(() => {
        if (visible) {
            // Always start with the initial members
            let combinedMembers = [...initialExpenseMembers];

            // If editing an existing item with members, merge them with the initial members
            if (currentItem && currentItem.MemberForExpenses) {
                // Create a map for faster lookups
                const memberMap = new Map();

                // First add all initial members to the map
                initialExpenseMembers.forEach(member => {
                    memberMap.set(member.id, {
                        ...member,
                        selected: false,
                        percentage: 0
                    });
                });

                // Then update with data from currentItem.MemberForExpenses
                currentItem.MemberForExpenses.forEach(member => {
                    if (memberMap.has(member.id)) {
                        // Update existing member
                        memberMap.set(member.id, {
                            ...memberMap.get(member.id),
                            selected: true,
                            percentage: member.percentage
                        });
                    } else {
                        // Add new member that's in currentItem but not in initialMembers
                        memberMap.set(member.id, member);
                    }
                });

                // Convert map back to array
                combinedMembers = Array.from(memberMap.values());
            }

            // Update state with combined members
            setExpenseMembers(combinedMembers);

            // Set other form values if editing an item
            if (currentItem) {
                setItemName(currentItem.name || '');
                setItemAmount(currentItem.amount ? currentItem.amount.toString() : '');

                // Set category if available
                if (currentItem.category) {
                    const category = expenseCategories.find(cat => cat.name === currentItem.category.name);
                    setSelectedCategory(category);
                }
            } else {
                // Reset form for a new item
                setItemName('');
                setItemAmount('');
                setSelectedCategory(expenseCategories.length > 0 ? expenseCategories[0] : undefined);
            }
        }
    }, [visible, currentItem?.id]);

    // Save item
    const saveItem = (): void => {
        if (!itemName.trim() || !itemAmount.trim()) {
            Alert.alert('Missing Information', 'Please provide both item name and amount');
            return;
        }

        const amountValue = parseFloat(itemAmount);
        if (isNaN(amountValue) || amountValue <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid positive amount');
            return;
        }

        // Get selected members for group expenses
        let splitWithMembers: MemberForExpense[] = [];
        if (expenseType === 'group') {
            splitWithMembers = expenseMembers
                .filter(m => m.selected)
                .map(m => ({
                    id: m.id,
                    name: m.name,
                    avatar: m.avatar,
                    amount: (parseFloat(itemAmount) * m.percentage) / 100,
                    percentage: m.percentage,
                    email: m.email,
                    selected: true
                }));

            // Validate that at least one member is selected
            if (splitWithMembers.length === 0) {
                Alert.alert('Missing Information', 'Please select at least one member to split with');
                return;
            }

            // Validate that percentages sum to 100
            if (!isValidTotalPercentage()) {
                Alert.alert('Invalid Split', 'The total percentage must be 100%');
                return;
            }
        }

        const newItem: ExpenseItem = {
            id: currentItem ? currentItem.id : Date.now().toString(),
            name: itemName,
            amount: amountValue,
            category: selectedCategory ? selectedCategory : expenseCategories[0],
        };

        // Add split members for group expenses
        if (expenseType === 'group' && splitWithMembers.length > 0) {
            newItem.MemberForExpenses = splitWithMembers;
        }

        // Call the parent onSave function with the collected data
        onSave(newItem);
    };

    if (!visible) return null;

    return (
        <View className="absolute inset-0 z-50 flex justify-center items-center">
            {/* Semi-transparent backdrop */}
            <View
                className="absolute inset-0 bg-black opacity-40"
                onTouchStart={onClose}
            />

            {/* Content container - centered in screen */}
            <View
                className="w-11/12 max-w-md bg-white rounded-xl shadow-xl"
                onTouchStart={(e) => e.stopPropagation()} // Prevent closing when clicking on the content
                style={{ maxHeight: '80%' }}
            >
                {/* Header */}
                <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                    <Text className="text-lg font-bold text-gray-800">
                        {currentItem ? 'Edit Item' : 'Add Item'}
                    </Text>
                    <TouchableOpacity
                        onPress={saveItem}
                        className="h-8 w-10 rounded-full flex items-center justify-center"
                    >
                        <Text className='text-primary-blue'>Save</Text>
                    </TouchableOpacity>
                </View>

                {/* Scrollable content to ensure it works on smaller screens */}
                <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
                    <View className="mb-4">
                        <Text className="text-gray-500 text-sm mb-2">Item Name</Text>
                        <TextInput
                            className="bg-gray-100 p-3 rounded-lg text-gray-800"
                            value={itemName}
                            onChangeText={onItemNameChange}
                            placeholder="e.g., Main Course, Drinks"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    {/* Category Selector */}
                    <View className="mb-4">
                        <Text className="text-gray-500 text-sm mb-2">Category</Text>
                        <SelectDropdown
                            data={expenseCategories}
                            onSelect={(selectedItem) => {
                                const userSelectedCategory = expenseCategories.find(cat => cat.name === selectedItem.name);
                                if (userSelectedCategory) {
                                    setSelectedCategory(userSelectedCategory);
                                }
                            }}
                            renderButton={(selectedItem, isOpened) => {
                                return (
                                    <View className="h-12 bg-gray-100 rounded-lg flex-row justify-center items-center px-3">
                                        {
                                            selectedCategory ? (
                                                <View className='flex-row justify-center items-center'>
                                                    <MaterialCommunityIcons name={selectedCategory.icon_name} className="text-2xl ml-1 mr-3" />
                                                    <Text className="flex-1 text-black">
                                                        {(selectedCategory && selectedCategory.name)}
                                                    </Text>
                                                </View>
                                            ) : (
                                                <Text className="flex-1 text-[#9ca3af]">
                                                    Select category
                                                </Text>
                                            )
                                        }
                                        <MaterialCommunityIcons name={isOpened ? 'chevron-up' : 'chevron-down'} className="text-2xl" />
                                    </View>
                                );
                            }}
                            renderItem={(item, index, isSelected) => {
                                return (
                                    <View className={`w-full flex-row px-3 justify-center items-center py-2 ${isSelected ? 'bg-gray-300' : ''}`}>
                                        <MaterialCommunityIcons name={item.icon_name} className="text-2xl mr-4" />
                                        <Text className="flex-1 text-lg font-medium text-gray-800">{item.name}</Text>
                                    </View>
                                );
                            }}
                            showsVerticalScrollIndicator={false}
                            dropdownStyle={{
                                backgroundColor: '#E9ECEF',
                                borderRadius: 8,
                            }}
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-500 text-sm mb-2">Amount</Text>
                        <View className="flex-row bg-gray-100 px-3 rounded-lg items-center h-12">
                            <Text className="text-gray-800 mr-2">$</Text>
                            <TextInput
                                className="flex-1 text-gray-800"
                                value={itemAmount}
                                onChangeText={setItemAmount}
                                placeholder="0.00"
                                keyboardType="decimal-pad"
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                    </View>

                    {/* Group expense section - only show if expense type is 'group' */}
                    {expenseType === 'group' && (
                        <View className="mb-4 mt-2">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-gray-500 text-sm">Split with</Text>
                                <View className="flex-row items-center">
                                    <Text className={`text-sm ${isValidTotalPercentage() ? 'text-green-500' : 'text-red-500'}`}>
                                        Total: {getTotalPercentage()}%
                                    </Text>
                                    {!isValidTotalPercentage() && (
                                        <Text className="text-xs text-red-500 ml-1">(Should be 100%)</Text>
                                    )}
                                </View>
                            </View>

                            {/* Member Selection with percentage adjustment */}
                            <View className="bg-gray-50 rounded-lg">
                                <ScrollView
                                    className="p-2"
                                    showsVerticalScrollIndicator={true}
                                    style={{ maxHeight: 280 }} // Height for approximately 5 members (56px each)
                                >
                                    {expenseMembers.map(member => (
                                        <View key={member.id} className="flex-row items-center p-2 border-b border-gray-100">
                                            <TouchableOpacity
                                                onPress={() => toggleMemberSelection(member.id)}
                                                className="flex-row items-center flex-1"
                                            >
                                                <View className="relative">
                                                    <Image
                                                        source={{ uri: member.avatar }}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                    {member.selected && (
                                                        <View className="absolute bottom-0 right-0 bg-green-500 rounded-full w-5 h-5 items-center justify-center border-2 border-white">
                                                            <MaterialCommunityIcons name="check" size={12} color="#fff" />
                                                        </View>
                                                    )}
                                                </View>
                                                <Text className={`ml-3 ${member.selected ? 'font-bold' : 'text-gray-500'}`}>
                                                    {member.name}
                                                </Text>
                                            </TouchableOpacity>

                                            {/* Percentage input and amount calculation */}
                                            {member.selected && (
                                                <View className="flex-row items-center">
                                                    {/* Dollar amount based on percentage */}
                                                    {itemAmount && parseFloat(itemAmount) > 0 && (
                                                        <Text className="text-xs text-gray-500 mr-2">
                                                            ${((parseFloat(itemAmount) * member.percentage) / 100).toFixed(2)}
                                                        </Text>
                                                    )}

                                                    {/* Percentage input */}
                                                    <View className="flex-row items-center bg-white border border-gray-200 rounded">
                                                        <TextInput
                                                            className="w-12 text-center"
                                                            value={member.percentage.toString()}
                                                            onChangeText={(text) => updateMemberPercentage(member.id, text)}
                                                            keyboardType="number-pad"
                                                            style={{
                                                                textAlign: 'center',
                                                                paddingVertical: 4,
                                                                fontSize: 14,
                                                                height: 30,
                                                                lineHeight: 20,
                                                            }}
                                                            // Ensure keyboard events are processed right away
                                                            returnKeyType="done"
                                                        />
                                                        <Text className="text-xs mr-2">%</Text>
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </ScrollView>

                                {/* No members selected warning */}
                                {expenseMembers.filter(m => m.selected).length === 0 && (
                                    <Text className="text-red-500 text-sm text-center mt-2">
                                        Please select at least one person to split with
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
    );
};
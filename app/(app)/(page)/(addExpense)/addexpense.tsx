import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Modal,
    Alert
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { loadExpenseClassifier, classifyExpense } from '@/utils/categorizeExpense';
import { Group, GroupMembers } from '@/types/group';
import { Category, ExpenseItem, MemberForExpense } from '@/types/interface';
import StackedAvatars from '@/components/ui/group/StackedAvatars';
import { addOrUpdatePersonalExpense, getCategories, getPersonalExpenseById, addOrUpdateGroupExpense, getGroupExpenseById } from '@/utils/database/expense';
import { useAuth } from '@/app/context/auth';
import { getUserGroups } from '@/utils/database/group'
import { useQuery } from '@tanstack/react-query'
import GroupDropDown from '@/components/ui/group/GroupDropDown';
import { CustomInput, CustomWideInput, DateSelector } from '@/components/ui/inputs';
import { ExpenseItemOverlay } from '@/components/ui/expense';

interface AddExpensePageProps {
    expenseId?: string;
    inputExpenseType?: string;
}


const AddExpensePage: React.FC<AddExpensePageProps> = ({ expenseId, inputExpenseType }) => {
    if (expenseId == 'addExpense') {
        expenseId = undefined;
    }
    const router = useRouter();
    const { user } = useAuth();
    loadExpenseClassifier();
    // State variables
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [group, setGroup] = useState<Group | null>(null);
    const [expenseType, setExpenseType] = useState<string>('personal');
    const [amount, setAmount] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [date, setDate] = useState<Date>(new Date());
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [scanningProgress, setScanningProgress] = useState<number>(0);

    // Expense items state
    const [items, setItems] = useState<ExpenseItem[]>([]);
    const [currentItem, setCurrentItem] = useState<ExpenseItem | null>(null);
    const [expenseMembers, setExpenseMembers] = useState<MemberForExpense[]>([]);
    const [showItemOverlay, setShowItemOverlay] = useState<boolean>(false);

    // Update your state variables

    const { data: expenseCategories } = useQuery({ queryKey: ['categories'], queryFn: getCategories, initialData: [] });
    const { data: groups } = useQuery({
        queryKey: ['groupsWithMember', user?.id],
        queryFn: fetchGroups,
        initialData: [],
        enabled: !!user?.id
    });
    const { data: selectedGroupData } = useQuery({
        queryKey: ['groupDetails', group],
        queryFn: fetchGroupData,
        enabled: !!group
    });

    React.useEffect(() => {
        const initializeExpense = async () => {
            if (expenseId && inputExpenseType) {
                setIsEditing(true);
                setExpenseType(inputExpenseType);
                try {
                    if (inputExpenseType === 'personal') {
                        // Get the expense data
                        const expenseData = await getPersonalExpenseById(expenseId);

                        if (expenseData) {
                            // Set expense basic data
                            setTitle(expenseData.title || '');
                            setNotes(expenseData.description || '');

                            // Set date if available
                            if (expenseData.date) {
                                setDate(new Date(expenseData.date));
                            }

                            // Set expense type
                            if (inputExpenseType) {
                                setExpenseType(inputExpenseType);
                            }

                            // Get expense items
                            const expenseItems = expenseData.items || [];
                            if (expenseItems && expenseItems.length > 0) {
                                // Format items for the state
                                const formattedItems = expenseItems.map(item => ({
                                    id: item.id || Date.now().toString(),
                                    name: item.name,
                                    amount: item.amount,
                                    category: item.category,
                                    MemberForExpenses: item.MemberForExpenses || [],
                                }));

                                setItems(formattedItems);

                                // Calculate total amount from items
                                const total = formattedItems.reduce((sum, item) => sum + item.amount, 0);
                                setAmount(total.toFixed(2));
                            }
                        }
                    }
                    else {
                        // Handle group expense loading here if needed
                        if (!user) return;

                        const groupExpenseDetail = await getGroupExpenseById(expenseId);
                        if (groupExpenseDetail) {
                            console.log('groupExpenseDetail', groupExpenseDetail.userSplit);
                            setTitle(groupExpenseDetail.title || '');
                            setNotes(groupExpenseDetail.note || '');
                            setDate(groupExpenseDetail.date);
                            setGroup(groupExpenseDetail.group);

                            // Set items
                            const formattedItems = groupExpenseDetail.userSplit.map(item => ({
                                id: item.id,
                                name: item.name,
                                amount: item.amount,
                                category: item.category,
                                MemberForExpenses: item.MemberForExpenses
                            }));

                            setItems(formattedItems);
                        }
                    }


                } catch (error) {
                    console.error('Error loading expense:', error);
                    Alert.alert('Error', 'Failed to load expense data. Please try again.');
                }
            } else if (inputExpenseType) {
                // If just inputExpenseType is set (for new expenses), use that
                setExpenseType(inputExpenseType);
            }
        };

        initializeExpense();
    }, [expenseId, inputExpenseType]);

    // Timer ref for simulating scanning progress
    const timerRef = useRef<NodeJS.Timeout | null>(null);

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

        // Update total amount from items
        updateTotalFromItems();
    };

    // Handle scan receipt (moved to top-right button)
    const scanReceipt = async (): Promise<void> => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera permissions to scan receipts!');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            // Show scanning modal
            setIsScanning(true);
            setScanningProgress(0);

            // Simulate scanning progress
            timerRef.current = setInterval(() => {
                setScanningProgress((prev) => {
                    if (prev >= 100) {
                        if (timerRef.current) {
                            clearInterval(timerRef.current);
                            timerRef.current = null;
                        }

                        // Simulate extracted data
                        simulateReceiptExtraction();

                        // Close scanning modal after a delay
                        setTimeout(() => {
                            setIsScanning(false);
                        }, 500);

                        return 100;
                    }
                    return prev + 5;
                });
            }, 100);
        }
    };

    // Simulate receipt data extraction
    const simulateReceiptExtraction = (): void => {
        // Simulate that we've extracted data from the receipt
        if (!title) {
            setTitle('Restaurant Dinner');
        }

        if (!amount) {
            setAmount('89.95');
        }

        // Simulate extracted items
        if (items.length === 0) {
            setItems([
                { id: Date.now().toString() + '1', name: 'Main Course', amount: 45.95, category: expenseCategories[0] },
                { id: Date.now().toString() + '2', name: 'Drinks', amount: 24.00, category: expenseCategories[0] },
                { id: Date.now().toString() + '3', name: 'Dessert', amount: 12.50, category: expenseCategories[0] },
                { id: Date.now().toString() + '4', name: 'Service', amount: 7.50, category: expenseCategories[0] },
            ]);
        }
    };

    // Add or edit expense item
    const openItemOverlay = (item?: ExpenseItem): void => {
        console.log('openItemOverlay', item);
        if (item) {
            setCurrentItem(item);
        } else {
            setCurrentItem(null);
        }
        setShowItemOverlay(true);
    }

    // Delete item
    const deleteItem = (id: string): void => {
        setItems(items.filter(item => item.id !== id));
        updateTotalFromItems();
    };

    // Update total amount from items
    const updateTotalFromItems = (): void => {
        if (items.length > 0) {
            const total = items.reduce((sum, item) => sum + item.amount, 0);
            setAmount(total.toFixed(2));
        }
    };

    // Handle save for both personal and group expenses
    const handleSave = async (): Promise<void> => {
        if (!user) return;

        // Basic validation
        if (!title.trim()) {
            Alert.alert('Missing Information', 'Please enter a title for this expense');
            return;
        }

        // Validate items exist
        if (items.length === 0) {
            Alert.alert('Missing Items', 'Please add at least one item to your expense');
            return;
        }

        try {
            // Format items for database
            const formattedItems: ExpenseItem[] = items.map(item => ({
                id: item.id,
                name: item.name,
                amount: item.amount,
                category: item.category,
                MemberForExpenses: item.MemberForExpenses
            }));

            let expenseResult: string | null = null;

            if (expenseType === 'personal') {
                // Handle personal expense
                expenseResult = await addOrUpdatePersonalExpense(
                    user.id,
                    title,
                    formattedItems,
                    notes,
                    date.toISOString().split('T')[0],
                    expenseId,
                );
            } else {
                // Handle group expense
                if (group == null) {
                    Alert.alert('Missing Information', 'Please select a group for this expense');
                    return;
                }
                // Calculate total from items to ensure accuracy
                const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
                console.log('formattedItems', formattedItems);
                expenseResult = await addOrUpdateGroupExpense(
                    expenseId || null,
                    group.id,
                    user.id,
                    title,
                    totalAmount,
                    date.toISOString().split('T')[0],
                    notes,
                    formattedItems
                );
            }

            if (expenseResult) {
                console.log('Expense saved successfully with ID:', expenseResult);
                Alert.alert(
                    'Success',
                    'Your expense has been saved successfully',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            } else {
                Alert.alert('Error', 'Failed to save expense. Please try again.');
            }
        } catch (error) {
            console.error('Error saving expense:', error);
            Alert.alert('Error', 'An unexpected error occurred while saving your expense.');
        }
    };

    // Clean up timer when component unmounts
    React.useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
        >
            {/* Header with back button and title */}
            <View className="bg-[#43BFF4] pt-2 pb-2 flex-row items-center px-4 shadow-sm">
                <View className="w-1/3">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 justify-center items-center"
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>


                <View className="flex-1 items-center w-1/3 ">
                    <Text className="text-lg font-bold text-white">Add Expense</Text>
                </View>

                <View className='flex-row items-center w-1/3 justify-end'>
                    <TouchableOpacity
                        onPress={scanReceipt}
                        className="w-10 h-10 justify-center items-center"
                    >
                        <MaterialCommunityIcons name="line-scan" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSave}
                        className="w-10 h-10 justify-center items-center"
                    >
                        <MaterialCommunityIcons name="check" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 bg-gray-100">
                {/* Personal/Group Expense Toggle */}
                <View className="bg-white p-4 border-b border-gray-200">
                    <View className="flex-row bg-gray-100 rounded-full overflow-hidden">
                        <TouchableOpacity
                            className={`flex-1 py-2 px-4 items-center ${expenseType === 'personal' ? 'bg-primary-blue' : 'bg-transparent'}`}
                            onPress={() => setExpenseType('personal')}
                        >
                            <Text className={`font-bold ${expenseType === 'personal' ? 'text-white' : 'text-gray-500'}`}>Personal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 py-2 px-4 items-center ${expenseType === 'group' ? 'bg-primary-blue' : 'bg-transparent'}`}
                            onPress={() => setExpenseType('group')}
                        >
                            <Text className={`font-bold ${expenseType === 'group' ? 'text-white' : 'text-gray-500'}`}>Group</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Group Selector - only show if expense type is 'group' */}
                {expenseType === 'group' && (
                    <View className="bg-white p-4 border-b border-gray-200">
                        <Text className="text-black font-bold text-lg mb-2">Select Group</Text>
                        <GroupDropDown selectedGroupData={group} setSelectedGroupData={setGroup} />
                    </View>
                )}

                <CustomInput label='Title' value={title} setValue={setTitle}></CustomInput>

                {/* Expense Items */}
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
                            {items.map((item) => (
                                <View key={item.id} className="flex-row justify-between items-center p-3 border-b border-gray-200">
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
                </View>

                <DateSelector date={date} setDate={setDate} />
                <CustomWideInput label='Note' value={notes} setValue={setNotes}></CustomWideInput>

            </ScrollView>

            {/* Receipt Scanning Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isScanning}
                onRequestClose={() => setIsScanning(false)}
            >
                <View className="flex-1 bg-black bg-opacity-70 justify-center items-center">
                    <View className="bg-white p-6 rounded-lg w-4/5 items-center">
                        <MaterialCommunityIcons name="receipt-text" size={48} color="#3b82f6" className="mb-4" />
                        <Text className="text-lg font-bold text-gray-800 mb-2">Scanning Receipt</Text>
                        <Text className="text-gray-600 text-center mb-4">Extracting information from your receipt...</Text>

                        <View className="w-full h-2 bg-gray-200 rounded-full mb-2">
                            <View
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${scanningProgress}%` }}
                            />
                        </View>
                        <Text className="text-gray-500">{scanningProgress}%</Text>
                    </View>
                </View>
            </Modal>

            {/* Expense item Overlay*/}
            <ExpenseItemOverlay
                visible={showItemOverlay}
                onClose={() => setShowItemOverlay(false)}
                onSave={handleSaveItem}
                currentItem={currentItem}
                expenseType={expenseType}
                expenseCategories={expenseCategories}
                initialExpenseMembers={expenseMembers}
            />

        </KeyboardAvoidingView>
    );

    function fetchGroupData() {
        if (group == null) return null;
        const selectedGroup = groups.find(g => g.id === group.id);
        if (!selectedGroup) return null;

        let processedMembers: MemberForExpense[] = [];
        if (selectedGroup.members && selectedGroup.members.length > 0) {
            processedMembers = selectedGroup.members.map(member => ({
                id: member.id,
                name: member.name,
                avatar: member.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
                selected: true,
                email: member.email,
                percentage: Math.floor(100 / selectedGroup.members.length)
            }));

            // Handle remainder to ensure exactly 100%
            const remainder = 100 - (Math.floor(100 / selectedGroup.members.length) * selectedGroup.members.length);
            if (remainder > 0) {
                for (let i = 0; i < remainder; i++) {
                    if (processedMembers[i]) {
                        processedMembers[i].percentage += 1;
                    }
                }
            }
        }

        setExpenseMembers(processedMembers);

        return {
            group: selectedGroup,
            members: processedMembers
        };
    }

    async function fetchGroups(): Promise<GroupMembers[]> {
        if (user) {
            const groups = await getUserGroups(user.id);
            setGroup(groups[0]);
            return groups;
        }
        else {
            return [];
        }
    }
};

export default AddExpensePage;
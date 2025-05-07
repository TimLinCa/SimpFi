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
import { loadExpenseClassifier, classifyExpense } from '@/utils/categorizeExpense';
import { Group, GroupMembers } from '@/types/group';
import { Category, ExpenseItem, MemberForExpense, ReceiptItem, ScanReceiptResult } from '@/types/interface';
import { addOrUpdatePersonalExpense, getCategories, getPersonalExpenseById, addOrUpdateGroupExpense, getGroupExpenseById } from '@/utils/database/expense';
import { useAuth } from '@/app/context/auth';
import { getUserGroups } from '@/utils/database/group'
import { useQuery } from '@tanstack/react-query'
import GroupDropDown from '@/components/ui/group/GroupDropDown';
import { CustomInput, CustomWideInput, DateSelector } from '@/components/ui/inputs';
import ExpenseItemList from '@/components/ui/group/ExpenseItemList';

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
    const [title, setTitle] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [date, setDate] = useState<Date>(new Date());
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [scanningProgress, setScanningProgress] = useState<number>(0);

    // Expense items state
    const [items, setItems] = useState<ExpenseItem[]>([]);
    const [expenseMembers, setExpenseMembers] = useState<MemberForExpense[]>([]);

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

    // Handle scan receipt (moved to top-right button)
    const scanReceipt = async (): Promise<void> => {
        const customData = require('@/data_test/receipt.json') as ScanReceiptResult;
        console.log('customData', customData.time);
        console.log('customData', new Date(customData.time));
        setTitle(customData.store_name);
        setDate(new Date(customData.time + "T12:00:00Z"));
        setItems(customData.items.map(item => ({
            id: Date.now().toString() + item.item_name,
            name: item.item_name,
            amount: Number(item.item_value),
            category: predictExpenseCategory(item.item_name), // Default category, you can change this logic
            MemberForExpenses: generateExpenseMemberForExpense(Number(item.item_value), expenseMembers),
        })));
        setIsScanning(false);
        setScanningProgress(0);

        if (Number(customData.total).toFixed(2) !== customData.items.reduce((sum: number, item: ReceiptItem) => sum + Number(item.item_value), 0).toFixed(2)) {
            Alert.alert('Notice', 'Total amount does not match the sum of items. Please double check your receipt item.');
        }

        // const { status } = await ImagePicker.requestCameraPermissionsAsync();

        // if (status !== 'granted') {
        //     Alert.alert('Permission Denied', 'Sorry, we need camera permissions to scan receipts!');
        //     return;
        // }

        // const result = await ImagePicker.launchCameraAsync({
        //     allowsEditing: true,
        //     aspect: [4, 3],
        //     quality: 1,
        // });

        // if (!result.canceled) {
        //     // Show scanning modal
        //     setIsScanning(true);
        //     setScanningProgress(0);

        //     // Simulate scanning progress
        //     timerRef.current = setInterval(() => {
        //         setScanningProgress((prev) => {
        //             if (prev >= 100) {
        //                 if (timerRef.current) {
        //                     clearInterval(timerRef.current);
        //                     timerRef.current = null;
        //                 }

        //                 // Simulate extracted data
        //                 simulateReceiptExtraction();

        //                 // Close scanning modal after a delay
        //                 setTimeout(() => {
        //                     setIsScanning(false);
        //                 }, 500);

        //                 return 100;
        //             }
        //             return prev + 5;
        //         });
        //     }, 100);
        // }
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
                    <Text className="text-lg font-bold text-white">{isEditing ? "Edit Expense" : "Add Expense"}</Text>
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
                {
                    !isEditing ? (<View className="bg-white p-4 border-b border-gray-200">
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
                    </View>) : null
                }

                {/* Group Selector - only show if expense type is 'group' */}
                {(!isEditing && expenseType === 'group') && (
                    <View className="bg-white p-4 border-b border-gray-200">
                        <Text className="text-black font-bold text-lg mb-2">Select Group</Text>
                        <GroupDropDown selectedGroupData={group} setSelectedGroupData={setGroup} />
                    </View>
                )}

                <CustomInput label='Title' value={title} setValue={setTitle}></CustomInput>
                <ExpenseItemList items={items} setItems={setItems} expenseType={expenseType} expenseCategories={expenseCategories} expenseMembers={expenseMembers}></ExpenseItemList>
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


    function predictExpenseCategory(text: string): Category {
        const predictNewCategory = classifyExpense(text);
        if (predictNewCategory) {
            const newCategory = expenseCategories.find(cat => cat.name === predictNewCategory)
            return newCategory ? newCategory : expenseCategories[0];
        }
        else {
            return expenseCategories[0];
        }
    }

    function generateExpenseMemberForExpense(itemAmount: number, expenseMembers: MemberForExpense[]): MemberForExpense[] {
        return expenseMembers.map(member => ({
            ...member,
            amount: itemAmount * (member.percentage / 100),
        }));
    }
};

export default AddExpensePage;
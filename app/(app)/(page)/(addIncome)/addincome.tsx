import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Category } from '@/types/interface';
import { getCategories, addPersonalIncome, getIncomeById } from '@/utils/database/income';
import { useAuth } from '@/app/context/auth';
import { Dropdown } from 'react-native-element-dropdown';
import { AmountInput, CategorySelector, DateSelector, CustomInput, CustomWideInput } from '@/components/ui/inputs';

interface AddIncomePageProps {
    incomeId?: string; // In a real app, you'd fetch group data based on this ID
}

const AddIncomePage: React.FC<AddIncomePageProps> = ({ incomeId }) => {
    const router = useRouter();
    const { user } = useAuth();
    const isEditing = !!incomeId;

    // State variables
    const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
    const [categoryValue, setCategoryValue] = useState<Category>();
    const [amount, setAmount] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [date, setDate] = useState<Date>(new Date());
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const initialize = async () => {
            setLoading(true);
            try {
                // Load categories
                const categories = await getCategories();
                setIncomeCategories(categories);

                // If editing, load income data
                if (isEditing && incomeId) {
                    const incomeData = await getIncomeById(incomeId);
                    if (incomeData) {
                        setTitle(incomeData.title || '');
                        setAmount(incomeData.amount?.toString() || '');
                        setNotes(incomeData.description || '');

                        // Set date if available
                        if (incomeData.date) {
                            setDate(new Date(incomeData.date));
                        }

                        // Find and set category
                        setCategoryValue(incomeData.category);
                    }
                }
            } catch (error) {
                console.error('Error initializing:', error);
                Alert.alert('Error', 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        initialize();
    }, [incomeId, isEditing]);

    // Format categories for dropdown
    const categoryData = incomeCategories.map(category => ({
        label: category.name,
        value: category.id,
        icon: category.icon_name,
        item: category
    }));

    // Handle save
    const handleSave = async (): Promise<void> => {
        if (!user) return;

        if (!amount || !title || !categoryValue) {
            Alert.alert('Missing Information', 'Please fill in all required fields: Amount, Title, and Category');
            return;
        }

        // Validate amount is a valid number
        const amountNumber = parseFloat(amount);
        if (isNaN(amountNumber) || amountNumber <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid positive amount');
            return;
        }

        try {
            // Find the selected category by id
            const selectedCategory = incomeCategories.find(cat => cat.name === categoryValue.name);

            if (!selectedCategory) {
                Alert.alert('Error', 'Please select a valid category');
                return;
            }

            const newIncomeId = await addPersonalIncome(
                user.id,
                title,
                amountNumber,
                selectedCategory,
                notes,
                date.toISOString().split('T')[0],
                incomeId
            );

            if (newIncomeId) {
                console.log('Income saved successfully with ID:', newIncomeId);
                Alert.alert(
                    'Success',
                    'Your income has been saved successfully',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            } else {
                Alert.alert('Error', 'Failed to save income. Please try again.');
            }
        } catch (error) {
            console.error('Error adding income:', error);
            Alert.alert('Error', 'There was an error saving your income. Please try again.');
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#43BFF4" />
                <Text className="mt-4 text-gray-600">Loading...</Text>
            </View>
        );
    }

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

                <View className="flex-1 items-center w-1/3">
                    <Text className="text-lg font-bold text-white">
                        {isEditing ? 'Edit Income' : 'Add Income'}
                    </Text>
                </View>

                <View className='flex-row items-center w-1/3 justify-end'>
                    <TouchableOpacity
                        onPress={handleSave}
                        className="w-10 h-10 justify-center items-center"
                    >
                        <MaterialCommunityIcons name="check" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Rest of the component remains the same */}
            <ScrollView className="flex-1 bg-gray-100">
                {/* Title Input */}
                <CustomInput label={'Title'} value={title} setValue={setTitle}></CustomInput>

                {/* Amount Input */}
                <AmountInput amount={amount} setAmount={setAmount}></AmountInput>

                {/* Category Selector using Dropdown */}
                <View className="bg-white p-4 border-b border-gray-200">
                    <Text className="text-black font-bold text-lg mb-2">Category</Text>
                    <CategorySelector selectedCategory={categoryValue} setSelectedCategory={setCategoryValue} categoryList={incomeCategories} />
                </View>

                <DateSelector date={date} setDate={setDate}></DateSelector>
                <CustomWideInput label='Note' value={notes} setValue={setNotes}></CustomWideInput>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default AddIncomePage;
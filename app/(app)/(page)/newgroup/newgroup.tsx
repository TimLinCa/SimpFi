import React, { useState } from 'react';
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
import { useAuth } from '@/app/context/auth';
import { createGroup } from '@/utils/database/group';

const NewGroupPage = () => {
    const router = useRouter();
    const { user } = useAuth();

    // State variables
    const [groupName, setGroupName] = useState<string>('');
    const [iconUrl, setIconUrl] = useState<string>('account-group');
    const [loading, setLoading] = useState<boolean>(false);

    // Icons available for group
    const availableIcons = [
        'account-group', 'home', 'office-building', 'food', 'cart',
        'car', 'airplane', 'beach', 'hiking', 'bag-personal'
    ];

    // Handle save
    const handleSave = async (): Promise<void> => {
        if (!user) return;

        if (!groupName) {
            Alert.alert('Missing Information', 'Please enter a group name');
            return;
        }

        try {
            setLoading(true);

            const newGroupId = await createGroup(
                groupName,
                iconUrl,
                user.id
            );

            if (newGroupId) {
                console.log('Group created successfully with ID:', newGroupId);
                Alert.alert(
                    'Success',
                    'Your group has been created successfully',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            } else {
                Alert.alert('Error', 'Failed to create group. Please try again.');
            }
        } catch (error) {
            console.error('Error creating group:', error);
            Alert.alert('Error', 'There was an error creating your group. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#43BFF4" />
                <Text className="mt-4 text-gray-600">Creating group...</Text>
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
                <View className="w-1/4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 justify-center items-center"
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View className="flex-1 items-center w-2/4">
                    <Text className="text-lg font-bold text-white">
                        Create New Group
                    </Text>
                </View>

                <View className='flex-row items-center w-1/4 justify-end'>
                    <TouchableOpacity
                        onPress={handleSave}
                        className="w-10 h-10 justify-center items-center"
                    >
                        <MaterialCommunityIcons name="check" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 bg-gray-100">
                {/* Group Name Input */}
                <View className="bg-white p-4 border-b border-gray-200">
                    <Text className="text-black font-bold text-lg mb-2">Group Name</Text>
                    <TextInput
                        className="bg-gray-100 p-3 rounded-lg text-gray-800"
                        value={groupName}
                        onChangeText={setGroupName}
                        placeholder="Enter group name"
                        placeholderTextColor="#9ca3af"
                    />
                </View>

                {/* Icon Selector */}
                <View className="bg-white p-4 border-b border-gray-200">
                    <Text className="text-black font-bold text-lg mb-2">Group Icon</Text>
                    <View className="flex-row flex-wrap justify-start items-center">
                        {availableIcons.map((icon) => (
                            <TouchableOpacity
                                key={icon}
                                onPress={() => setIconUrl(icon)}
                                className={`m-2 p-3 rounded-full ${iconUrl === icon ? 'bg-blue-100' : 'bg-gray-100'
                                    }`}
                                style={{ width: 60, height: 60, justifyContent: 'center', alignItems: 'center' }}
                            >
                                <MaterialCommunityIcons
                                    name={icon}
                                    size={28}
                                    color={iconUrl === icon ? '#3b82f6' : '#6b7280'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Members Info (Preview) */}
                <View className="bg-white p-4 mt-4">
                    <Text className="text-black font-bold text-lg mb-2">Group Members</Text>
                    <View className="bg-gray-100 p-4 rounded-lg">
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="account" size={24} color="#3b82f6" />
                            <Text className="ml-2 text-gray-800">You will be added automatically</Text>
                        </View>
                        <Text className="mt-4 text-gray-500">
                            You can add more members after creating the group
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default NewGroupPage;
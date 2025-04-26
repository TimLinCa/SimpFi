import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { joinGroup, JoinGroupResponse } from '@/utils/database/group';
import { useAuth } from '@/app/context/auth';
interface JoinGroupOverlayProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: (groupId: string) => void;
}

const JoinGroupOverlay: React.FC<JoinGroupOverlayProps> = ({
    visible,
    onClose,
    onSuccess
}) => {
    const [invitationCode, setInvitationCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { user } = useAuth();
    // Reset states when overlay is opened
    React.useEffect(() => {
        if (visible) {
            setInvitationCode('');
            setErrorMessage(null);
        }
    }, [visible]);

    const handleJoinGroup = async () => {
        if (!user) {
            Alert.alert('Error', 'User not authenticated. Please log in to join a group.');
            return;
        }
        if (!invitationCode.trim()) {
            setErrorMessage('Please enter an invitation code');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const result = await joinGroup(user.id, invitationCode.trim());

            if (!result.success) {
                throw new Error(result.message || 'Failed to join group');
            }

            // Success! Close the overlay and notify parent component
            Alert.alert('Success', 'You have successfully joined the group!');
            if (onSuccess && result.group_id) {
                onSuccess(result.group_id);
            }
            onClose();
        } catch (error: any) {
            console.error('Error joining group:', error);
            setErrorMessage(error.message || 'An error occurred while joining the group');
        } finally {
            setIsLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <View className="absolute inset-0 z-50 flex justify-center items-center">
            {/* Semi-transparent backdrop */}
            <View
                className="absolute inset-0 bg-black opacity-40"
                onTouchStart={onClose}
            />

            {/* Content container */}
            <View
                className="w-11/12 max-w-md bg-white rounded-xl shadow-xl"
                onTouchStart={(e) => e.stopPropagation()} // Prevent closing when clicking on content
                style={{ maxHeight: '60%' }}
            >
                {/* Header */}
                <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                    <Text className="text-lg font-bold text-gray-800">Join Group</Text>
                    <TouchableOpacity
                        onPress={onClose}
                        className="h-8 w-8 rounded-full flex items-center justify-center"
                    >
                        <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
                    <View className="mb-6">
                        <Text className="text-gray-700 text-base mb-4 text-center">
                            Enter the invitation code to join a group
                        </Text>

                        {/* Invitation code input */}
                        <View className="mb-4">
                            <Text className="text-gray-600 mb-1 font-medium">Invitation Code</Text>
                            <TextInput
                                className="bg-gray-100 rounded-lg p-3 text-gray-800 text-lg tracking-wider"
                                value={invitationCode}
                                onChangeText={setInvitationCode}
                                placeholder="Enter code here"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isLoading}
                            />
                            {errorMessage && (
                                <Text className="text-red-500 mt-1 text-sm">{errorMessage}</Text>
                            )}
                        </View>

                        {/* Information text */}
                        <Text className="text-gray-500 text-sm">
                            Ask the group creator for an invitation code. This code is required to join their group.
                        </Text>
                    </View>

                    {/* Action button */}
                    <View className="mt-4 mb-2">
                        <TouchableOpacity
                            onPress={handleJoinGroup}
                            disabled={isLoading}
                            className={`py-3 px-6 rounded-lg flex-row justify-center items-center ${isLoading ? 'bg-gray-400' : 'bg-[#43BFF4]'}`}
                        >
                            {isLoading ? (
                                <>
                                    <ActivityIndicator size="small" color="#ffffff" />
                                    <Text className="text-white font-medium ml-2">Joining...</Text>
                                </>
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="account-group" size={18} color="#fff" />
                                    <Text className="text-white font-medium ml-2">Join Group</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

export default JoinGroupOverlay;
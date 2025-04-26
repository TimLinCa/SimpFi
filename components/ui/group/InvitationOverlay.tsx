import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Share, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { getGroupInvitationCode } from '@/utils/database/group';

interface InvitationOverlayProps {
    visible: boolean;
    onClose: () => void;
    groupId: string;
}

const InvitationOverlay: React.FC<InvitationOverlayProps> = ({
    visible,
    onClose,
    groupId
}) => {
    const [invitationCode, setInvitationCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isCopied, setIsCopied] = useState<boolean>(false);

    useEffect(() => {
        if (visible) {
            fetchInvitationCode();
        }
    }, [visible, groupId]);

    const fetchInvitationCode = async () => {
        setIsLoading(true);
        try {
            const code = await getGroupInvitationCode(groupId);
            if (!code) {
                throw new Error('No invitation code found');
            }
            setInvitationCode(code);
        } catch (error) {
            console.error('Error fetching invitation code:', error);
            Alert.alert('Error', 'Could not retrieve invitation code');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await Clipboard.setStringAsync(invitationCode);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // Reset copied state after 2 seconds
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            Alert.alert('Error', 'Failed to copy to clipboard');
        }
    };

    const shareInvitationCode = async () => {
        try {
            await Share.share({
                message: `Join my expense group with this invitation code: ${invitationCode}`,
            });
        } catch (error) {
            console.error('Error sharing invitation code:', error);
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
                    <Text className="text-lg font-bold text-gray-800">Invite People</Text>
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
                            Share this invitation code to let others join your group
                        </Text>

                        {isLoading ? (
                            <View className="items-center py-8">
                                <ActivityIndicator size="large" color="#43BFF4" />
                                <Text className="text-gray-500 mt-2">Retrieving code...</Text>
                            </View>
                        ) : (
                            <>
                                {/* Invitation code display */}
                                <View className="bg-gray-100 rounded-lg p-4 mb-4 flex-row justify-between items-center">
                                    <Text className="text-lg font-bold tracking-widest text-center text-gray-800">
                                        {invitationCode}
                                    </Text>
                                    <View className="flex-row">
                                        <TouchableOpacity
                                            onPress={copyToClipboard}
                                            className="mx-1 p-2 rounded-full bg-gray-200"
                                        >
                                            <MaterialCommunityIcons
                                                name={isCopied ? "check" : "content-copy"}
                                                size={20}
                                                color={isCopied ? "#22c55e" : "#6b7280"}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Information text */}
                                <Text className="text-gray-500 text-sm">
                                    People you invite will need to enter this code in the app to join your group.
                                </Text>
                            </>
                        )}
                    </View>

                    {/* Action buttons */}
                    <View className="mt-4 mb-2 flex-row justify-end">
                        <TouchableOpacity
                            onPress={shareInvitationCode}
                            className="bg-[#43BFF4] py-2 px-6 rounded-lg flex-row items-center"
                        >
                            <MaterialCommunityIcons name="share-variant" size={18} color="#fff" />
                            <Text className="text-white font-medium ml-2">Share</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

export default InvitationOverlay;
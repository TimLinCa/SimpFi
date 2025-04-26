import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Member } from '@/types/group'; // Adjust the import path as necessary
// Component to display stacked avatars
// Props interfaces

interface StackedAvatarsProps {
    members: Member[];
}

const StackedAvatars: React.FC<StackedAvatarsProps> = ({ members }) => {
    // Show maximum of 5 avatars
    if (!members || members.length === 0) return null;
    const visibleMembers = members.slice(0, 5);
    const remainingCount = members.length > 5 ? members.length - 5 : 0;

    return (
        <View className="flex-row items-center">
            {visibleMembers.map((member, index) => (
                <View
                    key={member.id}
                    className="rounded-full overflow-hidden border-2 border-white"
                    style={{ marginLeft: index === 0 ? 0 : -10, zIndex: 10 - index }}
                >
                    <Image
                        source={{ uri: member.avatar }}
                        className="w-8 h-8"
                    />
                </View>
            ))}

            {remainingCount > 0 && (
                <View className="ml-1 flex-row items-center">
                    <Text className="text-gray-600 font-medium">+{remainingCount}</Text>
                    <View className="ml-1 flex-row">
                        <View className="w-1 h-1 rounded-full bg-gray-600 mx-0.5" />
                        <View className="w-1 h-1 rounded-full bg-gray-600 mx-0.5" />
                        <View className="w-1 h-1 rounded-full bg-gray-600 mx-0.5" />
                    </View>
                </View>
            )}
        </View>
    );
};

export default StackedAvatars;
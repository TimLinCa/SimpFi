import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';

import StackedAvatars from './StackedAvatars';
import { useRouter } from 'expo-router';
import { GroupMembers } from '@/types/group'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface GroupItemProps {
    group: GroupMembers;
}

// Group list item component
const GroupItem = ({ group }: GroupItemProps) => {
    const router = useRouter();
    const handleGroupPress = (groupId: string) => {
        // Using the router's push method to navigate with params
        router.push({
            pathname: '/(app)/(page)/(group)/[id]',
            params: { id: groupId }
        });
    };

    return (
        <TouchableOpacity
            className="flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-3"
            onPress={() => handleGroupPress(group.id)}
        >
            <View className="w-10 h-10 rounded-full justify-center items-center mr-3" style={{ backgroundColor: group.iconColor }}>
                <MaterialCommunityIcons name={group.iconName} size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
                <Text className="font-bold text-lg text-gray-800">{group.name}</Text>
                <Text className="text-gray-500 text-sm">{group.members.length} members</Text>
            </View>

            <StackedAvatars members={group.members} />
        </TouchableOpacity>
    );
};

export default GroupItem;
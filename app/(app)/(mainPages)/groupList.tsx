import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GroupItem from '@/components/ui/group/GroupItem';
import { useRouter } from 'expo-router';
import MenuButton from '@/components/ui/home/MenuButton';
import { useGroupsHook } from '@/hooks/groupshook';
import JoinGroupOverlay from '@/components/ui/group/JoinGroupOverlay';

// Main group page component
const GroupPage: React.FC = () => {
    const [groups, setGroups] = useGroupsHook();
    const [menuVisible, setMenuVisible] = React.useState(false);
    const [joinGroupVisible, setJoinGroupVisible] = React.useState(false);
    const router = useRouter();

    const handleCreateGroup = (): void => {
        router.push('/(app)/(page)/newgroup/newgroup');
    };

    const handleJoinGroup = (): void => {
        // Close the menu and show the join group overlay
        setMenuVisible(false);
        setJoinGroupVisible(true);
    };

    const handleJoinSuccess = (groupId: string): void => {
        // Refresh groups list after successfully joining a group
        setGroups((prevGroups) => {
            if (!prevGroups) return prevGroups;

            // If the group is already in the list, no need to refetch
            const groupExists = prevGroups.some(group => group.id === groupId);
            if (groupExists) return prevGroups;

            // Otherwise, trigger a refresh by returning the existing list
            // The hook should detect the change and refetch
            return [...prevGroups];
        });
    };

    return (
        <View className="flex-1 bg-gray-100">
            {/* Header with back button, title and buttons */}
            <View className="bg-[#43BFF4] pt-2 pb-2 flex-row items-center px-4 shadow-sm">
                <View className='w-1/3 justify-start'>
                    <MenuButton />
                </View>

                <View className="w-1/3 items-center justify-center">
                    <Text className="text-lg font-bold text-white">Groups</Text>
                </View>

                <View className="flex-row items-center w-1/3 justify-end">
                    <TouchableOpacity
                        onPress={handleCreateGroup}
                        className="w-10 h-10 justify-center items-center"
                    >
                        <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setMenuVisible(!menuVisible)}
                        className="w-10 h-10 justify-center items-center"
                    >
                        <MaterialCommunityIcons name="dots-vertical" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Group list */}
            <ScrollView className="flex-1 p-4">
                {groups ? groups.map(group => (
                    <GroupItem key={group.id} group={group} />
                )) : null}
            </ScrollView>

            {/* Menu Dropdown */}
            {menuVisible && (
                <View className="absolute right-2 top-12 z-10 bg-white rounded-lg shadow-lg overflow-hidden">
                    <TouchableOpacity
                        className="flex-row items-center px-4 py-3 border-b border-gray-200"
                        onPress={handleJoinGroup}
                    >
                        <Text className="text-gray-800">Join a group</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Click anywhere else to close the menu */}
            {menuVisible && (
                <TouchableOpacity
                    className="absolute inset-0 h-full w-full z-0"
                    onPress={() => setMenuVisible(false)}
                />
            )}

            {/* Join Group Overlay */}
            <JoinGroupOverlay
                visible={joinGroupVisible}
                onClose={() => setJoinGroupVisible(false)}
                onSuccess={handleJoinSuccess}
            />
        </View>
    );
};

export default GroupPage;
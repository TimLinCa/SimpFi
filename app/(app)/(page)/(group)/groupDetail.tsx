import React, { useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Image, Modal, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ExpenseItem, TransactionItem, MemberWithBalanceItem, FloatingButton, InvitationOverlay, GroupIconEditOverlay } from '@/components/ui/group';
import { TransactionData, GroupExpense, Member, Group, GroupDetail, GroupMembers, MemberWithBalance } from "@/types/group"
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getGroupDetails, leaveGroup } from '@/utils/database/group';
import { useAuth } from '@/app/context/auth';
import { useRefreshOnFocus } from '@/hooks';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface GroupDetailProps {
    groupId: string;
}

const GroupDetailPage: React.FC<GroupDetailProps> = ({ groupId }) => {
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const {
        data: groupData,
        refetch: refetchGroupData,
        isFetching,
        isLoading,
        isError,
        error } = useQuery(
            {
                queryKey: ['groupDetail', groupId],
                queryFn: fetchGroupDetail,
                enabled: !!user,
            }
        )

    useRefreshOnFocus('groupDetail', refetchGroupData);

    // Menu state
    const [menuVisible, setMenuVisible] = useState<boolean>(false);
    const [leaveModalVisible, setLeaveModalVisible] = useState<boolean>(false);
    const [invitationVisible, setInvitationVisible] = useState<boolean>(false);
    const [groupIconEditVisible, setGroupIconEditVisible] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'transactions'>('balances');

    // Handle menu options
    const handleEditGroupIcon = () => {
        setMenuVisible(false);
        setGroupIconEditVisible(true); // Open group icon edit overlay
    };

    const handleLeaveGroup = () => {
        setMenuVisible(false);
        setLeaveModalVisible(true);
    };

    const confirmLeaveGroup = async () => {
        console.log('Leaving group');
        setLeaveModalVisible(false);
        if (groupData?.transactions.some(transaction => transaction.amount !== 0)) {
            alert("You cannot leave the group while there are pending transactions.");
            return;
        }
        if (!user || !groupId) {
            alert("You must be logged in to leave a group.");
            return;
        }
        const response = await leaveGroup(user.id, groupId);
        if (!response.success) {
            alert("Failed to leave group: " + response.message);
            return;
        }
        // API call to leave the group
        router.back(); // Navigate back after leaving
    };

    // Render expense item
    const renderExpenseItem = ({ item }: { item: GroupExpense }) => {
        return (
            <ExpenseItem item={item}></ExpenseItem>
        );
    };

    // Render balance item
    const renderBalanceItem = ({ item }: { item: MemberWithBalance }) => {
        return (
            <MemberWithBalanceItem member={item}>
            </MemberWithBalanceItem>
        );
    };

    // Render transaction item
    const renderTransactionItem = ({ item }: { item: TransactionData }) => {
        return (
            <TransactionItem item={item}></TransactionItem>
        );
    };

    // Show loading state
    if (isLoading || isFetching) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-100">
                <ActivityIndicator size="large" color="#43BFF4" />
                <Text className="mt-4 text-gray-600">Loading group details...</Text>
            </View>
        );
    }

    // Show error state
    if (isError || !groupData) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-100 p-4">
                <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#f87171" />
                <Text className="mt-4 text-gray-800 font-bold text-center">Error loading group</Text>
                <Text className="mt-2 text-gray-600 text-center">
                    {error instanceof Error ? error.message : "Couldn't load group details"}
                </Text>
                <TouchableOpacity
                    className="mt-6 bg-[#43BFF4] py-2 px-6 rounded-lg"
                    onPress={() => router.back()}
                >
                    <Text className="text-white font-medium">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const hasNoMembers = !groupData.membersWithBalance || groupData.membersWithBalance.length === 0;

    return (
        <>
            <View className="flex-1 bg-gray-100">
                {/* Header with back button and group name */}
                <View className="bg-[#43BFF4] pt-2 pb-2 flex-row items-center px-4 shadow-sm">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 justify-center items-center"
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    <View className="flex-1 items-center">
                        <Text className="text-lg font-bold text-white">{groupData.group.name}</Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => setMenuVisible(!menuVisible)}
                        className="w-10 h-10 justify-center items-center"
                    >
                        <MaterialCommunityIcons name="dots-vertical" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Menu Dropdown */}
                {menuVisible && (
                    <View className="absolute right-2 top-12 z-10 bg-white rounded-lg shadow-lg overflow-hidden">
                        <TouchableOpacity
                            className="flex-row items-center px-4 py-3 border-b border-gray-200"
                            onPress={() => { setInvitationVisible(true); setMenuVisible(false); }}
                        >
                            <Text className="text-gray-800">Invite People</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center px-4 py-3 border-b border-gray-200"
                            onPress={handleEditGroupIcon}
                        >
                            <Text className="text-gray-800">Edit Group Icon</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center px-4 py-3"
                            onPress={handleLeaveGroup}
                        >
                            <Text className="text-red-500">Leave Group</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Tab buttons */}
                <View className="flex-row border-b border-gray-200 bg-white">
                    <TouchableOpacity
                        className={`flex-1 py-3 ${activeTab === 'balances' ? 'border-b-2 border-blue-500' : ''}`}
                        onPress={() => setActiveTab('balances')}
                    >
                        <Text className={`text-center font-medium ${activeTab === 'balances' ? 'text-blue-500' : 'text-gray-500'}`}>
                            Balances
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className={`flex-1 py-3 ${activeTab === 'expenses' ? 'border-b-2 border-blue-500' : ''}`}
                        onPress={() => setActiveTab('expenses')}
                    >
                        <Text className={`text-center font-medium ${activeTab === 'expenses' ? 'text-blue-500' : 'text-gray-500'}`}>
                            Expenses
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className={`flex-1 py-3 ${activeTab === 'transactions' ? 'border-b-2 border-blue-500' : ''}`}
                        onPress={() => setActiveTab('transactions')}
                    >
                        <Text className={`text-center font-medium ${activeTab === 'transactions' ? 'text-blue-500' : 'text-gray-500'}`}>
                            Transactions
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tab content */}
                <View className="flex-1 px-4 py-3">
                    {activeTab === 'balances' ? (
                        <>
                            {/* Balance list */}
                            {hasNoMembers ? (
                                <View className="flex-1 justify-center items-center py-8">
                                    <MaterialCommunityIcons name="account-group" size={56} color="#9ca3af" />
                                    <Text className="text-gray-500 mt-4 text-center">No members in this group yet</Text>
                                    <Text className="text-gray-500 mb-6 text-center">Invite people to start tracking expenses together</Text>

                                    <TouchableOpacity
                                        onPress={() => setInvitationVisible(true)}
                                        className="bg-[#43BFF4] py-3 px-6 rounded-lg flex-row items-center mt-2"
                                    >
                                        <MaterialCommunityIcons name="account-plus" size={20} color="#fff" />
                                        <Text className="text-white font-medium ml-2">Invite People</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <FlatList
                                    data={groupData.membersWithBalance}
                                    renderItem={renderBalanceItem}
                                    keyExtractor={item => item.id.toString()}
                                    showsVerticalScrollIndicator={false}
                                />
                            )}
                        </>
                    ) : activeTab === 'expenses' ? (
                        <FlatList
                            data={groupData.Expenses}
                            renderItem={renderExpenseItem}
                            keyExtractor={item => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View className="items-center justify-center py-10">
                                    <MaterialCommunityIcons name="receipt" size={48} color="#9ca3af" />
                                    <Text className="text-gray-500 mt-3">No expenses added yet</Text>
                                </View>
                            }
                        />
                    ) : (
                        <>
                            {/* Transaction list */}
                            <FlatList
                                data={groupData.transactions}
                                renderItem={renderTransactionItem}
                                keyExtractor={item => item.id}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={
                                    <View className="items-center justify-center py-10">
                                        <MaterialCommunityIcons name="cash-remove" size={48} color="#9ca3af" />
                                        <Text className="text-gray-500 mt-3">No transaction history yet</Text>
                                    </View>
                                }
                            />
                        </>
                    )}
                </View>
            </View>

            {/* Leave Group Confirmation Modal */}
            <Modal
                animationType="fade"
                presentationStyle='pageSheet'
                visible={leaveModalVisible}
                onRequestClose={() => setLeaveModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                    <View className="bg-white rounded-lg p-5 w-4/5 shadow-lg">
                        <Text className="text-lg font-bold text-center mb-4">Leave Group?</Text>
                        <Text className="text-gray-700 mb-4 text-center">
                            Are you sure you want to leave "{groupData.group.name}"? You will no longer have access to this group's expenses and transactions.
                        </Text>
                        <View className="flex-row justify-between mt-2">
                            <TouchableOpacity
                                className="flex-1 bg-gray-200 py-2 rounded-lg mr-2"
                                onPress={() => setLeaveModalVisible(false)}
                            >
                                <Text className="text-center font-medium">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-red-500 py-2 rounded-lg ml-2"
                                onPress={confirmLeaveGroup}
                            >
                                <Text className="text-center font-medium text-white">Leave</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Invitation Overlay */}
            <InvitationOverlay
                visible={invitationVisible}
                onClose={() => setInvitationVisible(false)}
                groupId={groupId}
            />

            {/*Group icon edit Overlay*/}
            <GroupIconEditOverlay
                visible={groupIconEditVisible}
                onClose={() => setGroupIconEditVisible(false)}
                groupId={groupId}
                currentIcon={groupData.group.iconName}
                currentColor={groupData.group.iconColor}>
            </GroupIconEditOverlay>

            <FloatingButton group={groupData?.group} />
            {/* Click anywhere else to close the menu */}
            {menuVisible && (
                <TouchableOpacity
                    className="absolute inset-0 h-full w-full z-0"
                    onPress={() => setMenuVisible(false)}
                />
            )}
        </>
    );

    async function fetchGroupDetail(): Promise<GroupDetail> {
        try {
            if (user) {
                const groupDetail = await getGroupDetails(groupId, user.id);
                return groupDetail;
            }
            else {
                throw new Error('User not authenticated');
            }
        } catch (error) {
            console.error('Error fetching group details:', error);
            throw error;
        }
    }

    const refreshGroupData = useCallback(async (): Promise<void> => {
        if (user?.id) {
            try {
                // Force clear any cached data
                queryClient.invalidateQueries({ queryKey: ['groupDetail'] });

                // Refetch data
                await refetchGroupData();
            } catch (error) {
                console.error('Error refreshing data:', error);
            }
        }
    }, [user, queryClient, refetchGroupData]);
};

export default GroupDetailPage;
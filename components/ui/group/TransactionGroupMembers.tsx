import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import React from 'react'
import { useAuth } from '@/app/context/auth';
import { GroupMembers, Member } from '@/types/group'

interface TransactionGroupMembersProps {
    selectedGroupData: GroupMembers, // Replace with your actual type
    selectedMember: Member | null,
    setSelectedMember: (member: Member) => void,
}

const TransactionGroupMembers: React.FC<TransactionGroupMembersProps> = (
    {
        selectedGroupData,
        selectedMember,
        setSelectedMember,
    }) => {

    const { user } = useAuth()

    return (
        <View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="pb-2"
            >
                {user && selectedGroupData.members.length > 0 ?
                    selectedGroupData.members.map(member => (
                        // Check if the member is the current user
                        member.id.toString() === user.id ? null : // Skip rendering for the current user
                            <TouchableOpacity
                                key={`to-${member.id}`}
                                onPress={() => setSelectedMember(member)}
                                className={`mr-3 items-center ${selectedMember?.id === member.id ? 'opacity-100' : 'opacity-50'}`}
                            >
                                <View className={`relative ${selectedMember?.id === member.id ? 'border-2 border-blue-500' : ''} rounded-full`}>
                                    <Image
                                        source={{ uri: member.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' }}
                                        className="w-16 h-16 rounded-full"
                                    />
                                    {selectedMember?.id === member.id && (
                                        <View className="absolute bottom-0 right-0 bg-green-500 rounded-full w-6 h-6 items-center justify-center border-2 border-white">
                                            <MaterialCommunityIcons name="check" size={14} color="#fff" />
                                        </View>
                                    )}
                                </View>
                                <Text className={`text-sm mt-1 ${selectedMember?.id === member.id ? 'font-bold' : ''}`}>
                                    {member.name}
                                </Text>
                            </TouchableOpacity>
                    )) : null}
            </ScrollView>
        </View>
    )
}

export default TransactionGroupMembers
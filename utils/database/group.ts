import { supabase } from '@/utils/supabase';
import { Group, GroupMembers, GroupDetail } from '@/types/group';
import { Category } from '@/types/interface';
/**
 * Creates a new group and adds the current user as a member
 * 
 * @param name - Name of the group
 * @param iconUrl - URL or path to the group's icon
 * @param userId - Current user's UUID
 * @returns Promise resolving to the new group ID or null if error
 */
export const createGroup = async (
    name: string,
    iconUrl: string,
    userId: string
): Promise<number | null> => {
    try {
        const { data, error } = await supabase.rpc('create_group', {
            p_name: name,
            p_icon_url: iconUrl,
            p_creator_id: userId
        });

        if (error) {
            console.error('Error creating group:', error);
            return null;
        }

        return data as number; // The ID of the new group
    } catch (error) {
        console.error('Unexpected error creating group:', error);
        return null;
    }
};

/**
 * Fetches all groups that a user is a member of
 * 
 * @param userId - The UUID of the user
 * @returns Promise resolving to an array of groups or an empty array if error
 */
export const getUserGroups = async (userId: string): Promise<GroupMembers[]> => {
    if (!userId) {
        console.error('getUserGroups called with invalid userId');
        return [];
    }

    try {
        // Call the database function to get user's groups
        const { data, error } = await supabase.rpc('get_user_group_list', {
            p_user_id: userId
        });
        if (error) {
            console.error('Error fetching user groups:', error.message);
            return [];
        }

        // Transform database response to match the expected interface
        const groups: GroupMembers[] = data?.map((group: any) => (
            {
                id: group.id,            // UUID converted to number in the interface
                name: group.name,
                iconName: group.icon_url,
                iconColor: group.icon_color || '', // Default to empty string if icon_color is null
                members: (group.members || []).map((member: any) => ({
                    id: member.id,         // UUID converted to number in the interface
                    name: member.name,
                    email: member.email,
                    avatar: member.avatar || ''  // Default to empty string if avatar is null
                }))
            })) || [];
        return groups;
    } catch (error) {
        console.error('Unexpected error fetching user groups:', error instanceof Error ? error.message : String(error));
        return [];
    }
};

/**
 * Fetches detailed information about a specific group including its members
 * 
 * @param groupId - The ID of the group to fetch
 * @param userId - The UUID of the current user
 * @returns Promise resolving to the group details or null if error
 */
export const getGroupDetails = async (groupId: string, userId: string): Promise<GroupDetail> => {
    const { data, error } = await supabase
        .rpc('get_group_details', {
            p_group_id: groupId,
            p_user_id: userId
        }) as { data: DBGroupDetails, error: any };

    if (error) {
        console.error('Error fetching group details:', error);
        throw error;
    }

    const group: Group = {
        id: data.group.id,
        name: data.group.name,
        iconName: data.group.icon_url,
        iconColor: data.group.icon_color || ''
    }

    // Transform the data to match the GroupDetail interface
    const groupDetail: GroupDetail = {
        group: group,
        membersWithBalance: data.members.map((member: DBMember) => ({
            id: member.id,
            name: member.username,
            email: '', // Email is not returned from the RPC function
            avatar: member.avatar_url,
            balance: member.id == userId ? 0 : member.relative_balance
        })),
        Expenses: data.expenses.map((expense: DBExpense) => ({
            id: expense.id,
            group: group,
            title: expense.title,
            amount: expense.total_amount,
            date: expense.date,
            paidBy: {
                id: expense.paid_by.id,
                name: expense.paid_by.username,
                email: '', // Email is not returned from the RPC function
                avatar: expense.paid_by.avatar_url
            },
            category: {
                id: "1",
                name: expense.category.name,
                icon_name: expense.category.icon_name,
                icon_color: expense.category.icon_color
            },
            participantsNumber: expense.participants // Now using the participants count from the RPC
        })),
        transactions: data.transactions.map((transaction: DBTransaction) => ({
            id: transaction.id,
            group: group,
            amount: transaction.amount,
            paidBy: {
                id: transaction.paid_by.id,
                name: transaction.paid_by.username,
                email: '', // Email is not returned from the RPC function
                avatar: transaction.paid_by.avatar_url
            },
            paidTo: {
                id: transaction.paid_to.id,
                name: transaction.paid_to.username,
                email: '', // Email is not returned from the RPC function
                avatar: transaction.paid_to.avatar_url
            },
            date: transaction.date,
            note: transaction.notes || ''
        }))
    };

    return groupDetail;
};


/**
 * Fetches detailed information about all groups including its members
 * 
 * @param userId - The UUID of the current user
 * @returns Promise resolving to the group details or null if error
 */
export const getAllGroupDetails = async (userId: string): Promise<GroupDetail[]> => {
    const { data, error } = await supabase
        .rpc('get_user_groups_details', {
            p_user_id: userId
        }) as { data: DBGroupDetails[], error: any };

    if (error) {
        console.error('Error fetching group details:', error);
        throw error;
    }

    const groupDetails: GroupDetail[] = data.map((groupData: DBGroupDetails) => ({
        group: {
            id: groupData.group.id,
            name: groupData.group.name,
            iconName: groupData.group.icon_url,
            iconColor: groupData.group.icon_color || ''
        },
        membersWithBalance: groupData.members ? groupData.members.map((member: DBMember) => ({
            id: member.id,
            name: member.username,
            email: '', // Email is not returned from the RPC function
            avatar: member.avatar_url,
            balance: member.relative_balance
        })) : [],
        Expenses: [],
        transactions: []
    }));

    return groupDetails;
}

export const getGroupInvitationCode = async (groupId: string): Promise<string | null> => {
    const { data, error } = await supabase
        .rpc('get_group_invitation_code', {
            p_group_id: groupId
        });

    if (error) {
        console.error('Error getting invitation code:', error);
        return null;
    }

    return data;
}

/**
 * Response type for the join_group database function
 */
export interface JoinGroupResponse {
    success: boolean;
    message: string;
    status: number;
    member_id?: string; // Optional as it's only present on success
    group_id?: string;  // Optional as it's only present on success
}

/**
 * Joins a user to a group using an invitation code
 * @param invitationCode The group's invitation code
 * @returns The response from the database function
 */
export const joinGroup = async (userId: string, invitationCode: string): Promise<JoinGroupResponse> => {
    // Call the join_group database function
    const { data, error } = await supabase
        .rpc('join_group', {
            p_user_id: userId,
            p_invitation_code: invitationCode
        });

    if (error) {
        console.error('Error joining group:', error);
        return {
            success: false,
            message: error.message || 'An error occurred while joining the group',
            status: 500
        };
    }

    // Return the full response from the database function
    return data as JoinGroupResponse;
};

export const leaveGroup = async (userId: string, groupId: string): Promise<LeaveGroupResponse> => {
    const { data, error } = await supabase
        .rpc('leave_group', {
            p_user_id: userId,
            p_group_id: groupId
        });

    if (error) {
        console.error('Error leaving group:', error);
        return {
            success: false,
            message: error.message || 'An error occurred while leaving the group',
            group_deleted: false
        };
    }

    if (!data) {
        console.error('No data returned from leave_group RPC');
        return {
            success: false,
            message: 'No data returned from leave_group RPC',
            group_deleted: false
        };
    }

    return {
        success: data.success,
        message: data.message || 'Successfully left the group',
        group_deleted: data.group_deleted || false
    };
}

export const updateGroupIcon = async (groupId: string, iconData: { icon: string; color: string }) => {
    const { data, error } = await supabase
        .rpc('update_group_icon', {
            group_id: groupId,
            icon_url: iconData.icon,
            icon_color: iconData.color
        });

    if (error) {
        console.error('Error updating group icon:', error);
        throw error;
    }

    return data;
}

// Define types for the RPC response
interface DBMember {
    id: string;
    username: string;
    avatar_url: string;
    relative_balance: number;
}

interface DBExpense {
    id: string;
    title: string;
    total_amount: number;
    date: Date;
    notes: string;
    created_at: string;
    participants: number;
    category: {
        name: string;
        icon_name: string;
        icon_color: string;
    };
    paid_by: {
        id: string;
        username: string;
        avatar_url: string;
    };
}

interface DBTransaction {
    id: string;
    amount: number;
    date: Date;
    notes: string;
    created_at: string;
    paid_by: {
        id: string;
        username: string;
        avatar_url: string;
    };
    paid_to: {
        id: string;
        username: string;
        avatar_url: string;
    };
}

interface DBGroupDetails {
    group: {
        id: string;
        name: string;
        icon_url: string;
        created_at: string;
        icon_color: string;
    };
    members: DBMember[];
    expenses: DBExpense[];
    transactions: DBTransaction[];
}

interface LeaveGroupResponse {
    success: boolean;
    message: string;
    group_deleted: boolean;
}
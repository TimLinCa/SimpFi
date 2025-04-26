import { useState, useEffect } from 'react';
import { GroupMembers } from "@/types/group"
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/app/context/auth';
import { getUserGroups } from "@/utils/database/group"

export function useGroupsHook(): [GroupMembers[], React.Dispatch<React.SetStateAction<GroupMembers[]>>] {
    const { user } = useAuth();
    const [groups, setGroups] = useState<GroupMembers[]>([]);

    const { data: queryGroups = [] } = useQuery<GroupMembers[]>({
        queryKey: ['groups', user?.id],
        queryFn: fetchGroups,
        enabled: !!user,
    });

    async function fetchGroups(): Promise<GroupMembers[]> {
        if (user) {
            const groups = await getUserGroups(user.id);
            return groups;
        }
        else {
            return [];
        }
    }

    // Update local state when query data changes
    useEffect(() => {
        setGroups(queryGroups);
    }, [queryGroups]);

    return [groups, setGroups];
}
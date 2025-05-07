import React, { useEffect } from 'react';
import {
    View,
    Text
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dropdown } from 'react-native-element-dropdown';
import { Group } from '@/types/group';
import { useGroupsHook } from '@/hooks/groupshook';

interface GroupDropDownProps {
    selectedGroupData: Group | null;
    setSelectedGroupData: (data: any) => void;
}

const GroupDropDown: React.FC<GroupDropDownProps> = ({
    selectedGroupData,
    setSelectedGroupData
}) => {
    const [groupValue, setGroupValue] = React.useState<string>('-1');
    const [groups] = useGroupsHook();

    // Format groups for dropdown
    const groupData = React.useMemo(() => {
        if (!groups) return [];

        return groups.map(group => ({
            label: group.name,
            value: group.id,
            icon: group.iconName || "account-group",
            item: group,
            iconColor: group.iconColor || "#3b82f6",
        }));
    }, [groups]);

    // When groups load, select the first one by default if none is selected
    useEffect(() => {
        if (groups.length > 0 && groupValue === '-1') {
            const firstGroup = groups[0];
            setGroupValue(firstGroup.id);
            setSelectedGroupData(firstGroup);
        }
    }, [groups, setSelectedGroupData, groupValue]);

    // Handle group selection
    const handleGroupChange = (item: any) => {
        setGroupValue(item.value);
        const selectedGroup = groups.find(g => g.id.toString() === item.value);
        if (selectedGroup) {
            setSelectedGroupData(selectedGroup);
        }
    };

    return (
        <View>
            <Dropdown
                style={{
                    height: 40,
                    backgroundColor: '#f3f4f6',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                }}
                placeholderStyle={{ color: '#9ca3af', fontSize: 16 }}
                selectedTextStyle={{ color: '#000000', fontSize: 16 }}
                inputSearchStyle={{
                    height: 40,
                    borderRadius: 4,
                    fontSize: 16,
                }}
                iconStyle={{ width: 20, height: 20 }}
                data={groupData}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select a group"
                searchPlaceholder="Search for a group..."
                value={groupValue}
                onChange={handleGroupChange}
                renderLeftIcon={() => (
                    <MaterialCommunityIcons
                        name={selectedGroupData ? selectedGroupData.iconName : "account-group"}
                        size={20}
                        color={selectedGroupData ? selectedGroupData.iconColor : "#3b82f6"}
                        style={{ marginRight: 8 }}
                    />
                )}
                renderItem={(item) => (
                    <View className="px-4 py-3 flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name={item.icon} size={20} color={item ? item.iconColor : "#3b82f6"} />
                            <Text className="ml-3 text-gray-800 text-base">{item.label}</Text>
                        </View>
                        {item.value === groupValue && (
                            <MaterialCommunityIcons name="check" size={20} color="#3b82f6" />
                        )}
                    </View>
                )}
            />
        </View>
    );
};

export default GroupDropDown;
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { updateGroupIcon } from '@/utils/database/group';

interface GroupIconEditOverlayProps {
    visible: boolean;
    onClose: () => void;
    groupId: string;
    currentIcon?: string;
    currentColor?: string;
}

const GroupIconEditOverlay = ({
    visible,
    onClose,
    groupId,
    currentIcon = "account-group",
    currentColor = "#43BFF4"
}: GroupIconEditOverlayProps) => {
    const [selectedIcon, setSelectedIcon] = useState<string>(currentIcon);
    const [selectedColor, setSelectedColor] = useState<string>(currentColor);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Reset selections when overlay opens with current values
    useEffect(() => {
        if (visible) {
            setSelectedIcon(currentIcon);
            setSelectedColor(currentColor);
        }
    }, [visible, currentIcon, currentColor]);

    // Group-oriented icons
    const icons = [
        "account-group",
        "home",
        "home-heart",
        "food",
        "family-tree",
        "party-popper",
        "silverware-fork-knife",
        "glass-cocktail",
        "movie",
        "airplane",
        "car",
        "school",
        "office-building",
        "briefcase",
        "bag-personal",
        "basketball",
        "football",
        "hiking",
        "swim",
        "bike",
        "heart",
        "emoticon-happy",
        "beach",
        "tent",
        "campfire",
        "gift",
        "baby-face",
        "shopping",
        "cart"
    ];

    // Color palette
    const colors = [
        "#43BFF4", // Blue (default)
        "#4F46E5", // Indigo
        "#7C3AED", // Violet
        "#EC4899", // Pink
        "#EF4444", // Red
        "#F97316", // Orange
        "#F59E0B", // Amber
        "#10B981", // Emerald
        "#059669", // Green
        "#14B8A6", // Teal
        "#6366F1", // Purple
        "#8B5CF6", // Violet
        "#34D399", // Light Green
        "#A3E635", // Lime
        "#64748B", // Slate
        "#475569", // Gray
        "#000000", // Black
    ];

    const saveGroupIcon = async () => {
        setIsLoading(true);
        try {
            const iconData = {
                icon: selectedIcon,
                color: selectedColor
            };

            // Call your backend function to update the group icon
            await updateGroupIcon(groupId, iconData);

            Alert.alert("Success", "Group icon updated successfully");
            onClose();
        } catch (error) {
            console.error('Error updating group icon:', error);
            Alert.alert("Error", "Failed to update group icon");
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
                style={{ maxHeight: '80%' }}
            >
                {/* Header */}
                <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                    <Text className="text-lg font-bold text-gray-800">Edit Group Icon</Text>
                    <TouchableOpacity
                        onPress={onClose}
                        className="h-8 w-8 rounded-full flex items-center justify-center"
                    >
                        <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <ScrollView className="px-4 py-2" showsVerticalScrollIndicator={false}>
                    {/* Icon preview */}
                    <View className="items-center justify-center my-4">
                        <View
                            className="w-24 h-24 rounded-full items-center justify-center"
                            style={{ backgroundColor: selectedColor }}
                        >
                            <MaterialCommunityIcons name={selectedIcon} size={48} color="#FFFFFF" />
                        </View>
                        <Text className="text-gray-600 mt-2">Preview</Text>
                    </View>

                    {/* Icon selection */}
                    <Text className="text-gray-800 font-medium mb-2">Select Icon</Text>
                    <View className="flex-row flex-wrap justify-center mb-6">
                        {icons.map((icon) => (
                            <TouchableOpacity
                                key={icon}
                                onPress={() => setSelectedIcon(icon)}
                                className={`w-14 h-14 m-1 rounded-lg items-center justify-center ${selectedIcon === icon ? 'bg-gray-200' : 'bg-gray-100'
                                    }`}
                                style={{
                                    borderWidth: selectedIcon === icon ? 2 : 0,
                                    borderColor: selectedColor
                                }}
                            >
                                <MaterialCommunityIcons name={icon} size={28} color={selectedColor} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Color selection */}
                    <Text className="text-gray-800 font-medium mb-2">Select Color</Text>
                    <View className="flex-row flex-wrap justify-center mb-6">
                        {colors.map((color) => (
                            <TouchableOpacity
                                key={color}
                                onPress={() => setSelectedColor(color)}
                                className="w-12 h-12 m-1 rounded-full items-center justify-center"
                                style={{
                                    backgroundColor: color,
                                    borderWidth: selectedColor === color ? 3 : 0,
                                    borderColor: '#000'
                                }}
                            >
                                {selectedColor === color && (
                                    <MaterialCommunityIcons name="check" size={24} color="#FFFFFF" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Save button */}
                    <View className="mt-2 mb-6">
                        <TouchableOpacity
                            onPress={saveGroupIcon}
                            disabled={isLoading}
                            className={`py-3 px-6 rounded-lg flex-row justify-center items-center ${isLoading ? 'bg-gray-400' : 'bg-[#43BFF4]'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <ActivityIndicator size="small" color="#ffffff" />
                                    <Text className="text-white font-medium ml-2">Saving...</Text>
                                </>
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
                                    <Text className="text-white font-medium ml-2">Save Changes</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

export default GroupIconEditOverlay;
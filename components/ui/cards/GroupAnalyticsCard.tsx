import { ActivityIndicator, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import React, { useState } from 'react';
import Animated, { FadeInDown, FadeOutDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { CategoryBreakdown } from '@/types/interface';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/app/context/auth';
import { getGroupCategoryBreakdown } from '@/utils/database';
import GroupCategoryItem from './GroupCategoryCard';

type Props = {
    item: CategoryBreakdown;
    index: number;
    currentDate: Date;
};

const GroupAnalyticsCard = ({ item, index, currentDate }: Props) => {
    const year = currentDate.getFullYear();
    const { user } = useAuth();
    const month = currentDate.getMonth() + 1;
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const animatedHeight = useSharedValue(0);
    const animatedOpacity = useSharedValue(0);

    // Step 1: When user clicks group, get category breakdown for this specific group
    const {
        data: groupCategoryBreakdown,
        isLoading: loadingBreakdown,
        error: breakdownError,
        refetch: refetchBreakdown
    } = useQuery({
        queryKey: ['groupCategoryBreakdown', user?.id, item.group_id, year, month],
        queryFn: () => getGroupCategoryBreakdown(
            user!.id,
            item.group_id!,
            year,
            month
        ),
        enabled: isExpanded && !!user?.id && !!item.group_id,
    });

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
        setExpandedCategory(null); // Reset expanded category when collapsing

        if (!isExpanded) {
            // Expanding
            animatedHeight.value = withTiming(1, { duration: 300 });
            animatedOpacity.value = withTiming(1, { duration: 300 });
        } else {
            // Collapsing
            animatedHeight.value = withTiming(0, { duration: 300 });
            animatedOpacity.value = withTiming(0, { duration: 300 });
        }
    };

    const toggleCategoryExpanded = (categoryId: string) => {
        setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            height: animatedHeight.value === 0 ? 0 : 'auto',
            opacity: animatedOpacity.value,
            overflow: 'hidden',
        };
    });

    const chevronStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${isExpanded ? 180 : 0}deg` }],
        };
    });

    const { width } = useWindowDimensions();

    return (
        <Animated.View
            className="py-4 px-5 mb-2 bg-white rounded-2xl shadow-sm border-l-4 border-blue-500"
            style={{ width: width * 0.9 }}
            entering={FadeInDown.delay(index * 200)}
            exiting={FadeOutDown}
        >
            {/* Main Group Row - Clickable */}
            <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.7}>
                <View className="flex-row items-center justify-between">
                    {/* Icon and Group Name */}
                    <View className="flex-row items-center flex-1">
                        <View className="w-12 h-12 rounded-full justify-center items-center mr-3">
                            <MaterialCommunityIcons
                                size={30}
                                name={item.category.icon_name}
                                color={item.category.icon_color || '#007AFF'}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xl font-semibold text-gray-900">
                                {item.category.name}
                            </Text>
                            <View className="flex-row items-center">
                                <Text className="text-sm text-blue-600 font-medium">
                                    Group Expenses
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Amount, Percentage, and Chevron */}
                    <View className="flex-row items-center">
                        <View className="items-end mr-3">
                            <Text className="text-xl font-semibold text-gray-900">
                                ${item.amount.toFixed(2)}
                            </Text>
                            <Text className="text-sm text-gray-500">
                                {item.percentage}%
                            </Text>
                        </View>
                        <Animated.View style={chevronStyle}>
                            <MaterialCommunityIcons
                                name="chevron-down"
                                size={24}
                                color="#9CA3AF"
                            />
                        </Animated.View>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Expandable Group Categories Section */}
            <Animated.View style={animatedStyle}>
                {isExpanded && (
                    <View className="mt-4 pt-4 border-t border-gray-100">
                        {loadingBreakdown ? (
                            <View className="flex-row justify-center items-center py-4">
                                <ActivityIndicator size="small" color="#3B82F6" />
                                <Text className="text-gray-500 ml-2">Loading category breakdown...</Text>
                            </View>
                        ) : breakdownError ? (
                            <View className="py-4">
                                <Text className="text-red-500 text-center">
                                    Error loading category breakdown
                                </Text>
                                <TouchableOpacity
                                    onPress={() => refetchBreakdown()}
                                    className="mt-2 py-2 px-4 bg-blue-100 rounded-lg self-center"
                                >
                                    <Text className="text-blue-600 font-medium">Retry</Text>
                                </TouchableOpacity>
                            </View>
                        ) : groupCategoryBreakdown && groupCategoryBreakdown.length > 0 ? (
                            <View>
                                <Text className="text-sm font-medium text-gray-600 mb-3">
                                    Category Breakdown ({groupCategoryBreakdown.length} categories)
                                </Text>
                                {groupCategoryBreakdown.map((category) => (
                                    <GroupCategoryItem
                                        key={category.category.id}
                                        category={category}
                                        isExpanded={expandedCategory === category.category.id}
                                        onToggle={() => toggleCategoryExpanded(category.category.id)}
                                        groupId={item.group_id!}
                                        currentDate={currentDate}
                                        userId={user!.id}
                                    />
                                ))}
                            </View>
                        ) : (
                            <View className="py-4">
                                <Text className="text-gray-500 text-center">
                                    No category breakdown available for this group
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </Animated.View>
        </Animated.View>
    );
};

export default GroupAnalyticsCard;
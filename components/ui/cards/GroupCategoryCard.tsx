import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { CategoryBreakdown } from '@/types/interface';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useQuery } from '@tanstack/react-query';
import { getGroupCategoryTransactions } from '@/utils/database';
import TransactionCard from '@/components/ui/cards/TransactionCard';

// Component for displaying individual group categories
const GroupCategoryItem = ({
    category,
    isExpanded,
    onToggle,
    groupId,
    currentDate,
    userId
}: {
    category: CategoryBreakdown;
    isExpanded: boolean;
    onToggle: () => void;
    groupId: string;
    currentDate: Date;
    userId: string;
}) => {
    const animatedHeight = useSharedValue(isExpanded ? 1 : 0);
    const animatedOpacity = useSharedValue(isExpanded ? 1 : 0);

    // Query for detailed transactions in this specific group category
    const {
        data: categoryTransactions,
        isLoading: loadingTransactions,
        error: transactionError,
        refetch: refetchTransactions
    } = useQuery({
        queryKey: ['groupCategoryTransactions', userId, groupId, category.category.name, currentDate.getFullYear(), currentDate.getMonth() + 1],
        queryFn: () => getGroupCategoryTransactions(
            userId,
            groupId,
            category.category.name,
            currentDate.getFullYear(),
            currentDate.getMonth() + 1
        ),
        enabled: isExpanded,
    });

    React.useEffect(() => {
        animatedHeight.value = withTiming(isExpanded ? 1 : 0, { duration: 300 });
        animatedOpacity.value = withTiming(isExpanded ? 1 : 0, { duration: 300 });
    }, [isExpanded]);

    const animatedStyle = useAnimatedStyle(() => ({
        height: animatedHeight.value === 0 ? 0 : 'auto',
        opacity: animatedOpacity.value,
        overflow: 'hidden',
    }));

    const chevronStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${isExpanded ? 180 : 0}deg` }],
    }));

    return (
        <View className="mb-3 bg-gray-50 rounded-xl p-3">
            <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <View className="w-8 h-8 rounded-full justify-center items-center mr-3">
                            <MaterialCommunityIcons
                                size={20}
                                name={category.category.icon_name}
                                color={category.category.icon_color || '#007AFF'}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-medium text-gray-900">
                                {category.category.name}
                            </Text>
                            <Text className="text-xs text-gray-500">
                                {category.percentage}%
                            </Text>
                        </View>
                    </View>
                    <View className="flex-row items-center">
                        <Text className="text-base font-semibold text-gray-900 mr-2">
                            ${category.amount.toFixed(2)}
                        </Text>
                        <Animated.View style={chevronStyle}>
                            <MaterialCommunityIcons
                                name="chevron-down"
                                size={20}
                                color="#9CA3AF"
                            />
                        </Animated.View>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Expandable Transaction Details */}
            <Animated.View style={animatedStyle}>
                {isExpanded && (
                    <View className="mt-3 pt-3 border-t border-gray-200">
                        {loadingTransactions ? (
                            <View className="flex-row justify-center items-center py-2">
                                <ActivityIndicator size="small" color="#3B82F6" />
                                <Text className="text-gray-500 ml-2 text-sm">Loading transactions...</Text>
                            </View>
                        ) : transactionError ? (
                            <View className="py-2">
                                <Text className="text-red-500 text-center text-sm">Error loading transactions</Text>
                                <TouchableOpacity
                                    onPress={() => refetchTransactions()}
                                    className="mt-1 py-1 px-3 bg-blue-100 rounded-lg self-center"
                                >
                                    <Text className="text-blue-600 font-medium text-sm">Retry</Text>
                                </TouchableOpacity>
                            </View>
                        ) : categoryTransactions && categoryTransactions.length > 0 ? (
                            <View>
                                <Text className="text-xs text-gray-500 mb-2">
                                    {categoryTransactions.length} transaction{categoryTransactions.length !== 1 ? 's' : ''}
                                </Text>
                                {categoryTransactions.map((transaction) => (
                                    <TransactionCard key={transaction.id} transaction={transaction} isClicked={false} />
                                ))}
                            </View>
                        ) : (
                            <Text className="text-gray-500 text-center py-2 text-sm">
                                No transactions found
                            </Text>
                        )}
                    </View>
                )}
            </Animated.View>
        </View>
    );
};

export default GroupCategoryItem;
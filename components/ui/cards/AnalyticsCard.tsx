import { ActivityIndicator, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import React, { useState } from 'react';
import Animated, { FadeInDown, FadeOutDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { CategoryBreakdown } from '@/types/interface';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/app/context/auth';
import { getCategoryTransactionsByName } from '@/utils/database';
import TransactionCard from '@/components/ui/cards/TransactionCard';

type Props = {
  item: CategoryBreakdown;
  index: number;
  currentDate: Date;
  categoryType: string;
};

const AnalyticsCard = ({ item, index, currentDate, categoryType }: Props) => {
  const year = currentDate.getFullYear();
  const { user } = useAuth();
  const month = currentDate.getMonth() + 1;
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedHeight = useSharedValue(0);
  const animatedOpacity = useSharedValue(0);

  const {
    data: transactions,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['categoryTransactions', user?.id, item.category.name, year, month, categoryType],
    queryFn: () => getCategoryTransactionsByName(
      user!.id,
      item.category.name,
      year,
      month,
      categoryType
    ),
    enabled: isExpanded && !!user?.id, // Only fetch when expanded
  });

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
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
      className="py-4 px-5 mb-2 bg-white rounded-2xl shadow-sm"
      style={{ width: width * 0.9 }}
      entering={FadeInDown.delay(index * 200)}
      exiting={FadeOutDown}
    >
      {/* Main Category Row - Clickable */}
      <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.7}>
        <View className="flex-row items-center justify-between">
          {/* Icon and Category Name */}
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

      {/* Expandable Transactions Section */}
      <Animated.View style={animatedStyle}>
        {isExpanded && (
          <View className="mt-4 pt-4 border-t border-gray-100">
            {isLoading ? (
              <View className="flex-row justify-center items-center py-4">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="text-gray-500 ml-2">Loading transactions...</Text>
              </View>
            ) : error ? (
              <View className="py-4">
                <Text className="text-red-500 text-center">
                  Error loading transactions
                </Text>
                <TouchableOpacity
                  onPress={() => refetch()}
                  className="mt-2 py-2 px-4 bg-blue-100 rounded-lg self-center"
                >
                  <Text className="text-blue-600 font-medium">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : transactions && transactions.length > 0 ? (
              <View>
                <Text className="text-sm font-medium text-gray-600 mb-3">
                  {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                </Text>
                {transactions.map((transaction) => (
                  <TransactionCard key={transaction.id} transaction={transaction} isClicked={false} />
                ))}
              </View>
            ) : (
              <View className="py-4">
                <Text className="text-gray-500 text-center">
                  No transactions found for this category
                </Text>
              </View>
            )}
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
};

export default AnalyticsCard;
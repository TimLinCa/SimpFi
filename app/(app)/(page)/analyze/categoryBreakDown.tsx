import { View, Text, SafeAreaView, ActivityIndicator, Dimensions, StyleSheet, ScrollView } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMonthlyCategoryBreakDown } from '@/utils/database';
import { useAuth } from '@/app/context/auth';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { useFont } from '@shopify/react-native-skia';
import { Roboto_700Bold, Roboto_300Light } from '@expo-google-fonts/roboto';
import { DonutChart } from '@/components/ui/graph/donutChart';
import { useFocusEffect } from 'expo-router';
import { AnalyticsCard, GroupAnalyticsCard } from '@/components/ui/cards';

import { CategoryBreakdown } from '@/types/interface';

interface CategoryBreakDownProps {
    currentDate: Date;
    categoryType: string;
}

const RADIUS = 160;
const STROKE_WIDTH = 30;
const OUTER_STROKE_WIDTH = 46;
const GAP = 0.04;


const CategoryBreakDownPage = ({ currentDate, categoryType }: CategoryBreakDownProps) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const totalValue = useSharedValue(0);
    const decimals = useSharedValue<number[]>([]);
    const [colors, setColors] = useState<string[]>([]);
    const [data, setData] = useState<CategoryBreakdown[]>([]);

    const font = useFont(Roboto_700Bold, 60);
    const smallFont = useFont(Roboto_300Light, 20);
    const {
        data: categoryBreakdown,
        isLoading: loadingCategoriesBreakdown,
        refetch: refetchCategoriesBreakdown,
    } = useQuery({
        queryKey: [`${categoryType}CategoryBreakdown`, user?.id],
        queryFn: () => getMonthCategoryBreakDown(categoryType),
        enabled: !!user?.id,
    });

    function capitalizeFirstLetter(val: string): string {
        return val.charAt(0).toUpperCase() + String(val).slice(1);
    }

    useFocusEffect(
        useCallback(() => {
            const refreshData = async () => {
                if (user?.id) {
                    try {
                        queryClient.invalidateQueries({ queryKey: [`${categoryType}CategoryBreakdown`] });
                    } catch (error) {
                        console.error("Error refreshing data:", error);
                    } finally {
                    }
                }
            };
            refreshData();
        }, [user?.id])
    );

    useEffect(() => {
        if (categoryBreakdown && categoryBreakdown.length > 0) {
            const categoryBreakDownForCurrentMonth = categoryBreakdown.filter(item => item.month.getUTCMonth() + 1 == currentDate.getUTCMonth() + 1);
            const total = categoryBreakDownForCurrentMonth.reduce((acc, item) => acc + item.amount, 0);
            totalValue.value = withTiming(total, { duration: 500 });
            const formattedDecimals = categoryBreakDownForCurrentMonth.map(item => parseFloat(item.percentage.toFixed(2)));
            decimals.value = formattedDecimals;
            setColors(categoryBreakDownForCurrentMonth.map(item => item.category.icon_color ? item.category.icon_color : '#000000'));
            setData(categoryBreakDownForCurrentMonth);
        }
    }, [currentDate, categoryBreakdown, totalValue, decimals]);

    // Define the async function outside of hooks
    async function getMonthCategoryBreakDown(type: string) {
        if (!user?.id) return [];
        return await getMonthlyCategoryBreakDown(user.id, 6, type);
    }

    // Now handle conditional rendering AFTER all hooks are called
    if (loadingCategoriesBreakdown || !font || !smallFont) {
        return (
            <SafeAreaView className="flex-1 bg-gray-100">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text className="text-gray-600 mt-4">Loading {categoryType} Category BreakDown...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!categoryBreakdown || categoryBreakdown.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-gray-100">
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-600 mt-4">No data available for {categoryType} category.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={{ alignItems: 'center' }}
                showsVerticalScrollIndicator={false}>
                <View style={styles.chartContainer}>
                    <DonutChart
                        radius={RADIUS}
                        gap={GAP}
                        strokeWidth={STROKE_WIDTH}
                        outerStrokeWidth={OUTER_STROKE_WIDTH}
                        totalValue={totalValue}
                        font={font}
                        smallFont={smallFont}
                        decimals={decimals}
                        colors={colors}
                        totalText={capitalizeFirstLetter(categoryType)}
                    />
                </View>
                {data.map((item, index) => {
                    // Check if this is a group expense
                    if (item.is_group) {
                        return (
                            <GroupAnalyticsCard
                                item={item}
                                key={index}
                                index={index}
                                currentDate={currentDate}
                            />
                        );
                    } else {
                        return (
                            <AnalyticsCard
                                item={item}
                                key={index}
                                index={index}
                                currentDate={currentDate}
                                categoryType={categoryType}
                            />
                        );
                    }
                })}
            </ScrollView>
        </SafeAreaView>
    );

};



const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    chartContainer: {
        width: RADIUS * 2,
        height: RADIUS * 2,
        marginTop: 10,
        marginBottom: 10,
    },
});

export default CategoryBreakDownPage;
import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MenuButton from './MenuButton';
import { useFocusEffect, useRouter } from 'expo-router';

const Header = () => {

    // Helper function to get month name
    const getMonthName = (monthIndex: number) => {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return monthNames[monthIndex];
    };

    const [currentMonth, setCurrentMonth] = React.useState('January');
    const [currentYear, setCurrentYear] = React.useState(2022);
    const [notificationCount, setNotificationCount] = React.useState(2);

    useFocusEffect(
        useCallback(() => {
            // This function will run when the screen comes into focus
            const refreshData = async () => {
                const today = new Date();
                setCurrentMonth(getMonthName(today.getMonth()));
                setCurrentYear(today.getFullYear());
            };

            refreshData();
            // Return a cleanup function (optional)
            return () => {
                // Any cleanup code if needed
            };
        }, [])
    );

    React.useEffect(() => {
        const today = new Date();
        setCurrentMonth(getMonthName(today.getMonth()));
        setCurrentYear(today.getFullYear());
    }, []);

    // Handle notification press
    const onNotificationPress = () => {
        console.log('Notification pressed');
        // Open notification screen
    };

    return (
        <View className="bg-[#43BFF4] rounded-b-md pt-2 pb-2 flex-row items-center px-4 shadow-sm">
            <View className="flex-1">
                <MenuButton />
            </View>
            <View className="flex-1 items-center">
                <Text className="text-base font-medium text-white">{currentMonth} {currentYear}</Text>
            </View>
            <View className="flex-1" />
        </View>

    )
}

export default Header
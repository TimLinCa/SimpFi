import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MenuButton from './MenuButton';
import { useRouter } from 'expo-router';

const Header = () => {

    React.useEffect(() => {
        const today = new Date();
        setCurrentMonth(getMonthName(today.getMonth()));
        setCurrentYear(today.getFullYear());
    }, []);

    // Helper function to get month name
    const getMonthName = (monthIndex: number) => {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return monthNames[monthIndex];
    };

    const router = useRouter();
    const [currentMonth, setCurrentMonth] = React.useState('January');
    const [currentYear, setCurrentYear] = React.useState(2022);
    const [notificationCount, setNotificationCount] = React.useState(2);

    // Handle notification press
    const onNotificationPress = () => {
        console.log('Notification pressed');
        // Open notification screen
    };

    return (
        <View className="bg-[#43BFF4] rounded-b-md pt-2 pb-2 flex-row justify-between items-center px-4 shadow-sm">
            <MenuButton />
            <View
                className="flex-row items-center"
            >
                <Text className="text-base font-medium text-white">{currentMonth} {currentYear}</Text>
            </View>

            <TouchableOpacity
                onPress={onNotificationPress}
                className="w-10 h-10 justify-center items-center relative"
            >
                <MaterialCommunityIcons name="bell-outline" size={24} color="#FFFFFF" />
                {notificationCount > 0 && (
                    <View className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full justify-center items-center">
                        <Text className="text-white text-xs font-bold">{notificationCount}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>

    )
}

export default Header
import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    Switch,
} from "react-native";
import { SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuth } from "@/app/context/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MenuButton from "@/components/ui/home/MenuButton";

// Settings Item Component
interface SettingsItemProps {
    title: string;
    subtitle?: string;
    iconName: string;
    iconColor: string;
    iconBgColor: string;
    onPress: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
    title,
    subtitle,
    iconName,
    iconColor,
    iconBgColor,
    onPress,
    showArrow = true,
    rightComponent,
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white p-4 mb-3 rounded-xl shadow-sm border border-gray-100"
            activeOpacity={0.7}
        >
            <View className="flex-row items-center">
                <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: iconBgColor }}
                >
                    <MaterialCommunityIcons
                        name={iconName as any}
                        size={24}
                        color={iconColor}
                    />
                </View>

                <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">{title}</Text>
                    {subtitle && (
                        <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
                    )}
                </View>

                {rightComponent ? (
                    rightComponent
                ) : showArrow ? (
                    <MaterialCommunityIcons
                        name="chevron-right"
                        size={24}
                        color="#9ca3af"
                    />
                ) : null}
            </View>
        </TouchableOpacity>
    );
};

// Settings Section Component
interface SettingsSectionProps {
    title: string;
    children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
    return (
        <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4 px-4">
                {title}
            </Text>
            <View className="px-4">
                {children}
            </View>
        </View>
    );
};


// Main Settings Page Component
const SettingsPage: React.FC = () => {
    const router = useRouter();
    const auth = useAuth();
    const { user, signOut } = auth;

    const handleSignOut = () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: () => {
                        signOut();
                        router.replace("/(auth)/login");
                    },
                },
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "This action cannot be undone. All your data will be permanently deleted.",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete Account",
                    style: "destructive",
                    onPress: () => {
                        // Handle account deletion
                        console.log("Account deletion requested");
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <StatusBar style="auto" hidden={false} translucent={false} />
            {/* Top Navigation Bar */}
            <View className="bg-[#43BFF4] pt-2 pb-2 flex-row items-center px-4 py-4 shadow-sm">
                <View className='w-10 h-10 justify-center items-center'>
                    <MenuButton />
                </View>

                <View className="flex-1 items-center">
                    <Text className="text-lg font-bold text-white">Settings</Text>
                </View>

                {/* Empty view to balance the back button */}
                <View className="w-10 h-10" />
            </View>

            <ScrollView className="flex-1 pt-4" showsVerticalScrollIndicator={false}>
                {/* Profile Section */}
                <SettingsSection title="Profile">
                    <SettingsItem
                        title="Personal Information"
                        subtitle={`${user?.email || "Update your details"}`}
                        iconName="account-circle"
                        iconColor="#3b82f6"
                        iconBgColor="#e0f2fe"
                        onPress={() => router.push("/(app)/(page)/settings/profile")}
                    />
                </SettingsSection>

                {/* Security Section */}
                <SettingsSection title="Security">
                    <SettingsItem
                        title="Change Password"
                        subtitle="Update your account password"
                        iconName="lock"
                        iconColor="#f59e0b"
                        iconBgColor="#fef3c7"
                        onPress={() => router.push("/(app)/settings/change-password")}
                    />
                </SettingsSection>

                {/* Preferences Section */}
                {/* <SettingsSection title="Preferences">
                    <SettingsItem
                        title="Notifications"
                        subtitle="Manage push notifications"
                        iconName="bell"
                        iconColor="#f59e0b"
                        iconBgColor="#fef3c7"
                        onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                        showArrow={false}
                        rightComponent={
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: "#e5e7eb", true: "#3b82f6" }}
                                thumbColor={notificationsEnabled ? "#ffffff" : "#f9fafb"}
                            />
                        }
                    />
                    <SettingsItem
                        title="Currency"
                        subtitle="USD ($)"
                        iconName="currency-usd"
                        iconColor="#dc2626"
                        iconBgColor="#fee2e2"
                        onPress={() => router.push("/(app)/settings/currency")}
                    />
                </SettingsSection> */}

                {/* Subscription Section */}
                <SettingsSection title="Subscription">
                    <SettingsItem
                        title="My Subscription"
                        subtitle="Manage your plan and billing"
                        iconName="crown"
                        iconColor="#f59e0b"
                        iconBgColor="#fef3c7"
                        onPress={() => router.push("/(app)/(page)/settings/subscription")}
                    />

                    <SettingsItem
                        title="Billing History"
                        subtitle="View past payments and receipts"
                        iconName="receipt"
                        iconColor="#8b5cf6"
                        iconBgColor="#f3e8ff"
                        onPress={() => router.push("/(app)/settings/billing")}
                    />
                </SettingsSection>

                {/* Support Section */}
                <SettingsSection title="Support">

                    <SettingsItem
                        title="Send Feedback"
                        subtitle="Share your thoughts with us"
                        iconName="message-text"
                        iconColor="#22c55e"
                        iconBgColor="#e6f7ee"
                        onPress={() => router.push("/(app)/(page)/settings/feedback")}
                    />
                </SettingsSection>

                {/* Account Actions Section */}
                <SettingsSection title="Account">
                    <SettingsItem
                        title="Sign Out"
                        subtitle="Sign out of your account"
                        iconName="logout"
                        iconColor="#ef4444"
                        iconBgColor="#fee2e2"
                        onPress={handleSignOut}
                    />

                    <SettingsItem
                        title="Delete Account"
                        subtitle="Permanently delete your account"
                        iconName="delete"
                        iconColor="#dc2626"
                        iconBgColor="#fef2f2"
                        onPress={handleDeleteAccount}
                    />
                </SettingsSection>

                {/* App Info */}
                <View className="px-4 pb-8 pt-4">
                    <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <Text className="text-center text-gray-500 text-sm">
                            Version 1.0.0
                        </Text>
                        <Text className="text-center text-gray-400 text-xs mt-1">
                            © 2025 SimpFi. All rights reserved.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SettingsPage;
import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Subscription Plan Interface
interface SubscriptionPlan {
    id: string;
    name: string;
    price: string;
    period: string;
    originalPrice?: string;
    features: string[];
    limitations?: string[];
    isPopular?: boolean;
    isCurrentPlan?: boolean;
    color: string;
    bgColor: string;
    savings?: string;
}

// Subscription Card Component
interface SubscriptionCardProps {
    plan: SubscriptionPlan;
    onSelect: (planId: string) => void;
    isSelected: boolean;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
    plan,
    onSelect,
    isSelected,
}) => {
    return (
        <TouchableOpacity
            onPress={() => onSelect(plan.id)}
            className={`bg-white p-6 mb-4 rounded-xl shadow-sm border-2 ${isSelected ? "border-[#43BFF4]" : "border-gray-100"
                } ${plan.isPopular ? "border-[#43BFF4]" : ""}`}
            activeOpacity={0.7}
        >
            {/* Popular Badge */}
            {plan.isPopular && (
                <View className="absolute -top-3 left-4 right-4 z-10">
                    <View className="bg-[#43BFF4] px-3 py-1 rounded-full self-center">
                        <Text className="text-white text-xs font-semibold">
                            BEST VALUE
                        </Text>
                    </View>
                </View>
            )}

            {/* Current Plan Badge */}
            {plan.isCurrentPlan && (
                <View className="absolute -top-3 right-4 z-10">
                    <View className="bg-green-500 px-3 py-1 rounded-full">
                        <Text className="text-white text-xs font-semibold">
                            CURRENT PLAN
                        </Text>
                    </View>
                </View>
            )}

            <View className="items-center mb-4">
                {/* Plan Icon */}
                <View
                    className="w-16 h-16 rounded-full items-center justify-center mb-3"
                    style={{ backgroundColor: plan.bgColor }}
                >
                    <MaterialCommunityIcons
                        name={
                            plan.id === "free"
                                ? "account"
                                : plan.id === "premium_monthly"
                                    ? "star"
                                    : "crown"
                        }
                        size={32}
                        color={plan.color}
                    />
                </View>

                {/* Plan Name */}
                <Text className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                </Text>

                {/* Price */}
                <View className="flex-row items-baseline justify-center">
                    {plan.originalPrice && (
                        <Text className="text-lg text-gray-400 line-through mr-2">
                            {plan.originalPrice}
                        </Text>
                    )}
                    <Text className="text-3xl font-bold text-gray-900">
                        {plan.price}
                    </Text>
                    <Text className="text-gray-500 ml-1">
                        {plan.period}
                    </Text>
                </View>

                {/* Savings Badge */}
                {plan.savings && (
                    <View className="bg-green-100 px-3 py-1 rounded-full mt-2">
                        <Text className="text-green-700 text-sm font-semibold">
                            Save {plan.savings}
                        </Text>
                    </View>
                )}
            </View>

            {/* Features List */}
            <View className="space-y-3">
                {plan.features.map((feature, index) => (
                    <View key={index} className="flex-row items-center">
                        <MaterialCommunityIcons
                            name="check-circle"
                            size={20}
                            color="#22c55e"
                            style={{ marginRight: 8 }}
                        />
                        <Text className="text-gray-700 flex-1">{feature}</Text>
                    </View>
                ))}

                {/* Limitations */}
                {plan.limitations && plan.limitations.map((limitation, index) => (
                    <View key={`limitation-${index}`} className="flex-row items-center">
                        <MaterialCommunityIcons
                            name="close-circle"
                            size={20}
                            color="#ef4444"
                            style={{ marginRight: 8 }}
                        />
                        <Text className="text-gray-500 flex-1">{limitation}</Text>
                    </View>
                ))}
            </View>

            {/* Select Button */}
            {!plan.isCurrentPlan && (
                <TouchableOpacity
                    className={`mt-6 py-3 px-6 rounded-lg ${isSelected ? "bg-[#43BFF4]" : "bg-gray-100"
                        }`}
                    onPress={() => onSelect(plan.id)}
                >
                    <Text
                        className={`text-center font-semibold ${isSelected ? "text-white" : "text-gray-700"
                            }`}
                    >
                        {isSelected ? "Selected" : "Select Plan"}
                    </Text>
                </TouchableOpacity>
            )}

            {plan.isCurrentPlan && (
                <View className="mt-6 py-3 px-6 rounded-lg bg-green-100">
                    <Text className="text-center font-semibold text-green-700">
                        Current Plan
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

// Main Subscription Page Component
const SubscriptionPage: React.FC = () => {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState<string>("free");

    // Subscription plans data
    const subscriptionPlans: SubscriptionPlan[] = [
        {
            id: "free",
            name: "Free Plan",
            price: "$0",
            period: "/month",
            features: [
                "Basic app access",
            ],
            limitations: [
                "Contains ads",
                "Maximum 1 group only",
            ],
            isCurrentPlan: true, // Assuming user is on free plan
            color: "#6b7280",
            bgColor: "#f3f4f6",
        },
        {
            id: "premium_monthly",
            name: "Premium Plan",
            price: "$6",
            period: "/month",
            features: [
                "Unlimited groups",
                "Ad-free experience",
                "Priority support",
                "Advanced features",
            ],
            color: "#3b82f6",
            bgColor: "#e0f2fe",
        },
        {
            id: "premium_yearly",
            name: "Premium Plan (1 Year)",
            price: "$60",
            period: "/year",
            originalPrice: "$72",
            savings: "$12",
            features: [
                "Unlimited groups",
                "Ad-free experience",
                "Priority support",
                "Advanced features",
                "Same as monthly premium",
            ],
            isPopular: true,
            color: "#f59e0b",
            bgColor: "#fef3c7",
        },
    ];

    const handlePlanSelect = (planId: string) => {
        setSelectedPlan(planId);
    };

    const handleUpgrade = () => {
        if (selectedPlan === "free") {
            Alert.alert("Info", "You're already on the Free plan!");
            return;
        }

        const selectedPlanData = subscriptionPlans.find(p => p.id === selectedPlan);
        const planTypeText = selectedPlan === "premium_yearly" ? "yearly plan" : "monthly plan";

        Alert.alert(
            "Upgrade Plan",
            `Are you sure you want to upgrade to ${selectedPlanData?.name} for ${selectedPlanData?.price}${selectedPlanData?.period}?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Upgrade",
                    style: "default",
                    onPress: () => {
                        // Handle upgrade logic here
                        console.log(`Upgrading to ${selectedPlan}`);
                        Alert.alert("Success", `Successfully upgraded to ${planTypeText}!`);
                        // You can add payment processing logic here
                    },
                },
            ]
        );
    };

    const handleGoBack = () => {
        router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <StatusBar style="auto" hidden={false} translucent={false} />

            {/* Top Navigation Bar */}
            <View className="bg-[#43BFF4] pt-2 pb-2 flex-row items-center px-4 py-4 shadow-sm">
                <TouchableOpacity
                    onPress={handleGoBack}
                    className="w-10 h-10 justify-center items-center"
                >
                    <MaterialCommunityIcons
                        name="arrow-left"
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>

                <View className="flex-1 items-center">
                    <Text className="text-lg font-bold text-white">Subscription Plans</Text>
                </View>

                {/* Empty view to balance the back button */}
                <View className="w-10 h-10" />
            </View>

            <ScrollView className="flex-1 pt-6" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-4 mb-6">
                    <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
                        Choose Your Plan
                    </Text>
                    <Text className="text-gray-600 text-center">
                        Unlock unlimited groups and remove ads
                    </Text>
                </View>

                {/* Subscription Cards */}
                <View className="px-4">
                    {subscriptionPlans.map((plan) => (
                        <SubscriptionCard
                            key={plan.id}
                            plan={plan}
                            onSelect={handlePlanSelect}
                            isSelected={selectedPlan === plan.id}
                        />
                    ))}
                </View>

                {/* Upgrade Button */}
                <View className="px-4 pb-4 pt-4">
                    <TouchableOpacity
                        onPress={handleUpgrade}
                        className={`py-4 px-6 rounded-xl shadow-sm ${selectedPlan === "free"
                                ? "bg-gray-300"
                                : "bg-[#43BFF4]"
                            }`}
                        activeOpacity={0.8}
                        disabled={selectedPlan === "free"}
                    >
                        <Text className={`text-center font-bold text-lg ${selectedPlan === "free"
                                ? "text-gray-500"
                                : "text-white"
                            }`}>
                            {selectedPlan === "free" ? "Current Plan" : "Upgrade Now"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Plan Comparison */}
                <View className="px-4 pb-4">
                    <View className="bg-blue-50 p-4 rounded-xl">
                        <Text className="text-center text-blue-700 font-semibold mb-2">
                            💡 Why upgrade to Premium?
                        </Text>
                        <Text className="text-center text-blue-600 text-sm">
                            Create unlimited groups, enjoy ad-free experience, and get priority support
                        </Text>
                    </View>
                </View>

                {/* Terms and Conditions */}
                <View className="px-4 pb-8">
                    <Text className="text-center text-gray-500 text-sm">
                        By upgrading, you agree to our{" "}
                        <Text className="text-[#43BFF4] underline">Terms of Service</Text>
                        {" "}and{" "}
                        <Text className="text-[#43BFF4] underline">Privacy Policy</Text>
                        {"\n"}
                        Subscriptions auto-renew unless cancelled
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SubscriptionPage;
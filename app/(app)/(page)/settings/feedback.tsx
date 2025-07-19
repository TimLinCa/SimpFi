import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { openComposer } from "react-native-email-link";

// Feedback Category Interface
interface FeedbackCategory {
    id: string;
    name: string;
    icon: string;
    description: string;
    color: string;
    bgColor: string;
}

// Feedback Category Card Component
interface FeedbackCategoryCardProps {
    category: FeedbackCategory;
    isSelected: boolean;
    onSelect: (categoryId: string) => void;
}

const FeedbackCategoryCard: React.FC<FeedbackCategoryCardProps> = ({
    category,
    isSelected,
    onSelect,
}) => {
    return (
        <TouchableOpacity
            onPress={() => onSelect(category.id)}
            className={`bg-white p-4 mb-3 rounded-xl shadow-sm border-2 ${isSelected ? "border-[#43BFF4]" : "border-gray-100"
                }`}
            activeOpacity={0.7}
        >
            <View className="flex-row items-center">
                <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: category.bgColor }}
                >
                    <MaterialCommunityIcons
                        name={category.icon as any}
                        size={24}
                        color={category.color}
                    />
                </View>

                <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                        {category.name}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                        {category.description}
                    </Text>
                </View>

                <MaterialCommunityIcons
                    name={isSelected ? "radiobox-marked" : "radiobox-blank"}
                    size={24}
                    color={isSelected ? "#43BFF4" : "#9ca3af"}
                />
            </View>
        </TouchableOpacity>
    );
};

// Main Send Feedback Page Component
const SendFeedbackPage: React.FC = () => {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [feedbackText, setFeedbackText] = useState<string>("");
    const [contactEmail, setContactEmail] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Feedback categories
    const feedbackCategories: FeedbackCategory[] = [
        {
            id: "bug",
            name: "Bug Report",
            icon: "bug",
            description: "Report a problem or error you encountered",
            color: "#ef4444",
            bgColor: "#fee2e2",
        },
        {
            id: "feature",
            name: "Feature Request",
            icon: "lightbulb",
            description: "Suggest a new feature or improvement",
            color: "#f59e0b",
            bgColor: "#fef3c7",
        },
        {
            id: "general",
            name: "General Feedback",
            icon: "comment-text",
            description: "Share your thoughts and opinions",
            color: "#3b82f6",
            bgColor: "#e0f2fe",
        },
        {
            id: "ui",
            name: "User Interface",
            icon: "palette",
            description: "Feedback about app design and usability",
            color: "#8b5cf6",
            bgColor: "#f3e8ff",
        },
        {
            id: "performance",
            name: "Performance",
            icon: "speedometer",
            description: "Report slow loading or performance issues",
            color: "#06b6d4",
            bgColor: "#cffafe",
        },
        {
            id: "other",
            name: "Other",
            icon: "help-circle",
            description: "Something else not covered above",
            color: "#22c55e",
            bgColor: "#e6f7ee",
        },
    ];

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(categoryId);
    };

    const handleSubmitFeedback = async () => {
        // Validation
        if (!selectedCategory) {
            Alert.alert("Error", "Please select a feedback category.");
            return;
        }

        if (!feedbackText.trim()) {
            Alert.alert("Error", "Please enter your feedback message.");
            return;
        }

        if (feedbackText.trim().length < 10) {
            Alert.alert("Error", "Please provide more detailed feedback (at least 10 characters).");
            return;
        }

        // Email validation (optional but if provided should be valid)
        if (contactEmail && !isValidEmail(contactEmail)) {
            Alert.alert("Error", "Please enter a valid email address.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Get selected category name
            const selectedCategoryData = feedbackCategories.find(cat => cat.id === selectedCategory);
            const categoryName = selectedCategoryData?.name || "General Feedback";

            // Format email content
            const emailSubject = `App Feedback: ${categoryName}`;

            let emailBody = `Feedback Category: ${categoryName}\n\n`;
            emailBody += `Message:\n${feedbackText.trim()}\n\n`;

            if (contactEmail.trim()) {
                emailBody += `Contact Email: ${contactEmail.trim()}\n\n`;
            }

            emailBody += `---\n`;
            emailBody += `Device Info:\n`;
            emailBody += `Platform: ${Platform.OS}\n`;
            emailBody += `Date: ${new Date().toLocaleString()}\n`;

            // Open email composer
            await openComposer({
                to: "Simplelifetim@gmail.com",
                subject: emailSubject,
                body: emailBody,
            });

            // Show success message
            Alert.alert(
                "Email Opened",
                "Your email app has been opened with the feedback pre-filled. Please send the email to complete your feedback submission.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            // Reset form
                            setSelectedCategory("");
                            setFeedbackText("");
                            setContactEmail("");
                            // Optionally navigate back
                            router.back();
                        },
                    },
                ]
            );

        } catch (error) {
            console.error("Error opening email composer:", error);

            // Fallback alert with email details
            Alert.alert(
                "Email App Not Available",
                `Please send your feedback manually to:\n\nEmail: Simplelifetim@gmail.com\nSubject: App Feedback: ${selectedCategory || "General"}\n\nMessage: ${feedbackText.trim()}`,
                [
                    {
                        text: "Copy Email",
                        onPress: () => {
                            // You could implement clipboard copy here if needed
                            console.log("Email copied to clipboard");
                        },
                    },
                    {
                        text: "OK",
                        style: "cancel",
                    },
                ]
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleGoBack = () => {
        if (feedbackText.trim() || selectedCategory) {
            Alert.alert(
                "Discard Feedback?",
                "You have unsaved changes. Are you sure you want to go back?",
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                    },
                    {
                        text: "Discard",
                        style: "destructive",
                        onPress: () => router.back(),
                    },
                ]
            );
        } else {
            router.back();
        }
    };

    const isFormValid = selectedCategory && feedbackText.trim().length >= 10;

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
                    <Text className="text-lg font-bold text-white">Send Feedback</Text>
                </View>

                {/* Empty view to balance the back button */}
                <View className="w-10 h-10" />
            </View>

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView className="flex-1 pt-6" showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View className="px-4 mb-6">
                        <Text className="text-2xl font-bold text-gray-900 mb-2">
                            We Value Your Feedback
                        </Text>
                        <Text className="text-gray-600">
                            Help us improve by sharing your thoughts, reporting bugs, or suggesting new features.
                        </Text>
                    </View>

                    {/* Feedback Category Selection */}
                    <View className="px-4 mb-6">
                        <Text className="text-lg font-semibold text-gray-900 mb-4">
                            What type of feedback do you have?
                        </Text>

                        {feedbackCategories.map((category) => (
                            <FeedbackCategoryCard
                                key={category.id}
                                category={category}
                                isSelected={selectedCategory === category.id}
                                onSelect={handleCategorySelect}
                            />
                        ))}
                    </View>

                    {/* Feedback Message */}
                    <View className="px-4 mb-6">
                        <Text className="text-lg font-semibold text-gray-900 mb-3">
                            Tell us more
                        </Text>

                        <View className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <TextInput
                                value={feedbackText}
                                onChangeText={setFeedbackText}
                                placeholder="Please provide detailed feedback. The more information you share, the better we can help you."
                                placeholderTextColor="#9ca3af"
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                                className="p-4 text-base text-gray-900 min-h-[120px]"
                                maxLength={1000}
                            />

                            <View className="px-4 pb-2">
                                <Text className="text-right text-sm text-gray-400">
                                    {feedbackText.length}/1000
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Contact Email (Optional) */}
                    <View className="px-4 mb-6">
                        <Text className="text-lg font-semibold text-gray-900 mb-3">
                            Your Email (Optional)
                        </Text>

                        <View className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <TextInput
                                value={contactEmail}
                                onChangeText={setContactEmail}
                                placeholder="your.email@example.com"
                                placeholderTextColor="#9ca3af"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                className="p-4 text-base text-gray-900"
                            />
                        </View>

                        <Text className="text-sm text-gray-500 mt-2 px-1">
                            Include your email so we can follow up if needed
                        </Text>
                    </View>

                    {/* Submit Button */}
                    <View className="px-4 pb-4">
                        <TouchableOpacity
                            onPress={handleSubmitFeedback}
                            disabled={!isFormValid || isSubmitting}
                            className={`py-4 px-6 rounded-xl shadow-sm ${isFormValid && !isSubmitting
                                ? "bg-[#43BFF4]"
                                : "bg-gray-300"
                                }`}
                            activeOpacity={0.8}
                        >
                            <View className="flex-row items-center justify-center">
                                {isSubmitting && (
                                    <MaterialCommunityIcons
                                        name="loading"
                                        size={20}
                                        color="white"
                                        style={{ marginRight: 8 }}
                                    />
                                )}
                                <MaterialCommunityIcons
                                    name="email"
                                    size={20}
                                    color={isFormValid && !isSubmitting ? "white" : "#9ca3af"}
                                    style={{ marginRight: 8 }}
                                />
                                <Text
                                    className={`font-bold text-lg ${isFormValid && !isSubmitting
                                        ? "text-white"
                                        : "text-gray-500"
                                        }`}
                                >
                                    {isSubmitting ? "Opening Email..." : "Send via Email"}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Email Info */}
                    <View className="px-4 pb-4">
                        <View className="bg-blue-50 p-4 rounded-xl">
                            <View className="flex-row items-center mb-2">
                                <MaterialCommunityIcons
                                    name="email"
                                    size={20}
                                    color="#3b82f6"
                                    style={{ marginRight: 8 }}
                                />
                                <Text className="text-blue-700 font-semibold">
                                    Email Feedback
                                </Text>
                            </View>
                            <Text className="text-blue-600 text-sm">
                                Your feedback will open in your email app pre-filled with your message to Simplelifetim@gmail.com
                            </Text>
                        </View>
                    </View>

                    {/* Footer Info */}
                    <View className="px-4 pb-8">
                        <View className="bg-green-50 p-4 rounded-xl">
                            <View className="flex-row items-center mb-2">
                                <MaterialCommunityIcons
                                    name="shield-check"
                                    size={20}
                                    color="#22c55e"
                                    style={{ marginRight: 8 }}
                                />
                                <Text className="text-green-700 font-semibold">
                                    Privacy & Security
                                </Text>
                            </View>
                            <Text className="text-green-600 text-sm">
                                Your feedback is sent directly via your email app. We treat all feedback confidentially and use it only to improve our app.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SendFeedbackPage;
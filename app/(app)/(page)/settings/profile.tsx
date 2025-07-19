import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuth } from "@/app/context/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { updateUserProfile } from "@/utils/database/account";
import { fetchUserProfile } from "@/utils/user";
import { Profile } from "@/types/interface";
import { uploadPersonalAvatar } from "@/utils/database/storage";
import UploadPhotoDrawer from "@/components/ui/drawers/UploadPhotoDrawer"
import { TakePhoto, SelectImage } from "@/utils/devices/photos";

// Input Field Component
interface InputFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    maxLength?: number;
    editable?: boolean;
    rightIcon?: string;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    maxLength,
    editable = true,
    rightIcon,
}) => {
    return (
        <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>
            <View className="relative">
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    editable={editable}
                    className={`border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-white h-12 ${!editable ? "bg-gray-100 text-gray-500" : ""
                        }`}
                    placeholderTextColor="#9ca3af"
                />
                {rightIcon && (
                    <View className="absolute right-3 top-3">
                        <MaterialCommunityIcons
                            name={rightIcon as any}
                            size={20}
                            color="#6b7280"
                        />
                    </View>
                )}
            </View>
            {maxLength && editable && (
                <Text className="text-xs text-gray-500 mt-1 text-right">
                    {value.length}/{maxLength}
                </Text>
            )}
        </View>
    );
};

// Profile Photo Component
interface ProfilePhotoProps {
    imageUri?: string;
    onImageSelect: (uri: string) => void;
    isLoading?: boolean;
}

const ProfilePhoto: React.FC<ProfilePhotoProps> = ({
    imageUri,
    onImageSelect,
    isLoading = false,
}) => {

    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

    const selectImage = async () => {
        setIsDrawerOpen(false)
        const result = await SelectImage();

        if (result) {
            onImageSelect(result);
        }
    };

    const takePhoto = async () => {
        setIsDrawerOpen(false)
        const result = await TakePhoto();

        if (result) {
            onImageSelect(result);
        }
    };

    return (
        <View className="items-center mb-6">
            <TouchableOpacity
                onPress={() => setIsDrawerOpen(true)}
                className="relative"
                disabled={isLoading}
            >
                <View className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#3b82f6" />
                    ) : imageUri ? (
                        <Image source={{ uri: imageUri }} className="w-full h-full" />
                    ) : (
                        <MaterialCommunityIcons
                            name="account"
                            size={60}
                            color="#9ca3af"
                        />
                    )}
                </View>
                <View className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-full items-center justify-center border-3 border-white shadow-md">
                    <MaterialCommunityIcons
                        name="camera"
                        size={20}
                        color="white"
                    />
                </View>
            </TouchableOpacity>
            <Text className="text-sm text-gray-600 mt-3 font-medium">
                Profile Photo
            </Text>
            <Text className="text-xs text-gray-500 mt-1 text-center">
                Tap to change your photo
            </Text>
            <UploadPhotoDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                OnChooseFromGallery={selectImage}
                OnTakePhoto={takePhoto}
            />
        </View>
    );
};

// Header Component
const EditPersonalHeader: React.FC<{ onSave: () => void; isSaving: boolean }> = ({
    onSave,
    isSaving,
}) => {
    const router = useRouter();

    return (
        <View className="bg-white border-b border-gray-200 px-4 py-4">
            <View className="flex-row items-center justify-between">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="p-2 -ml-2"
                    disabled={isSaving}
                >
                    <MaterialCommunityIcons
                        name="close"
                        size={24}
                        color="#374151"
                    />
                </TouchableOpacity>

                <Text className="text-xl font-bold text-gray-900">Edit Profile</Text>

                <TouchableOpacity
                    onPress={onSave}
                    disabled={isSaving}
                    className={`px-4 py-2 rounded-lg ${isSaving ? "bg-gray-300" : "bg-blue-500"
                        }`}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text className="text-white font-medium">Save</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

// Main Edit Personal Page Component
const EditPersonalPage: React.FC = () => {
    const router = useRouter();
    const auth = useAuth();
    const { user } = auth;
    const [isSaving, setIsSaving] = useState(false);
    const [isImageUploading, setIsImageUploading] = useState(false);
    const [profile, setProfile] = useState<Profile | null>();
    const [userName, setUserName] = useState<string>("");
    useEffect(() => {
        if (user) {
            // Fetch the profile when the component mounts and we have a user
            const getProfile = async () => {
                const profileData = await fetchUserProfile(user.id);
                setProfile(profileData);
                if (profileData) {
                    setUserName(profileData.userName);
                }
            };
            getProfile();
        }

    }, [user]);


    const handleImageSelect = async (uri: string) => {
        setIsImageUploading(true);
        const imageUrl = uri;
        try {
            if (!user) {
                Alert.alert("Error", "User is not authenticated");
                return;
            }

            // Upload the image and get the public URL
            const uploadedImageUrl = await uploadPersonalAvatar(user.id, imageUrl);
            await updateUserProfile(user.id, undefined, uploadedImageUrl, undefined);
            if (profile) {
                profile.avatarURL = uploadedImageUrl;
                setProfile(profile);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            Alert.alert("Error", "Failed to upload image. Please try again.");
        }
        finally {
            setIsImageUploading(false);
        }
    };

    const onUserNameChange = (text: string) => {
        if (profile) {
            console.log("Username changed:", text);
            profile.userName = text;
            console.log("Updated profile:", profile);
            setProfile(profile);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (!profile) {
                Alert.alert("Error", "Profile data is not available");
                return;
            }
            // Validate username
            if (!profile.userName.trim()) {
                Alert.alert("Error", "Username is required");
                return;
            }

            // Update user profile in database
            await updateUserProfile(
                profile.id,
                userName.trim(),
                profile.avatarURL,
                undefined,
            );

            Alert.alert(
                "Success",
                "Profile updated successfully!",
                [{ text: "OK", onPress: () => router.back() }]
            );
        } catch (error) {
            console.error("Error saving profile:", error);
            Alert.alert("Error", "Failed to save profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <StatusBar style="auto" hidden={false} translucent={false} />
            <EditPersonalHeader onSave={handleSave} isSaving={isSaving} />

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    <View className="p-6 flex-1">
                        {/* Profile Photo Section */}
                        <View className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-6">
                            <ProfilePhoto
                                imageUri={profile?.avatarURL}
                                onImageSelect={handleImageSelect}
                                isLoading={isImageUploading}
                            />
                        </View>

                        {/* Basic Information */}
                        <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                            <Text className="text-lg font-semibold text-gray-900 mb-6">
                                Account Information
                            </Text>

                            <InputField
                                label="Username"
                                value={userName}
                                onChangeText={setUserName}
                                placeholder="Enter your username"
                                maxLength={20}
                            />

                            <InputField
                                label="Email Address"
                                value={user?.email ? user.email : ""}
                                onChangeText={() => { }} // Email should not be editable
                                placeholder="your@email.com"
                                editable={false}
                                rightIcon="lock"
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default EditPersonalPage;
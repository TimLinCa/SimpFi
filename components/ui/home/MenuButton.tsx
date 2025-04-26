import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar"
import { Divider } from "@/components/ui/divider"
import { useRouter } from 'expo-router';
import { useAuth } from "@/app/context/auth"
import {
    Drawer,
    DrawerBackdrop,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerFooter,
} from "@/components/ui/drawer"
import { VStack } from "@/components/ui/vstack"
import { Profile } from '@/types/interface';
import { fetchUserProfile } from '@/utils/user';
const MenuButton = () => {
    const router = useRouter();
    const { signOut, user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>();
    const [showDrawer, setShowDrawer] = React.useState(false)
    const handleSignOut = async () => {
        await signOut();
    };

    useEffect(() => {
        if (user) {
            // Fetch the profile when the component mounts and we have a user
            const getProfile = async () => {
                const profileData = await fetchUserProfile(user.id);
                setProfile(profileData);
            };
            getProfile();
        }

    }, [user]);

    const menuPress = (routePath: any) => {
        setShowDrawer(false);
        router.push(routePath);
    }

    return (
        <View>
            <TouchableOpacity
                onPress={() => setShowDrawer(true)}
                className="w-10 h-10 justify-center items-center"
            >
                <MaterialCommunityIcons name="menu" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Drawer
                isOpen={showDrawer}
                onClose={() => {
                    setShowDrawer(false)
                }}>
                <DrawerBackdrop />
                <DrawerContent className="w-[270px] md:w-[300px]">
                    <DrawerHeader className="justify-center flex-col gap-2">
                        <Avatar size="2xl">
                            <AvatarFallbackText>{profile?.userName?.charAt(0) || 'U'}</AvatarFallbackText>
                            {profile?.avatarURL ? (
                                <AvatarImage
                                    source={{
                                        uri: profile.avatarURL,
                                    }}
                                />
                            ) : null}
                        </Avatar>
                        <VStack className="justify-center items-center">
                            <Text >{profile?.userName || 'Loading...'}</Text>
                            <Text className="text-typography-600">
                                {user?.email}
                            </Text>
                        </VStack>
                    </DrawerHeader>
                    <Divider className="my-4" />
                    <DrawerBody contentContainerClassName="gap-2">
                        <TouchableOpacity onPress={() => menuPress("/(app)/(mainPages)/summary")} className="gap-3 flex-row items-center hover:bg-background-50 p-2 rounded-md">
                            <MaterialCommunityIcons name="view-dashboard" size={24} color="#52525b" />
                            <Text>Summary</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => menuPress("/(app)/(mainPages)/personal")} className="gap-3 flex-row items-center hover:bg-background-50 p-2 rounded-md">
                            <MaterialCommunityIcons name="account" size={24} color="#52525b" />
                            <Text>Personal</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => menuPress("/(app)/(mainPages)/groupList")} className="gap-3 flex-row items-center hover:bg-background-50 p-2 rounded-md">
                            <MaterialCommunityIcons name="account-group" size={24} color="#52525b" />
                            <Text>Group</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => menuPress("/(app)/(mainPages)/analyze")} className="gap-3 flex-row items-center hover:bg-background-50 p-2 rounded-md">
                            <MaterialCommunityIcons name="chart-bar" size={24} color="#52525b" />
                            <Text>Analyze</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => menuPress("/(app)/(mainPages)/setting")} className="gap-3 flex-row items-center hover:bg-background-50 p-2 rounded-md">
                            <MaterialCommunityIcons name="cog" size={24} color="#52525b" />
                            <Text>Settings</Text>
                        </TouchableOpacity>
                    </DrawerBody>
                    <DrawerFooter>
                        <TouchableOpacity
                            className="w-full flex-row items-center justify-center gap-2 py-3 px-4 rounded-lg border border-gray-300 bg-transparent"
                            activeOpacity={0.7}
                            onPress={() => handleSignOut()}
                        >
                            <Text className="text-base font-medium text-gray-500">Logout</Text>
                            <MaterialCommunityIcons name="logout" size={20} color="#6b7280" />
                        </TouchableOpacity>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </View>

    )
}

export default MenuButton;
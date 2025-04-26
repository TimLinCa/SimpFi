/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Divider } from '@/components/ui/divider'
import { FormControl } from '@/components/ui/form-control'
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input'
import { VStack } from '@/components/ui/vstack'
import { useNavigation, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { Text, View, TouchableOpacity, Alert } from 'react-native'
import { supabase } from "@/utils/supabase"
import { useAuth } from '@/app/context/auth'

const Signup = () => {
    const navigation = useNavigation();
    const router = useRouter();
    const [username, setUsername] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const handleState = () => {
        setShowPassword((showState) => {
            return !showState
        })
    }

    const { signUp } = useAuth();

    // Then in your signup function:
    const handleSignUp = async () => {
        // ... your validation code ...

        setLoading(true);

        try {
            const { error, data } = await signUp(email, password);

            if (error) {
                // If the error indicates the email is already registered
                if (error.message.includes('already registered')) {
                    Alert.alert('Error', 'This email is already registered. Please use a different email or try to log in.');
                } else {
                    Alert.alert('Error', error.message);
                }
            }

            if (data?.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        username: username,
                        avatar_url: getAvatarUrl(username)  // Optional
                    });

                if (profileError) {
                    console.error('Error creating profile:', profileError);
                    // Optional: You might want to delete the user if profile creation fails
                    // However, this is complex and might require admin privileges
                }

                Alert.alert(
                    'Success',
                    'Account created! Please check your email for verification.',
                    [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
                );

            }
        } catch (error) {
            const e = error as Error;
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    // Function to generate an avatar URL based on the first letter of a username
    const getAvatarUrl = (username: string) => {
        if (!username) return null;

        // Get the first letter of the username
        const firstLetter = username.charAt(0).toUpperCase();

        // Generate a background color based on the letter (optional)
        const colors = [
            '5DADE2', 'F4D03F', '58D68D', 'EC7063',
            'AF7AC5', '45B39D', 'EB984E', '5499C7'
        ];

        // Simple hash function to select a consistent color for a username
        const colorIndex = username.split('').reduce((acc, char) =>
            acc + char.charCodeAt(0), 0) % colors.length;

        const bgColor = colors[colorIndex];

        // Option 1: Using UI Avatars service
        const uiAvatarsUrl = `https://ui-avatars.com/api/?name=${firstLetter}&background=${bgColor}&color=fff&size=256`;

        // Option 2: Using DiceBear service
        const diceBearUrl = `https://api.dicebear.com/6.x/initials/svg?seed=${username}&backgroundColor=${bgColor}`;

        // Return the URL of your preferred service
        return uiAvatarsUrl;
    };

    return (
        <View className='bg-white h-full justify-center items-center'>
            <StatusBar style='auto'></StatusBar>
            <Text className='font-semibold text-2xl'>Sign up</Text>
            <VStack>
                <FormControl className="p-4 rounded-lg border-outline-300">
                    <VStack space="xl">
                        <VStack space="xs">
                            <Text className="text-typography-500">Email</Text>
                            <Input className="min-w-[250px]">
                                <InputField onChangeText={(text) => setEmail(text)} type="text" />
                            </Input>
                        </VStack>
                        <VStack space="xs">
                            <Text className="text-typography-500">User Name</Text>
                            <Input className="min-w-[250px]">
                                <InputField onChangeText={(text) => setUsername(text)} type="text" />
                            </Input>
                        </VStack>
                        <VStack space="xs">
                            <Text className="text-typography-500">Password</Text>
                            <Input className="text-center">
                                <InputField onChangeText={(text) => setPassword(text)} type={showPassword ? "text" : "password"} />
                            </Input>
                        </VStack>

                        <VStack>
                            <Text className="text-typography-500">Confirmed Password</Text>
                            <Input className="text-center">
                                <InputField type={showPassword ? "text" : "password"} />
                            </Input>
                        </VStack>


                        <TouchableOpacity onPress={handleSignUp} className='py-2.5 rounded-xl bg-sky-500 justify-center items-center'><Text className='text-white'>Sign up</Text></TouchableOpacity>
                        <Divider className="my-5" />
                        <View className='items-center'>
                            <Text className='text-gray-500'>Or</Text>
                        </View>
                        <View>
                            <View className="mt-5 items-center flex-row justify-center">
                                <Text className="text-typography-500">Already have account?</Text>
                                <TouchableOpacity onPress={() => navigation.goBack()}>
                                    <Text className="text-sky-500 font-semibold"> Log in</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </VStack>
                </FormControl>
            </VStack>
        </View>
    )
}

export default Signup
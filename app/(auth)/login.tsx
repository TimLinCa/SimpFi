// app/(auth)/login.tsx
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { FormControl } from "@/components/ui/form-control";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Text, View, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Divider } from "@/components/ui/divider";
import { useRouter } from 'expo-router';
import { performOAuth } from "@/utils/supabase";
import { useAuth } from '@/app/context/auth';
import GoogleSigninButton from '@/components/ui/buttons/googleSignin';
type OAuthProvider = 'google' | 'apple' | 'facebook';

export default function Login() {
    const router = useRouter();
    const { signIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setLoading(true);
        const { error } = await signIn(email, password);
        setLoading(false);

        if (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <View className='bg-white h-full justify-center items-center'>
            <StatusBar style="auto" />
            <View style={{ width: '60%', height: 100, justifyContent: 'center', alignItems: 'center' }}>
                <Image style={{ width: '100%', height: '100%', resizeMode: 'contain' }} source={require("@/assets/images/splash.png")} />
            </View>

            <FormControl className="p-4 rounded-lg border-outline-300">
                <VStack space="xl">
                    <VStack space="xs">
                        <Text className="text-typography-500">Email</Text>
                        <Input className="min-w-[250px]">
                            <InputField
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                placeholder="Enter your email"
                                type="text"
                            />
                        </Input>
                    </VStack>
                    <VStack space="xs">
                        <Text className="text-typography-500">Password</Text>
                        <Input className="text-center">
                            <InputField
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                placeholder="Enter your password"
                                type={showPassword ? "text" : "password"}
                            />
                            <InputSlot className="pr-3" onPress={handleShowPassword}>
                                {showPassword ?
                                    <MaterialCommunityIcons name="eye-outline" color="#000" size={16} /> :
                                    <MaterialCommunityIcons name="eye-off-outline" color="#000" size={16} />
                                }
                            </InputSlot>
                        </Input>

                        <TouchableOpacity
                            className='flex items-end mb-3'
                            onPress={() => router.push('/(auth)/forgot-password')}
                        >
                            <Text className='text-gray-700 text-sm'>Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleSignIn}
                            className='py-2.5 rounded-xl bg-sky-500 justify-center items-center'
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text className='text-white'>Login</Text>
                            )}
                        </TouchableOpacity>

                        <Divider className="my-5" />

                        <View className='items-center'>
                            <Text className='text-gray-500'>Or</Text>
                        </View>

                        <View className='mt-5'>
                            <GoogleSigninButton />
                        </View>

                        <View>
                            <View className="mt-5 items-center flex-row justify-center">
                                <Text className="text-typography-500">Don't have an account?</Text>
                                <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                                    <Text className="text-sky-500 font-semibold"> Sign Up</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </VStack>
                </VStack>
            </FormControl>
        </View>
    );
}
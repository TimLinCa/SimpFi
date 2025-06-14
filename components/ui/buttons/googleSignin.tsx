import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useAuth } from '@/app/context/auth'
import { loadData } from '@shopify/react-native-skia';

const GoogleSigninButton = () => {
    const { signInWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false)
    const onPress = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
        } catch (error) {
            new Error('unexpected error');
        } finally {
            setLoading(false);
        }
    }
    return (
        <TouchableOpacity
            className='flex-row items-center bg-white border border-gray-200 rounded-xl px-6 py-1 shadow-lg shadow-gray-200'
            onPress={onPress}
            activeOpacity={0.8}
            disabled={loading}
        >

            <Image
                className='w-10 h-10'
                source={require("@/assets/images/icons/google.png")}
            />
            {
                loading ? (
                    <View className='flex-1 flex-row items-center justify-center'>
                        <ActivityIndicator size="small" color="#000" />
                    </View>

                ) : <Text className='ml-4 text-gray-700 font-semibold text-base flex-1 text-center'>
                    Sign in with Google
                </Text>
            }
        </TouchableOpacity>
    )
}

export default GoogleSigninButton
import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import AddIncomePage from './addincome'

export default function AddIncome() {
    // Get the id parameter from the URL
    const { id } = useLocalSearchParams<{ id: string }>();
    if (id == 'addIncome') {
        return (
            <>
                <Stack.Screen
                    options={{
                        headerShown: false,
                    }}
                />
                <AddIncomePage incomeId={undefined} />
            </>
        );
    }
    // If id is not 'addIncome', render the AddIncomePage with the provided id
    // This is useful for editing an existing income entry
    else {
        return (
            <>
                <Stack.Screen
                    options={{
                        headerShown: false,
                    }}
                />
                <AddIncomePage incomeId={id} />
            </>
        );
    }

}
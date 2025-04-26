import React from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import AddTransactionPage from './addTransaction';

export default function AddTransaction() {
    const { id } = useLocalSearchParams<{ id: string }>();
    if (id == 'addTransaction') {
        return (
            <>
                <Stack.Screen
                    options={{
                        headerShown: false,
                    }}
                />
                <AddTransactionPage transactionId={undefined} />
            </>
        );
    }
    else {
        return (
            <>
                <Stack.Screen
                    options={{
                        headerShown: false,
                    }}
                />
                <AddTransactionPage transactionId={id} />
            </>
        );
    }

}
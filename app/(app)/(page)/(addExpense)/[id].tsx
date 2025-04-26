import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import AddExpensePage from './addexpense';

export default function AddExpense() {
    // Get the id parameter from the URL
    const { id, expenseType } = useLocalSearchParams<{ id: string, expenseType: string }>();

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            {/* Pass the groupId to your existing GroupDetailPage component */}
            <AddExpensePage expenseId={id} inputExpenseType={expenseType} />
        </>
    );
}
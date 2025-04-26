import { supabase } from '@/utils/supabase';
import { TransactionData } from '@/types/group';
/**
 * Add or update a group transaction using the database function upsert_group_transaction
 * @param transactionData - Object containing transaction details
 * @returns The ID of the created/updated transaction
 */
export const addOrUpdateTransaction = async (
    group_id: string,
    paid_by: string,
    paid_to: string,
    amount: number,
    id?: string,
    date?: string,
    notes?: string
): Promise<string> => {
    try {
        // Basic validation
        if (!group_id || !paid_by || !paid_to) {
            throw new Error('Missing required fields for transaction');
        }

        if (amount <= 0) {
            throw new Error('Transaction amount must be greater than zero');
        }

        // Ensure we're not paying ourselves
        if (paid_by === paid_to) {
            throw new Error('Payer and recipient cannot be the same person');
        }

        // Format date if not provided
        const formattedDate = date || new Date().toISOString().split('T')[0];

        // Call the database function
        const { data, error } = await supabase.rpc('upsert_group_transaction', {
            p_id: id || null,
            p_group_id: group_id,
            p_paid_by: paid_by,
            p_paid_to: paid_to,
            p_amount: amount,
            p_date: formattedDate,
            p_notes: notes || null
        });

        if (error) {
            console.error('Error calling upsert_group_transaction:', error);
            throw new Error(error.message);
        }

        // The function returns the transaction ID
        return data as string;
    } catch (error) {
        console.error('Error in addOrUpdateTransaction:', error);
        throw error;
    }
};

/**
 * Get detailed transaction information including full group and member details
 * @param transactionId - The ID of the transaction to retrieve
 * @returns Complete transaction details with group and member information
 */
export const getTransactionById = async (transactionId: string): Promise<TransactionData> => {
    try {
        if (!transactionId) {
            throw new Error('Transaction ID is required');
        }

        // Call the database function using RPC
        const { data, error } = await supabase.rpc(
            'get_transaction_by_id',
            { p_transaction_id: transactionId }
        );

        if (error) {
            console.error('Error fetching transaction details:', error);
            throw new Error(error.message);
        }

        if (!data) {
            throw new Error('Transaction not found');
        }

        return data as TransactionData;
    } catch (error) {
        console.error('Error in getTransactionById:', error);
        throw error;
    }
};
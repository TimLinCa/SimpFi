import { Category, PersonalIncome } from '@/types/interface';
import { supabase } from '@/utils/supabase';
import { create } from 'react-test-renderer';

export const addPersonalIncome = async (
    userId: string,
    title: string,
    amount: number,
    category: Category,
    description?: string,
    date?: string,
    incomeId?: string
): Promise<string | null> => {
    try {
        // Format date as YYYY-MM-DD if provided, otherwise use today
        const formattedDate = date || new Date().toISOString().split('T')[0];

        // Call the Supabase RPC function
        const { data, error } = await supabase.rpc('add_or_update_personal_income', {
            user_uuid: userId,
            income_title: title,
            income_description: description || null,
            income_date: formattedDate,
            income_amount: amount,
            income_category: category,
            income_uuid: incomeId || null
        });

        if (error) {
            console.error('Error adding income:', error);
            return null;
        }

        return data as string; // The UUID of the new income
    } catch (error) {
        console.error('Unexpected error adding income:', error);
        return null;
    }
}

export const getCategories = async (): Promise<Category[]> => {
    try {
        const { data, error } = await supabase.from('income_categories').select('*');

        if (error) {
            console.error('Error fetching categories:', error);
            return [];
        }

        return data as Category[];
    }
    catch (error) {
        console.error('Unexpected error fetching categories:', error);
        return [];
    }
}

/**
 * Fetches personal incomes for a user for a specific month and year
 * 
 * @param userId - User's UUID
 * @param month - Month (1-12)
 * @param year - Year (e.g., 2025)
 * @returns Promise resolving to an array of personal incomes sorted by date
 */
export const getPersonalIncomesByMonth = async (
    userId: string,
    month: number,
    year: number
): Promise<PersonalIncome[]> => {
    try {
        const { data, error } = await supabase.rpc('get_personal_incomes_by_month', {
            user_uuid: userId,
            month: month,
            year: year
        });

        if (error) {
            console.error('Error fetching personal incomes:', error);
            throw error;
        }

        // Transform the data to match your interface
        const incomes: PersonalIncome[] = (data || []).map((income: any) => {
            // Find the category name from the category_id
            // You might need to handle this differently if you're storing category names
            return {
                id: income.id,
                userId: userId, // Add userId from the parameter
                title: income.title,
                description: income.description || undefined,
                date: income.date,
                amount: income.amount,
                category: income.category,
                created_at: income.created_at || undefined
            };
        });

        return incomes;
    } catch (error) {
        console.error('Unexpected error fetching personal incomes:', error);
        throw error;
    }
};

/**
 * Fetches a personal income by ID using the database RPC function
 * 
 * @param incomeId - Income UUID
 * @returns Promise resolving to the income data or null if not found
 */
export const getIncomeById = async (incomeId: string): Promise<PersonalIncome | null> => {
    try {
        const { data, error } = await supabase.rpc('get_income_by_id', {
            income_uuid: incomeId
        });

        if (error) {
            console.error('Error fetching income:', error);
            return null;
        }

        // Return null if no data or data is null
        if (!data) {
            return null;
        }

        // Transform the data to match your interface if needed
        const income: PersonalIncome = {
            id: data.id,
            userId: data.user_id,
            title: data.title,
            amount: data.amount,
            category: data.category,
            description: data.description || '',
            date: data.date,
            created_at: data.created_at
        };

        return income;
    } catch (error) {
        console.error('Unexpected error fetching income:', error);
        return null;
    }
};

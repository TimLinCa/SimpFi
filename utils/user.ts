import { supabase } from './supabase';  // Adjust the import based on your project structure
import { Profile } from '@/types/interface';
// Function to fetch user profile from Supabase
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
        const { data, error } = await supabase
            .rpc('get_user_profile', { user_id: userId });

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }

        if (!data) {
            return null;
        }

        return data;
    } catch (error) {
        console.error('Unexpected error fetching profile:', error);
        return null;
    }
};


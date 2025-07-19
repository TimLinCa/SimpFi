import { supabase } from "@/utils/supabase";

export async function updateUserProfile(userId: string, userName?: string, avatarUrl?: string, expoPushToken?: string) {

    const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

    if (checkError) {
        console.error("Unexpected error checking profile:", checkError);
        return;
    }

    const profileData: { id: string; avatar_url?: string; username?: string; expo_push_token?: string } = { id: userId };
    if (avatarUrl) {
        profileData.avatar_url = avatarUrl;
    }
    if (userName) {
        profileData.username = userName;
    }
    if (expoPushToken) {
        profileData.expo_push_token = expoPushToken;
    }

    if (!existingProfile) {
        // Profile doesn't exist, create it
        const { error: profileError } = await supabase
            .from("profiles")
            .insert(profileData);

        if (profileError) {
            console.error("Unexpected error creating profile:", profileError);
        }
    } else {
        const { error: updateError } = await supabase
            .from("profiles")
            .update(profileData)
            .eq("id", userId);

        if (updateError) {
            console.error("Unexpected error updating profile:", updateError);
        }
    }
}

export async function isProfileExists(userId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

    if (error) {
        console.error("Error checking profile existence:", error);
        return false;
    }

    return !!data;
}
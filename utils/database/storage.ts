import { supabase } from '@/utils/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export const uploadPersonalAvatar = async (
    userId: string,
    imageUrl: any,
): Promise<string> => {
    const base64Img = await FileSystem.readAsStringAsync(imageUrl, { encoding: FileSystem?.EncodingType?.Base64 });
    const filePath = `${userId}/avatar.png`;
    const contentType = 'image/png';
    const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64Img), {
            contentType,
            upsert: true,
        });
    if (error) {
        console.error('Error uploading avatar:', error);
        throw new Error('Failed to upload avatar');
    }
    const publicUrl = (await supabase.storage.from('avatars').createSignedUrl(data.path, 999999999999999)).data?.signedUrl;

    if (!publicUrl) {
        throw new Error('Failed to get public URL for the uploaded avatar');
    }
    return publicUrl;
}
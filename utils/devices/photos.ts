import { Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import DocumentScanner from 'react-native-document-scanner-plugin'
import { ResponseType, ScanDocumentResponseStatus } from 'react-native-document-scanner-plugin'

const SelectImage = async (aspect?: [number, number]): Promise<string | null> => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Permission to access camera roll is required!");
        return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: aspect,
        quality: 0.8,
        base64: true,
    });

    if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
    }
    return null;
};

const TakePhoto = async (aspect?: [number, number]): Promise<string | null> => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Permission to access camera is required!");
        return null;
    }

    const lunchImageConfig: {
        allowsEditing: boolean;
        aspect?: [number, number];
        quality: number;
        base64: boolean;
    } = {
        allowsEditing: true,
        aspect: aspect,
        quality: 0.8,
        base64: true,
    }

    const result = await ImagePicker.launchCameraAsync({
        ...lunchImageConfig
    });

    if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
    }
    return null;
};

const ScanDocument = async (maxNumDocuments: number, responseType: ResponseType): Promise<string | undefined> => {
    // start the document scanner
    const { status, scannedImages } = await DocumentScanner.scanDocument(
        { maxNumDocuments, responseType }
    )
    if (status === ScanDocumentResponseStatus.Success && scannedImages && scannedImages.length > 0) {
        {
            // get back an array with scanned image file paths
            if (scannedImages.length > 0) {
                // set the img src, so we can view the first scanned image
                return scannedImages[0];
            }
        }

        return undefined;
    }
}

export { SelectImage, TakePhoto, ScanDocument };
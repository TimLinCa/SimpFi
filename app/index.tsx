import { Redirect } from 'expo-router';

export default function Index() {
    // This is a simple redirect to your login page
    return <Redirect href="/(auth)/login" />;
}
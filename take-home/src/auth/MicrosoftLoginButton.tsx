import { ActivityIndicator, Button, Text, View } from 'react-native';
import { useAuth } from './AuthContext';

type Props = {
    title?: string;
};

export default function MicrosoftLoginButton({
    title = 'Sign in with Microsoft',
}: Props) {
    const { request, promptAsync, isLoggedIn, loading, error, logout, accessToken } = useAuth();

    if (loading) {
        return <ActivityIndicator />;
    }

    if (isLoggedIn) {
        return (
            <View style={{ gap: 8, alignItems: 'center' }}>
                <Text>Signed in{accessToken ? '' : ''}</Text>
                <Button title="Sign out" onPress={logout} />
            </View>
        );
    }

    return (
        <View style={{ gap: 8, alignItems: 'center' }}>
            <Button
                title={title}
                disabled={!request}
                onPress={() => promptAsync()}
            />
            {error ? <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text> : null}
        </View>
    );
}

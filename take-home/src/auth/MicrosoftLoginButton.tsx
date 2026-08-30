import { Button } from 'react-native';
import useMicrosoftAuth from './useMicrosoftAuth';

type Props = {
    title?: string;
};

export default function MicrosoftLoginButton({
    title = 'Sign in with Microsoft',
}: Props) {
    const { request, response, promptAsync, isLoggedIn } = useMicrosoftAuth();


    return (
        <>
            {!isLoggedIn && (
                <Button
                    title="Sign in with Microsoft"
                    disabled={!request}
                    onPress={() => promptAsync()}
                />
            )}
        </>
    );
}

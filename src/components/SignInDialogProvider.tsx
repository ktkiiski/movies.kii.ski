import { Alert, Snackbar } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { AuthError, User } from 'firebase/auth';
import * as React from 'react';
import { useState, useCallback, useContext } from 'react';
import useAuthRedirectError from '../hooks/useAuthRedirectError';
import useUser from '../hooks/useUser';
import signIn from '../utils/signIn';
import FacebookLoginButton from './FacebookLoginButton';
import GoogleLoginButton from './GoogleLoginButton';

type AuthIdentityProvider = 'Facebook' | 'Google';

interface SignInDialogProps {
  open: boolean;
  onDismiss?: () => void;
  onSelect?: (provider: AuthIdentityProvider) => void;
}

interface DialogState {
  promise: Promise<User>;
  dismiss: (reason?: unknown) => void;
  setProvider: (provider: AuthIdentityProvider) => void;
}

const SignInContext = React.createContext<() => Promise<User>>(async () => {
  throw new Error(`SignInContext not provided!`);
});

function SignInDialog({ open, onDismiss, onSelect }: SignInDialogProps): JSX.Element {
  return (
    <Dialog onClose={onDismiss} aria-labelledby="login-dialog-title" open={open}>
      <DialogTitle id="login-dialog-title">Sign in with…</DialogTitle>
      <DialogContent style={{ width: '400px' }}>
        {!onSelect ? null : (
          <>
            <Typography>Select your account service</Typography>
            <FacebookLoginButton onClick={() => onSelect('Facebook')}>Sign in with Facebook</FacebookLoginButton>
            <GoogleLoginButton onClick={() => onSelect('Google')}>Sign in with Google</GoogleLoginButton>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface SignInDialogProviderProps {
  children: React.ReactNode;
}

function getErrorMessage(error: AuthError) {
  if (error.code === 'auth/account-exists-with-different-credential') {
    return 'You have already signed in with another account provider! Please sign in with that one instead!';
  }
  return error.message;
}

export default function SignInDialogProvider({ children }: SignInDialogProviderProps): JSX.Element {
  const user = useUser();
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const [isErrorHidden, setIsErrorHidden] = useState(false);
  const authError = useAuthRedirectError();
  const errorMessage = authError && getErrorMessage(authError);
  const authPromise = dialogState?.promise;
  const onCloseSnackbar = useCallback(() => {
    setIsErrorHidden(true);
  }, []);
  const requireAuth = useCallback(async () => {
    if (user) {
      return user;
    }
    if (authPromise) {
      return authPromise;
    }
    let setProvider!: (provider: AuthIdentityProvider) => void;
    let dismiss!: () => void;
    const providerPromise = new Promise<AuthIdentityProvider>((resolve, reject) => {
      setProvider = resolve;
      dismiss = reject;
    });
    const promise = providerPromise.then((provider) => signIn(provider));
    setDialogState({ promise, dismiss, setProvider });
    return promise;
  }, [authPromise, user]);
  const onDialogDismiss = useCallback(() => {
    if (dialogState) {
      dialogState.dismiss(new Error('Sign in dialog dismissed'));
      setDialogState(null);
    }
  }, [dialogState]);
  return (
    <SignInContext.Provider value={requireAuth}>
      {children}
      <SignInDialog open={dialogState != null} onDismiss={onDialogDismiss} onSelect={dialogState?.setProvider} />
      <Snackbar open={errorMessage != null && !isErrorHidden} autoHideDuration={30000} onClose={onCloseSnackbar}>
        <Alert onClose={onCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </SignInContext.Provider>
  );
}

export function useRequireAuth(): () => Promise<User> {
  return useContext(SignInContext);
}

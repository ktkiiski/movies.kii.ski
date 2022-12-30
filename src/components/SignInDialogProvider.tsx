import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { User } from 'firebase/auth';
import * as React from 'react';
import { useState, useCallback, useContext } from 'react';
import useSignIn from '../hooks/useSignIn';
import useUser from '../hooks/useUser';
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
      <DialogContent>
        <Typography>Select your account service</Typography>
        {!onSelect ? null : (
          <>
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

export default function SignInDialogProvider({ children }: SignInDialogProviderProps): JSX.Element {
  const user = useUser();
  const [signIn] = useSignIn();
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const authPromise = dialogState?.promise;
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
  }, [signIn, authPromise, user]);
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
    </SignInContext.Provider>
  );
}

export function useRequireAuth(): () => Promise<User> {
  return useContext(SignInContext);
}

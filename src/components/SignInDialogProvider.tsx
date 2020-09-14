import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import type { AuthIdentityProvider, Auth } from 'broilerkit/auth';
import { useSignIn, useAuth } from 'broilerkit/react/auth';
import FacebookLoginButton from 'broilerkit/react/components/FacebookLoginButton';
import GoogleLoginButton from 'broilerkit/react/components/GoogleLoginButton';
import * as React from 'react';
import { useState, useCallback, useContext } from 'react';

interface SignInDialogProps {
  open: boolean;
  onDismiss?: () => void;
  onSelect?: (provider: AuthIdentityProvider) => void;
}

interface DialogState {
  promise: Promise<Auth>;
  dismiss: (reason?: unknown) => void;
  setProvider: (provider: AuthIdentityProvider) => void;
}

const SignInContext = React.createContext<() => Promise<Auth>>(async () => {
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
  const auth = useAuth();
  const signIn = useSignIn();
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const authPromise = dialogState?.promise;
  const requireAuth = useCallback(async () => {
    if (auth) {
      return auth;
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
  }, [signIn, authPromise, auth]);
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

export function useRequireAuth(): () => Promise<Auth> {
  return useContext(SignInContext);
}

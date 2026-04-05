import { useAuth0 } from '@auth0/auth0-react';
import AuthLoading from '../pages/AuthLoading';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  if (isLoading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    loginWithRedirect();
    return <AuthLoading />;
  }

  return children;
}

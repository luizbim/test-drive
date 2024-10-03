import React from 'react';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import PageLoader from './page-loader';

interface AuthGuardProps {
  component: React.ComponentType;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ component }) => {
  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => (
      <div className="page-layout">
        <PageLoader />
      </div>
    ),
  });

  return <Component />;
};

export default AuthGuard;

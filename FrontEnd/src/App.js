import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';

// import User from './user/pages/Users';
// import NewPlace from './places/pages/NewPlace';
// import MainNavigation from './shared/components/Navigation/MainNavigation';
// import UserPlaces from './places/pages/UserPlaces';
// import UpdatePlace from './places/pages/UpdatePlace';
// import Authenticate from './user/pages/Authenticate';
import { AuthContext } from './shared/context/auth-context';
import useAuth from './shared/hooks/auth-hook';
import LoadingSpinner from './shared/components/UIElement/LoadingSpinner';

const User = React.lazy(() => import('./user/pages/Users'));
const NewPlace = React.lazy(() => import('./places/pages/NewPlace'));
const MainNavigation = React.lazy(() => import('./shared/components/Navigation/MainNavigation'));
const UserPlaces = React.lazy(() => import('./places/pages/UserPlaces'));
const UpdatePlace = React.lazy(() => import('./places/pages/UpdatePlace'));
const Authenticate = React.lazy(() => import('./user/pages/Authenticate'));

function App() {
  const { login, logout, token, userId } = useAuth();

  let route;

  if (token) {
    route = (
      <Switch>
        <Route path="/" exact>
          <User />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/places/new" exact>
          <NewPlace />
        </Route>
        <Route path="/places/:placeId" exact>
          <UpdatePlace />
        </Route>
        <Redirect to="/" />
      </Switch>
    );

  } else {
    route = (
      <Switch>
        <Route path="/" exact>
          <User />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/auth" exact>
          <Authenticate />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!token, token: token, login: login, logout: logout, userId: userId }}>
      <Router>
        <Suspense fallback={<div className='center'><LoadingSpinner /></div>}>
          <MainNavigation />
          <main>
            {route}
          </main>
        </Suspense>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;

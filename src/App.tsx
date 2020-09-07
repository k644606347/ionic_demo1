import React, { ErrorInfo } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
    IonApp,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonTabs,
    IonToast
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { square, triangle, images } from 'ionicons/icons';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';
import Details from './pages/Details';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

/* Global CSS */
import './global.css';

const App: React.FC = () => (
    <IonApp>
        <IonReactRouter>
            <IonTabs>
                <IonRouterOutlet>
                    <Route path="/tab1" component={Tab1} exact={true} />
                    <Route path="/tab2" component={Tab2} exact={true} />
                    <Route path="/tab2/details" component={Details} />
                    <Route path="/tab3" component={Tab3} />
                    <Route path="/" render={() => <Redirect to="/tab1" />} exact={true} />
                </IonRouterOutlet>
                <IonTabBar slot="bottom">
                    <IonTabButton tab="tab" href="/tab1">
                        <IonIcon icon={triangle} />
                        <IonLabel>标签1</IonLabel>
                    </IonTabButton>
                    <IonTabButton tab="tab2" href="/tab2">
                        <IonIcon icon={images} />
                        <IonLabel>照片</IonLabel>
                    </IonTabButton>
                    <IonTabButton tab="tab3" href="/tab3">
                        <IonIcon icon={square} />
                        <IonLabel>标签3</IonLabel>
                    </IonTabButton>
                </IonTabBar>
            </IonTabs>
        </IonReactRouter>
    </IonApp>
);

type ErrorBoundaryProps = {
    children?: React.ReactNode;
}
type ErrorBoundaryState = {
    hasError: boolean;
    error?: Error;
}
class ErrorBoundary extends React.PureComponent<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // Example "componentStack":
        //   in ComponentThatThrows (created by App)
        //   in ErrorBoundary (created by App)
        //   in div (created by App)
        //   in App
        logComponentStackToMyService(info.componentStack);
    }

    render() {
        return <>
        {this.props.children}
        <IonToast
            color="danger"
            isOpen={this.state.hasError}
            message={this.state.error + ''}
            duration={5000}
        />
        </>;
    }
}

function logComponentStackToMyService(stack: string) {
    console.log(stack);
}

export default () => <ErrorBoundary><App></App></ErrorBoundary>;

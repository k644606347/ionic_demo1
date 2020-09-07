import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSearchbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab1.css';
import { ListExample } from '../components/ListExample';
import NpmStatList from '../components/NpmStatList';

const Tab1: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          {/* <IonTitle>Tab 1</IonTitle> */}
          {/* <IonSearchbar></IonSearchbar> */}
        </IonToolbar>
        {/* <IonSearchbar></IonSearchbar> */}
      </IonHeader>
      <IonContent>
        {/* <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader> */}
        {/* <ExploreContainer name="Tab 1 page" /> */}
        {/* <ListExample></ListExample> */}
        <NpmStatList></NpmStatList>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;

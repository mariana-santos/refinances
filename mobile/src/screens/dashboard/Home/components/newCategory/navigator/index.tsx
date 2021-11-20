import React, { useState, useEffect } from 'react';

import { StatusBar, BackHandler, ToastAndroid } from 'react-native';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { HomeAccountStack } from '../../../../../../@types/RootStackParamApp';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, StackActions } from '@react-navigation/native';

import NewExpenseCategory from '../NewExpenseCategory';
import NewIncomeCategory from '../NewIncomeCategory';

import { Container } from './styles';
import { colors, fonts } from '../../../../../../styles';
import Header from '../../../../../../components/Header';

const Tab = createMaterialTopTabNavigator();

type PropsCategory = {
  navigation: StackNavigationProp<HomeAccountStack, "NewCategory">;
  route: StackNavigationProp<HomeAccountStack, "NewCategory">;
}

const TopBarNavigator = ({ navigation, route }: PropsCategory) => {
  const [routeName, setRouteName] = useState<string>();

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', backNavAction);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', backNavAction);
  }, [routeName]);

  const backNavAction = () => {
    navigation.dispatch(StackActions.replace('Main'));
    return true;
  };

  return (
    <Container
      style={{
        backgroundColor:
          routeName == 'Despesa' ? colors.paradisePink : colors.slimyGreen,
      }}>

      <Header
        backButton={() => backNavAction()}
        title="Nova categoria"
        color="#fff"
        isShort={true}
      />

      <Tab.Navigator
        initialRouteName={routeName}
        screenOptions={{
          swipeEnabled: false,
          tabBarStyle: {
            backgroundColor:
              routeName == 'Despesa' ? colors.paradisePink : colors.slimyGreen,
          },
          tabBarLabelStyle: {
            fontSize: fonts.size.medium,
            fontFamily: fonts.familyType.bold,
            textTransform: 'capitalize',
            justifyContent: 'center'
          },
          tabBarIndicatorStyle: {
            backgroundColor: colors.white,
          },
          tabBarActiveTintColor: colors.white,
        }}
        screenListeners={({ route }) => ({
          state: e => {
            setRouteName(route.name);
          },
        })}>
        <Tab.Screen
          name="Despesa"
          component={NewExpenseCategory}
        />
        <Tab.Screen
          name="Receita"
          component={NewIncomeCategory}
        />
      </Tab.Navigator>
    </Container>
  );
};

export default TopBarNavigator;

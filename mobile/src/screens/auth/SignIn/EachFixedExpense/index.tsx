import React, { useEffect, useRef, useState } from 'react';

import { BackHandler, Keyboard, TextInput, View } from 'react-native';

import { UseAuth } from '../../../../contexts/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, StackActions } from '@react-navigation/native';

import RootStackParamAuth from '../../../../@types/RootStackParamAuth';

import CurrencyInput from 'react-native-currency-input';
import SmoothPicker from 'react-native-smooth-picker';

// Styles
import {
  Container,
  Content,
  PrefixReaisSymbol,
  Writting,
  SmoothPickerContainer,
  SmoothPickerTopDetail,
  SmoothPickerBottomDetail,
} from './styles';
import { colors, fonts } from '../../../../styles';

// Icon
import IonIcons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

// Components
import Header from '../../components/Header';
import BottomNavigation from '../../components/BottomNavigation';
import SmoothPickerItem from '../../components/SmoothPickerItem';

import { Lancamento } from '../../../../contexts/EntriesContext';
import { Parcela } from '../../../../contexts/InstallmentContext';
import { heightPixel, widthPixel } from '../../../../helpers/responsiveness';
import { ScrollView } from 'react-native-gesture-handler';

export type PropsNavigation = {
  navigation: StackNavigationProp<RootStackParamAuth, 'EachFixedExpense'>;
  route: RouteProp<RootStackParamAuth, 'EachFixedExpense'>;
};

const EachFixedExpense = ({ navigation }: PropsNavigation) => {
  const [expenseAmount, setExpenseAmount] = useState<number | null>(0);
  const [formattedExpenseAmount, setFormattedExpenseAmount] = useState('');
  const [selectedDay, setSelectedDay] = useState(2);
  const [isFocused, setFocused] = useState(false);

  const { setupUser, updateSetupUserProps, showNiceToast, hideNiceToast } =
    UseAuth();

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const willShowSubscription = Keyboard.addListener(
      'keyboardWillShow',
      () => {
        setFocused(true);
        console.log('vai mostrou');
      },
    );
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setFocused(true);
      console.log('mostrou');
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setFocused(false);
      console.log('fechou');
    });

    return () => {
      willShowSubscription.remove();
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    let iterator = setupUser.expenseTagsCount;
    console.log('---------EXPENSE---------');
    console.debug(`Iterator: ${iterator}`);
    console.debug(`Current: ${setupUser.expenseTags[iterator]}`);
    if (setupUser.entries) console.debug(`Size: ${setupUser.entries.length}`);

    showNiceToast('fake', 'Oops!', null, 500);

    // Caso já tenha passado pela tela, recupera o expense aqui
    if (setupUser.entries != undefined) {
      if (setupUser.entries[setupUser.expenseTagsCount] != undefined) {
        var entryIndex = setupUser.entries.findIndex(
          entry =>
            entry.descricaoLancamento ==
            setupUser.expenseTags[setupUser.expenseTagsCount],
        );
        if (entryIndex != -1) {
          var entry = setupUser.entries[entryIndex];
          setExpenseAmount(entry.parcelasLancamento[0].valorParcela);
        }
      }
    }

    BackHandler.addEventListener('hardwareBackPress', backAction);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, []);

  const backAction = () => {
    if (setupUser.expenseTagsCount == 0) {
      navigation.dispatch(StackActions.replace('FixedExpenses'));
      return true;
    }
    navigation.dispatch(StackActions.replace('EachFixedExpenseCategory'));
    const newSetupProps = setupUser;
    newSetupProps.expenseTagsCount--;
    updateSetupUserProps(newSetupProps);
    return true;
  };

  async function next() {
    const expenseAmount = Number(
      formattedExpenseAmount.replace(/[.]+/g, '').replace(',', '.'),
    );

    if (expenseAmount < 1) {
      showNiceToast(
        'error',
        'Impossível!',
        'Insira um valor maior que R$ 0,99',
      );
      return;
    }

    hideNiceToast();

    let dateNow = new Date(Date.now());
    dateNow.setDate(selectedDay + 1);

    const entry = {
      descricaoLancamento: setupUser.expenseTags[setupUser.expenseTagsCount],
      lugarLancamento: 'extrato',
      tipoLancamento: 'despesa',
      parcelasLancamento: [
        {
          valorParcela: expenseAmount,
          dataParcela: dateNow,
        } as Parcela,
      ],
      essencial: true,
      categoryLancamento:
        setupUser.entries != undefined
          ? setupUser.entries[setupUser.expenseTagsCount] != undefined
            ? setupUser.entries[setupUser.expenseTagsCount].categoryLancamento
            : undefined
          : undefined,
    } as Lancamento;

    const newSetupProps = setupUser;

    newSetupProps.entries != undefined
      ? (newSetupProps.entries[setupUser.expenseTagsCount] = entry)
      : (newSetupProps.entries = [entry]);

    updateSetupUserProps(newSetupProps);
    navigation.dispatch(StackActions.replace('EachFixedExpenseCategory'));
  }

  return (
    <Container>
      <Header
        onBackButton={() => backAction()}
        title="Quanto gasta mensalmente com"
        lastWordAccent={`${setupUser.expenseTags[setupUser.expenseTagsCount]}?`}
        subtitle="Insira o valor mais aproximado da média"
        step={`${setupUser.expenseTagsCount + 1} de ${
          setupUser.expenseTags.length
        }`}
      />
      <ScrollView>
        <Content onPress={() => inputRef.current?.focus()} activeOpacity={1}>
          <Writting>
            <PrefixReaisSymbol>R$</PrefixReaisSymbol>
            <CurrencyInput
              style={{
                flex: 1,
                padding: 0,
                color: colors.davysGrey,
                fontFamily: fonts.familyType.bold,
                fontSize: fonts.size.super + 14,
              }}
              value={expenseAmount}
              onChangeValue={txt => setExpenseAmount(txt)}
              delimiter="."
              separator=","
              precision={2}
              placeholder="0,00"
              maxValue={999999}
              placeholderTextColor={'rgba(52, 52, 52, .3)'}
              selectionColor={colors.davysGrey}
              onChangeText={formattedValue => {
                setFormattedExpenseAmount(formattedValue);
                if (expenseAmount == null) setExpenseAmount(0.0);
              }}
              ref={inputRef}
              onBlur={() => {
                console.log('bluou');
                setFocused(false);
              }}
              onFocus={() => {
                console.log('focou');
                setFocused(true);
              }}
            />
            {expenseAmount != null && (
              <IonIcons
                style={{
                  padding: 6,
                  marginLeft: 16,
                }}
                name="close"
                size={32}
                color={`rgba(82, 82, 82, .08)`}
                onPress={() => {
                  setExpenseAmount(0.0);
                }}
              />
            )}
          </Writting>
        </Content>
      </ScrollView>

      <SmoothPickerContainer style={{ opacity: isFocused ? 0 : 1 }}>
        <View
          style={{
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <SmoothPicker
            style={{ width: '100%' }}
            offsetSelection={widthPixel(16)}
            contentContainerStyle={{
              height: heightPixel(380),
              justifyContent: 'center',
              alignItems: 'center',
            }}
            magnet
            horizontal
            scrollAnimation
            data={Array.from({ length: 31 }, (_, i) => i)}
            showsHorizontalScrollIndicator={false}
            initialScrollToIndex={2}
            onSelected={({ item, index }) => setSelectedDay(index)}
            renderItem={({ item, index }) => (
              <SmoothPickerItem
                isSelected={index == selectedDay}
                lastDay={item == 31}>
                {index + 1}
              </SmoothPickerItem>
            )}
          />
        </View>
        <SmoothPickerTopDetail>
          <AntDesign
            name="caretdown"
            size={widthPixel(40)}
            color={colors.bigDipOruby}
          />
        </SmoothPickerTopDetail>
        <SmoothPickerBottomDetail />
      </SmoothPickerContainer>

      <BottomNavigation
        onPress={() => next()}
        description={'Escolher categoria'}
        pickerOn={!isFocused}
      />
    </Container>
  );
};

export default EachFixedExpense;

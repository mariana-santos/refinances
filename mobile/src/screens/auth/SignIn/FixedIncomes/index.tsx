import React, { useEffect, useState, useRef } from 'react';

import { BackHandler } from 'react-native';

import { UseAuth } from '../../../../contexts/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, StackActions } from '@react-navigation/native';

import RootStackParamAuth from '../../../../@types/RootStackParamAuth';

// Styles
import {
  Container,
  ScrollContainer,
  ButtonContainer,
  TagContainer,
  Tag,
  CountContainer,
  Count,
} from './styles';
import { colors } from '../../../../styles';

// Components
import { TextInput } from 'react-native';

import Header from '../../components/Header';
import BottomNavigation from '../../components/BottomNavigation';
import Button from '../../../../components/Button';
import InputText from '../../../../components/InputText';
import Modalize from '../../../../components/Modalize';

import { Modalize as Modal } from 'react-native-modalize';

import global from '../../../../global';
import removeAccents from '../../../../helpers/removeAccents';
import capitalizeFirstLetter from '../../../../helpers/capitalizeFirstLetter';

export type PropsNavigation = {
  navigation: StackNavigationProp<RootStackParamAuth, 'FixedIncomes'>;
  route: RouteProp<RootStackParamAuth, 'FixedIncomes'>;
};

const FixedIncomes = ({ navigation }: PropsNavigation) => {
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Salário',
    'Bico',
  ]);
  const [newIncome, setNewIncome] = useState<string>('');
  const [newIncomeError, setNewIncomeError] = useState<any | null>(null);

  const modalizeRef = useRef<Modal>(null);
  const newIncomeRef = useRef<TextInput>(null);

  const { setupUser, updateSetupUserProps, showNiceToast, hideNiceToast } =
    UseAuth();

  useEffect(() => {
    if (setupUser.incomeTags) {
      let iterator = setupUser.incomeTagsCount;
      console.debug(`Contador: ${iterator}`);
      console.debug(`Current: ${setupUser.incomeTags[iterator]}`);
    } else console.debug('NULL pae');

    showNiceToast('fake', null, null, 500);

    BackHandler.addEventListener('hardwareBackPress', backAction);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, []);

  useEffect(() => {
    let tags = global.FIXED_INCOME_TAGS as [];
    setTags(tags);

    setupUser.incomeTags && setSelectedTags(setupUser.incomeTags);
  }, []);

  const backAction = () => {
    navigation.dispatch(StackActions.replace('EachFixedExpenseCategory'));
    const newSetupProps = setupUser;
    newSetupProps.expenseTagsCount--;
    newSetupProps.incomeTagsCount = 0;
    updateSetupUserProps(newSetupProps);
    return true;
  };

  async function next() {
    if (selectedTags.length < 1)
      return showNiceToast(
        'error',
        'Oops!',
        'Selecione ao menos 1 ganho fixo!',
      );

    hideNiceToast();

    const newSetupProps = setupUser;
    newSetupProps.incomeTags = selectedTags;
    newSetupProps.incomeTagsCount = 0;
    updateSetupUserProps(newSetupProps);

    navigation.dispatch(StackActions.replace('EachFixedIncome'));
  }

  const handleAddIncome = () => {
    if (newIncome != '') {
      let tagsToLowerCase = tags.map(tag => removeAccents(tag.toLowerCase()));

      if (tagsToLowerCase.includes(removeAccents(newIncome.toLowerCase()))) {
        setNewIncomeError('Esse gasto já existe!');
        return;
      }

      let tagsUpdated = [...tags, capitalizeFirstLetter(newIncome)];
      let tagsSelectedUpdated = [
        ...selectedTags,
        capitalizeFirstLetter(newIncome),
      ];
      setTags(tagsUpdated);
      setSelectedTags(tagsSelectedUpdated);
      closeModalize();
      setNewIncome('');
    }
  };

  const openModalize = () => modalizeRef.current?.open();
  const closeModalize = () => modalizeRef.current?.close();

  return (
    <Container>
      <ScrollContainer>
        <Header
          onBackButton={() => backAction()}
          title="Selecione os ganhos fixos"
          subtitle="Seus gastos mensais."
        />

        <TagContainer>
          {tags.map((tag, index) => (
            <Tag
              key={index}
              onPress={() => {
                if (!selectedTags.includes(tag)) {
                  let newArr = [...selectedTags, tag];
                  setSelectedTags(newArr);
                  return;
                }
                let newArr = selectedTags.filter(
                  tagTouched => tagTouched !== tag,
                );
                setSelectedTags(newArr);
              }}
              style={[
                {
                  shadowColor: 'rgba(0, 0, 0, .3)',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.08,
                  shadowRadius: 20,
                  elevation: 20,
                },
                selectedTags.includes(tag)
                  ? {
                      backgroundColor: colors.slimyGreen,
                      color: colors.white,
                    }
                  : {},
              ]}>
              {tag}
            </Tag>
          ))}
        </TagContainer>

        <CountContainer>
          <Count counter>{selectedTags.length} </Count>
          <Count>
            {selectedTags.length > 1 ? 'selecionados' : 'selecionado'}
          </Count>
        </CountContainer>

        <ButtonContainer>
          <Button
            style={{
              backgroundColor: colors.platinum,
            }}
            onPress={() => openModalize()}
            title="Outro"
            color={colors.davysGrey}
          />
        </ButtonContainer>
      </ScrollContainer>

      <BottomNavigation
        onPress={() => next()}
        description={'Já selecionei!'}
        iconColor={colors.slimyGreen}
      />

      <Modalize
        ref={modalizeRef}
        hasBodyBoundaries
        title="Novo gasto fixo 💸"
        backgroundColor={colors.cultured}>
        <InputText
          label="Novo gasto"
          placeholder="Empreendimento..."
          colorLabel={colors.slimyGreen}
          ref={newIncomeRef}
          value={newIncome}
          showClearIcon
          showErrorMessage
          lastOne
          error={newIncomeError}
          onClear={() => {
            setNewIncomeError(null);
            setNewIncome('');
          }}
          onChangeText={text => {
            setNewIncomeError(null);
            setNewIncome(text);
          }}
        />
        <Button
          style={{
            backgroundColor: colors.platinum,
          }}
          title="Adicionar"
          onPress={() => handleAddIncome()}
          color={colors.davysGrey}
        />
      </Modalize>
    </Container>
  );
};

export default FixedIncomes;

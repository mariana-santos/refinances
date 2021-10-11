import React, { useState, useEffect, useRef } from 'react';
import { TouchableHighlight, FlatList, View, ToastAndroid } from 'react-native'

import DateTimePickerModal from 'react-native-modal-datetime-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'

import InputText from '../../../../../components/InputText'
import {
    ContainerForm,
    InputControl,
    Label,
    TextInput,
    SectionDetalhes,
    TextDetalhes,
    ButtonDetalhes,
    SectionCardsParcelas,
    ContainerCardParcela,
    TituloCardParcela,
    LabelCardParcela,
    InputCardParcela
} from './styles'

import { Parcela } from '../../../../../contexts/InstallmentContext'
import { UseLancamentos, Lancamento } from '../../../../../contexts/EntriesContext'

import PickerLugar from '../PickerLugar'
import PickerCategoria from '../PickerCategoria'
import PickerContas from '../PickerContas'
import SelectionCategorias from '../SelectionCategories'

import {UseDadosTemp} from '../../../../../contexts/TemporaryDataContext'

import {PropsNavigation} from '../..'
import { Text } from 'react-native-paper'
import { Conta } from '../../../../../contexts/AccountContext';


type CardParcela = {
    id: number;
    conta: Conta | number;
    data: Date;
    valor: number;
    
}

type CardParcelaProps = {
    item: CardParcela;
    dataParcelas: CardParcela[];
    setDataParcelas: React.Dispatch<React.SetStateAction<CardParcela[]>>;
    tipoLancamento: string;
}

const ItemCardParcela = ({item, dataParcelas, setDataParcelas, tipoLancamento}: CardParcelaProps) => {
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);        
    const [selectedConta, setSelectedConta] = useState<Conta | number>(0)

    const [valor, setValor] = useState(String(item.valor))    

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date: Date) => {
        const aux = item
        aux.data = date
        dataParcelas[aux.id] = aux
        setDataParcelas(dataParcelas)
        hideDatePicker();
    };

    const onChangeValor = (text: string) => {
        setValor(text)
        const aux = item
        aux.valor = parseInt(text)
        dataParcelas[aux.id] = aux
        setDataParcelas(dataParcelas)  
    }

    useEffect(() => {
        const aux = item
        aux.conta = selectedConta
        dataParcelas[aux.id] = aux
        // console.log(dataParcelas[aux.id])
        setDataParcelas(dataParcelas)
    }, [selectedConta])

    return (
        <ContainerCardParcela>
            <TituloCardParcela onPress={showDatePicker}>Parcela de {item.data.toLocaleDateString()}</TituloCardParcela>
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
            />

            <InputCardParcela 
                keyboardType="numeric" 
                placeholder="R$ 00,00" 
                placeholderTextColor="gray"
               value={valor}
               onChangeText={onChangeValor}
            />
            <PickerContas conta={selectedConta} setConta={setSelectedConta} tipoLancamento={tipoLancamento}/>
        </ContainerCardParcela>
    )
}

const FormCadastro= ({route, navigation, valor, setValor, tipoLancamento}: PropsNavigation) => {

    const [detalhes, setDetalhes] = useState(false)

    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);        
    
    const [descricao, setDescricao] =  useState('')
    const [dataPagamento, setDataPagamento] =  useState((new Date(Date.now())))    

    const [selectedCategoria, setSelectedCategoria] = useState('0')
    const [selectedConta, setSelectedConta] = useState<Conta | number>(0)

    const [parcelas, setParcelas] =  useState('1')    
    
    const [dataParcelas, setDataParcelas] = useState<CardParcela[]>([
        {
            id: 0,
            conta: (typeof selectedConta == 'number' ? 0 : selectedConta.descricao),
            valor: 0,
            data: dataPagamento
        },
    ])
    const [dataParcelaAlterado, setDataParcelaAlterado] = useState(false)
    
    const {handleAdicionarLancamento, handleLoadLancamentos} = UseLancamentos()

    function toDate(dateStr: string) {
        var parts = dateStr.split("/");
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }

    function addMonths(date: Date, months: number) {
        var d = date.getDate();
        date.setMonth(date.getMonth() + +months);
        if (date.getDate() != d) {
          date.setDate(0);
        }
        return date;
    }
    
    const changeParcela = (text: string, date: Date, newDataParcelas: CardParcela[]) => {
        setParcelas(text)
        
        if (text == '') return
    
        let aux: CardParcela[] = []
        const num = parseInt(text)            
        
        let valorParcelaDividido =parseFloat((parseFloat(valor) / num).toFixed(2))

        console.log(`num: ${num} e newDataParcelas.length: ${newDataParcelas.length}`)
        if (num < newDataParcelas.length) {
            for (var i = 0; i < num; i++) {
                newDataParcelas[i].valor = valorParcelaDividido
                newDataParcelas[i].data = i == 0 ? date : addMonths(date, 1)

                aux.push(newDataParcelas[i])
            }
        } else if (num > newDataParcelas.length) {            
            for (var i = 0; i < num; i++) {
                // console.log(`data atual = ${date.toLocaleString()} | anterior = ${aux[i-1] ? aux[i-1].data.toLocaleDateString() : "Não tem"}`)
                const adicaoDeUmMes = aux[i-1] == undefined ? date : addMonths(aux[i-1].data, 1)
                console.log("adicaodeumes, ", adicaoDeUmMes.toLocaleDateString())
                if(i < newDataParcelas.length) {
                    newDataParcelas[i].valor = valorParcelaDividido
                    newDataParcelas[i].data = adicaoDeUmMes,
                    console.log(newDataParcelas[i])   
                    aux.push(newDataParcelas[i])
                
                } else {
                    aux.push({
                        id: i,
                        conta: selectedConta,
                        data: adicaoDeUmMes,
                        valor: valorParcelaDividido
                    })          
                    console.log(aux[i])             
                } 

                
            }
        }        

        setDataParcelas(aux)
        setDataParcelaAlterado(true)
    }

    // const useForceUpdate = () => {
    //     const set = useState(0)[1];
    //     return () => set((s) => s + 1);
    // }

    async function handleSubmit() {                    
        const newParcelas: Parcela[] = []
        
        console.log("dataParcelas, ", dataParcelas)
        dataParcelas.map(item => {
            newParcelas.push({
                id: -1,
                lancamentoParcela: -1,
                contaParcela: typeof item.conta == 'number' ? 0 : item.conta.id,
                dateParcela: item.data,
                valorParcela: item.valor                    
            })
        })            

        const newLancamento: Lancamento = {
            id: -1,
            descricaoLancamento: descricao,
            lugarLancamento: 'extrato',
            tipoLancamento: tipoLancamento,
            categoryLancamento: selectedCategoria,
            parcelasLancamento: newParcelas
        }
                    
        console.log('newLancamento: ', newLancamento)
        
        const getUser = await AsyncStorage.getItem('user')
        const idUser = JSON.parse(getUser == null ? "{id: 0}" : getUser).id
        
        const message = await handleAdicionarLancamento(newLancamento, idUser);            
        
        if(message == '') {
            ToastAndroid.show("Lançamento adicionado", ToastAndroid.SHORT)
            setDescricao('')
            setValor('')
            setSelectedCategoria('0')
            setSelectedConta(0)
            setParcelas('1')
        }
        else {
            ToastAndroid.show(message, ToastAndroid.SHORT)
        }
    }

    function DefinirDetalhes() {        
        setDetalhes(detalhes => detalhes ? false : true)
    }

    const showDatePicker = () => {
        setDatePickerVisibility(true);
      };
    
      const hideDatePicker = () => {
        setDatePickerVisibility(false);
      };
    
    const handleConfirm = (date: Date) => {                
        setDataPagamento(date)
        hideDatePicker();
        changeParcela(parcelas, date, dataParcelas)
    };    

    useEffect(() => {                            
        setDataParcelaAlterado(false)
    }, [dataParcelaAlterado])

    useEffect(() => {
        if(valor == '') return
        
        const parcelas = dataParcelas

        const valorParcela = (parseFloat(valor) / dataParcelas.length).toFixed(2)

        parcelas.map((item, index) => {
            parcelas[index].valor = parseFloat(valorParcela)
        })

        setDataParcelas(parcelas)
        setDataParcelaAlterado(true)
    }, [valor])

    return (
        <ContainerForm>
            
           

            <InputControl>
                <InputText
                    label="Descrição"
                    value={descricao}
                    onChangeText={setDescricao}
                    placeholder="Mercadinho"
                    placeholderTextColor={"#bbb"}
                    colorLabel={tipoLancamento == 'despesa' ? '#EE4266' : '#6CB760'}></InputText>
            </InputControl>

            <InputControl>
                <SelectionCategorias tipoCategoria={tipoLancamento} categoria={selectedCategoria} setCategoria={setSelectedCategoria} navigation={navigation}/>
            </InputControl>

            <InputControl>
                <PickerContas conta={selectedConta} setConta={setSelectedConta} tipoLancamento={tipoLancamento}/>
            </InputControl>

            <InputControl>
                <Label>Data de Pagamento</Label>
                <Text onPress={showDatePicker} >{dataPagamento.toLocaleDateString()}</Text>
                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                    // date={toDate(dataPagamento)}
                />
            </InputControl>   

            <SectionDetalhes>
                <ButtonDetalhes onPress={DefinirDetalhes}>
                    <TextDetalhes>{detalhes ? 'Menos' : 'Mais'} detalhes</TextDetalhes>
                </ButtonDetalhes>
            </SectionDetalhes>

            {detalhes &&
                <>
                    <InputControl>
                        <InputText
                            label="Quantidade de Parcelas"
                            colorLabel={tipoLancamento == 'despesa' ? '#EE4266' : '#6CB760'}
                            value={parcelas}
                            onChangeText={(text) => changeParcela(text, dataPagamento, dataParcelas)}
                            placeholder="1"
                            keyboardType="numeric"
                            />
                                
                        
                    </InputControl>
                    
                    <SectionCardsParcelas>
                        {!dataParcelaAlterado && <FlatList 
                            data={dataParcelas}
                            renderItem={({item}) => <ItemCardParcela item={item} dataParcelas={dataParcelas} setDataParcelas={setDataParcelas} tipoLancamento={tipoLancamento}/>}
                            horizontal
                            keyExtractor={(item, index) => String(index)} />}
                    </SectionCardsParcelas>
                </>
            }

            <TouchableHighlight
                onPress={handleSubmit}
                style={{ marginBottom: 100 }}>
                <Text>Botao Provisorio</Text>
            </TouchableHighlight>
        </ContainerForm>
    )
}

export default FormCadastro
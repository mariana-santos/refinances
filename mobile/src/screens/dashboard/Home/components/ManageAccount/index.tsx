import React, { useEffect, useLayoutEffect, useRef } from 'react'


import CardAccount from './CardAccount'

import {HomeAccountStack} from '../../../../../@types/RootStackParamApp'

import {
    Container,
    ButtonAdd,
    TextButton
} from './styles'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/core'

import {UseContas} from '../../../../../contexts/AccountContext'

import retornarIdDoUsuario from '../../../../../helpers/retornarIdDoUsuario'

type PropsManageAccount = {
    navigation: StackNavigationProp<HomeAccountStack, "ManageAccount">,    
    route: RouteProp<HomeAccountStack, "ManageAccount">,
}

const ManageAccount = ({route, navigation}: PropsManageAccount) => {
    const {contas, loading, handleReadByUserContas} = UseContas()
    
    
    useLayoutEffect(() => {
        (async function(){
            handleReadByUserContas(await retornarIdDoUsuario())
        }) ()
               
    }, [])
    return (
        <Container>
            {
                !loading && contas.map((item, index) => {
                   if(item.descricao == undefined) return

                    return (
                        <CardAccount item={item} key={index}/>
                    )
                })   
            }

            <ButtonAdd onPress={() => navigation.navigate('CreateAccount')}>
                <TextButton>Adicionar</TextButton>
            </ButtonAdd>

            
        </Container>
    )
}

export default ManageAccount
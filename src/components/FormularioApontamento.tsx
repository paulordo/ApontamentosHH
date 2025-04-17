import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  funcionarioId: number;
  funcionarioNome: string;
  ordemId: number | string;
  onApontamentoRegistrado: () => void;
};

export default function FormularioApontamento({ funcionarioId, funcionarioNome, ordemId, onApontamentoRegistrado }: Props) {
  // Estados para armazenar data e horários
  const [data, setData] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');

  // Formata a data digitada para o formato DD/MM/AAAA
  const formatarDataDigitada = (texto: string) => {
    const digitos = texto.replace(/\D/g, '');
    let formatado = '';

    if (digitos.length <= 2) formatado = digitos;
    else if (digitos.length <= 4) formatado = `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
    else formatado = `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4, 8)}`;

    setData(formatado);
  };

  // Formata hora digitada para HH:MM
  const formatarHoraDigitada = (texto: string) => {
    const digitos = texto.replace(/\D/g, '');
    if (digitos.length <= 2) return digitos;
    return `${digitos.slice(0, 2)}:${digitos.slice(2, 4)}`;
  };

  // Atualiza os horários conforme digita
  const handleHoraInicioChange = (texto: string) => setHoraInicio(formatarHoraDigitada(texto));
  const handleHoraFimChange = (texto: string) => setHoraFim(formatarHoraDigitada(texto));

  // Salva o apontamento no AsyncStorage
  const registrarApontamento = async () => {
    const novoApontamento = { funcionarioId, ordemId, data, horaInicio, horaFim };

    try {
      const apontamentosString = await AsyncStorage.getItem('apontamentos');
      const apontamentos = apontamentosString ? JSON.parse(apontamentosString) : [];

      apontamentos.push(novoApontamento);
      await AsyncStorage.setItem('apontamentos', JSON.stringify(apontamentos));

      Alert.alert('Apontamento Registrado', `Funcionário: ${funcionarioId} - ${funcionarioNome}\nOrdem: ${ordemId}\nData: ${data}\nInício: ${horaInicio}\nFim: ${horaFim}`);
      console.log(`Apontamento salvo para ${funcionarioNome}:`, novoApontamento);

      // Limpa o formulário
      setData('');
      setHoraInicio('');
      setHoraFim('');

      // Informa o componente pai para limpar as seleções
      onApontamentoRegistrado();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  return (
    <View style={{ gap: 8 }}>
      <Text variant="titleMedium">Data:</Text>
      <TextInput
        value={data}
        onChangeText={formatarDataDigitada}
        mode="outlined"
        placeholder="DD/MM/AAAA"
        keyboardType="numeric"
        style={{ backgroundColor: '#fff' }}
      />

      <Text variant="titleMedium">Hora Início:</Text>
      <TextInput
        value={horaInicio}
        onChangeText={handleHoraInicioChange}
        mode="outlined"
        placeholder="00:00"
        keyboardType="numeric"
        style={{ backgroundColor: '#fff' }}
      />

      <Text variant="titleMedium">Hora Fim:</Text>
      <TextInput
        value={horaFim}
        onChangeText={handleHoraFimChange}
        mode="outlined"
        placeholder="00:00"
        keyboardType="numeric"
        style={{ backgroundColor: '#fff' }}
      />

      <Button
        mode="contained"
        onPress={registrarApontamento}
        style={{ marginTop: 10, paddingVertical: 6, borderRadius: 8 }}
        buttonColor="#6200ee"
        textColor="#fff"
      >
        Registrar Apontamento
      </Button>

    </View>
  );
}

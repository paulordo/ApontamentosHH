import React from 'react';
import { Text } from 'react-native';
import { Card, Divider } from 'react-native-paper';

interface Pessoa {
    // Define a estrutura dos dados de uma pessoa
  PEQ_CODIGO: number;
  PES_RAZAO: string;
}

interface Props {
    // Define as propriedades esperadas pelo componente
  nomeEquipe: string;
  pessoas: Pessoa[];
}

const EquipeFuncionariosCard: React.FC<Props> = ({ nomeEquipe, pessoas }) => {
    // Verifica se o nome da equipe e a lista de pessoas estão definidos
  return (
    <Card style={{ marginTop: 20, padding: 10, maxWidth: 450, minWidth: 400 }}>
      <Card.Title title={`${nomeEquipe}`} />
      <Card.Content>
        {pessoas.length > 0 ? (
          pessoas.map((pessoa, index) => (
            <React.Fragment key={pessoa.PEQ_CODIGO}>
              <Text style={{ paddingVertical: 6, fontSize: 20 }}>
                {pessoa.PES_RAZAO}
              </Text>
              {index < pessoas.length - 1 && <Divider />}
            </React.Fragment>
          ))
        ) : (
          <Text>Nenhum funcionário encontrado.</Text>
        )}
      </Card.Content>
    </Card>
  );
};

export default EquipeFuncionariosCard;

import { Column, Row, Spacer, Text } from '@expo/ui/jetpack-compose';
import { weight } from '@expo/ui/jetpack-compose/modifiers';
import { createCustomNotification } from 'expo-widgets';

import type { ActivityStatus } from './activity-status.types';

/**
 * Notificação fixa do Android para qualquer atividade em andamento.
 * Roda num runtime isolado: sem hooks, imports em tempo de execução ou constantes de módulo.
 * O fundo é o da bandeja do sistema, então as cores seguem o tema claro/escuro do aparelho.
 */
export const ActivityNotification = createCustomNotification(
  'ActivityNotification',
  (props: ActivityStatus, environment) => {
    'widget';
    const dark = environment.colorScheme === 'dark';
    const text = dark ? '#FFFFFF' : '#0F172A';
    const muted = dark ? '#91BCE4' : '#475569';
    const accent = props.paused ? '#CA8A04' : dark ? '#60A5FA' : '#2563EB';
    const status = props.paused ? props.pausedLabel : props.title;

    return {
      collapsed: (
        <Column verticalArrangement={{ spacedBy: 2 }}>
          <Text color={accent} style={{ fontSize: 13, fontWeight: '600' }}>
            {status}
          </Text>
          <Text color={text} maxLines={1} style={{ fontSize: 16, fontWeight: '700' }}>
            {`${props.primaryValue} ${props.primaryUnit}  ·  ${props.elapsedText}  ·  ${props.secondaryValue}`}
          </Text>
        </Column>
      ),
      expanded: (
        <Column verticalArrangement={{ spacedBy: 6 }}>
          <Text color={accent} style={{ fontSize: 13, fontWeight: '600' }}>
            {status}
          </Text>
          <Row verticalAlignment="bottom" horizontalArrangement={{ spacedBy: 4 }}>
            <Text color={text} style={{ fontSize: 30, fontWeight: '800' }}>
              {props.primaryValue}
            </Text>
            <Text color={muted} style={{ fontSize: 14 }}>
              {props.primaryUnit}
            </Text>
          </Row>
          <Row>
            <Column modifiers={[weight(1)]}>
              <Text color={text} style={{ fontSize: 16, fontWeight: '700' }}>
                {props.elapsedText}
              </Text>
              <Text color={muted} style={{ fontSize: 12 }}>
                {props.elapsedLabel}
              </Text>
            </Column>
            <Spacer />
            <Column modifiers={[weight(1)]}>
              <Text color={text} style={{ fontSize: 16, fontWeight: '700' }}>
                {props.secondaryValue}
              </Text>
              <Text color={muted} style={{ fontSize: 12 }}>
                {props.secondaryLabel}
              </Text>
            </Column>
          </Row>
        </Column>
      ),
    };
  },
);

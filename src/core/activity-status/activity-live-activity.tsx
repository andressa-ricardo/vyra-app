import { HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  activityBackgroundTint,
  font,
  foregroundStyle,
  monospacedDigit,
  padding,
} from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity } from 'expo-widgets';

import type { ActivityStatus } from './activity-status.types';

/**
 * Live Activity (tela de bloqueio e Dynamic Island) de qualquer atividade em andamento.
 * Roda num runtime isolado: sem hooks, imports em tempo de execução ou constantes de módulo,
 * por isso as cores estão escritas aqui (iguais a `authColors`).
 */
export const ActivityLiveActivity = createLiveActivity(
  'ActivityLiveActivity',
  (props: ActivityStatus) => {
    'widget';
    const primary = '#3B82F6';
    const muted = '#91BCE4';
    const start = new Date(props.timerStartMs);
    // Pausado, o tempo fica parado no valor enviado; ativo, o próprio iOS conta os segundos.
    const timer = props.paused ? (
      <Text modifiers={[font({ size: 17, weight: 'semibold' }), monospacedDigit()]}>
        {props.elapsedText}
      </Text>
    ) : (
      <Text
        countsDown={false}
        modifiers={[font({ size: 17, weight: 'semibold' }), monospacedDigit()]}
        timerInterval={{ lower: start, upper: new Date(start.getTime() + 24 * 3_600_000) }}
      />
    );

    return {
      banner: (
        <VStack
          alignment="leading"
          modifiers={[padding({ all: 16 }), activityBackgroundTint('#030C1B')]}
          spacing={10}>
          <HStack spacing={8}>
            <Image color={primary} systemName={props.iosSymbol as never} />
            <Text modifiers={[font({ size: 15, weight: 'semibold' }), foregroundStyle('#FFFFFF')]}>
              {props.title}
            </Text>
            <Spacer />
            {props.paused ? (
              <Text modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle('#FACC15')]}>
                {props.pausedLabel}
              </Text>
            ) : null}
          </HStack>
          <HStack alignment="lastTextBaseline" spacing={4}>
            <Text modifiers={[font({ size: 34, weight: 'heavy' }), foregroundStyle('#FFFFFF'), monospacedDigit()]}>
              {props.primaryValue}
            </Text>
            <Text modifiers={[font({ size: 15 }), foregroundStyle(muted)]}>{props.primaryUnit}</Text>
            <Spacer />
            <VStack alignment="trailing" spacing={2}>
              <HStack spacing={0} modifiers={[foregroundStyle('#FFFFFF')]}>
                {timer}
              </HStack>
              <Text modifiers={[font({ size: 12 }), foregroundStyle(muted)]}>{props.elapsedLabel}</Text>
            </VStack>
            <VStack alignment="trailing" spacing={2}>
              <Text modifiers={[font({ size: 17, weight: 'semibold' }), foregroundStyle('#FFFFFF'), monospacedDigit()]}>
                {props.secondaryValue}
              </Text>
              <Text modifiers={[font({ size: 12 }), foregroundStyle(muted)]}>{props.secondaryLabel}</Text>
            </VStack>
          </HStack>
        </VStack>
      ),
      compactLeading: (
        <HStack spacing={4}>
          <Image color={primary} systemName={props.iosSymbol as never} />
          <Text modifiers={[font({ size: 14, weight: 'semibold' }), monospacedDigit()]}>
            {props.primaryValue}
          </Text>
        </HStack>
      ),
      compactTrailing: (
        <HStack spacing={0} modifiers={[foregroundStyle(props.paused ? '#FACC15' : primary)]}>
          {timer}
        </HStack>
      ),
      minimal: <Image color={primary} systemName={props.iosSymbol as never} />,
      expandedLeading: (
        <VStack alignment="leading" spacing={2}>
          <Text modifiers={[font({ size: 28, weight: 'heavy' }), monospacedDigit()]}>{props.primaryValue}</Text>
          <Text modifiers={[font({ size: 12 }), foregroundStyle(muted)]}>{props.primaryUnit}</Text>
        </VStack>
      ),
      expandedTrailing: (
        <VStack alignment="trailing" spacing={2}>
          {timer}
          <Text modifiers={[font({ size: 12 }), foregroundStyle(muted)]}>{props.elapsedLabel}</Text>
        </VStack>
      ),
      expandedBottom: (
        <HStack spacing={6}>
          <Image color={primary} systemName={props.iosSymbol as never} />
          <Text modifiers={[font({ size: 13 }), foregroundStyle(muted)]}>
            {props.paused ? props.pausedLabel : props.title}
          </Text>
          <Spacer />
          <Text modifiers={[font({ size: 13, weight: 'semibold' }), monospacedDigit()]}>
            {props.secondaryValue}
          </Text>
        </HStack>
      ),
    };
  },
);

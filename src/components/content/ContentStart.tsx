import React from 'react';
import { View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontText } from '@app/components/utils/FontText';
import { Loading } from '@app/components/utils/Loading';
import { useTheme } from '@rneui/themed';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';

interface InstructionItem {
  icon: any;
  text: string;
}

interface ContentStartProps {
  title: string;
  highlight?: string;
  instructions: InstructionItem[];
  onContinue: () => void;
  onGoBack: () => void;
  imageSource: any;
  buttonLabel: string;
  loading?: boolean;
  highlightColor?: string;
}

export function ContentStart({
  title,
  highlight,
  instructions,
  onContinue,
  onGoBack,
  imageSource,
  buttonLabel,
  highlightColor,
  loading = false,
}: ContentStartProps) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.black }}>
      {loading ? (
        <Loading />
      ) : (
        <>
          <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 }}>
            <GoBackButton onPress={onGoBack} theme={'black'} />
          </View>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              marginTop: 50,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Image
                source={imageSource}
                style={{ width: 80, height: 80, marginBottom: 40, resizeMode: 'contain' }}
              />
              <FontText
                h2
                style={{ color: theme.colors.white, textAlign: 'center', marginBottom: 40 }}
              >
                {title}{' '}
                {highlight ? (
                  <FontText h2 style={{ color: highlightColor || theme.colors.primary }}>
                    {highlight}
                  </FontText>
                ) : null}
              </FontText>
            </View>
            <View style={{ width: '100%', gap: 8, marginBottom: 40 }}>
              {instructions.map((item, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(227,211,213,0.1)',
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 8,
                  }}
                >
                  <View style={{ width: 24, height: 24, marginRight: 16 }}>{item.icon}</View>
                  <FontText small style={{ color: theme.colors.white, flex: 1 }}>
                    {item.text}
                  </FontText>
                </View>
              ))}
            </View>
          </View>
        </>
      )}
      {!loading && (
        <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          <SecondaryButton onPress={onContinue}>
            <FontText small>{buttonLabel}</FontText>
          </SecondaryButton>
        </View>
      )}
    </SafeAreaView>
  );
}

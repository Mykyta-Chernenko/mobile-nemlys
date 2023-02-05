import React from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { i18n } from '@app/localization/i18n';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { Progress } from '@app/components/utils/Progress';
import { Loading } from '../utils/Loading';
import { KEYBOARD_BEHAVIOR } from '@app/utils/constants';
import { FontText } from '../utils/FontText';
import ImageOrDefault from '../utils/ImageOrDefault';
export default function (props: {
  loading: boolean;
  title: string;
  progress: number;
  showButton: boolean;
  buttonText?: string;
  onPress: (() => void) | undefined;
  onBackPress: () => void;
  image?: string;
  children?: React.ReactNode;
}) {
  return (
    <KeyboardAvoidingView behavior={KEYBOARD_BEHAVIOR} style={{ flexGrow: 1 }}>
      <ScrollView
        keyboardShouldPersistTaps="always"
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: 'white',
          paddingVertical: 25,
          paddingHorizontal: 15,
        }}
      >
        <View
          style={{
            marginBottom: 10,
            height: 200,
          }}
        >
          <ImageOrDefault image={props.image || 'pre_placement'}></ImageOrDefault>
        </View>
        {props.loading ? (
          <Loading></Loading>
        ) : (
          <>
            <View style={{ flexGrow: 1 }}>
              <View style={{ flexDirection: 'row' }}>
                <GoBackButton onPress={props.onBackPress}></GoBackButton>
                <Progress value={props.progress}></Progress>
              </View>
              <FontText
                style={{
                  textAlign: 'center',
                  marginBottom: 10,
                  fontWeight: 'bold',
                }}
                h4
              >
                {props.title}
              </FontText>
              {props.children}
            </View>
            {props.showButton && (
              <View>
                <View style={{ flexDirection: 'row', paddingHorizontal: 10, marginTop: 5 }}>
                  <PrimaryButton
                    title={props.buttonText ?? i18n.t('next')}
                    onPress={props.onPress}
                    containerStyle={{ flexGrow: 40, marginHorizontal: 10 }}
                  />
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

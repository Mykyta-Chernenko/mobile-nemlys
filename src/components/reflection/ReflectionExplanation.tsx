import { useTheme } from '@rneui/themed';
import React, { useContext } from 'react';
import { Modal, TouchableWithoutFeedback, View } from 'react-native';
import { CloseButton } from '../buttons/CloseButton';
import { FontText } from '../utils/FontText';
import { i18n } from '@app/localization/i18n';
import { PrimaryButton } from '../buttons/PrimaryButtons';
import { localAnalytics } from '@app/utils/analytics';
import { AuthContext } from '@app/provider/AuthProvider';
import { isSmallDevice } from '@app/utils/size';
import StorySelected from '../../icons/story_selected';
import QuestionTriangle from '../../icons/question_triangle_selected';
import GreenLock from '../../icons/green_lock';
export default function ({ show, onClose }: { show: boolean; onClose: () => void }) {
  const { theme } = useTheme();

  const authContext = useContext(AuthContext);

  const onClosePressed = () => {
    void localAnalytics().logEvent('ReflectionExplanationClosed', {
      screen: 'ReflectionExplanation',
      action: 'Closed',
      userId: authContext.userId,
    });
    onClose();
  };
  return (
    <Modal animationType="none" transparent={true} visible={show}>
      <TouchableWithoutFeedback onPress={onClosePressed} style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableWithoutFeedback style={{ flex: 1 }}>
            <View
              style={{
                height: isSmallDevice() ? '70%' : '55%',
                width: '100%',
                backgroundColor: theme.colors.white,
                borderRadius: 24,
                flexDirection: 'column',
                padding: 20,
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <CloseButton onPress={onClosePressed} theme="dark"></CloseButton>
              </View>

              <FontText h2>{i18n.t('reflection.explanation.title')}</FontText>

              <View>
                {[
                  {
                    image: <StorySelected height={40} width={40}></StorySelected>,
                    text: 'reason_1',
                  },
                  {
                    image: <QuestionTriangle height={40} width={40}></QuestionTriangle>,
                    text: 'reason_2',
                  },
                  {
                    image: (
                      <GreenLock
                        height={45}
                        width={54}
                        style={{ marginLeft: -7, marginRight: -7 }}
                      ></GreenLock>
                    ),
                    text: 'reason_3',
                  },
                ].map((o, i) => (
                  <View
                    key={i}
                    style={{
                      marginTop: '5%',
                      flexDirection: 'row',
                      alignItems: 'center',

                      paddingRight: 20,
                    }}
                  >
                    {o.image}
                    <FontText style={{ marginLeft: 5, marginRight: 20 }}>
                      {i18n.t(`reflection.explanation.${o.text}`)}
                    </FontText>
                    <View />
                  </View>
                ))}
              </View>

              <PrimaryButton
                title={i18n.t('reflection.explanation.button')}
                onPress={onClose}
              ></PrimaryButton>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

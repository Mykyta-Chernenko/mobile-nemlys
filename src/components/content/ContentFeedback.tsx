import React, { useContext, useEffect, useState } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@rneui/themed';
import * as StoreReview from 'expo-store-review';
import { supabase } from '@app/api/initSupabase';
import { AuthContext } from '@app/provider/AuthProvider';
import { localAnalytics } from '@app/utils/analytics';
import { logErrorsWithMessage, logSupaErrors } from '@app/utils/errors';
import { FontText } from '@app/components/utils/FontText';
import StarReviewIcon from '@app/icons/star_review';
import { i18n } from '@app/localization/i18n';
import { MEDIUM_BEIGE_COLOR } from '@app/utils/colors';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';

const whiteSource = require('../../../assets/images/close_black.png');
type ContentFeedbackProps = {
  title: string;
  contentType: 'article' | 'question' | 'game' | 'journey' | 'checkup' | 'exercise' | 'test';
  instanceId: number | null;
  marginTop?: number;
};

export function ContentFeedback({
  title,
  contentType,
  instanceId,
  marginTop,
}: ContentFeedbackProps) {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [feedbackExists, setFeedbackExists] = useState<boolean>(true);
  const [visible, setVisible] = useState(true);
  const [stars, setStars] = useState(0);

  const fetchData = async () => {
    if (!instanceId) {
      return;
    }
    try {
      setLoading(true);
      setStars(0);
      void localAnalytics().logEvent('ContentFeedbackDataLoading', {
        screen: 'ContentFeedback',
        action: 'DataLoading',
        userId: authContext.userId,
        contentType,
        instanceId,
      });
      const { data, error } = await supabase.rpc('instance_feedback_exists', {
        content_type: contentType,
        instance_id: instanceId,
      });
      if (error) {
        logSupaErrors(error);
        setFeedbackExists(true);
      } else {
        setFeedbackExists(!!data);
      }
    } catch (e) {
      logErrorsWithMessage(e, (e?.message as string) || '');
      setFeedbackExists(true);
    } finally {
      void localAnalytics().logEvent('ContentFeedbackDataLoaded', {
        screen: 'ContentFeedback',
        action: 'DataLoaded',
        userId: authContext.userId,
        contentType,
        instanceId,
        feedbackExists,
      });
      setLoading(false);
    }
  };

  const handleClose = async () => {
    if (instanceId && !loading) {
      try {
        setLoading(true);
        void localAnalytics().logEvent('ContentFeedbackDiscarded', {
          screen: 'ContentFeedback',
          action: 'Discarded',
          userId: authContext.userId,
          contentType,
          instanceId,
        });
        const { error } = await supabase.rpc('discard_instance_feedback', {
          content_type: contentType,
          instance_id: instanceId,
        });
        if (error) {
          logSupaErrors(error);
        }
      } catch (e) {
        logErrorsWithMessage(e, (e?.message as string) || '');
      } finally {
        setVisible(false);
        setLoading(false);
      }
    }
  };

  const handleRating = async (rating: number) => {
    if (instanceId && !loading) {
      try {
        setLoading(true);
        void localAnalytics().logEvent('ContentFeedbackRated', {
          screen: 'ContentFeedback',
          action: 'Rated',
          userId: authContext.userId,
          contentType,
          instanceId,
          rating,
        });
        const { error } = await supabase.rpc('create_instance_feedback', {
          content_type: contentType,
          instance_id: instanceId,
          feedback: rating,
        });
        if (error) {
          logSupaErrors(error);
        }
        if (rating >= 4) {
          if (await StoreReview.hasAction()) {
            await StoreReview.requestReview();
          }
        }
      } catch (e) {
        logErrorsWithMessage(e, (e?.message as string) || '');
      } finally {
        setVisible(false);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (instanceId) {
      void fetchData();
    }
  }, [instanceId]);

  if (!instanceId || !visible) {
    return <></>;
  }

  if (feedbackExists) {
    return <></>;
  }

  return (
    <View
      style={{
        marginTop: marginTop ?? 0,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.white,
        gap: 20,
        marginBottom: 20,
      }}
    >
      <TouchableOpacity
        onPress={() => void handleClose()}
        disabled={loading}
        style={{
          position: 'absolute',
          top: 8,
          right: -8,
        }}
      >
        <Image
          style={{
            height: 18,
          }}
          resizeMode="contain"
          source={whiteSource}
        />
      </TouchableOpacity>
      <FontText
        style={{
          textAlign: 'center',
          color: theme.colors.black,
          marginTop: 5,
        }}
      >
        {title}
      </FontText>

      <View
        style={{
          flexDirection: 'row',
        }}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => void setStars(star)}
            disabled={loading}
            style={{ marginHorizontal: 4 }}
          >
            {
              <StarReviewIcon
                fill={stars >= star ? '#FFBA70' : MEDIUM_BEIGE_COLOR}
                width={36}
                height={36}
              />
            }
          </TouchableOpacity>
        ))}
      </View>
      {stars > 0 && (
        <PrimaryButton
          containerStyle={{ width: '100%' }}
          title={i18n.t('submit')}
          onPress={() => void handleRating(stars)}
        ></PrimaryButton>
      )}
      <FontText
        small
        style={{
          textAlign: 'center',
          color: theme.colors.grey3,
        }}
      >
        {i18n.t('content_feedback_help')}
      </FontText>
    </View>
  );
}

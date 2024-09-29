import { useTheme } from '@rneui/themed';
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

type PlanType = 'Annual' | 'Monthly';

interface SubscriptionPlanSelectorProps {
  selectedPlan: PlanType;
  handleToggle: (plan: PlanType) => void;
  monthlyPrice: string;
  yearlyPrice: string;
  yearlyTrialLength: number;
}
import { i18n } from '@app/localization/i18n';
import { FontText, getFontSizeForScreen } from '@app/components/utils/FontText';

const SubscriptionPlanSelector: React.FC<SubscriptionPlanSelectorProps> = ({
  selectedPlan,
  handleToggle,
  monthlyPrice,
  yearlyPrice,
  yearlyTrialLength,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      gap: 10,
    },
    planButton: {
      width: '100%',
      padding: 20,
      borderRadius: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    selectedPlan: {
      backgroundColor: theme.colors.grey1,
    },
    unselectedPlan: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    planText: {},
    selectedPlanText: {},
    unselectedPlanText: {
      color: theme.colors.white,
    },
    discountBadge: {
      backgroundColor: '#FF76C0',
      borderRadius: 12,
      padding: 5,
    },
    discountText: {
      fontSize: getFontSizeForScreen('small'),
    },
  });

  const getTrialText = (days: number) => {
    switch (days) {
      case 3:
        return i18n.t('premium_3_days_trial_desc');
      case 7:
        return i18n.t('premium_7_days_trial_desc');
      case 14:
        return i18n.t('premium_14_days_trial_desc');
      default:
        return i18n.t('premium_7_days_trial_desc');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.planButton,
          selectedPlan === 'Annual' ? styles.selectedPlan : styles.unselectedPlan,
        ]}
        onPress={() => handleToggle('Annual')}
      >
        <View>
          <FontText
            style={[
              styles.planText,
              selectedPlan === 'Annual' ? styles.selectedPlanText : styles.unselectedPlanText,
            ]}
          >
            {i18n.t('premium.offer.plan_yearly_title')}
          </FontText>
          <FontText style={[styles.planText, { color: theme.colors.grey5 }]}>
            {getTrialText(yearlyTrialLength)}
          </FontText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={styles.discountBadge}>
            <FontText style={styles.discountText}>-60%</FontText>
          </View>
          <FontText
            style={[
              styles.planText,
              selectedPlan === 'Annual' ? styles.selectedPlanText : styles.unselectedPlanText,
            ]}
          >
            {yearlyPrice}
          </FontText>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.planButton,
          selectedPlan === 'Monthly' ? styles.selectedPlan : styles.unselectedPlan,
        ]}
        onPress={() => handleToggle('Monthly')}
      >
        <View
          style={{
            minHeight: getFontSizeForScreen('normal') * 2,
            justifyContent: 'center',
          }}
        >
          <FontText
            style={[
              styles.planText,
              selectedPlan === 'Monthly' ? styles.selectedPlanText : styles.unselectedPlanText,
            ]}
          >
            {i18n.t('premium.offer.plan_monthly_title')}
          </FontText>
        </View>
        <FontText
          style={[
            styles.planText,
            selectedPlan === 'Monthly' ? styles.selectedPlanText : { color: theme.colors.grey5 },
          ]}
        >
          {monthlyPrice}
        </FontText>
      </TouchableOpacity>
    </View>
  );
};

export default SubscriptionPlanSelector;

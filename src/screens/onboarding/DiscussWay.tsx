// import React, { useContext, useEffect, useState } from 'react';
// import { ImageBackground, ScrollView, TouchableOpacity, View } from 'react-native';
// import { useTheme, useThemeMode } from '@rneui/themed';
// import { i18n } from '@app/localization/i18n';
// import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
// import { FontText } from '@app/components/utils/FontText';
// import { Progress } from '@app/components/utils/Progress';
// import { GoBackButton } from '@app/components/buttons/GoBackButton';
// import { supabase } from '@app/api/initSupabase';
// import { AuthContext } from '@app/provider/AuthProvider';
// import { logSupaErrors } from '@app/utils/errors';
// import { MainStackParamList } from '@app/types/navigation';
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { localAnalytics } from '@app/utils/analytics';
// import { SafeAreaView } from 'react-native-safe-area-context';
//
// export default function ({
//   route,
//   navigation,
// }: NativeStackScreenProps<MainStackParamList, 'DiscussWay'>) {
//   const { theme } = useTheme();
//   const [chosen, setChosen] = useState<string | undefined>(undefined);
//   const choices = [
//     { slug: 'face-to-face', title: i18n.t('onboarding_discuss_way_choice_1') },
//     { slug: 'online', title: i18n.t('onboarding_discuss_way_choice_2') },
//     { slug: 'discuss-later', title: i18n.t('onboarding_discuss_way_choice_3') },
//     { slug: 'do-not-know', title: i18n.t('onboarding_discuss_way_choice_4') },
//   ];
//   const authContext = useContext(AuthContext);
//
//   const { setMode } = useThemeMode();
//   useEffect(() => {
//     const unsubscribeFocus = navigation.addListener('focus', () => setMode('light'));
//     return unsubscribeFocus;
//   }, [navigation]);
//
//   const handlePress = async () => {
//     if (!chosen) return;
//     await supabase
//       .from('onboarding_poll')
//       .delete()
//       .match({ user_id: authContext.userId, question_slug: 'discuss_way' });
//     const dateReponse = await supabase
//       .from('onboarding_poll')
//       .insert({ user_id: authContext.userId!, question_slug: 'discuss_way', answer_slug: chosen });
//     if (dateReponse.error) {
//       logSupaErrors(dateReponse.error);
//       return;
//     }
//     void localAnalytics().logEvent('DiscussWayContinueClicked', {
//       screen: 'DiscussWay',
//       action: 'ContinueClicked',
//       discuss_way: chosen,
//       userId: authContext.userId,
//     });
//     navigation.navigate('OnDateNotification', { withPartner: true, isOnboarding: true });
//   };
//   return (
//     <ImageBackground
//       style={{
//         flexGrow: 1,
//       }}
//       source={require('../../../assets/images/onboarding_background.png')}
//     >
//       <SafeAreaView style={{ flexGrow: 1 }}>
//         <View style={{ flexGrow: 1, padding: 20 }}>
//           <View
//             style={{
//               flexDirection: 'row',
//               paddingHorizontal: 15,
//               alignItems: 'center',
//               justifyContent: 'center',
//               height: 32,
//             }}
//           >
//             <GoBackButton
//               theme="light"
//               containerStyle={{ position: 'absolute', left: 0 }}
//               onPress={() => {
//                 void localAnalytics().logEvent('DiscussWayBackClicked', {
//                   screen: 'DiscussWay',
//                   action: 'BackClicked',
//                   userId: authContext.userId,
//                 });
//                 navigation.navigate('Language', { fromSettings: false });
//               }}
//             ></GoBackButton>
//             <Progress current={4} all={7}></Progress>
//           </View>
//           <View
//             style={{
//               flexGrow: 1,
//             }}
//           >
//             <FontText
//               style={{
//                 textAlign: 'left',
//               }}
//               h1
//             ></FontText>
//             <FontText
//               style={{
//                 textAlign: 'left',
//               }}
//               h1
//             >
//               {i18n.t('onboarding_discuss_way_title_first')}
//               <FontText style={{ color: theme.colors.primary }} h1>
//                 {i18n.t('onboarding_discuss_way_title_second')}
//               </FontText>
//               {i18n.t('onboarding_discuss_way_title_third')}
//             </FontText>
//             <ScrollView style={{ marginTop: '5%', flex: 1 }}>
//               {choices.map((c, i) => (
//                 <TouchableOpacity
//                   key={i}
//                   style={{
//                     marginTop: 10,
//                     borderRadius: 20,
//                     backgroundColor: theme.colors.white,
//                     borderColor: c.slug === chosen ? theme.colors.black : theme.colors.white,
//                     borderWidth: 1,
//                     padding: 20,
//                     flexDirection: 'row',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                   }}
//                   onPress={() => void setChosen(c.slug)}
//                 >
//                   <FontText style={{ marginLeft: 10 }}>{c.title}</FontText>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//           <View style={{ marginTop: '4%' }}>
//             <PrimaryButton
//               disabled={!chosen}
//               title={i18n.t('continue')}
//               onPress={() => void handlePress()}
//             />
//           </View>
//         </View>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// }

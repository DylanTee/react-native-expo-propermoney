import ContainerLayout from '@components/Layout/ContainerLayout';
import Header from '@components/Shared/Header';
import SizedBox from '@components/Shared/SizedBox';
import {AppNavigationScreen} from '@libs/react.navigation.lib';
import {sw} from '@libs/responsive.lib';
import {Colors} from '@styles/Colors';
import React from 'react';
import {ViewStyle} from 'react-native';
import {TouchableOpacity, View} from 'react-native';
import {useTranslation} from '@libs/i18n/index';
import CustomButton from '@components/Shared/CustomButton';
import CustomText from '@components/Shared/CustomText';
import Avatar from '@components/Shared/Avatar';
import ExpoVectorIcon from '@libs/expo-vector-icons.libs';
import { useGetUserDetailQuery } from '@libs/react-query/hooks/useGetUserDetailQuery';

const TransactionAccountSwitchScreen: AppNavigationScreen<'TransactionAccountSwitchScreen'> = ({navigation, route}) => {
    const {t} = useTranslation();
    const { data: user } = useGetUserDetailQuery();
    const btnSelect = (userId: string | undefined) => {
        route.params.onSelect(userId);
        navigation.goBack();
    };
    const btnShare = () => {
        navigation.navigate('ShareUserScreen');
    };
    return (
        <ContainerLayout>
            <Header onBack={() => navigation.goBack()} />
            {user && (
                <View style={{flex: 1, padding: sw(10)}}>
                    <TouchableOpacity style={$ButtonContainer} onPress={() => btnSelect(user?._id)}>
                        <View style={{flexDirection: 'row', marginRight: 'auto', alignItems: 'center'}}>
                            <Avatar size="big" profileImage={user.profileImage} />
                            <SizedBox width={sw(10)} />
                            <CustomText label={user.displayName + ' (you)'} size={'medium'} />
                        </View>
                        {route.params.userId == user._id && (
                            <ExpoVectorIcon name="check" size={sw(20)} color={Colors.black} />
                        )}
                    </TouchableOpacity>
                    {user.sharedUserInfo && (
                        <>
                            <TouchableOpacity
                                style={$ButtonContainer}
                                onPress={() => btnSelect(user?.sharedUserInfo?._id)}
                            >
                                <View style={{flexDirection: 'row', marginRight: 'auto', alignItems: 'center'}}>
                                    <Avatar
                                        size="big"
                                        profileImage={user.sharedUserInfo.profileImage}
                                    />
                                    <SizedBox width={sw(10)} />
                                    <CustomText label={user.sharedUserInfo.displayName} size={'medium'} />
                                </View>
                                {route.params.userId == user.sharedUserInfo._id && (
                                    <ExpoVectorIcon name="check" size={sw(20)} color={Colors.black} />
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity style={$ButtonContainer} onPress={() => btnSelect(undefined)}>
                                <View style={{flexDirection: 'row', marginRight: 'auto', alignItems: 'center'}}>
                                    <Avatar size="big" profileImage={user.profileImage} />
                                    <SizedBox width={sw(10)} />
                                    <Avatar
                                        size="big"
                                        profileImage={user.sharedUserInfo.profileImage}
                                    />
                                    <SizedBox width={sw(10)} />
                                    <CustomText
                                        label={`${user.displayName} & ${user.sharedUserInfo.displayName}`}
                                        size={'medium'}
                                    />
                                </View>
                                {route.params.userId == undefined && (
                                    <ExpoVectorIcon name="check" size={sw(20)} color={Colors.black} />
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                    <SizedBox height={sw(40)} />
                    <CustomButton type={'primary'} size={'big'} title={t('share')} onPress={btnShare} />
                </View>
            )}
        </ContainerLayout>
    );
};

const $ButtonContainer: ViewStyle = {
    flexDirection: 'row',
    padding: sw(10),
    alignItems: 'center',
};
export default TransactionAccountSwitchScreen;

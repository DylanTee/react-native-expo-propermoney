import {sh, sw} from '@libs/responsive.lib';
import {Colors} from '@styles/Colors';
import React from 'react';
import {TouchableOpacity} from 'react-native';
import CustomText from './CustomText';
import {View} from 'react-native';
import ExpoVectorIcon from '@libs/expo-vector-icons.libs';

interface OptionButtonProps {
    text: string;
    isSelect: boolean;
    onPress(): void;
}

export default function CustomButtonItemPicker({text, isSelect, onPress}: OptionButtonProps) {
    return (
        <TouchableOpacity
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                height: sh(35),
                paddingHorizontal: sw(10),
            }}
            onPress={() => onPress()}
        >
            <CustomText size={'medium'} label={text} textStyle={{color: Colors.black}} />
            {isSelect && (
                <View style={{marginLeft: 'auto'}}>
                    <ExpoVectorIcon name="check" size={sw(20)} color={Colors.black} />
                </View>
            )}
        </TouchableOpacity>
    );
}

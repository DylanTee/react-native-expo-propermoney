import {sh, sw} from '@libs/responsive.lib';
import {Colors} from '@styles/Colors';
import React, {ReactNode} from 'react';
import {TouchableOpacity, ViewStyle} from 'react-native';

interface CustomButtonIconProps {
    size: 'medium' | 'small';
    icon: ReactNode;
    disabled?: boolean;
    onPress?(): void;
}

const CustomButtonIcon = ({size, icon, disabled = false, onPress}: CustomButtonIconProps) => {
    let buttonStyle: ViewStyle = {
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    };
    if (size == 'medium') {
        buttonStyle = {
            width: sw(40),
            height: sw(40),
            borderRadius: sw(40) / 2,
            ...buttonStyle,
        };
    }
    if (size == 'small') {
        buttonStyle = {
            ...buttonStyle,
            width: sw(20),
            height: sw(20),
            borderRadius: sw(100) / 2,
        };
    }

    return (
        <TouchableOpacity disabled={disabled} style={buttonStyle} onPress={onPress}>
            {icon}
        </TouchableOpacity>
    );
};
export default CustomButtonIcon;

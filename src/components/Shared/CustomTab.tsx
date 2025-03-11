import React from 'react';
import {sh, sw} from '@libs/responsive.lib';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Colors} from '@styles/Colors';
import CustomText from './CustomText';

interface CustomTabProps {
    value: string | number;
    data: {label: string; value: string | number}[];
    onChange(value: string | number): void;
}

const CustomTab = ({data, value, onChange}: CustomTabProps) => {
    return (
        <View style={styles.container}>
            {data.map((item) => (
                <TouchableOpacity
                    key={item.value}
                    style={[
                        styles.button,
                        {
                            backgroundColor: value == item.value ? Colors.primary : Colors.white,
                        },
                    ]}
                    onPress={() => onChange(item.value)}
                >
                    <CustomText
                        size={'medium'}
                        label={item.label}
                        textStyle={{color: value == item.value ? Colors.white : Colors.primary}}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: sw(2),
        borderWidth:1,
        borderRadius:sw(5),
        borderColor:Colors.gainsboro
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: sw(10),
        padding: sh(5),
        borderRadius:sw(5)
    },
});

export default CustomTab;

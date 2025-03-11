import React from 'react';
import {View} from 'react-native';

const SizedBox = ({height, width}: {height?: number; width?: number}) => {
    return <View style={{height: height, width: width}} />;
};

export default SizedBox;

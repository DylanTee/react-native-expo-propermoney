import {ViewStyle} from 'react-native';
import {Colors} from './Colors';

const shadowLine: ViewStyle = {
    // For Android
    elevation: 4,
    // For iOS
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
};

export const Global = {
    shadowLine,
};

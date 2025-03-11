import {sw} from '@libs/responsive.lib';
import React, {ReactNode} from 'react';
import {View} from 'react-native';

export default function ContainerStack({children}: {children: ReactNode}) {
    return <View style={{paddingHorizontal: sw(15)}}>{children}</View>;
}

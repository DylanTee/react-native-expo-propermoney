import React, {ReactNode} from 'react';
import {Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableWithoutFeedback} from 'react-native';

interface KeyboardLayoutProps {
    children: ReactNode;
}

export default function KeyboardLayout({children}: KeyboardLayoutProps) {
    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'android' ? undefined : 'padding'} style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView style={styles.scrollViewContainer} showsVerticalScrollIndicator={false}>
                    {children}
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollViewContainer: {
        flex: 1,
    },
});

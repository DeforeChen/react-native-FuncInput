/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Dimensions} from 'react-native';
import {FunctionalInput} from './FunctionalInput';

const instructions = Platform.select({
    ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
    android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu'
});
const {width, height} = Dimensions.get('window');

export default class App extends Component<{}> {
    _contentComponent = () => {
        return (
            <View style={{width: width, height: 600}}>
                <Text>
                    Test view for Content area
                </Text>
            </View>
        )
    };

    _functionArea = () => {
        return (
            <View style={{width: width, height: 240}}>
                <Text>
                    Test view for Functional Area
                </Text>
            </View>
        )
    };

    render() {
        return (
            <FunctionalInput wrappedContentCmp={this._contentComponent()}
                             wrappedFunctionCmp={this._functionArea()}
                             sendReplyCallback={() => {
                                 console.warn('send button pressed');
                             }}
            />
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});

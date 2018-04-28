/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Dimensions} from 'react-native';
import {FunctionalInput} from './lib/FunctionalInput';
import testFunc from './lib/testFunc';
import {NewFunc} from './lib/NewFunc';


const {width, height} = Dimensions.get('window');

export default class App extends Component<{}> {
    _contentComponent = () => {
        return (
            <View style={styles.ContentArea}>
                <Text>
                    Test view for Content area
                </Text>
            </View>
        )
    };

    _functionArea = () => {
        return (
            <View style={styles.FunctionalArea}>
                <Text>
                    Test view for Functional Area
                </Text>
            </View>
        )
    };

    _cmp = () => {
        return (
            <FunctionalInput wrappedContentCmp={this._contentComponent()} funcAreaHeight={240}
                             wrappedFunctionCmp={this._functionArea()} navBarHidden={true}
                             contentCmpContainsScrollView={false}
                             sendReplyCallback={() => {
                                 console.warn('send button pressed');
                             }}
            />
        )
    };

    _newCmp = () => {
        return (
            <NewFunc wrappedContentCmp={this._contentComponent()} funcAreaHeight={240}
                     contentCmpContainsScrollView={false} navBarHidden={true}
                     wrappedFunctionCmp={this._functionArea()}
                     sendReplyCallback={() => {
                         console.warn('new pressed');
                     }}/>
        );
    };

    _testCmp = () => {
        return (
            <testFunc/>
        )
    };


    render() {
        let testCmp = this._testCmp();
        let cmp = this._cmp();
        let newCmp = this._newCmp();
        return (
            // // newCmp
            cmp
            // // testCmp
            //{/*<View style={{flex:1,backgroundColor:'red'}}/>*/}
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    ContentArea: {
        width: width, height: 400, backgroundColor: 'yellow',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center'
    },
    FunctionalArea: {
        width: width, height: 240,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center'
    },
});

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Dimensions} from 'react-native';
import {FunctionalInput} from './lib/FunctionalInput';
import FunctionArea from './funcArea';


const {width, height} = Dimensions.get('window');

export default class App extends Component<{}> {
    constructor(props) {
        super(props);
        this.state = {
            messages: ['——— Please input ——']
        };
    }

    _contentComponent = () => {
        let msgCmps = [];
        let index = 0;
        for (let msg of this.state.messages) {
            let msgCmp =
                <View key={index} style={styles.messageCell}>
                    <Text style={{margin: 5, lineHeight: 18}}>{msg}</Text>
                </View>;
            msgCmps.push(msgCmp);
            index++;
        }

        return (
            <View style={styles.messageCellContainer}>
                {msgCmps}
            </View>
        )
    };

    _functionArea = () => {
        return (
            <FunctionArea/>
        )
    };

    _cmp = () => {
        return (
            <FunctionalInput wrappedContentCmp={this._contentComponent()} contentChatMode={true} funcAreaHeight={240}
                             wrappedFunctionCmp={this._functionArea()} navBarHidden={true}
                             contentCmpContainsScrollView={false}
                             sendReplyCallback={(msg) => {
                                 if (msg) {
                                     let tempArray = [...this.state.messages];
                                     tempArray.push(msg);
                                     this.setState({messages: tempArray});
                                 } else {
                                     alert('Content could not be empty!');
                                 }
                             }}
            />
        )
    };

    render() {
        let cmp = this._cmp();
        return (
            cmp
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
    messageCell: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'lightblue',
        margin: 5
    },
    messageCellContainer: {
        alignItems: 'flex-end', justifyContent: 'flex-end',
    },
    FunctionalArea: {
        width: width, height: 240,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center'
    },
});

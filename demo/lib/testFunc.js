/**
 * Created by defore on 2018/4/19.
 * @flow
 */

import React, {PureComponent} from 'react';
import {
    StyleSheet, Text, View, Image, Dimensions, ScrollView, TextInput, Platform, Keyboard, LayoutAnimation
} from 'react-native';

import PropTypes from 'prop-types';
import SafeAreaForIphoneX from "../util/SafeAreaForIphoneX";

const {width, height} = Dimensions.get('window');

export default class testFunc extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            inputBlankHeight: sendBtnHeight,
            kbHeight: 0
        };
    }

    /*Keyboard listener, only didhid & didshow available on Android*/
    componentWillMount() {
        //android 监听事件
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide',
            this._keyboardDidHide.bind(this));
        //监听键盘隐藏事件
        this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide',
            this._keyboardWillHide.bind(this));
        this.keyboardWillChangeFrameListener = Keyboard.addListener('keyboardWillChangeFrame',
            this._keyboardWillChangeFrame.bind(this));
    }

    componentWillUnmount() {
        //针对 android 的监听
        if (this.keyboardDidHideListener != null) {
            this.keyboardDidHideListener.remove();
        }
        //针对 ios 的监听
        if (this.keyboardWillHideListener != null) {
            this.keyboardWillHideListener.remove();
        }

        if (this.keyboardWillChangeFrameListener != null) {
            this.keyboardWillChangeFrameListener.remove();
        }
    }

    _keyboardDidHide = () => {
        console.log('keyboard hide');
        if (Platform.OS === 'ios') {
            return;
        }

        if (this.needToFoldAll) {
            this.props.resetWholePage();
        }
    };

    _keyboardWillHide = () => {
        console.log('keyboard hide');
        // 专门针对 ios 下第三方键盘，带有隐藏键盘按钮 ⏬作的处理
        if (this.needToFoldAllForIOS) {
            this.needToFoldAllForIOS = false;
            this.props.resetWholePage();
            return;
        }

        if (this.needToFoldAll) {
            this.props.resetWholePage();
        }
    };

    _keyboardWillChangeFrame = (event) => {
        if (event.endCoordinates.height !== this.keyboardhHeight) {
            this.keyboardhHeight = event.endCoordinates.height - SafeAreaForIphoneX.fetchSaveAreaHeight();
            let CustomLayoutAnimation = {
                duration: 800,
                create: {
                    type: LayoutAnimation.Types.spring,
                    property: LayoutAnimation.Properties.scaleXY,
                },
                update: {
                    type: LayoutAnimation.Types.spring,
                    property: LayoutAnimation.Properties.scaleXY,
                },
            };
            // LayoutAnimation.configureNext(CustomLayoutAnimation);
            this.setState({kbHeight: this.keyboardhHeight})
        }
    };


    _inputChangeSize = (e) => {
        const height = e.nativeEvent.contentSize.height;
        if (height < 5 * sendBtnHeight) {
            this.setState({inputBlankHeight: height});
        }
    };


    render() {
        return (
            <View style={styles.container}>
                <ScrollView style={styles.scrollView}/>
                <TextInput style={[styles.inputArea, {height: this.state.inputBlankHeight}]}
                           multiline={true} onContentSizeChange={this._inputChangeSize}/>
                <View style={[styles.keyboardOccupyArea, {height: this.state.kbHeight}]}/>
            </View>
        );
    }
}

// -------------------- 样式 -----------------------------
const sendBtnHeight = 32;
const styles = StyleSheet.create({
    container: {flex: 1, justifyContent: 'flex-end', alignItems: 'center'},
    scrollView: {
        flex: 1, backgroundColor: 'lightgreen',
    },
    inputArea: {
        width: width / 2, maxHeight: 5 * sendBtnHeight, minHeight: sendBtnHeight, backgroundColor: 'gray'
    },
    keyboardOccupyArea: {
        width, backgroundColor: 'yellow',
    }
});
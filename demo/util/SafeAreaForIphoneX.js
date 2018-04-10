/**
 * Created by defore on 2018/2/11.
 * @flow
 */

import React, {PureComponent} from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    NativeModules,
    Platform
} from 'react-native';

import PropTypes from 'prop-types';

const {width, height} = Dimensions.get('window');
const X_WIDTH = 375;
const X_HEIGHT = 812;

export function isIphoneX() {
    return (
        Platform.OS === 'ios' &&
        ((height === X_HEIGHT && width === X_WIDTH) ||
            (height === X_WIDTH && width === X_HEIGHT))
    )
}

/*
    增加 iPhone X 适配高度
*/

export default class SafeAreaForIphoneX extends PureComponent {
    static propTypes = {
        bgColor: PropTypes.string.isRequired,
    };

    static fetchNavBarHeight = () => {
        if (Platform.OS !== 'ios' || isIphoneX() === false) {
            return Platform.select({ios: 64, android: 74});
        }

        return 88;
    };

    static fetchSaveAreaHeight = () => {
        if (Platform.OS !== 'ios' || isIphoneX() === false) {
            return 0;
        }

        return 34;
    };

    _safeArea = () => {
        if (Platform.OS !== 'ios') {
            return null;
        }

        if (isIphoneX() === false) {
            return null;
        }

        return (<View style={[styles.container, {backgroundColor: this.props.bgColor}]}/>);
    };

    render() {
        return (this._safeArea());
    }
}

// -------------------- 样式 -----------------------------
const styles = StyleSheet.create({
    container: {
        width: width, height: 34,
    },
});

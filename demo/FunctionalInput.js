/**
 * Created by defore on 2018/2/27.
 * @flow
 */

import React, {PureComponent} from 'react';
import {
    StyleSheet, Text, View, Image, Dimensions, TextInput, Keyboard, ScrollView, Platform
} from 'react-native';

import PropTypes from 'prop-types';
// 自定义
// import SafeAreaForIphoneX from "../../utils/SafeAreaForIphoneX";

export const functionalInputAreaFoldHeight = 44;
const {width, height} = Dimensions.get('window');
const addAttachBtnSize = 25;
// 折叠状态
const foldStatus = {
    fold: 0,
    unfoldWithKeyboard: 1,
    unfoldWithAttachment: 2
};

class InnerFunctionalInput extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            foldStatus: foldStatus.fold,
        };
        /*autobind*/

        // keyboard related
        this.keyboardDidHideListener = null;
        this.keyboardWillHideListener = null;
        this.keyboardWillChangeFrameListener = null;
        this.keyboardhHeight = 0;

        this.needToListenKBFrameChange = true; //是否需要监听键盘宽高变化 —— 键盘消失时常常也会调用 frame 变化的回调
        this.needToFoldAll = Platform.select({ios: false, android: true}); // 是否需要折叠底部所有的区域，包括键盘占用区和功能区
        this.needToFoldAllForIOS = false; // ios 下，当 focus 输入框，第三方输入法含有"🔽按钮隐藏keyboard 时使用"
        this.functionAreaHeight = this.props.wrappedFunctionCmp.props.style.height;
    }

    static propTypes = {
        outsideScrollCallBack: PropTypes.func.isRequired,
        resetWholePage: PropTypes.func.isRequired,
        wrappedFunctionCmp: PropTypes.object.isRequired, // 用于包裹的功能区域的内容
        sendReplyCallback: PropTypes.func.isRequired, // 用于发送按钮按下
    };

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
        if (this.needToFoldAll === true || this.needToListenKBFrameChange === false) {
            return;
        }

        let needRenderKeyboardArea = false;//true;
        if (event.endCoordinates.height !== this.keyboardhHeight) {
            this.keyboardhHeight = event.endCoordinates.height;
            needRenderKeyboardArea = true;
        }

        this._onFocusInputFrame(needRenderKeyboardArea);
        console.log('change keyboard, height = ' + event.endCoordinates.height);
    };

    // 功能区域 layout 的回调，仅针对安卓作处理
    _functionAreaOnLayout = (e) => {
        let funcAreaHeight = e.nativeEvent.layout.height;
        let offsetY = this.functionAreaHeight;

        if (funcAreaHeight === offsetY) {
            this.props.outsideScrollCallBack(offsetY);
        }

    };

    /*fold event*/
    _onAddAttachment = () => {
        // layout 完成之后去执行，安卓的 scrollTo 无法越过他的最大 contentSize，
        // 处理见_functionAreaOnLayout
        this.needToListenKBFrameChange = false; // 点击 ➕时，不要去监听 frame 变化
        this.needToFoldAll = false;
        this.needToFoldAllForIOS = false;

        if (this.state.foldStatus === foldStatus.unfoldWithAttachment) {
            return;
        }

        if (Platform.OS === 'ios') {
            Keyboard.dismiss();
        }
        this.setState({foldStatus: foldStatus.unfoldWithAttachment});
    };

    _onFocusInputFrame = (needRenderKeyboardArea: boolean) => {
        this.needToListenKBFrameChange = true;
        this.needToFoldAll = Platform.select({ios: false, android: true});//安卓下，标志位设置成 true，因为没有键盘占位区域
        if (Platform.OS !== 'ios') {
            // this.setState({foldStatus: foldStatus.unfoldWithKeyboard});
            return;
        }

        if (needRenderKeyboardArea || this.state.foldStatus !== foldStatus.unfoldWithKeyboard) {
            this.setState({foldStatus: foldStatus.unfoldWithKeyboard});
            this.props.outsideScrollCallBack(this.keyboardhHeight);
        }
    };

    fold = () => {
        if (this.state.foldStatus === foldStatus.fold) {
            return;
        }

        this.needToListenKBFrameChange = true;
        this.needToFoldAll = true;
        this.keyboardhHeight = 0;
        // 控制外部的滚动到0不能与刷新局部的 state 一起做. 会造成有额外偏移.
        this.setState({foldStatus: foldStatus.fold});
    };

    /*FunctionalInput Inner Components*/
    _functionalInput_divideLine = () => {
        return (<View style={styles.divideLine}/>);
    };

    _functionalInput_inputArea = () => {
        /* 左边的➕按键不能用 touchOpacity 包裹，
        * 而采用 view + onTouchStart的形式来做。否则第一次点击时，产生的是 textinput 的unFocus 事件，变成要点击两次才有效
        * */
        let InputOutlineForAndroid = Platform.select({
            ios: null,
            android: <View style={styles.inputFrameOutlineForAndroid}/>
        });
        let textInputStyle = Platform.select({
            ios: [styles.inputFrameForIOS, {paddingLeft: 10, paddingRight: 5, fontSize: 20}],
            android: styles.inputFrameForAndroid
        });

        return (
            <View style={styles.inputArea}>
                <View style={styles.addAttachment}
                      onTouchStart={() => {
                          this._onAddAttachment();
                      }}
                >
                    <Image style={{width: addAttachBtnSize, height: addAttachBtnSize, backgroundColor: 'red'}}/>
                </View>
                {InputOutlineForAndroid}
                <TextInput style={textInputStyle} underlineColorAndroid={'transparent'} multiline={false}
                           onFocus={() => {
                               this.needToFoldAllForIOS = true;
                               this.needToListenKBFrameChange = true;
                               this.needToFoldAll = Platform.select({ios: false, android: true});
                               if (Platform.OS === 'android') {
                                   // 安卓中，当 focus 输入框的时候，不会进入到 keyboardChangeFrame,所以这里要手动做一下
                                   this.setState({foldStatus: foldStatus.fold});
                               }
                           }}/>
                <View style={styles.sendBtn}
                      onTouchStart={() => {
                          this.props.resetWholePage();
                          this.props.sendReplyCallback();
                      }}>
                    <Text style={styles.sendBtnText}>
                        Send
                    </Text>
                </View>
            </View>
        );
    };

    _functionalInput_functionArea = () => {
        let height = this.state.foldStatus !== foldStatus.unfoldWithAttachment ? 0 : this.functionAreaHeight;
        return (
            <View style={{width: width, height: height}}
                  onLayout={this._functionAreaOnLayout}>
                {this.props.wrappedFunctionCmp}
            </View>
        );
    };

    // 安卓不需要占位区域
    _functionalInput_keyboardOccupyArea = () => {
        if (Platform.OS === 'ios') {
            let height = this.state.foldStatus !== foldStatus.unfoldWithKeyboard ? 0 : this.keyboardhHeight;
            return (<View style={{width: width, height: height, backgroundColor: 'gray',}}/>)
        } else {
            return null;
        }
    };

    render() {
        // <SafeAreaForIphoneX bgColor={NdColor.color23}/>
        return (
            <View style={styles.container}>
                {this._functionalInput_divideLine()}
                {this._functionalInput_inputArea()}
                {this._functionalInput_keyboardOccupyArea()}
                {this._functionalInput_functionArea()}
                {/*<SafeAreaForIphoneX bgColor={NdColor.color23}/>*/}
            </View>
        );
    }
}

export class FunctionalInput extends PureComponent {
    constructor(props) {
        super(props);
        this.scrollHasRestToZero = false;
    }

    static propTypes = {
        wrappedContentCmp: PropTypes.object.isRequired, // 用于包裹的显示区域的组件内容
        wrappedFunctionCmp: PropTypes.object.isRequired, // 用于包裹的功能区域的内容
        sendReplyCallback: PropTypes.func.isRequired, // 用于发送按钮按下
    };

    resetPage = () => {
        //在这里执行之后，其实 keyboardwillhide 会产生监听，会再进入一次这里.为了避免循环，加一个判断
        if (this.scrollHasRestToZero && this._input.keyboardhHeight === 0) {
            return;
        }

        this._input.needToListenKBFrameChange = true;
        this._input.needToFoldAll = true;
        this._scrollView.scrollTo({y: 0, animated: true});
        Keyboard.dismiss();
    };

    // 详情的显示区域： 内容 + 客服回复
    _displayComponent = () => {
        // let detailHeight = height - functionalInputAreaFoldHeight - SafeAreaForIphoneX.fetchNavBarHeight() - SafeAreaForIphoneX.fetchSaveAreaHeight();
        let detailHeight = height - functionalInputAreaFoldHeight;
        return (
            <ScrollView style={{width: width, height: detailHeight, backgroundColor: 'gray'}} bounces={true}
                        onTouchStart={() => {
                            this.resetPage();
                        }}
            >
                {this.props.wrappedContentCmp}
            </ScrollView>
        );
    };

    render() {
        return (
            <ScrollView style={styles.container} scrollEnabled={false}
                        ref={(scrollView => this._scrollView = scrollView)}
                        onScroll={(e) => {
                            // console.log('offset_Y = ' + e.nativeEvent.contentOffset.y);
                            if (e.nativeEvent.contentOffset.y === 0) {
                                this.scrollHasRestToZero = true;
                                this._input.fold();
                            } else {
                                if (this.scrollHasRestToZero === true) {
                                    this.scrollHasRestToZero = false;
                                }
                            }
                        }}
            >
                {this._displayComponent()}
                <InnerFunctionalInput ref={(input => this._input = input)} resetWholePage={this.resetPage}
                                      wrappedFunctionCmp={this.props.wrappedFunctionCmp}
                                      sendReplyCallback={this.props.sendReplyCallback}
                                      outsideScrollCallBack={(offsetY) => {
                                          this._scrollView.scrollTo({y: offsetY, animated: true});
                                      }}/>
            </ScrollView>
        );
    }
}


// -------------------- 样式 -----------------------------
const divideLineHeight = 1;
const addAttachmentMargin = 6, addAttachOccupyWidth = addAttachBtnSize + 2 * addAttachmentMargin;
const sendBtnWidth = 58, sendBtnHeight = 32, sendBtnMarginLeft = 8, sendBtnMarginRight = 7;
const sendBtnOccupyWidth = sendBtnWidth + sendBtnMarginLeft + sendBtnMarginRight;
const cornerRadius = 4;
const inputFrameForIOS = {
    borderWidth: 1, borderColor: 'gray', borderRadius: cornerRadius, backgroundColor: 'white',
    marginRight: sendBtnOccupyWidth,
    height: sendBtnHeight, width: width - sendBtnOccupyWidth - addAttachOccupyWidth,
};
const styles = StyleSheet.create({
    container: {},
    // FunctionalInput
    divideLine: {
        width: width, height: divideLineHeight, backgroundColor: '#777777'
    },
    inputArea: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#777777',
        width: width, height: functionalInputAreaFoldHeight - divideLineHeight,
    },
    inputFrameForIOS: inputFrameForIOS,
    inputFrameForAndroid: {
        position: 'absolute', left: addAttachOccupyWidth + 5, right: sendBtnOccupyWidth,
        backgroundColor: 'rgba(0,0,0,0)',
        height: functionalInputAreaFoldHeight - divideLineHeight,
    },
    inputFrameOutlineForAndroid: inputFrameForIOS,
    addAttachment: {width: addAttachBtnSize, height: addAttachBtnSize, margin: addAttachmentMargin},
    sendBtn: {
        position: 'absolute',
        width: sendBtnWidth, height: sendBtnHeight, right: sendBtnMarginRight,
        borderWidth: 1, borderColor: '#888888', borderRadius: cornerRadius,
        backgroundColor: 'lightblue', justifyContent: 'center', alignItems: 'center'
    },
    sendBtnText: {
        color: '#777777', fontSize: 18,
    },
});
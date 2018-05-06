/**
 * Created by defore on 2018/2/27.
 * @flow
 */

import React, {PureComponent} from 'react';
import {
    StyleSheet, Text, View, Image, Dimensions, TextInput, Keyboard, ScrollView, Platform, TouchableOpacity, Button
} from 'react-native';

import PropTypes from 'prop-types';
import {imageUri} from './imageManager';
import {cmpColor} from './colorManager';
// 自定义
import SafeAreaForIphoneX from "../util/SafeAreaForIphoneX";

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
            inputBlankHeight: sendBtnHeight
        };
        /*autobind*/

        // keyboard related
        this.keyboardDidHideListener = null;
        this.keyboardWillHideListener = null;
        this.keyboardWillChangeFrameListener = null;
        // console.log('键盘高度复位');
        this.keyboardhHeight = 0;
        this.shiftLineOffset = 0;//换行带来的高度变化默认为0

        // this.needRstInputContentAndHeight = false;//该标志位是为了在输入框自动补全情况下做的
        this.needToListenKBFrameChange = true; //是否需要监听键盘宽高变化 —— 键盘消失时常常也会调用 frame 变化的回调
        this.needToFoldAll = Platform.select({ios: false, android: true}); // 是否需要折叠底部所有的区域，包括键盘占用区和功能区
        this.needToFoldAllForIOS = false; // ios 下，当 focus 输入框，第三方输入法含有"🔽按钮隐藏keyboard 时使用"
        this.functionAreaHeight = this.props.funcAreaHeight;

        this.replyTextContent = '';
    }

    static propTypes = {
        outsideScrollCallBack: PropTypes.func.isRequired,
        resetWholePage: PropTypes.func.isRequired,
        wrappedFunctionCmp: PropTypes.object.isRequired, // 用于包裹的功能区域的内容
        funcAreaHeight: PropTypes.number.isRequired, //必须告知功能区域的高度
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

    componentDidUpdate(prevProps, prevState) {
        console.log('========== 1.4 cmpDidUpdate 先前的BlankHeight ' + prevState.inputBlankHeight + '之后的 height ' + this.state.inputBlankHeight);

        if (this.state.inputBlankHeight !== prevState.inputBlankHeight) { //等待输入框高度渲染完毕
            console.log('换行  ' + this.keyboardhHeight + '  ' + this.shiftLineOffset);
            let outsideScrollToEnd = Platform.select({ios: false, android: true});

            //如果先调用下面这句去执行滚动，这时候 scroll 的 contentsize 似乎还未更新，因此要加一个短暂的延时
            setTimeout(() => {
                this.props.outsideScrollCallBack(this.keyboardhHeight, this.shiftLineOffset, outsideScrollToEnd);
            }, 50);
        }
    }

    _keyboardDidHide = () => {
        console.log('⬇⬇⬇⬇⬇⬇⬇⬇ keyboard didhide');
        if (Platform.OS === 'ios') {
            return;
        }

        if (this.needToFoldAll) {
            this.props.resetWholePage();
        }
    };

    _keyboardWillHide = () => {
        //当按下 scrollview 的 content 部分，意味着要这点所有，这时候不能再去调用一次resetWholePage，否则会造成循环
        if (this.needToFoldAll) {
            console.log('⬇⬇⬇⬇⬇⬇⬇⬇ must fold all');
            return;
        }

        // 专门针对 ios 下第三方键盘，带有隐藏键盘按钮 ⏬作的处理
        if (this.needToFoldAllForIOS) {
            this.needToFoldAllForIOS = false;
            console.log('⬇⬇⬇⬇⬇⬇⬇⬇ ios 第三方键盘⏬引起的 keyboard will hide');
            this.props.resetWholePage();
        }
    };

    _keyboardWillChangeFrame = (event) => {
        if (Platform.OS === 'ios') {
            // ios 下，生命周期有时候会紊乱，Onfocus 比这个键盘 change frame 的回调要先走，
            // 为了保证正确的生命周期，这里加一个短延时
            setTimeout(() => this.keyboardWillChangeCallback(event), 50);
        } else {
            this.keyboardWillChangeCallback(event);
        }
    };

    keyboardWillChangeCallback = (event) => {
        console.log('========== 1.3 KB_WillChangeFrame ' + this.needToFoldAll + ' ' + this.needToListenKBFrameChange);

        let kbHeight = event.endCoordinates.height - SafeAreaForIphoneX.fetchSaveAreaHeight();

        if (this.needToFoldAll === true || this.needToListenKBFrameChange === false) {
            return;
        }

        console.log('回调告知的键盘高度 = ' + kbHeight + ' -- 当前保存的键盘高度' + this.keyboardhHeight);
        this.keyboardhHeight = kbHeight;

        this._onFocusInputFrame();
    };

    // 功能区域 layout 的回调
    _functionAreaOnLayout = (e) => {
        if (this.needToListenKBFrameChange) { //没有点击 + 时，不去处理下面的事
            return;
        }

        console.log('功能区域 Onlayout 回调');
        let funcAreaHeight = e.nativeEvent.layout.height;
        let offsetY = this.functionAreaHeight;

        if (funcAreaHeight === offsetY) {
            this.props.outsideScrollCallBack(offsetY, this.shiftLineOffset);
        }
    };

    /*fold event*/
    _onAddAttachment = () => {
        console.log('on 功能输入区 ' + this.state.foldStatus);
        // layout 完成之后去执行，安卓的 scrollTo 无法越过他的最大 contentSize，
        // 处理见_functionAreaOnLayout
        this.needToListenKBFrameChange = false; // 点击 ➕时，不要去监听 frame 变化
        this.needToFoldAll = false;
        this.needToFoldAllForIOS = false;

        if (this.state.foldStatus === foldStatus.unfoldWithAttachment) {
            return;
        }


        // if (Platform.OS === 'ios') {
        keyboardDismissEnsure();
        // }
        this.setState({foldStatus: foldStatus.unfoldWithAttachment});
    };

    _onFocusInputFrame = () => {
        this.needToListenKBFrameChange = true;
        this.needToFoldAll = Platform.select({ios: false, android: true});//安卓下，标志位设置成 true，因为没有键盘占位区域
        if (Platform.OS !== 'ios') {
            // this.setState({foldStatus: foldStatus.unfoldWithKeyboard});
            return;
        }

        this.setState({foldStatus: foldStatus.unfoldWithKeyboard});
        this.props.outsideScrollCallBack(this.keyboardhHeight, this.shiftLineOffset);
    };

    fold = () => {
        keyboardDismissEnsure();
        console.log('⬇⬇⬇⬇⬇⬇⬇⬇ 折叠函数');
        // 避免折叠状态和需要变化时引起的误操作
        if (this.state.foldStatus === foldStatus.fold) {// || this.needToListenKBFrameChange === true) {
            return;
        }

        console.log('折叠 -- 键盘高度复位');
        this.needToListenKBFrameChange = true;
        this.needToFoldAll = true;
        this.keyboardhHeight = 0;
        // 控制外部的滚动到0不能与刷新局部的 state 一起做. 会造成有额外偏移.
        this.setState({foldStatus: foldStatus.fold});
        // if (this.needRstInputContentAndHeight) { //如果同时需要折叠后将高度也重置，就去重置
        //     this.setState({inputBlankHeight: sendBtnHeight});
        // }
    };

    // textInput 换行时候的监听事件
    _inputChangeSize = (e) => {
        console.log('========== 1.1 onContentSizeChange 输入框回调高度' + e.nativeEvent.contentSize.height);

        const height = e.nativeEvent.contentSize.height < sendBtnHeight ? sendBtnHeight : e.nativeEvent.contentSize.height;
        if (height < 5 * sendBtnHeight) {
            console.log('coning');
            let patchOffset = Platform.select({ios: 5, android: 0});
            this.shiftLineOffset = height - sendBtnHeight < 0 ? patchOffset : height - sendBtnHeight + patchOffset;//换行带来的偏移
            this.setState({inputBlankHeight: height + patchOffset});
        }
    };

    _onPressSendButton = () => {
        console.log('发送按钮按下_________');
        this.props.sendReplyCallback(this.replyTextContent);
        this._textInput.clear();
        this.replyTextContent = '';

        this.shiftLineOffset = Platform.select({ios: 5, android: 0});// 复位偏移补偿
        // this.props.resetWholePage();
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
            android: <View style={[styles.inputFrameOutlineForAndroid, {height: this.state.inputBlankHeight}]}/>
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
                    <Image style={{width: addAttachBtnSize, height: addAttachBtnSize}}
                           source={imageUri.callFuncAreaButton}/>
                </View>
                {InputOutlineForAndroid}
                <TextInput style={[textInputStyle, {height: this.state.inputBlankHeight}]}
                           underlineColorAndroid={'transparent'} multiline={true}
                           onContentSizeChange={this._inputChangeSize}
                           ref={(textInput => this._textInput = textInput)}
                           onChangeText={text => {
                               this.replyTextContent = text;
                           }}
                    // TO DO
                    // returnKeyType={'send'} blurOnSubmit={true}
                    // onSubmitEditing={this._onPressSendButton()}
                           onFocus={() => {
                               console.log('========== 1.2 Onfocus');
                               // 会比 kb will change frame 后跑
                               this.needToFoldAllForIOS = true;
                               this.needToListenKBFrameChange = true;
                               this.needToFoldAll = Platform.select({ios: false, android: true});
                               if (Platform.OS === 'android') {
                                   // 安卓中，当 focus 输入框的时候，不会进入到 keyboardChangeFrame,所以这里要手动做一下
                                   this.setState({foldStatus: foldStatus.fold});
                               }
                           }}
                />
                <View style={styles.sendBtn}
                      onTouchStart={this._onPressSendButton}>
                    <Text style={styles.sendBtnText}>
                        Send
                    </Text>
                </View>
            </View>
        );
    };

    _functionalInput_functionArea = () => {
        // console.log('呼唤功能区~~~~~~~~~~' + this.functionAreaHeight);
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
            return (<View style={{width: width, height: height, backgroundColor: 'rgba(0,0,0,0)'}}/>)
        } else {
            return null;
        }
    };

    render() {
        return (
            <View style={styles.container}>
                {this._functionalInput_divideLine()}
                {this._functionalInput_inputArea()}
                {this._functionalInput_keyboardOccupyArea()}
                {this._functionalInput_functionArea()}
                <SafeAreaForIphoneX bgColor={cmpColor.cmpBackground}/>
            </View>
        );
    }
}

export class FunctionalInput extends PureComponent {
    constructor(props) {
        super(props);
        this.scrollNeedRestToZero = false;
    }

    static propTypes = {
        wrappedContentCmp: PropTypes.object.isRequired, // 用于包裹的显示区域的组件内容
        contentChatMode: PropTypes.bool.isRequired, // 聊天模式，那么内容区域的消息从底部插入
        contentCmpContainsScrollView: PropTypes.bool.isRequired,// 告知是否内容区域内包含 可滚动的组件
        navBarHidden: PropTypes.bool.isRequired, // 告知是否有导航条
        wrappedFunctionCmp: PropTypes.object.isRequired, // 用于包裹的功能区域的内容
        sendReplyCallback: PropTypes.func.isRequired, // 用于发送按钮按下
        funcAreaHeight: PropTypes.number.isRequired,
    };

    resetPage = () => {
        keyboardDismissEnsure();
        //在这里执行之后，其实 keyboardwillhide 会产生监听(安卓不会监听 willhide)，会再进入一次这里.为了避免循环，加一个判断
        if (this.scrollNeedRestToZero && this._input.keyboardhHeight === 0 && Platform.OS === 'ios') {
            return;
        }

        console.log('_____⬇⬇⬇⬇ truly resetPage');
        this._input.needToListenKBFrameChange = true;
        this._input.needToFoldAll = true;
        this.scrollNeedRestToZero = true;

        if (Platform.OS === 'ios') {
            console.log('ios 此时的换行偏移 ' + this._input.shiftLineOffset);
            this._scrollView.scrollTo({y: this._input.shiftLineOffset, animated: true});//默认偏移是0，当输入框有换行时会多加上偏移量
        } else {
            this._scrollView.scrollToEnd();
        }

        // 需要等待滚动结束后，再去 setState，否则在 ios 下会有问题
        if (Platform.OS === 'android') {
            this.turnToFoldStateAfterScrollFinished();
        }

        console.log('<<<<<<<< 键盘确实要隐藏了');
    };

    turnToFoldStateAfterScrollFinished = () => {
        setTimeout(() => {
            console.log('状态 ' + this._input.state.foldStatus);
            // if (this._input.state.foldStatus === foldStatus.unfoldWithAttachment || this._input.needRstInputContentAndHeight) {
            if (this._input.state.foldStatus !== foldStatus.fold) {
                console.log('给我去折叠');
                this._input.fold();
            }
        }, 100);
    };

    // 详情的显示区域
    _displayComponent = () => {
        let navHiddenHeight = Platform.select({ios: 0, android: 36});
        let navBarHeight = this.props.navBarHidden === true ? navHiddenHeight : SafeAreaForIphoneX.fetchNavBarHeight();
        let detailHeight = height - functionalInputAreaFoldHeight - navBarHeight - SafeAreaForIphoneX.fetchSaveAreaHeight();
        let scrollable = this.props.contentCmpContainsScrollView;
        if (scrollable) {
            let chatMode = this.props.contentChatMode === true ? 'flex-end' : 'flex-start';
            return (
                <View style={{width: width, height: detailHeight, justifyContent: chatMode}}
                      onTouchStart={() => this.resetPage()}>
                    {this.props.wrappedContentCmp}
                </View>
            );
        } else {
            let chatMode = this.props.contentChatMode === true ? 'column-reverse' : 'column';
            return (
                <ScrollView style={{width: width, height: detailHeight, flexDirection: chatMode}}
                            onTouchStart={() => {
                                console.log('⬇⬇⬇⬇⬇⬇⬇⬇ press scroll to resetPage');
                                this.resetPage();
                            }}>
                    {this.props.wrappedContentCmp}
                </ScrollView>
            );
        }
    };

    render() {
        return (
            <ScrollView style={styles.scrollViewContainer} scrollEnabled={false}
                        ref={(scrollView => this._scrollView = scrollView)}
                        scrollEventThrottle={200} keyboardShouldPersistTaps={'always'}
                        onMomentumScrollEnd={() => {
                            console.log('滚动结束');
                            if (this.scrollNeedRestToZero && Platform.OS === 'ios') {
                                this.scrollNeedRestToZero = false;
                                this.turnToFoldStateAfterScrollFinished();
                            }
                        }}
            >
                {this._displayComponent()}
                <InnerFunctionalInput ref={(input => this._input = input)} resetWholePage={this.resetPage}
                                      wrappedFunctionCmp={this.props.wrappedFunctionCmp}
                                      funcAreaHeight={this.props.funcAreaHeight}
                                      sendReplyCallback={this.props.sendReplyCallback}
                                      outsideScrollCallBack={(keyboardHeight: number, shiftLineOffset: number, scrollEnd: boolean) => {
                                          if (scrollEnd) {
                                              // 安卓环境下，输入框换行时调用。此时直接滚动到底
                                              console.log('滚到底');
                                              this._scrollView.scrollToEnd();
                                          } else {
                                              console.log('滚吧！  ' + keyboardHeight + '; ' + shiftLineOffset);
                                              let offsetY = keyboardHeight + shiftLineOffset;
                                              this._scrollView.scrollTo({y: offsetY, animated: true});
                                          }
                                      }}/>
            </ScrollView>
        );
    }
}

// 为了确保键盘隐藏被调用做的事
function keyboardDismissEnsure() {
    Keyboard.dismiss();
    setTimeout(() => {
        Keyboard.dismiss();
    }, 100);
}

// -------------------- 样式 -----------------------------
const divideLineHeight = 1;
const addAttachmentMargin = 6, addAttachOccupyWidth = addAttachBtnSize + 2 * addAttachmentMargin;
const sendBtnWidth = 58, sendBtnHeight = 35, sendBtnMarginLeft = 8, sendBtnMarginRight = 7;
const sendBtnOccupyWidth = sendBtnWidth + sendBtnMarginLeft + sendBtnMarginRight;
const cornerRadius = 4;
const inputFrameForIOS = {
    borderWidth: 1, borderColor: cmpColor.textInputBorder, borderRadius: cornerRadius,
    backgroundColor: cmpColor.textInputBackground,
    marginRight: sendBtnOccupyWidth, marginTop: 5, marginBottom: 5,
    minHeight: sendBtnHeight, maxHeight: 5 * sendBtnHeight,
    width: width - sendBtnOccupyWidth - addAttachOccupyWidth,
};
const styles = StyleSheet.create({
    scrollViewContainer: {},
    container: {justifyContent: 'flex-end'},
    // FunctionalInput
    divideLine: {
        width: width, height: divideLineHeight, backgroundColor: cmpColor.divideLine,
    },
    inputArea: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: cmpColor.cmpBackground,
        width,
    },
    inputFrameForIOS: inputFrameForIOS,
    inputFrameForAndroid: {
        position: 'absolute', left: addAttachOccupyWidth + 5, right: sendBtnOccupyWidth,
        backgroundColor: 'rgba(0,0,0,0)', fontSize: 20,
        // height: functionalInputAreaFoldHeight - divideLineHeight,
    },
    inputFrameOutlineForAndroid: inputFrameForIOS,
    addAttachment: {width: addAttachBtnSize, height: addAttachBtnSize, margin: addAttachmentMargin},
    sendBtn: {
        position: 'absolute',
        width: sendBtnWidth, height: sendBtnHeight, right: sendBtnMarginRight,
        borderWidth: 1, borderColor: cmpColor.sendButtonBorder, borderRadius: cornerRadius,
        backgroundColor: cmpColor.sendButtonBackground, justifyContent: 'center', alignItems: 'center'
    },
    sendBtnText: {
        color: cmpColor.sendButtonText, fontSize: 18,
    },
});
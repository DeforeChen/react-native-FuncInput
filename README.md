# react-native-FuncInput
A input component with customized functional area.

## Gif

* totally
    ![A](https://upload-images.jianshu.io/upload_images/1180547-22834594bc9b441c.gif?imageMogr2/auto-orient/strip%7CimageView2/2/w/375)

* height adapter in iOS when using third part keyboard
    ![C8396876-3C5C-4CA7-9BF9-AD23229E2895-19170-00001705BAD6A310.gif](https://upload-images.jianshu.io/upload_images/1180547-f01d5e49911aa98b.gif?imageMogr2/auto-orient/strip%7CimageView2/2/w/335)

* shift between kinds of keyboard
    ![CD66A319-D1B7-4CED-B1BD-CEFD2994864E-19170-00001742F673E15B.gif](https://upload-images.jianshu.io/upload_images/1180547-66b0dcbaa3b3930c.gif?imageMogr2/auto-orient/strip%7CimageView2/2/w/375)


## Props

![2018-04-10 at 9.47 PM.png](https://upload-images.jianshu.io/upload_images/1180547-c7d3a2363d919b0f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/383)


| props | type | description |
| --- | --- | --- |
| wrappedContentCmp | object | show in the content area as you wish |
| wrappedFunctionCmp | object | show in the function area below the input area |
| navBarHidden | bool | tell the component if you need a navigation bar so that the function area height could adapt itself |
| contentCmpContainsScrollView | bool | tell the component if you will put a scrollview or a subclass scrollview in the content area to ensure the keyboard can fold correctly.|
| sendReplyCallback | func | you can put any callback function here when the "Send" button is clicked |


## Characters

* both worked in Android and iOS
* adapter keyboard height when shift between different kind of keyboards, even including the third party keyboard such as Sougou
* adaper height it self when shift between the keyboard and function area

## weakness

* the text input blank can not be multi lines so far because it may cause a fail show of the keyboard.
* the text input blank can not apdat the height itself
* less customized layout in the input area.
* in iOS, when using a third part keyboard, it will cause a short delay once focus in textinput area.

## How to use
The following is the demo code:

```javascript
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

    render() {
        return (
            <FunctionalInput wrappedContentCmp={this._contentComponent()} funcAreaHeight={240}
                             wrappedFunctionCmp={this._functionArea()} navBarHidden={true}
                             contentCmpContainsScrollView={false}
                             sendReplyCallback={() => {
                                 console.warn('send button pressed');
                             }}
            />
        );
    }
}
```


# react-native-FuncInput

## 综述
本控件是一个页面控件，简单来说，类似于微信或 QQ 的聊天页面，主要解决了

* 自动换行，
* 键盘遮挡，
* 高度自适应

这三个问题。。当然，也可以用来做社交类应用中的回复等功能。
对外暴露出两大快的区域内容，供用户自定义，分别是
![2018-05-06 at 4.39 P](https://upload-images.jianshu.io/upload_images/1180547-c99d85b37cde81e5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/240)

* 输入框上半部分的内容区域
* 下班部分的功能区域。

Demo 中做了一个仿微信聊天的页面来说明控件的使用。中间灰色的区域是控件中主要实现的内容。

从实现的效果上来看，安卓的效果整体较 `ios`要好。原因会在本文的后半部提到。

## 效果图
![ImpressiveDrawing](https://upload-images.jianshu.io/upload_images/1180547-e69c224e17d7abfc.gif?imageMogr2/auto-orient/strip%7CimageView2/2/w/268)


## 控件的特点

* `android` 和 `iOS` 下均做了适配，同时也适配 `iPhone X`，解决键盘遮挡的问题
* 根据有/无导航条，自适应页面
* 如上示意图，内容展示区与功能输入区不作干预，用户可自定义使用方法。
* 兼容不同键盘，`iOS`兼容第三方键盘输入，切换键盘高度时，输入框会自适应。
* 输入超过单行时，在输入框最大高度范围内，输入框高度及页面滚动会自适应。
* 功能输入区高度和键盘高度不一致，当在两个区域切换时，可以很好的适配。

## Props

| props | type | description |
| --- | --- | --- |
| wrappedContentCmp | object | 内容区域需要传入的组件部分 |
| contentChatMode | boolean | true 表示处于聊天模式下。此时内容区域内的布局是从底部向上排列的。反之，则按照正常排列 |
| wrappedFunctionCmp | object | 功能区域需要传入的组件部分 |
| funcAreaHeight | number | 必须要告知本组件功能区域的高度 |
| navBarHidden | boolean | 告知本组件当前是否存在导航条，有无导航条会影响布局和展示的适配程度。 |
| contentCmpContainsScrollView | bool | 告知本组件，内容区域内是否存放了一个scrollview 或他的子类，以便保证键盘高度弹出时能正常适配 |
| sendReplyCallback | func | 发送按钮的回调函数 |

## 已知 bug 及不足
### 已知 bug

* `android`
    * 安卓环境下，当输入达到多行，且超过了最大高度时，输入框和光标不会自动定位到最后一个字符。除非用户手动滚动到底，否则输入的内容在底部并不会自己展示。 
      
      > *查过`react native`官方的文档和`issues`，这是安卓目前尚无法解决的问题。还未找出有什么好的办法来*规避。
* `iOS`
    * 使用第三方输入法（这里以搜狗为例）情况下，在 `app`之间切换，返回时会产生一些输入框遮挡的情况。再做一次 app 间切换又正常。系统原生的输入法不会有此问题。

      > *调试中发现搜狗输入法在唤起键盘时，会产生两次的高度回调（原生键盘不会）。以搜狗输入法默认的高度为例，两次高度分别是`252`和`282`。在 app 切换回来的时候，键盘唤起的高度又会被执行一次，此时会产生这个问题。*

    * 低概率情况，使用第三方输入法（这里以搜狗为例）情况下，当点击内容区域或唤起功能区域（+按钮）时，键盘不会消失，需要用户手动点击消失按钮。目前在打包为`bundle`情况下尚未发现。

### 不足 —— 主要针对 `iOS`
对比微信的聊天页面，本组件还有许多不足。
鉴于 `IM` 类组件对性能的要求较高，本身不建议使用纯`RN`来做。具体的说明在文章后半部分会提到。这里只对几个缺点作一个简要说明。

* 页面的偏移滚动一定是在键盘唤醒后的。这是 `RN`本身的时序导致的。因为调用顺序是，原生的键盘出来后，`JS`才收到原生发来的广播消息。
* 输入换行时，输入区域的底部会出现短暂的空白，这是由于时序设计上导致的。必须获取到换行事件回调中的高度变化，才能去控制整体 scrollview 的滚动，在时间差上会导致短暂的空白。
* 发送按钮。 微信的键盘上提供了一个`发送`按钮，这样做的好处是不会占用正常的输入区域的宽度。`RN`目前提供的方案，`TextInput`组件提供了几个`props`:
    
    * `returnKeyType` —— 键盘上的`Done`类型，可以设置成`send`
    * `onSubmitEditting` —— 此回调函数当软键盘的确定/提交按钮被按下的时候调用此函数。如果`multiline={true}`，此属性不可用。
    * `multiline` —— 多行模式 —— 我们这里肯定是设置为 `true`
    * `blurOnSubmit` —— 如果为true，文本框会在提交的时候失焦。对于单行输入框默认值为true，多行则为false。注意：对于多行输入框来说，如果将blurOnSubmit设为true，则在按下回车键时就会失去焦点同时触发onSubmitEditing事件，而不会换行。
    
    > *根据上面几点的说明，如果我将`blurOnSubmit`，那么可以使用虚拟键盘上的`发送`按钮并传入点击事件方法给他，但是这样一来，光标会失焦，键盘会消失。这显然不是我想要的。但是不这样做，就无法获取到点击事件。*
    
* 尚未提供功能接口，方便用户自定义功能键的摆放位置、样式，以及是否需要发送按钮。
* 目前还未完全设计好，

下面是设计思路

## 设计思路
### 解决的问题

如文首提到的，键盘遮挡一直是 `RN`中比较容易遇到的棘手问题。且这问题主要针对 `iOS`。因为安卓的键盘弹出，会在当前输入框底下自动插入对应的键盘，也包括高度自适应。这就不需要开发者做太多额外的高度适应和滚动问题。

本控件拿到了的两个接口 `wrappedContentCmp` 和 `wrappedFunctionCmp` 传来的组件内容后，包裹在一个大的`ScrollView`中，当发生换行事件，`state`变换引起的键盘占位区域高度变化时，做对应的高度滚动。


## 流程图

![功能输入——唤起键盘流程.png](https://upload-images.jianshu.io/upload_images/1180547-e565bff47cc3f111.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![功能输入 —— 键盘消失流程.png](https://upload-images.jianshu.io/upload_images/1180547-b2ed8748c567aeb6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 联系方式
有任何问题，欢迎添加本人 QQ 250547732


/**
 * Created by Defore on 2018/5/6.
 */

import React, {PureComponent} from 'react';
import {
    StyleSheet, Text, View, Image, Dimensions, TouchableOpacity
} from 'react-native';

import Props from 'prop-types';

const {width} = Dimensions.get('window');
const iconsInfo = [
    {image: require('./images/ic_more_card.png'), title: '个人名片'},
    {image: require('./images/ic_more_take_pic.png'), title: '拍摄'},
    {image: require('./images/ic_more_recorder.png'), title: '语音输入'},
    {image: require('./images/ic_more_position.png'), title: '位置'},
    {image: require('./images/ic_more_movie.png'), title: '视频通话'},
    {image: require('./images/ic_more_phone.png'), title: '语音通话'},
    {image: require('./images/ic_more_gallery.png'), title: '照片'},
    {image: require('./images/ic_more_collection.png'), title: '收藏'}
];

export default class funcArea extends PureComponent {
    _generateCells = () => {
        let cellsArray = [];
        let index = 0;

        for (let info of iconsInfo) {
            console.log('图片' + info.images + 'title ' + info.title);
            let cell = <Cell key={index} title={info.title} cellHeight={funcAreaHeight / 2} cellWidth={width / 4}
                             imgSource={info.image}/>;
            cellsArray.push(cell);
            index++;
        }

        return cellsArray;
    };


    render() {
        return (
            <View style={styles.container}>
                {this._generateCells()}
            </View>
        );
    }
}

class Cell extends PureComponent {
    static propTypes: {
        title: PropTypes.string.isRequired,
        cellHeight: PropTypes.number.isRequired,
        cellWidth: PropTypes.number.isRequired,
        imgSource: PropTypes.string.isRequired,
    };


    render() {
        let height = this.props.cellHeight;
        let width = this.props.cellWidth;

        return (
            <TouchableOpacity style={[{height, width}, styles.cell]}>
                <View style={styles.cellImageContainer}>
                    <Image style={{width: 35, height: 35}} source={this.props.imgSource}/>
                </View>

                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={styles.cellTitle}>
                        {this.props.title}
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }
}

// -------------------- Styles -----------------------------
const funcAreaHeight = 240;
const styles = StyleSheet.create({
    container: {
        width: width, height: 240, flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#eeeeee',
    },
    cell: {
        alignItems: 'center', backgroundColor: 'rgba(0,0,0,0)',
    },
    cellTitle: {
        fontSize: 12, margin: 5,
    },
    cellImageContainer: {
        justifyContent: 'center', alignItems: 'center', marginTop: 20, backgroundColor: 'white',
        height: 55, width: 55, borderRadius: 10, borderColor: '#DFDFDF', borderWidth: StyleSheet.hairlineWidth
    },
});
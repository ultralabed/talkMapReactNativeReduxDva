import _ from 'lodash';
import moment from 'moment';
import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  Dimensions,
  TouchableHighlight,
} from 'react-native';
import { connect } from 'dva/mobile';
import { InputItem, WhiteSpace, List, ListView, Flex } from 'antd-mobile';
import InvertibleScrollView from 'react-native-invertible-scroll-view';

class PublicMessageScreen extends Component {
  componentWillMount() {
    this.createDataSource(this.props);
  }

  componentWillReceiveProps(nextProps) {
    // nextProps are the next set of props that this component
    // will be render with
    //this.props is still the old set of props
    this.createDataSource(nextProps);
  }

  createDataSource({ allMessages }) {
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });

    this.dataSource = ds.cloneWithRows(allMessages);
  }

  _scrollToBottom(ref) {
    if (ref) {
      ref.scrollTo({y: ref.scrollProperties.contentLength - ref.scrollProperties.visibleLength + 30})
    }
  }

  renderRow(data) {
    const { user } = this.props;
    const { messageMe, messageOther, avatar } = styles;
    const imagekey = imageKey = data.email.length + 7;
    const imageUri = `https://avatars3.githubusercontent.com/u/${imagekey}?v=3&s=50`;
    return (
      data.email === user.email ?
      (
        <View>
          <Flex justify="end">
            <View style={{flexDirection: 'row', marginLeft: 35}}>
              <Text style={messageMe}>{data.message}</Text>
            </View>
          </Flex>
          <WhiteSpace />
        </View>
      )
      :
      (
        <View>
          <Flex justify="start">
            <TouchableHighlight
              underlayColor='#fff'
              onPress={() => this.props.dispatch({ type: 'Messages/checkConversationMap', payload: { from: user.uid , to: data.userId, email: data.email } })}>
              <Image style={avatar} source={{uri: imageUri}}></Image>
            </TouchableHighlight>
            <View style={{flexDirection: 'row', width: Dimensions.get('window').width - 50}}>
              <Text style={messageOther}>{data.message}</Text>
            </View>
            <WhiteSpace />
          </Flex>
          <WhiteSpace />
        </View>
      )
    );
  }

  renderInvertibleScrollView() {
    return (
      <InvertibleScrollView {...this.props} />
    )
  }

  render() {
    const { listView, input, send } = styles;
    const { message, dispatch } = this.props;
    return (
      <View style={listView}>
        <ListView
          ref={ref => this._scrollToBottom(ref)}
          renderScrollComponent={this.renderInvertibleScrollView}
          enableEmptySections
          dataSource={this.dataSource}
          renderRow={this.renderRow.bind(this)}
        />
        <View style={{flexDirection: 'row'}}>
          <InputItem
            clear
            value={message}
            type="text"
            style={input}
            onChange={(value) => dispatch({ type: 'Messages/messageText', payload: value })}
            placeholder="Enter messages..."
            >
          </InputItem>
          <TouchableHighlight
            underlayColor='#fff'
            onPress={() => message ? dispatch({ type: 'Messages/addPublicMessages', payload: message }) : null}>
            <Image style={send} source={require('../assets/send.jpg')}></Image>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
};

const styles = {
  listView: {
     height: Dimensions.get('window').height - 66,
  },
  input: {
    height: 40,
    width: Dimensions.get('window').width - 60,
  },
  send: {
    borderColor: '#fff',
    marginTop: 5,
    height: 30,
    width: 30,
    resizeMode : 'contain',
  },
  avatar: {
    borderColor: '#fff',
    marginTop: 5,
    height: 40,
    width: 40,
    resizeMode : 'contain',
    borderRadius: 20,
  },
  messageMe: {
    marginLeft: 8,
    marginRight: 8,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 10,
    paddingRight: 7,
    borderWidth : 2,
    borderRadius: 15,
    overflow: 'hidden',
    borderColor: '#4080ff',
    color: '#fff',
    backgroundColor: '#4080ff',
    fontSize: 16,
  },
  messageOther: {
    marginLeft: 8,
    marginRight: 8,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 10,
    paddingRight: 7,
    borderRadius: 15,
    borderWidth : 2,
    overflow: 'hidden',
    borderColor: '#f1f0f0',
    color: '#000',
    backgroundColor: '#f1f0f0',
    fontSize: 16,
  },
}

const mapStateToProps = ({ Messages, auth }) => {
  const { message } = Messages;
  const { user } = auth;
  const allMessages = _.map(Messages.allMessages, (val, uid) => {
    let time = moment.unix(val.time / 1000).fromNow();
    return { ...val, uid, time };
  });
  return {
    allMessages,
    message,
    user,
  };
}
export default connect(mapStateToProps)(PublicMessageScreen);

import _ from 'lodash';
import firebase from 'firebase';
import moment from 'moment';
import React, { Component } from 'react';
import {
  Text,
  View,
  Dimensions,
  Image,
  TouchableHighlight,
} from 'react-native';
import { connect } from 'dva/mobile';
import { Button, InputItem, WhiteSpace, List, ListView, Flex } from 'antd-mobile';

class PrivateMessageScreen extends Component {
  componentWillMount() {
    this.createDataSource(this.props);

    const { dispatch, conversationKey } = this.props;
    firebase.database().ref(`/conversations/${conversationKey}`)
    .on('value', (snapshot) => {
      const val = snapshot.val();
      if (val) {
        dispatch({ type: 'Messages/updateConversations', payload: val });
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    // nextProps are the next set of props that this component
    // will be render with
    //this.props is still the old set of props

    this.createDataSource(nextProps);
  }

  createDataSource({ conversations }) {
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });

    this.dataSource = ds.cloneWithRows(conversations);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({ type: 'Messages/updateConversationKey', payload: '' });
    dispatch({ type: 'Messages/updateConversations', payload: {} });
    dispatch({ type: 'Messages/updateConversationFromTo', payload: { from: '', to: '' } });
  }

  _scrollToBottom(ref) {
    if (ref) {
      ref.scrollTo({y: ref.scrollProperties.contentLength - ref.scrollProperties.visibleLength + 30})
    }
  }


  renderRow(data) {
    const { talkMapUsers, user, to } = this.props;
    const { messageMe, messageOther, avatar, messageTime } = styles;
    const imagekey = imageKey = talkMapUsers[to].email.length + 7;
    const imageUri = `https://avatars3.githubusercontent.com/u/${imagekey}?v=3&s=50`;

    return (
      data.from === user.uid ?
      (
        <View>
          <Flex justify="end">
            <View>
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
            <Image style={avatar} source={{uri: imageUri}}></Image>
            <View style={{flexDirection: 'row', width: Dimensions.get('window').width - 50}}>
              <Text style={messageOther}>{data.message}</Text>
            </View>
          </Flex>
          <WhiteSpace />
        </View>
      )
    );
  }

  render() {
    const { listView, input, send } = styles;
    const { message, dispatch, conversationKey, from, to } = this.props;

    return (
      <View style={listView}>
        <ListView
          ref={ref => this._scrollToBottom(ref)}
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
            onPress={() =>  message ? dispatch({ type: 'Messages/addPrivateMessages', payload: { message, conversationKey, from, to } }) : null}>
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
  messageTime: {
    fontSize: 14,
    marginBottom: -10,
    marginLeft: 0,
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

const mapStateToProps = ({ Messages, Location, auth }) => {
  const { conversationKey, message, from, to } = Messages;
  const { talkMapUsers } = Location;
  const { user } = auth;
  let conversations = {};
  if (!_.isEmpty(Messages.conversations)) {
    conversations = _.map(Messages.conversations, (val, uid) => {
      let time = moment.unix(val.time / 1000).fromNow();
      return { ...val, uid, time };
    });
  }

  return {
    conversationKey,
    conversations,
    message,
    from,
    to,
    talkMapUsers,
    user,
  }
}
export default connect(mapStateToProps)(PrivateMessageScreen);

import React from 'react'
import { ChatBubble } from 'react-chat-ui'

export default class MyChatBubble extends React.Component {
  render () {
    let bubbleStyles = {}
    if (this.props.message.id === 'bot') {
      bubbleStyles = {
        text: {
          fontSize: 12
        },
        chatbubble: {
          borderRadius: 70,
          padding: '10px 30px'
        }
      }
    } else {
      bubbleStyles = {
        text: {
          fontSize: 12
        },
        chatbubble: {
          borderRadius: 70,
          padding: '10px 30px',
          backgroundColor: 'black',
          float: 'right'
        }
      }
    }
    return <ChatBubble bubbleStyles={bubbleStyles} message={this.props.message} />
  }
}

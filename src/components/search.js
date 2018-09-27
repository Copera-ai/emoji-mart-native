import React from 'react'
import PropTypes from 'prop-types'
import {
  Platform,
  StyleSheet,
  View,
  TextInput,
  TouchableNativeFeedback,
  Image,
} from 'react-native'

import NimbleEmojiIndex from '../utils/emoji-index/nimble-emoji-index'
import { Skins, Touchable } from '.'

const arrowBackIcon = require('../assets/arrow-back.png')
const clearIcon = require('../assets/clear-icon.png')

const styles = StyleSheet.create({
  searchContainer: {
    paddingLeft: 5,
    paddingRight: 10,
    paddingTop: 2,
    paddingBottom: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eceff1',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
  },
  closeButtonContainer: {
    width: 44,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 28,
    height: 28,
    margin: 10,
    borderRadius: 500,
  },
  closeButtonIcon: {
    marginTop: 2,
    marginLeft: 2,
    height: 24,
    width: 24,
  },
})

export default class Search extends React.PureComponent {
  static propTypes = {
    onSearch: PropTypes.func,
    onPressClose: PropTypes.func,
    maxResults: PropTypes.number,
    emojisToShowFilter: PropTypes.func,
    autoFocus: PropTypes.bool,
    showSkinTones: PropTypes.bool,
    skinsProps: PropTypes.object.isRequired,
  }

  static defaultProps = {
    onSearch: () => {},
    onPressClose: () => {},
    maxResults: 75,
    emojisToShowFilter: null,
    autoFocus: false,
    showSkinTones: true,
  }

  constructor(props) {
    super(props)

    this.data = props.data
    this.emojiIndex = new NimbleEmojiIndex(this.data)
    this.setRef = this.setRef.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.pressCancel = this.pressCancel.bind(this)

    this.state = {
      searchTerm: '',
    }
  }

  handleChange(value) {
    this.setState({
      searchTerm: value,
    })

    this.props.onSearch(
      this.emojiIndex.search(value, {
        emojisToShowFilter: this.props.emojisToShowFilter,
        maxResults: this.props.maxResults,
        include: this.props.include,
        exclude: this.props.exclude,
        custom: this.props.custom,
      }),
    )
  }

  pressCancel() {
    this.props.onSearch(null)
    this.clear()
  }

  setRef(c) {
    this.input = c
  }

  clear() {
    this.setState({
      searchTerm: '',
    })
  }

  render() {
    var {
      i18n,
      autoFocus,
      onPressClose,
      skinsProps,
      showSkinTones,
      showCloseButton,
    } = this.props
    var { searchTerm } = this.state

    let background

    if (Platform.Version >= 21) {
      background = TouchableNativeFeedback.SelectableBackgroundBorderless()
    } else {
      background = TouchableNativeFeedback.SelectableBackground()
    }

    return (
      <View style={styles.searchContainer}>
        {showCloseButton ? (
          <View style={styles.closeButtonContainer}>
            <Touchable
              onPress={onPressClose}
              background={Platform.OS === 'android' ? background : null}
              style={[styles.closeButton]}
            >
              <Image style={styles.closeButtonIcon} source={arrowBackIcon} />
            </Touchable>
          </View>
        ) : null}
        <TextInput
          style={styles.searchInput}
          ref={this.setRef}
          value={searchTerm}
          onChangeText={this.handleChange}
          placeholder={i18n.search}
          autoFocus={autoFocus}
          underlineColorAndroid="transparent"
        />
        {searchTerm.length > 0 ? (
          <View style={styles.closeButtonContainer}>
            <Touchable
              onPress={this.pressCancel}
              background={Platform.OS === 'android' ? background : null}
              style={[styles.closeButton]}
            >
              <Image style={styles.closeButtonIcon} source={clearIcon} />
            </Touchable>
          </View>
        ) : null}
        {showSkinTones && <Skins {...skinsProps} />}
      </View>
    )
  }
}

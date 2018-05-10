import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Text, ScrollView } from 'react-native'

import frequently from '../utils/frequently'
import { getData, getSanitizedData, chunk } from '../utils'
import { NimbleEmoji } from '.'

const styles = StyleSheet.create({
  category: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  labelText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  emojisContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  notFound: {
    alignSelf: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default class Category extends React.Component {
  static propTypes = {
    emojis: PropTypes.array,
    hasStickyPosition: PropTypes.bool,
    name: PropTypes.string.isRequired,
    native: PropTypes.bool.isRequired,
    perLine: PropTypes.number.isRequired,
    emojiProps: PropTypes.object.isRequired,
    recent: PropTypes.arrayOf(PropTypes.string),
  }

  static defaultProps = {
    emojis: [],
    hasStickyPosition: true,
  }

  constructor(props) {
    super(props)

    this.data = props.data
    this.setContainerRef = this.setContainerRef.bind(this)

    this.state = {
      visible: true,
    }
  }

  componentDidMount() {
    this.minMargin = 0
    this.maxMargin = {}
  }

  shouldComponentUpdate(nextProps, nextState) {
    var {
        name,
        perLine,
        native,
        hasStickyPosition,
        emojis,
        emojiProps,
      } = this.props,
      { skin, size, set } = emojiProps,
      {
        perLine: nextPerLine,
        native: nextNative,
        hasStickyPosition: nextHasStickyPosition,
        emojis: nextEmojis,
        emojiProps: nextEmojiProps,
      } = nextProps,
      { skin: nextSkin, size: nextSize, set: nextSet } = nextEmojiProps,
      shouldUpdate = false

    if (name == 'Recent' && perLine != nextPerLine) {
      shouldUpdate = true
    }

    if (name == 'Search') {
      shouldUpdate = !(emojis == nextEmojis)
    }

    if (
      skin != nextSkin ||
      size != nextSize ||
      native != nextNative ||
      set != nextSet ||
      hasStickyPosition != nextHasStickyPosition
    ) {
      shouldUpdate = true
    }

    return shouldUpdate
  }

  getMaxMarginValue() {
    let maxMargin = this.left

    for (let key in this.maxMargin) {
      if (this.maxMargin.hasOwnProperty(key)) maxMargin += this.maxMargin[key]
    }

    return maxMargin
  }

  handleScroll(scrollLeft) {
    const maxMargin = this.getMaxMarginValue()

    if (scrollLeft >= this.left && scrollLeft < maxMargin) {
      return true
    }

    return
  }

  getEmojis() {
    var { name, emojis, recent, perLine, emojiProps } = this.props
    const { set: emojiSet } = emojiProps

    if (name == 'Recent') {
      let { custom } = this.props
      let frequentlyUsed = recent || frequently.get(perLine)

      if (frequentlyUsed.length) {
        emojis = frequentlyUsed
          .map((id) => {
            const emoji = custom.filter((e) => e.id === id)[0]
            if (emoji) {
              return emoji
            }

            return id
          })
          .filter((id) => !!getData(id, null, null, this.data))
      }

      if (emojis.length === 0 && frequentlyUsed.length > 0) {
        return null
      }
    }

    if (emojis) {
      emojis = emojis.slice(0)
    }

    return emojis
  }

  updateDisplay(visible) {
    var emojis = this.getEmojis()

    if (!emojis) {
      return
    }

    this.setState({ visible })
  }

  setContainerRef(c) {
    this.container = c
  }

  onLayout = (index, event) => {
    const { x: left, width } = event.nativeEvent.layout

    if (index === 0) {
      this.left = left
    }

    if (width === 0) {
      this.maxMargin[`page-${index}`] = 0
    } else {
      this.maxMargin[`page-${index}`] = width
    }
  }

  _getSanitizedData = (props) => {
    const { emoji, skin, set } = props
    return getSanitizedData(emoji, skin, set, this.data)
  }

  render() {
    var {
        id,
        name,
        hasStickyPosition,
        emojiProps,
        i18n,
        perLine,
        rows,
      } = this.props,
      emojis = this.getEmojis(),
      { visible } = this.state

    const { size: emojiSize, margin: emojiMargin } = emojiProps

    const emojiSizing = emojiSize + emojiMargin
    const emojisListWidth = perLine * emojiSizing + emojiMargin
    const emojisListHeight = rows * emojiSizing + emojiMargin

    const paginatedEmojis = chunk(emojis, perLine * 3)

    return !emojis || !visible
      ? null
      : [
          emojis.length ? (
            paginatedEmojis.map((emojis, i) => (
              <View
                onLayout={this.onLayout.bind(this, i)}
                key={`${name}_emojis_${i}`}
                style={[
                  styles.emojisContainer,
                  {
                    width: emojisListWidth,
                    height: emojisListHeight,
                    padding: emojiMargin / 2,
                  },
                ]}
              >
                {emojis.map((item, i) => {
                  const emoji = this._getSanitizedData({
                    emoji: item,
                    ...emojiProps,
                  })

                  return (
                    <NimbleEmoji
                      key={`${name}_emoji_${emoji.id}`}
                      emoji={emoji}
                      data={this.data}
                      {...emojiProps}
                    />
                  )
                })}
              </View>
            ))
          ) : (
            <View
              key="notFound"
              style={[
                styles.notFound,
                {
                  width: emojisListWidth,
                  height: emojisListHeight,
                  padding: emojiMargin / 2,
                },
              ]}
            >
              <View>
                <NimbleEmoji
                  data={this.data}
                  {...emojiProps}
                  emoji="sleuth_or_spy"
                  onPress={null}
                  onLongPress={null}
                />
              </View>

              <View>
                <Text style={styles.labelText}>{i18n.notfound}</Text>
              </View>
            </View>
          ),
        ]
  }
}

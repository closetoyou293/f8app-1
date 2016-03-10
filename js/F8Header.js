/**
 * Copyright 2014 Facebook, Inc.
 *
 * You are hereby granted a non-exclusive, worldwide, royalty-free license to
 * use, copy, modify, and distribute this software in source code or binary
 * form for use in connection with the web services and APIs provided by
 * Facebook.
 *
 * As with any software that integrates with the Facebook platform, your use
 * of this software is subject to the Facebook Developer Principles and
 * Policies [http://developers.facebook.com/policy/]. This copyright notice
 * shall be included in all copies or substantial portions of the software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE
 *
 * @providesModule F8Header
 * @flow
 */

'use strict';

var F8Colors = require('F8Colors');
var React = require('React');
var Platform = require('Platform');
var StyleSheet = require('StyleSheet');
var { Text } = require('F8Text');
var TouchableOpacity = require('TouchableOpacity');
var View = require('View');
var Image = require('Image');
var ToolbarAndroid = require('ToolbarAndroid');

export type Layout =
    'default'      // Use platform defaults (icon on Android, text on iOS)
  | 'icon'         // Always use icon
  | 'title';       // Always use title

export type Item = {
  title?: string;
  icon?: number;
  layout?: Layout;
  onPress?: () => void;
};

export type Props = {
  title: string;
  leftItem?: Item;
  rightItem?: Item;
  extraItems?: Array<Item>;
  style: any;
  children: any;
};

class F8HeaderAndroid extends React.Component {
  props: Props;

  render() {
    const {leftItem, title, rightItem, extraItems} = this.props;
    let actions = [];
    if (rightItem) {
      const {title, icon, layout} = rightItem;
      actions.push({
        icon: layout !== 'title' ? icon : null,
        title: title,
        show: 'always',
      });
    }
    if (extraItems) {
      actions = actions.concat(extraItems.map((item) => ({
        title: item.title,
        show: 'never',
      })));
    }

    return (
      <ToolbarAndroid
        navIcon={leftItem && leftItem.icon}
        onIconClicked={leftItem && leftItem.onPress}
        title={title}
        titleColor="white"
        subtitleColor="white"
        actions={actions}
        onActionSelected={this.handleActionSelected.bind(this)}
        style={[styles.toolbar, this.props.style]}>
        {this.props.children}
      </ToolbarAndroid>
    );
  }

  handleActionSelected(position: number) {
    let items = this.props.extraItems || [];
    if (this.props.rightItem) {
      items = [this.props.rightItem, ...items];
    }
    const item = items[position];
    item && item.onPress && item.onPress();
  }
}


class F8HeaderIOS extends React.Component {
  props: Props;

  render() {
    const {leftItem, title, rightItem} = this.props;

    const content = React.Children.count(this.props.children) === 0
      ? <Text style={[styles.titleText, this.props.titleStyle]}>
          {title}
        </Text>
      : this.props.children;
    return (
      <View style={[styles.header, this.props.style]}>
        <View style={styles.leftItem}>
          <ItemWrapperIOS item={leftItem} />
        </View>
        <View style={styles.centerItem}>
          {content}
        </View>
        <View style={styles.rightItem}>
          <ItemWrapperIOS item={rightItem} />
        </View>
      </View>
    );
  }

}

class ItemWrapperIOS extends React.Component {
  props: {
    item: Item;
  };

  render() {
    const {item} = this.props;
    if (!item) {
      return null;
    }

    let content;
    const {title, icon, layout, onPress} = item;

    if (layout !== 'icon' && title) {
      content = (
        <Text style={styles.itemText}>
          {title.toUpperCase()}
        </Text>
      );
    } else if (icon) {
      content = <Image source={icon} />;
    }

    return (
      <TouchableOpacity onPress={onPress} style={styles.itemWrapper}>
        {content}
      </TouchableOpacity>
    );
  }
}


var STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
var HEADER_HEIGHT = Platform.OS === 'ios' ? 44 + STATUS_BAR_HEIGHT : 56;

var styles = StyleSheet.create({
  toolbar: {
    height: 56,
  },
  header: {
    backgroundColor: 'transparent',
    paddingTop: STATUS_BAR_HEIGHT,
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  leftItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerItem: {
    flex: 2,
    alignItems: 'center',
  },
  rightItem: {
    flex: 1,
    alignItems: 'flex-end',
  },
  itemWrapper: {
    padding: 11,
  },
  itemText: {
    letterSpacing: 1,
    fontSize: 12,
    color: 'white',
  },
});

const Header = Platform.OS === 'ios' ? F8HeaderIOS : F8HeaderAndroid;
Header.height = HEADER_HEIGHT;

module.exports = Header;
module.exports.__cards__ = (define) => {
  const menuItem = {
    title: 'Menu',
    icon: require('./common/img/hamburger.png'),
    onPress: () => alert('Menu button pressed!'),
  };
  const filterItem = {
    title: 'Filter',
    icon: require('./common/img/filter.png'),
    onPress: () => alert('Filter button pressed!'),
  };

  define('Simple', () => <Header title="Hello, world" />);
  define('With items', () => (
    <Header
      title="Default"
      leftItem={menuItem}
      rightItem={filterItem}
    />
  ));
  define('Forcing icons', () => (
    <Header
      title="Forcing icons"
      leftItem={{...menuItem, layout: 'icon'}}
      rightItem={{...filterItem, layout: 'icon'}}
    />
  ));
  define('Forcing title', () => (
    <Header
      title="Forcing title"
      leftItem={{...menuItem, layout: 'title'}}
      rightItem={{...filterItem, layout: 'title'}}
    />
  ));
  define('With content', () => (
    <Header leftItem={menuItem}>
      <View style={{backgroundColor: '#224488'}}>
        <Text style={{color: 'yellow'}}>
          Yellow text as title
        </Text>
      </View>
    </Header>
  ));
  define('With Background', () => (
    <Header
      title="With Background"
      leftItem={{...menuItem, layout: 'title'}}
      rightItem={{...filterItem, layout: 'title'}}
      style={{backgroundColor: '#224488'}}
    />
  ));
};

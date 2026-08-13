/*
  Everything the order pad needs that is specific to Barista's: the coin
  stand-ins, the milk list, the wording. Load before order-pad.js.

  Production coin art lives in assets/pad-icons/. Icon values are file
  names without the .png suffix; shared-format aliases reuse one file.
*/
window.orderPad = {
  currency: '$',

  iconBase: 'assets/pad-icons/',

  /* Every drink has its own art, so the order bar shows the drink, not
     the milk that was picked. */
  lineCoin: 'item',

  /* data-icon value → coin. Every custom drink gets its own coin;
     generic items share a category coin. Values are file names without
     the .png suffix.

     Keys ending in -b are the blended version of a drink that also
     exists iced/hot: separate key (blended drinks skip the milk
     question) but the SAME art file serves both. */
  icons: {
    /* custom drinks — blended board */
    'dirty-derrick': 'dirty-derrick',
    'derrick': 'derrick',
    'rocky-road-b': 'rocky-road',
    'creme-brulee-b': 'creme-brulee',
    'caramel-crunch': 'caramel-crunch',
    'caramel-sensation-b': 'caramel-sensation',
    'snicker-bar-b': 'snicker-bar',
    'butterfinger': 'butterfinger',
    'peanut-butter-bliss': 'peanut-butter-bliss',
    'coffee-toffee-crunch': 'coffee-toffee-crunch',
    'double-chocolate-truffle': 'double-chocolate-truffle',
    'dark-chocolate-mocha-b': 'dark-chocolate-mocha',
    'white-mocha-b': 'white-mocha',
    'blended-mocha': 'blended-mocha',
    'mexican-mocha': 'mexican-mocha',
    'toasted-almond-b': 'toasted-almond',
    'coconut-almond': 'coconut-almond',
    'coconut-craze': 'coconut-craze',
    'hawaiian-banana-nut': 'hawaiian-banana-nut',
    'blackberry-vanilla': 'blackberry-vanilla',
    'snowflake': 'snowflake',
    'frosted-latte': 'frosted-latte',
    'skinny-dip-latte': 'skinny-dip-latte',
    'exotic-spiced-chai': 'exotic-spiced-chai',
    'flamingo-chai': 'flamingo-chai',
    /* custom drinks — iced & hot */
    'in-the-raw': 'in-the-raw',
    'sicilian-latte': 'sicilian-latte',
    'caramel-sensation': 'caramel-sensation',
    'white-mocha': 'white-mocha',
    'dark-chocolate-mocha': 'dark-chocolate-mocha',
    'mocha-valencia': 'mocha-valencia',
    'cafe-barista': 'cafe-barista',
    'toasted-almond': 'toasted-almond',
    'creme-brulee': 'creme-brulee',
    'rocky-road': 'rocky-road',
    'snicker-bar': 'snicker-bar',
    'black-and-white': 'black-and-white',
    /* custom drinks — seasonal */
    'gingerbread-latte': 'gingerbread-latte',
    'jack-frost': 'jack-frost',
    'holly-jolly': 'holly-jolly',
    'maple-spice': 'maple-spice',
    'merry-mocha-mint': 'merry-mocha-mint',
    'white-christmas': 'white-christmas',
    /* custom drinks — smoothies */
    'tropical-island': 'tropical-island',
    'oreo-smoothie': 'oreo-smoothie',
    'green-tea-smoothie': 'green-tea-smoothie',
    'slinger': 'slinger',
    /* category coins for the generic items */
    'iced-latte': 'iced-latte',
    'iced-mocha': 'iced-mocha',
    'iced-chai': 'iced-chai',
    'iced-tea': 'iced-tea',
    'espresso': 'espresso',
    'hot-latte': 'hot-latte',
    'hot-mocha': 'hot-mocha',
    'hot-chai': 'hot-chai',
    'hot-tea': 'hot-tea',
    'traveler': 'traveler',
    'smoothie': 'smoothie',
    'panini': 'panini',
    'bagel': 'bagel',
    'croissant': 'croissant',
    'breakfast': 'breakfast',
    'pastry': 'pastry',
    'snack': 'snack',
    /* milks */
    'milk-whole': 'milk-whole',
    'milk-2': 'milk-2',
    'milk-nonfat': 'milk-nonfat',
    'milk-oat': 'milk-oat',
    'milk-almond': 'milk-almond',
    'milk-soy': 'milk-soy'
  },

  /* Rows with one of these data-icon values ask which milk before they
     land in the order. Blended (-b), teas, drip, smoothies and food
     add in one tap. */
  flavored: [
    'iced-latte', 'iced-mocha', 'iced-chai', 'hot-latte', 'hot-mocha', 'hot-chai',
    'in-the-raw', 'sicilian-latte',
    'caramel-sensation', 'white-mocha', 'dark-chocolate-mocha', 'mocha-valencia',
    'cafe-barista', 'toasted-almond', 'creme-brulee', 'rocky-road', 'snicker-bar',
    'black-and-white',
    'gingerbread-latte', 'jack-frost', 'holly-jolly', 'maple-spice',
    'merry-mocha-mint', 'white-christmas'
  ],

  /* The milk sheet. */
  flavors: [
    { en: 'Whole',  icon: 'milk-whole' },
    { en: '2%',     icon: 'milk-2' },
    { en: 'Nonfat', icon: 'milk-nonfat' },
    { en: 'Oat',    icon: 'milk-oat' },
    { en: 'Almond', icon: 'milk-almond' },
    { en: 'Soy',    icon: 'milk-soy' }
  ],

  /* Free requests. Nothing here changes the price. */
  extras: [
    { en: 'Decaf' },
    { en: 'Extra hot' },
    { en: 'Light ice' },
    { en: 'No whip' }
  ],

  text: {
    en: {
      one: 'item', many: 'items',
      add: 'Add', less: 'Remove one', drop: 'Remove',
      open: 'See my order', total: 'Total', clear: 'Clear all',
      note: 'Show this screen when you get to the counter.',
      myOrder: 'My order', order: 'Order', newOrder: 'New order',
      show: 'Show at the counter', back: 'Back to menu',
      forCart: 'For the counter',
      flavor: 'Milk', size: 'Size', extras: 'Requests',
      addToOrder: 'Add to my order', close: 'Close'
    },
    /* Single-language build; es mirrors en so the engine's fallback
       never lands on an empty object. */
    es: {
      one: 'item', many: 'items',
      add: 'Add', less: 'Remove one', drop: 'Remove',
      open: 'See my order', total: 'Total', clear: 'Clear all',
      note: 'Show this screen when you get to the counter.',
      myOrder: 'My order', order: 'Order', newOrder: 'New order',
      show: 'Show at the counter', back: 'Back to menu',
      forCart: 'For the counter',
      flavor: 'Milk', size: 'Size', extras: 'Requests',
      addToOrder: 'Add to my order', close: 'Close'
    }
  }
};

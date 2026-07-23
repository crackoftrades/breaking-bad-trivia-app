import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

/** Periodic-table style tile, the show's signature motif. */
export default function ElementTile({ symbol, name, number, size = 64, tint = colors.green, style }) {
  const scale = size / 64;
  return (
    <View
      style={[
        styles.tile,
        { width: size, height: size, borderRadius: radius.sm * scale, backgroundColor: tint },
        style,
      ]}
    >
      {number != null && (
        <Text style={[styles.number, { fontSize: 10 * scale }]}>{number}</Text>
      )}
      <Text style={[styles.symbol, { fontSize: 30 * scale }]}>{symbol}</Text>
      {!!name && (
        <Text numberOfLines={1} style={[styles.name, { fontSize: 8 * scale }]}>
          {name}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  number: {
    position: 'absolute',
    top: 4,
    left: 5,
    color: colors.white,
    opacity: 0.85,
    fontWeight: '600',
  },
  symbol: {
    color: colors.white,
    fontWeight: '800',
    lineHeight: undefined,
  },
  name: {
    color: colors.white,
    opacity: 0.85,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

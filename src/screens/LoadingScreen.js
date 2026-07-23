import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import ElementTile from '../components/ElementTile';
import { colors, spacing } from '../theme';

export default function LoadingScreen({ status, onRetry }) {
  const isError = status === 'error';

  return (
    <View style={styles.wrap}>
      <View style={styles.logoRow}>
        <ElementTile symbol="Br" size={70} tint={colors.greenDeep} />
        <ElementTile symbol="Ba" size={70} tint={colors.green} />
      </View>

      {isError ? (
        <>
          <Text style={styles.title}>Signal lost</Text>
          <Text style={styles.body}>
            Couldn't reach the trivia server, and there's no saved batch to fall back on.
            Check your connection and try again.
          </Text>
          <Button title="Retry" onPress={onRetry} style={styles.retry} />
        </>
      ) : (
        <>
          <ActivityIndicator color={colors.acid} size="large" style={styles.spinner} />
          <Text style={styles.title}>Cooking up questions</Text>
          <Text style={styles.body}>Pulling fresh trivia from the lab…</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(4),
  },
  logoRow: { flexDirection: 'row', gap: 10, marginBottom: spacing(4) },
  spinner: { marginBottom: spacing(2) },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: spacing(1),
  },
  body: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: spacing(1),
  },
  retry: { alignSelf: 'stretch', marginTop: spacing(3) },
});

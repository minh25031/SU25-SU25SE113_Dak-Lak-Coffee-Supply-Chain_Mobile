import { useAuthStore } from '@/stores/authStore';
import { router, Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper'; // ✅ thêm dòng này
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    useAuthStore.getState().loadUser().finally(() => {
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready && !token) {
      setTimeout(() => {
        router.replace('/auth/login');
      }, 0);
    }
  }, [ready, token]);

  if (!ready) return null;

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <View style={styles.container}>
            <Slot />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
});

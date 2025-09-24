import React from 'react';
import {
  Modal,
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';

interface FullScreenLoaderProps {
  loading?: boolean;
  children?: React.ReactNode;
  backgroundColor?: string;
}

const FullScreenLoaderModal: React.FC<FullScreenLoaderProps> = ({
  loading = false,
  children,
  backgroundColor = 'rgba(0,0,0,0.5)',
}) => {
  return (
    <Modal
      transparent
      statusBarTranslucent
      animationType="fade"
      visible={loading}
      onRequestClose={() => {}}
    >
      <TouchableWithoutFeedback>
        <View style={[styles.container, { backgroundColor }]}>
          {children ? (
            children
          ) : (
            <>
              {loading ? <ActivityIndicator size="large" color="#fff" /> : null}
            </>
          )}
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FullScreenLoaderModal;

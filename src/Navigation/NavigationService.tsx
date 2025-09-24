// navigationService.ts
import { createNavigationContainerRef } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

export const navigationRef =
  createNavigationContainerRef<NavigationProp<any>>();

export function navigate(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params as any);
  }
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

export function reset(routeName: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: routeName, params }],
    });
  }
}

export function replace(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch({
      ...{
        type: 'REPLACE',
        payload: { name, params },
      },
    });
  }
}

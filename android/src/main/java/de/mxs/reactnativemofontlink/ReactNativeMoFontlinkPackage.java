package de.mxs.reactnativemofontlink;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.Collections;
import java.util.List;

import javax.annotation.Nonnull;

public final class ReactNativeMoFontlinkPackage implements ReactPackage {

    @Override
    public @Nonnull List<ViewManager> createViewManagers(@Nonnull ReactApplicationContext reactContext) {
        Log.i("XXX", "ReactNativeMoFontlinkPackage.createViewManagers");
        return Collections.emptyList();
    }

    @Override
    public @Nonnull List<NativeModule> createNativeModules(@Nonnull ReactApplicationContext reactContext) {
        Log.i("XXX", "ReactNativeMoFontlinkPackage.createNativeModules");
        return Collections.emptyList();
    }

}

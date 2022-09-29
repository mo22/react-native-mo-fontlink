package de.mxs.reactnativemofontlink;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.facebook.react.views.text.ReactFontManager;

import java.util.Collections;
import java.util.List;

import android.annotation.SuppressLint;
import android.graphics.Typeface;
import android.util.Log;

import androidx.annotation.FontRes;

import javax.annotation.Nonnull;

public final class ReactNativeMoFontLinkPackage implements ReactPackage {

    private void addFonts(@Nonnull ReactApplicationContext reactContext) {
        ReactFontManager fontManager = ReactFontManager.getInstance();
        @SuppressLint("ResourceType") @FontRes() int id = 123;
        Typeface typeface = reactContext.getResources().getFont(id);
        fontManager.addCustomFont("Test Font", typeface);
    }

    @Override
    public @Nonnull List<ViewManager> createViewManagers(@Nonnull ReactApplicationContext reactContext) {
        Log.i("XXX", "ReactNativeMoFontLinkPackage.createViewManagers");
        return Collections.emptyList();
    }

    @Override
    public @Nonnull List<NativeModule> createNativeModules(@Nonnull ReactApplicationContext reactContext) {
        Log.i("XXX", "ReactNativeMoFontLinkPackage.createNativeModules");
        return Collections.emptyList();
    }

}

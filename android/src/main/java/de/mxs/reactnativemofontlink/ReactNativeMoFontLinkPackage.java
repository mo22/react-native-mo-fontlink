package de.mxs.reactnativemofontlink;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.facebook.react.views.text.ReactFontManager;

import java.util.Collections;
import java.util.List;

import android.graphics.Typeface;

import androidx.annotation.ArrayRes;

import javax.annotation.Nonnull;

public final class ReactNativeMoFontLinkPackage implements ReactPackage {
    public void setupFonts(@Nonnull ReactApplicationContext reactContext) {
        @ArrayRes() int configID = reactContext.getResources().getIdentifier("fontlink", "array", reactContext.getPackageName());
        if (configID != 0) {
            ReactFontManager fontManager = ReactFontManager.getInstance();
            String[] config = reactContext.getResources().getStringArray(configID);
            for (int i=0; i<config.length; i+=2) {
                int id = reactContext.getResources().getIdentifier(config[i], "font", reactContext.getPackageName());
                String name = config[i+1];
                Typeface typeface = reactContext.getResources().getFont(id);
                fontManager.addCustomFont(name, typeface);
            }
        }
    }

    @Override
    public @Nonnull List<ViewManager> createViewManagers(@Nonnull ReactApplicationContext reactContext) {
        setupFonts(reactContext);
        return Collections.emptyList();
    }

    @Override
    public @Nonnull List<NativeModule> createNativeModules(@Nonnull ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

}

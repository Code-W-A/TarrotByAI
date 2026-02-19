package com.cristina.zurba.tarot

import android.view.WindowManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class SoftInputModeModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "SoftInputMode"

  @ReactMethod
  fun set(mode: String) {
    val activity = currentActivity ?: return
    val nextMode = when (mode) {
      "adjustPan" -> WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN
      "adjustNothing" -> WindowManager.LayoutParams.SOFT_INPUT_ADJUST_NOTHING
      else -> WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE
    }

    activity.runOnUiThread {
      activity.window?.setSoftInputMode(nextMode)
    }
  }
}

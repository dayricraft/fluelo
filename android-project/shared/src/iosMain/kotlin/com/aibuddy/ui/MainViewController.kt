package com.aibuddy.ui

import androidx.compose.ui.window.ComposeUIViewController
import platform.UIKit.UIViewController

fun MainViewController(): UIViewController = ComposeUIViewController {
    FlueloAppRoot()
}

class FlueloViewControllerProvider {
    fun createViewController(): UIViewController = ComposeUIViewController {
        FlueloAppRoot()
    }
}

Add-Type -AssemblyName System.Drawing

function Generate-Icon($size, $outPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.Color]::White)

    $scale = [double]$size / 240.0
    $cx = [float]($size / 2.0)
    $cy = [float]($size / 2.0)

    # Circle 1: #B899FF (r = 92)
    $r1 = [float](92.0 * $scale)
    $c1 = [System.Drawing.ColorTranslator]::FromHtml("#B899FF")
    $b1 = New-Object System.Drawing.SolidBrush($c1)
    $g.FillEllipse($b1, $cx - $r1, $cy - $r1, $r1 * 2, $r1 * 2)

    # Circle 2: #8F5BFF (r = 68)
    $r2 = [float](68.0 * $scale)
    $c2 = [System.Drawing.ColorTranslator]::FromHtml("#8F5BFF")
    $b2 = New-Object System.Drawing.SolidBrush($c2)
    $g.FillEllipse($b2, $cx - $r2, $cy - $r2, $r2 * 2, $r2 * 2)

    # Circle 3: #F5F0FF (r = 51)
    $r3 = [float](51.0 * $scale)
    $c3 = [System.Drawing.ColorTranslator]::FromHtml("#F5F0FF")
    $b3 = New-Object System.Drawing.SolidBrush($c3)
    $g.FillEllipse($b3, $cx - $r3, $cy - $r3, $r3 * 2, $r3 * 2)

    $dir = Split-Path $outPath
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created $outPath"
}

Generate-Icon 192 "public/icons/icon-192.png"
Generate-Icon 512 "public/icons/icon-512.png"
Generate-Icon 512 "public/icons/icon-maskable-512.png"

# 1c-push-agent.ps1
# Путь A живой интеграции с 1С — см. docs/INTEGRATION_1C_GUIDE.md, раздел "Путь A".
#
# ЧТО ДЕЛАЕТ: смотрит на файл, который регламентное задание 1С уже выгружает
# на диск кассового компьютера (тот же формат CSV, что сейчас загружается
# руками в /admin/import), и если файл изменился с прошлого запуска — отправляет
# его на сайт через POST /api/integration/1c-push. Если файл не менялся — ничего
# не делает. Запускается по расписанию через Windows Task Scheduler (встроенный
# инструмент Windows, отдельно ставить не нужно).
#
# ПРЕДУСЛОВИЕ: этот скрипт работает ТОЛЬКО если у кассового компьютера есть
# хоть какой-то выход в интернет (см. docs/INTEGRATION_1C_GUIDE.md). Если его
# нет — скрипт будет просто падать с ошибкой сети при каждом запуске, и это
# ожидаемо: установка этого скрипта не создаёт интернет, который физически
# отсутствует.
#
# НАСТРОЙКА — см. docs/INTEGRATION_1C_GUIDE.md, раздел "Путь A, шаг за шагом".

param(
    [string]$ExportFilePath = "C:\Выгрузки для сайта\tovary.csv",
    [string]$ApiUrl = "https://tehnik.5-42-116-170.sslip.io/api/integration/1c-push",
    [string]$TokenFilePath = "C:\Выгрузки для сайта\tehnik-push-token.txt",
    [string]$LogFilePath = "C:\Выгрузки для сайта\1c-push-agent.log"
)

$ErrorActionPreference = "Stop"

function Write-Log {
    param([string]$Message)
    $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $Message"
    Add-Content -Path $LogFilePath -Value $line -Encoding UTF8
}

try {
    if (-not (Test-Path $ExportFilePath)) {
        Write-Log "Файл выгрузки не найден: $ExportFilePath — похоже, регламентное задание 1С ещё не настроено или не отработало. Пропуск до следующего запуска."
        exit 0
    }
    if (-not (Test-Path $TokenFilePath)) {
        Write-Log "ОШИБКА: файл с токеном не найден: $TokenFilePath — агент не настроен, см. docs/INTEGRATION_1C_GUIDE.md"
        exit 1
    }

    $token = (Get-Content -Path $TokenFilePath -Raw).Trim()
    if (-not $token) {
        Write-Log "ОШИБКА: файл токена пуст: $TokenFilePath"
        exit 1
    }

    $fileTime = (Get-Item $ExportFilePath).LastWriteTimeUtc
    $stampFile = "$ExportFilePath.sent"
    if ((Test-Path $stampFile) -and ([datetime](Get-Content $stampFile) -ge $fileTime)) {
        Write-Log "Файл не менялся с прошлой успешной отправки — пропуск."
        exit 0
    }

    $csvBytes = [System.IO.File]::ReadAllBytes($ExportFilePath)
    $headers = @{
        "Authorization" = "Bearer $token"
        "X-Filename"    = (Split-Path $ExportFilePath -Leaf)
        "Content-Type"  = "text/csv; charset=utf-8"
    }

    $response = Invoke-RestMethod -Uri $ApiUrl -Method Post -Headers $headers -Body $csvBytes -TimeoutSec 60

    Write-Log ("Отправлено успешно: статус={0} всего={1} создано={2} обновлено={3} без изменений={4} ошибок={5}" -f `
        $response.status, $response.rowsTotal, $response.rowsCreated, $response.rowsUpdated, $response.rowsSkipped, $response.rowsErrored)

    Set-Content -Path $stampFile -Value $fileTime.ToString("o")
} catch {
    Write-Log "ОШИБКА: $($_.Exception.Message)"
    exit 1
}

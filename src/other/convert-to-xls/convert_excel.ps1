# convert_excel.ps1

# Lấy ngày hôm nay để làm tên mặc định
$today = Get-Date -Format "dd-MM-yyyy"

# Hỏi người dùng tên folder nguồn
$srcFolderInput = Read-Host "Nhập tên folder nguồn nếu khác giá trị mặc định (mặc định khi nhấn enter: $today)"
if ([string]::IsNullOrWhiteSpace($srcFolderInput)) {
    $srcFolderInput = $today
}

# Xác định thư mục nguồn và đích dựa trên thư mục chứa script
$src = Join-Path $PSScriptRoot $srcFolderInput
$dst = Join-Path $PSScriptRoot ("$srcFolderInput-Converted")

# Kiểm tra thư mục nguồn có tồn tại không
if (-not (Test-Path $src)) {
    Write-Host "Thư mục nguồn $src không tồn tại!"
    Pause
    exit
}

# Tạo thư mục đích nếu chưa có
if (-not (Test-Path $dst)) {
    New-Item -ItemType Directory -Path $dst | Out-Null
}

# Tạo Excel COM
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

# Duyệt tất cả file xlsx trong thư mục nguồn
Get-ChildItem -Path $src -Filter *.xlsx | ForEach-Object {
    Write-Host "Converting $($_.Name)..."
    $wb = $excel.Workbooks.Open($_.FullName)
    $newName = Join-Path $dst ($_.BaseName + ".xls")
    $wb.SaveAs($newName, 56)
    $wb.Close($false)
}

$excel.Quit()
Write-Host "Done!"
Pause

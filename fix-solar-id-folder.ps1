# PowerShell Script to Restore and Fix Permissions for ESSEC/app/solar/[id] Folder
# This script handles square brackets in folder names correctly

# Set error action preference
$ErrorActionPreference = "Continue"

# Get the script directory and project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Try to find the ESSEC folder
if (Test-Path (Join-Path $ScriptDir "ESSEC")) {
    $ProjectRoot = $ScriptDir
    $EssecRoot = Join-Path $ScriptDir "ESSEC"
} elseif (Test-Path (Join-Path (Split-Path -Parent $ScriptDir) "ESSEC")) {
    $ProjectRoot = Split-Path -Parent $ScriptDir
    $EssecRoot = Join-Path $ProjectRoot "ESSEC"
} else {
    $EssecRoot = $ScriptDir
    $ProjectRoot = Split-Path -Parent $EssecRoot
}

$TargetFolder = Join-Path $EssecRoot "app\solar\`[id`]"
$GitBranch = "div"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Restoring and Fixing Permissions for [id] Folder" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if we're in a Git repository
Write-Host "[Step 1] Checking Git repository..." -ForegroundColor Yellow
$gitRoot = $null
try {
    Push-Location $ProjectRoot
    $gitRoot = git rev-parse --show-toplevel 2>$null
    if (-not $gitRoot) {
        Push-Location $EssecRoot
        $gitRoot = git rev-parse --show-toplevel 2>$null
    }
    if (-not $gitRoot) {
        throw "Not a Git repository"
    }
    Write-Host "Git repository found at: $gitRoot" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}

$GitWorkingDir = $gitRoot

# Step 2: Check if branch 'div' exists
Write-Host ""
Write-Host "[Step 2] Checking if branch '$GitBranch' exists..." -ForegroundColor Yellow
try {
    Push-Location $GitWorkingDir
    $branchList = git branch -a 2>$null
    $branchFound = $branchList | Select-String -Pattern "div"
    if (-not $branchFound) {
        $refCheck = git show-ref --verify --quiet "refs/heads/$GitBranch" 2>$null
        if ($LASTEXITCODE -ne 0) {
            $refCheck = git show-ref --verify --quiet "refs/remotes/origin/$GitBranch" 2>$null
            if ($LASTEXITCODE -ne 0) {
                Write-Host "Warning: Branch '$GitBranch' not found. Using current branch." -ForegroundColor Yellow
                $GitBranch = "HEAD"
            } else {
                Write-Host "Branch '$GitBranch' found (remote)" -ForegroundColor Green
            }
        } else {
            Write-Host "Branch '$GitBranch' found" -ForegroundColor Green
        }
    } else {
        Write-Host "Branch '$GitBranch' found" -ForegroundColor Green
    }
} catch {
    Write-Host "Warning: Could not check branches. Using current branch." -ForegroundColor Yellow
    $GitBranch = "HEAD"
} finally {
    Pop-Location
}

# Step 3: Check if folder exists on disk
Write-Host ""
Write-Host "[Step 3] Checking if folder exists on disk..." -ForegroundColor Yellow
$folderExists = Test-Path -LiteralPath $TargetFolder
if ($folderExists) {
    Write-Host "Folder exists: $TargetFolder" -ForegroundColor Green
} else {
    Write-Host "Folder does not exist: $TargetFolder" -ForegroundColor Yellow
    Write-Host "Will restore from Git..." -ForegroundColor Yellow
}

# Step 4: Restore folder from Git if needed
Write-Host ""
Write-Host "[Step 4] Restoring folder from Git branch '$GitBranch'..." -ForegroundColor Yellow
try {
    Push-Location $GitWorkingDir
    
    # Calculate relative path from Git root
    $relativePath = $TargetFolder.Replace($GitWorkingDir, "").TrimStart('\', '/')
    $relativePath = $relativePath -replace '\\', '/'
    
    # Remove leading ESSEC/ if Git root is at project level
    if ($relativePath -like "ESSEC/*") {
        $gitPath = $relativePath
    } else {
        $gitPath = $relativePath
    }
    
    # Ensure we use the correct relative path format for Git
    if ($gitPath -notmatch '^ESSEC/') {
        # If Git root is ESSEC folder, path should be app/solar/[id]
        if ($GitWorkingDir -eq $EssecRoot) {
            $gitPath = "app/solar/[id]"
        } else {
            # If Git root is project root, path should be ESSEC/app/solar/[id]
            $gitPath = "ESSEC/app/solar/[id]"
        }
    }
    
    Write-Host "Git working directory: $GitWorkingDir" -ForegroundColor Gray
    Write-Host "Restoring path: $gitPath" -ForegroundColor Gray
    
    $gitFiles = git ls-tree -r --name-only $GitBranch 2>$null
    $gitCheck = $gitFiles | Select-String -Pattern ([regex]::Escape($gitPath))
    
    if ($gitCheck) {
        $restoreResult = git checkout $GitBranch -- "$gitPath" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Successfully restored folder from Git" -ForegroundColor Green
        } else {
            Write-Host "Trying alternative restore method..." -ForegroundColor Gray
            $restoreResult2 = git restore --source=$GitBranch -- "$gitPath" 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Successfully restored folder from Git (alternative method)" -ForegroundColor Green
            } else {
                Write-Host "Warning: Git restore failed. Creating folder structure..." -ForegroundColor Yellow
                if (-not (Test-Path -LiteralPath $TargetFolder)) {
                    New-Item -ItemType Directory -Path $TargetFolder -Force | Out-Null
                    Write-Host "Created folder: $TargetFolder" -ForegroundColor Green
                }
            }
        }
    } else {
        Write-Host "Path not found in Git branch '$GitBranch'. Creating folder structure..." -ForegroundColor Yellow
        if (-not (Test-Path -LiteralPath $TargetFolder)) {
            New-Item -ItemType Directory -Path $TargetFolder -Force | Out-Null
            Write-Host "Created folder: $TargetFolder" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "Error restoring from Git: $_" -ForegroundColor Red
    Write-Host "Attempting to create folder if it doesn't exist..." -ForegroundColor Yellow
    if (-not (Test-Path -LiteralPath $TargetFolder)) {
        try {
            New-Item -ItemType Directory -Path $TargetFolder -Force | Out-Null
            Write-Host "Created folder: $TargetFolder" -ForegroundColor Green
        } catch {
            Write-Host "Failed to create folder: $_" -ForegroundColor Red
            exit 1
        }
    }
} finally {
    Pop-Location
}

# Verify folder exists after restore
if (-not (Test-Path -LiteralPath $TargetFolder)) {
    Write-Host ""
    Write-Host "Error: Folder still does not exist after restore attempt" -ForegroundColor Red
    exit 1
}

# Step 5: Fix ownership using takeown
Write-Host ""
Write-Host "[Step 5] Fixing ownership with takeown..." -ForegroundColor Yellow
try {
    $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    Write-Host "Current user: $currentUser" -ForegroundColor Gray
    Write-Host "Taking ownership of folder and all contents..." -ForegroundColor Gray
    
    $takeownCmd = "takeown /F `"$TargetFolder`" /R /D Y"
    $takeownResult = cmd /c $takeownCmd 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully took ownership" -ForegroundColor Green
    } else {
        Write-Host "Warning: takeown returned exit code $LASTEXITCODE" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Warning: Error running takeown: $_" -ForegroundColor Yellow
    Write-Host "Continuing with permission fix..." -ForegroundColor Gray
}

# Step 6: Fix permissions using icacls
Write-Host ""
Write-Host "[Step 6] Fixing permissions with icacls..." -ForegroundColor Yellow
try {
    $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    Write-Host "Granting full control to: $currentUser" -ForegroundColor Gray
    
    $icaclsCmd = "icacls `"$TargetFolder`" /grant `"${currentUser}:(OI)(CI)F`" /T"
    $icaclsResult = cmd /c $icaclsCmd 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully granted full control permissions" -ForegroundColor Green
    } else {
        Write-Host "Warning: icacls returned exit code $LASTEXITCODE" -ForegroundColor Yellow
        $userOnly = $currentUser.Split('\')[-1]
        Write-Host "Trying with username only: $userOnly" -ForegroundColor Gray
        $icaclsCmd2 = "icacls `"$TargetFolder`" /grant `"${userOnly}:(OI)(CI)F`" /T"
        $icaclsResult2 = cmd /c $icaclsCmd2 2>&1
    }
} catch {
    Write-Host "Error running icacls: $_" -ForegroundColor Red
    exit 1
}

# Step 7: Verify permissions
Write-Host ""
Write-Host "[Step 7] Verifying folder and file access..." -ForegroundColor Yellow
try {
    $files = Get-ChildItem -LiteralPath $TargetFolder -Recurse -ErrorAction Stop
    Write-Host "Successfully accessed folder. Found $($files.Count) items" -ForegroundColor Green
    
    $testFile = Get-ChildItem -LiteralPath $TargetFolder -File | Select-Object -First 1
    if ($testFile) {
        $content = Get-Content -LiteralPath $testFile.FullName -ErrorAction Stop
        Write-Host "Successfully read test file: $($testFile.Name)" -ForegroundColor Green
    }
    
    $testWritePath = Join-Path $TargetFolder ".permission-test"
    try {
        "test" | Out-File -LiteralPath $testWritePath -ErrorAction Stop
        Remove-Item -LiteralPath $testWritePath -ErrorAction Stop
        Write-Host "Successfully wrote and deleted test file" -ForegroundColor Green
    } catch {
        Write-Host "Warning: Write test failed: $_" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error verifying access: $_" -ForegroundColor Red
    Write-Host "Permissions may not be fully fixed. You may need to run this script as Administrator." -ForegroundColor Yellow
}

# Step 8: Summary
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Folder path: $TargetFolder" -ForegroundColor White

if (Test-Path -LiteralPath $TargetFolder) {
    Write-Host "Folder exists: Yes" -ForegroundColor White
    $fileCount = (Get-ChildItem -LiteralPath $TargetFolder -Recurse -File -ErrorAction SilentlyContinue).Count
    Write-Host "Files in folder: $fileCount" -ForegroundColor White
} else {
    Write-Host "Folder exists: No" -ForegroundColor White
}

Write-Host ""
Write-Host "Script completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Verify that Next.js can access the files" -ForegroundColor White
Write-Host "  2. If you still see 500 errors, try:" -ForegroundColor White
Write-Host "     - Running this script as Administrator" -ForegroundColor Gray
Write-Host "     - Restarting your Next.js development server" -ForegroundColor Gray
Write-Host "     - Checking Windows Defender or antivirus exclusions" -ForegroundColor Gray
Write-Host ""

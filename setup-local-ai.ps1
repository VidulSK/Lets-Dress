Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "    Lets-Dress: Local AI GPU Backend Setup Script      " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "WARNING: This script will download >15GB of AI model weights." -ForegroundColor Yellow
Write-Host "REQUIREMENTS:" -ForegroundColor Yellow
Write-Host " - NVIDIA GPU with 12GB+ VRAM"
Write-Host " - Python 3.10+"
Write-Host " - Git"
Write-Host ""

$Confirm = Read-Host "Do you want to proceed? (Y/N)"
if ($Confirm -notmatch "^[Yy]$") {
    Write-Host "Setup aborted."
    exit
}

Write-Host "`n[1/3] Cloning IDM-VTON Repository..." -ForegroundColor Green
if (-Not (Test-Path "local-ai-engine")) {
    git clone https://github.com/yisol/IDM-VTON.git local-ai-engine
} else {
    Write-Host "Directory 'local-ai-engine' already exists. Skipping clone."
}

cd local-ai-engine

Write-Host "`n[2/3] Creating Python Virtual Environment..." -ForegroundColor Green
if (-Not (Test-Path "venv")) {
    python -m venv venv
}

Write-Host "`n[3/3] Installing PyTorch with CUDA and Dependencies..." -ForegroundColor Green
# Ensure execution policy allows venv activation
Set-ExecutionPolicy Unrestricted -Scope Process -Force
.\venv\Scripts\Activate.ps1

# Install PyTorch with CUDA 12.1 support first for native GPU acceleration
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "To start your Local AI Server:"
Write-Host "1. Open a new terminal"
Write-Host "2. cd local-ai-engine"
Write-Host "3. .\venv\Scripts\Activate.ps1"
Write-Host "4. python app.py"
Write-Host "=======================================================" -ForegroundColor Cyan

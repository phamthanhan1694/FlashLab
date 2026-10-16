#!/usr/bin/env bash
# FlashLab launcher for Linux / WSL Ubuntu
set -euo pipefail

DEFAULT_PROJECT_DIR="$HOME/projects/FlashLab_HTML"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
HAS_OVERRIDE=false

# Priority: command-line argument > environment variable > path file > script directory.
if [[ -f "$SCRIPT_DIR/start-flashcard-path.txt" ]]; then
    IFS= read -r PROJECT_DIR < "$SCRIPT_DIR/start-flashcard-path.txt" || true
    PROJECT_DIR="${PROJECT_DIR%$'\r'}"
    HAS_OVERRIDE=true
fi

if [[ -n "${FLASHLAB_PROJECT_DIR:-}" ]]; then
    PROJECT_DIR="$FLASHLAB_PROJECT_DIR"
    HAS_OVERRIDE=true
fi

if [[ -n "${1:-}" ]]; then
    PROJECT_DIR="$1"
    HAS_OVERRIDE=true
fi

if [[ ! -f "$PROJECT_DIR/package.json" && "$HAS_OVERRIDE" == false ]]; then
    PROJECT_DIR="$DEFAULT_PROJECT_DIR"
fi

if [[ ! -f "$PROJECT_DIR/package.json" ]]; then
    echo "Khong tim thay package.json tai: $PROJECT_DIR"
    read -r -p "Nhap duong dan project FlashLab: " PROJECT_DIR || {
        echo "Khong the nhap duong dan project."
        exit 1
    }
    if [[ ! -f "$PROJECT_DIR/package.json" ]]; then
        echo "Duong dan khong hop le."
        exit 1
    fi
fi

cd "$PROJECT_DIR"
echo "FlashLab project: $PWD"

# WSL can automatically add Windows folders to PATH. Do not use Windows npm/node.
if [[ -r /proc/sys/kernel/osrelease ]] && grep -qiE 'microsoft|wsl' /proc/sys/kernel/osrelease; then
    IFS=':' read -r -a PATH_PARTS <<< "$PATH"
    LINUX_PATH_PARTS=()
    for part in "${PATH_PARTS[@]}"; do
        if [[ "$part" != /mnt/* ]]; then
            LINUX_PATH_PARTS+=("$part")
        fi
    done
    PATH="$(IFS=:; printf '%s' "${LINUX_PATH_PARTS[*]}")"
    export PATH
    hash -r
fi

# Prefer the Linux runtime installed for FlashLab, including in fresh terminals.
FLASHLAB_RUNTIME_ROOT="${XDG_DATA_HOME:-$HOME/.local/share}/flashlab"
for runtime in "$FLASHLAB_RUNTIME_ROOT"/node-v24.21.0-linux-*/bin; do
    if [[ -x "$runtime/node" && -x "$runtime/npm" ]] &&
        "$runtime/node" -e 'const [major, minor] = process.versions.node.split(".").map(Number); process.exit(major === 24 && minor >= 21 ? 0 : 1)' 2>/dev/null; then
        PATH="$runtime:$PATH"
        export PATH
        hash -r
        break
    fi
done

# If NVM is installed, load it for non-interactive scripts.
NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then
    export NVM_DIR
    # NVM may reference variables that are unset; temporarily disable nounset.
    set +u
    # shellcheck source=/dev/null
    . "$NVM_DIR/nvm.sh" --no-use

    if [[ -f .nvmrc ]]; then
        if ! nvm use --silent >/dev/null 2>&1; then
            echo "Node.js duoc khai bao trong .nvmrc chua duoc cai."
            echo "Chay: nvm install"
            exit 1
        fi
    elif [[ "$(nvm version default 2>/dev/null)" != "N/A" ]]; then
        nvm use --silent default >/dev/null 2>&1 || true
    fi
    set -u
fi

if ! command -v node >/dev/null 2>&1; then
    echo "Khong tim thay Node.js trong Linux/WSL."
    echo "Hay cai Node.js LTS bang NVM (kem npm)."
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "Khong tim thay npm trong Linux/WSL."
    echo "Hay cai Node.js LTS bang NVM (kem npm), hoac cai npm cho Node.js hien tai."
    exit 1
fi

NODE_PATH="$(command -v node)"
NPM_PATH="$(command -v npm)"
if [[ "$NODE_PATH" == /mnt/* || "$NPM_PATH" == /mnt/* ]]; then
    echo "Phat hien Node.js/npm cua Windows. Hay cai va dung ban trong WSL."
    echo "node: $NODE_PATH"
    echo "npm:  $NPM_PATH"
    exit 1
fi

if ! NODE_VERSION="$(node --version)"; then
    echo "Node.js da duoc tim thay nhung khong chay duoc: $NODE_PATH"
    exit 1
fi
if ! NPM_VERSION="$(npm --version)"; then
    echo "npm da duoc tim thay nhung khong chay duoc: $NPM_PATH"
    exit 1
fi

echo "Node.js: $NODE_VERSION ($NODE_PATH)"
echo "npm:     $NPM_VERSION ($NPM_PATH)"

# Check before npm runs scripts that require modern Node.js flags and APIs.
if ! node -e 'const [major, minor] = process.versions.node.split(".").map(Number); process.exit(major > 22 || (major === 24 && minor >= 21) ? 0 : 1)'; then
    echo "FlashLab can Node.js >= 22.14.0; ban dang dung $NODE_VERSION."
    echo "Neu da cai NVM, chay trong thu muc project: nvm install && nvm use"
    echo "Sau do chay lai: ./start-flashcard.sh"
    exit 1
fi

# First run: install the dependencies required by the project.
if [[ ! -d node_modules ]]; then
    echo "Chua co node_modules. Dang cai dependencies..."
    if [[ -f package-lock.json ]]; then
        npm ci
    else
        npm install
    fi
fi

exec npm run dev -- --open

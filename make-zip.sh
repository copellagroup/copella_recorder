#!/usr/bin/env bash
set -euo pipefail

# Package the Copella Recorder plugin with files at the archive root
cd "$(dirname "$0")"

zip -r -9 copella-recorder-plugin.zip \
  assets \
  templates \
  copella-recorder.php \
  README.md

echo "Created copella-recorder-plugin.zip"


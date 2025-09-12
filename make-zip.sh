#!/usr/bin/env bash
set -euo pipefail

# Package the Copella Recorder plugin with files at the archive root
cd "$(dirname "$0")"

rm -f copella-recorder-plugin.zip custom-sidebar-plugin.zip

zip -r -9 copella-recorder-plugin.zip \
  assets \
  templates \
  copella-recorder.php \
  README.md

echo "Created copella-recorder-plugin.zip"

# Package the Custom Sidebar plugin with files at archive root (no parent folder)
zip -j -9 custom-sidebar-plugin.zip \
  custom-sidebar-plugin/header-template.php \
  custom-sidebar-plugin/header.css \
  custom-sidebar-plugin/header.js \
  custom-sidebar-plugin/new-sidebar.php \
  custom-sidebar-plugin/sidebar-template.php \
  custom-sidebar-plugin/sidebar.css \
  custom-sidebar-plugin/sidebar.js \
  custom-sidebar-plugin/README.md

echo "Created custom-sidebar-plugin.zip"


#!/usr/bin/env bash

# install node version manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# install latest version of node
nvm install node
# set the version of node to use to the latest
nvm use node

# install pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -

export PNPM_HOME="/home/NETID/nwiborg/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"


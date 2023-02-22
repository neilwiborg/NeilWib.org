# setup environment variables for nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# setup environment variables for pnpm
export PNPM_HOME="/home/NETID/nwiborg/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

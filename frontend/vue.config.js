module.exports = {
  devServer: {
    watchOptions: {
      ignored: ['C:/DumpStack.log.tmp', 'C:/'], // Ignore specific files and directories to avoid unnecessary rebuilds
    },
  },
};

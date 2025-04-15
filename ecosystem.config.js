module.exports = {
  apps: [
    {
      name: 'protekcms',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3004,
      },
    },
  ],
};

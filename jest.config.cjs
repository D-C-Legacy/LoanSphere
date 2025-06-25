/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  reporters: [
    "default",
    ["jest-html-reporter", { outputPath: "reports/summary.html" }],
    ["jest-junit", { outputDirectory: "reports", outputName: "junit.xml" }],
  ],
};
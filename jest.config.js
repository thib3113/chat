// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html
const path = require('path');

//TODO
module.exports = {
    projects: ['<rootDir>/client/jest.config.js', '<rootDir>/server/jest.config.js'], // Use this configuration option to add custom reporters to Jest
    reporters: [
        'default',
        [
            'jest-sonar',
            {
                outputDirectory: path.join(__dirname, 'coverage'),
                outputName: 'test-report.xml',
                reportedFilePath: 'absolute'
            }
        ]
    ]
};

module.exports = {
    extensionsToTreatAsEsm: [".ts"],
    preset: 'ts-jest/presets/default-esm',
    preset: '@shelf/jest-mongodb',
    transform: {
        '^.+\\.(ts|tsx)?$': [
            'ts-jest',{
                config: "<rootDir>/tsconfig.test.json",
                useESM: true
            }
        ],
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    setupFilesAfterEnv: ['@testing-library/jest-dom'],
    verbose: true,
    moduleNameMapper: {
        "@routes": "<rootDir>/build/api/routes",
        "@spec": "<rootDir>/build/api/swagger.json",
        "@state": "<rootDir>/src/state/global",
    }
};
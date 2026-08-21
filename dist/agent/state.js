// Reducers define how state updates are applied.
export const leadQualifierStateChannels = {
    messages: {
        value: (x, y) => x.concat(y),
        default: () => [],
    },
    extractedInfo: {
        value: (x, y) => ({ ...x, ...y }),
        default: () => ({}),
    },
    qualificationStatus: {
        value: (x, y) => y,
        default: () => 'pending',
    },
    confidenceScore: {
        value: (x, y) => y,
        default: () => 1.0,
    },
    error: {
        value: (x, y) => y,
        default: () => undefined,
    },
};

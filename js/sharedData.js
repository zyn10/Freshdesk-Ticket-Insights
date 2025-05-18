let parsedData = [];

export const sharedData = {
  set: (data) => (parsedData = data),
  get: () => parsedData,
};

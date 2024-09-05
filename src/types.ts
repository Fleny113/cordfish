export type ObjectValues<T extends Record<PropertyKey, unknown>> = T[keyof T];

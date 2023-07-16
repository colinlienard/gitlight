export type ObjectEntries<T extends object> = Array<[keyof T, T[keyof T]]>;

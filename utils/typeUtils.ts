export type InferReturn<T extends (...args: any) => any> = Exclude<Awaited<ReturnType<T>>, undefined | null>;
export type InferReturnArray<T extends (...args: any) => any> = Exclude<Awaited<ReturnType<T>>, undefined | null>[0];

export {};

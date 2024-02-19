export type InferReturn<T extends (...args: any) => any> = Exclude<
	Awaited<ReturnType<T>>,
	undefined | null
>;
export type InferReturnArray<T extends (...args: any) => any> = Exclude<
	Awaited<ReturnType<T>>,
	undefined | null
>[0];

export type SecondGeneric<T> = T extends Record<any, infer U> ? U : never;
export type FistGeneric<T> = T extends Record<infer U, any> ? U : never;

export type RemoveNullFrom<T, K extends keyof T> = {
	[P in K]: Exclude<T[P], null>;
} & {
	[P in Exclude<keyof T, K>]: T[P];
};

export type RemoveNullFromAll<T> = {
	[P in keyof T]: Exclude<T[P], null>;
};

export {};
